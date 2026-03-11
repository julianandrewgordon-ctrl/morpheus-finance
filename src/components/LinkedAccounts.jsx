import { useState, useEffect, useCallback, useMemo } from 'react'
import { Stack, Group, Text, Paper, Button, Checkbox, Loader, Center, Alert, ActionIcon, Tooltip } from '@mantine/core'
import { getPlaidAccounts, getPlaidItems, refreshPlaidBalances, disconnectPlaidItem, updatePlaidAccountInclude } from '../lib/supabase'
import PlaidLink from './PlaidLink'

export default function LinkedAccounts({
  householdId,
  onTotalChange,
  onApplyBalance,
  effectiveDate,
  onEffectiveDateChange
}) {
  const [accounts, setAccounts] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  const loadAccounts = useCallback(async () => {
    if (!householdId) return

    try {
      setLoading(true)
      setError(null)
      const [accountsData, itemsData] = await Promise.all([
        getPlaidAccounts(householdId),
        getPlaidItems(householdId)
      ])
      setAccounts(accountsData)
      setItems(itemsData)
    } catch (err) {
      console.error('Error loading accounts:', err)
      setError('Failed to load linked accounts')
    } finally {
      setLoading(false)
    }
  }, [householdId])

  useEffect(() => {
    loadAccounts()
  }, [loadAccounts])

  const handleRefresh = async () => {
    if (!householdId) return

    try {
      setRefreshing(true)
      setError(null)
      await refreshPlaidBalances(householdId)
      await loadAccounts()
    } catch (err) {
      console.error('Error refreshing balances:', err)
      setError('Failed to refresh balances')
    } finally {
      setRefreshing(false)
    }
  }

  const handleDisconnect = async (itemId) => {
    if (!householdId) return

    try {
      setError(null)
      await disconnectPlaidItem(itemId, householdId)
      await loadAccounts()
    } catch (err) {
      console.error('Error disconnecting:', err)
      setError('Failed to disconnect bank')
    }
  }

  const handleToggleInclude = async (accountId, currentValue) => {
    try {
      setError(null)
      await updatePlaidAccountInclude(accountId, !currentValue)
      setAccounts(prev => prev.map(acc =>
        acc.id === accountId ? { ...acc, include_in_total: !currentValue } : acc
      ))
    } catch (err) {
      console.error('Error updating account:', err)
      setError('Failed to update account')
    }
  }

  const handleLinkSuccess = async () => {
    await loadAccounts()
  }

  const handleLinkError = (errorMessage) => {
    setError(errorMessage)
  }

  // Calculate total of included accounts
  const selectedTotal = useMemo(() => {
    return accounts
      .filter(acc => acc.include_in_total)
      .reduce((sum, acc) => sum + (parseFloat(acc.current_balance) || 0), 0)
  }, [accounts])

  // Notify parent of total changes
  useEffect(() => {
    onTotalChange?.(selectedTotal)
  }, [selectedTotal, onTotalChange])

  // Group accounts by institution
  const accountsByInstitution = useMemo(() => {
    const grouped = {}
    accounts.forEach(acc => {
      const institutionName = acc.plaid_items?.institution_name || 'Unknown Bank'
      const itemId = acc.plaid_items?.id
      if (!grouped[itemId]) {
        grouped[itemId] = {
          institutionName,
          itemId,
          status: acc.plaid_items?.status,
          accounts: []
        }
      }
      grouped[itemId].accounts.push(acc)
    })
    return Object.values(grouped)
  }, [accounts])

  const formatCurrency = (val) => {
    const num = parseFloat(val) || 0
    const formatted = Math.abs(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    return num < 0 ? `-$${formatted}` : `$${formatted}`
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never'
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <Center p="xl">
        <Loader color="violet" />
      </Center>
    )
  }

  // No accounts linked yet
  if (accounts.length === 0) {
    return (
      <Stack align="center" gap="md" py="xl">
        <Text size="xl">🏦</Text>
        <Text c="dimmed">No bank accounts linked yet</Text>
        <Text size="sm" c="dimmed" ta="center">
          Connect your bank to automatically<br />
          sync your actual account balances.
        </Text>
        <PlaidLink
          householdId={householdId}
          onSuccess={handleLinkSuccess}
          onError={handleLinkError}
        />
        {error && (
          <Alert color="red" mt="md">{error}</Alert>
        )}
      </Stack>
    )
  }

  return (
    <Stack gap="md">
      {error && (
        <Alert color="red" withCloseButton onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Group justify="space-between">
        <Text fw={500}>Connected Accounts</Text>
        <Button
          variant="light"
          size="xs"
          onClick={handleRefresh}
          loading={refreshing}
        >
          Refresh Balances
        </Button>
      </Group>

      {accountsByInstitution.map(institution => (
        <Paper key={institution.itemId} withBorder p="sm">
          <Group justify="space-between" mb="xs">
            <Text fw={500} size="sm">{institution.institutionName}</Text>
            <Group gap="xs">
              {institution.status === 'needs_reauth' && (
                <Text size="xs" c="orange">Needs reconnection</Text>
              )}
              <Tooltip label="Disconnect this bank">
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="sm"
                  onClick={() => handleDisconnect(institution.itemId)}
                >
                  ✕
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>

          <Stack gap="xs">
            {institution.accounts.map(account => (
              <Group key={account.id} justify="space-between" wrap="nowrap">
                <Group gap="xs" wrap="nowrap">
                  <Checkbox
                    checked={account.include_in_total}
                    onChange={() => handleToggleInclude(account.id, account.include_in_total)}
                    size="sm"
                  />
                  <Stack gap={0}>
                    <Text size="sm">
                      {account.name} {account.mask && `...${account.mask}`}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {account.type}{account.subtype && ` • ${account.subtype}`}
                    </Text>
                  </Stack>
                </Group>
                <Stack gap={0} align="flex-end">
                  <Text
                    size="sm"
                    fw={500}
                    c={parseFloat(account.current_balance) < 0 ? 'red' : undefined}
                  >
                    {formatCurrency(account.current_balance)}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Updated {formatDate(account.balance_last_updated)}
                  </Text>
                </Stack>
              </Group>
            ))}
          </Stack>
        </Paper>
      ))}

      <Paper withBorder p="md" bg="gray.0">
        <Group justify="space-between">
          <Text fw={500}>Total (selected accounts)</Text>
          <Text fw={700} size="lg" c={selectedTotal < 0 ? 'red' : 'green'}>
            {formatCurrency(selectedTotal)}
          </Text>
        </Group>
      </Paper>

      <Group justify="space-between" align="flex-end">
        <Stack gap={4}>
          <Text size="sm">Effective Date</Text>
          <input
            type="date"
            value={effectiveDate}
            onChange={(e) => onEffectiveDateChange?.(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #ced4da',
              fontSize: '14px'
            }}
          />
        </Stack>
        <PlaidLink
          householdId={householdId}
          onSuccess={handleLinkSuccess}
          onError={handleLinkError}
          buttonText="+ Link Another Bank"
          variant="light"
        />
      </Group>

      {onApplyBalance && (
        <Button onClick={() => onApplyBalance(selectedTotal)} fullWidth>
          Apply to Forecast
        </Button>
      )}
    </Stack>
  )
}
