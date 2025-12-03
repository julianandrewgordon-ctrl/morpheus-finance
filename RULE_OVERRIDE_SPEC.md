# Rule Override System Specification

## Overview
Allow users to override base scenario rules within specific scenarios without creating duplicate rules.

## Data Structure

### Rule Override Object
```javascript
{
  id: unique_id,
  scenarioId: scenario_id,
  baseRuleId: original_rule_id,
  overrides: {
    amount: new_amount,        // Optional
    effectiveDate: new_date,   // Optional
    endDate: new_date,         // Optional
    frequency: new_frequency,  // Optional
    // ... any other field that can be overridden
  },
  createdAt: timestamp
}
```

### Storage
- Add `ruleOverrides` array to main data structure
- Each override links to a base rule and scenario
- Overrides are applied at calculation time

## Calculation Logic

When calculating cash flow for a scenario:
1. Get all base rules (no scenarioId)
2. Get all scenario-specific rules (scenarioId matches)
3. Get all overrides for this scenario
4. Apply overrides to base rules before calculation
5. Merge base (with overrides) + scenario-specific rules

## UI Components

### 1. Override Button (RecurringRules page)
- Show "Override" button next to each base rule when viewing a scenario
- Only visible when a non-base scenario is selected
- Opens override modal

### 2. Override Modal
- Pre-filled with current rule values
- User can modify any field
- "Save Override" creates override record
- "Remove Override" deletes override and reverts to base

### 3. Visual Indicators
- **Base rule (no override)**: Normal appearance
- **Base rule (overridden)**: Blue background + "Modified" badge
- **Scenario-only rule**: Green background + "New" badge

### 4. Override Management
- "View Overrides" button shows all overrides for current scenario
- Can edit or remove overrides
- Can see original base values vs override values

## User Workflow

### Creating an Override
1. User selects "Worst Case Scenario" from scenario selector
2. Goes to Scenarios page
3. Sees all base rules with "Override" buttons
4. Clicks "Override" on "Julian Pay"
5. Modal opens with current values
6. Changes amount from $8,863 to $6,000
7. Clicks "Save Override"
8. Rule now shows with blue highlight and "Modified" badge
9. Chart/table automatically recalculate with new value

### Editing an Override
1. Click "Override" button again (now shows "Edit Override")
2. Modal opens with override values
3. Make changes
4. Save

### Removing an Override
1. Click "Override" button
2. Click "Remove Override" in modal
3. Rule reverts to base value
4. Blue highlight removed

## Implementation Phases

### Phase 1: Data Structure ✅
- Add `ruleOverrides` array to data model
- Create helper functions for override management

### Phase 2: Calculation Engine
- Update `calculateCashFlowTable` to apply overrides
- Update scenario cash flow calculations

### Phase 3: UI Components
- Create OverrideModal component
- Add Override buttons to RecurringRules
- Add visual indicators

### Phase 4: Polish
- Add override summary view
- Add bulk override operations
- Add override history/audit trail

## Future Enhancements
- Override templates (apply common overrides to multiple rules)
- Percentage-based overrides (reduce all income by 20%)
- Time-based overrides (different values for different date ranges)
- Override comparison view (see all differences from base)
