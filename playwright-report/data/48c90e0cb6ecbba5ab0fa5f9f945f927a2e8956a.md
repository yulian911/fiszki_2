# Test info

- Name: Protected Area Functionality >> SCN_PROT_001: should create and edit a flashcard set
- Location: D:\done\fiszki_v2\e2e\protected.spec.ts:88:7

# Error details

```
Error: Timed out 15000ms waiting for expect(locator).toContainText(expected)

Locator: locator('[data-testid="set-row-6da38dff-c36f-4f5a-9de2-47bb7f4fc934"]')
Expected string: "Updated Set 1749974386776"
Received: <element(s) not found>
Call log:
  - expect.toContainText with timeout 15000ms
  - waiting for locator('[data-testid="set-row-6da38dff-c36f-4f5a-9de2-47bb7f4fc934"]')
    4 × locator resolved to <tr data-testid="set-row-6da38dff-c36f-4f5a-9de2-47bb7f4fc934" class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">…</tr>
      - unexpected value "Test Set 1749974386776Japending015 czerwca 2025"

    at D:\done\fiszki_v2\e2e\protected.spec.ts:115:33
```

# Page snapshot

```yaml
- region "Notifications alt+T"
- main:
  - main:
    - navigation:
      - text: Fiszki App Hey, test@test.pl!
      - button "Wyloguj"
    - heading "Moje Zestawy Fiszek" [level=1]
    - button "Utwórz nowy zestaw"
    - button "Wszystkie"
    - button "Moje zestawy"
    - button "Udostępnione dla mnie"
    - text: Wyszukaj po nazwie
    - textbox "Wyszukaj po nazwie"
    - text: Status
    - combobox "Status": Wszystkie
    - text: Sortuj według
    - combobox "Sortuj według": Data utworzenia (Najnowsze)
    - table:
      - rowgroup:
        - row "Nazwa Właściciel Status Liczba fiszek Data utworzenia Akcje":
          - cell "Nazwa"
          - cell "Właściciel"
          - cell "Status"
          - cell "Liczba fiszek"
          - cell "Data utworzenia"
          - cell "Akcje"
      - rowgroup:
        - row "Updated Set 1749939449592 Ja pending 0 15 czerwca 2025":
          - cell "Updated Set 1749939449592"
          - cell "Ja"
          - cell "pending"
          - cell "0"
          - cell "15 czerwca 2025"
          - cell:
            - button:
              - img
            - button [disabled]:
              - img
            - button [disabled]:
              - img
            - button:
              - img
        - row "test1234 Ja pending 0 15 czerwca 2025":
          - cell "test1234"
          - cell "Ja"
          - cell "pending"
          - cell "0"
          - cell "15 czerwca 2025"
          - cell:
            - button:
              - img
            - button [disabled]:
              - img
            - button [disabled]:
              - img
            - button:
              - img
        - row "Updated Set 1749971587990 Ja pending 0 15 czerwca 2025":
          - cell "Updated Set 1749971587990"
          - cell "Ja"
          - cell "pending"
          - cell "0"
          - cell "15 czerwca 2025"
          - cell:
            - button:
              - img
            - button [disabled]:
              - img
            - button [disabled]:
              - img
            - button:
              - img
        - row "test 4 Ja accepted 0 14 czerwca 2025":
          - cell "test 4"
          - cell "Ja"
          - cell "accepted"
          - cell "0"
          - cell "14 czerwca 2025"
          - cell:
            - button:
              - img
            - button:
              - img
            - button:
              - img
            - button:
              - img
        - row "Updated Set 1749973009716 Ja pending 0 15 czerwca 2025":
          - cell "Updated Set 1749973009716"
          - cell "Ja"
          - cell "pending"
          - cell "0"
          - cell "15 czerwca 2025"
          - cell:
            - button:
              - img
            - button [disabled]:
              - img
            - button [disabled]:
              - img
            - button:
              - img
        - row "Updated Set 1749973268809 Ja pending 0 15 czerwca 2025":
          - cell "Updated Set 1749973268809"
          - cell "Ja"
          - cell "pending"
          - cell "0"
          - cell "15 czerwca 2025"
          - cell:
            - button:
              - img
            - button [disabled]:
              - img
            - button [disabled]:
              - img
            - button:
              - img
        - row "Updated Set 1749973574266 Ja pending 0 15 czerwca 2025":
          - cell "Updated Set 1749973574266"
          - cell "Ja"
          - cell "pending"
          - cell "0"
          - cell "15 czerwca 2025"
          - cell:
            - button:
              - img
            - button [disabled]:
              - img
            - button [disabled]:
              - img
            - button:
              - img
        - row "Updated Set 1749973680323 Ja pending 0 15 czerwca 2025":
          - cell "Updated Set 1749973680323"
          - cell "Ja"
          - cell "pending"
          - cell "0"
          - cell "15 czerwca 2025"
          - cell:
            - button:
              - img
            - button [disabled]:
              - img
            - button [disabled]:
              - img
            - button:
              - img
        - row "Updated Set 1749973809386 Ja pending 0 15 czerwca 2025":
          - cell "Updated Set 1749973809386"
          - cell "Ja"
          - cell "pending"
          - cell "0"
          - cell "15 czerwca 2025"
          - cell:
            - button:
              - img
            - button [disabled]:
              - img
            - button [disabled]:
              - img
            - button:
              - img
        - row "Delete Test Set 1749974386748 Ja pending 0 15 czerwca 2025":
          - cell "Delete Test Set 1749974386748"
          - cell "Ja"
          - cell "pending"
          - cell "0"
          - cell "15 czerwca 2025"
          - cell:
            - button:
              - img
            - button [disabled]:
              - img
            - button [disabled]:
              - img
            - button:
              - img
    - text: Wyświetlono 1 - 10 z 12 zestawów.
    - paragraph: "Elementów na stronie:"
    - combobox: "10"
    - button "Przejdź do pierwszej strony" [disabled]:
      - text: Przejdź do pierwszej strony
      - img
    - button "Przejdź do poprzedniej strony" [disabled]:
      - text: Przejdź do poprzedniej strony
      - img
    - text: Strona 1 z 2
    - button "Przejdź do następnej strony":
      - text: Przejdź do następnej strony
      - img
    - button "Przejdź do ostatniej strony":
      - text: Przejdź do ostatniej strony
      - img
- button "Open Tanstack query devtools":
  - img
- alert
- button "Open Next.js Dev Tools":
  - img
```

