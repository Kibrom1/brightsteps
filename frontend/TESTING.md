# Testing Guide

This project uses two testing frameworks:

1. **Vitest + React Testing Library** - For unit and component tests
2. **Playwright** - For end-to-end (E2E) tests

## Running Tests

### Unit/Component Tests

```bash
# Run all tests in watch mode
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run tests once (for CI)
npm run test -- --run
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug

# Run tests in specific browser
npx playwright test --project=chromium
```

### Run All Tests

```bash
npm run test:all
```

## Test Structure

### Unit/Component Tests

Located in `src/components/__tests__/` and `src/pages/__tests__/`:

- `DealSearchBar.test.tsx` - Tests for search bar component
- `EmptyState.test.tsx` - Tests for empty state component
- `LoginPage.test.tsx` - Tests for login page

### E2E Tests

Located in `e2e/`:

- `auth.spec.ts` - Authentication flow tests
- `dashboard.spec.ts` - Dashboard and deals management tests
- `profile.spec.ts` - Profile page tests

## Writing Tests

### Component Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('should navigate to dashboard', async ({ page }) => {
  await page.goto('/login');
  // ... login steps
  await expect(page).toHaveURL(/.*\/dashboard/);
});
```

## Test Data

Mock data is available in `src/test/mockData.ts`:

- `mockUser` - Sample user object
- `mockProperty` - Sample property object
- `mockDeal` - Sample deal object
- `mockDeals` - Array of sample deals

## CI/CD

Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests

See `.github/workflows/test.yml` for configuration.

## Best Practices

1. **Test user interactions**, not implementation details
2. **Use accessible queries** (getByRole, getByLabelText)
3. **Keep tests isolated** - each test should be independent
4. **Use descriptive test names** - "should do X when Y"
5. **Mock external dependencies** - API calls, timers, etc.
6. **Test error states** - not just happy paths
7. **Test accessibility** - ensure components are usable

## Debugging Tests

### Vitest

```bash
# Run specific test file
npm run test -- DealSearchBar.test.tsx

# Run tests matching pattern
npm run test -- --grep "should render"
```

### Playwright

```bash
# Run with headed browser
npx playwright test --headed

# Run in debug mode (step through)
npx playwright test --debug

# Generate code from browser actions
npx playwright codegen http://localhost:5173
```

## Coverage

View coverage report:

```bash
npm run test:coverage
open coverage/index.html
```

Aim for:
- **Unit/Component tests**: 80%+ coverage
- **E2E tests**: Cover critical user flows

## Troubleshooting

### Tests fail with "Cannot find module"

Run `npm install` to ensure all dependencies are installed.

### Playwright tests fail with "browser not found"

Run `npx playwright install` to install browser binaries.

### E2E tests timeout

Increase timeout in `playwright.config.ts` or check if dev server is running.

