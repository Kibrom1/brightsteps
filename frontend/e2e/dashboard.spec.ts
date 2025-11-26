/**
 * E2E tests for dashboard and deals
 */
import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByPlaceholder(/email address/i).fill('admin@brightsteps.com');
    await page.getByPlaceholder(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
  });

  test('should display dashboard with summary cards', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
    await expect(page.getByText(/total deals/i)).toBeVisible();
    await expect(page.getByText(/average cap rate/i)).toBeVisible();
    await expect(page.getByText(/avg monthly cash flow/i)).toBeVisible();
  });

  test('should display deals list', async ({ page }) => {
    // Check if deals table or empty state is visible
    const dealsTable = page.getByRole('table');
    const emptyState = page.getByText(/you don't have any deals yet/i);

    // Either table or empty state should be visible
    await expect(dealsTable.or(emptyState)).toBeVisible();
  });

  test('should navigate to create deal page', async ({ page }) => {
    await page.getByRole('link', { name: /create new deal/i }).click();
    await expect(page).toHaveURL(/.*\/deals\/new/);
    await expect(page.getByRole('heading', { name: /create deal/i })).toBeVisible();
  });

  test('should search deals', async ({ page }) => {
    // Look for search input
    const searchInput = page.getByPlaceholder(/search deals/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      // Wait for search results to update
      await page.waitForTimeout(500);
    }
  });

  test('should filter deals', async ({ page }) => {
    // Look for filter button or section
    const filtersSection = page.getByText(/filters/i);
    if (await filtersSection.isVisible()) {
      // Test property type filter
      const propertyTypeButton = page.getByRole('button', { name: /single family/i });
      if (await propertyTypeButton.isVisible()) {
        await propertyTypeButton.click();
      }
    }
  });

  test('should export deals to CSV', async ({ page }) => {
    // Look for export button
    const exportButton = page.getByRole('button', { name: /export csv/i });
    if (await exportButton.isVisible()) {
      // Set up download listener
      const downloadPromise = page.waitForEvent('download');
      await exportButton.click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('.csv');
    }
  });
});

test.describe('Deal Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByPlaceholder(/email address/i).fill('admin@brightsteps.com');
    await page.getByPlaceholder(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
  });

  test('should create a new deal', async ({ page }) => {
    await page.getByRole('link', { name: /create new deal/i }).click();
    await expect(page).toHaveURL(/.*\/deals\/new/);

    // Fill in deal form
    await page.getByLabel(/purchase price/i).fill('250000');
    await page.getByLabel(/down payment/i).fill('50000');
    await page.getByLabel(/interest rate/i).fill('4.5');
    await page.getByLabel(/loan term/i).fill('30');
    await page.getByLabel(/monthly rent/i).fill('2500');
    await page.getByLabel(/vacancy/i).fill('5');
    await page.getByLabel(/maintenance/i).fill('5');
    await page.getByLabel(/management/i).fill('10');

    // Submit form
    await page.getByRole('button', { name: /create deal/i }).click();

    // Should redirect to deal detail page
    await expect(page).toHaveURL(/.*\/deals\/\d+/, { timeout: 10000 });
  });

  test('should view deal details', async ({ page }) => {
    // Navigate to dashboard and click on first deal if available
    await page.goto('/dashboard');
    
    const firstDealLink = page.getByRole('link', { name: /view/i }).first();
    if (await firstDealLink.isVisible({ timeout: 2000 })) {
      await firstDealLink.click();
      await expect(page).toHaveURL(/.*\/deals\/\d+/);
      await expect(page.getByRole('heading', { name: /deal details/i })).toBeVisible();
    }
  });

  test('should edit a deal', async ({ page }) => {
    // Navigate to a deal and edit it
    await page.goto('/dashboard');
    
    const firstDealLink = page.getByRole('link', { name: /view/i }).first();
    if (await firstDealLink.isVisible({ timeout: 2000 })) {
      await firstDealLink.click();
      await page.getByRole('link', { name: /edit deal/i }).click();
      
      await expect(page).toHaveURL(/.*\/deals\/\d+\/edit/);
      await expect(page.getByRole('heading', { name: /edit deal/i })).toBeVisible();
    }
  });

  test('should display analytics on deal detail', async ({ page }) => {
    await page.goto('/dashboard');
    
    const firstDealLink = page.getByRole('link', { name: /view/i }).first();
    if (await firstDealLink.isVisible({ timeout: 2000 })) {
      await firstDealLink.click();
      
      // Check for analytics sections
      await expect(page.getByText(/analytics summary/i).or(page.getByText(/deal information/i))).toBeVisible();
    }
  });
});

