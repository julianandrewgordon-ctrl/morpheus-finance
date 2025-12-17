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
  const { data, error } = await supabase
    .from('financial_data')
    .select('*')
    .eq('household_id', householdId)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function saveFinancialDataByHousehold(householdId, financialData) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { data: existing } = await supabase
    .from('financial_data')
    .select('id')
    .eq('household_id', householdId)
    .single()
  
  if (existing) {
    const { error } = await supabase
      .from('financial_data')
      .update({ data: financialData })
      .eq('household_id', householdId)
    
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('financial_data')
      .insert({
        household_id: householdId,
        user_id: user.id,
        data: financialData
      })
    
    if (error) throw error
  }
}

export function getUserRole(householdMembers, userId) {
  const member = householdMembers?.find(m => m.user_id === userId)
  return member?.role || null
}
