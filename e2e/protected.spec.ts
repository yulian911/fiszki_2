import { test, expect, Page } from "@playwright/test";

// Load environment variables for test user credentials
const E2E_EMAIL = process.env.E2E_EMAIL || "test@example.com";
const E2E_PASSWORD = process.env.E2E_PASSWORD || "testpassword";

// Helper function to log in before tests
async function login(page: Page) {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(E2E_EMAIL);
  await page.getByLabel("Hasło").fill(E2E_PASSWORD);
  await page.getByRole("button", { name: /Zaloguj/i }).click();

  // Wait for protected page to load
  await expect(page).toHaveURL(/\/protected/);
}

test.describe("Protected Area Functionality", () => {
  // Run login before each test
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  // SCN_PROT_001: Create new flashcard set
  test("SCN_PROT_001: should create a new flashcard set", async ({ page }) => {
    await page.goto("/protected/sets");

    // Generate unique set name to avoid conflicts
    const setName = `Test Set ${Date.now()}`;

    // Click on create new set button
    await page
      .getByRole("button", { name: /utwórz nowy zestaw|utwórz|nowy zestaw/i })
      .click();

    // Wait for modal to open and use more specific selectors
    await page.waitForSelector('[role="dialog"], [role="complementary"]');

    // Fill in the form using modal context + label selectors
    const modal = page
      .locator('[role="dialog"], [role="complementary"]')
      .filter({ hasText: "Utwórz nowy zestaw fiszek" });
    await modal.getByLabel("Nazwa zestawu").first().fill(setName);
    await modal
      .getByLabel("Opis (opcjonalnie)")
      .first()
      .fill("Test description for E2E testing");
    await page.getByRole("button", { name: /Utwórz|Tworzenie/ }).click();

    // Wait for modal to close and list to refresh
    await page.waitForTimeout(1000);

    // Verify set was created and appears in the list
    await expect(page.locator(`text="${setName}"`)).toHaveCount(2);

    // Find and click edit button for our specific set - use row context
    // Since filtering doesn't work well, find the row with exact text match for table cells
    const tableRow = page
      .locator("tr")
      .filter({ has: page.locator(`button[title="${setName}"]`) });
    await tableRow.getByRole("button", { name: "Edytuj" }).click();

    // Wait for edit modal and update the set details
    await page.waitForSelector('[role="dialog"], [role="complementary"]');
    const editModal = page
      .locator('[role="dialog"], [role="complementary"]')
      .filter({ hasText: "Edytuj zestaw fiszek" });
    const updatedName = `${setName} (Updated)`;

    // Clear and fill the name field
    await editModal.getByLabel("Nazwa zestawu").first().clear();
    await editModal.getByLabel("Nazwa zestawu").first().fill(updatedName);

    // Clear and fill the description field
    await editModal.getByLabel("Opis (opcjonalnie)").first().clear();
    await editModal
      .getByLabel("Opis (opcjonalnie)")
      .first()
      .fill("Updated description");

    // Submit the form by clicking save button
    await page.getByRole("button", { name: "Zapisz zmiany" }).click();

    // Wait for update to complete and modal to close
    await page.waitForTimeout(3000);

    // Verify the changes are reflected (skip modal check for now)
    await expect(page.locator(`text="${updatedName}"`)).toHaveCount(2); // Should appear in both mobile and desktop views
  });

  // SCN_PROT_002: Edit existing flashcard set
  test("SCN_PROT_002: should edit an existing flashcard set", async ({
    page,
  }) => {
    await page.goto("/protected/sets");

    // First, create a set if needed
    const setName = `Edit Test Set ${Date.now()}`;
    await page
      .getByRole("button", { name: /utwórz nowy zestaw|utwórz|nowy zestaw/i })
      .click();

    // Wait for modal and fill creation form
    await page.waitForSelector('[role="dialog"], [role="complementary"]');
    const createModal = page
      .locator('[role="dialog"], [role="complementary"]')
      .filter({ hasText: "Utwórz nowy zestaw fiszek" });
    await createModal.getByLabel("Nazwa zestawu").first().fill(setName);
    await createModal
      .getByLabel("Opis (opcjonalnie)")
      .first()
      .fill("Original description");
    await page.getByRole("button", { name: /Utwórz|Tworzenie/ }).click();

    // Wait for creation to complete
    await page.waitForTimeout(1000);

    // Find edit button for our specific set
    const tableRow = page
      .locator("tr")
      .filter({ has: page.locator(`button[title="${setName}"]`) });
    await tableRow.getByRole("button", { name: "Edytuj" }).click();

    // Wait for edit modal and update the set details
    await page.waitForSelector('[role="dialog"], [role="complementary"]');
    const editModal = page
      .locator('[role="dialog"], [role="complementary"]')
      .filter({ hasText: "Edytuj zestaw fiszek" });
    const updatedName = `${setName} (Updated)`;

    // Clear and fill the name field
    await editModal.getByLabel("Nazwa zestawu").first().clear();
    await editModal.getByLabel("Nazwa zestawu").first().fill(updatedName);

    // Clear and fill the description field
    await editModal.getByLabel("Opis (opcjonalnie)").first().clear();
    await editModal
      .getByLabel("Opis (opcjonalnie)")
      .first()
      .fill("Updated description");

    // Submit the form by clicking save button
    await page.getByRole("button", { name: "Zapisz zmiany" }).click();

    // Wait for update to complete and modal to close
    await page.waitForTimeout(3000);

    // Verify the changes are reflected (skip modal check for now)
    await expect(page.locator(`text="${updatedName}"`)).toHaveCount(2); // Should appear in both mobile and desktop views
  });

  // SCN_PROT_003: Delete flashcard set
  test("SCN_PROT_003: should delete a flashcard set", async ({ page }) => {
    await page.goto("/protected/sets");

    // First, create a set for deletion
    const setName = `Delete Test Set ${Date.now()}`;
    await page
      .getByRole("button", { name: /utwórz nowy zestaw|utwórz|nowy zestaw/i })
      .click();

    // Wait for modal and fill creation form
    await page.waitForSelector('[role="dialog"], [role="complementary"]');
    const createModal = page
      .locator('[role="dialog"], [role="complementary"]')
      .filter({ hasText: "Utwórz nowy zestaw fiszek" });
    await createModal.getByLabel("Nazwa zestawu").first().fill(setName);
    await createModal
      .getByLabel("Opis (opcjonalnie)")
      .first()
      .fill("To be deleted");
    await page.getByRole("button", { name: /Utwórz|Tworzenie/ }).click();

    // Wait for creation to complete
    await page.waitForTimeout(1000);

    // Verify set was created
    await expect(page.locator(`text="${setName}"`)).toHaveCount(2); // Should appear in both mobile and desktop views

    // Find delete button for our specific set
    const tableRow = page
      .locator("tr")
      .filter({ has: page.locator(`button[title="${setName}"]`) });
    await tableRow.getByRole("button", { name: "Usuń" }).click();

    // Wait for confirmation dialog and confirm deletion
    await page.waitForSelector('[role="dialog"], [role="complementary"]');
    const deleteModal = page
      .locator('[role="dialog"], [role="complementary"]')
      .filter({ hasText: "Ta operacja jest nieodwracalna" });
    await deleteModal.getByRole("button", { name: "Usuń" }).click();

    // Wait for deletion to complete
    await page.waitForTimeout(3000);

    // Force page refresh to ensure list is updated
    await page.reload();
    await page.waitForTimeout(1000);

    // Verify the set is no longer visible
    await expect(page.locator(`text="${setName}"`)).toHaveCount(0);
  });
});
