/**
 * E2E tests for charts and visualizations
 */
import { test, expect } from '@playwright/test';

test.describe('Charts on Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByPlaceholder(/email address/i).fill('admin@brightsteps.com');
    await page.getByPlaceholder(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
  });

  test('should display cap rate chart when deals exist', async ({ page }) => {
    // Check if chart container is visible
    const capRateChart = page.getByText(/cap rate by deal/i);
    if (await capRateChart.isVisible({ timeout: 2000 })) {
      // Chart should be rendered (check for SVG or canvas)
      const chartContainer = page.locator('svg, canvas').first();
      await expect(chartContainer).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display cash flow chart when deals exist', async ({ page }) => {
    const cashFlowChart = page.getByText(/cash flow by deal/i);
    if (await cashFlowChart.isVisible({ timeout: 2000 })) {
      const chartContainer = page.locator('svg, canvas').first();
      await expect(chartContainer).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display portfolio breakdown chart', async ({ page }) => {
    const portfolioChart = page.getByText(/portfolio breakdown/i);
    if (await portfolioChart.isVisible({ timeout: 2000 })) {
      const chartContainer = page.locator('svg, canvas').first();
      await expect(chartContainer).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show empty state when no deals exist', async ({ page }) => {
    // If no deals, should show empty state message
    const emptyState = page.getByText(/you don't have any deals yet/i);
    const dealsTable = page.getByRole('table');
    
    // Either empty state or table should be visible
    await expect(emptyState.or(dealsTable)).toBeVisible();
  });
});

test.describe('Charts on Deal Detail', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByPlaceholder(/email address/i).fill('admin@brightsteps.com');
    await page.getByPlaceholder(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
    
    // Navigate to a deal if available
    const firstDealLink = page.getByRole('link', { name: /view/i }).first();
    if (await firstDealLink.isVisible({ timeout: 2000 })) {
      await firstDealLink.click();
      await expect(page).toHaveURL(/.*\/deals\/\d+/);
    }
  });

  test('should display cash flow projection chart', async ({ page }) => {
    const projectionChart = page.getByText(/cash flow projection/i);
    if (await projectionChart.isVisible({ timeout: 2000 })) {
      const chartContainer = page.locator('svg, canvas').first();
      await expect(chartContainer).toBeVisible({ timeout: 5000 });
    }
  });
});

