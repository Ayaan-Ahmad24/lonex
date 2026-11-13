import { chromium } from "playwright";
import { mkdir, writeFile, rename } from "node:fs/promises";
import path from "node:path";

const base = process.env.BASE_URL ?? "http://localhost:3402";
const root = "artifacts/lonex-step-5r-review";

const viewports = [
  { dir: "1440", width: 1440, height: 900 },
  { dir: "1024", width: 1024, height: 800 },
  { dir: "768", width: 768, height: 1024 },
  { dir: "390", width: 390, height: 844 },
  { dir: "360", width: 360, height: 800 },
];

const videoDir = path.join(process.cwd(), "artifacts", "lonex-step-5r-review", "_video");

for (const vp of viewports) {
  await mkdir(path.join(root, vp.dir), { recursive: true });
}
await mkdir(path.join(root, "reduced-motion"), { recursive: true });
await mkdir(videoDir, { recursive: true });

const screenshots = [];
const reports = [];
const failures = [];
const consoleErrors = [];
const pageErrors = [];

function check(label, condition, detail) {
  if (!condition) failures.push({ label, detail });
}

async function shot(page, relPath, clip) {
  const buffer = await page.screenshot({ type: "png", ...(clip ? { clip } : {}) });
  await writeFile(path.join(root, relPath), buffer);
  screenshots.push(relPath.replaceAll("\\", "/"));
}

async function shotElement(page, selector, relPath, pad = 10) {
  const el = page.locator(selector).first();
  if ((await el.count()) === 0) {
    check(`${relPath}: ${selector} missing`, false, null);
    return;
  }
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  const box = await el.boundingBox();
  if (!box) {
    check(`${relPath}: ${selector} has no box`, false, null);
    return;
  }
  const x0 = Math.max(0, box.x - pad);
  const y0 = Math.max(0, box.y - pad);
  await shot(page, relPath, {
    x: x0,
    y: y0,
    width: Math.min(page.viewportSize().width - x0, box.width + pad * 2),
    height: Math.min(page.viewportSize().height - y0, box.height + pad * 2),
  });
}

