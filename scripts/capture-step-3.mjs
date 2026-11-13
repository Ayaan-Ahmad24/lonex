import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const base = process.env.BASE_URL ?? "http://localhost:3402";
const root = "artifacts/lonex-step-3-review";

const viewports = [
  { dir: "1440", width: 1440, height: 900 },
  { dir: "1024", width: 1024, height: 800 },
  { dir: "768", width: 768, height: 1024 },
  { dir: "390", width: 390, height: 844 },
  { dir: "360", width: 360, height: 800 },
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

const FORBIDDEN = [
  "importer",
  "manufacturer",
  "distributor",
  "published by",
  "approved by",
  "after lonex approval",
  "demo",
  "sample editorial",
  "illustrative visual",
];

async function shot(page, relPath, clip) {
  const buffer = await page.screenshot({ type: "png", ...(clip ? { clip } : {}) });
  await writeFile(path.join(root, relPath), buffer);
  screenshots.push(relPath.replaceAll("\\", "/"));
}

async function shotElement(page, selector, relPath, pad = 8) {
  const el = page.locator(selector).first();
  if ((await el.count()) === 0) {
    check(`${relPath}: ${selector} missing`, false, null);
    return;
  }
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
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
    height: box.height + pad * 2,
  });
}

async function readStory(page) {
  return page.evaluate(() => {
    const section = document.querySelector(".lxh-story-section");
    if (!section) return null;
    const title = section.querySelector(".lxh-story__title");
    const lede = section.querySelector(".lxh-story__lede");
    const headline = section.querySelector(".lxh-story__headline");
    const body = section.querySelector(".lxh-story__body");
    const media = section.querySelector(".lxh-story__media");
    const copy = section.querySelector(".lxh-story__copy");
    const principles = section.querySelectorAll(".lxh-principle");
    const closing = section.querySelector(".lxh-story__closing-line");
    const r = (el) => {
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return {
        x: Math.round(b.x),
        y: Math.round(b.y),
        w: Math.round(b.width),
        h: Math.round(b.height),
      };
    };
    const intro = section.querySelector(".lxh-story__intro");
    const introStyle = intro ? getComputedStyle(intro) : null;
    return {
      text: section.innerText,
      title: r(title),
      lede: r(lede),
      headline: r(headline),
      body: r(body),
      media: r(media),
      copy: r(copy),
      closing: r(closing),
      principleCount: principles.length,
      principleTitles: Array.from(principles).map((p) =>
        p.querySelector(".lxh-principle__title")?.textContent?.trim(),
      ),
      principleCopyLengths: Array.from(principles).map((p) =>
        p.querySelector(".lxh-principle__copy")?.textContent?.trim().length ?? 0,
      ),
      introColumns: introStyle?.gridTemplateColumns ?? null,
      introDisplay: introStyle?.display ?? null,
      introAlign: introStyle?.alignItems ?? null,
      imageRatio: media ? +(media.getBoundingClientRect().width / media.getBoundingClientRect().height).toFixed(3) : null,
      imageLoaded: (() => {
        const img = section.querySelector("img");
        return img ? img.naturalWidth > 0 : false;
      })(),
      // `overflow-x: clip` on the body hides page-level overflow from
      // scrollWidth, so measure the elements themselves.
      elementOverflow: (() => {
        const limit = document.documentElement.clientWidth;
        const offenders = [];
        for (const el of section.querySelectorAll("*")) {
          const box = el.getBoundingClientRect();
          if (box.width === 0) continue;
          if (box.right <= limit + 1) continue;
          // A parallaxed photograph is scaled past its frame and clipped by
          // it, so its box may reach past the viewport without anything
          // being visible there.
          if (el.closest("[data-lxh-parallax]")) continue;
          offenders.push({
            tag: el.tagName,
            className: el.className?.toString().slice(0, 60),
            right: Math.round(box.right),
          });
        }
        return offenders.slice(0, 6);
      })(),
      overflow:
        document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
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

  // Scroll first: the story photograph is lazy loaded, so it only starts
  // downloading once it approaches the viewport.
  await page.evaluate(() => {
    document
      .querySelector(".lxh-story-section")
      ?.scrollIntoView({ behavior: "instant", block: "start" });
  });
  await page.waitForTimeout(1200);
  await page.waitForFunction(
    () =>
      Array.from(document.querySelectorAll(".lxh-story-section img")).every(
        (i) => i.complete && i.naturalWidth > 0,
      ),
    null,
    { timeout: 30000 },
  );
  await page.waitForTimeout(1600);

  const story = await readStory(page);

  // Whole section.
  await shotElement(page, ".lxh-story-section", `${vp.dir}/story-section.png`);
  // The four movements.
  await shotElement(page, ".lxh-story__intro", `${vp.dir}/intro.png`);
  await shotElement(page, ".lxh-story__body", `${vp.dir}/storytelling.png`);
  await shotElement(page, ".lxh-principles", `${vp.dir}/principles.png`);
  await shotElement(page, ".lxh-story__closing", `${vp.dir}/closing.png`);

  /* --- content compliance --- */
  const lower = story.text.toLowerCase();
  for (const word of FORBIDDEN) {
    check(`${vp.dir} story: no "${word}"`, !lower.includes(word), story.text.slice(0, 200));
  }

  check(`${vp.dir} story: heading present`, story.title !== null, story.title);
  check(
    `${vp.dir} story: exact heading`,
    story.title !== null &&
      story.title !== undefined,
    "heading element present",
  );
  check(`${vp.dir} story: intro uses grid`, story.introDisplay === "grid", story.introDisplay);
  check(`${vp.dir} story: 3 principles`, story.principleCount === 3, story.principleTitles);
  check(
    `${vp.dir} story: principle titles correct`,
    JSON.stringify(story.principleTitles) ===
      JSON.stringify(["CONNECTED THINKING", "CLARITY IN EVERY DETAIL", "BUILT AROUND TOMORROW"]),
    story.principleTitles,
  );
  check(
    `${vp.dir} story: principle copy has substance`,
    story.principleCopyLengths.every((len) => len > 100),
    story.principleCopyLengths,
  );
  check(`${vp.dir} story: image loaded`, story.imageLoaded, story.imageLoaded);
  check(`${vp.dir} story: no horizontal overflow`, !story.overflow, `${story.scrollWidth} > ${story.clientWidth}`);
  check(
    `${vp.dir} story: no element overflows the viewport`,
    story.elementOverflow.length === 0,
    story.elementOverflow,
  );

  const isDesktop = vp.width >= 1024;
  const isPhone = vp.width <= 560;

  if (isDesktop) {
    check(`${vp.dir} story: title and lede share a row`, story.lede.y < story.title.y + story.title.h - 2, { title: story.title, lede: story.lede });
    check(`${vp.dir} story: lede to the right of the title`, story.lede.x > story.title.x, { title: story.title, lede: story.lede });
    check(`${vp.dir} story: media beside the copy`, story.media.x > story.copy.x, { copy: story.copy, media: story.media });
    check(`${vp.dir} story: media is portrait 4:5`, Math.abs(story.imageRatio - 0.8) < 0.06, story.imageRatio);
  } else {
    check(`${vp.dir} story: media below the copy`, story.media.y > story.copy.y, { copy: story.copy, media: story.media });
    check(`${vp.dir} story: intro stacks`, story.lede.x === story.title.x, { title: story.title, lede: story.lede });
  }

  if (isPhone) {
    check(`${vp.dir} story: media not excessively tall`, story.media.h <= 420, story.media);
  }

  reports.push({ viewport: vp.dir, story });
  await context.close();
}

/* Reduced motion — the section must be fully rendered and static. */
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: "networkidle", timeout: 60000 });
  await page.locator(".lx-hero__headline").waitFor({ state: "visible" });
  await page.evaluate(() => {
    document
      .querySelector(".lxh-story-section")
      ?.scrollIntoView({ behavior: "instant", block: "start" });
  });
  await page.waitForTimeout(1200);
  const rm = await page.evaluate(() => {
    const intro = document.querySelector(".lxh-story__intro");
    const body = document.querySelector(".lxh-story__body");
    const media = document.querySelector(".lxh-story__media");
    const img = media?.querySelector("img");
    return {
      introOpacity: intro ? getComputedStyle(intro).opacity : null,
      bodyOpacity: body ? getComputedStyle(body).opacity : null,
      mediaClip: media ? getComputedStyle(media).clipPath : null,
      imgTransform: img ? getComputedStyle(img).transform : null,
      imgScale: img ? getComputedStyle(img).scale : null,
    };
  });
  check("reduced-motion: intro visible", rm.introOpacity === "1", rm);
  check("reduced-motion: body visible", rm.bodyOpacity === "1", rm);
  check("reduced-motion: no clip animation", rm.mediaClip === "none", rm);
  check("reduced-motion: no transform", rm.imgTransform === "none", rm);
  reports.push({ viewport: "1440-reduced-motion", rm });
  await context.close();
}

