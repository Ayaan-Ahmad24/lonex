// Step 7 capture + QA harness.
//
// Usage:
//   node scripts/capture-step-7.mjs --label before --out artifacts/lonex-step-7-review/before
//   node scripts/capture-step-7.mjs --label after  --out artifacts/lonex-step-7-review/after
//
// Scrolls the whole page first: GSAP reveals start at opacity 0 and images are
// lazy, so a full-page screenshot taken at scrollY 0 would be mostly white.
import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const index = argv.indexOf(`--${name}`);
  return index >= 0 ? argv[index + 1] : fallback;
};

const label = arg("label", "after");
const outDir = path.resolve(arg("out", `artifacts/lonex-step-7-review/${label}`));
const base = arg("base", "http://localhost:3000");
const quick = argv.includes("--quick");

const VIEWPORTS = quick
  ? [
      { name: "1440", width: 1440, height: 900 },
      { name: "390", width: 390, height: 844 },
    ]
  : [
      { name: "1440", width: 1440, height: 900 },
      { name: "1024", width: 1024, height: 768 },
      { name: "768", width: 768, height: 1024 },
      { name: "390", width: 390, height: 844 },
      { name: "360", width: 360, height: 780 },
    ];

const ROUTES = [
  { slug: "solar", path: "/solar" },
  { slug: "batteries", path: "/batteries" },
  { slug: "ev-bikes", path: "/ev-bikes" },
  { slug: "solar-module", path: "/solar/solar-module" },
  { slug: "solar-panel", path: "/solar/solar-panel" },
  { slug: "home-battery", path: "/batteries/home-battery" },
  { slug: "hybrid-inverter", path: "/batteries/hybrid-inverter" },
  { slug: "electric-bike", path: "/ev-bikes/electric-bike" },
  { slug: "electric-commuter-bike", path: "/ev-bikes/electric-commuter-bike" },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function settle(page) {
  await page.evaluate(async () => {
    const step = Math.max(240, Math.round(window.innerHeight * 0.6));
    const height = document.body.scrollHeight;
    for (let y = 0; y < height; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 90));
    }
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise((resolve) => setTimeout(resolve, 500));
    window.scrollTo(0, 0);
  });
  await sleep(1400);
  // Second pass: lazy images below the fold requested on the first sweep.
  await page.evaluate(async () => {
    const step = Math.max(320, Math.round(window.innerHeight * 0.8));
    const height = document.body.scrollHeight;
    for (let y = 0; y < height; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
    window.scrollTo(0, 0);
  });
  await sleep(900);
}

await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const report = { label, base, generatedAt: new Date().toISOString(), pages: [] };

