import { useState } from 'react'
import { Table, Title, Text, Group, Button, Stack, TextInput, Select, Badge, Modal, Textarea, Notification, Paper, Menu, Checkbox, Radio, Switch, Box, MultiSelect } from '@mantine/core'
import OverrideModal from './OverrideModal'
import { hasOverride, getOverride } from '../utils/ruleOverrides'

export default function RecurringRules({ 
  rules, 
  scenarios, 
  ruleOverrides,
  onAddRule, 
  onBatchAdd, 
  onDeleteRule, 
  onToggleInclude, 
  onUpdateRule,
  onAddOverride,
  onUpdateOverride,
  onRemoveOverride
}) {
  const [filteringText, setFilteringText] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedAccount, setSelectedAccount] = useState('all')
  const [viewingScenario, setViewingScenario] = useState('base')
  const [showBatchModal, setShowBatchModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showScenarioModal, setShowScenarioModal] = useState(false)
  const [showOverrideModal, setShowOverrideModal] = useState(false)
  const [batchText, setBatchText] = useState('')
  const [notification, setNotification] = useState(null)
  const [editingRule, setEditingRule] = useState(null)
  const [editingRuleForScenario, setEditingRuleForScenario] = useState(null)
  const [selectedScenarios, setSelectedScenarios] = useState([])
  const [overrideRule, setOverrideRule] = useState(null)
  
  const [editForm, setEditForm] = useState({
    name: '',
    amount: '',
    type: 'Income',
    account: 'BOA',
    frequency: 'Monthly',
    effectiveDate: '',
    impactDate: '',
    endDate: '',
    description: '',
    usePaymentSchedule: false,
    paymentSchedule: []
  })

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'Income', label: 'Income' },
    { value: 'Cash Expense', label: 'Cash Expense' },
    { value: 'Variable Expense', label: 'Variable Expense' },
    { value: 'One Time Expenses', label: 'One Time Expenses' },
    { value: 'Renovation/Moving Costs', label: 'Renovation/Moving Costs' }
  ]

  const accountOptions = [
    { value: 'all', label: 'All Accounts' },
    { value: 'BOA', label: 'BOA' },
    { value: 'PNC', label: 'PNC' },
    { value: 'Other', label: 'Other' }
  ]

  const scenarioOptions = [
    { value: 'base', label: 'Base Scenario' },
    ...scenarios.filter(s => !s.isBaseline).map(s => ({ value: String(s.id), label: s.name }))
  ]

  const filteredRules = rules.filter(rule => {
    const matchesText = rule.name.toLowerCase().includes(filteringText.toLowerCase())
    const matchesType = selectedType === 'all' || rule.type === selectedType
    const matchesAccount = selectedAccount === 'all' || rule.account === selectedAccount
    
    let matchesScenario = false
    if (viewingScenario === 'base') {
      matchesScenario = !rule.scenarioIds || rule.scenarioIds.length === 0
    } else {
      const scenarioId = parseInt(viewingScenario) || viewingScenario
      const isBaseRule = !rule.scenarioIds || rule.scenarioIds.length === 0
      const isInScenario = rule.scenarioIds && rule.scenarioIds.includes(scenarioId)
      matchesScenario = isBaseRule || isInScenario
    }
    
    return matchesText && matchesType && matchesAccount && matchesScenario
  })

  const formatCurrency = (value) => {
    const formatted = `$${Math.abs(value).toLocaleString()}`
    return value < 0 ? `-${formatted}` : formatted
  }

  const showNotification = (type, message) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleEditRule = (rule) => {
    setEditingRule(rule)
    setEditForm({
      name: rule.name,
      amount: rule.amount?.toString() || '0',
      type: rule.type,
      account: rule.account || 'BOA',
      frequency: rule.frequency,
      effectiveDate: rule.effectiveDate || '',
      impactDate: rule.impactDate || '',
      endDate: rule.endDate || '',
      description: rule.description || '',
      usePaymentSchedule: rule.paymentSchedule && rule.paymentSchedule.length > 0,
      paymentSchedule: rule.paymentSchedule || []
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = () => {
    if (editingRule) {
      let amount = parseFloat(editForm.amount)
      
      const isExpenseType = editForm.type !== 'Income'
      if (isExpenseType && amount > 0) {
        amount = -amount
      }
      if (editForm.type === 'Income' && amount < 0) {
        amount = Math.abs(amount)
      }
      
      const updates = {
        name: editForm.name,
        amount: amount,
        type: editForm.type,
        account: editForm.account,
        frequency: editForm.frequency,
        effectiveDate: editForm.frequency !== 'One-time' ? editForm.effectiveDate : undefined,
        impactDate: editForm.frequency === 'One-time' ? editForm.impactDate : undefined,
        endDate: editForm.endDate || null,
        description: editForm.description,
        paymentSchedule: editForm.usePaymentSchedule ? editForm.paymentSchedule : null
      }
      
      onUpdateRule(editingRule.id, updates)
      setShowEditModal(false)
      setEditingRule(null)
      showNotification('success', `Updated rule: ${editForm.name}`)
    }
  }

  const handleExportRules = () => {
    const exportLines = filteredRules.map(rule => {
      return [
        rule.name,
        rule.amount,
        rule.type,
        rule.account || 'BOA',
        rule.frequency,
        rule.effectiveDate || rule.impactDate || '',
        rule.endDate || '',
        rule.description || ''
      ].join(', ')
    })
    
    const csvContent = exportLines.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const scenarioLabel = scenarioOptions.find(s => s.value === viewingScenario)?.label || 'Base'
    link.download = `rules-${scenarioLabel.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
    
    showNotification('success', `Exported ${filteredRules.length} rule(s)`)
  }

  const handleBatchUpload = () => {
    try {
      const lines = batchText.trim().split('\n')
      const newRules = []

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        if (line.startsWith('{')) {
          try {
            const rule = JSON.parse(line)
            newRules.push({ include: true, ...rule })
            continue
          } catch (e) {}
        }

        const parts = line.split(',').map(p => p.trim())
        if (parts.length >= 4) {
          let amount = parseFloat(parts[1])
          const type = parts[2] || 'Cash Expense'
          
          const isExpenseType = type !== 'Income'
          if (isExpenseType && amount > 0) {
            amount = -amount
          }
          if (type === 'Income' && amount < 0) {
            amount = Math.abs(amount)
          }
          
          newRules.push({
            include: true,
            name: parts[0],
            amount: amount,
            type: type,
            account: parts[3] || 'BOA',
            frequency: parts[4] || 'Monthly',
            effectiveDate: parts[5] || new Date().toISOString().split('T')[0],
            endDate: parts[6] || null,
            description: parts[7] || ''
          })
        }
      }

      if (newRules.length > 0) {
        onBatchAdd(newRules)
        setShowBatchModal(false)
        setBatchText('')
        showNotification('success', `Successfully added ${newRules.length} rule(s)`)
      } else {
        showNotification('error', 'No valid rules found. Please check the format.')
      }
    } catch (error) {
      showNotification('error', `Error parsing rules: ${error.message}`)
    }
  }

  const handleSaveScenarioAssignment = () => {
    if (editingRuleForScenario) {
      const scenarioIds = selectedScenarios.map(id => parseInt(id) || id)
      onUpdateRule(editingRuleForScenario.id, { scenarioIds })
      setShowScenarioModal(false)
      setEditingRuleForScenario(null)
      setSelectedScenarios([])
      showNotification('success', 'Scenario assignment updated')
    }
  }

  const currentScenario = scenarios.find(s => String(s.id) === viewingScenario) || { name: 'Base Scenario' }

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
          <Box>
            <Title order={1}>Scenarios & Rules</Title>
            <Text c="dimmed">Viewing: {scenarioOptions.find(s => s.value === viewingScenario)?.label}</Text>
            <Text size="sm" c="dimmed">({filteredRules.length}/{rules.length})</Text>
          </Box>
          <Group>
            <Button variant="light" onClick={() => setShowBatchModal(true)}>Batch Upload</Button>
            <Button variant="light" onClick={handleExportRules}>Export Rules</Button>
            <Button onClick={() => onAddRule(viewingScenario !== 'base' ? parseInt(viewingScenario) || viewingScenario : null)}>
              Add New Rule
            </Button>
          </Group>
        </Group>

        <Paper p="md" withBorder>
          <Stack gap="sm">
            <Select
              value={viewingScenario}
              onChange={setViewingScenario}
              data={scenarioOptions}
              label="Scenario"
            />
            <Group>
              <TextInput
                placeholder="Search rules..."
                value={filteringText}
                onChange={(e) => setFilteringText(e.target.value)}
                style={{ flex: 1 }}
              />
              <Select
                value={selectedType}
                onChange={setSelectedType}
                data={typeOptions}
                placeholder="Filter by type"
              />
              <Select
                value={selectedAccount}
                onChange={setSelectedAccount}
                data={accountOptions}
                placeholder="Filter by account"
              />
              {(filteringText || selectedType !== 'all' || selectedAccount !== 'all') && (
                <Button variant="subtle" onClick={() => {
                  setFilteringText('')
                  setSelectedType('all')
                  setSelectedAccount('all')
                }}>
                  Clear filters
                </Button>
              )}
            </Group>
          </Stack>
        </Paper>

        {filteredRules.length === 0 ? (
          <Paper p="xl" withBorder ta="center">
            <Text fw={700}>No recurring rules</Text>
            <Text c="dimmed">No rules to display. Add a new rule to get started.</Text>
          </Paper>
        ) : (
          <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={70}>Base?</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th w={100}>Amount</Table.Th>
                <Table.Th w={140}>Type</Table.Th>
                <Table.Th w={80}>Acct</Table.Th>
                <Table.Th w={100}>Frequency</Table.Th>
                <Table.Th w={110}>Start Date</Table.Th>
                <Table.Th w={110}>End Date</Table.Th>
                <Table.Th w={120}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredRules.map(item => {
                const isOverridden = (!item.scenarioIds || item.scenarioIds.length === 0) && 
                  viewingScenario !== 'base' && 
                  hasOverride(ruleOverrides, item.id, parseInt(viewingScenario) || viewingScenario)
                
                return (
                  <Table.Tr key={item.id} bg={isOverridden ? 'blue.0' : undefined}>
                    <Table.Td>
                      <Checkbox 
                        checked={item.include} 
                        onChange={() => onToggleInclude(item.id)}
                      />
                    </Table.Td>
                    <Table.Td>
                      <Stack gap={4}>
                        <Group gap="xs">
                          <Text>{item.name}</Text>
                          {(!item.scenarioIds || item.scenarioIds.length === 0) && <Badge color="green" size="xs">Base</Badge>}
                          {item.scenarioIds && item.scenarioIds.length > 0 && scenarios && (
                            item.scenarioIds.map(scenarioId => {
                              const scenario = scenarios.find(s => s.id === scenarioId)
                              return scenario ? <Badge key={scenarioId} color="blue" size="xs">{scenario.name}</Badge> : null
                            })
                          )}
                          {isOverridden && <Badge color="violet" size="xs">Modified</Badge>}
                          {item.paymentSchedule && item.paymentSchedule.length > 0 && (
                            <Badge color="gray" size="xs">{item.paymentSchedule.length} Phases</Badge>
                          )}
                        </Group>
                        {item.description && <Text size="xs" c="dimmed">"{item.description}"</Text>}
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      <Text c={item.type?.includes('Expense') || item.type?.includes('Costs') ? 'red' : 'green'}>
                        {formatCurrency(item.amount)}
                      </Text>
                    </Table.Td>
                    <Table.Td>{item.type}</Table.Td>
                    <Table.Td>{item.type === 'Income' ? <Text c="dimmed">-</Text> : <Badge>{item.account}</Badge>}</Table.Td>
                    <Table.Td>{item.frequency}</Table.Td>
                    <Table.Td>{item.effectiveDate || item.impactDate || '-'}</Table.Td>
                    <Table.Td>{item.endDate || '-'}</Table.Td>
                    <Table.Td>
                      <Menu shadow="md" width={200}>
                        <Menu.Target>
                          <Button variant="subtle" size="xs">Actions</Button>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item onClick={() => handleEditRule(item)}>Edit Rule</Menu.Item>
                          <Menu.Item onClick={() => {
                            const currentScenarios = item.scenarioIds && scenarios
                              ? scenarios
                                  .filter(s => !s.isBaseline && item.scenarioIds.includes(s.id))
                                  .map(s => String(s.id))
                              : []
                            setEditingRuleForScenario(item)
                            setSelectedScenarios(currentScenarios)
                            setShowScenarioModal(true)
                          }}>Assign to Scenario</Menu.Item>
                          {(!item.scenarioIds || item.scenarioIds.length === 0) && viewingScenario !== 'base' && (
                            <Menu.Item onClick={() => {
                              setOverrideRule(item)
                              setShowOverrideModal(true)
                            }}>
                              {hasOverride(ruleOverrides, item.id, parseInt(viewingScenario) || viewingScenario) ? 'Edit Override' : 'Override Rule'}
                            </Menu.Item>
                          )}
                          <Menu.Divider />
                          <Menu.Item color="red" onClick={() => {
                            onDeleteRule(item.id)
                            showNotification('success', `Deleted rule: ${item.name}`)
                          }}>Delete</Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Table.Td>
                  </Table.Tr>
                )
              })}
            </Table.Tbody>
          </Table>
        )}
      </Stack>

      <Modal opened={showEditModal} onClose={() => { setShowEditModal(false); setEditingRule(null); }} title="Edit Rule" size="lg">
        <Stack gap="md">
          <TextInput
            label="Name"
            value={editForm.name}
            onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
          />
          <TextInput
            label="Amount"
            type="number"
            value={editForm.amount}
            onChange={(e) => setEditForm(prev => ({ ...prev, amount: e.target.value }))}
          />
          <Select
            label="Type"
            value={editForm.type}
            onChange={(val) => setEditForm(prev => ({ ...prev, type: val }))}
            data={typeOptions.filter(t => t.value !== 'all')}
          />
          <Select
            label="Account"
            value={editForm.account}
            onChange={(val) => setEditForm(prev => ({ ...prev, account: val }))}
            data={accountOptions.filter(a => a.value !== 'all')}
          />
          <Select
            label="Frequency"
            value={editForm.frequency}
            onChange={(val) => setEditForm(prev => ({ ...prev, frequency: val }))}
            data={[
              { value: 'One-time', label: 'One-time' },
              { value: 'Weekly', label: 'Weekly' },
              { value: 'Bi-weekly', label: 'Bi-weekly' },
              { value: 'Monthly', label: 'Monthly' }
            ]}
          />
          {editForm.frequency !== 'One-time' && (
            <TextInput
              label="Effective Date"
              type="date"
              value={editForm.effectiveDate}
              onChange={(e) => setEditForm(prev => ({ ...prev, effectiveDate: e.target.value }))}
            />
          )}
          {editForm.frequency === 'One-time' && (
            <TextInput
              label="Impact Date"
              type="date"
              value={editForm.impactDate}
              onChange={(e) => setEditForm(prev => ({ ...prev, impactDate: e.target.value }))}
            />
          )}
          <TextInput
            label="End Date"
            type="date"
            value={editForm.endDate}
            onChange={(e) => setEditForm(prev => ({ ...prev, endDate: e.target.value }))}
          />
          <Textarea
            label="Description"
            value={editForm.description}
            onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
          />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => { setShowEditModal(false); setEditingRule(null); }}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={showBatchModal} onClose={() => setShowBatchModal(false)} title="Batch Upload Rules" size="lg">
        <Stack gap="md">
          <Text size="sm">Paste your rules in CSV format:</Text>
          <Text size="xs" c="dimmed">Format: Name, Amount, Type, Account, Frequency, Effective Date, End Date, Description</Text>
          <Textarea
            value={batchText}
            onChange={(e) => setBatchText(e.target.value)}
            placeholder="Paste your rules here..."
            minRows={10}
          />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => setShowBatchModal(false)}>Cancel</Button>
            <Button onClick={handleBatchUpload}>Upload</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={showScenarioModal} onClose={() => { setShowScenarioModal(false); setEditingRuleForScenario(null); }} title="Assign to Scenarios">
        <Stack gap="md">
          <Text>Select which scenarios this rule should be assigned to:</Text>
          <MultiSelect
            data={scenarios.filter(s => !s.isBaseline).map(s => ({ value: String(s.id), label: s.name }))}
            value={selectedScenarios}
            onChange={setSelectedScenarios}
            placeholder="Select scenarios"
          />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => { setShowScenarioModal(false); setEditingRuleForScenario(null); }}>Cancel</Button>
            <Button onClick={handleSaveScenarioAssignment}>Save</Button>
          </Group>
        </Stack>
      </Modal>

      <OverrideModal
        visible={showOverrideModal}
        onDismiss={() => { setShowOverrideModal(false); setOverrideRule(null); }}
        rule={overrideRule}
        scenario={currentScenario}
        existingOverride={overrideRule ? getOverride(ruleOverrides, overrideRule.id, parseInt(viewingScenario) || viewingScenario) : null}
        onSave={(values) => {
          if (overrideRule) {
            const existingOverrideObj = getOverride(ruleOverrides, overrideRule.id, parseInt(viewingScenario) || viewingScenario)
            if (existingOverrideObj) {
              onUpdateOverride(existingOverrideObj.id, values)
            } else {
              onAddOverride(overrideRule.id, parseInt(viewingScenario) || viewingScenario, values)
            }
          }
        }}
        onRemove={() => {
          if (overrideRule) {
            const existingOverrideObj = getOverride(ruleOverrides, overrideRule.id, parseInt(viewingScenario) || viewingScenario)
            if (existingOverrideObj) {
              onRemoveOverride(existingOverrideObj.id)
            }
          }
        }}
      />
    </>
  )
}
