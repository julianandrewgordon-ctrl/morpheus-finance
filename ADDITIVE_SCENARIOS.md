# Additive Scenarios - Final Implementation

## Overview
Scenarios are now **additive** - they build on top of your committed plan, giving you a true "what-if" view of your complete finances with changes applied.

## How It Works

### Committed Plan (Blue Solid Line)
Shows your baseline finances with:
- ✅ All rules WITHOUT scenario assignment
- ✅ Include toggle = ON
- ❌ Rules assigned to ANY scenario (excluded)

**This is your current reality.**

### Scenario Lines (Dashed Colored Lines)
Each scenario shows your COMPLETE finances with:
- ✅ All committed rules (automatically included)
- ✅ Plus scenario-specific rules
- ✅ Minus any committed rules you exclude (future feature)

**This is "what if I do this thing?"**

## Example: Car Purchase Scenario

### Your Rules:
1. **Salary** - $5,000/month - Committed
2. **Rent** - -$2,000/month - Committed  
3. **Groceries** - -$600/month - Committed
4. **Car Payment** - -$450/month - Assigned to "Car Purchase"
5. **Car Insurance** - -$120/month - Assigned to "Car Purchase"

### Chart Lines:

**Committed Plan (Blue Solid):**
- Salary: $5,000
- Rent: -$2,000
- Groceries: -$600
- **Net: +$2,400/month**
- Shows steady growth

**Car Purchase Scenario (Red Dashed):**
- Salary: $5,000 (from committed)
- Rent: -$2,000 (from committed)
- Groceries: -$600 (from committed)
- Car Payment: -$450 (scenario-specific)
- Car Insurance: -$120 (scenario-specific)
- **Net: +$1,830/month**
- Shows slower growth

**Visual Comparison:**
- Red line is lower than blue line
- Gap shows the $570/month impact of the car
- Both lines show your complete finances
- Easy to see if you can afford it

## Creating a Scenario

### Step 1: Create the Scenario
1. Click "New Scenario" on Dashboard
2. Name it (e.g., "Car Purchase")
3. Click "Create Scenario"

**Result:** Scenario is created with all committed rules automatically included

### Step 2: Add Scenario-Specific Rules
1. Go to Recurring Rules
2. Add new rules for this scenario (e.g., car payment)
3. In the Actions dropdown, select "Assign to Scenario"
4. Choose your scenario

**Result:** These rules ONLY appear in this scenario

### Step 3: View the Comparison
1. Return to Dashboard
2. See both lines on the chart
3. Compare your finances with and without the change

## Rule Types

### Committed Rules (No Scenario Assignment)
- Appear in: Committed Plan + ALL scenarios
- Use for: Your current, ongoing expenses and income
- Examples: Salary, rent, utilities, groceries

### Scenario-Specific Rules (Assigned to a Scenario)
- Appear in: ONLY that specific scenario
- Use for: New expenses or income unique to that scenario
- Examples: Car payment (Car scenario), new salary (Job Change scenario)

## Workflow Examples

### Example 1: Comparing Two Car Options

**Setup:**
1. Keep all current expenses in Committed Plan
2. Create "Honda Accord" scenario
   - Add: Honda payment ($400/month)
   - Add: Honda insurance ($110/month)
3. Create "Toyota Camry" scenario
   - Add: Toyota payment ($450/month)
   - Add: Toyota insurance ($120/month)

**Result:**
- Blue line: Current finances (no car)
- Red dashed: Complete finances with Honda
- Green dashed: Complete finances with Toyota
- Compare which option leaves you with more money

### Example 2: Job Change Decision

**Setup:**
1. Current job expenses in Committed Plan
2. Create "New Job" scenario
   - Add: New salary ($6,500/month) - replaces old salary
   - Add: Relocation cost ($3,000 one-time)
   - Add: New commute ($150/month)
   - Exclude: Old salary (future feature)

**Result:**
- Blue line: Current job finances
- Red dashed: New job finances
- See if new job is worth it financially

### Example 3: Multiple Life Changes

