# Cash Flow Calculation Rules

## Updated Calculation Logic

The calculation engine now follows these specific rules:

### 1. Income Rules ✅

**Type: "Income"**
- ✅ All income goes to the **Income column**
- ✅ Income is **accretive** (adds to) cash flow
- ✅ Amount should be **positive** (e.g., 5000)
- ✅ Account doesn't matter for income - always goes to Income column

**Example:**
```
Rule: Salary, $5,000, Income, BOA, Monthly
Result: Appears in Income column, adds $5,000 to cash flow
```

---

### 2. Cash Expense Rules ✅

**Type: "Cash Expense"**
- ✅ All cash expenses are **decrements** (subtract from) cash flow
- ✅ Amount should be **negative** (e.g., -2000)
- ✅ Categorized by **Account** field:
  - **BOA** → Goes to BOA column
  - **PNC** → Goes to PNC column
  - **Other** → Goes to One-off Expenses column

**Examples:**
```
Rule: Rent, -$2,000, Cash Expense, BOA, Monthly
Result: Appears in BOA column, subtracts $2,000 from cash flow

Rule: Gym, -$50, Cash Expense, PNC, Monthly
Result: Appears in PNC column, subtracts $50 from cash flow
```

---

### 3. Frequency Rules ✅

**All items included at their specified cadence:**

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

---

### 4. Effective Date Rules ✅

**Effective Date = When the item should start**

- ✅ Rule starts on Effective Date
- ✅ **No transactions before Effective Date**
- ✅ **No transactions before Starting Balance Date**
- ✅ If Effective Date is before Starting Balance Date, first occurrence is on Starting Balance Date

**Example:**
```
Starting Balance Date: Jan 1, 2025
Rule: Salary, Effective Date: Dec 1, 2024
Result: First salary payment appears on Jan 1, 2025 (not Dec 1)
```

---

### 5. End Date Rules ✅

**End Date = When the item should stop**

- ✅ If End Date is set, rule **stops** on that date
- ✅ Last occurrence is **on or before** End Date
- ✅ If End Date is null/blank, rule continues **indefinitely**

**Example:**
```
Rule: Gym, -$50, Monthly, Effective: Jan 1, End: Jun 30
Result: 
- Jan 1: -$50
- Feb 1: -$50
- Mar 1: -$50
- Apr 1: -$50
- May 1: -$50
- Jun 1: -$50
- Jul 1: (no charge - rule ended)
```

---

### 6. Starting Balance Date Rules ✅

**Starting Balance Date = Baseline for all calculations**

- ✅ **No transactions before Starting Balance Date**
- ✅ Running balance starts from Starting Balance on Starting Balance Date
- ✅ All rules respect Starting Balance Date as minimum date
- ✅ Dates before Starting Balance Date show Starting Balance (no changes)

**Example:**
```
Starting Balance: $15,000 on Jan 1, 2025
Rule: Rent, Effective: Dec 1, 2024

Result:
- Dec 1-31: No rent charges (before starting balance date)
- Jan 1: First rent charge appears
```

---

## Complete Example

### Setup:
```
Starting Balance: $10,000 on Jan 1, 2025

Rules:
1. Salary: $5,000, Income, BOA, Monthly, Effective: Jan 1
2. Rent: -$2,000, Cash Expense, BOA, Monthly, Effective: Jan 1
3. Groceries: -$600, Cash Expense, PNC, Bi-weekly, Effective: Jan 1
4. Gym: -$50, Cash Expense, PNC, Monthly, Effective: Jan 1, End: Jun 30
5. Bonus: $1,000, Income, BOA, One-time, Impact: Mar 15
```

