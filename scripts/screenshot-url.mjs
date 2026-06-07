// Usage: node scripts/screenshot-url.mjs /feed /tmp/out.png
import { chromium } from "playwright";

const path = process.argv[2] || "/";
const out = process.argv[3] || "/tmp/terrace-page.png";
const url = `http://localhost:3000${path}`;

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
await page.waitForTimeout(1200);
await page.screenshot({ path: out });
await browser.close();
console.log("OK", out);
