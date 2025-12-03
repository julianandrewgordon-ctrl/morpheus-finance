# Multi-Scenario Rule Assignment - Implementation Complete

## Overview
Rules can now be assigned to multiple scenarios simultaneously, eliminating the need for duplicate rules across scenarios.

## Key Changes

### 1. Data Model Migration
- **Old Format**: `scenarioId` (single string)
- **New Format**: `scenarioIds` (array of strings)
- **Migration**: Automatic on data load via `migrateDataIfNeeded()`

### 2. Updated Components

#### RecurringRules.jsx
- Multi-badge display showing all assigned scenarios
- Updated filtering logic to handle scenarioIds array
- Multiselect dropdown for scenario assignment
- Proper handling of base rules (empty scenarioIds array)

#### Dashboard.jsx
- Base scenario: filters rules with empty/null scenarioIds
- Scenario-specific: includes base rules + rules with matching scenarioId in array
- Override system works with multi-scenario rules

#### QuickAddModal.jsx
- Creates new rules with scenarioIds array format
- Single scenario selection converts to array `[scenarioId]`

#### App.jsx
- Scenario deletion removes scenarioId from all affected rules
- Transaction handling preserves scenarioIds from modal

### 3. Migration Utility (`dataMigration.js`)
```javascript
// Automatically converts on load:
scenarioId: "abc123" → scenarioIds: ["abc123"]
scenarioId: null → scenarioIds: []
```

## Usage Examples

### Assign Rule to Multiple Scenarios
1. Go to Scenarios page
2. Find any rule (e.g., "Sale Proceeds")
3. Actions → "Assign to Scenario"
4. Select multiple scenarios from dropdown
5. Save

The rule now appears in all selected scenarios with multiple blue badges.

### Create Multi-Scenario Rule
1. Click "Add Rule" 
2. Fill in details
3. Check "Draft/Scenario Specific"
4. Select scenario (converts to array internally)
5. Later, use "Assign to Scenario" to add more scenarios

### Remove from Scenarios
1. Actions → "Assign to Scenario"
2. Deselect scenarios
3. Save (empty selection = base rule)

## Technical Details

### Base Rules
- `scenarioIds: []` or `scenarioIds: null`
- Show green "Base" badge
- Included in ALL scenarios by default
- Can be overridden per scenario

### Scenario-Specific Rules
- `scenarioIds: ["id1", "id2", ...]`
- Show blue badge for each scenario
- Only appear in assigned scenarios
- Cannot be overridden (they ARE the scenario version)

### Filtering Logic
```javascript
// Base scenario view
const isBaseRule = !rule.scenarioIds || rule.scenarioIds.length === 0

// Specific scenario view
const isBaseRule = !rule.scenarioIds || rule.scenarioIds.length === 0
const isInScenario = rule.scenarioIds && rule.scenarioIds.includes(scenarioId)
const showRule = isBaseRule || isInScenario
```

## Benefits

1. **No Duplication**: One rule can serve multiple scenarios
2. **Easy Management**: Update once, affects all assigned scenarios
3. **Flexible**: Mix and match scenarios as needed
4. **Backward Compatible**: Automatic migration preserves existing data
5. **Clear Visual**: Multiple badges show all assignments at a glance

## Testing Checklist

- [x] Data migration from scenarioId to scenarioIds
- [x] Multi-select scenario assignment UI
- [x] Multiple badge display
- [x] Dashboard calculations with multi-scenario rules
- [x] Scenario deletion removes from scenarioIds arrays
- [x] QuickAdd creates rules with scenarioIds format
- [x] Override system works with base rules
- [x] Filtering shows correct rules per scenario

## Future Enhancements

Possible additions:
- Bulk scenario assignment for multiple rules
- "Copy to scenarios" action
- Scenario comparison view showing rule differences
- Rule templates that auto-assign to scenario patterns
