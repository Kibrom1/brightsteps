# Test Run Instructions

## Issue Encountered

There's a persistent npm installation issue where packages aren't being installed to `node_modules` properly. This is preventing the tests from running automatically.

## Manual Installation Steps

### Option 1: Clean Install (Recommended)

```bash
cd frontend

# Remove existing node_modules and lock files
rm -rf node_modules package-lock.json

# Install all dependencies
npm install

# Install Playwright browsers
npx playwright install chromium

# Run tests
npm run test:e2e
```

### Option 2: Use Global Playwright (If npm install fails)

```bash
# Install Playwright globally
npm install -g @playwright/test

# Install browsers
playwright install chromium

# Run tests using global installation
playwright test --project=chromium
```

### Option 3: Use Yarn (If available)

```bash
# Install yarn if not available
npm install -g yarn

# Install dependencies
yarn install

# Install Playwright browsers
yarn playwright install chromium

# Run tests
yarn test:e2e
```

## Running Tests

### E2E Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test e2e/auth.spec.ts

# Run with UI
npm run test:e2e:ui

# Run in debug mode
npm run test:e2e:debug
```

### Unit/Component Tests (Vitest)

```bash
# Run all unit tests
npm run test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

### All Tests

```bash
npm run test:all
```

## Prerequisites

1. **Backend server must be running:**
   ```bash
   cd ..
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Frontend dev server will start automatically** (configured in `playwright.config.js`)

## Troubleshooting

### Error: Cannot find package '@playwright/test'

**Solution:** The package isn't installed. Try:
```bash
npm install @playwright/test --save-dev
npx playwright install chromium
```

### Error: Cannot find package 'vitest'

**Solution:** Install vitest:
```bash
npm install vitest @vitest/ui --save-dev
```

### Error: Port 5173 already in use

**Solution:** Kill the process using the port:
```bash
lsof -ti:5173 | xargs kill -9
```

### Error: Backend not running

**Solution:** Start the backend:
```bash
cd ..
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Test Files Created

All test files are ready and located in:
- `e2e/` - E2E tests (6 test suites)
- `src/components/__tests__/` - Component tests
- `src/lib/__tests__/` - Utility tests
- `src/pages/__tests__/` - Page tests

## Next Steps

1. Install dependencies manually using one of the options above
2. Ensure backend is running
3. Run tests: `npm run test:e2e`
4. Review test results

## Test Coverage

- ✅ Authentication flow
- ✅ Dashboard functionality
- ✅ Deal management
- ✅ Profile management
- ✅ Charts and visualizations
- ✅ Notifications
- ✅ API integration
- ✅ UI components

All test infrastructure is ready - just need to resolve the npm installation issue.

