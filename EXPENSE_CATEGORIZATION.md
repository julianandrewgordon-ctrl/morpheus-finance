# Expense Categorization Update

## ✅ All Expense Types Now Categorized by Account

### Updated Logic

**All expense types are now decrements to cash flow and categorized by Account:**

1. **Cash Expense** → BOA or PNC column (based on Account)
2. **Variable Expense** → BOA or PNC column (based on Account)
3. **One Time Expense** → BOA or PNC column (based on Account)

### How It Works

**Type: Cash Expense, Variable Expense, or One Time Expense**
- ✅ All are **decrements** (subtract from) cash flow
- ✅ Amount should be **negative** (e.g., -2000, -600, -250)
- ✅ Categorized by **Account** field:
  - **BOA** → Goes to BOA column
  - **PNC** → Goes to PNC column
  - **Other** → Goes to One-off Expenses column
- ✅ Display in **red font** (negative values)

### Examples

**Cash Expense:**
```
Rule: Rent, -$2,000, Cash Expense, BOA, Monthly
Result: Appears in BOA column (red), subtracts $2,000 from cash flow
```

**Variable Expense:**
```
Rule: Groceries, -$600, Variable Expense, PNC, Bi-weekly
Result: Appears in PNC column (red), subtracts $600 from cash flow
```

**One Time Expense:**
```
Rule: Holiday Gift, -$250, One Time Expense, BOA, One-time
Result: Appears in BOA column (red), subtracts $250 from cash flow
```

### Complete Categorization Rules

| Type | Column | Effect | Account Matters? | Color |
|------|--------|--------|------------------|-------|
| **Income** | Income | Accretive (+) | No | Green |
| **Cash Expense** | BOA or PNC | Decrement (-) | Yes | Red |
| **Variable Expense** | BOA or PNC | Decrement (-) | Yes | Red |
| **One Time Expense** | BOA or PNC | Decrement (-) | Yes | Red |
| **Renovation/Moving Costs** | Reno Costs | Decrement (-) | No | Red |

### Visual Display

**Income (Green):**
- Positive amounts
- Green font color
- Adds to cash flow

**Expenses (Red):**
- Negative amounts
- Red font color
- Subtracts from cash flow

### Example Cash Flow Table

```
Date       | Income  | BOA      | PNC      | Net CF   | Running Balance
-----------|---------|----------|----------|----------|----------------
2025-01-01 | $5,000  | -$2,000  | -$50     | $2,950   | $12,950
           | (green) | (red)    | (red)    |          |
```

**Breakdown:**
- Income: $5,000 (Salary) - Green
- BOA: -$2,000 (Rent - Cash Expense) - Red
- PNC: -$50 (Gym - Cash Expense) - Red

### Test Cases

**Test 1: Cash Expense in BOA**
```
Rule: Test Expense, -$500, Cash Expense, BOA, Monthly, Jan 1
Expected: -$500 in BOA column (red) on Jan 1, Feb 1, Mar 1, etc.
```

**Test 2: Variable Expense in PNC**
```
Rule: Groceries, -$600, Variable Expense, PNC, Bi-weekly, Jan 1
Expected: -$600 in PNC column (red) on Jan 1, Jan 15, Jan 29, etc.
```

**Test 3: One Time Expense in BOA**
```
Rule: Holiday Gift, -$250, One Time Expense, BOA, One-time, Dec 20
Expected: -$250 in BOA column (red) on Dec 20 only
```

**Test 4: Mixed Expenses**
```
Rules:
- Rent: -$2,000, Cash Expense, BOA
- Gym: -$50, Cash Expense, PNC
- Groceries: -$600, Variable Expense, PNC
- Gift: -$250, One Time Expense, BOA

Expected on Jan 1:
- BOA: -$2,250 (Rent + Gift) - Red
- PNC: -$650 (Gym + Groceries) - Red
```

### Summary

✅ **All expense types** (Cash Expense, Variable Expense, One Time Expense) are now:
- Decrements to cash flow
- Categorized by Account (BOA or PNC)
- Displayed in red font

✅ **Income** remains:
- Accretive to cash flow
- In Income column
- Displayed in green font

✅ **Account field** now determines column for all expense types:
- BOA → BOA column
- PNC → PNC column
- Other → One-off Expenses column

The calculation engine now properly categorizes all expenses by account!
