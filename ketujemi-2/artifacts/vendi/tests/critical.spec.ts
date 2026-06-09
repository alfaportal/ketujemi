import { test, expect } from "@playwright/test";

test.use({ baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:5173" });

/** Needs API + DB seed data — run locally with `pnpm dev`, not in CI smoke job. */
test.describe("integration @integration", () => {
  test.skip(
    !process.env.E2E_DATABASE_URL,
    "Set E2E_DATABASE_URL (Postgres) and run API + web dev servers before integration tests.",
  );

  test("vetura category shows subcategories in the DOM", async ({ page }) => {
    await page.goto("/categories/vetura");
    const subcategories = page.getByRole("button", {
      name: /Sedan|SUV|Hatchback|Kombi|Kabriolet|Kupe/i,
    });
    await expect(subcategories.first()).toBeVisible({ timeout: 30_000 });
    expect(await subcategories.count()).toBeGreaterThanOrEqual(2);
  });

  test("listings search q=Golf returns at least one result", async ({ page }) => {
    await page.goto("/listings?q=Golf");
    const results = page.locator('[data-testid^="card-listing-"]');
    await expect(results.first()).toBeVisible({ timeout: 30_000 });
    expect(await results.count()).toBeGreaterThanOrEqual(1);
  });

  test("shop directory page loads", async ({ page }) => {
    await page.goto("/dyqanet");
    await expect(page.getByTestId("button-language-selector")).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.locator("a[href^='/dyqanet/']").first()).toBeVisible({
      timeout: 20_000,
    });
  });

  test("listing detail opens from search results", async ({ page }) => {
    await page.goto("/listings?q=Golf");
    const card = page.locator('[data-testid^="card-listing-"]').first();
    await expect(card).toBeVisible({ timeout: 30_000 });
    await card.click();
    await expect(page.getByTestId("button-back")).toBeVisible({ timeout: 20_000 });
  });

  test("MK language switch does not crash home page", async ({ page }) => {
    await page.goto("/");
    const langBtn = page.getByTestId("button-language-selector").first();
    await expect(langBtn).toBeVisible({ timeout: 20_000 });
    await langBtn.click();
    await page.getByRole("button", { name: /MK|Macedonian|Македон/i }).first().click();
    await expect(page.getByText(/Something went wrong/i)).toHaveCount(0);
    await expect(langBtn).toBeVisible();
  });
});
