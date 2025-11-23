# Edit Rule Functionality

## ✅ Fully Functional Actions Menu

The Actions dropdown (⋮) in the Recurring Rules table is now fully functional with all features working.

## Actions Available

### 1. Edit Rule ✅
**What it does:**
- Opens a comprehensive edit modal
- Allows you to modify all rule properties
- Changes are immediately reflected in cash flow table

**How to use:**
1. Go to **Recurring Rules** tab
2. Find the rule you want to edit
3. Click the **Actions** dropdown (⋮)
4. Select **"Edit Rule"**
5. A modal opens with all current values
6. Modify any fields you want
7. Click **"Save Changes"**

**Fields you can edit:**
- ✅ Rule Name
- ✅ Amount
- ✅ Type (Income, Cash Expense, Variable Expense, etc.)
- ✅ Account (BOA, PNC, Other)
- ✅ Frequency (One-time, Weekly, Bi-weekly, Monthly)
- ✅ Effective Date (for recurring) or Impact Date (for one-time)
- ✅ End Date (optional)
- ✅ Description (optional notes)

**Example:**
- Change Salary from $5,000 to $5,500
- Change Rent from Monthly to Bi-weekly
- Update Effective Date to start later
- Add End Date to stop a recurring expense

---

### 2. Assign to Scenario ✅
**What it does:**
- Assigns the rule to a specific scenario
- Makes the rule a "draft" entry
- Rule only appears when that scenario is active

**How to use:**
1. Click **Actions** dropdown (⋮)
2. Select **"Assign to Scenario"**
3. Choose a scenario from the dropdown
4. Click **"Save"**

**Options:**
- **None (Committed Plan)** - Remove scenario assignment
- **Gift Card A** - Assign to Gift Card A scenario
- **Car Purchase** - Assign to Car Purchase scenario
- **Custom scenarios** - Any scenarios you've created

**Visual indicators:**
- Grey badge shows scenario name
- Blue "Draft" badge indicates scenario rule

---

### 3. Delete ✅
**What it does:**
- Permanently removes the rule
- All transactions from this rule disappear from cash flow table
- Shows confirmation message

**How to use:**
1. Click **Actions** dropdown (⋮)
2. Select **"Delete"**
3. Rule is immediately removed
4. Success message confirms deletion

**Note:** There is no undo. To restore, you must re-add the rule.

---

## Actions Dropdown Fixed

### What was wrong:
- Dropdown items weren't visible
- Click events weren't working properly
- Menu wasn't displaying correctly

### What's fixed:
✅ **Dropdown now displays properly** with all items visible
✅ **All actions are clickable** and functional
✅ **Icons appear** next to each action
✅ **Dividers separate** action groups
✅ **Aria labels** for accessibility

### Menu structure:
```
Actions ▼
├── Edit Rule (✏️)
├── Assign to Scenario (🔗)
├── ─────────────────
└── Delete (🗑️)
```

---

## Edit Modal Features

### Full Form with All Fields

**Rule Name:**
- Text input
- Required field
- Example: "Salary", "Rent", "Groceries"

**Amount:**
- Number input
- Required field
- Positive for income, negative for expenses
- Example: 5000, -2000, -600

**Type:**
- Dropdown select
- Options: Income, Cash Expense, Variable Expense, Renovation/Moving Costs, One Time Expense
- Determines how rule is categorized in cash flow table

**Account:**
- Dropdown select
- Options: BOA, PNC, Other
- Determines which column in cash flow table

**Frequency:**
- Radio group
- Options: One-time, Weekly, Bi-weekly, Monthly
- Determines how often transaction occurs

**Effective Date / Impact Date:**
- Date picker
- For recurring: Effective Date (when rule starts)
- For one-time: Impact Date (when transaction occurs)
- Format: YYYY/MM/DD

**End Date:**
- Date picker
- Optional
- When rule stops (for recurring only)
- Leave blank for perpetual rules

**Description:**
- Text area
- Optional
- Add notes about the rule
- Appears below rule name in table

### Real-Time Updates

When you save changes:
✅ **Rule updates immediately** in the table
✅ **Cash flow table recalculates** automatically
✅ **Running balance adjusts** based on new values
✅ **Tooltips show updated** transaction names
✅ **Success message confirms** the update

---

## Scenario Assignment Modal

### Features

**Current Assignment Display:**
- Shows if rule is already assigned to a scenario
- Pre-selects current scenario in dropdown

**Scenario Selection:**
- Dropdown with all available scenarios
- "None" option to remove assignment
- Only non-baseline scenarios shown

**Draft Indicator:**
- Rules assigned to scenarios are marked as "Draft"
- Blue badge appears in table
- Grey badge shows scenario name

**Clear Explanation:**
- Modal explains what scenario assignment means
- Helps users understand draft vs committed

---

## Example Workflows

### Workflow 1: Edit Salary Amount

1. **Find Rule**: Go to Recurring Rules, find "Salary"
2. **Open Edit**: Click Actions → "Edit Rule"
3. **Change Amount**: Update from $5,000 to $5,500
4. **Save**: Click "Save Changes"
5. **Verify**: Go to Dashboard, check cash flow table
6. **Result**: All salary entries now show $5,500

