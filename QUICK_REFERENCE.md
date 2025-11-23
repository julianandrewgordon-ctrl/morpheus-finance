# Quick Reference Card

## 🚀 App Status
**URL**: http://localhost:5173/
**Status**: ✅ Running
**Design System**: AWS Cloudscape

## 📁 Project Structure
```
finance-manager/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx          ← Summary cards, chart, cash flow table
│   │   ├── BalanceChart.jsx       ← Recharts line chart
│   │   ├── CashFlowTable.jsx      ← Table with popovers
│   │   ├── RecurringRules.jsx     ← Full-page table with filters
│   │   ├── QuickAddModal.jsx      ← Modal form
│   │   └── Export.jsx             ← Export options
│   ├── data/
│   │   └── mockData.js            ← Sample data
│   ├── App.jsx                    ← Main app with AppLayout
│   └── main.jsx                   ← Entry point
├── QUICKSTART.md                  ← Start here!
├── CLOUDSCAPE_MIGRATION.md        ← Migration details
├── CLOUDSCAPE_COMPONENTS.md       ← Component reference
├── BEFORE_AFTER.md                ← Visual comparison
└── MIGRATION_SUMMARY.md           ← What changed
```

## 🎨 Key Cloudscape Components Used

| Component | Purpose | Location |
|-----------|---------|----------|
| AppLayout | Main shell | App.jsx |
| TopNavigation | Header bar | App.jsx |
| SideNavigation | Sidebar menu | App.jsx |
| Container | Content boxes | Dashboard, Export |
| Table | Data tables | CashFlowTable, RecurringRules |
| Modal | Dialogs | QuickAddModal |
| Button | Actions | All components |
| FormField | Form fields | QuickAddModal, Export |
| Select | Dropdowns | All forms |
| TextFilter | Search | RecurringRules |
| Popover | Tooltips | CashFlowTable |
| SpaceBetween | Spacing | All components |
| Box | Typography | All components |

## 🎯 Quick Actions

### Start Development
```bash
cd finance-manager
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🔍 Testing Checklist

- [ ] Navigate between Dashboard, Recurring Rules, Export
- [ ] Toggle sidebar with hamburger menu
- [ ] Switch profiles in top navigation
- [ ] Click scenario buttons on Dashboard
- [ ] Hover over cash flow table cells (see popovers)
- [ ] Search recurring rules
- [ ] Filter by type and account
- [ ] Click "Quick Add Transaction"
- [ ] Fill out and submit modal form
- [ ] Configure export options
- [ ] Resize window (test responsive)

## 📊 Sample Data

**Profiles**: Personal, Business, Rental Property
**Recurring Rules**: 6 rules (salary, rent, groceries, gym, gift, insurance)
**Cash Flow Data**: 30 days
**Scenarios**: Committed Plan, Gift Card A, Car Purchase

## 🎨 Color Coding

| Color | Meaning | Token |
|-------|---------|-------|
| 🟢 Green | Income/Positive | `text-status-success` |
| 🔴 Red | Expenses/Negative | `text-status-error` |
| 🔵 Blue | Draft/Scenario | `color="blue"` |
| ⚫ Gray | Secondary/Inactive | `text-body-secondary` |

## 🔧 Common Patterns

### Add a new page
1. Create component in `src/components/`
2. Add route in `App.jsx` navigation items
3. Add case in `getContent()` switch

### Add a new form field
```jsx
<FormField label="Field Name" constraintText="Help text">
  <Input
    value={value}
    onChange={({ detail }) => setValue(detail.value)}
  />
</FormField>
```

### Add a table column
```jsx
{
  id: 'columnId',
  header: 'Column Header',
  cell: item => <Box>{item.field}</Box>,
  width: 120
}
```

### Add a button with icon
```jsx
<Button variant="primary" iconName="add-plus" onClick={handler}>
  Button Text
</Button>
```

## 📚 Documentation Links

- **Cloudscape Home**: https://cloudscape.design/
- **Components**: https://cloudscape.design/components/
- **Patterns**: https://cloudscape.design/patterns/
- **Icons**: https://cloudscape.design/foundation/visual-foundation/icons/

## 🐛 Troubleshooting

### Port already in use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
npm run dev
```

### Dependencies out of sync
```bash
rm -rf node_modules package-lock.json
npm install
```

### Build errors
```bash
npm run build
# Check console for specific errors
```

## 💡 Tips

1. **Use SpaceBetween** for all spacing (not margins)
2. **Use Box** for typography (not raw HTML)
3. **Add constraintText** to form fields for hints
4. **Use variant="primary"** for main actions
5. **Add iconName** to buttons for better UX
6. **Use stickyHeader** on tables
7. **Add empty states** to all tables
8. **Use Popover** for additional info
9. **Check Cloudscape docs** for examples
10. **Test responsive** by resizing window

## 🚀 Next Steps

1. **Backend**: Connect to real API
2. **Database**: Set up PostgreSQL
3. **Auth**: Add authentication
4. **Testing**: Add unit tests
5. **Deploy**: Deploy to production

## 📞 Need Help?

1. Check `QUICKSTART.md` for getting started
2. Check `CLOUDSCAPE_COMPONENTS.md` for component reference
3. Check `BEFORE_AFTER.md` for examples
4. Check Cloudscape docs: https://cloudscape.design/
5. Check GitHub issues: https://github.com/cloudscape-design/components/issues

---

**Happy coding!** 🎉
