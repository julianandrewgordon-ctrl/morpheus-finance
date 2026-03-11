-- ===========================================
-- PLAID INTEGRATION SCHEMA
-- Run this AFTER the household schema is set up
-- ===========================================

-- plaid_items: Connection to a financial institution
CREATE TABLE IF NOT EXISTS public.plaid_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
  access_token TEXT NOT NULL,
  item_id TEXT NOT NULL UNIQUE,
  institution_id TEXT,
  institution_name TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'needs_reauth', 'disconnected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- plaid_accounts: Bank accounts within an item
CREATE TABLE IF NOT EXISTS public.plaid_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plaid_item_id UUID REFERENCES public.plaid_items(id) ON DELETE CASCADE NOT NULL,
  household_id UUID REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
  account_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  subtype TEXT,
  mask TEXT,
  current_balance DECIMAL(15,2),
  available_balance DECIMAL(15,2),
  balance_last_updated TIMESTAMP WITH TIME ZONE,
  include_in_total BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(plaid_item_id, account_id)
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_plaid_items_household ON public.plaid_items(household_id);
CREATE INDEX IF NOT EXISTS idx_plaid_accounts_household ON public.plaid_accounts(household_id);
CREATE INDEX IF NOT EXISTS idx_plaid_accounts_item ON public.plaid_accounts(plaid_item_id);

-- Enable Row Level Security
ALTER TABLE public.plaid_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plaid_accounts ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- RLS POLICIES FOR PLAID_ITEMS
-- ===========================================

DROP POLICY IF EXISTS "plaid_items_select" ON public.plaid_items;
CREATE POLICY "plaid_items_select" ON public.plaid_items
  FOR SELECT TO authenticated
  USING (household_id IN (SELECT public.get_user_household_ids()));

DROP POLICY IF EXISTS "plaid_items_insert" ON public.plaid_items;
CREATE POLICY "plaid_items_insert" ON public.plaid_items
  FOR INSERT TO authenticated
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM public.household_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'editor')
      AND status = 'accepted'
    )
  );

DROP POLICY IF EXISTS "plaid_items_update" ON public.plaid_items;
CREATE POLICY "plaid_items_update" ON public.plaid_items
  FOR UPDATE TO authenticated
  USING (
    household_id IN (
      SELECT household_id FROM public.household_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'editor')
      AND status = 'accepted'
    )
  );

DROP POLICY IF EXISTS "plaid_items_delete" ON public.plaid_items;
CREATE POLICY "plaid_items_delete" ON public.plaid_items
  FOR DELETE TO authenticated
  USING (
    household_id IN (
      SELECT household_id FROM public.household_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'editor')
      AND status = 'accepted'
    )
  );

-- ===========================================
-- RLS POLICIES FOR PLAID_ACCOUNTS
-- ===========================================

DROP POLICY IF EXISTS "plaid_accounts_select" ON public.plaid_accounts;
CREATE POLICY "plaid_accounts_select" ON public.plaid_accounts
  FOR SELECT TO authenticated
  USING (household_id IN (SELECT public.get_user_household_ids()));

DROP POLICY IF EXISTS "plaid_accounts_insert" ON public.plaid_accounts;
CREATE POLICY "plaid_accounts_insert" ON public.plaid_accounts
  FOR INSERT TO authenticated
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM public.household_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'editor')
      AND status = 'accepted'
    )
  );

DROP POLICY IF EXISTS "plaid_accounts_update" ON public.plaid_accounts;
CREATE POLICY "plaid_accounts_update" ON public.plaid_accounts
  FOR UPDATE TO authenticated
  USING (
    household_id IN (
      SELECT household_id FROM public.household_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'editor')
      AND status = 'accepted'
    )
  );

DROP POLICY IF EXISTS "plaid_accounts_delete" ON public.plaid_accounts;
CREATE POLICY "plaid_accounts_delete" ON public.plaid_accounts
  FOR DELETE TO authenticated
  USING (
    household_id IN (
      SELECT household_id FROM public.household_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'editor')
      AND status = 'accepted'
    )
  );

-- ===========================================
-- TRIGGERS FOR updated_at
-- ===========================================

DROP TRIGGER IF EXISTS set_updated_at_plaid_items ON public.plaid_items;
CREATE TRIGGER set_updated_at_plaid_items
  BEFORE UPDATE ON public.plaid_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
