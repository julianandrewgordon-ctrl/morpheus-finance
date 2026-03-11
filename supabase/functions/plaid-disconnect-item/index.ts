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
    const { plaidItemId, householdId } = await req.json()
    if (!plaidItemId || !householdId) {
      throw new Error('plaidItemId and householdId are required')
    }

    // Verify user has access to this household with owner/editor role
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
      throw new Error('Insufficient permissions to disconnect bank accounts')
    }

    // Use service role to access and delete plaid_items
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get the Plaid item to verify it belongs to this household and get access_token
    const { data: plaidItem, error: fetchError } = await supabaseAdmin
      .from('plaid_items')
      .select('access_token, household_id')
      .eq('id', plaidItemId)
      .single()

    if (fetchError || !plaidItem) {
      throw new Error('Bank connection not found')
    }

    if (plaidItem.household_id !== householdId) {
      throw new Error('Bank connection does not belong to this household')
    }

    // Remove the item from Plaid
    try {
      await plaidClient.itemRemove({
        access_token: plaidItem.access_token,
      })
    } catch (plaidError) {
      console.error('Plaid item removal error (continuing with local deletion):', plaidError)
      // Continue with local deletion even if Plaid API fails
    }

    // Delete the item from database (cascades to plaid_accounts)
    const { error: deleteError } = await supabaseAdmin
      .from('plaid_items')
      .delete()
      .eq('id', plaidItemId)

    if (deleteError) {
      throw new Error('Failed to delete bank connection')
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error disconnecting item:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
