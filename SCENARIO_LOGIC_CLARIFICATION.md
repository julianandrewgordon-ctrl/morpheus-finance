# Scenario Logic Clarification

## The Problem You Identified

You're absolutely correct! The original logic was confusing:

**Old Behavior (WRONG):**
- Committed Plan = Rules without scenario assignment
- Scenario = Committed rules + Rules with that scenario assignment
- Result: Scenario rules appeared in BOTH committed and scenario lines

This made scenarios useless because they weren't truly separate - they were just "committed + extra stuff."

## The Fix

**New Behavior (CORRECT):**
- Committed Plan = ONLY rules without scenario assignment
- Scenario = ONLY rules with that scenario assignment
- Result: Each line is completely separate and independent

## How It Works Now

### Committed Plan Line (Solid Blue)
Shows cash flow with:
- ✅ Rules with include = ON
- ✅ Rules with NO scenario assignment
- ❌ Rules with ANY scenario assignment (excluded)

### Scenario Lines (Dashed Colors)
Each scenario shows cash flow with:
- ✅ Rules with include = ON
- ✅ Rules assigned to THAT specific scenario
- ❌ Rules without scenario assignment (excluded)
- ❌ Rules assigned to OTHER scenarios (excluded)

## Example Scenario

### Your Rules:
1. **Salary** - $5,000/month - Include: ON - Scenario: None
2. **Rent** - -$2,000/month - Include: ON - Scenario: None
3. **Car Payment** - -$450/month - Include: ON - Scenario: "Car Purchase"
4. **Car Insurance** - -$120/month - Include: ON - Scenario: "Car Purchase"

### Chart Lines:

**Committed Plan (Blue Solid):**
- Includes: Salary, Rent
- Excludes: Car Payment, Car Insurance
- Shows: Your baseline finances without the car

**Car Purchase Scenario (Red Dashed):**
- Includes: Car Payment, Car Insurance
- Excludes: Salary, Rent
- Shows: ONLY the car-related expenses

### Why This Makes Sense

This allows you to see:
1. **Committed Plan** = Your actual current financial situation
2. **Scenario** = The IMPACT of a specific decision
3. **Visual Comparison** = How much lower/higher the scenario line is shows the impact

## Use Cases

### Use Case 1: Comparing Car Options

**Setup:**
- Committed: Salary, Rent, Current expenses
- Scenario "Honda": Honda payment, Honda insurance
- Scenario "Toyota": Toyota payment, Toyota insurance

**Result:**
- Blue line = Current finances
- Red dashed = Impact of Honda
- Green dashed = Impact of Toyota
- Compare which dashed line is higher (better)

### Use Case 2: Job Change Decision

**Setup:**
- Committed: Current salary, Current expenses
- Scenario "New Job": New salary, Relocation costs, New commute

**Result:**
- Blue line = Current job finances
- Red dashed = New job finances
- See if red line ends up higher (better) over time

### Use Case 3: Multiple Simultaneous Changes

**Setup:**
- Committed: Current situation
- Scenario "Big Changes": New car + New house + New job (all in one scenario)

**Result:**
- Blue line = Current
- Red dashed = Everything combined
- See total impact of all changes together

## Important Notes

### Scenarios Are Independent
- Each scenario is a complete, separate financial model
- Scenarios do NOT include committed rules
- Scenarios do NOT include other scenarios' rules
- This is intentional for clean "what-if" analysis

### Comparing to Committed Plan
To see the TOTAL impact of a scenario on your finances:
- Look at the vertical distance between committed and scenario lines
- Higher scenario line = Better finances with that scenario
- Lower scenario line = Worse finances with that scenario

### Combining Scenarios
If you want to see "Committed + Scenario":
- You need to look at BOTH lines together
- The committed line shows your baseline
- The scenario line shows the alternative
- The gap between them shows the difference

## Alternative Approach: Additive Scenarios

If you prefer scenarios to be ADDITIVE (committed + scenario), we could change the logic to:

```javascript
// Additive approach (not currently implemented)
flows[scenario.id] = calculateCashFlowTable(
  (data.recurringRules || []).filter(rule => 
    !rule.scenarioId || rule.scenarioId === scenario.id
  ),
  ...
)
```

This would make:
- Committed Plan = Rules without scenarios
- Scenario = Committed rules + That scenario's rules

**Pros of Additive:**
- Scenario line shows your TOTAL finances if you do that thing
- Easier to read absolute values

**Cons of Additive:**
- Harder to see the IMPACT of the scenario
- Scenario lines all start from the same baseline
- Less useful for comparing multiple scenarios

**Current Implementation:**
We're using the SEPARATE approach because it's clearer for "what-if" analysis and comparing multiple options.

## Recommendation

### For Most Users: Current (Separate) Approach
Best for:
- Comparing multiple options (Car A vs Car B)
- Seeing the impact of a decision
- Keeping scenarios independent

### If You Want Total Finances:
- Create a scenario called "Total with [Thing]"
- Assign ALL your rules to it (committed + new)
- This scenario will show your complete finances

### Or Use the Scenario Selector
- Click on a scenario button in the Scenario Selector
- The main cash flow table will show committed + that scenario
- The chart shows them separately for comparison

## Summary

**You were right** - the original logic was confusing. Now:

1. **Committed Plan** = Only non-scenario rules
2. **Scenarios** = Only that scenario's rules
3. **Chart** = Shows them separately for clear comparison
4. **Cash Flow Table** = Shows combined view when you select a scenario

This gives you both perspectives:
- Chart = Separate comparison
- Table = Combined view when needed
