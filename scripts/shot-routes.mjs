// Batch route captures: node scripts/shot-routes.mjs
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const out = "artifacts/routes";
await mkdir(out, { recursive: true });

const routes = [
  ["solar", "/solar"],
  ["product", "/solar/lonex-p1-bd-650"],
  ["about", "/about"],
  ["blog", "/blog"],
  ["post", "/blog/why-the-model-code-matters"],
  ["verify", "/verify"],
  ["contact", "/contact"],
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

for (const [name, route] of routes) {
  const response = await page.goto(`http://localhost:3000${route}`, {
    waitUntil: "networkidle",
    timeout: 120000,
  });
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  console.log(`${name}: ${response?.status()} ${height}px`);
}

await browser.close();
