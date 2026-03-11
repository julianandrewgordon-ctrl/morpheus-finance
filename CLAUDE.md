# Morpheus Finance — Agent Context

## Project Overview

Morpheus Finance is a React-based personal finance management tool for automated cash flow tracking, 12-month projections, and "what-if" scenario analysis. Users can model multiple financial futures, compare scenarios, and make informed decisions by visualizing their financial trajectory.

> **Key Decision Log:**
> - 2025-01: Transitioned from local storage to Supabase cloud backend
> - 2025-01: Added multi-user household sharing with role-based access
> - 2025-01: Implemented scenario-based rule overrides
> - 2026-03: P0 priority shifted to bank account data integration for forecasting accuracy

## Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| **Framework** | React 18.2 + Vite 5.4 | Fast build, HMR |
| **UI Components** | Mantine 8.3.10 | `@mantine/core`, `@mantine/dates`, `@mantine/hooks` |
| **Styling** | Mantine built-in | No Tailwind, no CSS modules |
| **Charts** | Recharts 2.10.3 | Multi-line cash flow visualization |
| **Database** | Supabase (PostgreSQL) | Cloud-hosted with RLS |
| **Auth** | Supabase Auth | Email/password, password reset |
| **State** | React hooks only | useState, useMemo, useRef — no Redux |
| **Date handling** | dayjs 1.11 | Date manipulation |

## Directory Structure

```
├── src/
│   ├── App.jsx              — Main app component, root state management
│   ├── main.jsx             — Entry point, Mantine theme setup
│   ├── components/          — React components
│   │   ├── Dashboard.jsx        — Summary cards, chart, table container
│   │   ├── BalanceChart.jsx     — Multi-scenario running balance chart
│   │   ├── CashFlowTable.jsx    — Daily transaction breakdown
│   │   ├── RecurringRules.jsx   — CRUD for financial rules
│   │   ├── QuickAddModal.jsx    — Add transactions modal
│   │   ├── OverrideModal.jsx    — Scenario-specific rule overrides
│   │   ├── Export.jsx           — JSON import/export
│   │   ├── LandingPage.jsx      — Auth (signin/signup)
│   │   └── HouseholdSettings.jsx— Multi-user household management
│   ├── lib/
│   │   └── supabase.js      — Supabase client + helper functions
│   ├── utils/
│   │   ├── cashFlowCalculator.js — Core calculation engine
│   │   ├── ruleOverrides.js      — Scenario override logic
│   │   └── dataMigration.js      — Data format migrations
│   └── data/
│       └── mockData.js      — Sample data for development
├── public/                  — Static assets, branding
├── supabase/                — Supabase CLI temp files
├── docs/                    — 30+ documentation files
│   ├── COMPLETE_SPECIFICATION.md
│   ├── FEATURE_ROADMAP.md
│   ├── CALCULATION_ENGINE.md
│   └── ...
└── *.sql                    — Database schema files
```

## Built Features

- ✅ **Dashboard** — Summary cards, 12-month projection chart, daily cash flow table
- ✅ **Multi-scenario planning** — Create, edit, delete scenarios; compare side-by-side
- ✅ **Recurring rules** — CRUD with frequency, accounts, types, date ranges
- ✅ **Rule overrides** — Modify base rules per scenario (amount, frequency, dates)
- ✅ **Payment schedules** — Multi-phase payment modeling
- ✅ **Starting balance** — Set initial balance with effective date
- ✅ **Historical cash flows** — Import past transactions
- ✅ **Cloud sync** — Auto-save to Supabase with 1s debounce
- ✅ **Authentication** — Sign up, sign in, password reset via Supabase Auth
- ✅ **Household sharing** — Multi-user access with Owner/Editor/Viewer roles
- ✅ **Data export/import** — JSON backup and restore
- ✅ **Error notifications** — Alert users when saves fail
- 🔶 **Bank data integration** — In progress (P0 priority)

## Feature Deep Dives

### Cash Flow Calculation Engine — Complete
**Core Service:** `src/utils/cashFlowCalculator.js`

**Functionality:**
- Generates daily cash flow table for 12-month period
- Applies rules based on frequency (One-time, Weekly, Bi-weekly, Monthly)
- Handles payment schedules with multiple phases
- Categorizes by type (Income, BOA, PNC, Variable, Reno, One-Off)
- Returns running balance with transaction breakdowns

### Scenario System — Complete
**Core Services:**
- `src/utils/ruleOverrides.js` — Override logic
- `src/App.jsx` — Scenario state management

**Behavior:**
- Base Scenario contains committed/baseline rules
- Alternative scenarios inherit all base rules + scenario-specific rules
- Rule overrides modify base rule values within a scenario
- Exclusions remove base rules from specific scenarios

### Supabase Integration — Complete
**Core Service:** `src/lib/supabase.js`

**Tables:**
- `user_profiles` — User metadata
- `financial_data` — JSONB storage of all financial state
- `user_preferences` — Start date, hide empty rows
- `households` — Household names
- `household_members` — Role-based membership
- `household_invites` — Pending invitations

