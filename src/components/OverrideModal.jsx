import { useState, useEffect } from 'react'
import Modal from '@cloudscape-design/components/modal'
import Box from '@cloudscape-design/components/box'
import SpaceBetween from '@cloudscape-design/components/space-between'
import Button from '@cloudscape-design/components/button'
import FormField from '@cloudscape-design/components/form-field'
import Input from '@cloudscape-design/components/input'
import Select from '@cloudscape-design/components/select'
import DatePicker from '@cloudscape-design/components/date-picker'
import Alert from '@cloudscape-design/components/alert'

export default function OverrideModal({ 
  visible, 
  onDismiss, 
  rule, 
  scenario,
  existingOverride,
  onSave,
  onRemove
}) {
  const [amount, setAmount] = useState('')
  const [effectiveDate, setEffectiveDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [frequency, setFrequency] = useState(null)

  const frequencyOptions = [
    { label: 'One-time', value: 'One-time' },
    { label: 'Weekly', value: 'Weekly' },
    { label: 'Bi-weekly', value: 'Bi-weekly' },
    { label: 'Monthly', value: 'Monthly' }
  ]

  useEffect(() => {
    if (visible && rule) {
      if (existingOverride) {
        // Load override values
        setAmount(existingOverride.overrides.amount?.toString() || rule.amount?.toString() || '')
        setEffectiveDate(existingOverride.overrides.effectiveDate || rule.effectiveDate || '')
        setEndDate(existingOverride.overrides.endDate || rule.endDate || '')
        setFrequency(frequencyOptions.find(f => f.value === (existingOverride.overrides.frequency || rule.frequency)) || null)
      } else {
        // Load base rule values
        setAmount(rule.amount?.toString() || '')
        setEffectiveDate(rule.effectiveDate || '')
        setEndDate(rule.endDate || '')
        setFrequency(frequencyOptions.find(f => f.value === rule.frequency) || null)
      }
    }
  }, [visible, rule, existingOverride])

  const handleSave = () => {
    const overrideValues = {}
    
    // Only include changed values
    if (amount !== rule.amount?.toString()) {
      overrideValues.amount = parseFloat(amount)
    }
    if (effectiveDate !== rule.effectiveDate) {
      overrideValues.effectiveDate = effectiveDate
    }
    if (endDate !== rule.endDate) {
      overrideValues.endDate = endDate
    }
    if (frequency?.value !== rule.frequency) {
      overrideValues.frequency = frequency?.value
    }

    onSave(overrideValues)
    onDismiss()
  }

  const handleRemove = () => {
    onRemove()
    onDismiss()
  }

  if (!rule) return null

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      header={existingOverride ? `Edit Override: ${rule.name}` : `Override Rule: ${rule.name}`}
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={onDismiss}>
              Cancel
            </Button>
            {existingOverride && (
              <Button onClick={handleRemove}>
                Remove Override
              </Button>
            )}
            <Button variant="primary" onClick={handleSave}>
              {existingOverride ? 'Update Override' : 'Create Override'}
            </Button>
          </SpaceBetween>
        </Box>
      }
    >
      <SpaceBetween size="m">
        <Alert type="info">
          Creating an override will change this rule's values only in the "{scenario?.name}" scenario. 
          The base scenario and other scenarios will not be affected.
        </Alert>

        <Box variant="h3">Original Values</Box>
        <Box variant="p" color="text-body-secondary">
          Amount: ${rule.amount?.toLocaleString() || 0} | 
          Frequency: {rule.frequency} | 
          Effective: {rule.effectiveDate || 'N/A'}
        </Box>

        <Box variant="h3">Override Values</Box>

        <FormField label="Amount">
          <Input
            value={amount}
            onChange={({ detail }) => setAmount(detail.value)}
            type="number"
            placeholder="Enter amount"
          />
        </FormField>

        <FormField label="Frequency">
          <Select
            selectedOption={frequency}
            onChange={({ detail }) => setFrequency(detail.selectedOption)}
            options={frequencyOptions}
            placeholder="Select frequency"
          />
        </FormField>

        {frequency?.value !== 'One-time' && (
          <FormField label="Effective Date">
            <DatePicker
              value={effectiveDate}
              onChange={({ detail }) => setEffectiveDate(detail.value)}
              placeholder="YYYY-MM-DD"
            />
          </FormField>
        )}

        <FormField label="End Date (Optional)">
          <DatePicker
            value={endDate}
            onChange={({ detail }) => setEndDate(detail.value)}
            placeholder="YYYY-MM-DD"
          />
        </FormField>

        {existingOverride && (
          <Alert type="warning">
            Removing this override will revert the rule to its base values in this scenario.
          </Alert>
        )}
      </SpaceBetween>
    </Modal>
  )
}
