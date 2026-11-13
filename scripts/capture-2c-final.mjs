import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const base = process.env.BASE_URL ?? "http://localhost:3401";
const root = "artifacts/lonex-milestone-2c-review";

const viewports = [
  { name: "1440", dir: "desktop/1440", width: 1440, height: 900 },
  { name: "1024", dir: "desktop/1024", width: 1024, height: 768 },
  { name: "768", dir: "tablet/768", width: 768, height: 1024 },
  { name: "390", dir: "mobile/390", width: 390, height: 844 },
  { name: "360", dir: "mobile/360", width: 360, height: 780 },
];

const sections = [
  ["range", "#range"],
  ["story", "#story"],
  ["models", "#models"],
  ["registry", "#registry"],
  ["sellers", "#sellers"],
  ["journal", "#journal"],
  ["closing", ".lxh-close"],
];

for (const dir of [
  "desktop/1440",
  "desktop/1024",
  "tablet/768",
  "mobile/390",
  "mobile/360",
  "sections",
  "animations",
  "reports",
]) {
  await mkdir(path.join(root, dir), { recursive: true });
}

const screenshots = [];
const consoleErrors = [];
const pageErrors = [];
const viewportResults = [];
const routeChecks = [];

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
  const full = path.join(root, relPath);
  await writeFile(full, buffer);
  screenshots.push({ file: relPath.replaceAll("\\", "/"), ...size });
  return size;
}

const browser = await chromium.launch({ headless: true });

// ---------------------------------------------------------------------------
// Viewport sweeps
// ---------------------------------------------------------------------------
for (const vp of viewports) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(`${vp.name}: ${msg.text()}`);
    }
  });
  page.on("pageerror", (err) => {
    pageErrors.push(`${vp.name}: ${err.message}`);
  });

  const response = await page.goto(`${base}/`, { waitUntil: "networkidle" });
  await page.addStyleTag({
    content: "nextjs-portal{display:none!important}",
  });
  await page.waitForTimeout(800);

  await shot(page, `${vp.dir}/fold.png`);

  const initialMetrics = await page.evaluate(() => ({
    overflowX:
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
    documentHeight: document.body.scrollHeight,
    h1: document.querySelectorAll("h1").length,
    h2: Array.from(document.querySelectorAll("h2")).map((node) =>
      node.textContent?.replace(/\s+/g, " ").trim(),
    ),
    canonical: document.querySelector('link[rel="canonical"]')?.href ?? null,
    missingAlt: Array.from(document.images)
      .filter((img) => !img.getAttribute("alt"))
      .map((img) => img.currentSrc || img.src),
    demoTagged: document.querySelectorAll(".lxh-tag--demo").length,
    illustrativeTagged: document.querySelectorAll(".lxh-tag--image").length,
  }));

  // Trigger every ScrollTrigger, then return to the top for the full capture.
  await page.evaluate(async () => {
    const step = Math.max(240, window.innerHeight * 0.6);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 110));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(700);

  const settled = await page.evaluate(() => {
    const visibleImages = Array.from(document.images).filter((img) => {
      const rect = img.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
    const broken = visibleImages.filter(
      (img) => !img.complete || img.naturalWidth === 0,
    );
    const heads = Array.from(
      document.querySelectorAll("[data-lxh-head] > *"),
    ).map((node) => {
      const cs = getComputedStyle(node);
      return { opacity: Number(cs.opacity), visibility: cs.visibility };
    });
    const ctas = Array.from(
      document.querySelectorAll(
        ".lxh-home a.lx-link, .lxh-home a.lx-btn, .lxh-hero a.lx-btn",
      ),
    ).map((a) => ({
      text: a.textContent?.replace(/\s+/g, " ").trim(),
      href: a.getAttribute("href"),
    }));
    return {
      overflowX:
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
      documentHeight: document.body.scrollHeight,
      imageCount: visibleImages.length,
      brokenImages: broken.map((img) => img.currentSrc || img.src),
      headOpacityMin: heads.length
        ? Math.min(...heads.map((h) => h.opacity))
        : null,
      headHidden: heads.filter(
        (h) => h.visibility !== "visible" || h.opacity < 0.99,
      ).length,
      ctas,
    };
  });

  await shot(page, `${vp.dir}/full.png`, { fullPage: true });

  for (const [name, selector] of sections) {
    const locator = page.locator(selector);
    if ((await locator.count()) === 0) {
      continue;
    }
    await page.evaluate(
      ([sel]) => {
        const el = document.querySelector(sel);
        if (el) {
          window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 80);
        }
      },
      [selector],
    );
    await page.waitForTimeout(320);
    const buffer = await locator.screenshot();
    const size = pngSize(buffer);
    const rel = `sections/${vp.name}-${name}.png`;
    await writeFile(path.join(root, rel), buffer);
    screenshots.push({ file: rel, ...size });
  }

  viewportResults.push({
    viewport: `${vp.width}x${vp.height}`,
    httpStatus: response?.status() ?? null,
    title: await page.title(),
    ...initialMetrics,
    ...settled,
  });

  if (vp.name === "390") {
    const menu = page.getByRole("button", { name: /menu/i }).first();
    if ((await menu.count()) > 0) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await menu.click();
      await page.waitForTimeout(500);
      await shot(page, "animations/mobile-nav-390.png");
      const navState = await page.evaluate(() => ({
        expanded:
          document
            .querySelector('[aria-expanded="true"]')
            ?.textContent?.replace(/\s+/g, " ")
            .trim() ?? null,
        dialogVisible: Array.from(
          document.querySelectorAll('[role="dialog"], nav'),
        ).some((node) => {
          const rect = node.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        }),
        bodyOverflow: getComputedStyle(document.body).overflow,
      }));
      viewportResults.push({ viewport: "390", mobileNav: navState });
      await page.keyboard.press("Escape");
    }
  }

  await context.close();
}

