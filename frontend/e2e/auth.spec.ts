/**
 * E2E tests for authentication flow
 */
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /sign in to brightsteps/i })).toBeVisible();
    await expect(page.getByPlaceholder(/email address/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.getByPlaceholder(/email address/i).fill('wrong@example.com');
    await page.getByPlaceholder(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should show error message
    await expect(page.getByText(/incorrect email or password/i)).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to register page', async ({ page }) => {
    await page.getByRole('link', { name: /create a new account/i }).click();
    await expect(page).toHaveURL(/.*\/register/);
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();
  });

  test('should validate required fields on login', async ({ page }) => {
    // Try to submit without filling fields
    await page.getByRole('button', { name: /sign in/i }).click();

    // HTML5 validation should prevent submission
    const emailInput = page.getByPlaceholder(/email address/i);
    const passwordInput = page.getByPlaceholder(/password/i);

    await expect(emailInput).toBeFocused();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // Note: This test requires a valid user in the database
    // You may need to seed test data or use test credentials
    await page.getByPlaceholder(/email address/i).fill('admin@brightsteps.com');
    await page.getByPlaceholder(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should redirect to dashboard on success
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });
});

test.describe('Registration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('should display registration form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();
    await expect(page.getByPlaceholder(/email address/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
    await expect(page.getByPlaceholder(/full name/i)).toBeVisible();
  });

  test('should validate password length', async ({ page }) => {
    await page.getByPlaceholder(/email address/i).fill('newuser@example.com');
    await page.getByPlaceholder(/password/i).fill('short'); // Less than 8 characters
    await page.getByPlaceholder(/full name/i).fill('New User');

    // HTML5 validation should prevent submission
    const passwordInput = page.getByPlaceholder(/password/i);
    await expect(passwordInput).toHaveAttribute('minlength', '8');
  });

  test('should show error for duplicate email', async ({ page }) => {
    // Try to register with existing email
    await page.getByPlaceholder(/email address/i).fill('admin@brightsteps.com');
    await page.getByPlaceholder(/password/i).fill('password123');
    await page.getByPlaceholder(/full name/i).fill('Test User');
    await page.getByRole('button', { name: /create account/i }).click();

    // Should show error message
    await expect(page.getByText(/email already registered/i)).toBeVisible({ timeout: 5000 });
  });
});

