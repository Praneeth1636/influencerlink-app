// Usage: node scripts/screenshot-crop.mjs /feed /tmp/out.png 0 0 320 200
import { chromium } from "playwright";

const path = process.argv[2] || "/";
const out = process.argv[3] || "/tmp/terrace-crop.png";
const x = Number(process.argv[4] ?? 0);
const y = Number(process.argv[5] ?? 0);
const w = Number(process.argv[6] ?? 360);
const h = Number(process.argv[7] ?? 220);
const url = `http://localhost:3000${path}`;

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
await page.waitForTimeout(1200);
await page.screenshot({ path: out, clip: { x, y, width: w, height: h } });
await browser.close();
console.log("OK", out);