// ---------------------------------------------------------------------------
// Hover states at 1440
// ---------------------------------------------------------------------------
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  await page.addStyleTag({
    content: "nextjs-portal{display:none!important}",
  });
  await page.waitForTimeout(700);

  const hoverTargets = [
    ["product-card", ".lxh-product--lead"],
    ["journal-card", ".lxh-journal__feature"],
  ];

  for (const [name, selector] of hoverTargets) {
    const target = page.locator(selector).first();
    if ((await target.count()) === 0) continue;
    await target.scrollIntoViewIfNeeded();
    await page.waitForTimeout(350);
    await target.hover();
    await page.waitForTimeout(650);
    await shot(page, `animations/hover-${name}-1440.png`, {
      clip: await target.boundingBox(),
    });
  }

  const closing = page.locator(".lxh-close").first();
  await closing.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  const cta = page.locator(".lxh-close .lx-btn--red").first();
  await cta.hover();
  await page.waitForTimeout(500);
  const ctaBox = await cta.boundingBox();
  if (ctaBox) {
    await shot(page, "animations/hover-cta-1440.png", {
      clip: {
        x: Math.max(0, ctaBox.x - 24),
        y: Math.max(0, ctaBox.y - 24),
        width: Math.min(1440 - Math.max(0, ctaBox.x - 24), ctaBox.width + 48),
        height: ctaBox.height + 48,
      },
    });
  }

  await context.close();
}

// ---------------------------------------------------------------------------
// GSAP initial / mid / completed on the closing section
// ---------------------------------------------------------------------------
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  await page.addStyleTag({
    content: "nextjs-portal{display:none!important}",
  });
  await page.waitForTimeout(1000);

  const closeTop = await page.evaluate(() => {
    const el = document.querySelector(".lxh-close");
    return el ? el.getBoundingClientRect().top + window.scrollY : 0;
  });

  const state = async () =>
    page.evaluate(() => {
      const span = document.querySelector(".lxh-close__title span");
      const aside = document.querySelector(".lxh-close__aside > *");
      const read = (node) => {
        if (!node) return null;
        const cs = getComputedStyle(node);
        return {
          opacity: Number(cs.opacity).toFixed(2),
          visibility: cs.visibility,
          transform: cs.transform,
        };
      };
      return { title: read(span), aside: read(aside) };
    });

  // Initial: closing top sits just below the 84% trigger line.
  await page.evaluate(
    ([top]) => window.scrollTo(0, top - window.innerHeight * 0.9),
    [closeTop],
  );
  await page.waitForTimeout(500);
  const initialState = await state();
  await shot(page, "animations/gsap-initial-1440.png");

  // Mid: scroll past the trigger and capture immediately.
  await page.evaluate(
    ([top]) => window.scrollTo(0, top - window.innerHeight * 0.55),
    [closeTop],
  );
  await page.waitForTimeout(160);
  const midState = await state();
  await shot(page, "animations/gsap-mid-1440.png");

  await page.waitForTimeout(1600);
  const doneState = await state();
  await shot(page, "animations/gsap-complete-1440.png");

  await writeFile(
    path.join(root, "reports/gsap-states.json"),
    JSON.stringify({ initialState, midState, doneState }, null, 2),
  );

  await context.close();
}

