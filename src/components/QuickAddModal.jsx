import { useState } from 'react'
import Modal from '@cloudscape-design/components/modal'
import Box from '@cloudscape-design/components/box'
import SpaceBetween from '@cloudscape-design/components/space-between'
import Button from '@cloudscape-design/components/button'
import FormField from '@cloudscape-design/components/form-field'
import Input from '@cloudscape-design/components/input'
import Select from '@cloudscape-design/components/select'
import RadioGroup from '@cloudscape-design/components/radio-group'
import DatePicker from '@cloudscape-design/components/date-picker'
import Textarea from '@cloudscape-design/components/textarea'
import Checkbox from '@cloudscape-design/components/checkbox'

export default function QuickAddModal({ onClose, onAdd, scenarioId, scenarios }) {
  const scenarioName = scenarioId 
    ? scenarios.find(s => s.id === scenarioId)?.name 
    : 'Base Scenario'
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    type: { label: 'Income', value: 'Income' },
    account: { label: 'BOA', value: 'BOA' },
    frequency: 'one-time',
    impactDate: '',
    endDate: '',
    description: '',
    isDraft: false,
    scenario: { label: 'Gift Card A', value: 'giftcard' }
  })

  const handleSubmit = () => {
    let amount = parseFloat(formData.amount)
    
    // Automatically ensure expenses are negative
    const isExpenseType = formData.type.value !== 'Income'
    if (isExpenseType && amount > 0) {
      amount = -amount
    }
    // Ensure income is positive
    if (formData.type.value === 'Income' && amount < 0) {
      amount = Math.abs(amount)
    }
    
    onAdd({
      name: formData.name,
      amount: amount,
      type: formData.type.value,
      account: formData.account.value,
      frequency: formData.frequency === 'one-time' ? 'One-time' : formData.frequency,
      impactDate: formData.frequency === 'one-time' ? formData.impactDate : undefined,
      effectiveDate: formData.frequency !== 'one-time' ? formData.impactDate : undefined,
      endDate: formData.endDate || null,
      description: formData.description,
      isDraft: formData.isDraft,
      scenarioId: formData.isDraft ? formData.scenario.value : null,
      include: true
    })
  }

  const typeOptions = [
    { label: 'Income', value: 'Income' },
    { label: 'Cash Expense', value: 'Cash Expense' },
    { label: 'Variable Expense', value: 'Variable Expense' },
    { label: 'Renovation/Moving Costs', value: 'Renovation/Moving Costs' },
    { label: 'One Time Expenses', value: 'One Time Expenses' }
  ]

  const accountOptions = [
    { label: 'BOA', value: 'BOA' },
    { label: 'PNC', value: 'PNC' },
    { label: 'Other', value: 'Other' }
  ]

  const scenarioOptions = [
    { label: 'Gift Card A', value: 'giftcard' },
    { label: 'Car Purchase', value: 'car' }
  ]

  return (
    <Modal
      onDismiss={onClose}
      visible={true}
      header={`Add New Rule${scenarioId ? ` to ${scenarioName}` : ' to Base Scenario'}`}
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              Add Transaction
            </Button>
          </SpaceBetween>
        </Box>
      }
    >
      <SpaceBetween size="m">
        <FormField label="Transaction Name" constraintText="Required">
          <Input
            value={formData.name}
            onChange={({ detail }) => setFormData(prev => ({ ...prev, name: detail.value }))}
            placeholder="e.g., Holiday Gift"
          />
        </FormField>

        <FormField label="Amount" constraintText="Enter positive values. Sign will be applied automatically based on type.">
          <Input
            value={formData.amount}
            onChange={({ detail }) => setFormData(prev => ({ ...prev, amount: detail.value }))}
            type="number"
            placeholder="Enter amount (e.g., 100)"
          />
        </FormField>

        <FormField label="Type" constraintText="Required">
          <Select
            selectedOption={formData.type}
            onChange={({ detail }) => setFormData(prev => ({ ...prev, type: detail.selectedOption }))}
            options={typeOptions}
          />
        </FormField>

        {formData.type.value !== 'Income' && (
          <FormField label="Account" constraintText="Required for expenses">
            <Select
              selectedOption={formData.account}
              onChange={({ detail }) => setFormData(prev => ({ ...prev, account: detail.selectedOption }))}
              options={accountOptions}
            />
          </FormField>
        )}

        <FormField label="Frequency" constraintText="Required">
          <RadioGroup
            value={formData.frequency}
            onChange={({ detail }) => setFormData(prev => ({ ...prev, frequency: detail.value }))}
            items={[
              { value: 'one-time', label: 'One-time' },
              { value: 'Weekly', label: 'Weekly' },
              { value: 'Bi-weekly', label: 'Bi-weekly' },
              { value: 'Monthly', label: 'Monthly' }
            ]}
          />
        </FormField>

        {formData.frequency === 'one-time' && (
          <FormField label="Impact Date" constraintText="Required for one-time entries">
            <DatePicker
              value={formData.impactDate}
              onChange={({ detail }) => setFormData(prev => ({ ...prev, impactDate: detail.value }))}
              placeholder="YYYY/MM/DD"
            />
          </FormField>
        )}

        <FormField label="End Date" constraintText="Optional">
          <DatePicker
            value={formData.endDate}
            onChange={({ detail }) => setFormData(prev => ({ ...prev, endDate: detail.value }))}
            placeholder="YYYY/MM/DD"
          />
        </FormField>

        <FormField label="Description" constraintText="Optional">
          <Textarea
            value={formData.description}
            onChange={({ detail }) => setFormData(prev => ({ ...prev, description: detail.value }))}
            placeholder="Add context or notes..."
            rows={3}
          />
        </FormField>

        <FormField>
          <Checkbox
            checked={formData.isDraft}
            onChange={({ detail }) => setFormData(prev => ({ ...prev, isDraft: detail.checked }))}
          >
            Add as Draft/Scenario Entry
          </Checkbox>
        </FormField>

        {formData.isDraft && (
          <FormField label="Scenario">
            <Select
              selectedOption={formData.scenario}
              onChange={({ detail }) => setFormData(prev => ({ ...prev, scenario: detail.selectedOption }))}
              options={scenarioOptions}
            />
          </FormField>
        )}

        <Box variant="small" color="text-body-secondary">
          Tip: Press Enter to submit, Esc to cancel
        </Box>
      </SpaceBetween>
    </Modal>
  )
}
