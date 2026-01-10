-- ===========================================
-- MORPHEUS: FIX UNIQUE CONSTRAINT ISSUE
-- Run this to allow multiple households to store data
-- ===========================================

-- The original schema has UNIQUE(user_id) on financial_data
-- This prevents multiple households from having data because
-- one user can only have one row.

-- Step 1: Backfill any rows that are missing household_id
-- This creates a household for users with financial data but no household
-- We migrate ALL rows, not just one per user
DO $$
DECLARE
  rec RECORD;
  new_household_id UUID;
BEGIN
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
END $$;

-- Step 2: Drop the UNIQUE(user_id) constraint
-- This allows one user to be part of multiple households
ALTER TABLE public.financial_data DROP CONSTRAINT IF EXISTS financial_data_user_id_key;

-- Step 3: Create a partial unique index for legacy rows (household_id IS NULL)
-- This prevents duplicate legacy rows for the same user
CREATE UNIQUE INDEX IF NOT EXISTS idx_financial_data_legacy_user 
ON public.financial_data (user_id) 
WHERE household_id IS NULL;

-- Step 4: Add unique constraint on household_id (if not exists)
-- This ensures each household has exactly one financial_data row
-- Note: This only applies to non-null household_id values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'financial_data_household_id_key'
  ) THEN
    -- Check for duplicates first
    IF (SELECT COUNT(*) FROM (
      SELECT household_id FROM public.financial_data 
      WHERE household_id IS NOT NULL 
      GROUP BY household_id 
      HAVING COUNT(*) > 1
    ) AS dupes) = 0 THEN
      ALTER TABLE public.financial_data 
      ADD CONSTRAINT financial_data_household_id_key UNIQUE (household_id);
    ELSE
      RAISE NOTICE 'Skipping household_id unique constraint - duplicates exist. Run deduplication first.';
    END IF;
  END IF;
END $$;

-- Verify the migration worked
SELECT 
  COUNT(*) as total_rows,
  COUNT(household_id) as rows_with_household,
  COUNT(*) - COUNT(household_id) as rows_without_household
FROM public.financial_data;
