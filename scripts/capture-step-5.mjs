import { chromium } from "playwright";
import { mkdir, writeFile, rename } from "node:fs/promises";
import path from "node:path";

const base = process.env.BASE_URL ?? "http://localhost:3402";
const root = "artifacts/lonex-step-5-review";

const viewports = [
  { dir: "1440", width: 1440, height: 900 },
  { dir: "768", width: 768, height: 1024 },
  { dir: "390", width: 390, height: 844 },
];

const videoDir = path.join(process.cwd(), "artifacts", "lonex-step-5-review", "_video");

for (const vp of viewports) {
  await mkdir(path.join(root, vp.dir), { recursive: true });
}
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

/** The animated nodes, with their real measured state. */
const ENTRANCES = [
  ["range-intro-title", ".lxh-range__title"],
  ["range-chapter-copy", ".lxh-chapter--generate .lxh-chapter__verb"],
  ["story-intro-title", ".lxh-story__title"],
  ["story-headline", ".lxh-story__headline"],
  ["principles", ".lxh-principle:first-child"],
  ["products", ".lxh-product:first-child"],
  ["registry", ".lxh-registry__title"],
  ["sellers", ".lxh-sellers__copy"],
  ["journal", ".lxh-journal__feature"],
  ["closing", ".lxh-close__title span:first-child"],
  ["footer-brand", ".site-footer__brand"],
  ["footer-column", ".site-footer__col"],
];

/* [name, container, element that actually carries the transform] */
const PARALLAX_FRAMES = [
  ["hero-stage", ".lx-hero__stage", ".lx-hero__stage"],
  ["generate", ".lxh-chapter--generate .lxh-chapter__media", "img"],
  ["store", ".lxh-chapter--store .lxh-chapter__media", "img"],
  ["move", ".lxh-chapter--move .lxh-chapter__media", "img"],
  ["about", ".lxh-story__media", "img"],
  ["products", ".lxh-product:first-child .lxh-product__media", "img"],
  ["journal", ".lxh-journal__feature .lxh-journal__media", "img"],
];

