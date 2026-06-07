// Screenshot a specific section by id or selector.
// Usage: node scripts/screenshot-section.mjs "#creators" out.png
import { chromium } from "playwright";

const URL = "http://localhost:3000/";
const SELECTOR = process.argv[2] || "#creators";
const OUT = process.argv[3] || "/tmp/terrace-section.png";

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

await page.goto(URL, { waitUntil: "networkidle", timeout: 45000 });
await page.waitForTimeout(1200);

const el = await page.$(SELECTOR);
if (!el) {
  console.error("selector not found:", SELECTOR);
  process.exit(1);
}
await el.screenshot({ path: OUT });
await browser.close();
console.log("OK", OUT);
