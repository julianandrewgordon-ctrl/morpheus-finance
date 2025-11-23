# Data Persistence Guide

## Overview
Your Personal Finance Manager now automatically saves all data to your browser's localStorage. This means your data persists across browser sessions and page refreshes.

## What Gets Saved Automatically

### 1. All Recurring Rules
- Every rule you add, edit, or delete
- Include/exclude status
- Scenario assignments
- All rule properties (name, amount, type, account, frequency, dates, etc.)

### 2. Starting Balance
- Balance amount
- Balance date

### 3. Historical Cash Flows
- All imported historical transactions

### 4. Scenarios
- Custom scenarios you create
- Scenario names and properties

### 5. Cash Flow Start Date
- Your selected start date for the cash flow table

## How It Works

### Automatic Saving
- **No manual save needed** - Data is saved automatically whenever you make changes
- Changes are saved instantly to localStorage
- Works completely offline (no server required)

### Automatic Loading
- When you open the app, it automatically loads your saved data
- If no saved data exists, it loads the default mock data
- Data persists even if you close the browser

## Data Management Features

### Export Data (Backup)
1. Click the **"Data"** menu in the top navigation bar
2. Select **"💾 Export Data"**
3. A JSON file will download with all your data
4. Save this file as a backup

**File name format:** `finance-data-YYYY-MM-DD.json`

### Reset to Defaults
1. Click the **"Data"** menu in the top navigation bar
2. Select **"🔄 Reset to Defaults"**
3. Confirm the action
4. All data will be reset to the original mock data
5. Page will reload automatically

**⚠️ Warning:** This action cannot be undone. Export your data first if you want to keep it!

## Storage Location

Data is stored in your browser's localStorage under these keys:
- `finance-manager-data` - All financial data
- `finance-manager-start-date` - Cash flow start date

## Storage Limits

- localStorage typically has a 5-10MB limit per domain
- This is more than enough for thousands of transactions
- If you reach the limit, you'll see an error in the browser console

## Best Practices

### Regular Backups
- Export your data monthly or before making major changes
- Keep backup files in a safe location (cloud storage, external drive)

### Browser Considerations
- Data is tied to the specific browser and profile you're using
- Clearing browser data will delete your financial data
- Private/Incognito mode may not persist data after closing

### Multiple Devices
- Data is stored locally per browser
- To sync across devices, export from one and import to another
- Consider using the same browser profile across devices

## Troubleshooting

### Data Not Saving
1. Check browser console for errors (F12 → Console tab)
2. Ensure localStorage is enabled in browser settings
3. Check if you're in private/incognito mode
4. Verify you have storage space available

### Data Lost After Browser Update
1. Check if browser data was cleared during update
2. Restore from your most recent export file
3. Set up regular automated backups

### Want to Start Fresh
1. Use "Reset to Defaults" from the Data menu
2. Or manually clear localStorage:
   - Open browser console (F12)
   - Type: `localStorage.clear()`
   - Refresh the page

## Future Enhancements

Potential features for data management:
- Import data from JSON file
- Sync across devices via cloud storage
- Automatic backup reminders
- Data versioning and undo history
- Export to CSV/Excel formats

## Technical Details

### Storage Format
Data is stored as JSON in localStorage:
```javascript
{
  "startingBalance": 15000,
  "startingBalanceDate": "2025-01-01",
  "recurringRules": [...],
  "scenarios": [...],
  "historicalCashFlows": [...]
}
```

### Error Handling
- If localStorage is unavailable, app falls back to in-memory storage
- Errors are logged to console for debugging
- App continues to function even if saving fails

### Performance
- Saving is nearly instantaneous (< 1ms typically)
- No impact on app performance
- Data loads synchronously on app start
