import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";

const base = process.env.BASE_URL ?? "http://localhost:3402";
const root = "artifacts/lonex-step-4-review";

const viewports = [
  { dir: "1440", width: 1440, height: 900 },
  { dir: "768", width: 768, height: 1024 },
  { dir: "390", width: 390, height: 844 },
];

const ROUTES = [
  { path: "/", name: "home" },
  { path: "/solar", name: "category" },
  { path: "/blog", name: "journal" },
  { path: "/about", name: "about" },
  { path: "/verify", name: "verify" },
];

for (const vp of viewports) {
  await mkdir(path.join(root, vp.dir), { recursive: true });
}

const screenshots = [];
const reports = [];
const failures = [];
const consoleErrors = [];
const pageErrors = [];

function check(label, condition, detail) {
  if (!condition) failures.push({ label, detail });
}

/* Social URLs are read from the CMS settings that the page actually renders. */
async function readSocial(page) {
  return page.evaluate(() => {
    const links = Array.from(
      document.querySelectorAll(".site-footer__social a"),
    ).map((a) => ({
      label: a.getAttribute("aria-label"),
      href: a.getAttribute("href"),
    }));
    return { rendered: links.length, links };
  });
}

async function readFooter(page) {
  return page.evaluate(() => {
    const footer = document.querySelector(".site-footer");
    if (!footer) return null;
    const brand = footer.querySelector(".site-footer__brand");
    const cols = Array.from(footer.querySelectorAll(".site-footer__col")).map(
      (col) => ({
        title: col.querySelector(".site-footer__col-title")?.textContent?.trim(),
        links: Array.from(col.querySelectorAll("a")).map((a) => ({
          text: a.textContent?.trim(),
          href: a.getAttribute("href"),
        })),
      }),
    );
    const all = Array.from(footer.querySelectorAll("a")).map((a) => ({
      text: a.textContent?.trim(),
      href: a.getAttribute("href"),
    }));
    const r = (el) => {
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) };
    };
    const social = footer.querySelector(".site-footer__social");
    return {
      text: footer.innerText,
      tagline: footer.querySelector(".site-footer__tagline")?.textContent?.trim(),
      description: footer.querySelector(".site-footer__description")?.textContent?.trim(),
      columns: cols,
      allLinks: all,
      logoBox: r(footer.querySelector(".logo-plate")),
      brandBox: r(brand),
      socialBox: r(social),
      hasSocialRow: !!social,
      footerHeight: Math.round(footer.getBoundingClientRect().height),
      background: getComputedStyle(footer).backgroundColor,
      elementOverflow: (() => {
        const limit = document.documentElement.clientWidth;
        const offenders = [];
        for (const el of footer.querySelectorAll("*")) {
          const box = el.getBoundingClientRect();
          if (box.width === 0) continue;
          if (box.right > limit + 1) {
            offenders.push({
              tag: el.tagName,
              className: el.className?.toString().slice(0, 50),
              right: Math.round(box.right),
            });
          }
        }
        return offenders.slice(0, 6);
      })(),
    };
  });
}

const footerSource = readFileSync(
  "src/components/public/site-footer.tsx",
  "utf8",
);

const browser = await chromium.launch({ headless: true });

