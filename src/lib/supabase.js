import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getUserHouseholds() {
  const { data, error } = await supabase
    .from('households')
    .select(`
      *,
      household_members!inner (
        role,
        status,
        user_id
      )
    `)
    .eq('household_members.status', 'accepted')
  
  if (error) throw error
  return data
}

export async function createHousehold(name) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { data: household, error: householdError } = await supabase
    .from('households')
    .insert({ name, created_by: user.id })
    .select()
    .single()
  
  if (householdError) throw householdError
  
  const { error: memberError } = await supabase
    .from('household_members')
    .insert({
      household_id: household.id,
      user_id: user.id,
      role: 'owner',
      status: 'accepted'
    })
  
  if (memberError) throw memberError
  
  return household
}

export async function getHouseholdMembers(householdId) {
  const { data, error } = await supabase
    .from('household_members')
    .select(`
      *,
      user_profiles:user_id (
        email
      )
    `)
    .eq('household_id', householdId)
    .eq('status', 'accepted')
  
  if (error) throw error
  return data
}

export async function getHouseholdInvites(householdId) {
  const { data, error } = await supabase
    .from('household_invites')
    .select('*')
    .eq('household_id', householdId)
    .eq('status', 'pending')
  
  if (error) throw error
  return data
}

export async function inviteToHousehold(householdId, email, role = 'editor') {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('household_invites')
    .insert({
      household_id: householdId,
      email: email.toLowerCase().trim(),
      role,
      invited_by: user.id
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function revokeInvite(inviteId) {
  const { error } = await supabase
    .from('household_invites')
    .update({ status: 'revoked' })
    .eq('id', inviteId)
  
  if (error) throw error
}

export async function getPendingInvitesForUser() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  
  const { data, error } = await supabase
    .from('household_invites')
    .select(`
      *,
      households (
        name
      )
    `)
    .eq('email', user.email.toLowerCase())
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
  
  if (error) throw error
  return data
}

export async function acceptInvite(inviteId) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { data: invite, error: fetchError } = await supabase
    .from('household_invites')
    .select('*')
    .eq('id', inviteId)
    .eq('status', 'pending')
    .single()
  
  if (fetchError) throw fetchError
  if (!invite) throw new Error('Invite not found or expired')
  
  const { error: memberError } = await supabase
    .from('household_members')
    .insert({
      household_id: invite.household_id,
      user_id: user.id,
      role: invite.role,
      status: 'accepted',
      invited_by: invite.invited_by
    })
  
  if (memberError) throw memberError
  
  const { error: updateError } = await supabase
    .from('household_invites')
    .update({ status: 'accepted' })
    .eq('id', inviteId)
  
  if (updateError) throw updateError
  
  return invite.household_id
}

export async function declineInvite(inviteId) {
  const { error } = await supabase
    .from('household_invites')
    .update({ status: 'revoked' })
    .eq('id', inviteId)
  
  if (error) throw error
}

export async function removeMember(memberId) {
  const { error } = await supabase
    .from('household_members')
    .delete()
    .eq('id', memberId)
  
  if (error) throw error
}

export async function updateMemberRole(memberId, newRole) {
  const { error } = await supabase
    .from('household_members')
    .update({ role: newRole })
    .eq('id', memberId)
  
  if (error) throw error
}

export async function leaveHousehold(householdId) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { error } = await supabase
    .from('household_members')
    .delete()
    .eq('household_id', householdId)
    .eq('user_id', user.id)
  
  if (error) throw error
}

export async function updateHouseholdName(householdId, name) {
  const { error } = await supabase
    .from('households')
    .update({ name })
    .eq('id', householdId)
  
  if (error) throw error
}

export async function getFinancialDataByHousehold(householdId) {
  // Use array query and take first result to handle potential duplicates safely
  const { data, error } = await supabase
    .from('financial_data')
    .select('*')
    .eq('household_id', householdId)
    .order('updated_at', { ascending: false })
    .limit(1)
  
  if (error) throw error
  return data && data.length > 0 ? data[0] : null
}

export async function saveFinancialDataByHousehold(householdId, financialData) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  console.log('saveFinancialDataByHousehold called for household:', householdId)
  
  // First try to find existing row by household_id (use array query to handle duplicates)
  const { data: existingRows, error: fetchError } = await supabase
    .from('financial_data')
    .select('id')
    .eq('household_id', householdId)
    .limit(1)
  
  if (fetchError) {
    console.error('Error fetching by household_id:', fetchError)
    throw fetchError
  }
  
  if (existingRows && existingRows.length > 0) {
    // Row exists with this household_id, just update it
    console.log('Found existing row by household_id, updating...')
    const { error } = await supabase
      .from('financial_data')
      .update({ data: financialData })
      .eq('id', existingRows[0].id)
    
    if (error) throw error
    return
  }
  
  // Check if there's a legacy row for this user without household_id
  // Order by updated_at DESC to get the most recent data first
  const { data: legacyRows, error: legacyError } = await supabase
    .from('financial_data')
    .select('id')
    .eq('user_id', user.id)
    .is('household_id', null)
    .order('updated_at', { ascending: false })
    .limit(1)
  
  if (legacyError) {
    console.error('Error fetching legacy row:', legacyError)
    throw legacyError
  }
  
  if (legacyRows && legacyRows.length > 0) {
    // Migrate the legacy row: add household_id and update data
    console.log('Found legacy row, migrating to household...')
    const { error: updateError } = await supabase
      .from('financial_data')
      .update({ 
        data: financialData,
        household_id: householdId 
      })
      .eq('id', legacyRows[0].id)
    
    if (updateError) throw updateError
    return
  }
  
  // No existing row for this household, insert new one
  console.log('No existing row found, inserting new row...')
  const { error } = await supabase
    .from('financial_data')
    .insert({
      household_id: householdId,
      user_id: user.id,
      data: financialData
    })
  
  if (error) throw error
}

export function getUserRole(householdMembers, userId) {
  const member = householdMembers?.find(m => m.user_id === userId)
  return member?.role || null
}