// ---------------------------------------------------------------------------
// Reduced motion + no JavaScript
// ---------------------------------------------------------------------------
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const response = await page.goto(`${base}/`, { waitUntil: "networkidle" });
  await page.addStyleTag({
    content: "nextjs-portal{display:none!important}",
  });
  await page.waitForTimeout(900);
  const reduced = await page.evaluate(() => {
    const heads = Array.from(
      document.querySelectorAll("[data-lxh-head] > *"),
    ).map((node) => {
      const cs = getComputedStyle(node);
      return { opacity: Number(cs.opacity), visibility: cs.visibility };
    });
    return {
      matchesReduced: window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches,
      headCount: heads.length,
      headHidden: heads.filter(
        (h) => h.visibility !== "visible" || h.opacity < 0.99,
      ).length,
      overflowX:
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    };
  });
  await shot(page, "animations/reduced-motion-1440-full.png", {
    fullPage: true,
  });
  viewportResults.push({
    viewport: "1440 reduced-motion",
    httpStatus: response?.status() ?? null,
    ...reduced,
  });
  await context.close();
}

{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    javaScriptEnabled: false,
  });
  const page = await context.newPage();
  const response = await page.goto(`${base}/`, { waitUntil: "load" });
  await page.waitForTimeout(600);
  const noJs = await page.evaluate(() => ({
    h2Count: document.querySelectorAll("h2").length,
    registryText: document.body.innerText.includes(
      "A code confirms the model",
    ),
    productCount: document.querySelectorAll(".lxh-product").length,
    overflowX:
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  }));
  await shot(page, "animations/no-js-1440-full.png", { fullPage: true });
  viewportResults.push({
    viewport: "1440 no-js",
    httpStatus: response?.status() ?? null,
    ...noJs,
  });
  await context.close();
}

// ---------------------------------------------------------------------------
// Route + CTA checks
// ---------------------------------------------------------------------------
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${base}/`, { waitUntil: "networkidle" });

  const hrefs = await page.evaluate(() => {
    const set = new Set();
    document
      .querySelectorAll(
        ".lxh-home a[href], .lx-hero a[href], .lx-hero__range-bar a[href]",
      )
      .forEach((a) => {
        const href = a.getAttribute("href");
        if (href && href.startsWith("/")) set.add(href);
      });
    return Array.from(set).sort();
  });

  for (const href of hrefs) {
    const res = await context.request.get(`${base}${href}`, {
      maxRedirects: 0,
      failOnStatusCode: false,
    });
    routeChecks.push({
      href,
      status: res.status(),
      location: res.headers()["location"] ?? null,
    });
  }

  const robots = await context.request.get(`${base}/robots.txt`, {
    failOnStatusCode: false,
  });
  const sitemap = await context.request.get(`${base}/sitemap.xml`, {
    failOnStatusCode: false,
  });
  routeChecks.push({ href: "/robots.txt", status: robots.status() });
  routeChecks.push({ href: "/sitemap.xml", status: sitemap.status() });

  await context.close();
}

await browser.close();

const payload = {
  base,
  generatedAt: new Date().toISOString(),
  consoleErrors,
  pageErrors,
  viewports: viewportResults,
  routes: routeChecks,
  screenshots,
  screenshotCount: screenshots.length,
};

await writeFile(
  path.join(root, "reports/capture-results.json"),
  JSON.stringify(payload, null, 2),
);

console.log(
  JSON.stringify(
    {
      screenshotCount: screenshots.length,
      consoleErrors,
      pageErrors,
      viewports: viewportResults.map((v) => ({
        viewport: v.viewport,
        httpStatus: v.httpStatus,
        overflowX: v.overflowX,
        brokenImages: v.brokenImages?.length ?? null,
        headHidden: v.headHidden ?? null,
        documentHeight: v.documentHeight ?? null,
      })),
      routes: routeChecks,
    },
    null,
    2,
  ),
);
