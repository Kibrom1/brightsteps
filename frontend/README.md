# BrightSteps Frontend - Phase 3 MVP

React + TypeScript web application for the BrightSteps real estate investment platform.

## Tech Stack

- **React 18** with **TypeScript**
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **React Query (@tanstack/react-query)** - Server state management
- **Tailwind CSS** - Utility-first CSS framework
- **Fetch API** - HTTP client (built-in, no extra dependencies)

## Why These Choices?

- **Vite over CRA**: Faster dev server, better HMR, modern tooling
- **React Query**: Excellent for server state, caching, and optimistic updates
- **Tailwind CSS**: Rapid UI development, consistent design system, small bundle size
- **SessionStorage for tokens**: More secure than localStorage (clears on tab close), reduces XSS attack window. For production, consider httpOnly cookies.

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Layout.tsx      # Main layout with navigation
│   │   └── ProtectedRoute.tsx
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx # Authentication state
│   ├── lib/                # Utilities and API clients
│   │   ├── api-client.ts   # Base API client
│   │   └── api/            # API modules
│   │       ├── auth.ts
│   │       ├── deals.ts
│   │       ├── users.ts
│   │       └── properties.ts
│   ├── pages/              # Page components
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── DealCreatePage.tsx
│   │   ├── DealDetailPage.tsx
│   │   ├── DealEditPage.tsx
│   │   ├── ProfilePage.tsx
│   │   └── NotFoundPage.tsx
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   ├── App.tsx             # Main app with routing
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── .env.example
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update if needed:

```bash
cp .env.example .env
```

Default API URL: `http://localhost:8000` (configured in vite.config.ts proxy)

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

Output will be in `dist/` directory.

## Features

### Authentication
- User registration and login
- JWT token management (stored in sessionStorage)
- Protected routes
- Auto-redirect on 401 errors

### Dashboard
- List of user's deals
- Summary metrics:
  - Total deals count
  - Average cap rate
  - Average monthly cash flow
- Quick navigation to deal details

### Deal Management
- **Create Deal**: Form with all deal inputs
- **View Deal**: Detailed view with analytics snapshot
- **Edit Deal**: Update deal and recalculate analytics
- **Recalculate**: Re-run analytics with latest assumptions

### Analytics Display
- Monthly and annual cash flow
- Cash-on-cash return
- DSCR (Debt Service Coverage Ratio)
- Deal analysis score and label
- Assumptions used

## API Integration

The app uses a centralized API client that:
- Automatically attaches JWT tokens to requests
- Handles 401 errors (redirects to login)
- Normalizes backend responses
- Provides type-safe API methods

### Example API Usage

```typescript
import { dealsApi } from '../lib/api/deals';
import { useQuery } from '@tanstack/react-query';

function MyComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ['deals'],
    queryFn: () => dealsApi.getDeals(),
  });

  // ...
}
```

## Routing

- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - Dashboard (protected)
- `/deals/new` - Create deal (protected)
- `/deals/:id` - Deal detail (protected)
- `/deals/:id/edit` - Edit deal (protected)
- `/profile` - User profile (protected)
- `/*` - 404 page

## Styling

The app uses Tailwind CSS with a custom color palette:
- Primary colors: Blue scale (primary-50 to primary-900)
- Consistent spacing and typography
- Responsive design (mobile-first)

## TypeScript Types

All types match the backend models:
- `User`, `Deal`, `Property`
- `AnalyticsSnapshot`, `CashFlowSnapshot`, `DSCRSnapshot`
- `ApiResponse<T>` for API responses

## Security Considerations

1. **Token Storage**: Uses `sessionStorage` instead of `localStorage` for better security
2. **Auto-logout**: Clears token on 401 errors
3. **Protected Routes**: All sensitive routes require authentication
4. **Input Validation**: Form validation on client side (backend also validates)

## Future Enhancements

- Property management UI
- Advanced filtering and search
- Export functionality
- Charts and visualizations
- Real-time updates
- Offline support
- Mobile app (React Native)

## Testing

To add tests (optional):

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
```

Example test structure:
```typescript
import { render, screen } from '@testing-library/react';
import { LoginPage } from './pages/LoginPage';

test('renders login form', () => {
  render(<LoginPage />);
  expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
});
```

## Troubleshooting

### CORS Issues
If you see CORS errors, ensure the backend has CORS configured to allow requests from `http://localhost:3000`.

### API Connection
Check that the backend is running on `http://localhost:8000` or update `VITE_API_BASE_URL` in `.env`.

### Build Errors
Run `npm run build` to check for TypeScript errors. Fix any type issues before deploying.

