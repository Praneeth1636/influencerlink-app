import { expect, test } from "@playwright/test";

test("feed loads the CreatorLink marketplace dashboard", async ({ page }) => {
  await page.goto("/feed");

  await expect(page).toHaveTitle(/InfluencerLink/);
  await expect(page.getByRole("heading", { name: "Creator campaigns, matched by verified influence." })).toBeVisible();
  await expect(page.getByRole("button", { name: /Sara Rivera/ })).toBeVisible();
});

test("public creator profile loads by handle", async ({ page }) => {
  await page.goto("/profile/sararivera");

  await expect(page).toHaveTitle(/InfluencerLink/);
  await expect(page.getByRole("heading", { name: "Sara Rivera" })).toBeVisible();
  await expect(page.getByText("Connected accounts")).toBeVisible();
});

test("public company page loads by slug", async ({ page }) => {
  await page.goto("/company/resy");

  await expect(page).toHaveTitle(/InfluencerLink/);
  await expect(page.getByRole("heading", { name: "Resy" })).toBeVisible();
  await expect(page.getByText("Public members")).toBeVisible();
});

test("creator search filters creators", async ({ page }) => {
  await page.goto("/search?q=beauty&niche=Beauty&minReach=100000&open=1");

  await expect(page).toHaveTitle(/InfluencerLink/);
  await expect(
    page.getByRole("heading", { name: "Search creators by the numbers that brands actually buy." })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Open profile" }).first()).toBeVisible();
});
