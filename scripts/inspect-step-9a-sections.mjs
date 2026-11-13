// Per-section captures for Step 9A visual review.
//   node scripts/inspect-step-9a-sections.mjs --base http://localhost:3000 --out artifacts/lonex-step-9a-review/wip/sections
import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const index = argv.indexOf(`--${name}`);
  return index >= 0 ? argv[index + 1] : fallback;
};

const base = arg("base", "http://localhost:3000");
const outDir = path.resolve(arg("out", "artifacts/lonex-step-9a-review/wip/sections"));
const widths = (arg("widths", "1440,390") || "1440,390")
  .split(",")
  .map((value) => Number(value.trim()))
  .filter(Boolean);

const SECTIONS = [
  { name: "hero", selector: ".lxa-hero" },
  { name: "story", selector: "#story" },
  { name: "pillars", selector: "#pillars" },
  { name: "approach", selector: "#approach" },
  { name: "community", selector: "#community" },
  { name: "close", selector: ".lxa-close" },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function settle(page) {
  await page.evaluate(async () => {
    const step = Math.max(240, Math.round(window.innerHeight * 0.6));
    const height = document.body.scrollHeight;
    for (let y = 0; y < height; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 70));
    }
    window.scrollTo(0, 0);
  });
  await sleep(1200);
}

await fs.mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true });

for (const width of widths) {
  const context = await browser.newContext({
    viewport: { width, height: width >= 900 ? 900 : 844 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.goto(`${base}/about`, { waitUntil: "load", timeout: 90000 });
  await settle(page);

  for (const section of SECTIONS) {
    const locator = page.locator(section.selector).first();
    const count = await locator.count();
    if (!count) {
      console.log(`${width} ${section.name} -> missing`);
      continue;
    }
    await locator.scrollIntoViewIfNeeded();
    await sleep(500);
    const file = path.join(outDir, `${section.name}-${width}.png`);
    await locator.screenshot({ path: file });
    console.log(`${width} ${section.name} -> ${path.relative(process.cwd(), file)}`);
  }

  await context.close();
}

await browser.close();
