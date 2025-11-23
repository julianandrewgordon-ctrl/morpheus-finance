# Rule Availability vs Committed Plan

## The Distinction You Identified

You're absolutely right - we need to separate two concepts:

1. **Rule Availability** (Include Toggle ✓)
   - Is this rule active/enabled?
   - Master on/off switch
   - Applies to ALL calculations

2. **Committed Plan Membership** (No Scenario Assignment)
   - Is this rule part of the baseline?
   - Determines which scenarios include it
   - Separate from availability

## The New Logic

### Include Toggle (✓) - Availability
- **OFF (unchecked)**: Rule is completely disabled
  - Not in committed plan
  - Not in any scenario
  - Not in any calculations
  - Use for: Temporarily disabling without deleting

- **ON (checked)**: Rule is available for use
  - May be in committed plan
  - May be in scenarios
  - Depends on scenario assignment

### Scenario Assignment - Plan Membership

**No Scenario Assignment** = **Committed Plan** (Green Badge)
- Rule is part of your baseline
- Appears in: Committed Plan + ALL scenarios
- Use for: Your current, ongoing finances
- Examples: Salary, rent, utilities

**Scenario Assignment** = **Scenario-Specific** (Blue Badge)
- Rule is ONLY for that scenario
- Appears in: ONLY that specific scenario
- NOT in committed plan
- NOT in other scenarios
- Use for: "What-if" additions
- Examples: Car payment (Car scenario), new salary (Job Change scenario)

## Visual Indicators

### In Recurring Rules Table

**Committed Rule:**
```
✓ Salary                    [Committed]
  $5,000/month
```

**Scenario-Specific Rule:**
```
✓ Car Payment              [Car Purchase]
  -$450/month
```

**Disabled Rule:**
```
☐ Old Expense              [Committed]
  -$200/month
```

## Complete Rule States

### State 1: Active Committed Rule
- Include: ✓ ON
- Scenario: None
- Badge: Green "Committed"
- Appears in: Committed Plan + ALL scenarios
- Example: Your current salary

### State 2: Active Scenario-Specific Rule
- Include: ✓ ON
- Scenario: Assigned (e.g., "Car Purchase")
- Badge: Blue "[Scenario Name]"
- Appears in: ONLY that scenario
- Example: Car payment for car scenario

### State 3: Disabled Committed Rule
- Include: ☐ OFF
- Scenario: None
- Badge: Green "Committed" (grayed out)
- Appears in: Nothing (disabled)
- Example: Temporarily disabled expense

### State 4: Disabled Scenario Rule
- Include: ☐ OFF
- Scenario: Assigned
- Badge: Blue "[Scenario Name]" (grayed out)
- Appears in: Nothing (disabled)
- Example: Scenario rule you're not ready to activate

## Chart Behavior

### Committed Plan Line (Blue Solid)
Shows rules where:
- Include = ✓ ON
- Scenario = None (Committed)

### Scenario Lines (Dashed Colors)
Each scenario shows rules where:
- Include = ✓ ON
- AND (Scenario = None OR Scenario = This Scenario)

In other words:
- Committed rules (green badge) + That scenario's rules (blue badge)

## Example Walkthrough

### Your Rules:
1. **Salary** - $5,000/month
   - Include: ✓ ON
   - Scenario: None
   - Badge: [Committed]
   - Appears in: Committed + All scenarios

2. **Rent** - -$2,000/month
   - Include: ✓ ON
   - Scenario: None
   - Badge: [Committed]
   - Appears in: Committed + All scenarios

3. **Car Payment** - -$450/month
   - Include: ✓ ON
   - Scenario: "Car Purchase"
   - Badge: [Car Purchase]
   - Appears in: ONLY Car Purchase scenario

4. **Old Subscription** - -$50/month
   - Include: ☐ OFF
   - Scenario: None
   - Badge: [Committed] (grayed)
   - Appears in: Nothing (disabled)

### Chart Lines:

**Committed Plan (Blue Solid):**
- Salary: $5,000 ✓
- Rent: -$2,000 ✓
- Car Payment: ❌ (scenario-specific)
- Old Subscription: ❌ (disabled)
- **Net: +$3,000/month**

**Car Purchase Scenario (Red Dashed):**
- Salary: $5,000 ✓ (from committed)
- Rent: -$2,000 ✓ (from committed)
- Car Payment: -$450 ✓ (scenario-specific)
- Old Subscription: ❌ (disabled)
- **Net: +$2,550/month**