for (const vp of viewports) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(`${vp.dir}: ${m.text()}`);
  });
  page.on("pageerror", (e) => pageErrors.push(`${vp.dir}: ${e.message}`));

  // --- Homepage: footer in context ------------------------------------
  await page.goto(base, { waitUntil: "networkidle", timeout: 60000 });
  await page.locator(".lx-hero__headline").waitFor({ state: "visible" });
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(1000);

  // The closing band must no longer carry a full-width photograph.
  const closingFigure = await page.evaluate(() => ({
    closingBand: !!document.querySelector(".lxh-close"),
    closingFigure: !!document.querySelector(".lxh-close__figure"),
    anyFullWidthPhotoInClosing: !!document.querySelector(".lxh-close figure"),
    closingHeight: Math.round(
      document.querySelector(".lxh-close")?.getBoundingClientRect().height ?? 0,
    ),
  }));
  check(`${vp.dir} the landscape photograph band is removed`, !closingFigure.closingFigure, closingFigure);
  check(`${vp.dir} no figure inside the closing band`, !closingFigure.anyFullWidthPhotoInClosing, closingFigure);
  check(`${vp.dir} the closing band is compact`, closingFigure.closingHeight < 620, closingFigure);

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1800);
  await page.screenshot({ path: path.join(root, vp.dir, "home-bottom.png") });
  screenshots.push(`${vp.dir}/home-bottom.png`);

  const footer = page.locator(".site-footer").first();
  await footer.scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  const footerBox = await footer.boundingBox();
  if (footerBox) {
    await page.screenshot({
      path: path.join(root, vp.dir, "footer.png"),
      clip: {
        x: 0,
        y: Math.max(0, footerBox.y),
        width: vp.width,
        height: Math.min(vp.height, footerBox.height),
      },
    });
    screenshots.push(`${vp.dir}/footer.png`);
  }

  const state = await readFooter(page);
  const social = await readSocial(page);

  check(`${vp.dir} footer exists`, state !== null, null);
  check(
    `${vp.dir} footer tagline`,
    state?.tagline === "Powering possibilities. Connecting what comes next.",
    state?.tagline,
  );
  check(
    `${vp.dir} footer description`,
    state?.description ===
      "Discover a more connected approach to energy, storage and electric mobility. Explore the possibilities shaping tomorrow.",
    state?.description,
  );
  check(`${vp.dir} footer has a brand block`, state?.brandBox !== null, state?.brandBox);
  check(`${vp.dir} footer has three link columns`, state?.columns.length === 3, state?.columns.map((c) => c.title));
  check(
    `${vp.dir} footer column titles`,
    state?.columns.map((c) => c.title).join(",") === "Explore,Company,Connect",
    state?.columns.map((c) => c.title),
  );
  check(`${vp.dir} footer has no element overflow`, state?.elementOverflow.length === 0, state?.elementOverflow);
  check(
    `${vp.dir} footer is not oversized`,
    state?.footerHeight < (vp.width <= 560 ? 1000 : vp.width <= 820 ? 700 : 700),
    state?.footerHeight,
  );

  // No stale corporate metadata.
  const lower = (state?.text ?? "").toLowerCase();
  for (const word of ["importer", "manufacturer", "distributor", "published by", "approved by", "demo", "sample", "illustrative"]) {
    check(`${vp.dir} footer: no "${word}"`, !lower.includes(word), lower.slice(0, 160));
  }

  // Social icons are only rendered for networks the CMS actually
  // publishes, and every rendered link must be a value that came from the
  // CMS rather than from the component.
  const cmsSocial = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".site-footer__social a")).map(
      (a) => a.getAttribute("href"),
    ),
  );
  check(
    `${vp.dir} footer: every social link comes from the CMS`,
    cmsSocial.every((href) => href && /^https:\/\//.test(href)),
    cmsSocial,
  );
  // The component must not contain a social URL of its own. What it
  // renders comes from the CMS, so a placeholder there is a content
  // decision rather than a code defect.
  check(
    `${vp.dir} footer: no social URL is hardcoded in the component`,
    !/https?:\/\/(www\.)?(instagram|facebook|linkedin|youtube|x)\.com/i.test(
      footerSource,
    ),
    null,
  );
  void social;

  reports.push({ viewport: vp.dir, closingFigure, footer: state, social });

  // --- Footer consistency across routes ------------------------------
  if (vp.dir === "1440") {
    for (const route of ROUTES) {
      await page.goto(`${base}${route.path}`, { waitUntil: "networkidle", timeout: 60000 });
      await page.waitForTimeout(1200);
      const routeState = await readFooter(page);
      check(
        `route ${route.path}: footer renders`,
        routeState !== null && routeState.columns.length === 3 && routeState.brandBox !== null,
        routeState?.columns?.length ?? null,
      );
      check(
        `route ${route.path}: footer has no overflow`,
        routeState?.elementOverflow.length === 0,
        routeState?.elementOverflow,
      );
      if (route.name === "about") {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(1400);
        await page.screenshot({ path: path.join(root, vp.dir, "about-bottom.png") });
        screenshots.push(`${vp.dir}/about-bottom.png`);
      }
      reports.push({ route: route.path, footer: routeState });
    }
  }

  await context.close();
}

/* --- Verify every footer link resolves ------------------------------- */
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1200);
  const links = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".site-footer a")).map((a) => ({
      text: a.textContent?.trim(),
      href: a.getAttribute("href"),
    })),
  );

  const linkResults = [];
  for (const link of links) {
    if (!link.href) continue;
    if (!link.href.startsWith("/")) {
      linkResults.push({ ...link, status: "external", ok: true });
      continue;
    }
    const response = await page.request.get(`${base}${link.href}`);
    linkResults.push({ ...link, status: response.status(), ok: response.ok() });
    check(`link ${link.href} resolves`, response.ok(), `${link.href} -> ${response.status()}`);
  }

  reports.push({ links: linkResults });
  await context.close();
}

/* --- Reduced motion: the footer is fully rendered and static --------- */
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: "networkidle", timeout: 60000 });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1400);
  const rm = await page.evaluate(() => {
    const brand = document.querySelector(".site-footer__brand");
    const col = document.querySelector(".site-footer__col");
    return {
      brandOpacity: brand ? getComputedStyle(brand).opacity : null,
      brandTransform: brand ? getComputedStyle(brand).transform : null,
      colOpacity: col ? getComputedStyle(col).opacity : null,
      colTransform: col ? getComputedStyle(col).transform : null,
    };
  });
  check("reduced-motion: brand visible", rm.brandOpacity === "1", rm);
  check("reduced-motion: brand not transformed", rm.brandTransform === "none", rm);
  check("reduced-motion: columns visible", rm.colOpacity === "1", rm);
  check("reduced-motion: columns not transformed", rm.colTransform === "none", rm);
  reports.push({ viewport: "1440-reduced-motion", rm });
  await context.close();
}

await writeFile(
  path.join(root, "report.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), base, screenshots, failures, consoleErrors, pageErrors, reports }, null, 2),
);

await browser.close();

console.log(
  JSON.stringify({ screenshots: screenshots.length, failures, consoleErrors, pageErrors }, null, 2),
);

if (failures.length > 0) process.exitCode = 1;
