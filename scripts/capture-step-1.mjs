import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const base = process.env.BASE_URL ?? "http://localhost:3402";
const root = "artifacts/lonex-step-1-review";

const slides = [
  { key: "01-generate", tab: "01: Generate — Solar energy" },
  { key: "02-store", tab: "02: Store — Battery storage" },
  { key: "03-move", tab: "03: Move — Electric mobility" },
];

const viewports = [
  { dir: "1440", width: 1440, height: 900 },
  { dir: "768", width: 768, height: 1024 },
  { dir: "390", width: 390, height: 844 },
];

for (const dir of ["1440", "768", "390", "reduced-motion"]) {
  await mkdir(path.join(root, dir), { recursive: true });
}

const screenshots = [];
const reports = [];
const consoleErrors = [];
const pageErrors = [];

function pngSize(buffer) {
  const signature = buffer.subarray(0, 8).toString("hex");
  if (signature !== "89504e470d0a1a0a") {
    throw new Error("Not a PNG");
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

async function shot(page, relPath, options = {}) {
  const buffer = await page.screenshot(options);
  const size = pngSize(buffer);
  await writeFile(path.join(root, relPath), buffer);
  screenshots.push({ file: relPath.replaceAll("\\", "/"), ...size });
  return size;
}

const browser = await chromium.launch({ headless: true });

for (const vp of viewports) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(`${vp.dir}: ${msg.text()}`);
    }
  });
  page.on("pageerror", (error) => {
    pageErrors.push(`${vp.dir}: ${error.message}`);
  });

  await page.goto(base, { waitUntil: "networkidle", timeout: 60000 });
  await page.locator(".lx-hero__headline").waitFor({ state: "visible" });
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll(".lx-hero img")).every(
      (image) => image.complete && image.naturalWidth > 0,
    ),
  );

  // Nudge the carousel and return to the first slide so the autoplay timer
  // restarts before the capture sequence. No pause state is captured.
  await page
    .locator('button[aria-label="02: Store — Battery storage"]')
    .click();
  await page.waitForTimeout(250);
  await page
    .locator('button[aria-label="01: Generate — Solar energy"]')
    .click();

  const measurements = await page.evaluate(() => {
    const hero = document.querySelector(".lx-hero");
    const header = document.querySelector(".site-header");
    const headline = document.querySelector(".lx-hero__headline");
    const stage = document.querySelector(".lx-hero__stage");
    const activeTab = document.querySelector(".lx-hero__tab.is-active");

    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      scrollWidth: document.documentElement.scrollWidth,
      heroHeight: hero?.getBoundingClientRect().height ?? 0,
      headerHeight: header?.getBoundingClientRect().height ?? 0,
      stageHeight: stage?.getBoundingClientRect().height ?? 0,
      headlineFont: headline ? getComputedStyle(headline).fontSize : null,
      headlineWidth: headline?.getBoundingClientRect().width ?? 0,
      activeTab: activeTab?.getAttribute("aria-label") ?? null,
      h1Count: document.querySelectorAll("h1").length,
      brokenImages: Array.from(document.querySelectorAll(".lx-hero img"))
        .filter((image) => image.naturalWidth === 0)
        .map((image) => image.currentSrc || image.src),
    };
  });

  for (const slide of slides) {
    await page
      .locator(`button[aria-label="${slide.tab}"]`)
      .click();
    await page.waitForTimeout(2200);

    const active = await page
      .locator(".lx-hero__tab.is-active")
      .getAttribute("aria-label");
    const heroTop = await page.evaluate(
      () => document.querySelector(".lx-hero")?.getBoundingClientRect().top ?? 0,
    );

    // Keep the header in frame and the full hero below it.
    await shot(page, `${vp.dir}/${slide.key}.png`, {
      clip: { x: 0, y: 0, width: vp.width, height: vp.height },
    });

    reports.push({
      viewport: vp.dir,
      slide: slide.key,
      activeTab: active,
      heroTop,
      headline: await page.locator(".lx-hero__headline").innerText(),
      lead: await page.locator(".lx-hero__lead").innerText(),
      ctaHref: await page
        .locator(".lx-hero__cta")
        .first()
        .getAttribute("href"),
    });
  }

  reports.push({ viewport: vp.dir, measurements });
  await context.close();
}

// Reduced motion: the hero must render the first slide, statically.
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: "networkidle", timeout: 60000 });
  await page.locator(".lx-hero__headline").waitFor({ state: "visible" });
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(1200);

  const state = await page.evaluate(() => {
    const fill = document.querySelector(
      ".lx-hero__tab.is-active .lx-hero__tab-fill",
    );
    const image = document.querySelector(".lx-hero__slide.is-active img");
    return {
      activeTab: document
        .querySelector(".lx-hero__tab.is-active")
        ?.getAttribute("aria-label"),
      fillAnimation: fill ? getComputedStyle(fill).animationName : null,
      imageTransform: image ? getComputedStyle(image).transform : null,
      headlineAnimation: getComputedStyle(
        document.querySelector(".lx-hero__headline"),
      ).animationName,
    };
  });

  await shot(page, "reduced-motion/01-generate.png");
  reports.push({ viewport: "1440", reducedMotion: state });
  await context.close();
}

await writeFile(
  path.join(root, "report.json"),
  JSON.stringify(
    { generatedAt: new Date().toISOString(), base, screenshots, reports, consoleErrors, pageErrors },
    null,
    2,
  ),
);

await browser.close();

console.log(
  JSON.stringify(
    { screenshots: screenshots.length, consoleErrors, pageErrors, reports },
    null,
    2,
  ),
);