**RLS:** Row-level security ensures users only access their own data or shared household data.

---

## External Integrations

| Integration | Status | Priority | Notes |
|-------------|--------|----------|-------|
| Supabase | ✅ Built | P0 | Auth + Database |
| Bank Data (Plaid/similar) | 🔶 In Progress | P0 | Actual transaction import |

---

## Roadmap

### P0 — Critical Path
- 🔶 Bank account data integration — Pull actual transactions for forecasting accuracy

### P1 — Important
- (None currently)

### P2 — Deferred
- [ ] Stock/RSU price sensitivity analysis
- [ ] Budget vs Actual tracking
- [ ] Critical milestones detection
- [ ] Multi-currency support
- [ ] Mobile app (iOS/Android)

---

## Design System

- **Theme:** Light mode, violet/purple primary
- **Primary color:** Violet (`primaryColor: 'violet'` in Mantine)
- **Typography:** Inter, system-ui, sans-serif
- **Component library:** Mantine (AppShell, Modal, Table, Stack, Paper, etc.)
- **Spacing:** Mantine's gap system (md, lg)

**Scenario Chart Colors:**
```javascript
['#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22',
 '#16a085', '#c0392b', '#27ae60', '#d35400', '#8e44ad', '#c0392b']
```

**Semantic Colors:**
| Use | Color |
|-----|-------|
| Income/Positive | `#2ecc71` (green) |
| Expenses/Negative | `#e74c3c` (red) |
| Draft/Scenario indicator | `#3498db` (blue) |

---

## Client Notes (Web)

- **Styling:** Mantine components only — no Tailwind, no inline `style={}` except dynamic values
- **Routing:** Single-page app with state-based navigation (`activeHref` in App.jsx)
- **State:** React hooks (useState, useMemo, useRef) — no external state management
- **Data fetching:** Direct Supabase client calls — no React Query/SWR currently
- **Key pages:** `/dashboard`, `/scenarios`, `/export`, `/household`

---

## Coding Conventions

- **JavaScript** (not TypeScript currently, but strict practices apply)
- **Functional components only** — no class components
- **Mantine for all UI** — use existing components before creating new ones
- **Supabase for persistence** — never localStorage for user data
- **useMemo for expensive calculations** — especially cash flow generation
- **useRef for side-effect tracking** — pending edits, initial load flags
- **1-second debounce** on auto-saves

---

## Scope Notes

- **Primary surface:** Web only (no mobile app currently)
- **No payment processing** — visualization and planning tool only
- **Legacy mode:** App supports users without household tables (graceful degradation)

---

---

# Morpheus Finance — AI Rules & Constraints

> **This document defines mandatory constraints for all AI-assisted development. Every rule is imperative.**

---

## 1. Tech Stack — Non-Negotiables

You MUST use the following technologies. Do NOT introduce alternatives without explicit user approval.

| Layer | Technology | Notes |
|-------|------------|-------|
| Framework | React 18 + Vite | Functional components, hooks |
| UI | Mantine 8.x | All UI components from Mantine |
| Database | Supabase (PostgreSQL) | Schema in `*.sql` files at root |
| Auth | Supabase Auth | Email/password |
| Charts | Recharts | LineChart for projections |
| Dates | dayjs | Date manipulation |

### Banned Practices
- **Do NOT use** `any` in any TypeScript/JSDoc — use proper types
- **Do NOT install** new npm dependencies without explicit user approval
- **Do NOT use** Tailwind, styled-components, or other CSS solutions — Mantine only
- **Do NOT use** Redux, Zustand, or external state management — React hooks only
- **Do NOT use** localStorage for user data — Supabase only

---

## 2. Design System — Mantine Usage

### Mandatory Component Import
You MUST use Mantine components. **NEVER create custom HTML elements when Mantine provides an equivalent.**

```jsx
// ✅ CORRECT
import { Button, Stack, Paper, Text } from '@mantine/core';

// ❌ WRONG — raw HTML
<div className="card">
<button onClick={...}>
```

### Color Usage
Use Mantine's color system:
```jsx
// ✅ CORRECT
<Text c="dimmed">Secondary text</Text>
<Badge color="green">Active</Badge>

// ❌ WRONG — hardcoded colors
<Text style={{ color: '#666' }}>
```

---

## 3. Available Components — Use Before Creating

You MUST use existing components. **Do NOT create a new component if an equivalent exists.**

| Component | Location | Purpose |
|-----------|----------|---------|
| `Dashboard` | `components/Dashboard.jsx` | Main dashboard view |
| `BalanceChart` | `components/BalanceChart.jsx` | Multi-scenario chart |
| `CashFlowTable` | `components/CashFlowTable.jsx` | Transaction table |
| `RecurringRules` | `components/RecurringRules.jsx` | Rule management |
| `QuickAddModal` | `components/QuickAddModal.jsx` | Add transaction modal |
| `OverrideModal` | `components/OverrideModal.jsx` | Scenario rule overrides |
| `Export` | `components/Export.jsx` | Import/export data |
| `HouseholdSettings` | `components/HouseholdSettings.jsx` | Multi-user management |
| `LandingPage` | `components/LandingPage.jsx` | Auth page |

