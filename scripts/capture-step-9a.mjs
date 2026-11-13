// Step 9A capture harness for /about.
//
// Usage:
//   node scripts/capture-step-9a.mjs --base http://localhost:3000 --out artifacts/lonex-step-9a-review/wip
//
// Screenshots are taken against an already-running server. Run it against the
// production build (`next start -p 3001`) for the final package.
import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const index = argv.indexOf(`--${name}`);
  return index >= 0 ? argv[index + 1] : fallback;
};

const base = arg("base", "http://localhost:3000");
const outDir = path.resolve(arg("out", "artifacts/lonex-step-9a-review/wip"));
const prefix = arg("prefix", "about");

const VIEWPORTS = [
  { name: "1440", width: 1440, height: 900 },
  { name: "1024", width: 1024, height: 768 },
  { name: "768", width: 768, height: 1024 },
  { name: "390", width: 390, height: 844 },
  { name: "360", width: 360, height: 780 },
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
  const bodyText = normalized(document.body.innerText).toLowerCase();
  const bannedTerms = [
    "importer",
    "manufacturer",
    "distributor",
    "distribution",
    "illustrative",
    "placeholder",
    "published by",
    "approved by",
    "founded",
    "since 19",
    "since 20",
    "certified",
    "certification",
    "partnership",
    "partnered",
    "charity",
    "donation",
    "donate",
    "our team of",
  ];

  return {
    title: document.title,
    description: document
      .querySelector('meta[name="description"]')
      ?.getAttribute("content"),
    h1: normalized(document.querySelector("h1")?.textContent),
    height: document.documentElement.scrollHeight,
    overflow:
      document.documentElement.scrollWidth - document.documentElement.clientWidth,
    broken: Array.from(document.images)
      .filter((image) => image.complete && image.naturalWidth === 0)
      .map((image) => image.currentSrc || image.src),
    overflowers: Array.from(document.querySelectorAll("body *"))
      .filter((el) => {
        if (el.closest('[aria-hidden="true"]')) return false;
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
    sections: Array.from(document.querySelectorAll("section")).map((el) => ({
      id: el.id || null,
      className: String(el.className).slice(0, 80),
      height: Math.round(el.getBoundingClientRect().height),
    })),
    images: Array.from(document.images).map((image) => ({
      src: (image.currentSrc || image.src).replace(location.origin, ""),
      w: image.naturalWidth,
      h: image.naturalHeight,
      renderedW: Math.round(image.getBoundingClientRect().width),
      renderedH: Math.round(image.getBoundingClientRect().height),
    })),
    banned: bannedTerms.filter((term) => bodyText.includes(term)),
    links: document.querySelectorAll("a[href]").length,
    visibleFooter: Boolean(document.querySelector(".site-footer")),
  };
};

await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const report = {
  base,
  generatedAt: new Date().toISOString(),
  pages: [],
  reducedMotion: [],
};

for (const viewport of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  attachDiagnostics(page, consoleErrors, pageErrors, failedRequests);

  let status = 0;
  try {
    const response = await page.goto(`${base}/about`, {
      waitUntil: "load",
      timeout: 90000,
    });
    status = response?.status() ?? 0;
    await settle(page);

    // The dev server's floating indicator is not part of the page.
    await page.addStyleTag({
      content: "nextjs-portal { display: none !important; }",
    });

    const heroFile = path.join(outDir, `${prefix}-hero-${viewport.name}.png`);
    await page.screenshot({ path: heroFile });

    const fullFile = path.join(outDir, `${prefix}-${viewport.name}.png`);
    await page.screenshot({ path: fullFile, fullPage: true });

    const metrics = await page.evaluate(metricsFor());
    report.pages.push({
      viewport: viewport.name,
      route: "/about",
      files: [
        path.relative(process.cwd(), heroFile),
        path.relative(process.cwd(), fullFile),
      ],
      status,
      consoleErrors,
      pageErrors,
      failedRequests,
      ...metrics,
    });
    console.log(
      `${viewport.name} -> ${status} h=${metrics.height} overflow=${metrics.overflow} broken=${metrics.broken.length} banned=${metrics.banned.join(",") || "none"} h1=${metrics.h1}`,
    );
  } catch (error) {
    report.pages.push({
      viewport: viewport.name,
      route: "/about",
      status,
      error: String(error).slice(0, 500),
    });
    console.log(`${viewport.name} -> ERROR ${String(error).slice(0, 300)}`);
  }

  await page.close();
  await context.close();
}

// Reduced motion: the page must be fully visible without GSAP entrance states.
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(`${base}/about`, { waitUntil: "load", timeout: 90000 });
  await sleep(1400);

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
    path: path.join(outDir, `${prefix}-reduced-1440.png`),
  });
  report.reducedMotion.push({ route: "/about", ...check });
  console.log(
    `reduced-motion -> hidden=${check.hidden.length} h1Opacity=${check.h1Opacity}`,
  );
  await context.close();
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
    page.error ||
    page.overflow > 1 ||
    (page.broken?.length ?? 0) > 0 ||
    (page.pageErrors?.length ?? 0) > 0 ||
    (page.consoleErrors?.length ?? 0) > 0 ||
    (page.failedRequests?.length ?? 0) > 0 ||
    (page.banned?.length ?? 0) > 0,
);

const problemMotion = report.reducedMotion.filter(
  (entry) => entry.hidden.length > 0 || entry.h1Opacity !== "1",
);

console.log(
  `\n${problemPages.length === 0 ? "PASS" : "ISSUES"} — ${problemPages.length} of ${report.pages.length} page checks flagged`,
);
console.log(
  `${problemMotion.length === 0 ? "PASS" : "ISSUES"} — ${problemMotion.length} of ${report.reducedMotion.length} reduced-motion checks flagged`,
);
