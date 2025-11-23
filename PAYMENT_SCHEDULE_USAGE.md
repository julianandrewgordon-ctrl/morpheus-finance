# Payment Schedule Feature - Usage Guide

## Status
✅ **Backend Implementation Complete** - The calculation engine now supports payment schedules
✅ **Visual Indicators Added** - Rules with payment schedules show phase badges
✅ **Tooltip Enhancement** - Hover tooltips show active phase information

## How to Use Payment Schedules

### Method 1: Manual Data Entry (Current)

Since the full UI is complex, you can add payment schedules by editing your data directly:

1. **Export your data** (Data menu → Export Data)
2. **Edit the JSON file** to add payment schedule
3. **Import it back** (future feature) or paste into localStorage

### Example Payment Schedule Structure

```json
{
  "id": 1,
  "name": "Renovation Loan",
  "type": "Cash Expense",
  "account": "BOA",
  "frequency": "Monthly",
  "include": true,
  "scenarioId": null,
  "paymentSchedule": [
    {
      "id": 1,
      "amount": -1500,
      "startDate": "2025-12-01",
      "endDate": "2026-03-31",
      "description": "Initial payment period"
    },
    {
      "id": 2,
      "amount": -1200,
      "startDate": "2026-04-01",
      "endDate": "2026-12-31",
      "description": "Reduced payment"
    },
    {
      "id": 3,
      "amount": -1000,
      "startDate": "2027-01-01",
      "endDate": null,
      "description": "Final payment amount"
    }
  ]
}
```

### Method 2: Browser Console (Quick)

1. Open browser console (F12)
2. Get your data:
```javascript
let data = JSON.parse(localStorage.getItem('finance-manager-data'))
```

3. Find your rule and add payment schedule:
```javascript
let rule = data.recurringRules.find(r => r.name === "Renovation Loan")
rule.paymentSchedule = [
  {
    id: 1,
    amount: -1500,
    startDate: "2025-12-01",
    endDate: "2026-03-31",
    description: "Initial payment"
  },
  {
    id: 2,
    amount: -1200,
    startDate: "2026-04-01",
    endDate: null,
    description: "Reduced payment"
  }
]
```

4. Save it back:
```javascript
localStorage.setItem('finance-manager-data', JSON.stringify(data))
```

5. Refresh the page

### What You'll See

Once a rule has a payment schedule:
- **Recurring Rules table**: Shows "{X} Phases" badge
- **Cash Flow table tooltip**: Shows "Phase X/Y: Description"
- **Calculations**: Automatically use the correct phase amount for each date

### Rules for Payment Schedules

1. **Phases must not overlap** - Each date should match only one phase
2. **Chronological order** - Phases should be in date order
3. **No gaps** - End date of phase N should be day before start date of phase N+1
4. **Last phase** - Can have null endDate for ongoing payments
5. **Amounts** - Use negative for expenses, positive for income

### Example Use Cases

**Graduated Loan Payments:**
```json
"paymentSchedule": [
  {"amount": -500, "startDate": "2025-01-01", "endDate": "2025-12-31"},
  {"amount": -750, "startDate": "2026-01-01", "endDate": "2026-12-31"},
  {"amount": -1000, "startDate": "2027-01-01", "endDate": null}
]
```

**Seasonal Income:**
```json
"paymentSchedule": [
  {"amount": 5000, "startDate": "2025-01-01", "endDate": "2025-05-31", "description": "Off-season"},
  {"amount": 8000, "startDate": "2025-06-01", "endDate": "2025-08-31", "description": "Peak season"},
  {"amount": 5000, "startDate": "2025-09-01", "endDate": "2025-12-31", "description": "Off-season"}
]
```

**Promotional Pricing:**
```json
"paymentSchedule": [
  {"amount": -50, "startDate": "2025-01-01", "endDate": "2025-06-30", "description": "Intro rate"},
  {"amount": -100, "startDate": "2025-07-01", "endDate": null, "description": "Regular rate"}
]
```

## Future UI Enhancement

A full payment schedule editor UI will be added in a future update with:
- Visual phase timeline
- Add/Edit/Delete phases
- Validation and error checking
- Drag-and-drop reordering
- Phase preview

For now, the backend fully supports payment schedules - you just need to add them via the methods above!