/** The Move band: the photograph must travel while the copy stays put. */
async function measureMove(page) {
  return page.evaluate(async () => {
    const frame = document.querySelector('[data-lxh-parallax="move"]');
    if (!frame) return null;
    const image = frame.querySelector("img");
    // The copy is a sibling of the frame, not a child of it.
    const copy = frame.closest(".lxh-chapter")?.querySelector(".lxh-chapter__copy");
    if (!image || !copy) return null;

    const readImage = () => {
      const m = new DOMMatrixReadOnly(getComputedStyle(image).transform);
      return { y: Math.round(m.m42 * 100) / 100, scale: Math.round(m.a * 1000) / 1000 };
    };
    // The copy position is measured against the band, not the viewport, so
    // the page scroll does not register as movement.
    const readCopy = () => {
      const c = copy.getBoundingClientRect();
      const f = frame.getBoundingClientRect();
      return {
        offsetX: Math.round(c.x - f.x),
        offsetY: Math.round(c.y - f.y),
      };
    };

    const absTop = frame.getBoundingClientRect().top + window.scrollY;
    const frameHeight = frame.getBoundingClientRect().height;
    const viewport = window.innerHeight;

    // The trigger runs from "top bottom" to "bottom top", so the full range
    // is the frame height plus one viewport.
    window.scrollTo(0, Math.max(0, absTop - viewport));
    await new Promise((r) => setTimeout(r, 900));
    const startImage = readImage();
    const startCopy = readCopy();

    window.scrollTo(0, absTop + frameHeight);
    await new Promise((r) => setTimeout(r, 1100));
    const endImage = readImage();
    const endCopy = readCopy();

    return {
      frameHeight: Math.round(frameHeight),
      startImage,
      endImage,
      startCopy,
      endCopy,
      imageTravel: Math.round((endImage.y - startImage.y) * 100) / 100,
      copyShift: Math.round(
        Math.hypot(
          endCopy.offsetX - startCopy.offsetX,
          endCopy.offsetY - startCopy.offsetY,
        ) * 100,
      ) / 100,
      scale: endImage.scale,
    };
  });
}

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

  await page.goto(base, { waitUntil: "networkidle", timeout: 60000 });
  await page.locator(".lx-hero__headline").waitFor({ state: "visible" });
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(1800);

  /* ---------- Public content audit ---------- */

  const publicText = await page.evaluate(() =>
    document.body.innerText.replace(/\s+/g, " "),
  );

  for (const word of [
    "DEMO",
    "Illustrative demo",
    "Illustrative imagery",
    "Illustrative visual",
    "Sample article",
    "Sample content",
    "Sample editorial",
    "Demo record",
    "Published by LONEX",
    "Confirmed by the seller",
    "seller has approved",
  ]) {
    check(
      `${vp.dir} public copy: no "${word}"`,
      !publicText.toLowerCase().includes(word.toLowerCase()),
      publicText.slice(0, 200),
    );
  }

  /* Section numbering must be gone. */
  const numbering = await page.evaluate(() => {
    const found = [];
    for (const el of document.querySelectorAll(".lxh-eyebrow, .lx-hero__eyebrow")) {
      const text = el.textContent?.trim() ?? "";
      if (/^\d{2}\b/.test(text)) found.push(text);
      if (el.querySelector(".lx-hero__eyebrow-index")) {
        const index = el.querySelector(".lx-hero__eyebrow-index")?.textContent?.trim();
        if (/^\d{2}$/.test(index ?? "")) found.push(text);
      }
    }
    const tabs = Array.from(document.querySelectorAll(".lx-hero__tab-index")).map(
      (el) => el.textContent?.trim(),
    );
    return { found, tabs };
  });
  check(`${vp.dir} public copy: no section numbering`, numbering.found.length === 0, numbering.found);
  check(`${vp.dir} hero: slide index removed`, numbering.tabs.length === 0, numbering.tabs);

  /* ---------- The Move parallax ---------- */

  const move = await measureMove(page);
  check(`${vp.dir} move: the band exists`, move !== null, move);

  if (move) {
    const isPhone = vp.width <= 560;
    const minTravel = isPhone ? 25 : 90;
    const maxTravel = isPhone ? 35 : 120;
    check(
      `${vp.dir} move: background travel in range`,
      move.imageTravel >= minTravel && move.imageTravel <= maxTravel,
      move,
    );
    check(
      `${vp.dir} move: foreground stays stationary`,
      move.copyShift <= 2,
      move,
    );
    check(
      `${vp.dir} move: image is scaled to hide the travel`,
      move.scale >= 1.12,
      move,
    );
  }

  /* Before, during and after the Move parallax. */
  const moveFrame = page.locator('[data-lxh-parallax="move"]').first();
  if ((await moveFrame.count()) > 0) {
    const absTop = await moveFrame.evaluate(
      (el) => el.getBoundingClientRect().top + window.scrollY,
    );
    await page.evaluate((top) => window.scrollTo(0, top - 900), absTop);
    await page.waitForTimeout(900);
    await shot(page, `${vp.dir}/move-1-before.png`);

    await page.evaluate((top) => window.scrollTo(0, top - 220), absTop);
    await page.waitForTimeout(900);
    await shot(page, `${vp.dir}/move-2-during.png`);

    await page.evaluate((top) => window.scrollTo(0, top + 120), absTop);
    await page.waitForTimeout(900);
    await shot(page, `${vp.dir}/move-3-after.png`);
  }

  /* ---------- Section captures ---------- */

  await shotElement(page, ".lxh-story-section", `${vp.dir}/about.png`);
  await shotElement(page, ".lxh-products", `${vp.dir}/products.png`);
  await shotElement(page, ".lxh-sellers", `${vp.dir}/sellers.png`);
  await shotElement(page, ".lxh-journal", `${vp.dir}/journal.png`);
  await shotElement(page, ".site-footer", `${vp.dir}/footer.png`);

  /* The About photograph on its own. */
  const storyMedia = page.locator(".lxh-story__media").first();
  if ((await storyMedia.count()) > 0) {
    await storyMedia.scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    const box = await storyMedia.boundingBox();
    if (box) {
      await shot(page, `${vp.dir}/about-photograph.png`, {
        x: Math.max(0, box.x - 6),
        y: Math.max(0, box.y - 6),
        width: Math.min(vp.width, box.width + 12),
        height: Math.min(vp.height, box.height + 12),
      });
    }
  }

  /* ---------- Full page ---------- */

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(700);
  await shot(page, `${vp.dir}/full-page.png`);

  /* ---------- Layout and link integrity ---------- */

  const layout = await page.evaluate(() => {
    const offenders = [];
    for (const el of document.querySelectorAll("body *")) {
      const box = el.getBoundingClientRect();
      if (box.width === 0) continue;
      if (box.right > document.documentElement.clientWidth + 1) {
        if (el.closest("[data-lxh-parallax]")) continue;
        // The hero stage is deliberately oversized so the background can
        // drift; the hero clips it.
        if (el.closest(".lx-hero")) continue;
        if (el.closest(".site-header")) continue;
        offenders.push({
          tag: el.tagName,
          className: el.className?.toString().slice(0, 50),
          right: Math.round(box.right),
        });
      }
    }
    const broken = Array.from(document.images)
      .filter((img) => img.complete && img.naturalWidth === 0)
      .map((img) => img.getAttribute("src"));
    return {
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      offenders: offenders.slice(0, 6),
      broken,
      links: Array.from(document.querySelectorAll("a[href^='/']")).map((a) =>
        a.getAttribute("href"),
      ),
    };
  });

  check(`${vp.dir} no horizontal overflow`, !layout.overflow, layout);
  check(`${vp.dir} no element overflows`, layout.offenders.length === 0, layout.offenders);
  check(`${vp.dir} no broken images`, layout.broken.length === 0, layout.broken);

  reports.push({ viewport: vp.dir, move, layout, numbering });

  await context.close();
}

