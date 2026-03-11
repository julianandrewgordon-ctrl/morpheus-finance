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
    const { publicToken, householdId, metadata } = await req.json()
    if (!publicToken || !householdId) {
      throw new Error('publicToken and householdId are required')
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

    if (!['owner', 'editor'].includes(membership.role)) {
      throw new Error('Insufficient permissions to link bank accounts')
    }

    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    })

    const accessToken = exchangeResponse.data.access_token
    const itemId = exchangeResponse.data.item_id

    // Get institution info if available
    const institutionId = metadata?.institution?.institution_id || null
    const institutionName = metadata?.institution?.name || null

    // Store the Plaid item in database (using service role for insert)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: plaidItem, error: insertError } = await supabaseAdmin
      .from('plaid_items')
      .insert({
        household_id: householdId,
        access_token: accessToken,
        item_id: itemId,
        institution_id: institutionId,
        institution_name: institutionName,
        status: 'active',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting plaid_item:', insertError)
      throw new Error('Failed to store bank connection')
    }

    // Fetch accounts and balances
    const accountsResponse = await plaidClient.accountsBalanceGet({
      access_token: accessToken,
    })

    // Store accounts in database
    const accounts = accountsResponse.data.accounts.map(account => ({
      plaid_item_id: plaidItem.id,
      household_id: householdId,
      account_id: account.account_id,
      name: account.name,
      type: account.type,
      subtype: account.subtype || null,
      mask: account.mask || null,
      current_balance: account.balances.current,
      available_balance: account.balances.available,
      balance_last_updated: new Date().toISOString(),
      include_in_total: true,
    }))

    const { error: accountsError } = await supabaseAdmin
      .from('plaid_accounts')
      .insert(accounts)

    if (accountsError) {
      console.error('Error inserting accounts:', accountsError)
      throw new Error('Failed to store account information')
    }

    // Return success with account info (but not access token)
    return new Response(
      JSON.stringify({
        success: true,
        item_id: itemId,
        institution_name: institutionName,
        accounts: accountsResponse.data.accounts.map(a => ({
          account_id: a.account_id,
          name: a.name,
          type: a.type,
          subtype: a.subtype,
          mask: a.mask,
          current_balance: a.balances.current,
          available_balance: a.balances.available,
        })),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error exchanging token:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
