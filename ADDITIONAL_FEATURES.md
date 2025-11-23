# Additional Features Guide

## Overview

Three new powerful features have been added to the Personal Finance Manager:

1. ✅ **Starting Balance** - Set your initial balance and date
2. ✅ **Historical Cash Flow Import** - Import past transactions
3. ✅ **Scenario Assignment for Rules** - Assign rules to specific scenarios

---

## 1. Starting Balance

### What It Does

Set your account's starting balance and the date it applies from. This is the foundation for all running balance calculations.

### How to Use

1. Navigate to **Dashboard** tab
2. Click **"Set Starting Balance"** button in the header
3. A modal will open with two fields:
   - **Starting Balance**: Enter the amount (e.g., 15000)
   - **As of Date**: Select the date this balance applies from
4. Click **"Save"**

### Display

The starting balance is prominently displayed at the top of the Dashboard:
- Amount in large text
- "As of [date]" below it

### Example Use Cases

- **New user setup**: Set your current account balance as of today
- **Historical tracking**: Set balance from a past date to track forward
- **Account reconciliation**: Adjust starting balance to match bank statement
- **Multiple profiles**: Each profile can have its own starting balance

### Important Notes

- The starting balance is the baseline for all running balance calculations
- Changing the starting balance recalculates all running balances
- Each profile has its own independent starting balance
- Default starting balance is $15,000 as of 2025-01-01

---

## 2. Historical Cash Flow Import

### What It Does

Import past transactions (historical cash flows) to build a complete financial history. This is useful for:
- Tracking actual past expenses
- Comparing projections vs. actuals
- Building a complete financial picture
- Reconciling with bank statements

### How to Use

1. Navigate to **Dashboard** tab
2. Click **"Import Historical Data"** button in the header
3. A modal will open for batch import
4. Paste your historical transactions in CSV or JSON format
5. Click **"Import"**

### CSV Format

Each line should contain: `Date, Description, Amount, Category, Account`

**Example:**
```csv
2025-01-15, Paycheck, 5000, Income, BOA
2025-01-20, Grocery Store, -150, Variable Expense, PNC
2025-02-01, Rent Payment, -2000, Cash Expense, BOA
2025-02-05, Gas Station, -45, Variable Expense, PNC
2025-02-15, Paycheck, 5000, Income, BOA
```

**Field Details:**
- **Date** (required): YYYY-MM-DD format
- **Description** (required): What the transaction was for
- **Amount** (required): Positive for income, negative for expenses
- **Category** (optional, default: Other): Income, Cash Expense, Variable Expense, etc.
- **Account** (optional, default: BOA): BOA, PNC, Other

### JSON Format

One JSON object per line:

**Example:**
```json
{"date": "2025-01-15", "description": "Paycheck", "amount": 5000, "category": "Income", "account": "BOA"}
{"date": "2025-01-20", "description": "Grocery Store", "amount": -150, "category": "Variable Expense", "account": "PNC"}
```

### Success/Error Messages

- **Success**: Green flash message showing "Successfully added X historical cash flow(s)"
- **Error**: Red flash message if parsing fails with details

### Use Cases

**Scenario 1: New User with Bank History**
1. Export transactions from your bank (CSV format)
2. Format them to match the required format
3. Import all past 6 months of transactions
4. Set starting balance to match the earliest transaction date

**Scenario 2: Reconciliation**
1. Import actual transactions from last month
2. Compare against projected cash flows
3. Identify discrepancies
4. Adjust recurring rules for better accuracy

**Scenario 3: Tax Preparation**
1. Import all transactions for the year
2. Filter by category
3. Export for tax purposes
4. Have complete record of income and expenses

### Tips

- **Date format matters**: Use YYYY-MM-DD format consistently
- **Negative for expenses**: Remember to use negative amounts for expenses
- **Batch import**: Import multiple months at once for efficiency
- **Backup first**: Keep a copy of your data before importing
- **Verify after import**: Check that all transactions imported correctly

---

## 3. Scenario Assignment for Rules

### What It Does

