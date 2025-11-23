# Quick Start Guide

## Your Cloudscape-Powered React Prototype is Running! 🎉

The Personal Finance Manager prototype with **AWS Cloudscape Design System** is now live at:
**http://localhost:5173/**

### What's New with Cloudscape?
✨ Professional AWS-style interface
✨ Enterprise-grade UI components
✨ Full accessibility support (WCAG 2.1 AA)
✨ Responsive design built-in
✨ Advanced tables with filtering and sorting
✨ Professional modals and forms

## What You Can Do

### Navigation
- **Sidebar Navigation** - Click items to switch between Dashboard, Recurring Rules, and Export
- **Collapse/Expand** - Click the hamburger menu (☰) to toggle the sidebar
- **Profile Switcher** - Click the profile dropdown in the top-right corner to switch profiles

### 1. Dashboard Tab
- View **summary cards** in a responsive grid with color-coded metrics
- Select different scenarios using the **button group** scenario selector
- View the **running balance chart** in a professional container
- Scroll through the **advanced cash flow table** (30 days of sample data)
- **Hover over cells** to see transaction breakdowns in popovers
- Navigate date ranges using **icon buttons**

### 2. Recurring Rules Tab
- View all recurring rules in a **full-page table** with sticky headers
- **Text search** - Type in the search box to filter rules by name
- **Type filter** - Use the dropdown to filter by transaction type
- **Account filter** - Use the dropdown to filter by account
- **Clear filters** - Click the "Clear filters" button to reset
- See **counter** showing filtered vs total items
- View **badges** for accounts and draft status
- Use **action dropdowns** for edit/delete options

### 3. Export Tab
- Three separate **export sections** in professional containers
- Configure export options with **checkbox groups**
- Set date ranges with **date pickers**
- Preview file names in read-only inputs
- Click **export buttons** with download icons

### 4. Quick Add Transaction
- Click **"Quick Add Transaction"** button (primary button with icon)
- Fill in the **professional modal form** with proper validation
- Use **radio groups** for frequency selection
- Pick dates with the **date picker** component
- Toggle **"Add as Draft/Scenario Entry"** checkbox
- Submit or cancel with footer buttons

### 5. Profile Switching
- Click the **profile dropdown** in the top navigation
- Select from Personal, Business, or Rental Property
- See the profile icon and name in the utility menu

## Sample Data Included

The prototype includes:
- **6 recurring rules**: Salary, Rent, Groceries, Gym, Holiday Gift, Car Insurance
- **30 days** of generated cash flow data
- **3 scenarios**: Committed Plan, Gift Card A, Car Purchase
- **3 profiles**: Personal, Business, Rental Property

## Key Cloudscape Features to Test

✅ **Collapsible Navigation** - Toggle the sidebar with the hamburger menu
✅ **Hover Popovers** - Hover over cash flow table cells to see breakdowns
✅ **Advanced Filtering** - Use text search and dropdown filters together
✅ **Professional Modals** - Open the Quick Add modal with proper form validation
✅ **Responsive Tables** - Resize the window to see table responsiveness
✅ **Button Groups** - Click scenario selector buttons
✅ **Date Pickers** - Use the calendar date picker in forms
✅ **Badges & Status** - See visual indicators for accounts and draft entries
✅ **Action Dropdowns** - Click the action menu in the recurring rules table
✅ **Profile Dropdown** - Use the utility menu in the top navigation

## 🆕 New Features to Try

✅ **Batch Upload Rules** - Upload multiple rules at once (CSV or JSON)
✅ **Delete Rules** - Remove rules via Actions dropdown
✅ **Edit Scenario Names** - Rename scenarios with the edit icon
✅ **Set Start Date** - Control cash flow table start date
✅ **Include Checkbox** - Toggle rules on/off with functional checkbox

See `NEW_FEATURES.md` for detailed instructions on using these features!

## Color Coding

- 🟢 **Green** = Income/positive amounts
- 🔴 **Red** = Expenses/negative amounts
- ⚠ **Warning icon** = Draft/scenario entries
- 🔒 **Lock icon** = Balance override active

## Next Steps

This is a **visual prototype** with mock data. To build the full application:

1. Set up PostgreSQL database
2. Build backend API (Node.js/Express)
3. Implement calculation engine for recurring entries
4. Connect frontend to real API
5. Add authentication (if needed)
6. Deploy to production

## Development Commands

```bash
# Start dev server (already running)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Cloudscape Resources

- **Cloudscape Design System**: https://cloudscape.design/
- **Component Library**: https://cloudscape.design/components/
- **Patterns & Guidelines**: https://cloudscape.design/patterns/
- Check `CLOUDSCAPE_MIGRATION.md` for detailed Cloudscape implementation notes

## Need Help?

- Check `README.md` for detailed documentation
- Review `CLOUDSCAPE_MIGRATION.md` for Cloudscape-specific features
- Review the Business Requirements Document for full specifications
- See the wireframes for design reference

Enjoy exploring your professionally designed Personal Finance Manager prototype! 🚀✨
