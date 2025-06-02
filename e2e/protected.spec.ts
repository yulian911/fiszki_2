import { test, expect, Page } from '@playwright/test';

// Load environment variables for test user credentials
const E2E_EMAIL = process.env.E2E_USERNAME || 'test@example.com';
const E2E_PASSWORD = process.env.E2E_PASSWORD || 'testpassword';

// Helper function to log in before tests
async function login(page: Page) {
  await page.goto('/sign-in');
  await page.getByLabel('Email').fill(E2E_EMAIL);
  await page.getByLabel('Hasło').fill(E2E_PASSWORD);
  await page.getByRole('button', { name: /Zaloguj/i }).click();
  
  // Wait for protected page to load
  await expect(page).toHaveURL(/\/protected/);
}

test.describe('Protected Area Functionality', () => {
  // Run login before each test
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  // SCN_PROT_001: Create new flashcard set
  test('SCN_PROT_001: should create a new flashcard set', async ({ page }) => {
    await page.goto('/protected/sets');
    
    // Generate unique set name to avoid conflicts
    const setName = `Test Set ${Date.now()}`;
    
    // Click on create new set button
    await page.getByRole('button', { name: /new set|create set/i }).click();
    
    // Fill in the form
    await page.getByLabel(/name|title/i).fill(setName);
    await page.getByLabel(/description/i).fill('Test description for E2E testing');
    await page.getByRole('button', { name: /create|save|add/i }).click();
    
    // Verify set was created and appears in the list
    await expect(page.getByText(setName)).toBeVisible();
  });

  // SCN_PROT_002: Edit existing flashcard set
  test('SCN_PROT_002: should edit an existing flashcard set', async ({ page }) => {
    await page.goto('/protected/sets');
    
    // First, create a set if needed
    const setName = `Edit Test Set ${Date.now()}`;
    await page.getByRole('button', { name: /new set|create set/i }).click();
    await page.getByLabel(/name|title/i).fill(setName);
    await page.getByLabel(/description/i).fill('Original description');
    await page.getByRole('button', { name: /create|save|add/i }).click();
    
    // Find and click the edit button for the newly created set
    await page.getByText(setName).click();
    await page.getByRole('button', { name: /edit/i }).click();
    
    // Update the set details
    const updatedName = `${setName} (Updated)`;
    await page.getByLabel(/name|title/i).fill(updatedName);
    await page.getByLabel(/description/i).fill('Updated description');
    await page.getByRole('button', { name: /save|update/i }).click();
    
    // Verify the changes are reflected
    await expect(page.getByText(updatedName)).toBeVisible();
  });

  // SCN_PROT_003: Delete flashcard set
  test('SCN_PROT_003: should delete a flashcard set', async ({ page }) => {
    await page.goto('/protected/sets');
    
    // First, create a set for deletion
    const setName = `Delete Test Set ${Date.now()}`;
    await page.getByRole('button', { name: /new set|create set/i }).click();
    await page.getByLabel(/name|title/i).fill(setName);
    await page.getByLabel(/description/i).fill('To be deleted');
    await page.getByRole('button', { name: /create|save|add/i }).click();
    
    // Verify set was created
    await expect(page.getByText(setName)).toBeVisible();
    
    // Delete the set
    await page.getByText(setName).click();
    await page.getByRole('button', { name: /delete/i }).click();
    
    // Confirm deletion if there's a confirmation dialog
    const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i });
    if (await confirmButton.isVisible())
      await confirmButton.click();
    
    // Verify the set is no longer visible
    await expect(page.getByText(setName)).not.toBeVisible();
  });

  // SCN_PROT_004: Password reset flow
  test('SCN_PROT_004: should complete the password reset flow', async ({ page }) => {
    // Logout first
    await page.getByRole('button', { name: /wyloguj/i }).click();
    
    // Go to forgot password page
    await page.goto('/forgot-password');
    
    // Enter email
    await page.getByLabel('Email').fill(E2E_EMAIL);
    await page.getByRole('button', { name: /zresetuj|wyślij/i }).click();
    
    // Verify confirmation message
    await expect(page.getByText(/email wysłany|sprawdź swoją pocztę/i)).toBeVisible();
    
    // Note: We can't actually test the email link click in E2E tests
    // but we can test the reset password page directly
    
    // Go to reset password page
    // In a real scenario, this would happen after clicking the link in the email
    // Here we're simulating it by directly navigating to the page
    await page.goto('/protected/reset-password');
    
    // Fill in new password
    const newPassword = 'NewTest@1234';
    await page.getByLabel(/nowe hasło/i).fill(newPassword);
    await page.getByLabel(/potwierdź hasło|powtórz hasło/i).fill(newPassword);
    await page.getByRole('button', { name: /zresetuj|zmień|aktualizuj/i }).click();
    
    // Verify success message
    await expect(page.getByText(/hasło zaktualizowane|reset hasła zakończony powodzeniem/i)).toBeVisible();
    
    // Verify can login with new password
    await page.goto('/sign-in');
    await page.getByLabel('Email').fill(E2E_EMAIL);
    await page.getByLabel('Hasło').fill(newPassword);
    await page.getByRole('button', { name: /zaloguj/i }).click();
    
    // Verify successful login
    await expect(page).toHaveURL(/\/protected/);
    
    // Reset password back to original for other tests
    // This assumes there's a way to change password while logged in
    await page.goto('/protected/reset-password');
    await page.getByLabel(/nowe hasło/i).fill(E2E_PASSWORD);
    await page.getByLabel(/potwierdź hasło|powtórz hasło/i).fill(E2E_PASSWORD);
    await page.getByRole('button', { name: /zresetuj|zmień|aktualizuj/i }).click();
  });
}); 