### Cash Flow Table Result:
```
Date       | Income  | BOA      | PNC      | Net CF   | Running Balance
-----------|---------|----------|----------|----------|----------------
2025-01-01 | $5,000  | -$2,000  | -$50     | $2,950   | $12,950
2025-01-15 |         |          | -$600    | -$600    | $12,350
2025-01-29 |         |          | -$600    | -$600    | $11,750
2025-02-01 | $5,000  | -$2,000  | -$50     | $2,950   | $14,700
2025-02-12 |         |          | -$600    | -$600    | $14,100
2025-02-26 |         |          | -$600    | -$600    | $13,500
2025-03-01 | $5,000  | -$2,000  | -$50     | $2,950   | $16,450
2025-03-15 | $1,000  |          | -$600    | $400     | $16,850 (Bonus!)
...
2025-06-01 | $5,000  | -$2,000  | -$50     | $2,950   | $XX,XXX
2025-07-01 | $5,000  | -$2,000  |          | $3,000   | $XX,XXX (No gym!)
```

---

## Categorization Summary

| Type | Column | Effect on Cash Flow | Account Matters? |
|------|--------|---------------------|------------------|
| **Income** | Income | Accretive (+) | No |
| **Cash Expense** | BOA or PNC | Decrement (-) | Yes |
| **Variable Expense** | Variable Expenses | Decrement (-) | No |
| **Renovation/Moving Costs** | Reno Costs | Decrement (-) | No |
| **One Time Expense** | One-off Expenses | Decrement (-) | No |

---

## Key Points

✅ **Income = Positive, Always Income Column**
- Type: Income
- Amount: Positive (e.g., 5000)
- Column: Income
- Effect: Adds to cash flow

✅ **Cash Expense = Negative, BOA or PNC Column**
- Type: Cash Expense
- Amount: Negative (e.g., -2000)
- Column: Based on Account (BOA or PNC)
- Effect: Subtracts from cash flow

✅ **Frequency = When It Occurs**
- Monthly: Same day each month
- Bi-weekly: Every 14 days
- Weekly: Every 7 days
- One-time: Specific date only

✅ **Effective Date = Start Date**
- First occurrence on or after this date
- Respects Starting Balance Date as minimum

✅ **End Date = Stop Date**
- Last occurrence on or before this date
- Blank = continues forever

✅ **Starting Balance Date = Baseline**
- No transactions before this date
- All rules respect this as minimum date
- Running balance starts here

---

## Testing the Rules

### Test 1: Income Rule
```
Rule: Test Income, $1,000, Income, BOA, Monthly, Jan 1
Expected: $1,000 in Income column on Jan 1, Feb 1, Mar 1, etc.
```

### Test 2: Cash Expense in BOA
```
Rule: Test Expense, -$500, Cash Expense, BOA, Monthly, Jan 1
Expected: -$500 in BOA column on Jan 1, Feb 1, Mar 1, etc.
```

### Test 3: Cash Expense in PNC
```
Rule: Test Expense, -$300, Cash Expense, PNC, Monthly, Jan 1
Expected: -$300 in PNC column on Jan 1, Feb 1, Mar 1, etc.
```

### Test 4: Bi-weekly Frequency
```
Rule: Test Biweekly, -$100, Cash Expense, PNC, Bi-weekly, Jan 1
Expected: -$100 on Jan 1, Jan 15, Jan 29, Feb 12, Feb 26, etc.
```

### Test 5: End Date
```
Rule: Test End, -$50, Cash Expense, BOA, Monthly, Jan 1, End: Mar 31
Expected: -$50 on Jan 1, Feb 1, Mar 1, then stops (no Apr 1)
```

### Test 6: Starting Balance Date Respect
```
Starting Balance: Jan 1, 2025
Rule: Test Early, -$100, Cash Expense, BOA, Monthly, Dec 1, 2024
Expected: First occurrence on Jan 1, 2025 (not Dec 1, 2024)
```

---

## Summary

The calculation engine now correctly:

✅ **Categorizes income** → Income column (accretive)
✅ **Categorizes cash expenses** → BOA or PNC column based on account (decrement)
✅ **Applies frequency** → Monthly, Bi-weekly, Weekly, One-time
✅ **Respects effective date** → Starts on or after effective date
✅ **Respects end date** → Stops on or before end date
✅ **Respects starting balance date** → No transactions before this date

All rules work together to create an accurate cash flow projection!
