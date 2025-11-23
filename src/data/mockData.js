export const mockData = {
  startingBalance: 15000.00,
  startingBalanceDate: '2025-01-01',
  summary: {
    currentBalance: 15432.50,
    projectedEOY: 18900.00,
    totalIncome: 45000.00,
    totalExpenses: 31567.50,
    balanceChange: 1234
  },
  scenarios: [
    { id: 1, name: 'Base Scenario', active: true, isBaseline: true },
    { id: 2, name: 'Gift Card A', active: false, isBaseline: false },
    { id: 3, name: 'Car Purchase', active: false, isBaseline: false }
  ],
  historicalCashFlows: [],
  recurringRules: [
    {
      id: 1,
      include: true,
      name: 'Salary',
      amount: 5000,
      type: 'Income',
      account: 'BOA',
      frequency: 'Monthly',
      effectiveDate: '2025-01-01',
      endDate: null,
      description: ''
    },
    {
      id: 2,
      include: true,
      name: 'Rent',
      amount: -2000,
      type: 'Cash Expense',
      account: 'BOA',
      frequency: 'Monthly',
      effectiveDate: '2025-01-01',
      endDate: null,
      description: 'Downtown apartment lease'
    },
    {
      id: 3,
      include: true,
      name: 'Groceries',
      amount: -600,
      type: 'Variable Expense',
      account: 'PNC',
      frequency: 'Bi-weekly',
      effectiveDate: '2025-01-01',
      endDate: null,
      description: ''
    },
    {
      id: 4,
      include: true,
      name: 'Gym Membership',
      amount: -50,
      type: 'Cash Expense',
      account: 'PNC',
      frequency: 'Monthly',
      effectiveDate: '2025-01-01',
      endDate: '2025-06-30',
      description: ''
    },
    {
      id: 5,
      include: true,
      name: 'Holiday Gift',
      amount: -250,
      type: 'One Time Expenses',
      account: 'BOA',
      frequency: 'One-time',
      impactDate: '2025-12-20',
      description: 'Gift card for cousin',
      isDraft: true,
      scenarioId: 2
    },
    {
      id: 6,
      include: false,
      name: 'Car Insurance',
      amount: -120,
      type: 'Cash Expense',
      account: 'PNC',
      frequency: 'Monthly',
      effectiveDate: '2025-03-01',
      endDate: null,
      description: ''
    }
  ],
  cashFlowData: generateCashFlowData()
}

function generateCashFlowData() {
  const data = []
  const startDate = new Date('2025-05-24')
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    
    const dateStr = date.toISOString().split('T')[0]
    const dayOfMonth = date.getDate()
    
    // Generate sample data
    const income = dayOfMonth === 1 ? 5000 : 0
    const boa = dayOfMonth === 1 ? -2000 : 0
    const pnc = dayOfMonth === 1 ? -50 : (dayOfMonth % 14 === 0 ? -120 : 0)
    const variable = dayOfMonth % 14 === 0 ? -600 : 0
    const oneOff = (dayOfMonth === 20 && date.getMonth() === 11) ? -250 : 0
    
    const netCashFlow = income + boa + pnc + variable + oneOff
    const runningBalance = 15000 + (i * 50) + netCashFlow
    
    data.push({
      date: dateStr,
      income,
      boa,
      pnc,
      variable,
      reno: 0,
      oneOff,
      netCashFlow,
      runningBalance
    })
  }
  
  return data
}

export const chartData = [
  { month: 'May', committed: 15432, draft: 15432 },
  { month: 'Jun', committed: 16200, draft: 16100 },
  { month: 'Jul', committed: 16800, draft: 16600 },
  { month: 'Aug', committed: 17300, draft: 17000 },
  { month: 'Sep', committed: 17800, draft: 17400 },
  { month: 'Oct', committed: 18200, draft: 17800 },
  { month: 'Nov', committed: 18600, draft: 18200 },
  { month: 'Dec', committed: 18900, draft: 18650 }
]
