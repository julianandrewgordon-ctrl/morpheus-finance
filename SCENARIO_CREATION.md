# Scenario Creation Feature

## Overview
The "New Scenario" button is now fully functional, allowing you to create custom scenarios to model different financial situations.

## How to Create a Scenario

### Step 1: Create the Scenario
1. Go to the Dashboard
2. Find the "Scenario Selector" section
3. Click the **"New Scenario"** button
4. Enter a descriptive name (e.g., "Car Purchase", "Home Renovation", "Gift Cards")
5. Click **"Create Scenario"**

### Step 2: Assign Rules to the Scenario
1. Navigate to the **Recurring Rules** page
2. Find the rules you want to include in this scenario
3. Click the **Actions** dropdown (⋮) for each rule
4. Select **"Assign to Scenario"**
5. Choose your newly created scenario
6. The rule will be marked as a draft and assigned to that scenario

### Step 3: View the Scenario
1. Return to the Dashboard
2. In the Scenario Selector, click on your scenario button
3. The cash flow projections will update to show only rules assigned to that scenario

## What Are Scenarios?

Scenarios are "what-if" financial models that let you:
- Model different spending or income situations
- Compare multiple financial plans side-by-side
- Test the impact of major purchases or life changes
- Keep experimental rules separate from your committed plan

## Example Use Cases

### Car Purchase Scenario
Create a scenario to model buying a car:
- Add one-time expense for down payment
- Add monthly car payment
- Add monthly insurance
- Add variable expense for gas/maintenance
- See how it impacts your cash flow

### Home Renovation Scenario
Model a home improvement project:
- Add renovation costs over several months
- Add one-time expenses for materials
- See the impact on your running balance

### Gift Card Scenario
Plan for holiday or special occasion spending:
- Add multiple one-time gift expenses
- Assign them all to "Gift Cards" scenario
- Toggle on/off to see with/without gifts

### Job Change Scenario
Model a career transition:
- Adjust salary income
- Add relocation expenses
- Add new commute costs
- Compare to current situation

## Scenario Management

### Editing Scenarios
1. Click the edit icon (✏️) next to any scenario
2. Change the name
3. Click "Save Changes"

### Deleting Scenarios
1. Click the edit icon (✏️) next to the scenario
2. Click "Delete Scenario"
3. Confirm the deletion
4. All rules assigned to that scenario will be moved back to the committed plan

### Baseline Scenario
The "Committed Plan" is your baseline scenario:
- Cannot be deleted
- Represents your actual financial plan
- All new rules start here unless assigned to a scenario

## Technical Details

### Scenario Structure
```javascript
{
  id: 1,
  name: "Car Purchase",
  active: false,
  isBaseline: false
}
```

### Rule Assignment
When a rule is assigned to a scenario:
```javascript
{
  ...rule,
  isDraft: true,
  scenarioId: 2
}
```

### Data Persistence
- Scenarios are saved to localStorage
- Persist across browser sessions
- Included in data exports
- Reset with "Reset to Defaults"

## Workflow Example

### Complete Workflow: Planning a Car Purchase

**1. Create the Scenario**
- Click "New Scenario"
- Name: "Car Purchase"
- Click "Create Scenario"

**2. Add Rules for Car Purchase**
Go to Recurring Rules and add:
- "Car Down Payment" - One-time, $5,000, Dec 1
- "Car Payment" - Monthly, $450, starting Dec 1
- "Car Insurance" - Monthly, $120, starting Dec 1
- "Gas & Maintenance" - Variable Expense, $200, Bi-weekly

**3. Assign Rules to Scenario**
For each rule above:
- Click Actions (⋮)
- Select "Assign to Scenario"
- Choose "Car Purchase"

**4. Compare Scenarios**
On Dashboard:
- Click "Committed Plan" - see finances without car
- Click "Car Purchase" - see finances with car
- Compare the running balance charts
- Compare projected EOY balances

**5. Make Decision**
If you decide to buy the car:
- Edit each rule and uncheck "Draft" status
- Or delete the scenario to move rules to committed plan

## Benefits

### Financial Planning
- Test major decisions before committing
- See long-term impact of purchases
- Plan for seasonal expenses
- Model income changes

### Organization
- Keep experimental rules separate
- Group related expenses together
- Easy to enable/disable entire scenarios
- Clear distinction between committed and potential expenses

### Flexibility
- Create unlimited scenarios
- Assign any rule to any scenario
- Switch between scenarios instantly
- No impact on committed plan until you decide

## Tips & Best Practices

### Naming Conventions
Use descriptive names that clearly indicate the purpose:
- ✅ "2025 Home Renovation"
- ✅ "New Car - Honda Accord"
- ✅ "Holiday Gifts 2025"
- ❌ "Scenario 1"
- ❌ "Test"

### Scenario Organization
- Keep scenarios focused on specific decisions
- Don't mix unrelated expenses in one scenario
- Create separate scenarios for different options (e.g., "Car Option A" vs "Car Option B")

### Regular Review
- Review scenarios monthly
- Delete outdated scenarios
- Move committed decisions from scenarios to baseline
- Update projections as plans change

### Combining Scenarios
Currently, scenarios are mutually exclusive (you can only view one at a time). To see multiple scenarios combined:
1. Create a new scenario for the combination
2. Assign all relevant rules to it
3. Or move rules from scenarios to committed plan

## Future Enhancements

Potential features for scenario management:
- Scenario comparison view (side-by-side)
- Scenario templates (common financial situations)
- Scenario notes and descriptions
- Scenario probability/likelihood ratings
- Combine multiple scenarios
- Scenario history and versioning

## Files Modified

1. `src/App.jsx`
   - Added `handleAddScenario` function
   - Passed `onAddScenario` prop to Dashboard

2. `src/components/Dashboard.jsx`
   - Added "New Scenario" modal
   - Added `handleCreateNewScenario` function
   - Made "New Scenario" button functional
   - Added user guidance in modal