### Rules for Components
1. **Before creating a new component**, check the table above
2. **New components** MUST use Mantine — no custom styling
3. **Loading states** MUST use Mantine's Loader or Skeleton
4. **Error states** MUST use Mantine's Alert component

---

## 4. Execution Discipline

### Before Writing Any Code
1. **Read the relevant files first.** Never assume file contents.
2. **Check the schema** (`*.sql` files) before touching database-related code.
3. **Check `src/lib/supabase.js`** before adding Supabase operations.
4. **Check `src/utils/`** before adding calculation logic.

### While Writing Code
1. **Functional components only.** No class components.
2. **One concern per file.** Utils = logic. Components = UI. lib = API.
3. **Prefer small, focused changes.** Do NOT refactor unrelated code mid-feature.
4. **All Supabase data** MUST go through `src/lib/supabase.js` helpers.
5. **All calculations** MUST use `src/utils/cashFlowCalculator.js` patterns.

### After Writing Code
1. **Test manually** — verify the feature works in browser.
2. **Check console** — zero errors or warnings.
3. **Update docs** if screens or architecture changed.

---

## 5. Stop and Replan Triggers

**STOP writing code and present a plan to the user BEFORE proceeding** when:

### Mandatory Replan — Always Stop
| Trigger | Why |
|---------|-----|
| Modifying `*.sql` schema files | Schema changes require migrations |
| Creating a new Supabase table | Database changes cascade everywhere |
| Adding a new npm dependency | Affects bundle size and compatibility |
| Changing `src/lib/supabase.js` exports | Affects all data operations |
| Changing `cashFlowCalculator.js` core logic | Affects all projections |
| Modifying authentication flow | Auth bugs lock out users |
| Changing more than 5 files | Scope creep — break it down |

### Conditional Replan — Use Judgment
| Trigger | Action |
|---------|--------|
| Error unresolved after 2 attempts | Stop. Diagnose root cause. Present findings. |
| Multiple valid approaches exist | Present options with tradeoffs, let user choose |

---

## 6. Diagnosis-First Debugging

When encountering errors, follow this protocol **in order**:

```
Step 1: REPRODUCE — Confirm the error. Read the exact message.
Step 2: UNDERSTAND — Read surrounding code. What SHOULD it do?
Step 3: TRACE — Follow the data flow. Where does input come from?
Step 4: HYPOTHESIZE — "X fails because Y."
Step 5: VERIFY — Test hypothesis with minimum change.
Step 6: FIX — Apply fix. Verify original error gone. Verify no new errors.
```

### Anti-Patterns — NEVER Do These
- **NEVER** shotgun debug — multiple speculative changes at once.
- **NEVER** rewrite working code without understanding why it exists.
- **NEVER** say "this should work" without testing.

---

## 7. Key Techniques (Web)

| Technique | Rule |
|-----------|------|
| Styling | Mantine components — no custom CSS |
| State | useState, useMemo, useRef — no external libraries |
| Data fetching | Supabase client via `src/lib/supabase.js` |
| Forms | Mantine form components with validation |
| Modals | Mantine Modal with useDisclosure hook |
| Lists | Mantine Table — no virtualization needed yet |

### Server / Supabase
| Technique | Rule |
|-----------|------|
| Schema changes | Modify SQL files, document migration steps |
| RLS policies | Always maintain row-level security |
| Queries | Use Supabase client methods, not raw SQL |

---

## 8. Implementation Planning

For any task touching more than 2 files, create a plan before coding:

```markdown
## What — [One sentence]
## Why — [User-facing problem solved]
## Files to Modify
- [ ] `path/to/file.js` — description
## Files to Create
- [ ] `path/to/new-file.js` — purpose
## Dependencies / Blockers
## Risks
## Verification
- [ ] Feature works in browser
- [ ] No console errors
- [ ] [Specific verification steps]
```

Present to user **before** coding.

---

## 9. Definition of Done

A task is NOT complete until ALL of the following are true:

- [ ] **Works.** Feature functions correctly in browser.
- [ ] **No errors.** Console is clean.
- [ ] **No regressions.** Existing functionality still works.
- [ ] **Mantine components used.** No hardcoded styles.
- [ ] **No debug artifacts.** No `console.log` statements left behind.

---

## 10. Git Discipline

1. **Commit messages** follow conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`.
2. **One concern per commit.** Do not bundle unrelated changes.
3. **Never commit** `node_modules/`, `.env.local`, `*.log`, or build artifacts.

---

## 11. Summary of Hard Rules

1. **Mantine for all UI.** No custom CSS or alternative libraries.
2. **React hooks only.** No external state management.
3. **Supabase for data.** No localStorage for user data.
4. **No new dependencies** without approval.
5. **No schema changes** without a plan.
6. **Read files first** — never assume contents.
7. **Test in browser** before declaring done.
8. **Diagnosis first** — never shotgun debug.
9. **Stop and replan** when scope exceeds the request.
10. **Use existing components** before creating new ones.
