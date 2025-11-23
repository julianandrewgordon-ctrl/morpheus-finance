# Cash Flow Calculation Engine

## Overview

The Personal Finance Manager now includes a **real-time calculation engine** that dynamically generates the cash flow table based on:
1. **Starting Balance** - Your initial account balance
2. **Recurring Rules** - Your income and expense rules
3. **Historical Cash Flows** - Past actual transactions

## How It Works

### Data Flow

```
Starting Balance + Starting Date
         ↓
Recurring Rules (with frequencies)
         ↓
Historical Cash Flows (actual past)
         ↓
CALCULATION ENGINE
         ↓
Daily Cash Flow Entries (365 days)
         ↓
Running Balance Calculation
         ↓
Summary Statistics
         ↓
Display in Table & Chart
```

### Calculation Process

For each day in the date range (365 days):

1. **Initialize Daily Totals**
   - Income: $0
   - BOA: $0
   - PNC: $0
   - Variable Expenses: $0
   - Reno Costs: $0
   - One-off Expenses: $0

2. **Add Historical Cash Flows**
   - Find all historical transactions for this date
   - Add to appropriate category
   - Track transaction details for tooltips

3. **Process Recurring Rules**
   - For each rule where `include = true`:
     - Check if rule applies to this date based on frequency
     - If yes, add amount to appropriate category
     - Track transaction details for tooltips

4. **Calculate Net Cash Flow**
   - Net CF = Income + BOA + PNC + Variable + Reno + One-off
   - (Note: Expenses are negative, so this is actually Income - Expenses)

5. **Calculate Running Balance**
   - Running Balance = Previous Day Balance + Net Cash Flow
   - First day starts from Starting Balance

6. **Store Daily Entry**
   - Save all totals and transaction details
   - Used for table display and tooltips

### Frequency Calculations

**Monthly:**
- Occurs on the same day of each month
- Example: Effective Date = Jan 15 → Occurs on 15th of every month

**Bi-weekly:**
- Occurs every 14 days from Effective Date
- Example: Effective Date = Jan 1 → Jan 1, Jan 15, Jan 29, Feb 12, etc.

**Weekly:**
- Occurs every 7 days from Effective Date
- Example: Effective Date = Jan 1 → Jan 1, Jan 8, Jan 15, Jan 22, etc.

**One-time:**
- Occurs only on Impact Date
- Example: Impact Date = Dec 20 → Only occurs on Dec 20

**Custom Interval:**
- Occurs every X days (specified in intervalDays)
- Example: intervalDays = 30 → Every 30 days from Effective Date

### Category Assignment

Rules are categorized based on **Type** and **Account**:

**Income (amount > 0):**
- All positive amounts go to "Income" column

**Cash Expense:**
- BOA account → "BOA" column
- PNC account → "PNC" column
- Other account → "One-off Expenses" column

**Variable Expense:**
- All accounts → "Variable Expenses" column

**Renovation/Moving Costs:**
- All accounts → "Reno Costs" column

**One Time Expense:**
- All accounts → "One-off Expenses" column

### Running Balance Calculation

```
Day 1: Starting Balance + Day 1 Net CF = Day 1 Running Balance
Day 2: Day 1 Running Balance + Day 2 Net CF = Day 2 Running Balance
Day 3: Day 2 Running Balance + Day 3 Net CF = Day 3 Running Balance
...and so on
```

**Example:**
```
Starting Balance: $15,000
Day 1: +$5,000 (Salary) -$2,000 (Rent) = +$3,000 → Balance: $18,000
Day 2: -$50 (Gym) = -$50 → Balance: $17,950
Day 3: $0 = $0 → Balance: $17,950
Day 4: -$600 (Groceries) = -$600 → Balance: $17,350
```

## Real-Time Updates

The calculation engine **automatically recalculates** when:

✅ **Starting Balance changes** - All running balances update
✅ **Starting Balance Date changes** - Calculation baseline shifts
✅ **Recurring Rule added** - New transactions appear
✅ **Recurring Rule deleted** - Transactions disappear
✅ **Recurring Rule updated** - Transactions recalculate
✅ **Include checkbox toggled** - Rule included/excluded
✅ **Historical Cash Flow imported** - Past transactions added
✅ **Cash Flow Start Date changes** - Table filters to new range

