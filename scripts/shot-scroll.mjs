import { chromium } from "playwright";

const url = process.argv[2] ?? "http://localhost:3000/about";
const out = process.argv[3] ?? "artifacts/routes/about-scrolled";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: "networkidle", timeout: 120000 });
await page.waitForTimeout(800);

const height = await page.evaluate(() => document.documentElement.scrollHeight);
const step = 800;

for (let y = 0, i = 0; y < height; y += step, i += 1) {
  await page.evaluate((top) => window.scrollTo(0, top), y);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${out}-${String(i).padStart(2, "0")}.png` });
}

console.log("done", height);
await browser.close();
