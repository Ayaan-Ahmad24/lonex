import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const base = process.env.BASE_URL ?? "http://localhost:3402";
const root = "artifacts/lonex-step-2-revision";

const viewports = [
  { dir: "1440", width: 1440, height: 900 },
  { dir: "768", width: 768, height: 1024 },
  { dir: "390", width: 390, height: 844 },
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

async function shot(page, relPath) {
  const buffer = await page.screenshot({ type: "png" });
  await writeFile(path.join(root, relPath), buffer);
  screenshots.push(relPath.replaceAll("\\", "/"));
}

async function readRange(page) {
  return page.evaluate(() => {
    const section = document.querySelector(".lxh-intro");
    const chapters = document.querySelectorAll(".lxh-chapter");
    const range = Array.from(chapters).map((el) => ({
      composition: Array.from(el.classList).find((c) =>
        c.startsWith("lxh-chapter--"),
      ),
      verb: el.querySelector(".lxh-chapter__verb")?.textContent?.trim(),
      desc: el.querySelector(".lxh-chapter__desc")?.textContent?.trim(),
      image: el.querySelector("img")?.getAttribute("src"),
    }));
    return {
      sectionVisible: !!section,
      sectionTop: section ? section.getBoundingClientRect().top : null,
      sectionHeight: section ? section.getBoundingClientRect().height : null,
      h2Text: document.querySelector(".lxh-range__title")?.textContent ?? null,
      ledeText: document.querySelector(".lxh-range__lede")?.textContent ?? null,
      chapters: range.length,
      range,
      hasNumberedIndex: !!document.querySelector(".lxh-chapter__index"),
      hasMeta: !!document.querySelector(".lxh-chapter__meta"),
      hasTagInRange: !!document.querySelector(".lxh-chapter .lxh-tag--image"),
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      overflow:
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth + 1,
    };
  });
}

async function shotComposition(page, width, vpDir, composition) {
  const el = await page.locator(`.lxh-chapter--${composition}`).first();
  if ((await el.count()) === 0) {
    console.log(`Skipping ${composition} at ${vpDir}: not found`);
    return;
  }
  // Scroll this chapter into view so it's fully readable in the frame.
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  const box = await el.boundingBox();
  if (!box) {
    console.log(`Skipping ${composition} at ${vpDir}: no bbox`);
    return;
  }
  const x0 = Math.max(0, box.x - 8);
  const y0 = Math.max(0, box.y - 8);
  const clipW = Math.min(width - x0, box.width + 16);
  const clipH = box.height + 16;
  if (clipW <= 0 || clipH <= 0) {
    console.log(`Skipping ${composition} at ${vpDir}: empty clip`, { clipW, clipH });
    return;
  }
  const clip = { x: x0, y: y0, width: clipW, height: clipH };
  const buffer = await page.screenshot({ type: "png", clip });
  await writeFile(path.join(root, vpDir, `${composition}.png`), buffer);
  screenshots.push(`${vpDir}/${composition}.png`);
}

const browser = await chromium.launch({ headless: true });

for (const vp of viewports) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(`${vp.dir}: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => {
    pageErrors.push(`${vp.dir}: ${error.message}`);
  });

  await page.goto(base, { waitUntil: "networkidle", timeout: 60000 });
  await page.locator(".lx-hero__headline").waitFor({ state: "visible" });
  await page.evaluate(() => document.fonts?.ready);

  await page.evaluate(() => {
    const section = document.querySelector(".lxh-intro");
    if (section) {
      section.scrollIntoView({ behavior: "instant", block: "start" });
    }
  });
  await page.waitForTimeout(2200);

  const range = await readRange(page);
  await shot(page, `${vp.dir}/range-full.png`);

  check(`${vp.dir} section visible`, range.sectionVisible, range);
  check(`${vp.dir} h2 heading`, !!range.h2Text, range.h2Text);
  check(`${vp.dir} lede present`, !!range.ledeText, range.ledeText);
  check(`${vp.dir} 3 chapters`, range.chapters === 3, range.chapters);
  check(
    `${vp.dir} chapter compositions`,
    range.range.map((r) => r.composition).sort().join(","),
    "lxh-chapter--generate,lxh-chapter--move,lxh-chapter--store",
  );
  check(`${vp.dir} all chapters have image`, range.range.every((r) => !!r.image), range.range);
  check(`${vp.dir} no numbering`, !range.hasNumberedIndex, range);
  check(`${vp.dir} no meta block`, !range.hasMeta, range);
  check(`${vp.dir} no tag in range`, !range.hasTagInRange, range);
  check(`${vp.dir} no horizontal overflow`, !range.overflow, `${range.scrollWidth} > ${range.clientWidth}`);
  check(`${vp.dir} section height sane`, range.sectionHeight > 0 && range.sectionHeight < 4000, range.sectionHeight);

  for (const composition of ["generate", "store", "move"]) {
    await shotComposition(page, vp.width, vp.dir, composition);
  }

  reports.push({ viewport: vp.dir, range });

  await context.close();
}

await writeFile(
  path.join(root, "report.json"),
  JSON.stringify(
    { generatedAt: new Date().toISOString(), base, screenshots, failures, consoleErrors, pageErrors, reports },
    null,
    2,
  ),
);

await browser.close();

console.log(
  JSON.stringify(
    { screenshots: screenshots.length, failures, consoleErrors, pageErrors, reports },
    null,
    2,
  ),
);

if (failures.length > 0) {
  process.exitCode = 1;
}
