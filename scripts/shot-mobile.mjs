import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const out = "artifacts/routes/mobile";
await mkdir(out, { recursive: true });

const routes = [
  ["solar", "/solar"],
  ["product", "/solar/lonex-p1-bd-650"],
  ["blog", "/blog"],
];

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
});

for (const [name, route] of routes) {
  await page.goto(`http://localhost:3000${route}`, {
    waitUntil: "networkidle",
    timeout: 120000,
  });
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${out}/${name}-fold.png` });
  await page.screenshot({ path: `${out}/${name}-full.png`, fullPage: true });
  console.log(`${name}: ${await page.evaluate(() => document.documentElement.scrollHeight)}`);
}

await browser.close();
