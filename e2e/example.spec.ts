import { test, expect } from "@playwright/test";

// Load environment variables for test user credentials
const E2E_EMAIL = process.env.E2E_EMAIL || "test@test.pl";
const E2E_PASSWORD = process.env.E2E_PASSWORD || "Test123!";

test("has correct starter template title", async ({ page }) => {
  await page.goto("/");

  // The app uses the starter template title
  await expect(page).toHaveTitle(/Next\.js and Supabase Starter Kit/);
});

test("displays starter template content", async ({ page }) => {
  await page.goto("/");

  // Check that the starter template content is displayed using specific text match
  await expect(page.getByText(/The fastest way to build apps/)).toBeVisible();

  // Check for specific link elements to avoid multiple matches
  await expect(
    page.getByRole("link", { name: "Supabase", exact: true }).first()
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Next.js", exact: true }).first()
  ).toBeVisible();
});

test("can navigate to sign-in page directly", async ({ page }) => {
  // Navigate directly to sign-in page since there's no link on home page
  await page.goto("/sign-in");

  // Verify sign-in form elements are present
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Hasło")).toBeVisible();
  await expect(page.getByRole("button", { name: /zaloguj/i })).toBeVisible();
});

test("can sign in with valid credentials", async ({ page }) => {
  await page.goto("/sign-in");

  // Fill in the login form with real test credentials
  await page.getByLabel("Email").fill(E2E_EMAIL);
  await page.getByLabel("Hasło").fill(E2E_PASSWORD);

  // Click the submit button
  await page.getByRole("button", { name: /zaloguj/i }).click();

  // Expect to be redirected to protected area
  await expect(page).toHaveURL(/\/protected/);

  // Verify user is logged in by checking for logout button
  await expect(page.getByRole("button", { name: /wyloguj/i })).toBeVisible();
});

test("can navigate to sets page when logged in", async ({ page }) => {
  // First log in
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(E2E_EMAIL);
  await page.getByLabel("Hasło").fill(E2E_PASSWORD);
  await page.getByRole("button", { name: /zaloguj/i }).click();

  // Wait for redirect to protected area
  await expect(page).toHaveURL(/\/protected/);

  // Click on "Zestawy fiszek" button in the dashboard
  await page.getByRole("link", { name: /zestawy fiszek/i }).click();

  // Verify we're on the sets page
  await expect(page).toHaveURL(/\/protected\/sets/);

  // Verify we can see the create button (indicating we're on the sets page)
  await expect(
    page.getByRole("button", { name: /utwórz nowy zestaw|utwórz|nowy zestaw/i })
  ).toBeVisible();
});

test("redirects to sign-in when accessing protected page without login", async ({
  page,
}) => {
  // Try to access protected page directly
  await page.goto("/protected/sets");

  // Should be redirected to sign-in page
  await expect(page).toHaveURL(/.*sign-in/);

  // Verify we see the sign-in form
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Hasło")).toBeVisible();
});

test("protected dashboard displays expected content", async ({ page }) => {
  // First log in
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(E2E_EMAIL);
  await page.getByLabel("Hasło").fill(E2E_PASSWORD);
  await page.getByRole("button", { name: /zaloguj/i }).click();

  // Wait for redirect to protected area
  await expect(page).toHaveURL(/\/protected/);

  // Verify dashboard content
  await expect(page.getByText(/Protected Dashboard/)).toBeVisible();
  await expect(page.getByText(/Fiszki do powtórki dzisiaj/)).toBeVisible();
  await expect(page.getByText(/Łączna liczba fiszek/)).toBeVisible();

  // Verify action buttons are present with correct text
  await expect(
    page.getByRole("button", { name: /start new session/i })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /generuj fiszki ai/i })
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /zestawy fiszek/i })
  ).toBeVisible();
});
