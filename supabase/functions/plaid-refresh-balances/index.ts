import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { plaidClient } from '../_shared/plaid-client.ts'

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get auth token from request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create Supabase client with user's auth
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('Not authenticated')
    }

    // Parse request body
    const { householdId } = await req.json()
    if (!householdId) {
      throw new Error('householdId is required')
    }

    // Verify user has access to this household
    const { data: membership, error: memberError } = await supabaseClient
      .from('household_members')
      .select('role')
      .eq('household_id', householdId)
      .eq('user_id', user.id)
      .eq('status', 'accepted')
      .single()

    if (memberError || !membership) {
      throw new Error('No access to this household')
    }

    // Use service role to access plaid_items (contains access_token)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get all active Plaid items for this household
    const { data: plaidItems, error: itemsError } = await supabaseAdmin
      .from('plaid_items')
      .select('id, access_token, institution_name')
      .eq('household_id', householdId)
      .eq('status', 'active')

    if (itemsError) {
      throw new Error('Failed to fetch bank connections')
    }

    if (!plaidItems || plaidItems.length === 0) {
      return new Response(
        JSON.stringify({ success: true, accounts: [], message: 'No bank connections found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    const allUpdatedAccounts = []

    // Refresh balances for each Plaid item
    for (const item of plaidItems) {
      try {
        const accountsResponse = await plaidClient.accountsBalanceGet({
          access_token: item.access_token,
        })

        const now = new Date().toISOString()

        // Update each account's balance
        for (const account of accountsResponse.data.accounts) {
          const { error: updateError } = await supabaseAdmin
            .from('plaid_accounts')
            .update({
              current_balance: account.balances.current,
              available_balance: account.balances.available,
              balance_last_updated: now,
            })
            .eq('plaid_item_id', item.id)
            .eq('account_id', account.account_id)

          if (updateError) {
            console.error('Error updating account balance:', updateError)
          }

          allUpdatedAccounts.push({
            account_id: account.account_id,
            name: account.name,
            institution_name: item.institution_name,
            current_balance: account.balances.current,
            available_balance: account.balances.available,
            balance_last_updated: now,
          })
        }
      } catch (plaidError) {
        console.error('Plaid API error for item:', item.id, plaidError)

        // Check if item needs re-authentication
        if (plaidError.response?.data?.error_code === 'ITEM_LOGIN_REQUIRED') {
          await supabaseAdmin
            .from('plaid_items')
            .update({ status: 'needs_reauth' })
            .eq('id', item.id)
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        accounts: allUpdatedAccounts,
        updated_at: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error refreshing balances:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
