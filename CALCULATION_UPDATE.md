# Calculation Engine Update

## ✅ Cash Flow Table Now Dynamically Calculated!

The cash flow table is now **dynamically generated** from your recurring rules and starting balance in real-time.

## What Changed

### Before
- Cash flow table used static mock data
- Starting balance was just for display
- Recurring rules didn't affect the table
- No connection between rules and cash flow

### After
- ✅ Cash flow table **calculated from recurring rules**
- ✅ Starting balance **determines running balance**
- ✅ Rules **automatically appear** in cash flow table
- ✅ Changes to rules **instantly update** the table
- ✅ Include checkbox **controls** what appears
- ✅ Tooltips show **actual transactions** from rules

## How It Works

```
Your Recurring Rules
        ↓
Calculation Engine
        ↓
Daily Cash Flow Entries
        ↓
Running Balance (from Starting Balance)
        ↓
Display in Table
```

## Real-Time Updates

The table **automatically recalculates** when you:

1. **Change Starting Balance** → All running balances update
2. **Add a Rule** → New transactions appear
3. **Delete a Rule** → Transactions disappear
4. **Toggle Include Checkbox** → Rule included/excluded
5. **Update Rule Amount** → Amounts adjust
6. **Change Frequency** → Transaction dates change
7. **Import Historical Data** → Past transactions added

## Example

**Setup:**
- Starting Balance: $15,000 (Jan 1, 2025)
- Rule 1: Salary, $5,000, Monthly, Effective: Jan 1
- Rule 2: Rent, -$2,000, Monthly, Effective: Jan 1

**Cash Flow Table Shows:**
```
Date       | Income  | BOA      | Net CF  | Running Balance
-----------|---------|----------|---------|----------------
2025-01-01 | $5,000  | -$2,000  | $3,000  | $18,000
2025-02-01 | $5,000  | -$2,000  | $3,000  | $21,000
2025-03-01 | $5,000  | -$2,000  | $3,000  | $24,000
```

**If you uncheck "Include" on Rent:**
```
Date       | Income  | BOA      | Net CF  | Running Balance
-----------|---------|----------|---------|----------------
2025-01-01 | $5,000  | $0       | $5,000  | $20,000
2025-02-01 | $5,000  | $0       | $5,000  | $25,000
2025-03-01 | $5,000  | $0       | $5,000  | $30,000
```

## Tooltips Show Real Data

Hover over any cell to see:
- **Actual transaction names** from your rules
- **Amounts** for each transaction
- **Draft indicators** (⚠) for scenario rules
- **Total** for that cell

**Example Tooltip:**
```
BREAKDOWN:
Salary: $5,000
Bonus: $1,000 ⚠

TOTAL: $6,000
```

## Test It Out

### Quick Test

1. **Go to Dashboard**
2. **Set Starting Balance** to $20,000 (Jan 1, 2025)
3. **Go to Recurring Rules**
4. **Add a rule**: Test Income, $1,000, Monthly, Jan 1
5. **Go back to Dashboard**
6. **Check cash flow table** - You should see:
   - $1,000 appearing on Jan 1, Feb 1, Mar 1, etc.
   - Running balance starting at $20,000
   - Running balance increasing by $1,000 each month

### Test Include Checkbox

1. **Go to Recurring Rules**
2. **Find "Salary" rule**
3. **Uncheck the Include checkbox**
4. **Go to Dashboard**
5. **Check cash flow table** - Salary transactions should be gone
6. **Go back and check the box again**
7. **Return to Dashboard** - Salary transactions should reappear

### Test Tooltips

1. **Go to Dashboard**
2. **Hover over any cell** with a value in the cash flow table
3. **See the breakdown** of transactions
4. **Verify** the names match your rules

## Summary Statistics

The summary cards at the top are also calculated from the cash flow data:

- **Current Balance**: Last day's running balance
- **Projected (EOY)**: Same as current balance
- **Total Income**: Sum of all income in the range
- **Total Expenses**: Sum of all expenses in the range
- **Balance Change**: Current Balance - Starting Balance

## Performance

The calculation is **optimized** with React useMemo:
- Only recalculates when data changes
- Cached for fast rendering
- Handles 365 days of data instantly

## Documentation

See **CALCULATION_ENGINE.md** for:
- Detailed explanation of how calculations work
- Frequency calculations (Monthly, Bi-weekly, etc.)
- Category assignment logic
- Example scenarios
- Troubleshooting guide
- Technical details

## Status

✅ **Fully implemented and working!**

**Running at**: http://localhost:5173/

The cash flow table is now a **living document** that reflects your actual financial rules and starting balance. Any change you make to rules or starting balance is immediately reflected in the table!
