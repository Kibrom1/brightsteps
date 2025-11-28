# Phase 4 - Architecture & Implementation Plan

## High-Level Architecture

### Frontend Structure (React + TypeScript)

```
frontend/src/
├── components/
│   ├── charts/
│   │   ├── CapRatePerDealChart.tsx
│   │   ├── CashFlowPerDealChart.tsx
│   │   ├── PortfolioBreakdownChart.tsx
│   │   └── DealCashFlowProjectionChart.tsx
│   ├── deals/
│   │   ├── DealFilters.tsx
│   │   ├── DealSearchBar.tsx
│   │   └── ComparableProperties.tsx
│   ├── notifications/
│   │   ├── NotificationBell.tsx
│   │   └── NotificationDropdown.tsx
│   ├── ui/
│   │   ├── Toast.tsx
│   │   ├── Skeleton.tsx
│   │   └── EmptyState.tsx
│   └── Layout.tsx (updated)
├── lib/
│   ├── api/
│   │   ├── deals.ts (updated with filters, comps, export)
│   │   ├── notifications.ts (new)
│   │   └── users.ts (updated with preferences)
│   ├── utils/
│   │   ├── csv-export.ts (new)
│   │   └── formatters.ts (new)
│   └── hooks/
│       ├── useNotifications.ts (new)
│       ├── useDebounce.ts (new)
│       └── useToast.ts (new)
├── contexts/
│   ├── AuthContext.tsx (existing)
│   └── ToastContext.tsx (new)
└── types/
    └── index.ts (updated with Phase 4 types)
```

### Key Technologies

- **Charts**: Recharts (React charting library)
- **State Management**: React Query (existing) + React Context (for toasts/notifications)
- **Routing**: React Router (existing)
- **Styling**: Tailwind CSS (existing)

### Data Flow

1. **Charts**: Fetch deals → Transform data → Render charts
2. **Search/Filter**: Client-side filtering (can be upgraded to server-side)
3. **Notifications**: Poll API or use WebSocket (Phase 4: polling)
4. **Exports**: Client-side CSV generation, server-side PDF generation

## Backend Endpoints (New/Updated)

### 1. Deals with Filters
```
GET /api/v1/deals?city=...&min_cap_rate=...&property_type=...
Query Parameters:
  - search: string (address/city/zip/notes)
  - property_type: string (comma-separated)
  - city: string
  - state: string
  - zip_code: string
  - min_cap_rate: number
  - min_monthly_cash_flow: number
  - min_dscr: number
  - skip: number
  - limit: number
```

### 2. Comparable Properties
```
GET /api/v1/deals/{id}/comps
Response: { data: Deal[] }
```

### 3. Notifications
```
GET /api/v1/notifications
Response: { data: Notification[] }

POST /api/v1/notifications/{id}/read
Response: { data: Notification }
```

### 4. User Preferences
```
PUT /api/v1/users/me
Body: {
  full_name?: string;
  preferences?: UserPreferences;
}
```

### 5. Export
```
GET /api/v1/deals/export.csv?filters...
GET /api/v1/deals/{id}/export.pdf
```

## Component Responsibilities

### Chart Components
- **CapRatePerDealChart**: Bar chart sorted by cap rate
- **CashFlowPerDealChart**: Bar/line chart of monthly/annual cash flow
- **PortfolioBreakdownChart**: Donut/pie chart by property type or location
- **DealCashFlowProjectionChart**: Line chart with growth projections

### Filter Components
- **DealSearchBar**: Debounced text search
- **DealFilters**: Multi-select filters with reset button

### Notification System
- **NotificationBell**: Badge with unread count, dropdown on click
- **useNotifications**: Hook for fetching and managing notifications

### Export
- **CSV Export**: Client-side generation from deals array
- **PDF Export**: Link to backend endpoint