/* ---------- Internal links ---------- */
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1500);

  const hrefs = await page.evaluate(() =>
    Array.from(new Set(
      Array.from(document.querySelectorAll("a[href^='/']")).map((a) =>
        a.getAttribute("href").split("#")[0],
      ),
    )),
  );

  const linkResults = [];
  for (const href of hrefs) {
    if (!href) continue;
    const response = await page.request.get(`${base}${href}`);
    linkResults.push({ href, status: response.status() });
    check(`link ${href} resolves`, response.ok(), `${href} -> ${response.status()}`);
  }
  reports.push({ links: linkResults });
  await context.close();
}

/* ---------- Reduced motion ---------- */
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  page.on("pageerror", (e) => pageErrors.push(`reduced-motion: ${e.message}`));
  await page.goto(base, { waitUntil: "networkidle", timeout: 60000 });
  await page.locator(".lx-hero__headline").waitFor({ state: "visible" });
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(1600);

  const rm = await page.evaluate(() => {
    const move = document.querySelector('[data-lxh-parallax="move"]');
    const image = move?.querySelector("img");
    const copy = move?.querySelector(".lxh-chapter__copy");
    return {
      imageTransform: image ? getComputedStyle(image).transform : null,
      copyTransform: copy ? getComputedStyle(copy).transform : null,
      headlineOpacity: getComputedStyle(
        document.querySelector(".lxh-range__title"),
      ).opacity,
    };
  });
  check("reduced-motion: the move photograph does not drift", rm.imageTransform === "none" || rm.imageTransform === "matrix(1, 0, 0, 1, 0, 0)", rm);
  check("reduced-motion: the copy is fully visible", rm.headlineOpacity === "1", rm);

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  await shot(page, "reduced-motion/footer.png");

  reports.push({ viewport: "1440-reduced-motion", rm });
  await context.close();
}

/* ---------- The Move section recording ---------- */
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: videoDir, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: "networkidle", timeout: 60000 });
  await page.locator(".lx-hero__headline").waitFor({ state: "visible" });
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(1500);

  const frame = page.locator('[data-lxh-parallax="move"]').first();
  const absTop = await frame.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);

  // Seven seconds travelling through the band, so the background drift and
  // the stationary foreground are both visible.
  await page.evaluate((top) => window.scrollTo(0, top - 620), absTop);
  await page.waitForTimeout(600);
  const start = Date.now();
  while (Date.now() - start < 7000) {
    const progress = (Date.now() - start) / 7000;
    await page.evaluate(
      ({ top, offset }) => window.scrollTo(0, top + offset),
      { top: absTop - 620, offset: progress * 1100 },
    );
    await page.waitForTimeout(40);
  }

  const video = page.video();
  await context.close();
  if (video) {
    const file = await video.path();
    const target = path.join(root, "move-section-parallax.webm");
    await rename(file, target).catch(async () => {
      await writeFile(target, await video.saveAs(target));
    });
    screenshots.push("move-section-parallax.webm");
  }
  reports.push({ viewport: "video" });
}

await writeFile(
  path.join(root, "qa-report.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), base, screenshots, failures, consoleErrors, pageErrors, reports }, null, 2),
);

await browser.close();

console.log(
  JSON.stringify({ screenshots: screenshots.length, failures, consoleErrors, pageErrors }, null, 2),
);

if (failures.length > 0) process.exitCode = 1;