const readState = (page, list) =>
  page.evaluate((targets) => {
    const out = {};
    for (const [name, sel] of targets) {
      const el = document.querySelector(sel);
      if (!el) {
        out[name] = null;
        continue;
      }
      const cs = getComputedStyle(el);
      const matrix = new DOMMatrixReadOnly(cs.transform);
      out[name] = {
        opacity: Number(Number(cs.opacity).toFixed(2)),
        ty: Math.round(matrix.m42 * 100) / 100,
        scale: Math.round(matrix.a * 1000) / 1000,
        clip: cs.clipPath === "none" ? "none" : cs.clipPath,
      };
    }
    return out;
  }, list);

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
  await page.waitForTimeout(2200);

  /* ---------- 1. Entrance start states ------------------------------ */
  const atLoad = await readState(page, ENTRANCES);

  /* ---------- 2. Mid-animation capture ------------------------------- */
  // Scroll so a section is just entering the viewport and capture it while
  // the reveal is still running.
  await page.evaluate(() => {
    const target = document.querySelector(".lxh-chapter--generate");
    if (target) {
      window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY - 600);
    }
  });
  await page.waitForTimeout(120);
  await shot(page, `${vp.dir}/state-01-entrance-inflight.png`);
  const inFlight = await readState(page, ENTRANCES);

  /* ---------- 3. Full scroll sweep ------------------------------------ */
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < height - vp.height; y += Math.round(vp.height * 0.6)) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(260);
  }
  await page.waitForTimeout(1500);

  const settled = await readState(page, ENTRANCES);

  for (const [name] of ENTRANCES) {
    const before = atLoad[name];
    const after = settled[name];
    if (!before || !after) {
      check(`${vp.dir} ${name}: node missing`, false, { before, after });
      continue;
    }
    check(
      `${vp.dir} ${name}: settles fully visible`,
      after.opacity === 1 && Math.abs(after.ty) < 1,
      { before, after },
    );
    check(
      `${vp.dir} ${name}: has a real start state`,
      before.opacity < 1 || Math.abs(before.ty) > 1,
      { before, after },
    );
    check(
      `${vp.dir} ${name}: no clip left behind`,
      after.clip === "none" || /inset\(0(px|%)?\)/.test(after.clip),
      { after },
    );
  }

  /* ---------- 4. Parallax travel ------------------------------------- */
  const parallax = await page.evaluate(async (frames) => {
    const out = [];
    for (const [name, sel, targetSel] of frames) {
      const el = document.querySelector(sel);
      if (!el) {
        out.push({ name, missing: true });
        continue;
      }
      const target =
        targetSel === "img" ? el.querySelector("img") ?? el : el;
      const read = () => {
        const m = new DOMMatrixReadOnly(getComputedStyle(target).transform);
        return {
          y: Math.round(m.m42 * 100) / 100,
          scale: Math.round(m.a * 1000) / 1000,
        };
      };
      const absTop = el.getBoundingClientRect().top + window.scrollY;
      const frameHeight = el.getBoundingClientRect().height;
      // Always travel the same distance so the measurement is comparable
      // for frames at the top of the page as well as further down.
      const from = Math.max(0, absTop - 700);
      window.scrollTo(0, from);
      await new Promise((r) => setTimeout(r, 700));
      const start = read();
      window.scrollTo(0, from + 900);
      await new Promise((r) => setTimeout(r, 900));
      const end = read();
      out.push({
        name,
        start,
        end,
        frameHeight: Math.round(frameHeight),
        travelPx:
          start && end ? Math.round((end.y - start.y) * 100) / 100 : null,
        travelPercent:
          start && end && frameHeight
            ? Math.round(
                (Math.abs(end.y - start.y) / frameHeight) * 1000,
              ) / 10
            : null,
      });
    }
    return out;
  }, PARALLAX_FRAMES);

  const desktop = vp.width >= 1024;
  const mobile = vp.width <= 760;
  for (const entry of parallax) {
    if (entry.missing) {
      check(`${vp.dir} parallax ${entry.name}: frame missing`, false, entry);
      continue;
    }
    if (mobile) {
      // Small screens deliberately run the finished page rather than a
      // scrubbed photograph.
      check(
        `${vp.dir} parallax ${entry.name}: disabled on small screens`,
        Math.abs(entry.travelPx ?? 99) < 1,
        entry,
      );
      continue;
    }
    check(
      `${vp.dir} parallax ${entry.name}: visible travel`,
      (entry.travelPercent ?? 0) >= 5,
      entry,
    );
  }

  /* ---------- 5. Hover interactions ---------------------------------- */
  if (desktop) {
    // Park the pointer away from the page so a hover is not already active.
    await page.mouse.move(2, 2);
    await page.waitForTimeout(300);

    const card = page.locator(".lxh-product").first();
    await card.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await page.mouse.move(2, 2);
    await page.waitForTimeout(400);
    const mediaBefore = await page.evaluate(
      () =>
        getComputedStyle(document.querySelector(".lxh-product__media")).transform,
    );
    await card.hover();
    await page.waitForTimeout(800);
    const mediaAfter = await page.evaluate(
      () =>
        getComputedStyle(document.querySelector(".lxh-product__media")).transform,
    );
    check(
      `${vp.dir} product card: image zooms on hover`,
      mediaBefore !== mediaAfter,
      { mediaBefore, mediaAfter },
    );
    check(
      `${vp.dir} product card: lift and zoom applied`,
      mediaAfter.includes("matrix") && !mediaAfter.includes("matrix(1, 0, 0, 1"),
      { mediaAfter },
    );
    await shot(page, `${vp.dir}/state-05-product-hover.png`);

    await page.mouse.move(2, 2);
    const chapter = page.locator(".lxh-chapter--generate").first();
    await chapter.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await page.mouse.move(2, 2);
    await page.waitForTimeout(400);
    const rangeBefore = await page.evaluate(
      () =>
        getComputedStyle(
          document.querySelector(".lxh-chapter--generate .lxh-chapter__media"),
        ).transform,
    );
    await chapter.hover();
    await page.waitForTimeout(800);
    const rangeAfter = await page.evaluate(
      () =>
        getComputedStyle(
          document.querySelector(".lxh-chapter--generate .lxh-chapter__media"),
        ).transform,
    );
    check(
      `${vp.dir} range chapter: photograph zooms on hover`,
      rangeBefore !== rangeAfter,
      { rangeBefore, rangeAfter },
    );
    await shot(page, `${vp.dir}/state-06-range-hover.png`);
    await page.mouse.move(2, 2);
  }

  /* ---------- 6. Hero slideshow -------------------------------------- */
  const heroBefore = await page.evaluate(() => {
    const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
    return slides.map((s) => Number(getComputedStyle(s).opacity).toFixed(2));
  });
  await page.locator('button[aria-label="Next slide"]').click();
  await page.waitForTimeout(260);
  const heroMid = await page.evaluate(() => {
    const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
    return slides.map((s) => Number(getComputedStyle(s).opacity).toFixed(2));
  });
  await shot(page, `${vp.dir}/state-07-hero-crossfade.png`);
  await page.waitForTimeout(1400);
  const heroAfter = await page.evaluate(() => {
    const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
    const active = document.querySelector(".lx-hero__tab.is-active");
    return {
      opacities: slides.map((s) => Number(getComputedStyle(s).opacity).toFixed(2)),
      activeTab: active?.getAttribute("aria-label"),
    };
  });
  check(
    `${vp.dir} hero: crossfade happens between slides`,
    heroMid.some((o, i) => o !== heroBefore[i] && o > 0),
    { heroBefore, heroMid },
  );
  check(
    `${vp.dir} hero: exactly one slide fully visible`,
    heroAfter.opacities.filter((o) => Number(o) === 1).length === 1,
    heroAfter,
  );

  /* ---------- 7. Footer entrance ------------------------------------- */
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1500);
  const footer = await readState(page, [
    ["brand", ".site-footer__brand"],
    ["column", ".site-footer__col"],
    ["base", ".site-footer__base"],
  ]);
  check(
    `${vp.dir} footer: brand settles visible`,
    footer.brand?.opacity === 1,
    footer,
  );
  check(
    `${vp.dir} footer: columns settle visible`,
    footer.column?.opacity === 1,
    footer,
  );
  check(
    `${vp.dir} footer: copyright settles visible`,
    footer.base?.opacity === 1,
    footer,
  );

  /* ---------- 8. Section captures ------------------------------------ */
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(900);
  await shot(page, `${vp.dir}/01-hero.png`);

  const sections = [
    [2, ".lxh-range__head"],
    [3, ".lxh-chapter--generate"],
    [4, ".lxh-chapter--store"],
    [5, ".lxh-chapter--move"],
    [6, ".lxh-story-section"],
    [7, ".lxh-products"],
    [8, ".lxh-registry"],
    [9, ".lxh-sellers"],
    [10, ".lxh-journal"],
    [11, ".lxh-close"],
    [12, ".site-footer"],
  ];

  for (const [index, selector] of sections) {
    const el = page.locator(selector).first();
    if ((await el.count()) === 0) continue;
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    const box = await el.boundingBox();
    if (!box) continue;
    await shot(page, `${vp.dir}/${String(index).padStart(2, "0")}-${selector.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "")}.png`, {
      x: Math.max(0, box.x - 8),
      y: Math.max(0, box.y - 8),
      width: Math.min(vp.width - Math.max(0, box.x - 8), box.width + 16),
      height: box.height + 16,
    });
  }

  reports.push({ viewport: vp.dir, atLoad, inFlight, settled, parallax, heroBefore, heroMid, heroAfter, footer });

  await context.close();
}