Assign individual recurring rules to specific scenarios. This allows you to:
- Create "what-if" scenarios with specific rules
- Test different financial decisions
- Compare multiple scenarios side-by-side
- Keep rules organized by scenario

### How to Use

#### Method 1: From Recurring Rules Table

1. Navigate to **Recurring Rules** tab
2. Find the rule you want to assign
3. Click the **Actions** dropdown (⋮)
4. Select **"Assign to Scenario"**
5. A modal will open
6. Select a scenario from the dropdown (or "None" for committed plan)
7. Click **"Save"**

#### Method 2: When Adding New Rule

1. Click **"Quick Add Transaction"**
2. Fill in the transaction details
3. Check **"Add as Draft/Scenario Entry"**
4. Select the scenario from the dropdown
5. Click **"Add Transaction"**

### Visual Indicators

Rules assigned to scenarios show:
- **Badge** with scenario name next to the rule name
- **Draft badge** (blue) indicating it's a scenario rule
- Different styling to distinguish from committed rules

### Scenario Options

- **None (Committed Plan)**: Rule is part of the baseline/committed plan
- **Gift Card A**: Assign to "Gift Card A" scenario
- **Car Purchase**: Assign to "Car Purchase" scenario
- **Custom scenarios**: Any scenarios you've created

### How It Works

**When a rule is assigned to a scenario:**
- It's marked as `isDraft = true`
- It's linked to the scenario via `scenarioId`
- It only appears in calculations when that scenario is active
- It's visually distinguished in the rules table

**When a rule is not assigned (None):**
- It's part of the committed/baseline plan
- It appears in all scenarios
- It's marked as `isDraft = false`
- No scenario badge is shown

### Example Use Cases

**Scenario 1: Testing a Major Purchase**
1. Create scenario "New Car Purchase"
2. Add rule "Car Payment" with -$500/month
3. Assign to "New Car Purchase" scenario
4. Add rule "Car Insurance" with -$150/month
5. Assign to "New Car Purchase" scenario
6. Compare running balance with and without the car

**Scenario 2: Job Change Analysis**
1. Create scenario "New Job Offer"
2. Add rule "New Salary" with higher amount
3. Assign to "New Job Offer" scenario
4. Add rule "Commute Costs" with -$200/month
5. Assign to "New Job Offer" scenario
6. See net impact of job change

**Scenario 3: Lifestyle Changes**
1. Create scenario "Gym Membership"
2. Add rule "Gym" with -$50/month
3. Assign to "Gym Membership" scenario
4. Create scenario "Meal Prep Service"
5. Add rule "Meal Prep" with -$300/month
6. Assign to "Meal Prep Service" scenario
7. Compare both lifestyle options

### Managing Scenario Assignments

**To Change Assignment:**
1. Click Actions → "Assign to Scenario"
2. Select different scenario
3. Save

**To Remove Assignment:**
1. Click Actions → "Assign to Scenario"
2. Select "None (Committed Plan)"
3. Save

**To Delete Scenario Rule:**
1. Click Actions → "Delete"
2. Rule is permanently removed

### Best Practices

1. **Use descriptive scenario names** - Makes it clear what you're testing
2. **Group related rules** - Assign all related rules to the same scenario
3. **Keep committed plan clean** - Only include confirmed expenses/income
4. **Test one thing at a time** - Don't mix multiple decisions in one scenario
5. **Document assumptions** - Use rule descriptions to note assumptions

---

## Feature Interactions

### Starting Balance + Historical Cash Flows

**Recommended Workflow:**
1. Set starting balance to your earliest known balance
2. Import all historical transactions from that date forward
3. Verify running balance matches current actual balance
4. If discrepancy exists, adjust starting balance or add missing transactions

### Starting Balance + Scenarios

- Starting balance applies to ALL scenarios
- Each scenario starts from the same baseline
- Scenarios only differ in which rules are included
- Running balance calculations use the same starting point

### Historical Cash Flows + Scenarios

- Historical cash flows are actual transactions (not projections)
- They appear in all scenarios
- Scenario rules are projections/what-ifs
- Historical data provides context for scenario planning

