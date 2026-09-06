
import { test, expect } from "@playwright/test";

test("test login 1", async ({ page }) => {
  await page.goto("http://localhost:5173/login");
  await page.locator('input[type="email"]').fill("kk@gmail.com");
  await page.locator('input[type="password"]').fill("12");
  await page.getByRole("button", { name: "Ingresar" }).click();

  await expect(page).toHaveURL("http://localhost:5173/torneos");
  await expect(page.getByText("mis torneos organizados")).toBeVisible();
});