/* ---------- 9. Reduced motion ---------------------------------------- */
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
  await page.waitForTimeout(1800);

  const rm = await readState(page, ENTRANCES);
  for (const [name] of ENTRANCES) {
    check(
      `reduced-motion ${name}: visible with no movement`,
      rm[name]?.opacity === 1 && Math.abs(rm[name]?.ty ?? 99) < 1,
      { name, state: rm[name] },
    );
  }

  const rmParallax = await page.evaluate(async (frames) => {
    const out = [];
    for (const [name, sel, targetSel] of frames) {
      const el = document.querySelector(sel);
      if (!el) {
        out.push({ name, missing: true });
        continue;
      }
      const target = targetSel === "img" ? el.querySelector("img") ?? el : el;
      const read = () => {
        const m = new DOMMatrixReadOnly(getComputedStyle(target).transform);
        return Math.round(m.m42 * 100) / 100;
      };
      const absTop = el.getBoundingClientRect().top + window.scrollY;
      const from = Math.max(0, absTop - 700);
      window.scrollTo(0, from);
      await new Promise((r) => setTimeout(r, 500));
      const start = read();
      window.scrollTo(0, from + 900);
      await new Promise((r) => setTimeout(r, 700));
      out.push({ name, travel: Math.round((read() - start) * 100) / 100 });
    }
    return out;
  }, PARALLAX_FRAMES);

  for (const entry of rmParallax) {
    check(
      `reduced-motion parallax ${entry.name}: no drift`,
      Math.abs(entry.travel ?? 99) < 1,
      entry,
    );
  }

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);
  await shot(page, "reduced-motion/footer.png");

  reports.push({ viewport: "1440-reduced-motion", rm, rmParallax });
  await context.close();
}

/* ---------- 10. Video of the scroll and parallax ---------------------- */
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: videoDir, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: "networkidle", timeout: 60000 });
  await page.locator(".lx-hero__headline").waitFor({ state: "visible" });
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(2200);

  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < height - 900; y += 90) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(130);
  }
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1500);

  const video = page.video();
  await context.close();
  if (video) {
    const file = await video.path();
    const target = path.join(root, "homepage-scroll-parallax.webm");
    await rename(file, target).catch(async () => {
      await writeFile(target, await video.saveAs(target));
    });
    screenshots.push("homepage-scroll-parallax.webm");
  }
  reports.push({ viewport: "video" });
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
