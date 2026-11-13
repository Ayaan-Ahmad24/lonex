// Header-only visual check: node scripts/shot-header.mjs
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const base = process.env.BASE_URL ?? "http://localhost:3000";
const out = process.env.OUT ?? "artifacts/milestone-2a/header";
await mkdir(out, { recursive: true });

const sizes = [
  { name: "1440", width: 1440, height: 900 },
  { name: "1024", width: 1024, height: 768 },
  { name: "960", width: 960, height: 800 },
  { name: "900", width: 900, height: 800 },
  { name: "768", width: 768, height: 1024 },
  { name: "390", width: 390, height: 844 },
  { name: "360", width: 360, height: 780 },
];

const browser = await chromium.launch();

for (const size of sizes) {
  const context = await browser.newContext({
    viewport: { width: size.width, height: size.height },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    const inject = () => {
      const style = document.createElement("style");
      style.textContent = "nextjs-portal{display:none!important}";
      document.head.append(style);
    };
    if (document.head) inject();
    else document.addEventListener("DOMContentLoaded", inject, { once: true });
  });

  await page.goto(`${base}/`, { waitUntil: "networkidle", timeout: 120_000 });
  await page.waitForTimeout(400);

  const header = page.locator(".site-header");
  await header.screenshot({ path: `${out}/header-${size.name}.png` });

  if (size.width >= 960) {
    await page.locator('[data-nav-menu="products"]').click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${out}/mega-${size.name}.png` });

    const mega = await page.locator(".site-mega").boundingBox();
    console.log(size.name, "mega", JSON.stringify(mega));

    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);

    await page.locator('[data-nav-menu="company"]').click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${out}/company-${size.name}.png` });
    await page.keyboard.press("Escape");
  } else {
    await page.locator("[data-nav-toggle]").click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${out}/drawer-${size.name}.png` });
    await page.locator('[data-drawer-accordion="products"]').click();
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${out}/drawer-products-${size.name}.png` });

    const overflow = await page.evaluate(() => ({
      doc: document.documentElement.scrollWidth,
      win: window.innerWidth,
    }));
    console.log(size.name, "drawer overflow", overflow);
    await page.keyboard.press("Escape");
  }

  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  console.log(size.name, "page overflow", metrics.scrollWidth - metrics.innerWidth);

  await context.close();
}

await browser.close();
console.log("wrote", out);