**Setup:**
1. Current situation in Committed Plan
2. Create "Big Move" scenario
   - Add: New rent (higher)
   - Add: Moving costs (one-time)
   - Add: New car payment
   - Add: New gym membership
   - Exclude: Old rent (future feature)

**Result:**
- Blue line: Current situation
- Red dashed: Complete picture after all changes
- See total financial impact

## Chart Interpretation

### Line Positions
- **Higher line** = More money / better cash flow
- **Lower line** = Less money / worse cash flow
- **Lines close together** = Small financial impact
- **Lines far apart** = Large financial impact

### Line Slopes
- **Both rising** = Both scenarios are sustainable
- **Scenario falling** = Scenario may not be sustainable
- **Scenario rising faster** = Scenario improves finances
- **Scenario rising slower** = Scenario costs money but still viable

### Decision Making
- **Scenario line stays positive** = You can afford it
- **Scenario line goes negative** = You'll run out of money
- **Gap between lines** = Cost/benefit of the decision
- **Long-term trajectory** = Sustainability over time

## Benefits of Additive Approach

### See Complete Picture
- Each line shows your TOTAL finances
- No mental math needed
- Easy to read absolute values
- Clear whether you can afford something

### Easy Comparison
- All scenarios start from same baseline (committed)
- Differences are clearly visible
- Multiple scenarios easy to compare
- Visual gap shows impact

### Realistic Modeling
- Scenarios include your ongoing expenses
- Not just the new costs in isolation
- Shows real impact on your life
- Helps make informed decisions

## Technical Details

### Calculation Logic
```javascript
// Committed Plan
committedRules = rules.filter(rule => !rule.scenarioId)

// Scenario
scenarioRules = committedRules + rules.filter(rule => rule.scenarioId === scenarioId)
```

### Rule Exclusion (Future Feature)
```javascript
// With exclusions
committedRules = rules.filter(rule => 
  !rule.scenarioId && 
  !rule.excludedFromScenarios?.includes(scenarioId)
)
```

### Data Structure
```javascript
{
  id: 1,
  name: "Salary",
  amount: 5000,
  scenarioId: null,  // Committed rule
  excludedFromScenarios: [],  // Future feature
  include: true
}

{
  id: 2,
  name: "Car Payment",
  amount: -450,
  scenarioId: 3,  // Scenario-specific
  include: true
}
```

## Best Practices

### Organizing Rules
1. **Keep most rules in Committed Plan**
   - Your actual current situation
   - Ongoing expenses and income
   - Things that won't change

2. **Create scenario-specific rules for changes**
   - New expenses unique to that scenario
   - New income unique to that scenario
   - One-time costs for that scenario

3. **Use descriptive scenario names**
   - "Car Purchase - Honda Accord"
   - "Job Change - Tech Corp"
   - "Move to Seattle"

### Scenario Management
1. **Limit active scenarios**
   - Keep 3-5 scenarios for clarity
   - Delete outdated scenarios
   - Archive scenarios you're not actively considering

2. **Regular updates**
   - Update committed rules as life changes
   - Adjust scenario rules as plans evolve
   - Remove scenarios after decisions are made

3. **Clean transitions**
   - When you commit to a scenario, move its rules to committed
   - Delete the scenario after committing
   - Keep committed plan up to date

## Future Enhancements

### Planned Features
1. **Exclude committed rules from scenarios**
   - Useful for replacement scenarios (new job replaces old)
   - Allows fine-tuning of what's included
   - More flexible modeling

2. **Scenario templates**
   - Pre-built scenarios for common situations
   - Quick start for new scenarios
   - Best practices built in

3. **Scenario notes**
   - Add context and assumptions
   - Document decision criteria
   - Track why you created it

4. **Probability weighting**
   - Assign likelihood to scenarios
   - See expected value across scenarios
   - Risk-adjusted planning

## Summary

**Scenarios are now additive:**
- Committed Plan = Your baseline
- Scenarios = Baseline + Changes
- Chart shows complete finances for each option
- Easy to compare and make decisions

**To use:**
1. Keep current situation in Committed Plan
2. Create scenarios for "what-if" situations
3. Add scenario-specific rules
4. Compare on chart
5. Make informed decisions

The changes are live - refresh your browser and create a scenario to see it in action!
