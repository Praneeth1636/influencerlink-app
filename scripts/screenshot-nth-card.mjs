// Screenshot the Nth synced-post embed (the <a> linking to a platform).
// Usage: node scripts/screenshot-nth-card.mjs 0 /tmp/out.png
import { chromium } from "playwright";

const n = Number(process.argv[2] ?? 0);
const out = process.argv[3] || "/tmp/card.png";

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/feed", { waitUntil: "networkidle", timeout: 45000 });
await page.waitForTimeout(1200);

const cards = await page.$$('a[href*="youtube.com"], a[href*="instagram.com"], a[href*="tiktok.com"]');
if (!cards[n]) {
  console.error(`only ${cards.length} cards found`);
  process.exit(1);
}
await cards[n].scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
await cards[n].screenshot({ path: out });
await browser.close();
console.log("OK", out, `(of ${cards.length} cards)`);
