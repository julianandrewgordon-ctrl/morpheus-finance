import { useState, useEffect } from 'react'
import { AppShell, Burger, Group, Text, NavLink, Menu, Button, Modal, Stack, TextInput, Alert, Loader, Center, Box } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import LandingPage from './components/LandingPage'
import Dashboard from './components/Dashboard'
import RecurringRules from './components/RecurringRules'
import Export from './components/Export'
import QuickAddModal from './components/QuickAddModal'
import { supabase } from './lib/supabase'
import { migrateDataIfNeeded } from './utils/dataMigration'

const getBlankData = () => ({
  startingBalance: 0,
  startingBalanceDate: new Date().toISOString().split('T')[0],
  scenarios: [
    { id: 1, name: 'Base Scenario', active: true, isBaseline: true }
  ],
  historicalCashFlows: [],
  recurringRules: [],
  ruleOverrides: []
})

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeHref, setActiveHref] = useState('/dashboard')
  const [currentProfile, setCurrentProfile] = useState({ label: 'Personal', value: 'personal' })
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [quickAddScenarioId, setQuickAddScenarioId] = useState(null)
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetConfirmation, setResetConfirmation] = useState('')
  const [data, setData] = useState(getBlankData())
  const [opened, { toggle }] = useDisclosure()
  const [cashFlowStartDate, setCashFlowStartDate] = useState('2025-11-20')
  const [hideEmptyRows, setHideEmptyRows] = useState(false)
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])
  
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (user) {
        await supabase.auth.signOut()
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [user])
  
  useEffect(() => {
    if (!user) return
    
    const loadData = async () => {
      try {
        const { data: financialData, error: dataError } = await supabase
          .from('financial_data')
          .select('data')
          .eq('user_id', user.id)
          .single()
        
        if (dataError && dataError.code !== 'PGRST116') {
          console.error('Error loading financial data:', dataError)
        } else if (financialData) {
          const migratedData = migrateDataIfNeeded(financialData.data)
          setData(migratedData)
          
          if (migratedData !== financialData.data) {
            console.log('Data migrated, saving to database...')
            await supabase
              .from('financial_data')
              .upsert({
                user_id: user.id,
                data: migratedData
              }, {
                onConflict: 'user_id'
              })
          }
        }
        
        const { data: prefs, error: prefsError } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        if (prefsError && prefsError.code !== 'PGRST116') {
          console.error('Error loading preferences:', prefsError)
        } else if (prefs) {
          if (prefs.start_date) setCashFlowStartDate(prefs.start_date)
          if (prefs.hide_empty_rows !== null) setHideEmptyRows(prefs.hide_empty_rows)
        }
      } catch (error) {
        console.error('Error in loadData:', error)
      }
    }
    
    loadData()
  }, [user])
  
  useEffect(() => {
    if (!user) return
    
    const saveData = async () => {
      try {
        const { error } = await supabase
          .from('financial_data')
          .upsert({
            user_id: user.id,
            data: data
          }, {
            onConflict: 'user_id'
          })
        
        if (error) {
          console.error('Error saving data:', error)
        }
      } catch (error) {
        console.error('Error in saveData:', error)
      }
    }
    
    const timeoutId = setTimeout(saveData, 1000)
    return () => clearTimeout(timeoutId)
  }, [data, user])
  
  useEffect(() => {
    if (!user) return
    
    const savePreferences = async () => {
      try {
        const { error } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            start_date: cashFlowStartDate,
            hide_empty_rows: hideEmptyRows
          }, {
            onConflict: 'user_id'
          })
        
        if (error) {
          console.error('Error saving preferences:', error)
        }
      } catch (error) {
        console.error('Error in savePreferences:', error)
      }
    }
    
    const timeoutId = setTimeout(savePreferences, 1000)
    return () => clearTimeout(timeoutId)
  }, [cashFlowStartDate, hideEmptyRows, user])

  const handleAddTransaction = (transaction) => {
    setData(prev => ({
      ...prev,
      recurringRules: [...prev.recurringRules, { 
        ...transaction, 
        id: Date.now()
      }]
    }))
    setShowQuickAdd(false)
    setQuickAddScenarioId(null)
  }

  const handleBatchAddRules = (rules) => {
    setData(prev => ({
      ...prev,
      recurringRules: [...prev.recurringRules, ...rules.map(rule => ({ ...rule, id: Date.now() + Math.random() }))]
    }))
  }

  const handleDeleteRule = (ruleId) => {
    setData(prev => ({
      ...prev,
      recurringRules: prev.recurringRules.filter(rule => rule.id !== ruleId)
    }))
  }

  const handleToggleInclude = (ruleId) => {
    setData(prev => ({
      ...prev,
      recurringRules: prev.recurringRules.map(rule => 
        rule.id === ruleId ? { ...rule, include: !rule.include } : rule
      )
    }))
  }

  const handleUpdateRule = (ruleId, updates) => {
    setData(prev => ({
      ...prev,
      recurringRules: prev.recurringRules.map(rule => 
        rule.id === ruleId ? { ...rule, ...updates } : rule
      )
    }))
  }

  const handleAddScenario = (scenario) => {
    setData(prev => ({
      ...prev,
      scenarios: [...prev.scenarios, { ...scenario, id: Date.now() }]
    }))
  }

  const handleUpdateScenario = (scenarioId, updates) => {
    setData(prev => ({
      ...prev,
      scenarios: prev.scenarios.map(scenario => 
        scenario.id === scenarioId ? { ...scenario, ...updates } : scenario
      )
    }))
  }

  const handleDeleteScenario = (scenarioId) => {
    setData(prev => ({
      ...prev,
      scenarios: prev.scenarios.filter(scenario => scenario.id !== scenarioId),
      recurringRules: prev.recurringRules.map(rule => {
        if (rule.scenarioIds && rule.scenarioIds.includes(scenarioId)) {
          const updatedScenarioIds = rule.scenarioIds.filter(id => id !== scenarioId)
          return { 
            ...rule, 
            scenarioIds: updatedScenarioIds,
            isDraft: updatedScenarioIds.length > 0
          }
        }
        return rule
      })
    }))
  }

  const handleUpdateStartingBalance = (balance, date) => {
    setData(prev => ({
      ...prev,
      startingBalance: balance,
      startingBalanceDate: date
    }))
  }

  const handleAddHistoricalCashFlow = (cashFlow) => {
    setData(prev => ({
      ...prev,
      historicalCashFlows: [...prev.historicalCashFlows, { ...cashFlow, id: Date.now() }]
    }))
  }

  const handleBatchAddHistoricalCashFlows = (cashFlows) => {
    setData(prev => ({
      ...prev,
      historicalCashFlows: [...prev.historicalCashFlows, ...cashFlows.map(cf => ({ ...cf, id: Date.now() + Math.random() }))]
    }))
  }

  const handleDeleteHistoricalCashFlow = (id) => {
    setData(prev => ({
      ...prev,
      historicalCashFlows: prev.historicalCashFlows.filter(cf => cf.id !== id)
    }))
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setData(getBlankData())
  }

  const handleResetData = () => {
    setShowResetModal(true)
  }

  const handleConfirmReset = async () => {
    if (resetConfirmation === 'RESET' && user) {
      try {
        await supabase
          .from('financial_data')
          .delete()
          .eq('user_id', user.id)
        
        await supabase
          .from('user_preferences')
          .delete()
          .eq('user_id', user.id)
        
        setData(getBlankData())
        setCashFlowStartDate('2025-11-20')
        setHideEmptyRows(false)
        setShowResetModal(false)
        setResetConfirmation('')
      } catch (error) {
        console.error('Error resetting data:', error)
      }
    }
  }

  const handleImportData = (importedData) => {
    setData(importedData)
  }

  const handleAddOverride = (baseRuleId, scenarioId, overrideValues) => {
    const newOverride = {
      id: Date.now() + Math.random(),
      baseRuleId,
      scenarioId,
      overrides: overrideValues,
      createdAt: new Date().toISOString()
    }
    setData(prev => ({
      ...prev,
      ruleOverrides: [...(prev.ruleOverrides || []), newOverride]
    }))
  }

  const handleUpdateOverride = (overrideId, newValues) => {
    setData(prev => ({
      ...prev,
      ruleOverrides: (prev.ruleOverrides || []).map(override =>
        override.id === overrideId
          ? { ...override, overrides: newValues }
          : override
      )
    }))
  }

  const handleRemoveOverride = (overrideId) => {
    setData(prev => ({
      ...prev,
      ruleOverrides: (prev.ruleOverrides || []).filter(o => o.id !== overrideId)
    }))
  }

  const profileOptions = [
    { id: 'personal', label: 'Personal' },
    { id: 'business', label: 'Business' },
    { id: 'rental', label: 'Rental Property' }
  ]

  const getContent = () => {
    switch (activeHref) {
      case '/dashboard':
        return (
          <Dashboard 
            data={data} 
            onQuickAdd={() => setShowQuickAdd(true)}
            cashFlowStartDate={cashFlowStartDate}
            onStartDateChange={setCashFlowStartDate}
            onAddScenario={handleAddScenario}
            onUpdateScenario={handleUpdateScenario}
            onDeleteScenario={handleDeleteScenario}
            onUpdateStartingBalance={handleUpdateStartingBalance}
            onAddHistoricalCashFlow={handleAddHistoricalCashFlow}
            onBatchAddHistoricalCashFlows={handleBatchAddHistoricalCashFlows}
            onDeleteHistoricalCashFlow={handleDeleteHistoricalCashFlow}
            hideEmptyRows={hideEmptyRows}
            onHideEmptyRowsChange={setHideEmptyRows}
          />
        )
      case '/scenarios':
        return (
          <RecurringRules 
            rules={data.recurringRules}
            scenarios={data.scenarios}
            ruleOverrides={data.ruleOverrides || []}
            onAddRule={(scenarioId) => {
              setQuickAddScenarioId(scenarioId)
              setShowQuickAdd(true)
            }}
            onBatchAdd={handleBatchAddRules}
            onDeleteRule={handleDeleteRule}
            onToggleInclude={handleToggleInclude}
            onUpdateRule={handleUpdateRule}
            onAddOverride={handleAddOverride}
            onUpdateOverride={handleUpdateOverride}
            onRemoveOverride={handleRemoveOverride}
          />
        )
      case '/export':
        return <Export data={data} onImportData={handleImportData} />
      default:
        return (
          <Dashboard 
            data={data} 
            onQuickAdd={() => setShowQuickAdd(true)}
            cashFlowStartDate={cashFlowStartDate}
            onStartDateChange={setCashFlowStartDate}
            onAddScenario={handleAddScenario}
            onUpdateScenario={handleUpdateScenario}
            onDeleteScenario={handleDeleteScenario}
            onUpdateStartingBalance={handleUpdateStartingBalance}
            onAddHistoricalCashFlow={handleAddHistoricalCashFlow}
            onBatchAddHistoricalCashFlows={handleBatchAddHistoricalCashFlows}
            onDeleteHistoricalCashFlow={handleDeleteHistoricalCashFlow}
            hideEmptyRows={hideEmptyRows}
            onHideEmptyRowsChange={setHideEmptyRows}
          />
        )
    }
  }

  if (loading) {
    return (
      <Center style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #1a0033 0%, #2d1b4e 50%, #1a0033 100%)'
      }}>
        <Loader color="violet" size="xl" />
      </Center>
    )
  }

  if (!user) {
    return <LandingPage onEnter={setUser} />
  }

  return (
    <>
      <AppShell
        header={{ height: 60 }}
        navbar={{ width: 250, breakpoint: 'sm', collapsed: { mobile: !opened } }}
        padding="md"
      >
        <AppShell.Header>
          <Group h="100%" px="md" justify="space-between">
            <Group>
              <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
              <Text size="lg" fw={700} c="violet">Morpheus - Financial Planning</Text>
              <Text size="sm" c="dimmed">({user.email})</Text>
            </Group>
            <Group>
              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <Button variant="subtle">{currentProfile.label}</Button>
                </Menu.Target>
                <Menu.Dropdown>
                  {profileOptions.map(p => (
                    <Menu.Item key={p.id} onClick={() => setCurrentProfile(p)}>
                      {p.label}
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>
              <Button variant="subtle" color="red" onClick={handleLogout}>
                Logout
              </Button>
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p="md">
          <NavLink
            label="Dashboard"
            active={activeHref === '/dashboard'}
            onClick={() => setActiveHref('/dashboard')}
            leftSection={<span>📊</span>}
          />
          <NavLink
            label="Scenarios"
            active={activeHref === '/scenarios'}
            onClick={() => setActiveHref('/scenarios')}
            leftSection={<span>🎯</span>}
          />
          <NavLink
            label="Data Management"
            active={activeHref === '/export'}
            onClick={() => setActiveHref('/export')}
            leftSection={<span>💾</span>}
          />
          <Box mt="xl">
            <NavLink
              label="Settings"
              disabled
              leftSection={<span>⚙️</span>}
              description="Coming soon"
            />
          </Box>
        </AppShell.Navbar>

        <AppShell.Main>
          {getContent()}
        </AppShell.Main>
      </AppShell>

      {showQuickAdd && (
        <QuickAddModal 
          onClose={() => {
            setShowQuickAdd(false)
            setQuickAddScenarioId(null)
          }}
          onAdd={handleAddTransaction}
          scenarioId={quickAddScenarioId}
          scenarios={data.scenarios}
        />
      )}
      
      <Modal
        opened={showResetModal}
        onClose={() => {
          setShowResetModal(false)
          setResetConfirmation('')
        }}
        title="Reset All Data to Defaults"
      >
        <Stack>
          <Alert color="yellow" title="Warning: This action cannot be undone">
            Resetting will permanently delete:
            <ul>
              <li>All recurring rules</li>
              <li>All scenarios</li>
              <li>All historical cash flows</li>
              <li>Starting balance and date</li>
              <li>All preferences and settings</li>
            </ul>
          </Alert>
          
          <Text>
            <strong>Before proceeding:</strong>
            <ol>
              <li>Export your data using the "Data Management" page</li>
              <li>Save the exported file in a safe location</li>
              <li>Only then proceed with the reset</li>
            </ol>
          </Text>
          
          <TextInput
            label="Type RESET to confirm"
            description="This verification ensures you understand the consequences"
            value={resetConfirmation}
            onChange={(e) => setResetConfirmation(e.target.value)}
            placeholder="Type RESET in capital letters"
          />
          
          <Group justify="flex-end">
            <Button 
              variant="subtle" 
              onClick={() => {
                setShowResetModal(false)
                setResetConfirmation('')
              }}
            >
              Cancel
            </Button>
            <Button 
              color="red"
              onClick={handleConfirmReset}
              disabled={resetConfirmation !== 'RESET'}
            >
              Reset All Data
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}

export default App