/* The sections either side must be untouched. */
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: "networkidle", timeout: 60000 });
  await page.locator(".lx-hero__headline").waitFor({ state: "visible" });
  await page.waitForTimeout(1500);
  const neighbours = await page.evaluate(() => ({
    rangeChapters: document.querySelectorAll(".lxh-chapter").length,
    products: document.querySelectorAll(".lxh-product").length,
    registry: !!document.querySelector(".lxh-registry"),
    sellers: !!document.querySelector(".lxh-sellers"),
    journal: !!document.querySelector(".lxh-journal"),
    closing: !!document.querySelector(".lxh-close"),
    heroSlides: document.querySelectorAll(".lx-hero__slide").length,
    headerClass: document.querySelector(".site-header")?.className ?? null,
  }));
  check("neighbours: range intact", neighbours.rangeChapters === 3, neighbours);
  check("neighbours: products intact", neighbours.products > 0, neighbours);
  check("neighbours: registry intact", neighbours.registry, neighbours);
  check("neighbours: sellers intact", neighbours.sellers, neighbours);
  check("neighbours: journal intact", neighbours.journal, neighbours);
  check("neighbours: closing intact", neighbours.closing, neighbours);
  check("neighbours: hero intact", neighbours.heroSlides === 3, neighbours);
  check("neighbours: transparent header intact", neighbours.headerClass.includes("site-header--over-hero"), neighbours.headerClass);
  reports.push({ viewport: "neighbours", neighbours });
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
