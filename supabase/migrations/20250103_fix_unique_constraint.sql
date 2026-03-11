-- ===========================================
-- MORPHEUS: FIX UNIQUE CONSTRAINT ISSUE
-- Run this to fix the "new rules not saving" bug
-- ===========================================

-- The original schema has UNIQUE(user_id) on financial_data
-- This can cause conflicts when saving data.

-- First, check if household_id column exists (household schema installed)
DO $$
DECLARE
  has_household_column BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'financial_data' 
    AND column_name = 'household_id'
  ) INTO has_household_column;
  
  IF has_household_column THEN
    RAISE NOTICE 'Household schema detected. Running full migration...';
  ELSE
    RAISE NOTICE 'Household schema NOT installed. Running basic fix only...';
    RAISE NOTICE 'If you want household sharing, run supabase-household-schema.sql first.';
  END IF;
END $$;

-- Step 1: Drop the UNIQUE(user_id) constraint
-- This is the main fix - removes the constraint causing save failures
ALTER TABLE public.financial_data DROP CONSTRAINT IF EXISTS financial_data_user_id_key;

-- Step 2: If household tables exist, run the migration
DO $$
DECLARE
  has_household_column BOOLEAN;
  has_households_table BOOLEAN;
  rec RECORD;
  new_household_id UUID;
BEGIN
  -- Check if household_id column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'financial_data' 
    AND column_name = 'household_id'
  ) INTO has_household_column;
  
  -- Check if households table exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'households'
  ) INTO has_households_table;
  
  IF has_household_column AND has_households_table THEN
    -- Migrate legacy rows to households
    FOR rec IN 
      SELECT fd.user_id, fd.id as financial_data_id, up.email 
      FROM public.financial_data fd
      LEFT JOIN public.user_profiles up ON fd.user_id = up.id
      WHERE fd.household_id IS NULL
      ORDER BY fd.updated_at DESC
    LOOP
      -- Check if user already has a household
      SELECT hm.household_id INTO new_household_id
      FROM public.household_members hm
      WHERE hm.user_id = rec.user_id
      AND hm.status = 'accepted'
      LIMIT 1;
      
      IF new_household_id IS NULL THEN
        -- Create household for this user
        INSERT INTO public.households (name, created_by)
        VALUES (COALESCE(rec.email, 'My') || '''s Household', rec.user_id)
        RETURNING id INTO new_household_id;
        
        -- Add user as owner
        INSERT INTO public.household_members (household_id, user_id, role, status)
        VALUES (new_household_id, rec.user_id, 'owner', 'accepted');
      END IF;
      
      -- Update this financial data row to use the household
      UPDATE public.financial_data 
      SET household_id = new_household_id 
      WHERE id = rec.financial_data_id;
    END LOOP;
    
    -- Create partial unique index for legacy mode
    CREATE UNIQUE INDEX IF NOT EXISTS idx_financial_data_legacy_user 
    ON public.financial_data (user_id) 
    WHERE household_id IS NULL;
    
    -- Add unique constraint on household_id if no duplicates
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'financial_data_household_id_key'
    ) THEN
      IF (SELECT COUNT(*) FROM (
        SELECT household_id FROM public.financial_data 
        WHERE household_id IS NOT NULL 
        GROUP BY household_id 
        HAVING COUNT(*) > 1
      ) AS dupes) = 0 THEN
        ALTER TABLE public.financial_data 
        ADD CONSTRAINT financial_data_household_id_key UNIQUE (household_id);
      ELSE
        RAISE NOTICE 'Skipping household_id unique constraint - duplicates exist.';
      END IF;
    END IF;
    
    RAISE NOTICE 'Household migration complete!';
  END IF;
END $$;

-- Show results
SELECT 'Migration complete. Constraint dropped.' as status;