## Workflow Examples

### Example 1: Adding a New Expense to Committed Plan

**Goal:** Add gym membership to your baseline

**Steps:**
1. Go to Recurring Rules
2. Click "Quick Add Transaction"
3. Name: "Gym Membership"
4. Amount: 50 (will become -50)
5. Type: Cash Expense
6. Frequency: Monthly
7. **Leave scenario as "None (Committed Plan)"**
8. Save

**Result:**
- Rule has green [Committed] badge
- Appears in committed plan
- Appears in ALL scenarios
- Your baseline is updated

### Example 2: Adding a Scenario-Specific Expense

**Goal:** Model buying a car

**Steps:**
1. Create "Car Purchase" scenario on Dashboard
2. Go to Recurring Rules
3. Add "Car Payment"
   - Amount: 450
   - Type: Cash Expense
   - Frequency: Monthly
   - **Assign to "Car Purchase" scenario**
4. Add "Car Insurance"
   - Amount: 120
   - Type: Cash Expense
   - Frequency: Monthly
   - **Assign to "Car Purchase" scenario**

**Result:**
- Both rules have blue [Car Purchase] badge
- Appear ONLY in Car Purchase scenario
- NOT in committed plan
- NOT in other scenarios
- Easy to see the isolated impact

### Example 3: Temporarily Disabling a Rule

**Goal:** Pause a subscription without deleting it

**Steps:**
1. Go to Recurring Rules
2. Find the subscription rule
3. **Uncheck the ✓ include toggle**

**Result:**
- Rule stays in the list
- Badge is grayed out
- Doesn't appear in ANY calculations
- Easy to re-enable later by checking the toggle

### Example 4: Moving a Rule from Committed to Scenario

**Goal:** Test removing an expense in a scenario

**Steps:**
1. Create "Reduced Expenses" scenario
2. Find the expense in Recurring Rules
3. Click Actions → "Assign to Scenario"
4. Select "Reduced Expenses"

**Result:**
- Rule now has blue [Reduced Expenses] badge
- Removed from committed plan
- Appears ONLY in that scenario
- Other scenarios don't include it

**Better Approach:**
- Keep original in committed
- Create new rule with $0 or opposite amount in scenario
- Or use "Exclude from Scenario" feature (future)

## Best Practices

### Use Committed Plan For:
- ✅ Your current, actual finances
- ✅ Ongoing income and expenses
- ✅ Things that won't change
- ✅ Baseline for all scenarios

### Use Scenario-Specific Rules For:
- ✅ New expenses unique to that scenario
- ✅ New income unique to that scenario
- ✅ One-time costs for that scenario
- ✅ Things you're considering but haven't committed to

### Use Include Toggle For:
- ✅ Temporarily disabling rules
- ✅ Testing without deleting
- ✅ Seasonal expenses (turn on/off as needed)
- ✅ Rules you might need again

### Don't:
- ❌ Toggle off committed rules to remove from scenarios (use scenario assignment instead)
- ❌ Create duplicate rules for scenarios (assign to scenario instead)
- ❌ Delete rules you might need later (toggle off instead)

## UI Improvements

### Badge Colors
- **Green [Committed]**: Part of baseline, in all scenarios
- **Blue [Scenario Name]**: Only in that scenario
- **Gray (disabled)**: Include toggle is off

### Quick Identification
- Look for green badges = Your current reality
- Look for blue badges = "What-if" additions
- Look for gray = Temporarily disabled

### Filtering
- Filter by "Committed" to see baseline
- Filter by scenario name to see scenario-specific rules
- Filter by include status to see active vs disabled

## Summary

**Two Separate Concepts:**

1. **Availability (Include Toggle)**
   - ON = Rule can be used
   - OFF = Rule is disabled everywhere

2. **Plan Membership (Scenario Assignment)**
   - None = Committed (green badge) → In all scenarios
   - Assigned = Scenario-specific (blue badge) → Only in that scenario

**This separation gives you:**
- Clear distinction between baseline and scenarios
- Easy to see what's in your committed plan
- Easy to model "what-if" scenarios
- Flexibility to enable/disable without losing data

**Visual Clarity:**
- Green badge = Committed (your reality)
- Blue badge = Scenario (your "what-if")
- Gray = Disabled (temporarily off)

The changes are live - check the Recurring Rules page to see the new badges!