### Workflow 2: Change Frequency

1. **Find Rule**: Find "Groceries" rule
2. **Open Edit**: Click Actions → "Edit Rule"
3. **Change Frequency**: Change from "Bi-weekly" to "Weekly"
4. **Save**: Click "Save Changes"
5. **Verify**: Check cash flow table
6. **Result**: Groceries now appear every 7 days instead of 14

### Workflow 3: Add End Date

1. **Find Rule**: Find "Gym Membership"
2. **Open Edit**: Click Actions → "Edit Rule"
3. **Set End Date**: Select June 30, 2025
4. **Save**: Click "Save Changes"
5. **Verify**: Check cash flow table after June 30
6. **Result**: No gym charges after June 30

### Workflow 4: Assign to Scenario

1. **Find Rule**: Find "Holiday Gift"
2. **Open Scenario**: Click Actions → "Assign to Scenario"
3. **Select Scenario**: Choose "Gift Card A"
4. **Save**: Click "Save"
5. **Verify**: See grey badge with "Gift Card A"
6. **Result**: Rule is now part of Gift Card A scenario

### Workflow 5: Remove Scenario Assignment

1. **Find Rule**: Find rule with scenario badge
2. **Open Scenario**: Click Actions → "Assign to Scenario"
3. **Select None**: Choose "None (Committed Plan)"
4. **Save**: Click "Save"
5. **Verify**: Scenario badge disappears
6. **Result**: Rule is now part of committed plan

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Close Modal | Esc |
| Submit Form | Enter (when in text field) |
| Navigate Fields | Tab |
| Select Dropdown | Space or Enter |

---

## Validation

### Required Fields

**Edit Modal:**
- ✅ Rule Name - Cannot be empty
- ✅ Amount - Must be a valid number
- ✅ Type - Must select one
- ✅ Account - Must select one
- ✅ Frequency - Must select one
- ✅ Effective/Impact Date - Required based on frequency

**Scenario Modal:**
- ✅ Scenario - Can be null (None) or valid scenario

### Error Handling

- Invalid amounts show error
- Missing required fields prevent save
- Date format validation
- Clear error messages

---

## Visual Feedback

### Success Messages
- ✅ Green flash message after successful edit
- ✅ Shows rule name that was updated
- ✅ Dismissible with X button

### Table Updates
- ✅ Rule row updates immediately
- ✅ Badges update (scenario, draft)
- ✅ Values change in real-time

### Cash Flow Impact
- ✅ Table recalculates automatically
- ✅ Running balance adjusts
- ✅ Tooltips show new values

---

## Troubleshooting

### Actions Dropdown Not Showing

**If you can't see the dropdown menu:**
1. Make sure you're clicking the Actions button (⋮)
2. Check that the table has loaded
3. Try scrolling the table horizontally
4. Refresh the page if stuck

### Edit Modal Not Opening

**If edit modal doesn't open:**
1. Check for JavaScript errors in console
2. Try clicking Actions → Edit Rule again
3. Refresh the page
4. Check that rule has valid data

### Changes Not Saving

**If changes don't save:**
1. Check all required fields are filled
2. Verify amount is a valid number
3. Check date format (YYYY/MM/DD)
4. Look for error messages
5. Try again with valid data

### Cash Flow Not Updating

**If cash flow table doesn't update:**
1. Go to Dashboard tab
2. Check if rule is included (checkbox checked)
3. Verify effective date is in visible range
4. Check if rule has end date that's passed
5. Refresh the page

---

## Technical Details

### State Management

**Edit Form State:**
```javascript
{
  name: 'Salary',
  amount: '5000',
  type: { label: 'Income', value: 'Income' },
  account: { label: 'BOA', value: 'BOA' },
  frequency: 'Monthly',
  effectiveDate: '2025-01-01',
  impactDate: '',
  endDate: '',
  description: 'Monthly paycheck'
}
```

**Update Handler:**
```javascript
onUpdateRule(ruleId, {
  name: 'Updated Name',
  amount: 5500,
  type: 'Income',
  // ... other fields
})
```

### Component Props

```javascript
<RecurringRules
  rules={rules}              // Array of rule objects
  scenarios={scenarios}      // Array of scenario objects
  onAddRule={handleAdd}      // Function to add new rule
  onBatchAdd={handleBatch}   // Function to batch add rules
  onDeleteRule={handleDelete} // Function to delete rule
  onToggleInclude={handleToggle} // Function to toggle include
  onUpdateRule={handleUpdate} // Function to update rule (NEW)
/>
```

---

## Summary

All Actions menu items are now fully functional:

✅ **Edit Rule** - Complete edit modal with all fields
✅ **Assign to Scenario** - Scenario assignment with visual feedback
✅ **Delete** - Immediate deletion with confirmation

The Actions dropdown is fixed and displays properly with:
✅ **Visible menu items**
✅ **Working click handlers**
✅ **Icons and dividers**
✅ **Proper accessibility**

Changes are reflected immediately in:
✅ **Recurring Rules table**
✅ **Cash Flow table**
✅ **Running balance calculations**
✅ **Summary statistics**

**Ready to use at**: http://localhost:5173/
