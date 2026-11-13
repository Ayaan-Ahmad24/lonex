import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const base = process.env.BASE_URL ?? "http://localhost:3402";
const root = "artifacts/lonex-range-final-review";

const viewports = [
  { dir: "1440", width: 1440, height: 900 },
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
  if (!condition) {
    failures.push({ label, detail });
  }
}

async function shot(page, relPath, clip) {
  const buffer = await page.screenshot({ type: "png", ...(clip ? { clip } : {}) });
  await writeFile(path.join(root, relPath), buffer);
  screenshots.push(relPath.replaceAll("\\", "/"));
}

/** Geometry of the intro: are the heading and the paragraph on one row? */
async function readIntro(page) {
  return page.evaluate(() => {
    const title = document.querySelector(".lxh-range__title");
    const lede = document.querySelector(".lxh-range__lede");
    const head = document.querySelector(".lxh-range__head");
    if (!title || !lede || !head) return null;
    const t = title.getBoundingClientRect();
    const l = lede.getBoundingClientRect();
    const cs = getComputedStyle(head);
    return {
      title: { x: Math.round(t.x), y: Math.round(t.y), w: Math.round(t.width), h: Math.round(t.height), bottom: Math.round(t.bottom) },
      lede: { x: Math.round(l.x), y: Math.round(l.y), w: Math.round(l.width), h: Math.round(l.height), bottom: Math.round(l.bottom) },
      titleFont: getComputedStyle(title).fontSize,
      ledeFont: getComputedStyle(lede).fontSize,
      display: cs.display,
      columns: cs.gridTemplateColumns,
      alignItems: cs.alignItems,
      justifyContent: cs.justifyContent,
      sameRow: l.y < t.bottom - 2 && l.bottom > t.y + 2,
      paragraphRight: l.x >= t.x + t.width - 2,
      baselineAligned: Math.abs(l.bottom - t.bottom) <= 4,
    };
  });
}

/** Geometry of each chapter: which side is the copy on? */
async function readChapters(page) {
  return page.evaluate(() => {
    return Array.from(document.querySelectorAll(".lxh-chapter")).map((el) => {
      const media = el.querySelector(".lxh-chapter__media");
      const copy = el.querySelector(".lxh-chapter__copy");
      const m = media.getBoundingClientRect();
      const c = copy.getBoundingClientRect();
      const img = el.querySelector("img");
      return {
        composition: Array.from(el.classList).find((x) => x.startsWith("lxh-chapter--")),
        media: { x: Math.round(m.x), y: Math.round(m.y), w: Math.round(m.width), h: Math.round(m.height) },
        copy: { x: Math.round(c.x), y: Math.round(c.y), w: Math.round(c.width), h: Math.round(c.height) },
        ratio: +(m.width / m.height).toFixed(3),
        copyLeftOfMedia: c.x + c.width <= m.x + 2,
        mediaLeftOfCopy: m.x + m.width <= c.x + 2,
        stacked: m.y + m.height <= c.y + 2 || c.y + c.height <= m.y + 2,
        image: img?.getAttribute("src"),
        broken: img ? img.naturalWidth === 0 : true,
      };
    });
  });
}

const browser = await chromium.launch({ headless: true });

