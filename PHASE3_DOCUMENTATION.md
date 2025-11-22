# Phase 3 - Web App MVP Documentation

## Overview

Phase 3 delivers a complete React + TypeScript web application that provides a user-friendly interface for the BrightSteps real estate investment platform. Users can register, log in, create deals, view analytics, and manage their investment portfolio.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  React Application                      │
├─────────────────────────────────────────────────────────┤
│  Pages Layer                                            │
│  ├── Login/Register (Public)                           │
│  ├── Dashboard (Protected)                              │
│  ├── Deal Create/Edit/Detail (Protected)               │
│  └── Profile (Protected)                                │
├─────────────────────────────────────────────────────────┤
│  Components Layer                                       │
│  ├── Layout (Navigation)                                │
│  └── ProtectedRoute (Auth Guard)                        │
├─────────────────────────────────────────────────────────┤
│  State Management                                       │
│  ├── AuthContext (Authentication State)                │
│  └── React Query (Server State, Caching)                │
├─────────────────────────────────────────────────────────┤
│  API Client Layer                                        │
│  ├── Base API Client (Token, Error Handling)            │
│  ├── Auth API                                           │
│  ├── Deals API                                          │
│  ├── Users API                                          │
│  └── Properties API                                     │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
                  FastAPI Backend (Phase 2)
```

### Directory Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   ├── contexts/            # React contexts (Auth)
│   ├── lib/                 # Utilities and API clients
│   │   ├── api-client.ts    # Base HTTP client
│   │   └── api/             # API modules
│   ├── pages/               # Page components
│   ├── types/               # TypeScript definitions
│   ├── App.tsx              # Main app + routing
│   └── main.tsx             # Entry point
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

## Key Features

### 1. Authentication System

**Implementation:**
- JWT token stored in `sessionStorage` (more secure than localStorage)
- Auto-redirect on 401 errors
- Protected routes using `ProtectedRoute` component
- Auth context provides: `login()`, `register()`, `logout()`, `user` state

**Security:**
- Tokens cleared on tab close (sessionStorage)
- Automatic logout on token expiration
- Protected routes prevent unauthorized access

### 2. API Client Architecture

**Base Client (`api-client.ts`):**
- Centralized HTTP client
- Automatic token injection
- Error handling (401 → redirect to login)
- Response normalization

**API Modules:**
- `auth.ts` - Login, register
- `deals.ts` - CRUD operations
- `users.ts` - User profile
- `properties.ts` - Property data

**Usage Pattern:**
```typescript
import { dealsApi } from '../lib/api/deals';
import { useQuery } from '@tanstack/react-query';

