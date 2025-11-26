/**
 * E2E tests for profile page
 */
import { test, expect } from '@playwright/test';

test.describe('Profile Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByPlaceholder(/email address/i).fill('admin@brightsteps.com');
    await page.getByPlaceholder(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
    
    // Navigate to profile
    await page.getByRole('link', { name: /profile/i }).click();
    await expect(page).toHaveURL(/.*\/profile/);
  });

  test('should display user profile information', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /profile/i })).toBeVisible();
    await expect(page.getByText(/email/i)).toBeVisible();
    await expect(page.getByText(/full name/i)).toBeVisible();
    await expect(page.getByText(/role/i)).toBeVisible();
    await expect(page.getByText(/account created/i)).toBeVisible();
  });

  test('should allow editing profile', async ({ page }) => {
    const editButton = page.getByRole('button', { name: /edit profile/i });
    if (await editButton.isVisible()) {
      await editButton.click();
      
      // Check if form fields become editable
      const nameInput = page.getByLabel(/full name/i);
      await expect(nameInput).toBeVisible();
      
      // Update name
      await nameInput.clear();
      await nameInput.fill('Updated Name');
      
      // Save changes
      await page.getByRole('button', { name: /save changes/i }).click();
      
      // Should show success message or updated name
      await expect(page.getByText(/updated name/i).or(page.getByText(/success/i))).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display preferences', async ({ page }) => {
    // Check for preferences section
    const preferencesSection = page.getByText(/preferences/i);
    if (await preferencesSection.isVisible()) {
      await expect(page.getByText(/email notifications/i)).toBeVisible();
      await expect(page.getByText(/weekly summary/i)).toBeVisible();
    }
  });

  test('should update preferences', async ({ page }) => {
    const editButton = page.getByRole('button', { name: /edit profile/i });
    if (await editButton.isVisible()) {
      await editButton.click();
      
      // Toggle preferences
      const emailNotificationCheckbox = page.getByLabel(/enable email notifications/i);
      if (await emailNotificationCheckbox.isVisible()) {
        await emailNotificationCheckbox.click();
        await page.getByRole('button', { name: /save changes/i }).click();
        await expect(page.getByText(/success/i)).toBeVisible({ timeout: 5000 });
      }
    }
  });
});

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByPlaceholder(/email address/i).fill('admin@brightsteps.com');
    await page.getByPlaceholder(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
  });

  test('should navigate between pages', async ({ page }) => {
    // Test navigation links
    await page.getByRole('link', { name: /dashboard/i }).click();
    await expect(page).toHaveURL(/.*\/dashboard/);
    
    await page.getByRole('link', { name: /profile/i }).click();
    await expect(page).toHaveURL(/.*\/profile/);
    
    await page.getByRole('link', { name: /brightsteps/i }).click();
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('should logout successfully', async ({ page }) => {
    await page.getByRole('button', { name: /logout/i }).click();
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.getByRole('heading', { name: /sign in to brightsteps/i })).toBeVisible();
  });
});

