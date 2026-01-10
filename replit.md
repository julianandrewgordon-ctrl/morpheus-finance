# Morpheus - Personal Finance Manager

## Overview

Morpheus is a React-based personal finance management application for cash flow tracking and projection. Users can create recurring income/expense rules, model "what-if" scenarios, and visualize financial projections over time. The app features scenario-based planning where users can compare multiple financial futures against a committed baseline plan.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Framework
- **React 18** with Vite for fast development and building
- **Mantine UI** (@mantine/core, @mantine/dates) for component library
- **Recharts** for data visualization (line charts for balance projections)

### State Management
- React hooks (useState, useMemo) for local state
- Browser localStorage for data persistence
- No external state management library

### Data Persistence
- All data stored in browser localStorage
- Export/import functionality via JSON files
- Automatic save on changes, automatic load on app start
- Data migration utilities for schema changes (scenarioId → scenarioIds array)

### Core Data Model
1. **Recurring Rules** - Income and expense rules with frequency, dates, amounts
2. **Scenarios** - "What-if" financial models that build on committed baseline
3. **Starting Balance** - Initial account balance with effective date
4. **Historical Cash Flows** - Past transactions for reconciliation

### Calculation Engine
Located in `src/utils/cashFlowCalculator.js`:
- Generates daily cash flow projections from rules
- Handles multiple frequencies (one-time, weekly, bi-weekly, monthly)
- Calculates running balance from starting balance forward
- Supports payment schedules with multiple phases
- Categorizes transactions by type and account (BOA, PNC, etc.)

### Scenario System
- **Committed Plan**: Rules without scenario assignment (baseline)
- **Scenario Lines**: Rules assigned to specific scenarios (additive model)
- Rules can be assigned to multiple scenarios simultaneously
- Visual distinction between committed (solid line) and scenarios (dashed lines)

### Key Components
- `App.jsx` - Main application shell, navigation, data management
- `Dashboard.jsx` - Summary cards, chart, cash flow table
- `BalanceChart.jsx` - Multi-line scenario comparison chart
- `CashFlowTable.jsx` - Daily transaction breakdown with tooltips
- `RecurringRules.jsx` - Rule management with filtering
- `QuickAddModal.jsx` - Add/edit transaction modal

## External Dependencies

### UI Framework
- **@mantine/core** - Component library (buttons, modals, forms, tables)
- **@mantine/dates** - Date picker components
- **@mantine/hooks** - React hooks utilities

### Data Visualization
- **recharts** - React charting library for balance projections

### Backend (Configured but Optional)
- **@supabase/supabase-js** - Supabase client configured in `src/lib/supabase.js`
- Requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables
- Currently app uses localStorage; Supabase integration available for future use

### Date Handling
- **dayjs** - Date manipulation library

### Build Tools
- **Vite** - Build tool and dev server (port 5000)
- **@vitejs/plugin-react** - React plugin for Vite

## Recent Changes

### January 10, 2026 - Fix New Rule Save Issue
- Fixed bug where new rules weren't saving in production
- Root cause: UNIQUE(user_id) constraint on financial_data conflicted with household mode
- Updated saveFinancialDataByHousehold to use array queries with .limit(1) to safely handle duplicates
- Updated getFinancialDataByHousehold to use array query pattern for consistency
- Added `supabase-fix-unique-constraint.sql` migration for existing deployments
  - Drops UNIQUE(user_id) constraint
  - Backfills legacy rows with household_id
  - Adds partial unique index for legacy mode (user_id WHERE household_id IS NULL)
  - Adds UNIQUE(household_id) constraint
- Added console logging for save operations to aid debugging
- **REQUIRED**: Run supabase-fix-unique-constraint.sql in production to apply changes

### December 17, 2025 - Household Sharing Feature
- Added multi-user household sharing for couples, families, or business partners
- Database schema for households, members, and email invitations (`supabase-household-schema.sql`)
- Role-based access control: owner, editor, viewer permissions
- HouseholdSettings component for managing members and sending invites
- Backward compatibility: Falls back to legacy single-user mode if household tables not set up
- Invitation system with email-based joining and pending invite management

### December 17, 2025 - Chart Start Date Selector
- Added date picker to Running Balance Chart for user-selectable start date
- Chart now displays projections starting from the selected date
- Both chart and cash flow table use the same start date for consistency

### December 17, 2025 - Payment Schedule UI
- Added "Use Payment Schedule" toggle in Edit Rule modal
- Phase editor with add/edit/delete functionality for multi-phase payment rules
- Amount field hidden when payment schedule is enabled
- Fixed NaN bug when saving rules with payment schedules (now averages phase amounts)

### December 17, 2025 - Mantine UI Migration
- Migrated from Cloudscape Design System to Mantine UI
- Resolved React duplication issue that caused production build crash (white screen)
- Updated 9 component files: App, LandingPage, Dashboard, RecurringRules, QuickAddModal, Export, CashFlowTable, OverrideModal, BalanceChart
- Reduced bundle size from 1314KB to 882KB
- Configured Vite to dedupe React dependencies for stable builds
- Production build and dev server working correctly