for (const vp of viewports) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(`${vp.dir}: ${message.text()}`);
  });
  page.on("pageerror", (error) => pageErrors.push(`${vp.dir}: ${error.message}`));

  await page.goto(base, { waitUntil: "networkidle", timeout: 60000 });
  await page.locator(".lx-hero__headline").waitFor({ state: "visible" });
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll(".lxh-chapter img")).every((i) => i.complete && i.naturalWidth > 0),
  );

  await page.evaluate(() => {
    document.querySelector(".lxh-intro")?.scrollIntoView({ behavior: "instant", block: "start" });
  });
  await page.waitForTimeout(2400);

  const intro = await readIntro(page);
  const chapters = await readChapters(page);

  // Full section view.
  await shot(page, `${vp.dir}/range-section.png`);

  // Each composition, scrolled into view and clipped to the chapter.
  for (const composition of ["generate", "store", "move"]) {
    const el = page.locator(`.lxh-chapter--${composition}`).first();
    if ((await el.count()) === 0) continue;
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    const box = await el.boundingBox();
    if (!box) continue;
    const x0 = Math.max(0, box.x - 8);
    const y0 = Math.max(0, box.y - 8);
    const clip = {
      x: x0,
      y: y0,
      width: Math.min(vp.width - x0, box.width + 16),
      height: box.height + 16,
    };
    const buffer = await page.screenshot({ type: "png", clip });
    await writeFile(path.join(root, vp.dir, `${composition}.png`), buffer);
    screenshots.push(`${vp.dir}/${composition}.png`);
  }

  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  const isDesktop = vp.width >= 1024;
  const isPhone = vp.width <= 560;

  check(`${vp.dir} no horizontal overflow`, overflow.scrollWidth <= overflow.clientWidth + 1, overflow);
  check(`${vp.dir} intro uses grid`, intro?.display === "grid", intro?.display);
  check(`${vp.dir} intro justify-content space-between`, intro?.justifyContent === "space-between", intro?.justifyContent);

  if (isDesktop) {
    check(`${vp.dir} intro aligns to end`, intro?.alignItems === "end", intro?.alignItems);
    check(`${vp.dir} intro paragraph width 380-460px`, intro && intro.lede.w >= 330 && intro.lede.w <= 460, intro?.lede.w);
    check(`${vp.dir} intro: heading and paragraph share a row`, intro?.sameRow === true, intro);
    check(`${vp.dir} intro: paragraph sits to the right`, intro?.paragraphRight === true, intro);
    check(`${vp.dir} intro: bottoms aligned`, intro?.baselineAligned === true, intro);
    check(`${vp.dir} intro heading 52-64px`, intro && parseFloat(intro.titleFont) >= 52 && parseFloat(intro.titleFont) <= 64, intro?.titleFont);

    const generate = chapters.find((c) => c.composition === "lxh-chapter--generate");
    const store = chapters.find((c) => c.composition === "lxh-chapter--store");
    const move = chapters.find((c) => c.composition === "lxh-chapter--move");

    check(`${vp.dir} generate: image left of copy`, generate?.mediaLeftOfCopy === true, generate);
    check(`${vp.dir} generate: not stacked`, generate?.stacked === false, generate);
    check(`${vp.dir} generate: image ~57% of row`, generate && generate.media.w / (generate.media.w + generate.copy.w) > 0.52 && generate.media.w / (generate.media.w + generate.copy.w) < 0.62, generate);
    check(`${vp.dir} generate: image ratio ~4:3`, generate && Math.abs(generate.ratio - 4 / 3) < 0.05, generate?.ratio);

    check(`${vp.dir} store: copy left of image`, store?.copyLeftOfMedia === true, store);
    check(`${vp.dir} store: not stacked`, store?.stacked === false, store);
    check(`${vp.dir} store: image ~65% of row`, store && store.media.w / (store.media.w + store.copy.w) > 0.6, store);
    check(`${vp.dir} store: image ratio ~4:3`, store && Math.abs(store.ratio - 4 / 3) < 0.05, store?.ratio);

    check(`${vp.dir} move: copy overlays the image`, move && !move.stacked && move.copy.x >= move.media.x && move.copy.x < move.media.x + move.media.w, move);
    check(`${vp.dir} move: image ratio ~16:7`, move && Math.abs(move.ratio - 16 / 7) < 0.06, move?.ratio);
    check(`${vp.dir} move: image spans the full row`, move && Math.abs(move.media.w - (generate.media.w + generate.copy.w + 48)) < 90, move);
  } else {
    // Stacked breakpoints: the introduction is one column and the copy
    // follows the image.
    check(`${vp.dir} intro stacks`, intro?.paragraphRight === false, intro);
    check(`${vp.dir} intro aligns to start`, intro?.alignItems === "start", intro?.alignItems);

    const generate = chapters.find((c) => c.composition === "lxh-chapter--generate");
    const store = chapters.find((c) => c.composition === "lxh-chapter--store");
    const move = chapters.find((c) => c.composition === "lxh-chapter--move");
    check(`${vp.dir} generate stacks`, generate?.stacked === true, generate);
    check(`${vp.dir} store stacks`, store?.stacked === true, store);
    check(`${vp.dir} generate image ratio ~4:3`, generate && Math.abs(generate.ratio - 4 / 3) < 0.05, generate?.ratio);

    if (isPhone) {
      // On a phone the Move band becomes an image with the copy beneath it.
      check(`${vp.dir} move stacks`, move?.stacked === true, move);
      check(`${vp.dir} move image not excessively tall`, move && move.media.h <= 260, move?.media.h);
    } else {
      // At tablet width the Move band keeps its overlay composition.
      check(`${vp.dir} move keeps the overlay`, move && !move.stacked && move.copy.x >= move.media.x && move.copy.x < move.media.x + move.media.w, move);
    }
  }

  check(`${vp.dir} all images loaded`, chapters.every((c) => !c.broken), chapters.filter((c) => c.broken));

  reports.push({ viewport: vp.dir, intro, chapters, overflow });
  await context.close();
}

await writeFile(
  path.join(root, "report.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), base, screenshots, failures, consoleErrors, pageErrors, reports }, null, 2),
);

await browser.close();

console.log(JSON.stringify({ screenshots: screenshots.length, failures, consoleErrors, pageErrors }, null, 2));

if (failures.length > 0) {
  process.exitCode = 1;
}
