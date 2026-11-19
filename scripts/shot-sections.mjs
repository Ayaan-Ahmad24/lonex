// Section captures: node scripts/shot-sections.mjs [url] [outDir]
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const url = process.argv[2] ?? "http://localhost:3000/";
const out = process.argv[3] ?? "artifacts/home-v2/sections";
await mkdir(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: "networkidle", timeout: 120000 });
await page.waitForTimeout(1800);

const targets = [
  ["hero", ".lx-hero"],
  ["range", "#range"],
  ["story", ".lx-story"],
  ["models", ".lx-model-list"],
  ["registry", "#registry"],
  ["journal", ".lx-journal"],
  ["closing", ".lx-close"],
  ["footer", "footer"],
  ["header", "header"],
];

for (const [name, selector] of targets) {
  const el = page.locator(selector).first();
  if ((await el.count()) === 0) {
    console.log(`${name}: missing`);
    continue;
  }
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await el.screenshot({ path: `${out}/${name}.png` });
  const box = await el.boundingBox();
  console.log(`${name}: ${Math.round(box.width)}x${Math.round(box.height)}`);
}

await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(800);
for (const [name, selector] of targets.slice(0, 6)) {
  const el = page.locator(selector).first();
  if ((await el.count()) === 0) continue;
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await el.screenshot({ path: `${out}/${name}-390.png` });
}

await browser.close();
