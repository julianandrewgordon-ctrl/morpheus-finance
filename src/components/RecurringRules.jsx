import { useState } from 'react'
import Table from '@cloudscape-design/components/table'
import Header from '@cloudscape-design/components/header'
import Button from '@cloudscape-design/components/button'
import SpaceBetween from '@cloudscape-design/components/space-between'
import TextFilter from '@cloudscape-design/components/text-filter'
import Select from '@cloudscape-design/components/select'
import Box from '@cloudscape-design/components/box'
import Badge from '@cloudscape-design/components/badge'
import ButtonDropdown from '@cloudscape-design/components/button-dropdown'
import Modal from '@cloudscape-design/components/modal'
import Textarea from '@cloudscape-design/components/textarea'
import Flashbar from '@cloudscape-design/components/flashbar'
import FormField from '@cloudscape-design/components/form-field'
import Input from '@cloudscape-design/components/input'
import DatePicker from '@cloudscape-design/components/date-picker'
import RadioGroup from '@cloudscape-design/components/radio-group'
import Toggle from '@cloudscape-design/components/toggle'
import Container from '@cloudscape-design/components/container'
import ColumnLayout from '@cloudscape-design/components/column-layout'

export default function RecurringRules({ rules, scenarios, onAddRule, onBatchAdd, onDeleteRule, onToggleInclude, onUpdateRule }) {
  const [filteringText, setFilteringText] = useState('')
  const [selectedType, setSelectedType] = useState({ label: 'All Types', value: 'all' })
  const [selectedAccount, setSelectedAccount] = useState({ label: 'All Accounts', value: 'all' })
  const [viewingScenario, setViewingScenario] = useState({ label: 'Base Scenario', value: 'base' })
  const [showBatchModal, setShowBatchModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showScenarioModal, setShowScenarioModal] = useState(false)
  const [batchText, setBatchText] = useState('')
  const [flashMessages, setFlashMessages] = useState([])
  const [editingRule, setEditingRule] = useState(null)
  const [editingRuleForScenario, setEditingRuleForScenario] = useState(null)
  const [selectedScenario, setSelectedScenario] = useState(null)
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    amount: '',
    type: { label: 'Income', value: 'Income' },
    account: { label: 'BOA', value: 'BOA' },
    frequency: 'Monthly',
    effectiveDate: '',
    impactDate: '',
    endDate: '',
    description: '',
    usePaymentSchedule: false,
    paymentSchedule: []
  })

  const typeOptions = [
    { label: 'All Types', value: 'all' },
    { label: 'Income', value: 'Income' },
    { label: 'Cash Expense', value: 'Cash Expense' },
    { label: 'Variable Expense', value: 'Variable Expense' },
    { label: 'One Time Expenses', value: 'One Time Expenses' },
    { label: 'Renovation/Moving Costs', value: 'Renovation/Moving Costs' }
  ]

  const accountOptions = [
    { label: 'All Accounts', value: 'all' },
    { label: 'BOA', value: 'BOA' },
    { label: 'PNC', value: 'PNC' },
    { label: 'Other', value: 'Other' }
  ]

  const typeSelectOptions = [
    { label: 'Income', value: 'Income' },
    { label: 'Cash Expense', value: 'Cash Expense' },
    { label: 'Variable Expense', value: 'Variable Expense' },
    { label: 'Renovation/Moving Costs', value: 'Renovation/Moving Costs' },
    { label: 'One Time Expenses', value: 'One Time Expenses' }
  ]

  const accountSelectOptions = [
    { label: 'BOA', value: 'BOA' },
    { label: 'PNC', value: 'PNC' },
    { label: 'Other', value: 'Other' }
  ]

  // Scenario filter options
  const scenarioOptions = [
    { label: 'Base Scenario', value: 'base' },
    ...scenarios.filter(s => !s.isBaseline).map(s => ({ label: s.name, value: s.id }))
  ]

  const filteredRules = rules.filter(rule => {
    const matchesText = rule.name.toLowerCase().includes(filteringText.toLowerCase())
    const matchesType = selectedType.value === 'all' || rule.type === selectedType.value
    const matchesAccount = selectedAccount.value === 'all' || rule.account === selectedAccount.value
    
    // Scenario filtering
    let matchesScenario = false
    if (viewingScenario.value === 'base') {
      // Base scenario: show rules without scenario assignment
      matchesScenario = !rule.scenarioId
    } else {
      // Specific scenario: show base rules + scenario-specific rules
      matchesScenario = !rule.scenarioId || rule.scenarioId === viewingScenario.value
    }
    
    return matchesText && matchesType && matchesAccount && matchesScenario
  })

  const formatCurrency = (value) => {
    const formatted = `$${Math.abs(value).toLocaleString()}`
    return value < 0 ? `-${formatted}` : formatted
  }

  const handleEditRule = (rule) => {
    setEditingRule(rule)
    setEditForm({
      name: rule.name,
      amount: rule.amount?.toString() || '0',
      type: { label: rule.type, value: rule.type },
      account: { label: rule.account || 'BOA', value: rule.account || 'BOA' },
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
      
      // Automatically ensure expenses are negative
      const isExpenseType = editForm.type.value !== 'Income'
      if (isExpenseType && amount > 0) {
        amount = -amount
      }
      // Ensure income is positive
      if (editForm.type.value === 'Income' && amount < 0) {
        amount = Math.abs(amount)
      }
      
      // Process payment schedule if enabled
      let processedSchedule = null
      if (editForm.usePaymentSchedule && editForm.paymentSchedule.length > 0) {
        processedSchedule = editForm.paymentSchedule.map(phase => {
          let phaseAmount = parseFloat(phase.amount)
          
          // Apply sign correction to phase amounts
          if (isExpenseType && phaseAmount > 0) {
            phaseAmount = -phaseAmount
          }
          if (editForm.type.value === 'Income' && phaseAmount < 0) {
            phaseAmount = Math.abs(phaseAmount)
          }
          
          return {
            ...phase,
            amount: phaseAmount
          }
        })
      }
      
      const updates = {
        name: editForm.name,
        amount: amount,
        type: editForm.type.value,
        account: editForm.account.value,
        frequency: editForm.frequency,
        effectiveDate: editForm.frequency !== 'One-time' ? editForm.effectiveDate : undefined,
        impactDate: editForm.frequency === 'One-time' ? editForm.impactDate : undefined,
        endDate: editForm.endDate || null,
        description: editForm.description,
        paymentSchedule: processedSchedule
      }
      
      onUpdateRule(editingRule.id, updates)
      setShowEditModal(false)
      setEditingRule(null)
      setFlashMessages([{
        type: 'success',
        content: `Updated rule: ${editForm.name}`,
        dismissible: true,
        onDismiss: () => setFlashMessages([])
      }])
    }
  }

  // Payment Schedule Helpers
  const handleAddPhase = () => {
    const newPhase = {
      id: Date.now(),
      amount: '',
      startDate: '',
      endDate: '',
      description: ''
    }
    setEditForm(prev => ({
      ...prev,
      paymentSchedule: [...prev.paymentSchedule, newPhase]
    }))
  }

  const handleUpdatePhase = (phaseId, field, value) => {
    setEditForm(prev => ({
      ...prev,
      paymentSchedule: prev.paymentSchedule.map(phase =>
        phase.id === phaseId ? { ...phase, [field]: value } : phase
      )
    }))
  }

  const handleDeletePhase = (phaseId) => {
    setEditForm(prev => ({
      ...prev,
      paymentSchedule: prev.paymentSchedule.filter(phase => phase.id !== phaseId)
    }))
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
            newRules.push({
              include: true,
              ...rule
            })
            continue
          } catch (e) {
            // Not JSON, try CSV
          }
        }

        const parts = line.split(',').map(p => p.trim())
        if (parts.length >= 4) {
          let amount = parseFloat(parts[1])
          const type = parts[2] || 'Cash Expense'
          
          // Automatically ensure expenses are negative
          const isExpenseType = type !== 'Income'
          if (isExpenseType && amount > 0) {
            amount = -amount
          }
          // Ensure income is positive
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
        setFlashMessages([{
          type: 'success',
          content: `Successfully added ${newRules.length} rule(s)`,
          dismissible: true,
          onDismiss: () => setFlashMessages([])
        }])
      } else {
        setFlashMessages([{
          type: 'error',
          content: 'No valid rules found. Please check the format.',
          dismissible: true,
          onDismiss: () => setFlashMessages([])
        }])
      }
    } catch (error) {
      setFlashMessages([{
        type: 'error',
        content: `Error parsing rules: ${error.message}`,
        dismissible: true,
        onDismiss: () => setFlashMessages([])
      }])
    }
  }

  const columnDefinitions = [
    {
      id: 'include',
      header: 'Base?',
      cell: item => (
        <input 
          type="checkbox" 
          checked={item.include} 
          onChange={() => onToggleInclude(item.id)}
          style={{ cursor: 'pointer' }}
        />
      ),
      width: 70
    },
    {
      id: 'name',
      header: 'Name',
      cell: item => (
        <div style={{ maxWidth: '250px', overflow: 'visible' }}>
          <SpaceBetween size="xxs">
            <Box style={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>
              <span style={{ wordBreak: 'break-word' }}>{item.name}</span>{' '}
              {!item.scenarioId && <Badge color="green">Base</Badge>}
              {item.scenarioId && (
                <Badge color="blue">
                  {scenarios.find(s => s.id === item.scenarioId)?.name || 'Scenario'}
                </Badge>
              )}
              {item.paymentSchedule && item.paymentSchedule.length > 0 && (
                <Badge color="grey">
                  {item.paymentSchedule.length} Phases
                </Badge>
              )}
            </Box>
            {item.description && (
              <Box 
                variant="small" 
                color="text-body-secondary"
                style={{
                  wordWrap: 'break-word',
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  maxWidth: '100%'
                }}
              >
                "{item.description}"
              </Box>
            )}
          </SpaceBetween>
        </div>
      ),
      width: 250
    },
    {
      id: 'amount',
      header: 'Amount',
      cell: item => {
        // Check if rule has payment schedule
        if (item.paymentSchedule && item.paymentSchedule.length > 0) {
          // Calculate average of all phases
          const totalAmount = item.paymentSchedule.reduce((sum, phase) => {
            const phaseAmount = parseFloat(phase.amount) || 0
            return sum + phaseAmount
          }, 0)
          const avgAmount = totalAmount / item.paymentSchedule.length
          
          const isExpense = item.type && item.type.toLowerCase().includes('expense')
          const color = isExpense ? 'text-status-error' : (avgAmount > 0 ? 'text-status-success' : 'text-status-error')
          
          return (
            <SpaceBetween size="xxs">
              <Box color={color}>
                {formatCurrency(avgAmount)}
              </Box>
              <Box fontSize="body-s" color="text-body-secondary">
                Avg {item.paymentSchedule.length}ph
              </Box>
            </SpaceBetween>
          )
        }
        
        // Regular single amount
        const isExpense = item.type && item.type.toLowerCase().includes('expense')
        const color = isExpense ? 'text-status-error' : (item.amount > 0 ? 'text-status-success' : 'text-status-error')
        return (
          <Box color={color}>
            {formatCurrency(item.amount)}
          </Box>
        )
      },
      width: 100
    },
    {
      id: 'type',
      header: 'Type',
      cell: item => item.type,
      width: 140
    },
    {
      id: 'account',
      header: 'Acct',
      cell: item => item.type === 'Income' ? <Box color="text-body-secondary">-</Box> : <Badge>{item.account}</Badge>,
      width: 80
    },
    {
      id: 'frequency',
      header: 'Frequency',
      cell: item => item.frequency,
      width: 100
    },
    {
      id: 'effectiveDate',
      header: 'Start Date',
      cell: item => item.effectiveDate || (item.impactDate ? item.impactDate : '-'),
      width: 110
    },
    {
      id: 'endDate',
      header: 'End Date',
      cell: item => item.endDate || '-',
      width: 110
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: item => (
        <ButtonDropdown
          items={[
            { text: 'Edit Rule', id: 'edit', iconName: 'edit' },
            { text: 'Assign to Scenario', id: 'scenario', iconName: 'share' },
            { id: 'divider-1', itemType: 'divider' },
            { text: 'Delete', id: 'delete', iconName: 'remove' }
          ]}
          onItemClick={({ detail }) => {
            if (detail.id === 'delete') {
              onDeleteRule(item.id)
              setFlashMessages([{
                type: 'success',
                content: `Deleted rule: ${item.name}`,
                dismissible: true,
                onDismiss: () => setFlashMessages([])
              }])
            } else if (detail.id === 'edit') {
              handleEditRule(item)
            } else if (detail.id === 'scenario') {
              const currentScenario = item.scenarioId 
                ? scenarios.find(s => s.id === item.scenarioId)
                : null
              setEditingRuleForScenario(item)
              setSelectedScenario(currentScenario 
                ? { label: currentScenario.name, value: currentScenario.id }
                : null
              )
              setShowScenarioModal(true)
            }
          }}
          variant="icon"
          ariaLabel="Actions"
          expandToViewport
        />
      ),
      width: 80
    }
  ]

  return (
    <>
      <Flashbar items={flashMessages} />
      <Table
        columnDefinitions={columnDefinitions}
        items={filteredRules}
        variant="full-page"
        stickyHeader
        stripedRows
        header={
          <Header
            variant="h1"
            description={`Viewing: ${viewingScenario.label}`}
            counter={`(${filteredRules.length}/${rules.length})`}
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button onClick={() => setShowBatchModal(true)} iconName="upload">
                  Batch Upload
                </Button>
                <Button onClick={onAddRule}>Export</Button>
                <Button 
                  variant="primary" 
                  iconName="add-plus" 
                  onClick={() => onAddRule(viewingScenario.value !== 'base' ? viewingScenario.value : null)}
                >
                  Add New Rule
                </Button>
              </SpaceBetween>
            }
          >
            Scenarios & Rules
          </Header>
        }
        filter={
          <SpaceBetween direction="vertical" size="s">
            <SpaceBetween direction="horizontal" size="xs">
              <Select
                selectedOption={viewingScenario}
                onChange={({ detail }) => setViewingScenario(detail.selectedOption)}
                options={scenarioOptions}
                placeholder="Select scenario"
              />
            </SpaceBetween>
            <SpaceBetween direction="horizontal" size="xs">
              <TextFilter
                filteringText={filteringText}
                filteringPlaceholder="Search rules..."
                filteringAriaLabel="Filter rules"
                onChange={({ detail }) => setFilteringText(detail.filteringText)}
              />
              <Select
                selectedOption={selectedType}
                onChange={({ detail }) => setSelectedType(detail.selectedOption)}
                options={typeOptions}
                placeholder="Filter by type"
              />
              <Select
                selectedOption={selectedAccount}
                onChange={({ detail }) => setSelectedAccount(detail.selectedOption)}
                options={accountOptions}
                placeholder="Filter by account"
              />
              {(filteringText || selectedType.value !== 'all' || selectedAccount.value !== 'all') && (
                <Button
                  onClick={() => {
                    setFilteringText('')
                    setSelectedType({ label: 'All Types', value: 'all' })
                    setSelectedAccount({ label: 'All Accounts', value: 'all' })
                  }}
                >
                  Clear filters
                </Button>
              )}
            </SpaceBetween>
          </SpaceBetween>
        }
        empty={
          <Box textAlign="center" color="inherit">
            <b>No recurring rules</b>
            <Box variant="p" color="inherit">
              No rules to display. Add a new rule to get started.
            </Box>
          </Box>
        }
      />

      {/* Edit Rule Modal */}
      <Modal
        visible={showEditModal}
        onDismiss={() => {
          setShowEditModal(false)
          setEditingRule(null)
        }}
        size="large"
        header="Edit Rule"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button 
                variant="link" 
                onClick={() => {
                  setShowEditModal(false)
                  setEditingRule(null)
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <SpaceBetween size="m">
          <FormField label="Rule Name" constraintText="Required">
            <Input
              value={editForm.name}
              onChange={({ detail }) => setEditForm(prev => ({ ...prev, name: detail.value }))}
              placeholder="e.g., Salary"
            />
          </FormField>

          {!editForm.usePaymentSchedule && (
            <FormField label="Amount" constraintText="Required. Use negative values for expenses">
              <Input
                value={editForm.amount}
                onChange={({ detail }) => setEditForm(prev => ({ ...prev, amount: detail.value }))}
                type="number"
                placeholder="Enter amount"
              />
            </FormField>
          )}

          <FormField label="Type" constraintText="Required">
            <Select
              selectedOption={editForm.type}
              onChange={({ detail }) => setEditForm(prev => ({ ...prev, type: detail.selectedOption }))}
              options={typeSelectOptions}
            />
          </FormField>

          {editForm.type.value !== 'Income' && (
            <FormField label="Account" constraintText="Required for expenses">
              <Select
                selectedOption={editForm.account}
                onChange={({ detail }) => setEditForm(prev => ({ ...prev, account: detail.selectedOption }))}
                options={accountSelectOptions}
              />
            </FormField>
          )}

          <FormField label="Frequency" constraintText="Required">
            <RadioGroup
              value={editForm.frequency}
              onChange={({ detail }) => setEditForm(prev => ({ ...prev, frequency: detail.value }))}
              items={[
                { value: 'One-time', label: 'One-time' },
                { value: 'Weekly', label: 'Weekly' },
                { value: 'Bi-weekly', label: 'Bi-weekly' },
                { value: 'Monthly', label: 'Monthly' }
              ]}
            />
          </FormField>

          {!editForm.usePaymentSchedule && (
            <>
              {editForm.frequency === 'One-time' ? (
                <FormField label="Impact Date" constraintText="Required for one-time entries">
                  <DatePicker
                    value={editForm.impactDate}
                    onChange={({ detail }) => setEditForm(prev => ({ ...prev, impactDate: detail.value }))}
                    placeholder="YYYY/MM/DD"
                  />
                </FormField>
              ) : (
                <FormField label="Effective Date" constraintText="Required for recurring entries">
                  <DatePicker
                    value={editForm.effectiveDate}
                    onChange={({ detail }) => setEditForm(prev => ({ ...prev, effectiveDate: detail.value }))}
                    placeholder="YYYY/MM/DD"
                  />
                </FormField>
              )}

              <FormField label="End Date" constraintText="Optional">
                <DatePicker
                  value={editForm.endDate}
                  onChange={({ detail }) => setEditForm(prev => ({ ...prev, endDate: detail.value }))}
                  placeholder="YYYY/MM/DD"
                />
              </FormField>
            </>
          )}

          <FormField label="Description" constraintText="Optional">
            <Textarea
              value={editForm.description}
              onChange={({ detail }) => setEditForm(prev => ({ ...prev, description: detail.value }))}
              placeholder="Add notes about this rule..."
              rows={3}
            />
          </FormField>

          {editForm.frequency !== 'One-time' && (
            <>
              <Box margin={{ top: 'l', bottom: 's' }}>
                <Toggle
                  checked={editForm.usePaymentSchedule}
                  onChange={({ detail }) => setEditForm(prev => ({ ...prev, usePaymentSchedule: detail.checked }))}
                >
                  Use Payment Schedule (Multiple Phases)
                </Toggle>
                {editForm.usePaymentSchedule && (
                  <Box variant="p" color="text-body-secondary" fontSize="body-s" margin={{ top: 'xs' }}>
                    When enabled, the Amount and Date fields above are replaced by the payment phases below. Each phase defines a different amount for a specific time period.
                  </Box>
                )}
              </Box>

              {editForm.usePaymentSchedule && (
                <Container
                  header={
                    <Header
                      variant="h3"
                      actions={
                        <Button iconName="add-plus" onClick={handleAddPhase}>
                          Add Phase
                        </Button>
                      }
                    >
                      Payment Phases
                    </Header>
                  }
                >
                  <SpaceBetween size="m">
                    <Box variant="p" color="text-body-secondary">
                      Define different payment amounts for different time periods. Each phase will automatically apply during its date range.
                    </Box>

                    {editForm.paymentSchedule.length === 0 ? (
                      <Box textAlign="center" padding="l" color="text-body-secondary">
                        No phases defined. Click "Add Phase" to create your first payment phase.
                      </Box>
                    ) : (
                      editForm.paymentSchedule.map((phase, index) => (
                        <Container key={phase.id}>
                          <SpaceBetween size="s">
                            <Box variant="h4">Phase {index + 1}</Box>
                            <ColumnLayout columns={2}>
                              <FormField label="Amount" constraintText="Payment amount for this phase">
                                <Input
                                  value={phase.amount}
                                  onChange={({ detail }) => handleUpdatePhase(phase.id, 'amount', detail.value)}
                                  type="number"
                                  placeholder="e.g., 1500"
                                />
                              </FormField>
                              <FormField label="Description" constraintText="Optional">
                                <Input
                                  value={phase.description}
                                  onChange={({ detail }) => handleUpdatePhase(phase.id, 'description', detail.value)}
                                  placeholder="e.g., Initial payment"
                                />
                              </FormField>
                            </ColumnLayout>
                            <ColumnLayout columns={2}>
                              <FormField label="Start Date" constraintText="When this phase begins">
                                <DatePicker
                                  value={phase.startDate}
                                  onChange={({ detail }) => handleUpdatePhase(phase.id, 'startDate', detail.value)}
                                  placeholder="YYYY/MM/DD"
                                />
                              </FormField>
                              <FormField label="End Date" constraintText="Leave blank for ongoing">
                                <DatePicker
                                  value={phase.endDate}
                                  onChange={({ detail }) => handleUpdatePhase(phase.id, 'endDate', detail.value)}
                                  placeholder="YYYY/MM/DD"
                                />
                              </FormField>
                            </ColumnLayout>
                            <Box float="right">
                              <Button
                                iconName="remove"
                                onClick={() => handleDeletePhase(phase.id)}
                              >
                                Delete Phase
                              </Button>
                            </Box>
                          </SpaceBetween>
                        </Container>
                      ))
                    )}
                  </SpaceBetween>
                </Container>
              )}
            </>
          )}
        </SpaceBetween>
      </Modal>

      {/* Assign to Scenario Modal */}
      <Modal
        visible={showScenarioModal}
        onDismiss={() => {
          setShowScenarioModal(false)
          setEditingRuleForScenario(null)
          setSelectedScenario(null)
        }}
        header="Assign Rule to Scenario"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button 
                variant="link" 
                onClick={() => {
                  setShowScenarioModal(false)
                  setEditingRuleForScenario(null)
                  setSelectedScenario(null)
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={() => {
                  if (editingRuleForScenario) {
                    onUpdateRule(editingRuleForScenario.id, { 
                      scenarioId: selectedScenario?.value || null,
                      isDraft: selectedScenario?.value ? true : false
                    })
                    setShowScenarioModal(false)
                    setEditingRuleForScenario(null)
                    setSelectedScenario(null)
                    setFlashMessages([{
                      type: 'success',
                      content: selectedScenario 
                        ? `Assigned "${editingRuleForScenario.name}" to ${selectedScenario.label}` 
                        : `Removed scenario assignment from "${editingRuleForScenario.name}"`,
                      dismissible: true,
                      onDismiss: () => setFlashMessages([])
                    }])
                  }
                }}
              >
                Save
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <SpaceBetween size="m">
          <Box variant="p">
            <strong>Base Scenario Rules:</strong> Rules without scenario assignment are included in all scenarios by default.
          </Box>
          <Box variant="p">
            <strong>Scenario-Specific Rules:</strong> Assign a rule to a scenario to add it ONLY to that scenario (e.g., car payment for "Car Purchase" scenario).
          </Box>
          <FormField label="Assign to Scenario" constraintText="Select a scenario to make this rule scenario-specific">
            <Select
              selectedOption={selectedScenario}
              onChange={({ detail }) => setSelectedScenario(detail.selectedOption)}
              options={[
                { label: 'None (Base Scenario - included in all scenarios)', value: null },
                ...scenarios
                  .filter(s => !s.isBaseline)
                  .map(s => ({ label: s.name, value: s.id }))
              ]}
              placeholder="Select scenario..."
            />
          </FormField>
          <Box variant="p" color="text-body-secondary" fontSize="body-s">
            <strong>Note:</strong> To exclude a base scenario rule from a specific scenario, keep it in "Base Scenario" and use the "Exclude from Scenario" action instead (coming soon).
          </Box>
        </SpaceBetween>
      </Modal>

      {/* Batch Upload Modal */}
      <Modal
        visible={showBatchModal}
        onDismiss={() => setShowBatchModal(false)}
        header="Batch Upload Rules"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setShowBatchModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleBatchUpload}>
                Upload Rules
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <SpaceBetween size="m">
          <Box variant="p">
            Paste your rules in CSV or JSON format. Each line should contain:
          </Box>
          <Box variant="p" color="text-body-secondary">
            <strong>CSV Format:</strong> Name, Amount, Type, Account, Frequency, Effective Date, End Date, Description
          </Box>
          <Box variant="p" color="text-body-secondary">
            <strong>Example:</strong><br />
            Salary, 5000, Income, BOA, Monthly, 2025-01-01<br />
            Rent, -2000, Cash Expense, BOA, Monthly, 2025-01-01
          </Box>
          <Box variant="p" color="text-body-secondary">
            <strong>JSON Format:</strong> One JSON object per line with fields: name, amount, type, account, frequency, effectiveDate
          </Box>
          <Textarea
            value={batchText}
            onChange={({ detail }) => setBatchText(detail.value)}
            placeholder="Paste rules here..."
            rows={10}
          />
        </SpaceBetween>
      </Modal>
    </>
  )
}
