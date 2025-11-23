# Categorization & Row Visibility Fix

## Issues Fixed

### 1. Expense Categorization Bug
**Problem**: Items were being incorrectly categorized in the income column when they should be expenses.

**Root Cause**: The categorization logic was checking if type "includes expense" but wasn't properly handling the specific expense types. Variable Expenses were being categorized by account (BOA/PNC) instead of going to the Variable Expenses column.

**Solution**: Rewrote the categorization logic with explicit type checking in the correct order:
- `Income` → Income column
- `Variable Expense` → Variable Expenses column (regardless of account)
- `Renovation/Moving Costs` → Reno Costs column
- `One Time Expenses` → One-off Expenses column
- `Cash Expense` → BOA or PNC column (based on account field)
- Default fallback → Positive amounts to Income, negative amounts to account-based columns

### 2. Hide/Unhide Empty Rows
**Problem**: Rows with no transactions cluttered the cash flow table.

**Solution**: Added a toggle control at the top of the Cash Flow Table:
- **"Hide empty rows"** toggle filters out any rows that have no transactions
- When unchecked (default), all rows are shown
- When checked, only rows with at least one transaction are displayed
- Toggle is positioned at the top-right of the table for easy access

## Files Modified

1. `src/utils/cashFlowCalculator.js`
   - Fixed expense categorization logic (lines ~100-130)
   - Now properly routes expenses to correct columns based on type

2. `src/components/CashFlowTable.jsx`
   - Added `hideEmptyRows` state
   - Added filtering logic to remove empty rows when toggle is enabled
   - Added Toggle component for user control
   - Imported SpaceBetween and Toggle from Cloudscape

## Testing

After these changes:
- Variable Expenses should appear in the "Variable Expenses" column
- Cash Expenses should appear in BOA or PNC columns based on account
- One-time expenses should appear in "One-off Expenses" column
- The toggle allows hiding/showing empty rows on demand
- All expense amounts should display as negative (red) values
