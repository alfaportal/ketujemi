import { test, expect } from "@playwright/test";

test.use({ baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:5173" });

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

test("post-listing first step loads and Vazhdo button is visible", async ({ page }) => {
  await page.goto("/listings/new");
  await expect(page.getByRole("button", { name: /Vazhdo/i }).first()).toBeVisible({
    timeout: 20_000,
  });
  await expect(page.locator("form").first()).toBeVisible({ timeout: 20_000 });
});

test("login page loads with email field", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByLabel(/email/i).first()).toBeVisible({ timeout: 20_000 });
  await expect(page.locator("form").first()).toBeVisible({ timeout: 20_000 });
});

test("admin route shows login or dashboard without crash", async ({ page }) => {
  await page.goto("/admin");
  await expect(
    page.getByText(/Paneli|Control panel|Kyçu|Log in|Dashboard/i).first(),
  ).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(/Something went wrong/i)).toHaveCount(0);
});
