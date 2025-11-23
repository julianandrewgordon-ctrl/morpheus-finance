# Scenario Behavior & Multi-Line Chart

## Clarification: Include Toggle vs Scenario Assignment

### How the Include Toggle Works

The **include toggle** (✓ checkbox) is the **master switch** for any rule:

- **Toggled ON** (✓): Rule is included in calculations
- **Toggled OFF** (empty): Rule is **completely ignored**, regardless of scenario assignment

### Scenario Assignment Behavior

**If a rule is NOT toggled on but IS tagged to a scenario:**
- The rule will **NOT appear** in any calculations
- The rule will **NOT show** in the cash flow table
- The rule will **NOT affect** the running balance
- The scenario assignment is preserved but inactive

**Example:**
```
Rule: "Car Payment"
Include: ☐ (OFF)
Scenario: "Car Purchase"
Result: Rule is ignored in all calculations
```

### When Both Are Active

**If a rule IS toggled on AND IS tagged to a scenario:**
- The rule appears in calculations for that scenario
- The rule is marked as "Draft" (⚠)
- The rule only affects projections when viewing that scenario

**Example:**
```
Rule: "Car Payment"
Include: ✓ (ON)
Scenario: "Car Purchase"
Result: Rule appears when "Car Purchase" scenario is selected
```

### Recommended Workflow

1. **Create rules** with include toggle ON
2. **Assign to scenario** if it's experimental/optional
3. **Toggle OFF** if you want to temporarily disable without deleting
4. **Remove scenario assignment** to move to committed plan

## Multi-Line Chart Feature

### Overview
The Running Balance Chart now displays **multiple lines simultaneously**, one for each scenario, allowing you to compare different financial projections side-by-side.

### Chart Lines

#### Committed Plan (Solid Blue Line)
- Shows balance with only committed rules (no scenario assignments)
- Solid line, blue color (#3498db)
- Represents your baseline financial plan

#### Scenario Lines (Dashed Colored Lines)
- Each scenario gets its own colored dashed line
- Different colors for easy distinction:
  - Scenario 1: Red (#e74c3c)
  - Scenario 2: Green (#2ecc71)
  - Scenario 3: Orange (#f39c12)
  - Scenario 4: Purple (#9b59b6)
  - Scenario 5: Teal (#1abc9c)
  - And more...

### How It Works

#### Data Calculation
The system calculates cash flow for:
1. **Committed Plan**: All rules without scenario assignments
2. **Each Scenario**: Committed rules + rules assigned to that specific scenario

#### Chart Display
- All lines are shown simultaneously
- Hover over any line to see the balance at that date
- Legend shows which line represents which scenario
- Dashed lines make scenarios easy to distinguish from committed plan

### Example Visualization

```
$25K ┤                                    ╱─ Committed Plan
     │                                ╱─╱
$20K ┤                            ╱─╱
     │                        ╱─╱
$15K ┤                    ╱─╱  ╱ ╱ ╱ ╱ ╱ Car Purchase
     │                ╱─╱    ╱ ╱
$10K ┤            ╱─╱      ╱ ╱
     │        ╱─╱        ╱ ╱
$5K  ┤    ╱─╱          ╱ ╱
     │╱─╱            ╱ ╱
     └────────────────────────────────────
     Jan  Feb  Mar  Apr  May  Jun  Jul
```

### Use Cases

#### Compare Multiple Options
Create scenarios for different choices:
- "Car Option A" (Honda)
- "Car Option B" (Toyota)
- See which has better cash flow impact

#### Model Life Changes
- "Current Job" (committed)
- "New Job Offer" (scenario)
- Compare side-by-side

#### Plan Major Purchases
- Committed plan without purchase
- Scenario with purchase
- See the impact visually

#### Budget Planning
- "Conservative Budget"
- "Moderate Budget"
- "Aggressive Savings"
- Compare all three approaches

### Reading the Chart

#### Line Positions
- **Higher line** = Better cash flow / more money
- **Lower line** = Worse cash flow / less money
- **Lines crossing** = Scenarios have different trajectories

#### Line Slopes
- **Upward slope** = Positive cash flow (income > expenses)
- **Downward slope** = Negative cash flow (expenses > income)
- **Flat line** = Balanced (income = expenses)

#### Gaps Between Lines
- **Large gap** = Significant financial impact
- **Small gap** = Minor difference
- **Converging lines** = Impact diminishes over time
- **Diverging lines** = Impact grows over time

### Interactive Features

#### Hover Tooltips
- Hover over any point to see exact balance
- Shows date and amount for all scenarios at that point
- Easy comparison of specific dates

#### Legend
- Click legend items to show/hide specific lines
- Useful for focusing on specific comparisons
- All scenarios shown by default

### Technical Details

#### Data Sampling
- Chart samples every 7th day to avoid overcrowding
- Always includes the last day of the projection
- Maintains smooth line appearance

#### Performance
- Calculates all scenarios simultaneously
- Efficient data structure for multiple lines
- No performance impact with multiple scenarios

#### Color Assignment
- Colors assigned based on scenario ID
- Consistent colors across sessions
- Fallback to gray if too many scenarios

### Limitations & Considerations

#### Current Limitations
1. **Scenario Isolation**: Each scenario line shows committed + that scenario only
2. **No Combination**: Cannot combine multiple scenarios in one line
3. **Color Limit**: After 8 scenarios, colors may repeat

#### Best Practices
1. **Limit Scenarios**: Keep to 3-5 active scenarios for clarity
2. **Descriptive Names**: Use clear names for easy legend reading
3. **Regular Cleanup**: Delete outdated scenarios
4. **Focused Comparisons**: Create scenarios for specific decisions

### Example Scenarios

#### Scenario 1: Car Purchase
**Rules:**
- Car Down Payment: -$5,000 (one-time)
- Car Payment: -$450/month
- Car Insurance: -$120/month
- Gas: -$200/month

**Chart Impact:**
- Initial drop from down payment
- Steady decline from monthly costs
- Gap widens over time

#### Scenario 2: Job Change
**Rules:**
- New Salary: +$6,000/month (vs $5,000)
- Relocation: -$3,000 (one-time)
- New Commute: -$150/month

**Chart Impact:**
- Initial drop from relocation
- Higher trajectory from increased salary
- Eventually surpasses committed plan

#### Scenario 3: Home Renovation
**Rules:**
- Renovation Costs: -$2,000/month for 6 months
- Home Value Increase: (not modeled in cash flow)

**Chart Impact:**
- Significant decline during renovation period
- Returns to normal after 6 months
- Temporary impact clearly visible

### Future Enhancements

Potential improvements:
- Scenario combination (show multiple scenarios together)
- Confidence intervals / probability bands
- Scenario comparison table below chart
- Export chart as image
- Custom date ranges for comparison
- Scenario annotations on chart

## Summary

### Include Toggle
- **Master switch** - OFF means rule is completely ignored
- Works independently of scenario assignment
- Use to temporarily disable rules

### Scenario Assignment
- Groups related rules together
- Allows "what-if" modeling
- Only affects calculations when scenario is active

### Multi-Line Chart
- Shows all scenarios simultaneously
- Committed plan (solid) + scenarios (dashed)
- Easy visual comparison
- Interactive tooltips and legend

### Workflow
1. Create rules with include ON
2. Assign to scenarios for modeling
3. View multi-line chart to compare
4. Make informed decisions
5. Move chosen scenario to committed plan
