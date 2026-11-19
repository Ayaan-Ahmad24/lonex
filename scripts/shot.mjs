// Local visual check: node scripts/shot.mjs [url] [outDir]
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const url = process.argv[2] ?? "http://localhost:3000/";
const out = process.argv[3] ?? "artifacts/home-v2";
await mkdir(out, { recursive: true });

const browser = await chromium.launch();
const sizes = [
  { name: "1440", width: 1440, height: 900 },
  { name: "390", width: 390, height: 844 },
];

for (const size of sizes) {
  const page = await browser.newPage({
    viewport: { width: size.width, height: size.height },
    deviceScaleFactor: 1,
  });
  await page.goto(url, { waitUntil: "networkidle", timeout: 120000 });
  await page.waitForTimeout(2200);
  await page.screenshot({ path: `${out}/${size.name}-fold.png` });
  await page.screenshot({ path: `${out}/${size.name}-full.png`, fullPage: true });
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  console.log(`${size.name}: ${size.width}x${height}`);
  await page.close();
}

await browser.close();
