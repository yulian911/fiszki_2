import { test, expect } from "@playwright/test";

// Load environment variables for test user credentials
const E2E_EMAIL = process.env.E2E_EMAIL || "test@test.pl";
const E2E_PASSWORD = process.env.E2E_PASSWORD || "Test123!";

test.describe("Authentication Flow", () => {
  // SCN_AUTH_001: Successful registration with valid data
  test("SCN_AUTH_001: should register a new user successfully", async ({
    page,
  }) => {
    const uniqueEmail = `test-user-${Date.now()}@example.com`;
    await page.goto("/sign-up");
    await page.getByTestId("email-input").fill(uniqueEmail);
    await page.getByTestId("password-input").fill(E2E_PASSWORD);
    await page.getByTestId("password-confirm-input").fill(E2E_PASSWORD);
    await page.getByTestId("signup-button").click();

    await page.waitForURL("**/protected", { timeout: 15000 });
    await expect(
      page.getByRole("heading", { name: "Panel główny" })
    ).toBeVisible();
  });

  // SCN_AUTH_002: Registration with existing email
  test("SCN_AUTH_002: should show error when registering with existing email", async ({
    page,
  }) => {
    await page.goto("/sign-up");
    await page.getByTestId("email-input").fill(E2E_EMAIL);
    await page.getByTestId("password-input").fill(E2E_PASSWORD);
    await page.getByTestId("password-confirm-input").fill(E2E_PASSWORD);
    await page.getByTestId("signup-button").click();

    await page.waitForURL(/.*sign-up\?error=.+/, { timeout: 10000 });
    const url = page.url();
    // The error message is URL encoded
    expect(url).toContain("error=Email%20ju%C5%BC%20istnieje");
  });

  // SCN_AUTH_003: Registration with mismatched passwords
  test("SCN_AUTH_003: should show form error when passwords do not match", async ({
    page,
  }) => {
    const uniqueEmail = `test-user-${Date.now()}@example.com`;
    await page.goto("/sign-up");
    await page.getByTestId("email-input").fill(uniqueEmail);
    await page.getByTestId("password-input").fill("password123");
    await page.getByTestId("password-confirm-input").fill("password456");
    await page.getByTestId("signup-button").click();

    await page.waitForURL(/.*sign-up\?error=.+/, { timeout: 10000 });
    const url = page.url();
    expect(url).toContain("error=Has%C5%82a%20nie%20pasuj%C4%85");
  });

  // SCN_AUTH_004: Successful login
  test("SCN_AUTH_004: should login successfully with valid credentials", async ({
    page,
  }) => {
    // Navigate to sign-in page
    await page.goto("/sign-in");

    // Start waiting for the navigation to the dashboard page before clicking the button
    const navigationPromise = page.waitForURL("**/protected", {
      timeout: 15000,
    });

    // Fill in credentials and click login
    await page.getByTestId("email-input").fill(E2E_EMAIL);
    await page.getByTestId("password-input").fill(E2E_PASSWORD);
    await page.getByTestId("login-button").click();

    // Wait for the navigation to complete
    await navigationPromise;

    // Verify successful login by checking for dashboard element
    await expect(
      page.getByRole("heading", { name: "Panel główny" })
    ).toBeVisible({ timeout: 10000 });
  });

  // SCN_AUTH_005: Login with invalid credentials
  test("SCN_AUTH_005: should show an error message with invalid credentials", async ({
    page,
  }) => {
    // Navigate to sign-in page
    await page.goto("/sign-in");

    // Fill in invalid credentials
    await page.getByTestId("email-input").fill("invalid@user.com");
    await page.getByTestId("password-input").fill("wrongpassword");

    // Click login
    await page.getByTestId("login-button").click();

    // After a failed server action login, we should be redirected back
    // to the sign-in page with an error in the URL parameters.
    await page.waitForURL(/.*sign-in\?error=.+/, { timeout: 10000 });

    // Verify the URL contains the error parameter
    const url = page.url();
    expect(url).toContain("error=");
    console.log(
      "SCN_AUTH_005: Successfully verified redirect with error param."
    );
  });

  // SCN_AUTH_006: Successful logout
  test("SCN_AUTH_006: should logout successfully", async ({ page }) => {
    // First, log in using the reliable pattern
    await page.goto("/sign-in");
    const loginNavigation = page.waitForURL("**/protected");
    await page.getByTestId("email-input").fill(E2E_EMAIL);
    await page.getByTestId("password-input").fill(E2E_PASSWORD);
    await page.getByTestId("login-button").click();
    await loginNavigation;
    await expect(
      page.getByRole("heading", { name: "Panel główny" })
    ).toBeVisible();

    // Now, perform the logout action
    await page.getByRole("button", { name: "Wyloguj" }).click();

    // Wait for the URL to change to the sign-in page
    await page.waitForURL("**/sign-in", { timeout: 10000 });

    // Verify we are on the sign-in page
    await expect(page).toHaveURL(/.*sign-in/);
    await expect(page.getByText("Login")).toBeVisible();
  });

  // SCN_AUTH_007: Should be on dashboard after login
  test("SCN_AUTH_007: should be on dashboard after login", async ({ page }) => {
    // Start on the sign-in page to ensure a clean state
    await page.goto("/sign-in");

    // Perform login
    await page.getByTestId("email-input").fill(E2E_EMAIL);
    await page.getByTestId("password-input").fill(E2E_PASSWORD);
    await page.getByRole("button", { name: "Zaloguj się" }).click();

    // Verify that we are redirected to the protected dashboard
    await expect(page).toHaveURL(/.*protected/);
    await expect(
      page.getByRole("heading", { name: "Panel główny" })
    ).toBeVisible({
      timeout: 10000,
    });
  });

  // SCN_AUTH_008: Protected page access after login
  test("SCN_AUTH_008: should access protected page after login", async ({
    page,
  }) => {
    // Log in first
    await page.goto("/sign-in");

    const loginNavigation = page.waitForURL("**/protected");
    await page.getByTestId("email-input").fill(E2E_EMAIL);
    await page.getByTestId("password-input").fill(E2E_PASSWORD);
    await page.getByTestId("login-button").click();
    await loginNavigation;

    // Now, navigate to a protected route
    await page.goto("/protected/sets");

    // Verify that the page loads and we are not redirected
    await expect(page).toHaveURL(/.*protected\/sets/);
    await expect(
      page.getByRole("heading", { name: "Zestawy fiszek" })
    ).toBeVisible();
  });

  // SCN_AUTH_009: Protected page access without login
  test("SCN_AUTH_009: should not allow navigating to protected routes when not logged in", async ({
    page,
  }) => {
    await page.goto("/protected");
    // Verify redirect to login page
    await expect(page).toHaveURL(/\/sign-in/);
  });
});