### Scenario Assignment + Include Checkbox

- Include checkbox works independently of scenario assignment
- Unchecking "Include" excludes the rule from ALL scenarios
- Scenario assignment determines WHICH scenario the rule appears in
- Both work together for fine-grained control

---

## Data Structure

### Starting Balance
```javascript
{
  startingBalance: 15000.00,
  startingBalanceDate: '2025-01-01'
}
```

### Historical Cash Flow
```javascript
{
  id: 123,
  date: '2025-01-15',
  description: 'Paycheck',
  amount: 5000,
  category: 'Income',
  account: 'BOA'
}
```

### Rule with Scenario Assignment
```javascript
{
  id: 5,
  name: 'Holiday Gift',
  amount: -250,
  type: 'One Time Expense',
  account: 'BOA',
  frequency: 'One-time',
  impactDate: '2025-12-20',
  description: 'Gift card for cousin',
  isDraft: true,
  scenarioId: 2,  // Assigned to scenario with id 2
  include: true
}
```

---

## Troubleshooting

### Starting Balance Not Updating
- **Check date format**: Must be YYYY/MM/DD
- **Check amount**: Must be a valid number
- **Refresh page**: Try refreshing if UI is stuck

### Historical Import Failing
- **Check CSV format**: Ensure commas separate fields
- **Check date format**: Must be YYYY-MM-DD
- **Check amounts**: Must be valid numbers
- **Check for blank lines**: Remove empty lines
- **Try one line first**: Test with a single transaction

### Scenario Assignment Not Showing
- **Check if scenario exists**: Scenario must be created first
- **Check badge display**: Look for grey badge with scenario name
- **Refresh table**: Try filtering to refresh the view
- **Check Actions menu**: Ensure "Assign to Scenario" option appears

### Rules Not Appearing in Scenario
- **Check scenario assignment**: Verify rule is assigned to correct scenario
- **Check include checkbox**: Must be checked
- **Check scenario selector**: Ensure correct scenario is selected on Dashboard
- **Check date range**: Rule must have dates within visible range

---

## API Reference (for developers)

### New Props - Dashboard Component

```jsx
<Dashboard
  data={data}
  onQuickAdd={handleQuickAdd}
  cashFlowStartDate={startDate}
  onStartDateChange={handleDateChange}
  onUpdateScenario={handleUpdateScenario}
  onUpdateStartingBalance={handleUpdateStartingBalance}  // NEW
  onAddHistoricalCashFlow={handleAddHistorical}          // NEW
  onBatchAddHistoricalCashFlows={handleBatchHistorical}  // NEW
  onDeleteHistoricalCashFlow={handleDeleteHistorical}    // NEW
/>
```

### New Props - RecurringRules Component

```jsx
<RecurringRules
  rules={rules}
  scenarios={scenarios}  // NEW - needed for scenario assignment
  onAddRule={handleAddRule}
  onBatchAdd={handleBatchAdd}
  onDeleteRule={handleDeleteRule}
  onToggleInclude={handleToggle}
  onUpdateRule={handleUpdateRule}
/>
```

### Handler Signatures

```javascript
// Update starting balance
handleUpdateStartingBalance(balance: number, date: string)

// Add single historical cash flow
handleAddHistoricalCashFlow(cashFlow: object)

// Add multiple historical cash flows
handleBatchAddHistoricalCashFlows(cashFlows: array)

// Delete historical cash flow
handleDeleteHistoricalCashFlow(id: number)
```

---

## Summary

All three features are now implemented and working:

✅ **Starting Balance** - Set initial balance and date
✅ **Historical Cash Flow Import** - Import past transactions via CSV/JSON
✅ **Scenario Assignment** - Assign rules to specific scenarios

These features work together to provide:
- Complete financial history tracking
- Accurate running balance calculations
- Flexible scenario modeling
- Better financial decision-making

The app now supports the full lifecycle:
1. Set starting balance
2. Import historical data
3. Create recurring rules
4. Assign rules to scenarios
5. Compare scenarios
6. Make informed decisions

**Ready to use at**: http://localhost:5173/
