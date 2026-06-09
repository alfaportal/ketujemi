import { test, expect } from "@playwright/test";

/** Static / shell checks — no live DB required (CI-safe). */
test.describe("smoke @smoke", () => {
  test("home page loads without error boundary", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("main").first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/Something went wrong/i)).toHaveCount(0);
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

  test("post-listing route loads without crash", async ({ page }) => {
    await page.goto("/listings/new");
    await expect(page.getByText(/Something went wrong/i)).toHaveCount(0);
    await expect(page.locator("main").first()).toBeVisible({ timeout: 20_000 });
  });

  test("terms static page loads", async ({ page }) => {
    await page.goto("/terms");
    await expect(page.locator("main").first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/Something went wrong/i)).toHaveCount(0);
  });
});