### Performance Optimization

The calculation uses **React useMemo** to:
- Only recalculate when dependencies change
- Cache results for fast rendering
- Prevent unnecessary recalculations

```javascript
const cashFlowData = useMemo(() => {
  return calculateCashFlowTable(
    rules,
    startingBalance,
    startingBalanceDate,
    startDate,
    endDate,
    historicalCashFlows
  )
}, [rules, startingBalance, startingBalanceDate, startDate, endDate, historicalCashFlows])
```

## Summary Calculations

The summary statistics are calculated from the cash flow data:

**Current Balance:**
- Running balance of the last day in the range

**Projected EOY:**
- Same as current balance (last day of projection)

**Total Income:**
- Sum of all positive cash flows in the range

**Total Expenses:**
- Sum of all negative cash flows in the range (absolute value)

**Balance Change:**
- Current Balance - Starting Balance

## Transaction Details in Tooltips

When you hover over a cell in the cash flow table, you see:

**Breakdown:**
- List of all transactions contributing to that cell
- Transaction name and amount
- Draft indicator (⚠) for scenario rules

**Example Tooltip:**
```
BREAKDOWN:
Salary: $5,000
Bonus: $1,000 ⚠

TOTAL: $6,000
```

## Example Scenarios

### Scenario 1: Simple Monthly Salary

**Setup:**
- Starting Balance: $10,000 (as of Jan 1, 2025)
- Rule: Salary, $5,000, Monthly, Effective: Jan 1

**Result:**
- Jan 1: $10,000 + $5,000 = $15,000
- Feb 1: $15,000 + $5,000 = $20,000
- Mar 1: $20,000 + $5,000 = $25,000

### Scenario 2: Salary and Rent

**Setup:**
- Starting Balance: $10,000 (as of Jan 1, 2025)
- Rule 1: Salary, $5,000, Monthly, Effective: Jan 1
- Rule 2: Rent, -$2,000, Monthly, Effective: Jan 1

**Result:**
- Jan 1: $10,000 + $5,000 - $2,000 = $13,000
- Feb 1: $13,000 + $5,000 - $2,000 = $16,000
- Mar 1: $16,000 + $5,000 - $2,000 = $19,000

### Scenario 3: Bi-weekly Groceries

**Setup:**
- Starting Balance: $10,000 (as of Jan 1, 2025)
- Rule: Groceries, -$600, Bi-weekly, Effective: Jan 1

**Result:**
- Jan 1: $10,000 - $600 = $9,400
- Jan 15: $9,400 - $600 = $8,800
- Jan 29: $8,800 - $600 = $8,200
- Feb 12: $8,200 - $600 = $7,600

### Scenario 4: One-time Expense

**Setup:**
- Starting Balance: $10,000 (as of Jan 1, 2025)
- Rule: Holiday Gift, -$250, One-time, Impact: Dec 20

**Result:**
- Jan 1 - Dec 19: Balance stays at $10,000
- Dec 20: $10,000 - $250 = $9,750
- Dec 21 onwards: Balance stays at $9,750

### Scenario 5: Rule with End Date

**Setup:**
- Starting Balance: $10,000 (as of Jan 1, 2025)
- Rule: Gym, -$50, Monthly, Effective: Jan 1, End: Jun 30

**Result:**
- Jan 1: $10,000 - $50 = $9,950
- Feb 1: $9,950 - $50 = $9,900
- ...
- Jun 1: Balance - $50
- Jul 1: No gym charge (rule ended)
- Aug 1: No gym charge

### Scenario 6: Excluded Rule

**Setup:**
- Starting Balance: $10,000 (as of Jan 1, 2025)
- Rule: Car Insurance, -$120, Monthly, Include: ☐ (unchecked)

**Result:**
- All days: Balance stays at $10,000
- Rule is ignored because Include = false

### Scenario 7: Historical + Recurring

**Setup:**
- Starting Balance: $10,000 (as of Jan 1, 2025)
- Historical: Jan 5, Bonus, $1,000
- Rule: Salary, $5,000, Monthly, Effective: Jan 1

