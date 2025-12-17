-- ===========================================
-- MORPHEUS HOUSEHOLD SHARING SCHEMA
-- Run this AFTER the initial supabase-schema.sql
-- ===========================================

-- 1. Create households table
CREATE TABLE IF NOT EXISTS public.households (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'My Household',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create household_members table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.household_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('owner', 'editor', 'viewer')),
  status TEXT NOT NULL DEFAULT 'accepted' CHECK (status IN ('pending', 'accepted')),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(household_id, user_id)
);

-- 3. Create household_invites table for pending invitations
CREATE TABLE IF NOT EXISTS public.household_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('editor', 'viewer')),
  invite_token UUID DEFAULT gen_random_uuid() NOT NULL,
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(household_id, email, status)
);

-- 4. Add household_id to financial_data table
ALTER TABLE public.financial_data 
ADD COLUMN IF NOT EXISTS household_id UUID REFERENCES public.households(id) ON DELETE CASCADE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_financial_data_household_id ON public.financial_data(household_id);
CREATE INDEX IF NOT EXISTS idx_household_members_user_id ON public.household_members(user_id);
CREATE INDEX IF NOT EXISTS idx_household_members_household_id ON public.household_members(household_id);
CREATE INDEX IF NOT EXISTS idx_household_invites_email ON public.household_invites(email);
CREATE INDEX IF NOT EXISTS idx_household_invites_token ON public.household_invites(invite_token);

-- Enable Row Level Security
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_invites ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- HELPER FUNCTION: Get user's household IDs
-- ===========================================
CREATE OR REPLACE FUNCTION public.get_user_household_ids()
RETURNS SETOF UUID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT household_id 
  FROM household_members 
  WHERE user_id = auth.uid() 
  AND status = 'accepted'
$$;

-- ===========================================
-- RLS POLICIES FOR HOUSEHOLDS
-- ===========================================

DROP POLICY IF EXISTS "Users can view their households" ON public.households;
CREATE POLICY "Users can view their households"
  ON public.households FOR SELECT
  TO authenticated
  USING (id IN (SELECT get_user_household_ids()));

DROP POLICY IF EXISTS "Users can create households" ON public.households;
CREATE POLICY "Users can create households"
  ON public.households FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Owners can update households" ON public.households;
CREATE POLICY "Owners can update households"
  ON public.households FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT household_id FROM household_members 
      WHERE user_id = auth.uid() 
      AND role = 'owner' 
      AND status = 'accepted'
    )
  );

DROP POLICY IF EXISTS "Owners can delete households" ON public.households;
CREATE POLICY "Owners can delete households"
  ON public.households FOR DELETE
  TO authenticated
  USING (
    id IN (
      SELECT household_id FROM household_members 
      WHERE user_id = auth.uid() 
      AND role = 'owner' 
      AND status = 'accepted'
    )
  );

-- ===========================================
-- RLS POLICIES FOR HOUSEHOLD_MEMBERS
-- ===========================================

DROP POLICY IF EXISTS "Members can view household members" ON public.household_members;
CREATE POLICY "Members can view household members"
  ON public.household_members FOR SELECT
  TO authenticated
  USING (household_id IN (SELECT get_user_household_ids()));

DROP POLICY IF EXISTS "Owners can add members" ON public.household_members;
CREATE POLICY "Owners can add members"
  ON public.household_members FOR INSERT
  TO authenticated
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM household_members 
      WHERE user_id = auth.uid() 
      AND role = 'owner' 
      AND status = 'accepted'
    )
    OR 
    user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Owners can update members" ON public.household_members;
CREATE POLICY "Owners can update members"
  ON public.household_members FOR UPDATE
  TO authenticated
  USING (
    household_id IN (
      SELECT household_id FROM household_members 
      WHERE user_id = auth.uid() 
      AND role = 'owner' 
      AND status = 'accepted'
    )
  );

DROP POLICY IF EXISTS "Owners can remove members or self" ON public.household_members;
CREATE POLICY "Owners can remove members or self"
  ON public.household_members FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    household_id IN (
      SELECT household_id FROM household_members 
      WHERE user_id = auth.uid() 
      AND role = 'owner' 
      AND status = 'accepted'
    )
  );

