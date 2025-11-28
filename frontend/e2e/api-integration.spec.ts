/**
 * E2E tests for API integration
 */
import { test, expect } from '@playwright/test';

test.describe('API Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByPlaceholder(/email address/i).fill('admin@brightsteps.com');
    await page.getByPlaceholder(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
  });

  test('should load deals from API', async ({ page }) => {
    // Wait for deals to load
    await page.waitForTimeout(2000);
    
    // Check if deals are displayed or empty state
    const dealsTable = page.getByRole('table');
    const emptyState = page.getByText(/you don't have any deals yet/i);
    
    await expect(dealsTable.or(emptyState)).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Intercept API calls and simulate error
    await page.route('**/api/v1/deals', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ detail: 'Internal server error' }),
      });
    });

    await page.reload();
    
    // Should show error message
    await expect(page.getByText(/error/i)).toBeVisible({ timeout: 5000 });
  });

  test('should create deal via API', async ({ page }) => {
    await page.getByRole('link', { name: /create new deal/i }).click();
    
    // Fill form
    await page.getByLabel(/purchase price/i).fill('300000');
    await page.getByLabel(/down payment/i).fill('60000');
    await page.getByLabel(/interest rate/i).fill('4.5');
    await page.getByLabel(/loan term/i).fill('30');
    await page.getByLabel(/monthly rent/i).fill('3000');
    await page.getByLabel(/vacancy/i).fill('5');
    await page.getByLabel(/maintenance/i).fill('5');
    await page.getByLabel(/management/i).fill('10');

    // Submit
    await page.getByRole('button', { name: /create deal/i }).click();

    // Should redirect to deal detail (API success)
    await expect(page).toHaveURL(/.*\/deals\/\d+/, { timeout: 15000 });
  });

  test('should update deal via API', async ({ page }) => {
    // Navigate to a deal
    const firstDealLink = page.getByRole('link', { name: /view/i }).first();
    if (await firstDealLink.isVisible({ timeout: 2000 })) {
      await firstDealLink.click();
      await page.getByRole('link', { name: /edit deal/i }).click();

      // Update a field
      const rentInput = page.getByLabel(/monthly rent/i);
      await rentInput.clear();
      await rentInput.fill('2200');

      // Save
      await page.getByRole('button', { name: /save changes/i }).click();

      // Should show success or redirect
      await expect(
        page.getByText(/success/i).or(page.getByText(/deal details/i))
      ).toBeVisible({ timeout: 10000 });
    }
  });

  test('should handle token expiration', async ({ page }) => {
    // Simulate expired token by clearing sessionStorage
    await page.evaluate(() => {
      sessionStorage.removeItem('brightsteps_token');
    });

    // Try to navigate to a protected route
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*\/login/, { timeout: 5000 });
  });
});

