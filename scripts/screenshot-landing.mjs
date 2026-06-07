// One-shot Playwright driver to screenshot the landing page.
// Run via: node scripts/screenshot-landing.mjs
import { chromium } from "playwright";

const URL = process.argv[2] || "http://localhost:3000/";
const OUT_FULL = "/tmp/terrace-landing-full.png";
const OUT_HERO = "/tmp/terrace-landing-hero.png";

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const errors = [];
page.on("pageerror", (err) => errors.push(err.message));
const consoleErrors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});

console.log("Navigating to", URL);
await page.goto(URL, { waitUntil: "networkidle", timeout: 45000 });
await page.waitForTimeout(1400);

console.log("Hero screenshot");
await page.screenshot({ path: OUT_HERO });

console.log("Full-page screenshot");
await page.screenshot({ path: OUT_FULL, fullPage: true });

await browser.close();

console.log("OK");
console.log("hero:", OUT_HERO);
console.log("full:", OUT_FULL);
if (errors.length) console.log("page errors:", errors);
if (consoleErrors.length) console.log("console errors:", consoleErrors);
