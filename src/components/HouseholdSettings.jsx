import { useState, useEffect } from 'react'
import { 
  Paper, Title, Text, Button, Stack, Group, TextInput, Select, 
  Table, Badge, Modal, Alert, ActionIcon, Tabs, Notification
} from '@mantine/core'
import { 
  getUserHouseholds, createHousehold, getHouseholdMembers, getHouseholdInvites,
  inviteToHousehold, revokeInvite, getPendingInvitesForUser, acceptInvite, 
  declineInvite, removeMember, updateMemberRole, leaveHousehold, updateHouseholdName
} from '../lib/supabase'

export default function HouseholdSettings({ 
  currentHouseholdId, 
  onHouseholdChange, 
  userId,
  userEmail
}) {
  const [households, setHouseholds] = useState([])
  const [members, setMembers] = useState([])
  const [invites, setInvites] = useState([])
  const [pendingInvites, setPendingInvites] = useState([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState(null)
  
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showRenameModal, setShowRenameModal] = useState(false)
  
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('editor')
  const [newHouseholdName, setNewHouseholdName] = useState('')
  const [renameValue, setRenameValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentHousehold = households.find(h => h.id === currentHouseholdId)
  const currentMember = members.find(m => m.user_id === userId)
  const isOwner = currentMember?.role === 'owner'

  useEffect(() => {
    loadData()
  }, [currentHouseholdId])

  const loadData = async () => {
    setLoading(true)
    try {
      const [householdData, invitesForUser] = await Promise.all([
        getUserHouseholds(),
        getPendingInvitesForUser()
      ])
      setHouseholds(householdData || [])
      setPendingInvites(invitesForUser || [])
      
      if (currentHouseholdId) {
        const [memberData, inviteData] = await Promise.all([
          getHouseholdMembers(currentHouseholdId),
          getHouseholdInvites(currentHouseholdId)
        ])
        setMembers(memberData || [])
        setInvites(inviteData || [])
      }
    } catch (error) {
      showNotification('error', error.message)
    } finally {
      setLoading(false)
    }
  }

  const showNotification = (type, message) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 4000)
  }

  const handleCreateHousehold = async () => {
    if (!newHouseholdName.trim()) {
      showNotification('error', 'Please enter a household name')
      return
    }
    
    setIsSubmitting(true)
    try {
      const household = await createHousehold(newHouseholdName.trim())
      showNotification('success', 'Household created successfully!')
      setShowCreateModal(false)
      setNewHouseholdName('')
      await loadData()
      onHouseholdChange(household.id)
    } catch (error) {
      showNotification('error', error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      showNotification('error', 'Please enter an email address')
      return
    }
    
    if (inviteEmail.toLowerCase().trim() === userEmail?.toLowerCase()) {
      showNotification('error', 'You cannot invite yourself')
      return
    }
    
    setIsSubmitting(true)
    try {
      await inviteToHousehold(currentHouseholdId, inviteEmail, inviteRole)
      showNotification('success', `Invitation sent to ${inviteEmail}`)
      setShowInviteModal(false)
      setInviteEmail('')
      setInviteRole('editor')
      await loadData()
    } catch (error) {
      if (error.message?.includes('duplicate')) {
        showNotification('error', 'This email has already been invited')
      } else {
        showNotification('error', error.message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRevokeInvite = async (inviteId) => {
    try {
      await revokeInvite(inviteId)
      showNotification('success', 'Invitation revoked')
      await loadData()
    } catch (error) {
      showNotification('error', error.message)
    }
  }

  const handleAcceptInvite = async (inviteId) => {
    try {
      const householdId = await acceptInvite(inviteId)
      showNotification('success', 'You have joined the household!')
      await loadData()
      onHouseholdChange(householdId)
    } catch (error) {
      showNotification('error', error.message)
    }
  }

  const handleDeclineInvite = async (inviteId) => {
    try {
      await declineInvite(inviteId)
      showNotification('success', 'Invitation declined')
      await loadData()
    } catch (error) {
      showNotification('error', error.message)
    }
  }

  const handleRemoveMember = async (memberId, memberEmail) => {
    if (!confirm(`Are you sure you want to remove ${memberEmail} from this household?`)) {
      return
    }
    
    try {
      await removeMember(memberId)
      showNotification('success', 'Member removed')
      await loadData()
    } catch (error) {
      showNotification('error', error.message)
    }
  }

  const handleUpdateRole = async (memberId, newRole) => {
    try {
      await updateMemberRole(memberId, newRole)
      showNotification('success', 'Role updated')
      await loadData()
    } catch (error) {
      showNotification('error', error.message)
    }
  }

  const handleLeaveHousehold = async () => {
    if (!confirm('Are you sure you want to leave this household? You will lose access to all shared data.')) {
      return
    }
    
    try {
      await leaveHousehold(currentHouseholdId)
      showNotification('success', 'You have left the household')
      await loadData()
      if (households.length > 1) {
        const otherHousehold = households.find(h => h.id !== currentHouseholdId)
        onHouseholdChange(otherHousehold?.id)
      }
    } catch (error) {
      showNotification('error', error.message)
    }
  }

  const handleRename = async () => {
    if (!renameValue.trim()) {
      showNotification('error', 'Please enter a name')
      return
    }
    
    setIsSubmitting(true)
    try {
      await updateHouseholdName(currentHouseholdId, renameValue.trim())
      showNotification('success', 'Household renamed')
      setShowRenameModal(false)
      await loadData()
    } catch (error) {
      showNotification('error', error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'owner': return 'grape'
      case 'editor': return 'blue'
      case 'viewer': return 'gray'
      default: return 'gray'
    }
  }

  return (
    <>
      {notification && (
        <Notification 
          color={notification.type === 'success' ? 'green' : 'red'}
          onClose={() => setNotification(null)}
          style={{ position: 'fixed', top: 20, right: 20, zIndex: 1000 }}
        >
          {notification.message}
        </Notification>
      )}

      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={1}>Household Settings</Title>
          <Button onClick={() => setShowCreateModal(true)}>
            Create New Household
          </Button>
        </Group>

        {pendingInvites.length > 0 && (
          <Paper p="md" withBorder style={{ borderColor: 'var(--mantine-color-grape-5)' }}>
            <Title order={3} mb="md" c="grape">Pending Invitations</Title>
            <Stack gap="sm">
              {pendingInvites.map(invite => (
                <Group key={invite.id} justify="space-between">
                  <Text>
                    You've been invited to join <strong>{invite.households?.name}</strong> as {invite.role}
                  </Text>
                  <Group gap="xs">
                    <Button size="xs" onClick={() => handleAcceptInvite(invite.id)}>
                      Accept
                    </Button>
                    <Button size="xs" variant="outline" color="red" onClick={() => handleDeclineInvite(invite.id)}>
                      Decline
                    </Button>
                  </Group>
                </Group>
              ))}
            </Stack>
          </Paper>
        )}

        {households.length > 1 && (
          <Paper p="md" withBorder>
            <Title order={3} mb="md">Switch Household</Title>
            <Select
              value={currentHouseholdId}
              onChange={onHouseholdChange}
              data={households.map(h => ({
                value: h.id,
                label: `${h.name} (${h.household_members?.[0]?.role || 'member'})`
              }))}
            />
          </Paper>
        )}

        {currentHousehold && (
          <Tabs defaultValue="members">
            <Tabs.List>
              <Tabs.Tab value="members">Members</Tabs.Tab>
              <Tabs.Tab value="invites">Pending Invites ({invites.length})</Tabs.Tab>
              <Tabs.Tab value="settings">Settings</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="members" pt="md">
              <Paper p="md" withBorder>
                <Group justify="space-between" mb="md">
                  <Title order={3}>{currentHousehold.name}</Title>
                  {isOwner && (
                    <Button onClick={() => setShowInviteModal(true)}>
                      Invite Member
                    </Button>
                  )}
                </Group>

                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Email</Table.Th>
                      <Table.Th>Role</Table.Th>
                      <Table.Th>Joined</Table.Th>
                      {isOwner && <Table.Th>Actions</Table.Th>}
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {members.map(member => (
                      <Table.Tr key={member.id}>
                        <Table.Td>
                          {member.user_profiles?.email || 'Unknown'}
                          {member.user_id === userId && <Text span c="dimmed"> (you)</Text>}
                        </Table.Td>
                        <Table.Td>
                          {isOwner && member.user_id !== userId ? (
                            <Select
                              size="xs"
                              value={member.role}
                              onChange={(value) => handleUpdateRole(member.id, value)}
                              data={[
                                { value: 'owner', label: 'Owner' },
                                { value: 'editor', label: 'Editor' },
                                { value: 'viewer', label: 'Viewer' }
                              ]}
                              style={{ width: 100 }}
                            />
                          ) : (
                            <Badge color={getRoleBadgeColor(member.role)}>
                              {member.role}
                            </Badge>
                          )}
                        </Table.Td>
                        <Table.Td>
                          {new Date(member.joined_at).toLocaleDateString()}
                        </Table.Td>
                        {isOwner && (
                          <Table.Td>
                            {member.user_id !== userId && (
                              <Button 
                                size="xs" 
                                variant="subtle" 
                                color="red"
                                onClick={() => handleRemoveMember(member.id, member.user_profiles?.email)}
                              >
                                Remove
                              </Button>
                            )}
                          </Table.Td>
                        )}
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Paper>
            </Tabs.Panel>

            <Tabs.Panel value="invites" pt="md">
              <Paper p="md" withBorder>
                {invites.length === 0 ? (
                  <Text c="dimmed">No pending invitations</Text>
                ) : (
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Email</Table.Th>
                        <Table.Th>Role</Table.Th>
                        <Table.Th>Expires</Table.Th>
                        {isOwner && <Table.Th>Actions</Table.Th>}
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {invites.map(invite => (
                        <Table.Tr key={invite.id}>
                          <Table.Td>{invite.email}</Table.Td>
                          <Table.Td>
                            <Badge color={getRoleBadgeColor(invite.role)}>
                              {invite.role}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            {new Date(invite.expires_at).toLocaleDateString()}
                          </Table.Td>
                          {isOwner && (
                            <Table.Td>
                              <Button 
                                size="xs" 
                                variant="subtle" 
                                color="red"
                                onClick={() => handleRevokeInvite(invite.id)}
                              >
                                Revoke
                              </Button>
                            </Table.Td>
                          )}
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                )}
              </Paper>
            </Tabs.Panel>

            <Tabs.Panel value="settings" pt="md">
              <Paper p="md" withBorder>
                <Stack gap="md">
                  {isOwner && (
                    <Group>
                      <Text>Household Name: <strong>{currentHousehold.name}</strong></Text>
                      <Button 
                        variant="light" 
                        size="xs"
                        onClick={() => {
                          setRenameValue(currentHousehold.name)
                          setShowRenameModal(true)
                        }}
                      >
                        Rename
                      </Button>
                    </Group>
                  )}
                  
                  {!isOwner && (
                    <Alert color="orange">
                      You are a {currentMember?.role} in this household. Only owners can manage settings and invite members.
                    </Alert>
                  )}
                  
                  {!isOwner && (
                    <Button color="red" variant="outline" onClick={handleLeaveHousehold}>
                      Leave Household
                    </Button>
                  )}
                </Stack>
              </Paper>
            </Tabs.Panel>
          </Tabs>
        )}
      </Stack>

      <Modal
        opened={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite Member"
      >
        <Stack gap="md">
          <TextInput
            label="Email Address"
            placeholder="partner@email.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <Select
            label="Role"
            value={inviteRole}
            onChange={setInviteRole}
            data={[
              { value: 'editor', label: 'Editor - Can view and edit all data' },
              { value: 'viewer', label: 'Viewer - Can only view data' }
            ]}
          />
          <Text size="sm" c="dimmed">
            The invited person will receive access once they sign up or sign in with this email address.
          </Text>
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setShowInviteModal(false)}>Cancel</Button>
            <Button loading={isSubmitting} onClick={handleInvite}>Send Invitation</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Household"
      >
        <Stack gap="md">
          <TextInput
            label="Household Name"
            placeholder="Family Budget, Business Finances, etc."
            value={newHouseholdName}
            onChange={(e) => setNewHouseholdName(e.target.value)}
          />
          <Text size="sm" c="dimmed">
            Create a separate household to manage different financial plans. You can invite others to join.
          </Text>
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button loading={isSubmitting} onClick={handleCreateHousehold}>Create</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        title="Rename Household"
      >
        <Stack gap="md">
          <TextInput
            label="New Name"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
          />
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setShowRenameModal(false)}>Cancel</Button>
            <Button loading={isSubmitting} onClick={handleRename}>Save</Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}
