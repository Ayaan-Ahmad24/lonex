// Step 8 capture + QA harness for /verify and /authorized-sellers.
//
// Usage:
//   node scripts/capture-step-8.mjs
//   node scripts/capture-step-8.mjs --base http://localhost:3001 --out artifacts/lonex-step-8-review/final
//
// Screenshots are taken against an already-running server. Run this against the
// production build (`next start -p 3001`) for clean hero captures without the
// development indicator. Verification state screenshots are produced separately
// by scripts/qa-verify-states.mjs because they temporarily change the QA digest.
import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const index = argv.indexOf(`--${name}`);
  return index >= 0 ? argv[index + 1] : fallback;
};

const base = arg("base", "http://localhost:3000");
const outDir = path.resolve(arg("out", "artifacts/lonex-step-8-review/final"));
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
  {
    slug: "verify",
    path: "/verify",
    headline: "Every Model Has an Identity.",
    element: null,
  },
  {
    slug: "sellers",
    path: "/authorized-sellers",
    headline: "Find Your LONEX Connection.",
    element: { selector: "#directory", name: "sellers-directory" },
  },
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

function attachDiagnostics(page, consoleErrors, pageErrors, failedRequests) {
  page.on("console", (message) => {
    if (message.type() === "error") {
      const text = message.text().slice(0, 300);
      if (!text.includes("favicon")) consoleErrors.push(text);
    }
  });
  page.on("pageerror", (error) => pageErrors.push(String(error).slice(0, 300)));
  page.on("requestfailed", (request) => {
    const failure = request.failure()?.errorText ?? "";
    if (!failure.includes("ERR_ABORTED")) {
      failedRequests.push(`${request.url()} :: ${failure}`);
    }
  });
}

const metricsFor = () => () => {
  const normalized = (value) => (value ?? "").replace(/\s+/g, " ").trim();

  return {
    title: document.title,
    h1: normalized(document.querySelector("h1")?.textContent),
    height: document.documentElement.scrollHeight,
    overflow:
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
    broken: Array.from(document.images)
      .filter((image) => image.complete && image.naturalWidth === 0)
      .map((image) => image.currentSrc || image.src),
    overflowers: Array.from(document.querySelectorAll("body *"))
      .filter((el) => {
        if (el.closest('[aria-hidden="true"]')) {
          return false;
        }
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return (
          rect.width > 1 &&
          rect.height > 1 &&
          style.visibility !== "hidden" &&
          style.display !== "none" &&
          rect.right > document.documentElement.clientWidth + 2
        );
      })
      .slice(0, 8)
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        className: String(el.className).slice(0, 120),
        right: Math.round(el.getBoundingClientRect().right),
      })),
    visibleFooter: Boolean(document.querySelector(".site-footer")),
    links: document.querySelectorAll("a[href]").length,
    verificationForm: Boolean(document.querySelector("#code")),
    sellerDirectory: Boolean(
      document.querySelector("#directory") ||
        document.querySelector(".lxs-empty"),
    ),
    emptyState: Boolean(document.querySelector(".lxs-empty")),
  };
};

await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const report = {
  base,
  generatedAt: new Date().toISOString(),
  pages: [],
  links: [],
  reducedMotion: [],
  stateArtifacts: [
    "states/state-loading-1440.png",
    "states/state-success-1440.png",
    "states/state-success-1440-viewport.png",
    "states/state-success-390.png",
    "states/state-success-360.png",
    "states/state-error-1440.png",
    "states/state-error-390.png",
    "states/state-unavailable-1440.png",
    "states/state-throttled-1440.png",
  ],
};

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
    attachDiagnostics(page, consoleErrors, pageErrors, failedRequests);

    let status = 0;
    try {
      const response = await page.goto(`${base}${route.path}`, {
        waitUntil: "load",
        timeout: 90000,
      });
      status = response?.status() ?? 0;
      await settle(page);

      const heroFile = path.join(
        outDir,
        `${route.slug}-hero-${viewport.name}.png`,
      );
      await page.screenshot({ path: heroFile });

      const fullFile = path.join(outDir, `${route.slug}-${viewport.name}.png`);
      await page.screenshot({ path: fullFile, fullPage: true });

      if (route.element) {
        await page.locator(route.element.selector).scrollIntoViewIfNeeded();
        await sleep(600);
        const elementFile = path.join(
          outDir,
          `${route.element.name}-${viewport.name}.png`,
        );
        await page.locator(route.element.selector).screenshot({
          path: elementFile,
        });
      }

      const metrics = await page.evaluate(metricsFor());
      const normalized = (value) => (value ?? "").replace(/\s+/g, " ").trim();
      report.pages.push({
        viewport: viewport.name,
        route: route.path,
        files: [
          path.relative(process.cwd(), heroFile),
          path.relative(process.cwd(), fullFile),
        ],
        status,
        h1Matches: normalized(metrics.h1) === route.headline,
        consoleErrors,
        pageErrors,
        failedRequests,
        ...metrics,
      });
      console.log(
        `${viewport.name} ${route.path} -> ${status} h=${metrics.height} overflow=${metrics.overflow} broken=${metrics.broken.length} h1=${normalized(metrics.h1) === route.headline}`,
      );
    } catch (error) {
      report.pages.push({
        viewport: viewport.name,
        route: route.path,
        status,
        error: String(error).slice(0, 500),
      });
      console.log(
        `${viewport.name} ${route.path} -> ERROR ${String(error).slice(0, 200)}`,
      );
    }

    await page.close();
  }

  await context.close();
}

