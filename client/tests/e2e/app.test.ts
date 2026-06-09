import { test, expect } from '@playwright/test';

test.describe('DevFlow App', () => {
  test('shows login page', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  });

  test('can register and login', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[placeholder="Username"]', 'e2etest');
    await page.fill('input[placeholder="Email"]', 'e2e@test.com');
    await page.fill('input[placeholder="Password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page.getByText('My Boards')).toBeVisible({ timeout: 5000 });
  });

  test('can create and view board', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[placeholder="Username"]', 'boardtest');
    await page.fill('input[placeholder="Email"]', 'board@test.com');
    await page.fill('input[placeholder="Password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    await page.fill('input[placeholder="New board title..."]', 'E2E Board');
    await page.click('button:has-text("Create")');
    await expect(page.getByText('E2E Board')).toBeVisible({ timeout: 5000 });
  });
});
