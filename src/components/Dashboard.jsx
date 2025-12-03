import { useState, useMemo } from 'react'
import Container from '@cloudscape-design/components/container'
import Header from '@cloudscape-design/components/header'
import SpaceBetween from '@cloudscape-design/components/space-between'
import Box from '@cloudscape-design/components/box'
import Button from '@cloudscape-design/components/button'
import ColumnLayout from '@cloudscape-design/components/column-layout'
import FormField from '@cloudscape-design/components/form-field'
import DatePicker from '@cloudscape-design/components/date-picker'
import Input from '@cloudscape-design/components/input'
import Modal from '@cloudscape-design/components/modal'
import Textarea from '@cloudscape-design/components/textarea'
import Flashbar from '@cloudscape-design/components/flashbar'
import Select from '@cloudscape-design/components/select'
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
  const [startingBalanceDate, setStartingBalanceDate] = useState(data.startingBalanceDate || '2025-01-01')
  const [historicalText, setHistoricalText] = useState('')
  const [flashMessages, setFlashMessages] = useState([])
  const { scenarios } = data

  // Calculate cash flow table from rules
  const cashFlowData = useMemo(() => {
    const endDate = new Date(cashFlowStartDate)
    endDate.setFullYear(endDate.getFullYear() + 1) // 1 full year from start
    
    return calculateCashFlowTable(
      data.recurringRules || [],
      data.startingBalance || 0,
      data.startingBalanceDate || cashFlowStartDate,
      cashFlowStartDate,
      endDate.toISOString().split('T')[0],
      data.historicalCashFlows || []
    )
  }, [data.recurringRules, data.startingBalance, data.startingBalanceDate, cashFlowStartDate, data.historicalCashFlows])

  // Calculate cash flow for each scenario
  const scenarioCashFlows = useMemo(() => {
    const endDate = new Date(cashFlowStartDate)
    endDate.setFullYear(endDate.getFullYear() + 1) // 1 full year from start
    
    const flows = {}
    
    // Calculate for base scenario (baseline)
    // Base Scenario = rules WITHOUT scenario assignment AND include = ON
    flows['base'] = calculateCashFlowTable(
      (data.recurringRules || []).filter(rule => !rule.scenarioId && rule.include),
      data.startingBalance || 0,
      data.startingBalanceDate || cashFlowStartDate,
      cashFlowStartDate,
      endDate.toISOString().split('T')[0],
      data.historicalCashFlows || []
    )
    
    // Calculate for each scenario
    // Scenario = Base Scenario rules + Scenario-specific rules (both with include = ON)
    // Apply overrides to base rules for this scenario
    scenarios.forEach(scenario => {
      if (!scenario.isBaseline) {
        // Get base scenario rules (no scenario assignment, include = ON)
        let baseRules = (data.recurringRules || []).filter(rule => 
          !rule.scenarioId && 
          rule.include &&
          !rule.excludedFromScenarios?.includes(scenario.id)
        )
        
        // Apply overrides to base rules for this scenario
        if (data.ruleOverrides && data.ruleOverrides.length > 0) {
          baseRules = baseRules.map(rule => 
            applyOverridesToRule(rule, data.ruleOverrides, scenario.id)
          )
        }
        
        // Get scenario-specific rules (assigned to this scenario, include = ON)
        const scenarioRules = (data.recurringRules || []).filter(rule => 
          rule.scenarioId === scenario.id &&
          rule.include
        )
        
        // Combine both sets
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

  // Calculate summary from cash flow data based on selected scenario
  const summary = useMemo(() => {
    const scenarioData = selectedScenario === 'base' 
      ? scenarioCashFlows['base'] 
      : (scenarioCashFlows[selectedScenario] || cashFlowData)
    return calculateSummary(scenarioData || cashFlowData, data.startingBalance || 0)
  }, [cashFlowData, data.startingBalance, selectedScenario, scenarioCashFlows])

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
      setFlashMessages([{
        type: 'success',
        content: `Created new scenario: ${newScenarioName.trim()}. All base scenario rules are included by default.`,
        dismissible: true,
        onDismiss: () => setFlashMessages([])
      }])
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
      setFlashMessages([{
        type: 'success',
        content: 'Scenario name updated successfully',
        dismissible: true,
        onDismiss: () => setFlashMessages([])
      }])
    }
  }

  const handleDeleteScenario = () => {
    if (editingScenario) {
      onDeleteScenario(editingScenario.id)
      setShowScenarioModal(false)
      setEditingScenario(null)
      setScenarioName('')
      setFlashMessages([{
        type: 'success',
        content: `Deleted scenario: ${editingScenario.name}`,
        dismissible: true,
        onDismiss: () => setFlashMessages([])
      }])
    }
  }

  const handleSaveStartingBalance = () => {
    const balance = parseFloat(startingBalance)
    if (!isNaN(balance) && startingBalanceDate) {
      onUpdateStartingBalance(balance, startingBalanceDate)
      setShowStartingBalanceModal(false)
      setFlashMessages([{
        type: 'success',
        content: `Starting balance set to $${balance.toLocaleString()} as of ${startingBalanceDate}`,
        dismissible: true,
        onDismiss: () => setFlashMessages([])
      }])
    }
  }

  const handleBatchHistoricalUpload = () => {
    try {
      const lines = historicalText.trim().split('\n')
      const newCashFlows = []

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        // Try JSON format
        if (line.startsWith('{')) {
          try {
            const cf = JSON.parse(line)
            newCashFlows.push(cf)
            continue
          } catch (e) {
            // Not JSON, try CSV
          }
        }

        // CSV format: Date, Description, Amount, Category, Account
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
        setFlashMessages([{
          type: 'success',
          content: `Successfully added ${newCashFlows.length} historical cash flow(s)`,
          dismissible: true,
          onDismiss: () => setFlashMessages([])
        }])
      } else {
        setFlashMessages([{
          type: 'error',
          content: 'No valid cash flows found. Please check the format.',
          dismissible: true,
          onDismiss: () => setFlashMessages([])
        }])
      }
    } catch (error) {
      setFlashMessages([{
        type: 'error',
        content: `Error parsing cash flows: ${error.message}`,
        dismissible: true,
        onDismiss: () => setFlashMessages([])
      }])
    }
  }

  return (
    <>
      <Flashbar items={flashMessages} />
      <SpaceBetween size="l">
        <Header 
          variant="h1"
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button iconName="edit" onClick={() => setShowStartingBalanceModal(true)}>
                Set Starting Balance
              </Button>
              <Button iconName="upload" onClick={() => setShowHistoricalModal(true)}>
                Import Historical Data
              </Button>
            </SpaceBetween>
          }
        >
          Dashboard
        </Header>

        {/* Starting Balance Display */}
        <Container>
          <SpaceBetween size="xs">
            <Box variant="awsui-key-label">Starting Balance</Box>
            <Box variant="h2" fontSize="heading-l">
              ${(data.startingBalance || 0).toLocaleString()}
            </Box>
            <Box variant="small" color="text-body-secondary">
              As of {data.startingBalanceDate || 'Not set'}
            </Box>
          </SpaceBetween>
        </Container>

        {/* Summary Cards */}
        <Container>
          <ColumnLayout columns={4} variant="text-grid">
            <div>
              <Box variant="awsui-key-label">Current Balance</Box>
              <Box variant="h1" color="text-status-success" fontSize="display-l">
                ${summary.currentBalance.toLocaleString()}
              </Box>
              <Box fontSize="body-s">
                <Box color="text-status-success" variant="span">
                  ↑ +${summary.balanceChange.toLocaleString()}
                </Box>
                {' '}
                <Box color="text-body-secondary" variant="span">
                  (as of {new Date().toISOString().split('T')[0]})
                </Box>
              </Box>
            </div>
            <div>
              <Box variant="awsui-key-label">Projected (EOY)</Box>
              <Box variant="h1" fontSize="display-l">
                ${summary.projectedEOY.toLocaleString()}
              </Box>
            </div>
            <div>
              <Box variant="awsui-key-label">Total Income</Box>
              <Box variant="h1" color="text-status-success" fontSize="display-l">
                ${summary.totalIncome.toLocaleString()}
              </Box>
            </div>
            <div>
              <Box variant="awsui-key-label">Total Expenses</Box>
              <Box variant="h1" color="text-status-error" fontSize="display-l">
                ${summary.totalExpenses.toLocaleString()}
              </Box>
            </div>
          </ColumnLayout>
        </Container>

        {/* Scenario Selector */}
        <Container
          header={
            <Header
              variant="h2"
              actions={
                <Button variant="primary" iconName="add-plus" onClick={() => setShowNewScenarioModal(true)}>
                  New Scenario
                </Button>
              }
            >
              Scenario Selector
            </Header>
          }
        >
          <SpaceBetween size="xs" direction="horizontal">
            {/* Base Scenario Button */}
            <Button
              variant={selectedScenario === 'base' ? 'primary' : 'normal'}
              onClick={() => setSelectedScenario('base')}
            >
              {selectedScenario === 'base' ? '⦿' : '○'} Base Scenario
            </Button>
            
            {/* Other Scenario Buttons */}
            {scenarios.filter(s => !s.isBaseline).map(scenario => (
              <SpaceBetween key={scenario.id} size="xxs" direction="horizontal">
                <Button
                  variant={selectedScenario === scenario.id ? 'primary' : 'normal'}
                  onClick={() => setSelectedScenario(scenario.id)}
                >
                  {selectedScenario === scenario.id ? '⦿' : '○'} {scenario.name}
                </Button>
                <Button
                  variant="icon"
                  iconName="edit"
                  onClick={() => handleEditScenario(scenario)}
                />
              </SpaceBetween>
            ))}
            <Button disabled>○ (Empty)</Button>
            <Button disabled>○ (Empty)</Button>
          </SpaceBetween>
        </Container>

        {/* Running Balance Chart */}
        <Container
          header={
            <Header
              variant="h2"
              description="Visual representation of your cash flow over time"
            >
              Running Balance Chart
            </Header>
          }
        >
          <SpaceBetween size="m">
            <BalanceChart 
              cashFlowData={cashFlowData} 
              startingBalanceDate={data.startingBalanceDate || cashFlowStartDate}
              scenarioCashFlows={scenarioCashFlows}
              scenarios={scenarios}
              selectedScenario={selectedScenario}
            />
            <SpaceBetween size="xs" direction="horizontal">
              <Box variant="span">
                {data.startingBalanceDate || cashFlowStartDate} - {cashFlowData.length > 0 ? cashFlowData[cashFlowData.length - 1].date : 'N/A'}
              </Box>
            </SpaceBetween>
          </SpaceBetween>
        </Container>

        {/* Cash Flow Table */}
        <Container
          header={
            <Header
              variant="h2"
              actions={
                <SpaceBetween direction="horizontal" size="xs">
                  <FormField label="Start Date">
                    <DatePicker
                      value={cashFlowStartDate}
                      onChange={({ detail }) => onStartDateChange(detail.value)}
                      placeholder="YYYY-MM-DD"
                    />
                  </FormField>
                  <Button variant="primary" iconName="add-plus" onClick={onQuickAdd}>
                    Quick Add Transaction
                  </Button>
                </SpaceBetween>
              }
            >
              Cash Flow Table
            </Header>
          }
        >
          <SpaceBetween size="m">
            <CashFlowTable 
              data={selectedScenario === 'base' ? scenarioCashFlows['base'] : (scenarioCashFlows[selectedScenario] || cashFlowData)}
              startDate={cashFlowStartDate}
              hideEmptyRows={hideEmptyRows}
              onHideEmptyRowsChange={onHideEmptyRowsChange}
            />
            <Box variant="small" color="text-body-secondary">
              ⚠ = Draft/Scenario Entry | 🔒 = Balance Override Active
            </Box>
          </SpaceBetween>
        </Container>
      </SpaceBetween>

      {/* Edit Scenario Modal */}
      <Modal
        visible={showScenarioModal}
        onDismiss={() => {
          setShowScenarioModal(false)
          setEditingScenario(null)
          setScenarioName('')
        }}
        header="Edit Scenario"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button 
                variant="link" 
                onClick={() => {
                  setShowScenarioModal(false)
                  setEditingScenario(null)
                  setScenarioName('')
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDeleteScenario}
                iconName="remove"
              >
                Delete Scenario
              </Button>
              <Button variant="primary" onClick={handleSaveScenario}>
                Save Changes
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <SpaceBetween size="m">
          <FormField label="Scenario Name">
            <Input
              value={scenarioName}
              onChange={({ detail }) => setScenarioName(detail.value)}
              placeholder="Enter scenario name"
            />
          </FormField>
          <Box variant="p" color="text-body-secondary">
            <strong>Note:</strong> Deleting this scenario will remove it and unassign all rules that were assigned to it. The rules will remain but will be moved to the base scenario.
          </Box>
        </SpaceBetween>
      </Modal>

      {/* Starting Balance Modal */}
      <Modal
        visible={showStartingBalanceModal}
        onDismiss={() => setShowStartingBalanceModal(false)}
        header="Set Starting Balance"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setShowStartingBalanceModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveStartingBalance}>
                Save
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <SpaceBetween size="m">
          <FormField label="Starting Balance" constraintText="Enter the balance amount">
            <Input
              value={startingBalance}
              onChange={({ detail }) => setStartingBalance(detail.value)}
              type="number"
              placeholder="15000"
            />
          </FormField>
          <FormField label="As of Date" constraintText="The date of this starting balance">
            <DatePicker
              value={startingBalanceDate}
              onChange={({ detail }) => setStartingBalanceDate(detail.value)}
              placeholder="YYYY/MM/DD"
            />
          </FormField>
        </SpaceBetween>
      </Modal>

      {/* New Scenario Modal */}
      <Modal
        visible={showNewScenarioModal}
        onDismiss={() => {
          setShowNewScenarioModal(false)
          setNewScenarioName('')
        }}
        header="Create New Scenario"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button 
                variant="link" 
                onClick={() => {
                  setShowNewScenarioModal(false)
                  setNewScenarioName('')
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={handleCreateNewScenario}>
                Create Scenario
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <SpaceBetween size="m">
          <FormField label="Scenario Name" constraintText="Enter a descriptive name for this scenario">
            <Input
              value={newScenarioName}
              onChange={({ detail }) => setNewScenarioName(detail.value)}
              placeholder="e.g., Car Purchase, Home Renovation, Gift Cards"
            />
          </FormField>
          <Box variant="p" color="text-body-secondary">
            <strong>What are scenarios?</strong><br />
            Scenarios let you model "what-if" situations by building on top of your base scenario. 
            Each scenario automatically includes all your base scenario rules, plus any additional rules you add to it.
          </Box>
          <Box variant="p" color="text-body-secondary">
            <strong>How scenarios work:</strong><br />
            • New scenarios start with ALL base scenario rules included<br />
            • Add scenario-specific rules (e.g., car payment, new expenses)<br />
            • Optionally exclude base scenario rules you don't want in this scenario<br />
            • Compare scenarios on the chart to see different outcomes
          </Box>
          <Box variant="p" color="text-body-secondary">
            <strong>Example:</strong> Create a "Car Purchase" scenario to see your finances with a car payment added to your current expenses.
          </Box>
        </SpaceBetween>
      </Modal>

      {/* Historical Cash Flow Modal */}
      <Modal
        visible={showHistoricalModal}
        onDismiss={() => setShowHistoricalModal(false)}
        header="Import Historical Cash Flows"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setShowHistoricalModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleBatchHistoricalUpload}>
                Import
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <SpaceBetween size="m">
          <Box variant="p">
            Paste your historical cash flows in CSV or JSON format. Each line should contain:
          </Box>
          <Box variant="p" color="text-body-secondary">
            <strong>CSV Format:</strong> Date, Description, Amount, Category, Account
          </Box>
          <Box variant="p" color="text-body-secondary">
            <strong>Example:</strong><br />
            2025-01-15, Paycheck, 5000, Income, BOA<br />
            2025-01-20, Grocery Store, -150, Variable Expense, PNC<br />
            2025-02-01, Rent Payment, -2000, Cash Expense, BOA
          </Box>
          <Box variant="p" color="text-body-secondary">
            <strong>JSON Format:</strong> One JSON object per line with fields: date, description, amount, category, account
          </Box>
          <Textarea
            value={historicalText}
            onChange={({ detail }) => setHistoricalText(detail.value)}
            placeholder="Paste historical cash flows here..."
            rows={10}
          />
        </SpaceBetween>
      </Modal>
    </>
  )
}
