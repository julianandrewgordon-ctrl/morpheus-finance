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
import { mockData } from './data/mockData'

const USER_KEY = 'finance-manager-current-user'

// Helper functions for user-specific storage
const getUserStorageKey = (username, key) => `finance-manager-${username}-${key}`

const getBlankData = () => ({
  startingBalance: 0,
  startingBalanceDate: new Date().toISOString().split('T')[0],
  scenarios: [
    { id: 1, name: 'Base Scenario', active: true, isBaseline: true }
  ],
  historicalCashFlows: [],
  recurringRules: []
})

function App() {
  // Check if user is already logged in
  const storedUser = localStorage.getItem(USER_KEY)
  const [showLanding, setShowLanding] = useState(!storedUser)
  const [currentUser, setCurrentUser] = useState(storedUser)
  const [activeHref, setActiveHref] = useState('/dashboard')
  const [currentProfile, setCurrentProfile] = useState({ label: 'Personal', value: 'personal' })
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetConfirmation, setResetConfirmation] = useState('')
  
  // Load data based on current user
  const [data, setData] = useState(() => {
    if (!currentUser) return mockData
    
    try {
      const storageKey = getUserStorageKey(currentUser, 'data')
      const saved = localStorage.getItem(storageKey)
      
      if (saved) {
        return JSON.parse(saved)
      } else {
        // For admin, return blank data; for julian, return mockData
        return currentUser === 'admin' ? getBlankData() : mockData
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error)
      return currentUser === 'admin' ? getBlankData() : mockData
    }
  })
  
  const [navigationOpen, setNavigationOpen] = useState(true)
  
  // Load start date from user-specific localStorage
  const [cashFlowStartDate, setCashFlowStartDate] = useState(() => {
    if (!currentUser) return '2025-05-24'
    try {
      const storageKey = getUserStorageKey(currentUser, 'start-date')
      return localStorage.getItem(storageKey) || '2025-05-24'
    } catch (error) {
      return '2025-05-24'
    }
  })
  
  // Load hide empty rows preference from user-specific localStorage
  const [hideEmptyRows, setHideEmptyRows] = useState(() => {
    if (!currentUser) return false
    try {
      const storageKey = getUserStorageKey(currentUser, 'hide-empty-rows')
      const saved = localStorage.getItem(storageKey)
      return saved === 'true'
    } catch (error) {
      return false
    }
  })
  
  // Save data to user-specific localStorage whenever it changes
  useEffect(() => {
    if (!currentUser) return
    try {
      const storageKey = getUserStorageKey(currentUser, 'data')
      localStorage.setItem(storageKey, JSON.stringify(data))
    } catch (error) {
      console.error('Error saving data to localStorage:', error)
    }
  }, [data, currentUser])
  
  // Save start date to user-specific localStorage whenever it changes
  useEffect(() => {
    if (!currentUser) return
    try {
      const storageKey = getUserStorageKey(currentUser, 'start-date')
      localStorage.setItem(storageKey, cashFlowStartDate)
    } catch (error) {
      console.error('Error saving start date to localStorage:', error)
    }
  }, [cashFlowStartDate, currentUser])
  
  // Save hide empty rows preference to user-specific localStorage whenever it changes
  useEffect(() => {
    if (!currentUser) return
    try {
      const storageKey = getUserStorageKey(currentUser, 'hide-empty-rows')
      localStorage.setItem(storageKey, hideEmptyRows.toString())
    } catch (error) {
      console.error('Error saving hide empty rows preference to localStorage:', error)
    }
  }, [hideEmptyRows, currentUser])
  
  // Load user data when user changes
  useEffect(() => {
    if (!currentUser) return
    
    try {
      const storageKey = getUserStorageKey(currentUser, 'data')
      const saved = localStorage.getItem(storageKey)
      
      if (saved) {
        setData(JSON.parse(saved))
      } else {
        // Initialize data for new user
        const initialData = currentUser === 'admin' ? getBlankData() : mockData
        setData(initialData)
      }
      
      // Load user-specific preferences
      const startDateKey = getUserStorageKey(currentUser, 'start-date')
      const savedStartDate = localStorage.getItem(startDateKey)
      if (savedStartDate) setCashFlowStartDate(savedStartDate)
      
      const hideRowsKey = getUserStorageKey(currentUser, 'hide-empty-rows')
      const savedHideRows = localStorage.getItem(hideRowsKey)
      if (savedHideRows) setHideEmptyRows(savedHideRows === 'true')
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }, [currentUser])

  const handleAddTransaction = (transaction) => {
    setData(prev => ({
      ...prev,
      recurringRules: [...prev.recurringRules, { ...transaction, id: Date.now() }]
    }))
    setShowQuickAdd(false)
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
      // Also remove scenario assignments from rules
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

  const handleLogin = (username) => {
    console.log('=== LOGIN DEBUG ===')
    console.log('Username:', username)
    
    // List all finance-manager keys in localStorage
    console.log('All localStorage keys:')
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('finance-manager')) {
        console.log(`  ${key}: ${localStorage.getItem(key)?.substring(0, 50)}...`)
      }
    }
    
    let didMigrate = false
    
    // Migrate old data to new user-specific storage for julian
    if (username === 'julian') {
      const oldDataKey = 'finance-manager-data'
      const oldStartDateKey = 'finance-manager-start-date'
      const oldHideRowsKey = 'finance-manager-hide-empty-rows'
      
      const newDataKey = getUserStorageKey('julian', 'data')
      const newStartDateKey = getUserStorageKey('julian', 'start-date')
      const newHideRowsKey = getUserStorageKey('julian', 'hide-empty-rows')
      
      console.log('Looking for old data at:', oldDataKey)
      console.log('Will save to:', newDataKey)
      
      // Check if old data exists
      const oldData = localStorage.getItem(oldDataKey)
      
      if (oldData) {
        console.log('Found old data, migrating...')
        // Always migrate from old storage if it exists (overwrites new storage)
        localStorage.setItem(newDataKey, oldData)
        console.log('✓ Migrated data for julian user')
        didMigrate = true
        
        const oldStartDate = localStorage.getItem(oldStartDateKey)
        if (oldStartDate) {
          localStorage.setItem(newStartDateKey, oldStartDate)
          console.log('✓ Migrated start date')
        }
        
        const oldHideRows = localStorage.getItem(oldHideRowsKey)
        if (oldHideRows) {
          localStorage.setItem(newHideRowsKey, oldHideRows)
          console.log('✓ Migrated hide rows preference')
        }
      } else {
        console.log('⚠ No old data found at', oldDataKey)
        console.log('Will use mockData as default')
      }
    }
    
    // Set user in localStorage FIRST before any reload
    localStorage.setItem(USER_KEY, username)
    
    console.log('=== END LOGIN DEBUG ===')
    
    // Force reload to ensure migrated data is loaded
    if (didMigrate) {
      console.log('Reloading to load migrated data...')
      window.location.reload()
      return // Don't set state if we're reloading
    }
    
    setCurrentUser(username)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    localStorage.removeItem(USER_KEY)
    setShowLanding(true)
  }

  const handleResetData = () => {
    setShowResetModal(true)
  }

  const handleConfirmReset = () => {
    if (resetConfirmation === 'RESET' && currentUser) {
      const dataKey = getUserStorageKey(currentUser, 'data')
      const startDateKey = getUserStorageKey(currentUser, 'start-date')
      const hideRowsKey = getUserStorageKey(currentUser, 'hide-empty-rows')
      
      localStorage.removeItem(dataKey)
      localStorage.removeItem(startDateKey)
      localStorage.removeItem(hideRowsKey)
      
      const resetData = currentUser === 'admin' ? getBlankData() : mockData
      setData(resetData)
      setCashFlowStartDate('2025-05-24')
      setHideEmptyRows(false)
      setShowResetModal(false)
      setResetConfirmation('')
      window.location.reload()
    }
  }

  const handleExportData = () => {
    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `finance-data-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
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
      case '/rules':
        return (
          <RecurringRules 
            rules={data.recurringRules}
            scenarios={data.scenarios}
            onAddRule={() => setShowQuickAdd(true)}
            onBatchAdd={handleBatchAddRules}
            onDeleteRule={handleDeleteRule}
            onToggleInclude={handleToggleInclude}
            onUpdateRule={handleUpdateRule}
          />
        )
      case '/export':
        return <Export profile={currentProfile.label} />
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

  if (showLanding) {
    return <LandingPage onEnter={(username) => {
      handleLogin(username)
      setShowLanding(false)
    }} />
  }

  return (
    <>
      <TopNavigation
        identity={{
          href: '/',
          title: `🔮 Morpheus - Financial Planning ${currentUser ? `(${currentUser})` : ''}`,
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
            type: 'menu-dropdown',
            text: 'Data',
            iconName: 'settings',
            items: [
              { id: 'export', text: '💾 Export Data', iconName: 'download' },
              { id: 'reset', text: '🔄 Reset to Defaults', iconName: 'refresh' },
              { id: 'logout', text: '🚪 Logout', iconName: 'close' }
            ],
            onItemClick: (e) => {
              if (e.detail.id === 'export') {
                handleExportData()
              } else if (e.detail.id === 'reset') {
                handleResetData()
              } else if (e.detail.id === 'logout') {
                handleLogout()
              }
            }
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
              { type: 'link', text: '📋 Recurring Rules', href: '/rules' },
              { type: 'link', text: '💾 Export', href: '/export' },
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
          onClose={() => setShowQuickAdd(false)}
          onAdd={handleAddTransaction}
        />
      )}
      
      {/* Reset Data Confirmation Modal */}
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
            The application will reload with default mock data.
          </Alert>
          
          <Box variant="p">
            <strong>Before proceeding:</strong>
            <ol>
              <li>Export your data using the "Export Data" option</li>
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
          
          <Box variant="p" color="text-body-secondary" fontSize="body-s">
            After reset, you can import your exported data if needed.
          </Box>
        </SpaceBetween>
      </Modal>
    </>
  )
}

export default App
