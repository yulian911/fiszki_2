import { test, expect } from "@playwright/test";

// Load environment variables for test user credentials
const E2E_EMAIL = process.env.E2E_EMAIL || "test@example.com";
const E2E_PASSWORD = process.env.E2E_PASSWORD || "testpassword";

test.describe("Authentication", () => {
  // SCN_AUTH_001: Successful registration with valid data
  test("SCN_AUTH_001: should register a new user successfully", async ({
    page,
  }) => {
    // Generate a unique email to avoid conflicts
    const uniqueEmail = `test${Date.now()}@example.com`;
    const password = "Test@1234";

    await page.goto("/sign-up");
    await page.getByLabel("Email").fill(uniqueEmail);
    await page.getByLabel(/^Hasło/).fill(password);
    await page.getByLabel(/Potwierdź hasło|Powtórz hasło/).fill(password);
    await page.getByRole("button", { name: /Zarejestruj/i }).click();

    // Verify redirect to protected area
    await expect(page).toHaveURL(/\/protected/);
  });

  // SCN_AUTH_002: Registration with existing email
  test("SCN_AUTH_002: should show error when registering with existing email", async ({
    page,
  }) => {
    await page.goto("/sign-up");
    await page.getByLabel("Email").fill(E2E_EMAIL);
    await page.getByLabel(/^Hasło/).fill("Test@1234");
    await page.getByLabel(/Potwierdź hasło|Powtórz hasło/).fill("Test@1234");
    await page.getByRole("button", { name: /Zarejestruj/i }).click();

    // Verify error message
    await expect(
      page.getByText(/email już istnieje|konto już istnieje/i)
    ).toBeVisible();
  });

  // SCN_AUTH_003: Registration with mismatched passwords
  test("SCN_AUTH_003: should show error when passwords do not match", async ({
    page,
  }) => {
    await page.goto("/sign-up");
    await page.getByLabel("Email").fill(`test${Date.now()}@example.com`);
    await page.getByLabel(/^Hasło/).fill("Test@1234");
    await page
      .getByLabel(/Potwierdź hasło|Powtórz hasło/)
      .fill("DifferentPassword");
    await page.getByRole("button", { name: /Zarejestruj/i }).click();

    // Verify error message
    await expect(
      page.getByText(/hasła nie pasują|hasła nie są zgodne/i)
    ).toBeVisible();
  });

  // SCN_AUTH_004: Successful login
  test("SCN_AUTH_004: should login successfully with valid credentials", async ({
    page,
  }) => {
    await page.goto("/sign-in");
    await page.getByLabel("Email").fill(E2E_EMAIL);
    await page.getByLabel("Hasło").fill(E2E_PASSWORD);
    await page.getByRole("button", { name: /Zaloguj/i }).click();

    // Verify redirect to protected area
    await expect(page).toHaveURL(/\/protected/);
  });

  // SCN_AUTH_005: Login with invalid credentials
  test("SCN_AUTH_005: should show error with invalid credentials", async ({
    page,
  }) => {
    await page.goto("/sign-in");
    await page.getByLabel("Email").fill(E2E_EMAIL);
    await page.getByLabel("Hasło").fill("WrongPassword");
    await page.getByRole("button", { name: /Zaloguj/i }).click();

    // Verify error message
    await expect(
      page.getByText(/nieprawidłowy email lub hasło|błędne dane logowania/i)
    ).toBeVisible();
  });

  // SCN_AUTH_006: Successful logout
  test("SCN_AUTH_006: should logout successfully", async ({ page }) => {
    // Login first
    await page.goto("/sign-in");
    await page.getByLabel("Email").fill(E2E_EMAIL);
    await page.getByLabel("Hasło").fill(E2E_PASSWORD);
    await page.getByRole("button", { name: /Zaloguj/i }).click();

    // Wait for protected page to load
    await expect(page).toHaveURL(/\/protected/);

    // Find and click logout button/link
    await page
      .getByRole("button", { name: /wyloguj/i })
      .first()
      .click();

    // Verify redirect to public area (likely the homepage or login page)
    await expect(page).toHaveURL(/^\/$|\/sign-in/);
  });

  // SCN_AUTH_007: Protected page access without login
  test("SCN_AUTH_007: should redirect to login when accessing protected page without login", async ({
    page,
  }) => {
    await page.goto("/protected");

    // Verify redirect to login page
    await expect(page).toHaveURL(/\/sign-in/);
  });

  // SCN_AUTH_008: Protected page access after login
  test("SCN_AUTH_008: should access protected page after login", async ({
    page,
  }) => {
    // Login first
    await page.goto("/sign-in");
    await page.getByLabel("Email").fill(E2E_EMAIL);
    await page.getByLabel("Hasło").fill(E2E_PASSWORD);
    await page.getByRole("button", { name: /Zaloguj/i }).click();

    // Wait for login to complete and redirect to protected page
    await expect(page).toHaveURL(/\/protected/);

    // Now try to access protected page again (to test that session persists)
    await page.goto("/protected");

    // Verify we're still on the protected page (not redirected to login)
    await expect(page).toHaveURL(/\/protected/);
  });
});
