import { expect, test } from "@playwright/test";

test("feed loads the CreatorLink marketplace dashboard", async ({ page }) => {
  await page.goto("/feed");

  await expect(page).toHaveTitle(/InfluencerLink/);
  await expect(page.getByRole("heading", { name: "Creator campaigns, matched by verified influence." })).toBeVisible();
  await expect(page.getByRole("button", { name: /Sara Rivera/ })).toBeVisible();
});
