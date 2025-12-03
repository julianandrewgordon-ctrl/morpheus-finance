import { useState, useEffect } from 'react'
import AppLayout from '@cloudscape-design/components/app-layout'
import TopNavigation from '@cloudscape-design/components/top-navigation'
import SideNavigation from '@cloudscape-design/components/side-navigation'
import Modal from '@cloudscape-design/components/modal'
import Box from '@cloudscape-design/components/box'
import SpaceBetween from '@cloudscape-design/components/space-between'
import Button from '@cloudscape-design/components/button'
import Input from '@cloudscape-design/components/input'
import FormField from '@cloudscape-design/components/form-field'
import Alert from '@cloudscape-design/components/alert'
import LandingPage from './components/LandingPage'
import Dashboard from './components/Dashboard'
import RecurringRules from './components/RecurringRules'
import Export from './components/Export'
import QuickAddModal from './components/QuickAddModal'
import { supabase } from './lib/supabase'

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
  const [navigationOpen, setNavigationOpen] = useState(true)
  const [cashFlowStartDate, setCashFlowStartDate] = useState('2025-11-20')
  const [hideEmptyRows, setHideEmptyRows] = useState(false)
  
  // Check for existing session on mount
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
  
  // Logout when window/tab is closed
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
  
  // Load data from Supabase when user changes
  useEffect(() => {
    if (!user) return
    
    const loadData = async () => {
      try {
        // Load financial data
        const { data: financialData, error: dataError } = await supabase
          .from('financial_data')
          .select('data')
          .eq('user_id', user.id)
          .single()
        
        if (dataError && dataError.code !== 'PGRST116') { // PGRST116 = no rows
          console.error('Error loading financial data:', dataError)
        } else if (financialData) {
          setData(financialData.data)
        }
        
        // Load preferences
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
  
  // Save data to Supabase whenever it changes
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
    
    // Debounce saves
    const timeoutId = setTimeout(saveData, 1000)
    return () => clearTimeout(timeoutId)
  }, [data, user])
  
  // Save preferences to Supabase
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
        id: Date.now(),
        scenarioId: quickAddScenarioId,
        isDraft: quickAddScenarioId ? true : false
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
      recurringRules: prev.recurringRules.map(rule => 
        rule.scenarioId === scenarioId 
          ? { ...rule, scenarioId: null, isDraft: false }
          : rule
      )
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
        // Delete from Supabase
        await supabase
          .from('financial_data')
          .delete()
          .eq('user_id', user.id)
        
        await supabase
          .from('user_preferences')
          .delete()
          .eq('user_id', user.id)
        
        // Reset local state
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

  const profileOptions = [
    { id: 'personal', text: '👤 Personal' },
    { id: 'business', text: '🏢 Business' },
    { id: 'rental', text: '🏠 Rental Property' }
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
            onAddRule={(scenarioId) => {
              setQuickAddScenarioId(scenarioId)
              setShowQuickAdd(true)
            }}
            onBatchAdd={handleBatchAddRules}
            onDeleteRule={handleDeleteRule}
            onToggleInclude={handleToggleInclude}
            onUpdateRule={handleUpdateRule}
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
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a0033 0%, #2d1b4e 50%, #1a0033 100%)'
      }}>
        <Box variant="h1" color="text-body-secondary">Loading...</Box>
      </div>
    )
  }

  if (!user) {
    return <LandingPage onEnter={setUser} />
  }

  return (
    <>
      <TopNavigation
        identity={{
          href: '/',
          title: `🔮 Morpheus - Financial Planning (${user.email})`,
        }}
        utilities={[
          {
            type: 'menu-dropdown',
            text: currentProfile.label,
            description: 'Switch profile',
            iconName: 'user-profile',
            items: [
              { id: 'personal', text: '👤 Personal' },
              { id: 'business', text: '🏢 Business' },
              { id: 'rental', text: '🏠 Rental Property' }
            ],
            onItemClick: (e) => {
              const selected = profileOptions.find(p => p.id === e.detail.id)
              if (selected) {
                setCurrentProfile({ label: selected.text, value: e.detail.id })
              }
            }
          },
          {
            type: 'button',
            text: 'Logout',
            iconName: 'close',
            onClick: handleLogout
          }
        ]}
      />
      <AppLayout
        navigation={
          <SideNavigation
            activeHref={activeHref}
            header={{ text: 'Navigation', href: '/' }}
            onFollow={(event) => {
              if (!event.detail.external) {
                event.preventDefault()
                setActiveHref(event.detail.href)
              }
            }}
            items={[
              { type: 'link', text: '📊 Dashboard', href: '/dashboard' },
              { type: 'link', text: '🎯 Scenarios', href: '/scenarios' },
              { type: 'link', text: '💾 Data Management', href: '/export' },
              { type: 'divider' },
              { 
                type: 'link', 
                text: '⚙️ Settings', 
                href: '/settings',
                info: <span style={{ fontSize: '0.8em', color: '#666' }}>Coming soon</span>
              }
            ]}
          />
        }
        navigationOpen={navigationOpen}
        onNavigationChange={({ detail }) => setNavigationOpen(detail.open)}
        content={getContent()}
        toolsHide
        contentType="default"
      />
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
        visible={showResetModal}
        onDismiss={() => {
          setShowResetModal(false)
          setResetConfirmation('')
        }}
        header="Reset All Data to Defaults"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button 
                variant="link" 
                onClick={() => {
                  setShowResetModal(false)
                  setResetConfirmation('')
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="primary"
                onClick={handleConfirmReset}
                disabled={resetConfirmation !== 'RESET'}
              >
                Reset All Data
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <SpaceBetween size="m">
          <Alert type="warning" header="Warning: This action cannot be undone">
            Resetting will permanently delete:
            <ul>
              <li>All recurring rules</li>
              <li>All scenarios</li>
              <li>All historical cash flows</li>
              <li>Starting balance and date</li>
              <li>All preferences and settings</li>
            </ul>
          </Alert>
          
          <Box variant="p">
            <strong>Before proceeding:</strong>
            <ol>
              <li>Export your data using the "Data Management" page</li>
              <li>Save the exported file in a safe location</li>
              <li>Only then proceed with the reset</li>
            </ol>
          </Box>
          
          <FormField 
            label="Type RESET to confirm" 
            constraintText="This verification ensures you understand the consequences"
          >
            <Input
              value={resetConfirmation}
              onChange={({ detail }) => setResetConfirmation(detail.value)}
              placeholder="Type RESET in capital letters"
            />
          </FormField>
        </SpaceBetween>
      </Modal>
    </>
  )
}

export default App
