// Cash Flow Calculator - Generates cash flow table from recurring rules

export function calculateCashFlowTable(rules, startingBalance, startingBalanceDate, startDate, endDate, historicalCashFlows = []) {
  const cashFlowData = []
  
  // Parse dates
  const start = new Date(startDate)
  const end = new Date(endDate)
  const balanceDate = new Date(startingBalanceDate)
  
  // Generate date range
  const dates = []
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d))
  }
  
  // Initialize running balance
  let runningBalance = startingBalance
  
  // Process each date
  dates.forEach(date => {
    const dateStr = date.toISOString().split('T')[0]
    
    // Initialize daily totals
    const dailyTotals = {
      date: dateStr,
      income: 0,
      boa: 0,
      pnc: 0,
      variable: 0,
      reno: 0,
      oneOff: 0,
      netCashFlow: 0,
      runningBalance: 0,
      transactions: []
    }
    
    // Add historical cash flows for this date
    const historicalForDate = historicalCashFlows.filter(cf => cf.date === dateStr)
    historicalForDate.forEach(cf => {
      const amount = cf.amount || 0
      let column = 'income'
      
      // Categorize by account and type
      if (amount > 0) {
        column = 'income'
        dailyTotals.income += amount
      } else {
        // Categorize expenses by account
        if (cf.account === 'BOA') {
          column = 'boa'
          dailyTotals.boa += amount
        } else if (cf.account === 'PNC') {
          column = 'pnc'
          dailyTotals.pnc += amount
        } else {
          column = 'oneOff'
          dailyTotals.oneOff += amount
        }
      }
      
      dailyTotals.transactions.push({
        name: cf.description,
        amount: amount,
        column: column,
        source: 'historical'
      })
    })
    
    // Process recurring rules for this date
    rules.forEach(rule => {
      if (!rule.include) return // Skip excluded rules
      
      let amount = rule.amount || 0
      let effectiveDate = null
      let endDate = null
      let shouldInclude = false
      
      // Check if rule has payment schedule
      if (rule.paymentSchedule && rule.paymentSchedule.length > 0) {
        // For payment schedules, we need to find which phase applies to this date
        // We'll check all phases to find the earliest one that could generate payments
        let earliestPhaseStart = null
        let latestPhaseEnd = null
        
        // Find the overall date range covered by all phases
        rule.paymentSchedule.forEach(phase => {
          // Parse dates as local dates to avoid timezone issues
          const phaseStart = new Date(phase.startDate + 'T00:00:00')
          const phaseEnd = phase.endDate ? new Date(phase.endDate + 'T00:00:00') : null
          
          if (!earliestPhaseStart || phaseStart < earliestPhaseStart) {
            earliestPhaseStart = phaseStart
          }
          if (!latestPhaseEnd || (phaseEnd && phaseEnd > latestPhaseEnd)) {
            latestPhaseEnd = phaseEnd
          }
        })
        
        // Set the effective date to the earliest phase start
        effectiveDate = earliestPhaseStart
        endDate = latestPhaseEnd
        
        // Now find which phase is active for this specific date
        const activePhase = rule.paymentSchedule.find(phase => {
          // Parse dates as local dates to avoid timezone issues
          const phaseStart = new Date(phase.startDate + 'T00:00:00')
          const phaseEnd = phase.endDate ? new Date(phase.endDate + 'T00:00:00') : null
          return date >= phaseStart && (!phaseEnd || date <= phaseEnd)
        })
        
        if (!activePhase) return // No active phase for this date
        
        // Parse and validate phase amount
        const phaseAmount = parseFloat(activePhase.amount)
        if (isNaN(phaseAmount)) return // Skip if amount is not a valid number
        
        amount = phaseAmount
      } else {
        // Use legacy single amount/date
        if (rule.frequency === 'One-time') {
          // One-time transaction
          if (rule.impactDate === dateStr) {
            shouldInclude = true
          }
        } else {
          // Recurring transaction
          if (!rule.effectiveDate) return // Skip if no effective date
          
          effectiveDate = new Date(rule.effectiveDate)
          endDate = rule.endDate ? new Date(rule.endDate) : null
        }
      }
      
      // For payment schedule or recurring rules
      if (rule.frequency !== 'One-time' && effectiveDate) {
        
        // Check if date is within rule's active period
        // Must be on or after effective date
        // Must be on or before end date (if end date exists)
        // Must be on or after starting balance date (for display)
        if (date >= effectiveDate && (!endDate || date <= endDate) && date >= balanceDate) {
          // Calculate frequency from ORIGINAL effective date (not adjusted)
          const daysSinceEffective = Math.floor((date - effectiveDate) / (1000 * 60 * 60 * 24))
          
          if (rule.frequency === 'Monthly') {
            // Monthly on the same day of month
            if (date.getDate() === effectiveDate.getDate()) {
              shouldInclude = true
            }
          } else if (rule.frequency === 'Bi-weekly') {
            // Every 14 days from original effective date
            if (daysSinceEffective % 14 === 0) {
              shouldInclude = true
            }
          } else if (rule.frequency === 'Weekly') {
            // Every 7 days from original effective date
            if (daysSinceEffective % 7 === 0) {
              shouldInclude = true
            }
          } else if (rule.intervalDays) {
            // Custom interval from original effective date
            if (daysSinceEffective % rule.intervalDays === 0) {
              shouldInclude = true
            }
          }
        }
      }
      
      if (shouldInclude) {
        // Determine which column this transaction belongs to
        let column = 'income' // default
        let finalAmount = amount
        
        // Categorize by type - order matters!
        // Defensive: ensure expenses are negative and income is positive
        if (rule.type === 'Income') {
          column = 'income'
          finalAmount = amount < 0 ? Math.abs(amount) : amount
          dailyTotals.income += finalAmount
        } else if (rule.type === 'Variable Expense') {
          column = 'variable'
          finalAmount = amount > 0 ? -amount : amount
          dailyTotals.variable += finalAmount
        } else if (rule.type === 'Renovation/Moving Costs') {
          column = 'reno'
          finalAmount = amount > 0 ? -amount : amount
          dailyTotals.reno += finalAmount
        } else if (rule.type === 'One Time Expenses') {
          column = 'oneOff'
          finalAmount = amount > 0 ? -amount : amount
          dailyTotals.oneOff += finalAmount
        } else if (rule.type === 'Cash Expense') {
          finalAmount = amount > 0 ? -amount : amount
          if (rule.account === 'BOA') {
            column = 'boa'
            dailyTotals.boa += finalAmount
          } else if (rule.account === 'PNC') {
            column = 'pnc'
            dailyTotals.pnc += finalAmount
          } else {
            column = 'oneOff'
            dailyTotals.oneOff += finalAmount
          }
        } else {
          // Default: if positive, it's income; if negative, categorize by account
          if (amount > 0) {
            column = 'income'
            finalAmount = amount
            dailyTotals.income += finalAmount
          } else {
            finalAmount = amount
            if (rule.account === 'BOA') {
              column = 'boa'
              dailyTotals.boa += finalAmount
            } else if (rule.account === 'PNC') {
              column = 'pnc'
              dailyTotals.pnc += finalAmount
            } else {
              column = 'oneOff'
              dailyTotals.oneOff += finalAmount
            }
          }
        }
        
        // Find active phase info for tooltip
        let phaseInfo = null
        if (rule.paymentSchedule && rule.paymentSchedule.length > 0) {
          const activePhase = rule.paymentSchedule.find(phase => {
            const phaseStart = new Date(phase.startDate)
            const phaseEnd = phase.endDate ? new Date(phase.endDate) : null
            return date >= phaseStart && (!phaseEnd || date <= phaseEnd)
          })
          if (activePhase) {
            phaseInfo = {
              description: activePhase.description,
              phaseNumber: rule.paymentSchedule.indexOf(activePhase) + 1,
              totalPhases: rule.paymentSchedule.length
            }
          }
        }
        
        // Add transaction with column metadata
        dailyTotals.transactions.push({
          name: rule.name,
          amount: finalAmount,
          column: column,
          source: 'rule',
          ruleId: rule.id,
          isDraft: rule.isDraft,
          scenarioId: rule.scenarioId,
          phaseInfo: phaseInfo
        })
      }
    })
    
    // Calculate net cash flow
    // Net CF = Income - BOA - PNC - Variable - Reno - OneOff
    // (Note: expense values are already negative, so we subtract them which makes them positive deductions)
    dailyTotals.netCashFlow = dailyTotals.income - Math.abs(dailyTotals.boa) - Math.abs(dailyTotals.pnc) - 
                               Math.abs(dailyTotals.variable) - Math.abs(dailyTotals.reno) - Math.abs(dailyTotals.oneOff)
    
    // Calculate running balance
    // Running Balance = Previous Balance + Net Cash Flow
    // Only process transactions on or after starting balance date
    if (date >= balanceDate) {
      runningBalance += dailyTotals.netCashFlow
      dailyTotals.runningBalance = runningBalance
    } else {
      // Before starting balance date, show starting balance
      dailyTotals.runningBalance = startingBalance
    }
    
    cashFlowData.push(dailyTotals)
  })
  
  return cashFlowData
}

