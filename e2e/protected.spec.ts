import { test, expect, type Page, type Response } from "@playwright/test";

const E2E_EMAIL = process.env.E2E_EMAIL || "test@test.pl";
const E2E_PASSWORD = process.env.E2E_PASSWORD || "Test123!";
const E2E_USERNAME = process.env.E2E_USERNAME || "test";

test.describe("Protected Area Functionality", () => {
  // Log in before each test in this describe block
  test.beforeEach(async ({ page }) => {
    await page.goto("/sign-in");

    const navigationPromise = page.waitForURL("**/protected", {
      timeout: 15000,
    });

    await page.getByTestId("email-input").fill(E2E_EMAIL);
    await page.getByTestId("password-input").fill(E2E_PASSWORD);
    await page.getByTestId("login-button").click();

    await navigationPromise;

    // Verify we are on the dashboard
    await expect(
      page.getByRole("heading", { name: "Panel główny" })
    ).toBeVisible();

    // Navigate to the sets page to be ready for the tests
    await page.goto("/protected/sets");
    await expect(
      page.getByRole("heading", { name: "Moje Zestawy Fiszek" })
    ).toBeVisible();

    // Dynamically override react-query's client for test environment
    await page.evaluate(() => {
      const testWindow = window as any;
      if (testWindow.browserQueryClient) {
        console.log("Overriding react-query client for tests...");
        const queryClient = testWindow.browserQueryClient;
        queryClient.setDefaultOptions({
          queries: {
            retry: false,
            staleTime: 0,
            gcTime: 0, // Invalidate cache immediately
          },
          mutations: {
            retry: false,
          },
        });
        console.log("React-query client overridden.");
      } else {
        console.error("Could not find browserQueryClient to override.");
      }
    });
  });

  // Helper function to create a set
  async function createSet(page: Page, setName: string): Promise<string> {
    const responsePromise = page.waitForResponse(
      (response: Response) =>
        response.url().includes("/api/flashcards-sets") &&
        response.status() === 201 &&
        response.request().method() === "POST"
    );

    await page.getByTestId("create-set-button").click();

    const modal = page.getByTestId("create-set-modal");
    await expect(modal).toBeVisible();

    await modal.getByTestId("set-name-input").fill(setName);
    await modal
      .getByTestId("set-description-input")
      .fill(`Description for ${setName}`);
    await modal.getByTestId("save-set-button").click();

    const response = await responsePromise;
    const responseBody = await response.json();
    const setId = responseBody.id;

    await expect(
      page.locator(`[data-testid*="set-row-"]`).filter({ hasText: setName })
    ).toBeVisible({ timeout: 15000 });

    console.log(`Set "${setName}" (ID: ${setId}) successfully created.`);
    return setId;
  }

  test("SCN_PROT_001: should create and edit a flashcard set", async ({
    page,
  }) => {
    const setName = `Test Set ${Date.now()}`;
    const updatedSetName = `Updated Set ${Date.now()}`;

    const setId = await createSet(page, setName);

    const setRow = page.locator(`[data-testid="set-row-${setId}"]`);
    await setRow.getByTestId(`edit-set-desktop-${setId}`).click();

    const editResponsePromise = page.waitForResponse(
      (response: Response) =>
        response.url().includes(`/api/flashcards-sets/${setId}`) &&
        response.status() === 200 &&
        response.request().method() === "PUT"
    );

    const editModal = page.getByTestId("edit-set-modal");
    await expect(editModal).toBeVisible();
    await editModal.getByTestId("set-name-input").clear();
    await editModal.getByTestId("set-name-input").fill(updatedSetName);
    await editModal.getByTestId("save-set-button").click();

    await editResponsePromise;

    const updatedSetRow = page.locator(`[data-testid="set-row-${setId}"]`);
    await expect(updatedSetRow).toContainText(updatedSetName);
    console.log(`Set ID ${setId} successfully updated to "${updatedSetName}"`);
  });

  test("SCN_PROT_002: should delete a flashcard set", async ({ page }) => {
    const setName = `Delete Test Set ${Date.now()}`;

    const setId = await createSet(page, setName);

    const setRow = page.locator(`[data-testid="set-row-${setId}"]`);
    await setRow.getByTestId(`delete-set-desktop-${setId}`).click();

    const deleteResponsePromise = page.waitForResponse(
      (response: Response) =>
        response.url().includes(`/api/flashcards-sets/${setId}`) &&
        response.status() === 204 &&
        response.request().method() === "DELETE"
    );

    const confirmDialog = page.getByTestId("delete-set-dialog");
    await expect(confirmDialog).toBeVisible();
    await confirmDialog.getByTestId("confirm-delete-button").click();

    await deleteResponsePromise;

    await expect(setRow).not.toBeVisible({ timeout: 10000 });
    console.log(`Set "${setName}" (ID: ${setId}) successfully deleted`);
  });
});