// Internal links advertised on either page. Resolved once each.
const linkPaths = new Set();
for (const route of ROUTES) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  await page.goto(`${base}${route.path}`, { waitUntil: "load", timeout: 90000 });
  const hrefs = await page.evaluate(() =>
    Array.from(document.querySelectorAll("a[href^='/']"))
      .map((anchor) => anchor.getAttribute("href"))
      .filter(Boolean),
  );
  hrefs.forEach((href) => linkPaths.add(href.split("#")[0]));
  await context.close();
}

const linkContext = await browser.newContext();
for (const href of [...linkPaths].sort()) {
  const response = await linkContext.request.get(`${base}${href}`, {
    maxRedirects: 0,
    failOnStatusCode: false,
  });
  report.links.push({ href, status: response.status() });
}
await linkContext.close();

// Reduced motion: content must be fully visible without GSAP entrance states.
for (const route of ROUTES) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(`${base}${route.path}`, { waitUntil: "load", timeout: 90000 });
  await sleep(1200);

  const check = await page.evaluate(() => {
    const elements = Array.from(
      document.querySelectorAll(
        "[data-hero-item], [data-hero-line], [data-reveal], [data-reveal-image]",
      ),
    );
    const hidden = elements
      .filter((el) => {
        const style = window.getComputedStyle(el);
        return style.opacity !== "1" || style.visibility === "hidden";
      })
      .slice(0, 10)
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        className: String(el.className).slice(0, 100),
        opacity: window.getComputedStyle(el).opacity,
      }));

    const h1 = document.querySelector("h1");
    return {
      h1Opacity: h1 ? window.getComputedStyle(h1).opacity : null,
      hidden,
    };
  });

  await page.screenshot({
    path: path.join(outDir, `${route.slug}-reduced-1440.png`),
  });
  report.reducedMotion.push({ route: route.path, ...check });
  console.log(
    `reduced-motion ${route.path} -> hidden=${check.hidden.length} h1Opacity=${check.h1Opacity}`,
  );
  await context.close();
}

await browser.close();

await fs.writeFile(
  path.join(outDir, "qa-report.json"),
  JSON.stringify(report, null, 2),
  "utf8",
);
await fs.writeFile(
  path.resolve("artifacts/lonex-step-8-review/qa-report.json"),
  JSON.stringify(report, null, 2),
  "utf8",
);

const problemPages = report.pages.filter(
  (page) =>
    page.status !== 200 ||
    page.error ||
    page.overflow > 1 ||
    (page.broken?.length ?? 0) > 0 ||
    (page.pageErrors?.length ?? 0) > 0 ||
    (page.consoleErrors?.length ?? 0) > 0 ||
    (page.failedRequests?.length ?? 0) > 0 ||
    page.h1Matches === false,
);

const problemLinks = report.links.filter(
  (link) => link.status >= 400 && link.status !== 401 && link.status !== 403,
);
const problemMotion = report.reducedMotion.filter(
  (entry) => entry.hidden.length > 0 || entry.h1Opacity !== "1",
);

console.log(
  `\n${problemPages.length === 0 ? "PASS" : "ISSUES"} — ${problemPages.length} of ${report.pages.length} page checks flagged`,
);
console.log(
  `${problemLinks.length === 0 ? "PASS" : "ISSUES"} — ${problemLinks.length} of ${report.links.length} links flagged`,
);
console.log(
  `${problemMotion.length === 0 ? "PASS" : "ISSUES"} — ${problemMotion.length} of ${report.reducedMotion.length} reduced-motion checks flagged`,
);