# Test source

```ts
   15 |
   16 |     await page.getByTestId("email-input").fill(E2E_EMAIL);
   17 |     await page.getByTestId("password-input").fill(E2E_PASSWORD);
   18 |     await page.getByTestId("login-button").click();
   19 |
   20 |     await navigationPromise;
   21 |
   22 |     // Verify we are on the dashboard
   23 |     await expect(
   24 |       page.getByRole("heading", { name: "Panel główny" })
   25 |     ).toBeVisible();
   26 |
   27 |     // Navigate to the sets page to be ready for the tests
   28 |     await page.goto("/protected/sets");
   29 |     await expect(
   30 |       page.getByRole("heading", { name: "Moje Zestawy Fiszek" })
   31 |     ).toBeVisible();
   32 |
   33 |     // Dynamically override react-query's client for test environment
   34 |     await page.evaluate(() => {
   35 |       const testWindow = window as any;
   36 |       if (testWindow.browserQueryClient) {
   37 |         console.log("Overriding react-query client for tests...");
   38 |         const queryClient = testWindow.browserQueryClient;
   39 |         queryClient.setDefaultOptions({
   40 |           queries: {
   41 |             retry: false,
   42 |             staleTime: 0,
   43 |             gcTime: 0, // Invalidate cache immediately
   44 |           },
   45 |           mutations: {
   46 |             retry: false,
   47 |           },
   48 |         });
   49 |         console.log("React-query client overridden.");
   50 |       } else {
   51 |         console.error("Could not find browserQueryClient to override.");
   52 |       }
   53 |     });
   54 |   });
   55 |
   56 |   // Helper function to create a set
   57 |   async function createSet(page: Page, setName: string): Promise<string> {
   58 |     const responsePromise = page.waitForResponse(
   59 |       (response: Response) =>
   60 |         response.url().includes("/api/flashcards-sets") &&
   61 |         response.status() === 201 &&
   62 |         response.request().method() === "POST"
   63 |     );
   64 |
   65 |     await page.getByTestId("create-set-button").click();
   66 |
   67 |     const modal = page.getByTestId("create-set-modal");
   68 |     await expect(modal).toBeVisible();
   69 |
   70 |     await modal.getByTestId("set-name-input").fill(setName);
   71 |     await modal
   72 |       .getByTestId("set-description-input")
   73 |       .fill(`Description for ${setName}`);
   74 |     await modal.getByTestId("save-set-button").click();
   75 |
   76 |     const response = await responsePromise;
   77 |     const responseBody = await response.json();
   78 |     const setId = responseBody.id;
   79 |
   80 |     await expect(
   81 |       page.locator(`[data-testid*="set-row-"]`).filter({ hasText: setName })
   82 |     ).toBeVisible({ timeout: 15000 });
   83 |
   84 |     console.log(`Set "${setName}" (ID: ${setId}) successfully created.`);
   85 |     return setId;
   86 |   }
   87 |
   88 |   test("SCN_PROT_001: should create and edit a flashcard set", async ({
   89 |     page,
   90 |   }) => {
   91 |     const setName = `Test Set ${Date.now()}`;
   92 |     const updatedSetName = `Updated Set ${Date.now()}`;
   93 |
   94 |     const setId = await createSet(page, setName);
   95 |
   96 |     const setRow = page.locator(`[data-testid="set-row-${setId}"]`);
   97 |     await setRow.getByTestId(`edit-set-desktop-${setId}`).click();
   98 |
   99 |     const editResponsePromise = page.waitForResponse(
  100 |       (response: Response) =>
  101 |         response.url().includes(`/api/flashcards-sets/${setId}`) &&
  102 |         response.status() === 200 &&
  103 |         response.request().method() === "PUT"
  104 |     );
  105 |
  106 |     const editModal = page.getByTestId("edit-set-modal");
  107 |     await expect(editModal).toBeVisible();
  108 |     await editModal.getByTestId("set-name-input").clear();
  109 |     await editModal.getByTestId("set-name-input").fill(updatedSetName);
  110 |     await editModal.getByTestId("save-set-button").click();
  111 |
  112 |     await editResponsePromise;
  113 |
  114 |     const updatedSetRow = page.locator(`[data-testid="set-row-${setId}"]`);
> 115 |     await expect(updatedSetRow).toContainText(updatedSetName);
      |                                 ^ Error: Timed out 15000ms waiting for expect(locator).toContainText(expected)
  116 |     console.log(`Set ID ${setId} successfully updated to "${updatedSetName}"`);
  117 |   });
  118 |
  119 |   test("SCN_PROT_002: should delete a flashcard set", async ({ page }) => {
  120 |     const setName = `Delete Test Set ${Date.now()}`;
  121 |
  122 |     const setId = await createSet(page, setName);
  123 |
  124 |     const setRow = page.locator(`[data-testid="set-row-${setId}"]`);
  125 |     await setRow.getByTestId(`delete-set-desktop-${setId}`).click();
  126 |
  127 |     const deleteResponsePromise = page.waitForResponse(
  128 |       (response: Response) =>
  129 |         response.url().includes(`/api/flashcards-sets/${setId}`) &&
  130 |         response.status() === 204 &&
  131 |         response.request().method() === "DELETE"
  132 |     );
  133 |
  134 |     const confirmDialog = page.getByTestId("delete-set-dialog");
  135 |     await expect(confirmDialog).toBeVisible();
  136 |     await confirmDialog.getByTestId("confirm-delete-button").click();
  137 |
  138 |     await deleteResponsePromise;
  139 |
  140 |     await expect(setRow).not.toBeVisible({ timeout: 10000 });
  141 |     console.log(`Set "${setName}" (ID: ${setId}) successfully deleted`);
  142 |   });
  143 | });
  144 |
```