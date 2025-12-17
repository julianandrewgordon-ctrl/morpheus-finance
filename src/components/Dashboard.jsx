import { useState, useMemo } from 'react'
import { Paper, Title, Text, Group, Button, Stack, SimpleGrid, Modal, TextInput, Textarea, Alert, Box, Notification } from '@mantine/core'
import { DateInput } from '@mantine/dates'
import BalanceChart from './BalanceChart'
import CashFlowTable from './CashFlowTable'
import { calculateCashFlowTable, calculateSummary } from '../utils/cashFlowCalculator'
import { applyOverridesToRule } from '../utils/ruleOverrides'

export default function Dashboard({ 
  data, 
  onQuickAdd, 
  cashFlowStartDate, 
  onStartDateChange,
  onAddScenario,
  onUpdateScenario,
  onDeleteScenario,
  onUpdateStartingBalance,
  onAddHistoricalCashFlow,
  onBatchAddHistoricalCashFlows,
  onDeleteHistoricalCashFlow,
  hideEmptyRows,
  onHideEmptyRowsChange
}) {
  const [selectedScenario, setSelectedScenario] = useState('base')
  const [showScenarioModal, setShowScenarioModal] = useState(false)
  const [showNewScenarioModal, setShowNewScenarioModal] = useState(false)
  const [showStartingBalanceModal, setShowStartingBalanceModal] = useState(false)
  const [showHistoricalModal, setShowHistoricalModal] = useState(false)
  const [editingScenario, setEditingScenario] = useState(null)
  const [scenarioName, setScenarioName] = useState('')
  const [newScenarioName, setNewScenarioName] = useState('')
  const [startingBalance, setStartingBalance] = useState(data.startingBalance?.toString() || '15000')
  const [startingBalanceDate, setStartingBalanceDate] = useState(data.startingBalanceDate ? new Date(data.startingBalanceDate) : new Date())
  const [historicalText, setHistoricalText] = useState('')
  const [notification, setNotification] = useState(null)
  const { scenarios } = data

  const cashFlowData = useMemo(() => {
    const endDate = new Date(cashFlowStartDate)
    endDate.setFullYear(endDate.getFullYear() + 1)
    
    return calculateCashFlowTable(
      data.recurringRules || [],
      data.startingBalance || 0,
      data.startingBalanceDate || cashFlowStartDate,
      cashFlowStartDate,
      endDate.toISOString().split('T')[0],
      data.historicalCashFlows || []
    )
  }, [data.recurringRules, data.startingBalance, data.startingBalanceDate, cashFlowStartDate, data.historicalCashFlows])

  const scenarioCashFlows = useMemo(() => {
    const endDate = new Date(cashFlowStartDate)
    endDate.setFullYear(endDate.getFullYear() + 1)
    
    const flows = {}
    
    flows['base'] = calculateCashFlowTable(
      (data.recurringRules || []).filter(rule => {
        const hasNoScenarios = !rule.scenarioIds || rule.scenarioIds.length === 0
        return hasNoScenarios && rule.include
      }),
      data.startingBalance || 0,
      data.startingBalanceDate || cashFlowStartDate,
      cashFlowStartDate,
      endDate.toISOString().split('T')[0],
      data.historicalCashFlows || []
    )
    
    scenarios.forEach(scenario => {
      if (!scenario.isBaseline) {
        let baseRules = (data.recurringRules || []).filter(rule => {
          const hasNoScenarios = !rule.scenarioIds || rule.scenarioIds.length === 0
          return hasNoScenarios && rule.include && !rule.excludedFromScenarios?.includes(scenario.id)
        })
        
        if (data.ruleOverrides && data.ruleOverrides.length > 0) {
          baseRules = baseRules.map(rule => 
            applyOverridesToRule(rule, data.ruleOverrides, scenario.id)
          )
        }
        
        const scenarioRules = (data.recurringRules || []).filter(rule => {
          const isInScenario = rule.scenarioIds && rule.scenarioIds.includes(scenario.id)
          return isInScenario && rule.include
        })
        
        flows[scenario.id] = calculateCashFlowTable(
          [...baseRules, ...scenarioRules],
          data.startingBalance || 0,
          data.startingBalanceDate || cashFlowStartDate,
          cashFlowStartDate,
          endDate.toISOString().split('T')[0],
          data.historicalCashFlows || []
        )
      }
    })
    
    return flows
  }, [data.recurringRules, data.startingBalance, data.startingBalanceDate, cashFlowStartDate, data.historicalCashFlows, scenarios])

  const summary = useMemo(() => {
    const scenarioData = selectedScenario === 'base' 
      ? scenarioCashFlows['base'] 
      : (scenarioCashFlows[selectedScenario] || cashFlowData)
    return calculateSummary(scenarioData || cashFlowData, data.startingBalance || 0)
  }, [cashFlowData, data.startingBalance, selectedScenario, scenarioCashFlows])

  const showNotification = (type, message) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleCreateNewScenario = () => {
    if (newScenarioName.trim()) {
      const newScenario = {
        name: newScenarioName.trim(),
        active: false,
        isBaseline: false
      }
      onAddScenario(newScenario)
      setShowNewScenarioModal(false)
      setNewScenarioName('')
      showNotification('success', `Created new scenario: ${newScenarioName.trim()}`)
    }
  }

  const handleEditScenario = (scenario) => {
    setEditingScenario(scenario)
    setScenarioName(scenario.name)
    setShowScenarioModal(true)
  }

  const handleSaveScenario = () => {
    if (editingScenario && scenarioName.trim()) {
      onUpdateScenario(editingScenario.id, { name: scenarioName.trim() })
      setShowScenarioModal(false)
      setEditingScenario(null)
      setScenarioName('')
      showNotification('success', 'Scenario name updated successfully')
    }
  }

  const handleDeleteScenario = () => {
    if (editingScenario) {
      onDeleteScenario(editingScenario.id)
      setShowScenarioModal(false)
      setEditingScenario(null)
      setScenarioName('')
      showNotification('success', `Deleted scenario: ${editingScenario.name}`)
    }
  }

  const handleSaveStartingBalance = () => {
    const balance = parseFloat(startingBalance)
    if (!isNaN(balance) && startingBalanceDate) {
      const dateStr = startingBalanceDate.toISOString().split('T')[0]
      onUpdateStartingBalance(balance, dateStr)
      setShowStartingBalanceModal(false)
      showNotification('success', `Starting balance set to $${balance.toLocaleString()} as of ${dateStr}`)
    }
  }

  const handleBatchHistoricalUpload = () => {
    try {
      const lines = historicalText.trim().split('\n')
      const newCashFlows = []

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        if (line.startsWith('{')) {
          try {
            const cf = JSON.parse(line)
            newCashFlows.push(cf)
            continue
          } catch (e) {}
        }

        const parts = line.split(',').map(p => p.trim())
        if (parts.length >= 3) {
          newCashFlows.push({
            date: parts[0],
            description: parts[1],
            amount: parseFloat(parts[2]),
            category: parts[3] || 'Other',
            account: parts[4] || 'BOA'
          })
        }
      }

      if (newCashFlows.length > 0) {
        onBatchAddHistoricalCashFlows(newCashFlows)
        setShowHistoricalModal(false)
        setHistoricalText('')
        showNotification('success', `Successfully added ${newCashFlows.length} historical cash flow(s)`)
      } else {
        showNotification('error', 'No valid cash flows found. Please check the format.')
      }
    } catch (error) {
      showNotification('error', `Error parsing cash flows: ${error.message}`)
    }
  }

  const formatCurrency = (val) => `$${val.toLocaleString()}`

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
          <Title order={1}>Dashboard</Title>
          <Group>
            <Button variant="light" onClick={() => setShowStartingBalanceModal(true)}>
              Set Starting Balance
            </Button>
            <Button variant="light" onClick={() => setShowHistoricalModal(true)}>
              Import Historical Data
            </Button>
          </Group>
        </Group>

        <Paper p="md" withBorder>
          <Text size="sm" c="dimmed">Starting Balance</Text>
          <Title order={2}>{formatCurrency(data.startingBalance || 0)}</Title>
          <Text size="sm" c="dimmed">As of {data.startingBalanceDate || 'Not set'}</Text>
        </Paper>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
          <Paper p="md" withBorder>
            <Text size="sm" c="dimmed">Current Balance</Text>
            <Title order={2} c="green">{formatCurrency(summary.currentBalance)}</Title>
            <Text size="xs" c="green">↑ +{formatCurrency(summary.balanceChange)}</Text>
          </Paper>
          <Paper p="md" withBorder>
            <Text size="sm" c="dimmed">Projected (EOY)</Text>
            <Title order={2}>{formatCurrency(summary.projectedEOY)}</Title>
          </Paper>
          <Paper p="md" withBorder>
            <Text size="sm" c="dimmed">Total Income</Text>
            <Title order={2} c="green">{formatCurrency(summary.totalIncome)}</Title>
          </Paper>
          <Paper p="md" withBorder>
            <Text size="sm" c="dimmed">Total Expenses</Text>
            <Title order={2} c="red">{formatCurrency(summary.totalExpenses)}</Title>
          </Paper>
        </SimpleGrid>

        <Paper p="md" withBorder>
          <Group justify="space-between" mb="md">
            <Title order={3}>Scenario Selector</Title>
            <Button onClick={() => setShowNewScenarioModal(true)}>New Scenario</Button>
          </Group>
          <Group>
            <Button
              variant={selectedScenario === 'base' ? 'filled' : 'light'}
              onClick={() => setSelectedScenario('base')}
            >
              {selectedScenario === 'base' ? '⦿' : '○'} Base Scenario
            </Button>
            {scenarios.filter(s => !s.isBaseline).map(scenario => (
              <Group key={scenario.id} gap="xs">
                <Button
                  variant={selectedScenario === scenario.id ? 'filled' : 'light'}
                  onClick={() => setSelectedScenario(scenario.id)}
                >
                  {selectedScenario === scenario.id ? '⦿' : '○'} {scenario.name}
                </Button>
                <Button variant="subtle" size="xs" onClick={() => handleEditScenario(scenario)}>
                  ✎
                </Button>
              </Group>
            ))}
          </Group>
        </Paper>

        <Paper p="md" withBorder>
          <Group justify="space-between" mb="md">
            <Title order={3}>Running Balance Chart</Title>
            <Group>
              <Text size="sm" c="dimmed">Start Date:</Text>
              <DateInput
                value={cashFlowStartDate ? new Date(cashFlowStartDate) : new Date()}
                onChange={(date) => {
                  if (date && onStartDateChange) {
                    onStartDateChange(date.toISOString().split('T')[0])
                  }
                }}
                size="sm"
                style={{ width: 150 }}
              />
            </Group>
          </Group>
          <BalanceChart 
            cashFlowData={cashFlowData} 
            startingBalanceDate={cashFlowStartDate}
            scenarioCashFlows={scenarioCashFlows}
            scenarios={scenarios}
            selectedScenario={selectedScenario}
          />
        </Paper>

        <Paper p="md" withBorder>
          <Group justify="space-between" mb="md">
            <Title order={3}>Cash Flow Table</Title>
            <Group>
              <TextInput
                type="date"
                value={cashFlowStartDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                label="Start Date"
                size="xs"
              />
              <Button onClick={onQuickAdd}>Quick Add Transaction</Button>
            </Group>
          </Group>
          <CashFlowTable 
            data={selectedScenario === 'base' ? scenarioCashFlows['base'] : (scenarioCashFlows[selectedScenario] || cashFlowData)}
            startDate={cashFlowStartDate}
            hideEmptyRows={hideEmptyRows}
            onHideEmptyRowsChange={onHideEmptyRowsChange}
          />
          <Text size="xs" c="dimmed" mt="sm">⚠ = Draft/Scenario Entry | 🔒 = Balance Override Active</Text>
        </Paper>
      </Stack>

      <Modal opened={showScenarioModal} onClose={() => { setShowScenarioModal(false); setEditingScenario(null); }} title="Edit Scenario">
        <Stack>
          <TextInput
            label="Scenario Name"
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
            placeholder="Enter scenario name"
          />
          <Text size="sm" c="dimmed">
            <strong>Note:</strong> Deleting this scenario will remove it and unassign all rules that were assigned to it.
          </Text>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => { setShowScenarioModal(false); setEditingScenario(null); }}>Cancel</Button>
            <Button color="red" onClick={handleDeleteScenario}>Delete Scenario</Button>
            <Button onClick={handleSaveScenario}>Save Changes</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={showStartingBalanceModal} onClose={() => setShowStartingBalanceModal(false)} title="Set Starting Balance">
        <Stack>
          <TextInput
            label="Starting Balance"
            description="Enter the balance amount"
            value={startingBalance}
            onChange={(e) => setStartingBalance(e.target.value)}
            type="number"
            placeholder="15000"
          />
          <TextInput
            label="As of Date"
            type="date"
            value={startingBalanceDate ? startingBalanceDate.toISOString().split('T')[0] : ''}
            onChange={(e) => setStartingBalanceDate(new Date(e.target.value))}
          />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => setShowStartingBalanceModal(false)}>Cancel</Button>
            <Button onClick={handleSaveStartingBalance}>Save</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={showNewScenarioModal} onClose={() => { setShowNewScenarioModal(false); setNewScenarioName(''); }} title="Create New Scenario">
        <Stack>
          <TextInput
            label="Scenario Name"
            description="Enter a descriptive name for this scenario"
            value={newScenarioName}
            onChange={(e) => setNewScenarioName(e.target.value)}
            placeholder="e.g., Car Purchase, Home Renovation"
          />
          <Text size="sm" c="dimmed">
            <strong>What are scenarios?</strong><br />
            Scenarios let you model "what-if" situations by building on top of your base scenario.
          </Text>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => { setShowNewScenarioModal(false); setNewScenarioName(''); }}>Cancel</Button>
            <Button onClick={handleCreateNewScenario}>Create Scenario</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={showHistoricalModal} onClose={() => setShowHistoricalModal(false)} title="Import Historical Cash Flows" size="lg">
        <Stack>
          <Text>Paste your historical cash flows in CSV format:</Text>
          <Text size="xs" c="dimmed">
            <strong>Format:</strong> Date, Description, Amount, Category, Account<br />
            <strong>Example:</strong><br />
            2025-01-15, Paycheck, 5000, Income, BOA<br />
            2025-01-20, Grocery Store, -150, Variable Expense, PNC
          </Text>
          <Textarea
            value={historicalText}
            onChange={(e) => setHistoricalText(e.target.value)}
            placeholder="Paste your data here..."
            minRows={8}
          />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => setShowHistoricalModal(false)}>Cancel</Button>
            <Button onClick={handleBatchHistoricalUpload}>Import</Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}