const { data, isLoading } = useQuery({
  queryKey: ['deals'],
  queryFn: () => dealsApi.getDeals(),
});
```

### 3. State Management

**React Query:**
- Server state management
- Automatic caching
- Background refetching
- Optimistic updates

**Auth Context:**
- Client-side auth state
- Token management
- User profile

### 4. Routing

**Routes:**
- `/login` - Public
- `/register` - Public
- `/dashboard` - Protected
- `/deals/new` - Protected
- `/deals/:id` - Protected
- `/deals/:id/edit` - Protected
- `/profile` - Protected
- `/*` - 404 page

**Route Protection:**
```typescript
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Layout>
        <DashboardPage />
      </Layout>
    </ProtectedRoute>
  }
/>
```

## Component Details

### Pages

#### LoginPage
- Email/password form
- Error handling
- Redirect to dashboard on success
- Link to registration

#### RegisterPage
- Full name, email, password
- Auto-login after registration
- Validation feedback

#### DashboardPage
- Summary cards (total deals, avg cap rate, avg cash flow)
- Deals table with key metrics
- "Create New Deal" button
- Click deal to view details

#### DealCreatePage
- Comprehensive form (all deal fields)
- Real-time validation
- Loading states
- Redirect to deal detail on success

#### DealDetailPage
- Deal information display
- Analytics snapshot visualization
- Assumptions used
- "Edit Deal" and "Recalculate" buttons

#### DealEditPage
- Pre-filled form
- Same validation as create
- Auto-recalculates analytics on save

#### ProfilePage
- User information display
- Account creation date
- Read-only (editing can be added)

### Components

#### Layout
- Top navigation bar
- Brand logo
- User menu (name, logout)
- Main content area

#### ProtectedRoute
- Checks authentication
- Shows loading state
- Redirects to login if not authenticated

## Styling

### Tailwind CSS

**Why Tailwind?**
- Rapid development
- Consistent design system
- Small bundle size (purges unused styles)
- Responsive utilities

**Custom Theme:**
- Primary color: Blue scale (primary-50 to primary-900)
- Consistent spacing
- Typography scale

**Example:**
```tsx
<button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
  Submit
</button>
```

## TypeScript Types

All types match backend models:

```typescript
interface Deal {
  id: number;
  purchase_price: number;
  // ... all fields
  snapshot_of_analytics_result?: AnalyticsSnapshot;
}

interface AnalyticsSnapshot {
  cash_flow: CashFlowSnapshot;
  dscr: DSCRSnapshot;
  deal_analysis: DealAnalysisSnapshot;
}
```

## API Integration Examples

### Fetching Deals

```typescript
import { useQuery } from '@tanstack/react-query';
import { dealsApi } from '../lib/api/deals';

function Dashboard() {
  const { data: deals, isLoading } = useQuery({
    queryKey: ['deals'],
    queryFn: () => dealsApi.getDeals(),
  });

  if (isLoading) return <div>Loading...</div>;
  return <div>{/* Render deals */}</div>;
}
```

### Creating a Deal

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

function CreateDeal() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data) => dealsApi.createDeal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });

  const handleSubmit = (data) => {
    mutation.mutate(data);
  };
}
```

## User Flow

1. **Registration/Login**
   - User registers or logs in
   - Token stored in sessionStorage
   - Redirected to dashboard

2. **Dashboard**
   - View all deals
   - See summary metrics
   - Click "Create New Deal"

3. **Create Deal**
   - Fill out form
   - Submit → Backend calculates analytics
   - Redirected to deal detail

4. **View Deal**
   - See all deal information
   - View analytics results
   - Click "Edit" to modify

5. **Edit Deal**
   - Update fields
   - Save → Backend recalculates
   - Return to deal detail

## Security Features

1. **Token Storage**: sessionStorage (clears on tab close)
2. **Auto-logout**: On 401 errors
3. **Protected Routes**: All sensitive pages require auth
4. **Input Validation**: Client and server-side
5. **HTTPS Ready**: Works with HTTPS in production

## Performance Optimizations

1. **React Query Caching**: Reduces API calls
2. **Code Splitting**: Vite handles automatically
3. **Lazy Loading**: Can be added for routes
4. **Optimistic Updates**: React Query supports this

## Testing Strategy (Optional)

### Unit Tests
- Test API client functions
- Test utility functions
- Test form validation

### Component Tests
- Test form submissions
- Test navigation
- Test protected routes

### Integration Tests
- Test full user flows
- Test API integration
- Test error handling

## Deployment

### Build

```bash
npm run build
```

Output: `dist/` directory

### Serve

```bash
npm run preview
```

### Production Deployment

1. Build the app: `npm run build`
2. Serve `dist/` with a static file server (Nginx, Vercel, Netlify, etc.)
3. Configure environment variables
4. Ensure backend CORS allows your domain

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:8000
```

For production:
```env
VITE_API_BASE_URL=https://api.brightsteps.com
```

## Known Limitations (MVP)

1. No property management UI (backend supports it)
2. No advanced filtering/search
3. No data export
4. No charts/visualizations
5. No real-time updates
6. No offline support

These can be added in future iterations.

## Next Steps

1. **Enhanced UI**: Add charts, better visualizations
2. **Property Management**: Full CRUD for properties
3. **Advanced Features**: Filtering, sorting, search
4. **Mobile App**: React Native using same APIs
5. **Real-time**: WebSocket integration
6. **Analytics**: More detailed analytics views

## Support

For issues or questions:
1. Check browser console for errors
2. Verify backend is running
3. Check network tab for API calls
4. Review environment variables

