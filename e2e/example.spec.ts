import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  
  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Fiszki/);
});

test('navigates to flashcards sets page', async ({ page }) => {
  await page.goto('/');
  
  // Find a link with a text and click on it.
  await page.getByRole('link', { name: /zestawy/i }).click();
  
  // Expect the URL to contain 'sets'
  await expect(page).toHaveURL(/.*sets/);
});

test('can sign in', async ({ page }) => {
  await page.goto('/');
  
  // Find and click the sign in button
  await page.getByRole('button', { name: /zaloguj/i }).click();
  
  // Fill in the login form
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Hasło').fill('password123');
  
  // Click the submit button
  await page.getByRole('button', { name: /zaloguj/i }).click();
  
  // Expect to see user dashboard or profile
  await expect(page.getByText(/witaj/i)).toBeVisible();
}); 