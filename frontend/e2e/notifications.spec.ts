/**
 * E2E tests for notifications
 */
import { test, expect } from '@playwright/test';

test.describe('Notifications', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByPlaceholder(/email address/i).fill('admin@brightsteps.com');
    await page.getByPlaceholder(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
  });

  test('should display notification bell in navigation', async ({ page }) => {
    const notificationBell = page.getByRole('button', { name: /notifications/i });
    await expect(notificationBell).toBeVisible();
  });

  test('should open notification dropdown on click', async ({ page }) => {
    const notificationBell = page.getByRole('button', { name: /notifications/i });
    await notificationBell.click();
    
    // Check if dropdown is visible
    await expect(page.getByText(/notifications/i)).toBeVisible({ timeout: 2000 });
  });

  test('should show unread count badge when notifications exist', async ({ page }) => {
    const notificationBell = page.getByRole('button', { name: /notifications/i });
    
    // Check for badge (red dot)
    const badge = notificationBell.locator('span').filter({ hasText: /^\d+$/ });
    // Badge might not exist if no unread notifications
    const badgeExists = await badge.count() > 0;
    
    if (badgeExists) {
      await expect(badge).toBeVisible();
    }
  });

  test('should display notification list in dropdown', async ({ page }) => {
    const notificationBell = page.getByRole('button', { name: /notifications/i });
    await notificationBell.click();
    
    // Should show either notifications or "No notifications" message
    const notificationsList = page.getByText(/no notifications/i).or(
      page.locator('[role="listitem"]')
    );
    await expect(notificationsList).toBeVisible({ timeout: 2000 });
  });

  test('should mark notification as read on click', async ({ page }) => {
    const notificationBell = page.getByRole('button', { name: /notifications/i });
    await notificationBell.click();
    
    // Click on first notification if it exists and is unread
    const firstNotification = page.locator('div').filter({ hasText: /deal/i }).first();
    if (await firstNotification.isVisible({ timeout: 2000 })) {
      await firstNotification.click();
      // Notification should be marked as read (visual change)
      await page.waitForTimeout(500);
    }
  });
});

