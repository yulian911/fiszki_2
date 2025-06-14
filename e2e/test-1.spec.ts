import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page.getByRole("link", { name: "Zaloguj się" }).click();
  await page.getByTestId("email-input").click();
  await page.getByTestId("email-input").fill("test@test.pl");
  await page.getByTestId("password-input").click();
  await page.getByTestId("password-input").fill("Test123!");
  await page.getByTestId("login-button").click();
  await page.getByTestId("sets-link").click();
  await page.getByTestId("create-set-button").click();
  await page.getByTestId("set-name-input").fill("Test1");
  await page.getByTestId("set-description-input").click();
  await page.getByTestId("set-description-input").fill("XD");
  await page.getByTestId("save-set-button").click();
  await page
    .getByTestId("delete-set-desktop-c549b077-02b4-483f-bd73-b0d64ec55017")
    .click();
  await page.getByTestId("confirm-delete-button").click();
  await page.getByText("Zestaw został pomyślnie usuni").click();
});
