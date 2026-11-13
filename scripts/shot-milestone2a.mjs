// Milestone 2A visual QA capture.
// Usage: node scripts/shot-milestone2a.mjs before
//        BASE_URL=http://127.0.0.1:3100 node scripts/shot-milestone2a.mjs after
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";

const label = process.argv[2] ?? "after";
const base = process.env.BASE_URL ?? "http://localhost:3000";
const out = `artifacts/milestone-2a/${label}`;

const sizes = [
  { name: "1440", width: 1440, height: 900 },
  { name: "1024", width: 1024, height: 768 },
  { name: "768", width: 768, height: 1024 },
  { name: "390", width: 390, height: 844 },
  { name: "360", width: 360, height: 780 },
];

const routes = [
  ["home", "/"],
  ["solar", "/solar"],
  ["batteries", "/batteries"],
  ["ev-bikes", "/ev-bikes"],
  ["product", "/solar/demo-solar-module-01"],
  ["about", "/about"],
  ["journal", "/blog"],
  ["article", "/blog/why-the-model-code-matters"],
  ["contact", "/contact"],
  ["verify", "/verify"],
  ["sellers", "/authorized-sellers"],
];

const fullWidths = new Set(["1440", "390"]);
const report = { label, base, capturedAt: new Date().toISOString(), pages: [], states: [] };

const hideDevBadge = () => {
  const inject = () => {
    const style = document.createElement("style");
    style.textContent =
      "nextjs-portal{display:none!important}*{scrollbar-width:thin}";
    document.head.append(style);
  };
  if (document.head) inject();
  else document.addEventListener("DOMContentLoaded", inject, { once: true });
};

await mkdir(out, { recursive: true });
await mkdir(`${out}/states`, { recursive: true });
const browser = await chromium.launch();

async function openPage(size) {
  const context = await browser.newContext({
    viewport: { width: size.width, height: size.height },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.addInitScript(hideDevBadge);
  return { context, page };
}

for (const size of sizes) {
  await mkdir(`${out}/${size.name}`, { recursive: true });
  const { context, page } = await openPage(size);
  const consoleErrors = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  for (const [name, route] of routes) {
    const response = await page.goto(`${base}${route}`, {
      waitUntil: "networkidle",
      timeout: 120_000,
    });
    await page.waitForTimeout(500);

    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      height: document.documentElement.scrollHeight,
      brokenImages: Array.from(document.images)
        .filter((img) => img.complete && img.naturalWidth === 0)
        .map((img) => img.currentSrc || img.src),
    }));

    await page.screenshot({ path: `${out}/${size.name}/${name}-fold.png` });
    if (fullWidths.has(size.name)) {
      await page.screenshot({
        path: `${out}/${size.name}/${name}-full.png`,
        fullPage: true,
      });
    }

    report.pages.push({
      size: size.name,
      name,
      route,
      status: response?.status() ?? 0,
      overflowX: metrics.scrollWidth - metrics.innerWidth,
      height: metrics.height,
      brokenImages: metrics.brokenImages,
    });
    console.log(
      `${size.name} ${name}: ${response?.status()} overflow=${metrics.scrollWidth - metrics.innerWidth} h=${metrics.height}`,
    );

    // Header states. Product mega menu and Company menu are desktop only.
    if (name !== "home") {
      continue;
    }

    if (size.width >= 960) {
      const products = page.locator('[data-nav-menu="products"]');
      if ((await products.count()) > 0) {
        await page.evaluate(() => window.scrollTo(0, 0));
        await products.click();
        await page.waitForTimeout(250);
        await page.screenshot({ path: `${out}/states/products-${size.name}.png` });
        await page.keyboard.press("Escape");
        await page.waitForTimeout(150);

        const company = page.locator('[data-nav-menu="company"]');
        await company.click();
        await page.waitForTimeout(250);
        await page.screenshot({ path: `${out}/states/company-${size.name}.png` });
        await page.keyboard.press("Escape");
      }
    } else if (name === "home") {
      const toggle = page.locator("[data-nav-toggle]");
      if ((await toggle.count()) > 0) {
        await toggle.click();
        await page.waitForTimeout(350);
        await page.screenshot({ path: `${out}/states/drawer-${size.name}.png` });
        const accordion = page.locator('[data-drawer-accordion="products"]');
        if ((await accordion.count()) > 0) {
          await accordion.click();
          await page.waitForTimeout(250);
          await page.screenshot({
            path: `${out}/states/drawer-products-${size.name}.png`,
          });
        }
        await page.keyboard.press("Escape");
      } else {
        const legacy = page.locator(".site-menu > summary");
        if ((await legacy.count()) > 0) {
          await legacy.click();
          await page.waitForTimeout(250);
          await page.screenshot({ path: `${out}/states/drawer-${size.name}.png` });
          await page.keyboard.press("Escape");
        }
      }
    }
  }

  if (consoleErrors.length > 0) {
    report.pages.push({ size: size.name, consoleErrors });
  }
  await context.close();
}

await writeFile(`${out}/report.json`, JSON.stringify(report, null, 2));
await browser.close();
console.log(`Wrote ${out}`);
