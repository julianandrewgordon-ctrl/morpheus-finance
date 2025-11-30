# Morpheus Finance - Feature Roadmap

## 🚀 Upcoming Features

### 1. Stock Price Sensitivity Analysis
**Priority:** High  
**Status:** Planned  
**Estimated Effort:** 2-3 weeks

**Description:**
Allow users to model how changes in stock price affect their RSU income and overall financial plan.

**Key Features:**
- **Stock Price Slider** - Adjust assumed stock price ($100-$300 range)
- **Breakeven Calculator** - Show minimum stock price needed to stay cash-flow positive
- **Risk Bands on Chart** - Visual indicators showing:
  - Green zone: Stock price above breakeven
  - Yellow zone: Within 10% of breakeven
  - Red zone: Below breakeven (need alternative funding)
- **Impact Summary Card** - Shows:
  - Total RSU income at current price
  - Surplus/shortfall vs expenses
  - Alternative funding needed
  - Critical dates where cash flow goes negative

**Technical Implementation:**
- Add `stockPrice` parameter to RSU income rules
- Create new calculation mode that multiplies RSU shares by current price
- Add price sensitivity chart overlay
- Create "Stock Price Scenarios" as a special scenario type

**User Workflow:**
1. User tags income rules as "RSU-based" with share count
2. User sets baseline stock price (e.g., $200)
3. User can adjust price slider to see real-time impact
4. Chart updates to show different outcomes
5. Dashboard shows risk assessment

---

### 2. Critical Milestones & Financial Checkpoints
**Priority:** Medium  
**Status:** Planned  
**Estimated Effort:** 1-2 weeks

**Description:**
Automatically identify and highlight critical financial milestones where large payments occur.

**Key Features:**
- **Timeline View** - Visual timeline of major payments (>$5K)
- **Cash Reserve Requirements** - Show required cash before each milestone
- **Risk Assessment** - Flag dates where balance drops below threshold
- **Alternative Funding Calculator** - Suggest backup plans for high-risk periods
- **Milestone Alerts** - Notifications 30/60/90 days before critical dates

**Technical Implementation:**
- Scan recurring rules for large one-time payments
- Calculate required reserves before each payment
- Add milestone markers to chart
- Create dedicated "Milestones" view

---

### 3. Multi-Currency Support
**Priority:** Low  
**Status:** Backlog  
**Estimated Effort:** 1 week

**Description:**
Support multiple currencies for international users or foreign income/expenses.

---

### 4. Budget vs Actual Tracking
**Priority:** Medium  
**Status:** Backlog  
**Estimated Effort:** 2 weeks

**Description:**
Compare projected cash flow against actual transactions imported from bank accounts.

---

### 5. Mobile App
**Priority:** Low  
**Status:** Backlog  
**Estimated Effort:** 4-6 weeks

**Description:**
Native mobile app for iOS and Android with offline support.

---

### 6. Shared Accounts & Collaboration
**Priority:** Medium  
**Status:** Backlog  
**Estimated Effort:** 2 weeks

**Description:**
Allow multiple users to collaborate on the same financial plan with role-based permissions.

---

## 📝 Feature Request Process

Have an idea? Add it here or create a GitHub issue!

**Template:**
```
### Feature Name
**Priority:** High/Medium/Low
**Status:** Proposed
**Description:** Brief description
**Use Case:** Why is this needed?
**Estimated Effort:** X weeks
```

---

## ✅ Completed Features

### Phase 1: Core Application (Nov 2024)
- ✅ Multi-scenario planning
- ✅ Payment schedules
- ✅ 12-month cash flow projections
- ✅ Interactive charts
- ✅ Export/Import functionality

### Phase 2: Cloud Integration (Nov 2024)
- ✅ Supabase authentication
- ✅ Cloud database storage
- ✅ Cross-device sync
- ✅ Auto-save functionality

### Phase 3: UX Improvements (Nov 2024)
- ✅ Scenario selector with chart highlighting
- ✅ Scenario-based table filtering
- ✅ Current balance tied to scenarios
- ✅ Auto-logout on browser close
- ✅ Crystal ball favicon
- ✅ Consistent "Base Scenario" naming
