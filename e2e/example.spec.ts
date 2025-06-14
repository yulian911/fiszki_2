import { test, expect } from "@playwright/test";

// Load environment variables for test user credentials
const E2E_EMAIL = process.env.E2E_EMAIL || "test@test.pl";
const E2E_PASSWORD = process.env.E2E_PASSWORD || "Test123!";

test.describe("App Navigation and Authentication", () => {
  test("SCN_GEN_001: should display landing page content correctly", async ({
    page,
  }) => {
    await page.goto("/");

    // Verify landing page title and subtitle
    await expect(page.getByTestId("landing-title")).toHaveText(
      "Inteligentne Fiszki"
    );
    await expect(page.getByTestId("landing-subtitle")).toBeVisible();

    // Verify features section is present
    await expect(page.getByTestId("features-title")).toHaveText(
      "Odkryj kluczowe funkcje"
    );

    // Check for a few feature cards to ensure they are rendered
    await expect(
      page.getByTestId("feature-card-Generowanie-fiszek-z-AI")
    ).toBeVisible();
    await expect(
      page.getByTestId("feature-card-Inteligentne-powtórki-(SRS)")
    ).toBeVisible();
  });

  test("SCN_GEN_002: should allow user to sign in and redirect to dashboard", async ({
    page,
  }) => {
    await page.goto("/sign-in");

    // Start waiting for navigation before clicking the button
    const navigationPromise = page.waitForURL("**/protected", {
      timeout: 15000,
    });

    // Fill in the login form and click
    await page.getByTestId("email-input").fill(E2E_EMAIL);
    await page.getByTestId("password-input").fill(E2E_PASSWORD);
    await page.getByTestId("login-button").click();

    // Wait for the navigation to complete
    await navigationPromise;

    // Verify we are on the dashboard
    await expect(
      page.getByRole("heading", { name: "Panel główny" })
    ).toBeVisible({ timeout: 10000 });

    console.log("Login test SCN_GEN_002 completed successfully!");
  });

  test("SCN_GEN_003: should redirect unauthenticated user to sign-in page", async ({
    page,
  }) => {
    // Try to access a protected page directly
    await page.goto("/protected/sets");

    // Should be redirected to the sign-in page
    await expect(page).toHaveURL(/.*sign-in/);
    await expect(page.getByLabel("Email")).toBeVisible();
  });

  test("SCN_GEN_004: can navigate to sets page when logged in", async ({
    page,
  }) => {
    // First, log in using the reliable method
    await page.goto("/sign-in");
    await page.getByTestId("email-input").fill(E2E_EMAIL);
    await page.getByTestId("password-input").fill(E2E_PASSWORD);
    await page.getByTestId("login-button").click();

    // Wait for login to complete by waiting for the dashboard to be ready
    await page.waitForURL(/\/protected/, { timeout: 15000 });
    await expect(page.getByTestId("sets-link")).toBeVisible({ timeout: 15000 });

    // Navigate to the sets page
    await page.getByTestId("sets-link").click();
    await page.waitForURL(/\/protected\/sets/, { timeout: 15000 });

    // Verify we are on the sets page
    await expect(page.getByTestId("create-set-button")).toBeVisible({
      timeout: 15000,
    });
  });
});
