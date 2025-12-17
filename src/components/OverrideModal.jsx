import { useState, useEffect } from 'react'
import { Modal, Stack, TextInput, Select, Button, Alert, Text, Group } from '@mantine/core'

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
    { value: 'One-time', label: 'One-time' },
    { value: 'Weekly', label: 'Weekly' },
    { value: 'Bi-weekly', label: 'Bi-weekly' },
    { value: 'Monthly', label: 'Monthly' }
  ]

  useEffect(() => {
    if (visible && rule) {
      if (existingOverride) {
        setAmount(existingOverride.overrides.amount?.toString() || rule.amount?.toString() || '')
        setEffectiveDate(existingOverride.overrides.effectiveDate || rule.effectiveDate || '')
        setEndDate(existingOverride.overrides.endDate || rule.endDate || '')
        setFrequency(existingOverride.overrides.frequency || rule.frequency || null)
      } else {
        setAmount(rule.amount?.toString() || '')
        setEffectiveDate(rule.effectiveDate || '')
        setEndDate(rule.endDate || '')
        setFrequency(rule.frequency || null)
      }
    }
  }, [visible, rule, existingOverride])

  const handleSave = () => {
    const overrideValues = {}
    
    if (amount !== rule.amount?.toString()) {
      overrideValues.amount = parseFloat(amount)
    }
    if (effectiveDate !== rule.effectiveDate) {
      overrideValues.effectiveDate = effectiveDate
    }
    if (endDate !== rule.endDate) {
      overrideValues.endDate = endDate
    }
    if (frequency !== rule.frequency) {
      overrideValues.frequency = frequency
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
      opened={visible}
      onClose={onDismiss}
      title={existingOverride ? `Edit Override: ${rule.name}` : `Override Rule: ${rule.name}`}
    >
      <Stack gap="md">
        <Alert color="blue">
          Creating an override will change this rule's values only in the "{scenario?.name}" scenario. 
          The base scenario and other scenarios will not be affected.
        </Alert>

        <Text fw={700}>Original Values</Text>
        <Text size="sm" c="dimmed">
          Amount: ${rule.amount?.toLocaleString() || 0} | 
          Frequency: {rule.frequency} | 
          Effective: {rule.effectiveDate || 'N/A'}
        </Text>

        <Text fw={700}>Override Values</Text>

        <TextInput
          label="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="number"
          placeholder="Enter amount"
        />

        <Select
          label="Frequency"
          value={frequency}
          onChange={setFrequency}
          data={frequencyOptions}
          placeholder="Select frequency"
        />

        {frequency !== 'One-time' && (
          <TextInput
            label="Effective Date"
            type="date"
            value={effectiveDate}
            onChange={(e) => setEffectiveDate(e.target.value)}
          />
        )}

        <TextInput
          label="End Date (Optional)"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        {existingOverride && (
          <Alert color="yellow">
            Removing this override will revert the rule to its base values in this scenario.
          </Alert>
        )}

        <Group justify="flex-end">
          <Button variant="subtle" onClick={onDismiss}>Cancel</Button>
          {existingOverride && (
            <Button color="red" variant="light" onClick={handleRemove}>Remove Override</Button>
          )}
          <Button onClick={handleSave}>
            {existingOverride ? 'Update Override' : 'Create Override'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