-- ===========================================
-- RLS POLICIES FOR HOUSEHOLD_INVITES
-- ===========================================

DROP POLICY IF EXISTS "Members can view invites for their households" ON public.household_invites;
CREATE POLICY "Members can view invites for their households"
  ON public.household_invites FOR SELECT
  TO authenticated
  USING (
    household_id IN (SELECT get_user_household_ids())
    OR
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Owners can create invites" ON public.household_invites;
CREATE POLICY "Owners can create invites"
  ON public.household_invites FOR INSERT
  TO authenticated
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM household_members 
      WHERE user_id = auth.uid() 
      AND role = 'owner' 
      AND status = 'accepted'
    )
  );

DROP POLICY IF EXISTS "Owners can update invites" ON public.household_invites;
CREATE POLICY "Owners can update invites"
  ON public.household_invites FOR UPDATE
  TO authenticated
  USING (
    household_id IN (
      SELECT household_id FROM household_members 
      WHERE user_id = auth.uid() 
      AND role = 'owner' 
      AND status = 'accepted'
    )
    OR
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Owners can delete invites" ON public.household_invites;
CREATE POLICY "Owners can delete invites"
  ON public.household_invites FOR DELETE
  TO authenticated
  USING (
    household_id IN (
      SELECT household_id FROM household_members 
      WHERE user_id = auth.uid() 
      AND role = 'owner' 
      AND status = 'accepted'
    )
  );

-- ===========================================
-- UPDATE FINANCIAL_DATA RLS POLICIES
-- ===========================================

DROP POLICY IF EXISTS "Users can view own financial data" ON public.financial_data;
DROP POLICY IF EXISTS "Users can insert own financial data" ON public.financial_data;
DROP POLICY IF EXISTS "Users can update own financial data" ON public.financial_data;
DROP POLICY IF EXISTS "Users can delete own financial data" ON public.financial_data;

CREATE POLICY "Members can view household financial data"
  ON public.financial_data FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    household_id IN (SELECT get_user_household_ids())
  );

CREATE POLICY "Members can insert household financial data"
  ON public.financial_data FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR
    (household_id IN (
      SELECT household_id FROM household_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'editor')
      AND status = 'accepted'
    ))
  );

CREATE POLICY "Members can update household financial data"
  ON public.financial_data FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    (household_id IN (
      SELECT household_id FROM household_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'editor')
      AND status = 'accepted'
    ))
  );

CREATE POLICY "Owners and editors can delete household financial data"
  ON public.financial_data FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    (household_id IN (
      SELECT household_id FROM household_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'editor')
      AND status = 'accepted'
    ))
  );

-- ===========================================
-- TRIGGERS FOR updated_at
-- ===========================================

CREATE TRIGGER set_updated_at_households
  BEFORE UPDATE ON public.households
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_household_members
  BEFORE UPDATE ON public.household_members
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ===========================================
-- MIGRATION: Create households for existing users
-- Run this once to migrate existing data
-- ===========================================

-- This creates a household for each user who has financial data
-- and assigns them as owner
DO $$
DECLARE
  rec RECORD;
  new_household_id UUID;
BEGIN
  FOR rec IN 
    SELECT DISTINCT fd.user_id, up.email 
    FROM public.financial_data fd
    LEFT JOIN public.user_profiles up ON fd.user_id = up.id
    WHERE fd.household_id IS NULL
  LOOP
    -- Create household for this user
    INSERT INTO public.households (name, created_by)
    VALUES (COALESCE(rec.email, 'My') || '''s Household', rec.user_id)
    RETURNING id INTO new_household_id;
    
    -- Add user as owner
    INSERT INTO public.household_members (household_id, user_id, role, status)
    VALUES (new_household_id, rec.user_id, 'owner', 'accepted');
    
    -- Update their financial data to use this household
    UPDATE public.financial_data 
    SET household_id = new_household_id 
    WHERE user_id = rec.user_id AND household_id IS NULL;
  END LOOP;
END $$;
