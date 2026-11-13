import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve("artifacts/lonex-step-6-research/reference");
await mkdir(OUT, { recursive: true });

const TARGETS = [
  { key: "ecoflow", url: "https://energy.ecoflow.com/us" },
  { key: "specialized-ebikes", url: "https://www.specialized.com/gb/en/shop/bikes/electric-bikes" },
  { key: "trek-ebikes", url: "https://www.trekbikes.com/us/en_US/bikes/electric-bikes/c/B507/" },
  { key: "sunpower", url: "https://us.sunpower.com/" },
  { key: "baymard-plp", url: "https://baymard.com/research/ecommerce-product-lists" },
];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
});
const page = await context.newPage();

for (const t of TARGETS) {
  try {
    await page.goto(t.url, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(2500);
    for (const label of ["Reject", "Accept", "Got it", "Close"]) {
      const btn = page.getByRole("button", { name: label, exact: false }).first();
      if (await btn.count().catch(() => 0)) {
        await btn.click({ timeout: 1200 }).catch(() => {});
        await page.waitForTimeout(400);
        break;
      }
    }
    await page.screenshot({
      path: path.join(OUT, `${t.key}-mobile-fold.png`),
      fullPage: false,
      timeout: 30000,
    });
    console.log("ok " + t.key);
  } catch (e) {
    console.log("fail " + t.key + " " + String(e).split("\n")[0]);
  }
}

await browser.close();
