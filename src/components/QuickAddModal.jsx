import { useState } from 'react'
import { Modal, Stack, TextInput, Select, Radio, Group, Button, Textarea, Checkbox, Text } from '@mantine/core'

export default function QuickAddModal({ onClose, onAdd, scenarioId, scenarios }) {
  const scenarioName = scenarioId 
    ? scenarios.find(s => s.id === scenarioId)?.name 
    : 'Base Scenario'
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    type: 'Income',
    account: 'BOA',
    frequency: 'one-time',
    impactDate: '',
    endDate: '',
    description: '',
    isDraft: false,
    scenario: 'giftcard'
  })

  const handleSubmit = () => {
    let amount = parseFloat(formData.amount)
    
    const isExpenseType = formData.type !== 'Income'
    if (isExpenseType && amount > 0) {
      amount = -amount
    }
    if (formData.type === 'Income' && amount < 0) {
      amount = Math.abs(amount)
    }
    
    onAdd({
      name: formData.name,
      amount: amount,
      type: formData.type,
      account: formData.account,
      frequency: formData.frequency === 'one-time' ? 'One-time' : formData.frequency,
      impactDate: formData.frequency === 'one-time' ? formData.impactDate : undefined,
      effectiveDate: formData.frequency !== 'one-time' ? formData.impactDate : undefined,
      endDate: formData.endDate || null,
      description: formData.description,
      isDraft: formData.isDraft,
      scenarioIds: formData.isDraft && formData.scenario ? [formData.scenario] : [],
      include: true
    })
  }

  const typeOptions = [
    { value: 'Income', label: 'Income' },
    { value: 'Cash Expense', label: 'Cash Expense' },
    { value: 'Variable Expense', label: 'Variable Expense' },
    { value: 'Renovation/Moving Costs', label: 'Renovation/Moving Costs' },
    { value: 'One Time Expenses', label: 'One Time Expenses' }
  ]

  const accountOptions = [
    { value: 'BOA', label: 'BOA' },
    { value: 'PNC', label: 'PNC' },
    { value: 'Other', label: 'Other' }
  ]

  const scenarioOptions = [
    { value: 'giftcard', label: 'Gift Card A' },
    { value: 'car', label: 'Car Purchase' }
  ]

  return (
    <Modal
      opened={true}
      onClose={onClose}
      title={`Add New Rule${scenarioId ? ` to ${scenarioName}` : ' to Base Scenario'}`}
    >
      <Stack gap="md">
        <TextInput
          label="Transaction Name"
          required
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., Holiday Gift"
        />

        <TextInput
          label="Amount"
          description="Enter positive values. Sign will be applied automatically based on type."
          value={formData.amount}
          onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
          type="number"
          placeholder="Enter amount (e.g., 100)"
        />

        <Select
          label="Type"
          required
          value={formData.type}
          onChange={(val) => setFormData(prev => ({ ...prev, type: val }))}
          data={typeOptions}
        />

        {formData.type !== 'Income' && (
          <Select
            label="Account"
            required
            value={formData.account}
            onChange={(val) => setFormData(prev => ({ ...prev, account: val }))}
            data={accountOptions}
          />
        )}

        <Radio.Group
          label="Frequency"
          required
          value={formData.frequency}
          onChange={(val) => setFormData(prev => ({ ...prev, frequency: val }))}
        >
          <Group mt="xs">
            <Radio value="one-time" label="One-time" />
            <Radio value="Weekly" label="Weekly" />
            <Radio value="Bi-weekly" label="Bi-weekly" />
            <Radio value="Monthly" label="Monthly" />
          </Group>
        </Radio.Group>

        {formData.frequency === 'one-time' && (
          <TextInput
            label="Impact Date"
            required
            type="date"
            value={formData.impactDate}
            onChange={(e) => setFormData(prev => ({ ...prev, impactDate: e.target.value }))}
          />
        )}

        <TextInput
          label="End Date"
          description="Optional"
          type="date"
          value={formData.endDate}
          onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
        />

        <Textarea
          label="Description"
          description="Optional"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Add context or notes..."
          minRows={3}
        />

        <Checkbox
          checked={formData.isDraft}
          onChange={(e) => setFormData(prev => ({ ...prev, isDraft: e.target.checked }))}
          label="Add as Draft/Scenario Entry"
        />

        {formData.isDraft && (
          <Select
            label="Scenario"
            value={formData.scenario}
            onChange={(val) => setFormData(prev => ({ ...prev, scenario: val }))}
            data={scenarioOptions}
          />
        )}

        <Text size="xs" c="dimmed">Tip: Press Enter to submit, Esc to cancel</Text>

        <Group justify="flex-end">
          <Button variant="subtle" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Add Transaction</Button>
        </Group>
      </Stack>
    </Modal>
  )
}
