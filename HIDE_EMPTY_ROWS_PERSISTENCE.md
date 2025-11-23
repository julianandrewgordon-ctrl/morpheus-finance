# Hide Empty Rows - Context Consistency

## Enhancement
The "Hide empty rows" toggle now maintains its state across page navigation and browser sessions.

## Problem Solved
Previously, the "Hide empty rows" toggle was stored in local component state in CashFlowTable. This meant:
- The setting would reset when navigating away from the Dashboard
- The setting would reset on page refresh
- Users had to re-enable it every time they returned to the Dashboard

## Solution Implemented

### 1. Lifted State to App Component
Moved the `hideEmptyRows` state from CashFlowTable to the App component:
```javascript
const [hideEmptyRows, setHideEmptyRows] = useState(() => {
  try {
    const saved = localStorage.getItem(HIDE_EMPTY_ROWS_KEY)
    return saved === 'true'
  } catch (error) {
    return false
  }
})
```

### 2. Added localStorage Persistence
The setting is automatically saved to localStorage whenever it changes:
```javascript
useEffect(() => {
  try {
    localStorage.setItem(HIDE_EMPTY_ROWS_KEY, hideEmptyRows.toString())
  } catch (error) {
    console.error('Error saving hide empty rows preference to localStorage:', error)
  }
}, [hideEmptyRows])
```

### 3. Props Flow
State flows from App → Dashboard → CashFlowTable:
- App manages the state and persistence
- Dashboard passes it through
- CashFlowTable uses it for filtering and toggle control

## User Experience

### Before
1. User enables "Hide empty rows"
2. User navigates to Recurring Rules page
3. User returns to Dashboard
4. ❌ Toggle is reset to "Show all rows"

### After
1. User enables "Hide empty rows"
2. User navigates to Recurring Rules page
3. User returns to Dashboard
4. ✅ Toggle remains "Hide empty rows"
5. ✅ Setting persists even after browser refresh

## Storage Details

### localStorage Key
`finance-manager-hide-empty-rows`

### Stored Value
- `"true"` - Hide empty rows enabled
- `"false"` or missing - Show all rows (default)

### Reset Behavior
The setting is cleared when using "Reset to Defaults" from the Data menu.

## Benefits

1. **Consistency** - Setting persists across navigation
2. **Convenience** - Users don't need to re-enable their preference
3. **User Control** - Setting is remembered across sessions
4. **Clean UX** - No unexpected state changes

## Files Modified

1. `src/App.jsx`
   - Added `hideEmptyRows` state with localStorage initialization
   - Added useEffect to persist changes
   - Passed props to Dashboard component
   - Included in reset functionality

2. `src/components/Dashboard.jsx`
   - Added props to function signature
   - Passed props through to CashFlowTable

3. `src/components/CashFlowTable.jsx`
   - Removed local state
   - Changed to use props from parent
   - Toggle now calls `onHideEmptyRowsChange` callback

## Technical Notes

### State Management Pattern
This follows React best practices for shared state:
- State lives at the lowest common ancestor (App)
- Props flow down unidirectionally
- Callbacks flow up for state updates

### Performance
- No performance impact
- localStorage operations are fast (< 1ms)
- State updates trigger minimal re-renders

### Future Enhancements
Could extend this pattern to other user preferences:
- Table sorting preferences
- Column visibility settings
- Chart display options
- Date range presets
