import { expect, test } from "@playwright/test";

test("feed loads the CreatorLink marketplace dashboard", async ({ page }) => {
  await page.goto("/feed");

  await expect(page).toHaveTitle(/InfluencerLink/);
  await expect(page.getByRole("heading", { name: "Creator campaigns, matched by verified influence." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Post to the creator market." })).toBeVisible();
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

test("jobs board and job detail pages load open briefs", async ({ page }) => {
  await page.goto("/jobs?niche=Beauty&minBudget=300000&remote=1");

  await expect(page).toHaveTitle(/InfluencerLink/);
  await expect(
    page.getByRole("heading", { name: "Browse brand campaigns built for creator proof, not vanity." })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "View brief" }).first()).toBeVisible();

  await page.goto("/jobs/00000000-0000-4000-8000-000000008000");

  await expect(page.getByRole("heading", { name: /Glossier: Summer skincare launch creator brief/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign in to apply" })).toBeVisible();
});

test("brand brief builder renders the real job create form", async ({ page }) => {
  await page.goto("/jobs/new");

  await expect(page).toHaveTitle(/InfluencerLink/);
  await expect(page.getByRole("heading", { name: "Create briefs creators can act on." })).toBeVisible();
  await expect(page.getByText(/No brand session found|Loading your brand teams/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Publish brief" })).toBeDisabled();
});

test("brand applicant pipeline loads seeded applications", async ({ page }) => {
  await page.goto("/jobs/00000000-0000-4000-8000-000000008000/applicants");

  await expect(page).toHaveTitle(/InfluencerLink/);
  await expect(page.getByRole("heading", { name: "Manage applicants for Glossier." })).toBeVisible();
  await expect(page.getByText("Applicant pipeline")).toBeVisible();
  await expect(page.getByRole("link", { name: "Sara Rivera" })).toBeVisible();
});

test("creator saved jobs workspace loads saved briefs and applications", async ({ page }) => {
  await page.goto("/jobs/saved");

  await expect(page).toHaveTitle(/InfluencerLink/);
  await expect(page.getByRole("heading", { name: "Track saved briefs and every creator application." })).toBeVisible();
  await expect(page.getByText("Your pitch pipeline")).toBeVisible();
  await expect(page.getByText("Briefs to revisit")).toBeVisible();
});

test("messages inbox and thread detail load conversations", async ({ page }) => {
  await page.goto("/messages");

  await expect(page).toHaveTitle(/InfluencerLink/);
  await expect(page.getByRole("heading", { name: "Keep every creator deal in one clean thread." })).toBeVisible();
  await expect(page.getByRole("link", { name: /Glossier/ }).first()).toBeVisible();

  await page.goto("/messages/00000000-0000-4000-8000-000000009000");

  await expect(page.getByRole("heading", { name: "Glossier" })).toBeVisible();
  await expect(page.getByPlaceholder("Write a message...")).toBeVisible();
});

test("notifications page loads workspace alerts", async ({ page }) => {
  await page.goto("/notifications");

  await expect(page).toHaveTitle(/InfluencerLink/);
  await expect(page.getByRole("heading", { name: "Track every creator opportunity as it moves." })).toBeVisible();
  await expect(page.getByText("Workspace alerts")).toBeVisible();
  await expect(page.getByRole("button", { name: "Mark all read" })).toBeVisible();
});

test("billing settings page loads plan usage", async ({ page }) => {
  await page.goto("/settings/billing");

  await expect(page).toHaveTitle(/InfluencerLink/);
  await expect(page.getByRole("heading", { name: "Turn CreatorLink into a paid marketplace." })).toBeVisible();
  await expect(page.getByText("Plan catalog")).toBeVisible();
  await expect(page.getByText("Brand Growth")).toBeVisible();
});
