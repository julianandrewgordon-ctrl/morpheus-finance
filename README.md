# Personal Finance Manager - React Prototype

A React web prototype for automated personal cash flow tracking and projection.

## Features Implemented

### Dashboard (Cloudscape Design)
- Professional summary cards with responsive grid layout
- Scenario selector with button group
- Running balance chart in container with header
- Advanced cash flow table with hover popovers
- Date range navigation with icon buttons
- Color-coded metrics (green for income, red for expenses)

### Recurring Rules (Cloudscape Design)
- Full-page table with advanced filtering
- Text search with live filtering
- Type and account dropdown filters
- Inline badges for status and accounts
- Action dropdown menus per row
- Counter showing filtered/total items

### Quick Add Modal (Cloudscape Design)
- Professional modal dialog with form validation
- Form fields with labels and constraints
- Radio groups for frequency selection
- Date pickers for date inputs
- Conditional fields based on selections
- Checkbox for draft/scenario mode

### Export (Cloudscape Design)
- Three separate export sections in containers
- Checkbox groups for export options
- Date range pickers for cash flow exports
- Professional button styling with icons
- Read-only file name previews

### Layout & Navigation (Cloudscape Design)
- AppLayout with collapsible side navigation
- TopNavigation with profile switcher dropdown
- Responsive design that adapts to screen sizes
- Professional AWS-style interface

## Getting Started

### Install Dependencies

\`\`\`bash
cd finance-manager
npm install
\`\`\`

### Run Development Server

\`\`\`bash
npm run dev
\`\`\`

The app will be available at `http://localhost:5173`

### Build for Production

\`\`\`bash
npm run build
\`\`\`

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Recharts** - Chart visualization library
- **AWS Cloudscape Design System** - Professional UI component library

## Project Structure

\`\`\`
finance-manager/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx          # Main dashboard view
│   │   ├── BalanceChart.jsx       # Running balance chart
│   │   ├── CashFlowTable.jsx      # Cash flow table with tooltips
│   │   ├── RecurringRules.jsx     # Recurring rules management
│   │   ├── QuickAddModal.jsx      # Transaction entry modal
│   │   └── Export.jsx             # Data export interface
│   ├── data/
│   │   └── mockData.js            # Sample data for prototype
│   ├── App.jsx                    # Main app component
│   ├── App.css                    # Global app styles
│   ├── main.jsx                   # App entry point
│   └── index.css                  # Global styles
├── index.html
├── package.json
└── vite.config.js
\`\`\`

## Key Features

### Color Coding
- **Green** - Income/positive cash flow
- **Red** - Expenses/negative cash flow
- **Blue** - Draft/scenario entries
- **Gray** - Excluded/inactive rules

### Interactive Elements
- Click cells in cash flow table to see transaction breakdowns
- Filter and search recurring rules
- Switch between profiles
- Toggle between scenarios

### Mock Data
The prototype includes sample data:
- 3 profiles (Personal, Business, Rental Property)
- 6 recurring rules (salary, rent, groceries, etc.)
- 30 days of generated cash flow data
- 3 scenarios (Committed Plan, Gift Card A, Car Purchase)

## Next Steps

To convert this prototype into a full application:

1. **Backend API** - Implement RESTful API with Node.js/Express
2. **Database** - Set up PostgreSQL with schema from BRD
3. **Calculation Engine** - Build recurring entry generation logic
4. **Authentication** - Add user authentication (if multi-user)
5. **Real Data** - Replace mock data with API calls
6. **State Management** - Consider Redux/Context for complex state
7. **Testing** - Add unit and integration tests
8. **Deployment** - Deploy to production environment

## Design System

This prototype uses the **AWS Cloudscape Design System**, providing:
- Enterprise-grade UI components
- WCAG 2.1 AA accessibility compliance
- Responsive layouts out of the box
- Professional AWS-style interface
- Dark mode support (configurable)

See `CLOUDSCAPE_MIGRATION.md` for detailed information about the Cloudscape implementation.

## Notes

This is a visual prototype demonstrating the UI/UX design from the wireframes using professional Cloudscape components. The data is mocked and calculations are simplified. For production use, implement proper backend services and calculation engine as specified in the Business Requirements Document.