**Result:**
- Jan 1: $10,000 + $5,000 = $15,000
- Jan 5: $15,000 + $1,000 = $16,000
- Feb 1: $16,000 + $5,000 = $21,000

## Testing the Calculation Engine

### Test 1: Verify Starting Balance

1. Set Starting Balance to $20,000 as of Jan 1
2. Check first row of cash flow table
3. Running Balance should start at $20,000

### Test 2: Verify Monthly Rule

1. Add rule: Test Income, $1,000, Monthly, Effective: Jan 1
2. Check cash flow table
3. Should see $1,000 on Jan 1, Feb 1, Mar 1, etc.
4. Running balance should increase by $1,000 each month

### Test 3: Verify Include Checkbox

1. Find any rule in Recurring Rules
2. Uncheck the Include checkbox
3. Go to Dashboard
4. Rule's transactions should disappear from cash flow table
5. Running balance should adjust accordingly

### Test 4: Verify Historical Import

1. Import: `2025-01-15, Test, 500, Income, BOA`
2. Check cash flow table for Jan 15
3. Should see $500 in Income column
4. Running balance should increase by $500

### Test 5: Verify Tooltips

1. Hover over any cell with a value
2. Tooltip should show transaction breakdown
3. Should list all transactions contributing to that cell
4. Total should match cell value

## Troubleshooting

### Running Balance Doesn't Match Expected

**Check:**
- Starting Balance is set correctly
- Starting Balance Date is correct
- All rules have correct amounts (negative for expenses)
- Include checkbox is checked for rules you want
- Effective Dates are correct
- No duplicate rules

### Transactions Not Appearing

**Check:**
- Rule Include checkbox is checked
- Effective Date is before the date you're looking at
- End Date (if set) is after the date you're looking at
- Frequency is set correctly
- Cash Flow Start Date includes the date range

### Tooltips Show Wrong Transactions

**Check:**
- Rules are categorized correctly (Type and Account)
- Historical cash flows have correct categories
- No duplicate transactions on the same date

### Performance Issues

**If calculation is slow:**
- Reduce date range (use Start Date filter)
- Reduce number of rules
- Remove unnecessary historical cash flows
- Check for infinite loops in custom intervals

## Technical Details

### File: `src/utils/cashFlowCalculator.js`

**Main Functions:**

1. `calculateCashFlowTable(rules, startingBalance, startingBalanceDate, startDate, endDate, historicalCashFlows)`
   - Generates daily cash flow entries
   - Returns array of daily totals with transaction details

2. `calculateSummary(cashFlowData, startingBalance)`
   - Calculates summary statistics
   - Returns object with totals and balances

### Data Structures

**Daily Cash Flow Entry:**
```javascript
{
  date: '2025-01-15',
  income: 5000,
  boa: -2000,
  pnc: -50,
  variable: -600,
  reno: 0,
  oneOff: 0,
  netCashFlow: 2350,
  runningBalance: 17350,
  transactions: [
    { name: 'Salary', amount: 5000, source: 'rule', ruleId: 1 },
    { name: 'Rent', amount: -2000, source: 'rule', ruleId: 2 },
    { name: 'Gym', amount: -50, source: 'rule', ruleId: 4 },
    { name: 'Groceries', amount: -600, source: 'rule', ruleId: 3 }
  ]
}
```

**Summary Object:**
```javascript
{
  currentBalance: 18900.00,
  projectedEOY: 18900.00,
  totalIncome: 45000.00,
  totalExpenses: 31567.50,
  balanceChange: 3900.00
}
```

## Summary

The calculation engine provides:

✅ **Real-time calculations** - Updates instantly when data changes
✅ **Accurate projections** - Based on your actual rules
✅ **Detailed breakdowns** - See exactly what contributes to each day
✅ **Flexible scenarios** - Test different financial decisions
✅ **Historical tracking** - Combine past and future data
✅ **Performance optimized** - Fast calculations with caching

The cash flow table is now a **living document** that reflects your current financial rules and starting balance, making it easy to see the impact of any changes immediately.
