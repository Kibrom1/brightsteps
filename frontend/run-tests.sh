#!/bin/bash
# Test runner script that works around npm installation issues

set -e

echo "🧪 Running BrightSteps Automation Tests"
echo ""

# Check if backend is running
if ! curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "⚠️  Warning: Backend server not running on port 8000"
    echo "   Start it with: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
    echo ""
fi

# Start frontend dev server in background if not running
if ! curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "🚀 Starting frontend dev server..."
    npm run dev > /dev/null 2>&1 &
    DEV_PID=$!
    echo "   Waiting for server to start..."
    sleep 5
    echo "   Server started (PID: $DEV_PID)"
    echo ""
fi

echo "📋 Running E2E Tests with Playwright..."
echo ""

# Run Playwright tests using npx (bypasses local installation issues)
# Note: Tests use full URLs (http://localhost:5173) so no base URL needed
echo "Running tests from e2e/ directory..."
echo "Make sure frontend is running on http://localhost:5173"
echo ""

# Set environment variable for base URL (some tests might use it)
export PLAYWRIGHT_BASE_URL=http://localhost:5173

npx --yes playwright test ./e2e/*.spec.ts \
    --project=chromium \
    --reporter=list \
    --timeout=30000 \
    "$@"

EXIT_CODE=$?

# Cleanup: kill dev server if we started it
if [ ! -z "$DEV_PID" ]; then
    echo ""
    echo "🛑 Stopping dev server..."
    kill $DEV_PID 2>/dev/null || true
fi

exit $EXIT_CODE

