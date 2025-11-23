# Payment Schedules Implementation Plan

## Overview
Add support for multi-phase payment schedules within a single recurring rule.

## Data Model Changes

### Rule Object - Add paymentSchedule field
```javascript
{
  id: Number,
  name: String,
  // ... existing fields ...
  
  // NEW: Payment schedule for rules with changing amounts
  paymentSchedule: Array<Phase> | null,
  
  // If paymentSchedule exists, use it instead of amount/effectiveDate/endDate
  // Legacy fields (amount, effectiveDate, endDate) still work for simple rules
}
```

### Phase Object
```javascript
{
  id: Number (unique within rule),
  amount: Number,
  startDate: String (YYYY-MM-DD),
  endDate: String (YYYY-MM-DD) | null,
  description: String (optional)
}
```

## Example
```javascript
{
  id: 1,
  name: "Renovation Loan",
  type: "Cash Expense",
  account: "BOA",
  frequency: "Monthly",
  include: true,
  scenarioId: null,
  paymentSchedule: [
    {
      id: 1,
      amount: -1500,
      startDate: "2025-12-01",
      endDate: "2026-03-31",
      description: "Initial payment period"
    },
    {
      id: 2,
      amount: -1200,
      startDate: "2026-04-01",
      endDate: "2026-12-31",
      description: "Reduced payment period"
    },
    {
      id: 3,
      amount: -1000,
      startDate: "2027-01-01",
      endDate: null,
      description: "Final payment amount"
    }
  ]
}
```

## UI Changes

### 1. Edit Rule Modal
- Add "Use Payment Schedule" toggle
- When enabled, show phase management UI
- Add/Edit/Delete phases
- Each phase has: Amount, Start Date, End Date, Description

### 2. Recurring Rules Table
- Show indicator for rules with payment schedules
- Display current phase in tooltip
- Show phase count badge

### 3. Cash Flow Table
- Tooltip shows which phase is active
- Phase description in breakdown

## Calculation Logic

### In cashFlowCalculator.js
```javascript
// Check if rule has payment schedule
if (rule.paymentSchedule && rule.paymentSchedule.length > 0) {
  // Find active phase for this date
  const activePhase = rule.paymentSchedule.find(phase => {
    const phaseStart = new Date(phase.startDate)
    const phaseEnd = phase.endDate ? new Date(phase.endDate) : null
    return date >= phaseStart && (!phaseEnd || date <= phaseEnd)
  })
  
  if (activePhase) {
    // Use phase amount and dates
    amount = activePhase.amount
    effectiveDate = new Date(activePhase.startDate)
    endDate = activePhase.endDate ? new Date(activePhase.endDate) : null
  }
} else {
  // Use legacy single amount/date
  amount = rule.amount
  effectiveDate = new Date(rule.effectiveDate)
  endDate = rule.endDate ? new Date(rule.endDate) : null
}
```

## Implementation Steps

1. Update data model to support paymentSchedule
2. Update cashFlowCalculator to handle payment schedules
3. Add payment schedule UI to Edit Rule modal
4. Add visual indicators in Recurring Rules table
5. Update tooltips to show phase information
6. Add validation for overlapping phases
7. Migration: existing rules continue to work (backward compatible)

## Validation Rules

1. Phases cannot overlap dates
2. Phases must be in chronological order
3. No gaps between phases (optional - could allow)
4. At least one phase required if using payment schedule
5. Start date must be before end date (if end date exists)

## User Workflow

1. Create/Edit a rule
2. Toggle "Use Payment Schedule"
3. Add Phase 1: Amount, Start Date, End Date
4. Add Phase 2: Amount, Start Date, End Date
5. Add Phase 3: Amount, Start Date, (no end date = ongoing)
6. Save rule
7. System automatically uses correct phase based on date

## Benefits

- Single rule instead of multiple rules
- Clearer intent (one loan, multiple phases)
- Easier to manage and understand
- Better for reporting and analysis
- Handles complex payment structures

## Backward Compatibility

- Existing rules without paymentSchedule continue to work
- No data migration needed
- Optional feature - users can choose to use it or not
