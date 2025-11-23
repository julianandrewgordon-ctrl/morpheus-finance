# Column Exclusivity Fix

## Problem
Transactions were appearing in multiple columns simultaneously. For example, on December 1st, the same expense entries were showing up in both BOA and PNC columns (and potentially other expense columns).

## Root Cause
The CashFlowTable component was filtering transactions for display based on amount sign (positive vs negative) rather than by which column they actually belonged to. This meant:
- Any transaction with a negative amount would appear in ALL expense columns (BOA, PNC, Variable, Reno, OneOff)
- The tooltip breakdown would show the same transactions across multiple columns
- Columns were not mutually exclusive as intended

## Solution

### 1. Added Column Metadata to Transactions
Modified the cash flow calculator to tag each transaction with its assigned column:

```javascript
dailyTotals.transactions.push({
  name: rule.name,
  amount: finalAmount,
  column: column,  // NEW: tracks which column this belongs to
  source: 'rule',
  ruleId: rule.id,
  isDraft: rule.isDraft,
  scenarioId: rule.scenarioId
})
```

Possible column values:
- `income` - Income column
- `boa` - BOA expense column
- `pnc` - PNC expense column
- `variable` - Variable Expenses column
- `reno` - Reno Costs column
- `oneOff` - One-off Expenses column

### 2. Updated Transaction Categorization Logic
Refactored the categorization to:
1. Determine the correct column based on transaction type
2. Apply sign correction (expenses negative, income positive)
3. Add to the appropriate column total
4. Tag the transaction with column metadata

### 3. Updated CashFlowTable Filtering
Changed from amount-based filtering to column-based filtering:

**Before:**
```javascript
// Income column should only show positive amounts
transactions = transactions.filter(t => t.amount > 0)
// Expense columns should only show negative amounts
transactions = transactions.filter(t => t.amount < 0)
```

**After:**
```javascript
// Filter by column metadata - mutually exclusive
let transactions = (item.transactions || []).filter(t => t.column === field)
```

## Column Assignment Rules

### Income Column
- Type = 'Income'
- Any transaction with positive amount and no specific type

### BOA Column
- Type = 'Cash Expense' AND Account = 'BOA'
- Default for negative amounts with Account = 'BOA'

### PNC Column
- Type = 'Cash Expense' AND Account = 'PNC'
- Default for negative amounts with Account = 'PNC'

### Variable Expenses Column
- Type = 'Variable Expense' (regardless of account)

### Reno Costs Column
- Type = 'Renovation/Moving Costs'

### One-off Expenses Column
- Type = 'One Time Expenses'
- Cash Expenses with Account = 'Other'
- Default for expenses that don't match other categories

## Impact

### Mutual Exclusivity Enforced
- Each transaction now appears in exactly ONE column
- No more duplicate entries across columns
- Tooltip breakdowns show only transactions that belong to that specific column

### Accurate Totals
- Column totals now accurately reflect only the transactions assigned to that column
- Net cash flow calculation remains correct
- Running balance calculation unaffected

### Historical Cash Flows
- Also updated to include column metadata
- Categorized by account (BOA/PNC) or as one-off expenses
- Follows the same mutual exclusivity rules

## Testing

After this fix, verify:
1. Check December 1st - transactions should appear in only one column each
2. Hover over column values - tooltip should show only relevant transactions
3. Add a new Cash Expense with BOA account - should appear only in BOA column
4. Add a Variable Expense - should appear only in Variable Expenses column
5. Sum all columns - should equal the net cash flow

## Files Modified

1. `src/utils/cashFlowCalculator.js`
   - Added column metadata to transaction objects
   - Refactored categorization logic to determine column first
   - Applied to both recurring rules and historical cash flows

2. `src/components/CashFlowTable.jsx`
   - Changed filtering from amount-based to column-based
   - Simplified renderCellWithTooltip logic
   - Removed redundant amount filtering

## Technical Details

### Transaction Object Structure
```javascript
{
  name: "Rent",
  amount: -2000,
  column: "boa",        // NEW: explicit column assignment
  source: "rule",
  ruleId: 2,
  isDraft: false,
  scenarioId: null
}
```

### Performance
- No performance impact
- Filtering by column is as fast as filtering by amount
- Column metadata adds minimal memory overhead (< 10 bytes per transaction)