export function calculateSummary(cashFlowData, startingBalance) {
  if (!cashFlowData || cashFlowData.length === 0) {
    return {
      currentBalance: startingBalance,
      projectedEOY: startingBalance,
      totalIncome: 0,
      totalExpenses: 0,
      balanceChange: 0
    }
  }
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0]
  
  // Find today's entry in the cash flow data
  const todayEntry = cashFlowData.find(day => day.date === today)
  
  // Current balance is today's running balance, or the most recent date before today
  let currentBalance = startingBalance
  if (todayEntry) {
    currentBalance = todayEntry.runningBalance
  } else {
    // If today is not in the data, find the most recent date before today
    const pastEntries = cashFlowData.filter(day => day.date <= today)
    if (pastEntries.length > 0) {
      currentBalance = pastEntries[pastEntries.length - 1].runningBalance
    }
  }
  
  // Projected EOY is the last entry in the data (end of projection period)
  const projectedEOY = cashFlowData[cashFlowData.length - 1]?.runningBalance || startingBalance
  
  // Calculate totals for the entire projection period
  const totalIncome = cashFlowData.reduce((sum, day) => sum + (day.income || 0), 0)
  const totalExpenses = Math.abs(cashFlowData.reduce((sum, day) => {
    return sum + (day.boa || 0) + (day.pnc || 0) + (day.variable || 0) + 
           (day.reno || 0) + (day.oneOff || 0)
  }, 0))
  
  const balanceChange = currentBalance - startingBalance
  
  return {
    currentBalance,
    projectedEOY,
    totalIncome,
    totalExpenses,
    balanceChange
  }
}