for (const viewport of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
  });

  for (const route of ROUTES) {
    const page = await context.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    const failedRequests = [];

    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text().slice(0, 300));
    });
    page.on("pageerror", (error) => pageErrors.push(String(error).slice(0, 300)));
    page.on("requestfailed", (request) => {
      const failure = request.failure()?.errorText ?? "";
      if (!failure.includes("ERR_ABORTED")) {
        failedRequests.push(`${request.url()} :: ${failure}`);
      }
    });

    let status = 0;
    try {
      const response = await page.goto(`${base}${route.path}`, {
        waitUntil: "load",
        timeout: 90000,
      });
      status = response?.status() ?? 0;
      await settle(page);

      const file = path.join(outDir, `${route.slug}-${viewport.name}.png`);
      await page.screenshot({ path: file, fullPage: true });

      const metrics = await page.evaluate(() => {
        const visible = (el) => {
          const rect = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);
          return (
            rect.width > 1 &&
            rect.height > 1 &&
            style.visibility !== "hidden" &&
            style.display !== "none"
          );
        };

        const broken = Array.from(document.images)
          .filter((image) => image.complete && image.naturalWidth === 0)
          .map((image) => ({
            src: image.currentSrc || image.src,
            width: image.clientWidth,
            height: image.clientHeight,
          }));

        const hiddenProductImages = Array.from(
          document.querySelectorAll("[data-product-image] img"),
        )
          .filter((image) => image.clientWidth < 120 || image.clientHeight < 120)
          .map((image) => ({
            src: image.currentSrc || image.src,
            width: image.clientWidth,
            height: image.clientHeight,
          }));

        const productImages = Array.from(
          document.querySelectorAll("[data-product-image] img"),
        ).map((image) => ({
          src: image.currentSrc || image.src,
          width: image.clientWidth,
          height: image.clientHeight,
          loaded: image.complete && image.naturalWidth > 0,
        }));

        const overflowers = Array.from(document.querySelectorAll("body *"))
          .filter((el) => visible(el))
          .filter((el) => {
            const rect = el.getBoundingClientRect();
            return rect.right > document.documentElement.clientWidth + 2;
          })
          .slice(0, 8)
          .map((el) => ({
            tag: el.tagName.toLowerCase(),
            className: String(el.className).slice(0, 120),
            right: Math.round(el.getBoundingClientRect().right),
          }));

        return {
          title: document.title,
          h1: document.querySelector("h1")?.textContent?.trim() ?? null,
          height: document.documentElement.scrollHeight,
          overflow:
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
          broken,
          hiddenProductImages,
          productImages,
          overflowers,
          visibleFooter: Boolean(document.querySelector(".site-footer")),
          footerColumns: document.querySelectorAll(".site-footer__col").length,
          links: document.querySelectorAll("a[href]").length,
        };
      });

      report.pages.push({
        viewport: viewport.name,
        route: route.path,
        file: path.relative(process.cwd(), file),
        status,
        consoleErrors,
        pageErrors,
        failedRequests,
        ...metrics,
      });
      console.log(
        `${viewport.name} ${route.path} -> ${status} h=${metrics.height} overflow=${metrics.overflow} broken=${metrics.broken.length} hiddenProductImages=${metrics.hiddenProductImages.length}`,
      );
    } catch (error) {
      report.pages.push({
        viewport: viewport.name,
        route: route.path,
        status,
        error: String(error).slice(0, 500),
      });
      console.log(`${viewport.name} ${route.path} -> ERROR ${String(error).slice(0, 200)}`);
    }

    await page.close();
  }

  await context.close();
}

// A focused footer capture at each width. A fresh context per viewport keeps
// memory flat; element screenshots of a very tall footer used to crash the
// shared context at small widths.
for (const viewport of VIEWPORTS) {
  const footerContext = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
  });
  const page = await footerContext.newPage();
  await page.goto(`${base}/`, { waitUntil: "load", timeout: 90000 });

  // The sticky header is painted over the element capture when the footer is
  // taller than the viewport. It is not part of the footer, so remove it for
  // this focused shot only.
  await page.addStyleTag({
    content: ".site-header { display: none !important; }",
  });

  const footer = page.locator(".site-footer");

  // Scroll straight to the footer, then give the reveal and lazy images a
  // moment. No full-page sweep is needed for an element capture.
  await footer.scrollIntoViewIfNeeded();
  await sleep(1200);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(1200);

  const file = path.join(outDir, `footer-${viewport.name}.png`);
  await footer.screenshot({ path: file });
  console.log(`footer ${viewport.name} -> ${path.relative(process.cwd(), file)}`);
  await footerContext.close();
}

await browser.close();

await fs.writeFile(
  path.join(outDir, "qa-report.json"),
  JSON.stringify(report, null, 2),
  "utf8",
);

const problemPages = report.pages.filter(
  (page) =>
    page.status !== 200 ||
    page.overflow > 1 ||
    (page.broken?.length ?? 0) > 0 ||
    (page.pageErrors?.length ?? 0) > 0 ||
    (page.consoleErrors?.length ?? 0) > 0 ||
    (page.hiddenProductImages?.length ?? 0) > 0,
);

console.log(
  `\n${problemPages.length === 0 ? "PASS" : "ISSUES"} — ${problemPages.length} of ${report.pages.length} page checks flagged`,
);
