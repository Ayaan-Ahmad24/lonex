import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const base = process.env.BASE_URL ?? "http://localhost:3402";
const root = "artifacts/lonex-step-2-review";

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
    const chaptersEl = document.querySelectorAll(".lxh-chapter");
    const h2 = document.querySelector(".lxh-h2");
    const range = Array.from(chaptersEl).map((el) => ({
      composition: Array.from(el.classList).find((c) =>
        c.startsWith("lxh-chapter--"),
      ),
      verb: el.querySelector(".lxh-chapter__verb")?.textContent?.trim(),
      desc: el.querySelector(".lxh-chapter__desc")?.textContent?.trim(),
      image: el.querySelector("img")?.getAttribute("src"),
    }));
    const numbered =
      document.querySelector(".lxh-chapter__index") ||
      document.querySelector('[data-lxh-chapter] dl');
    const tagInRange = document.querySelector(".lxh-chapter .lxh-tag--image");
    return {
      sectionVisible: !!section,
      sectionTop: section ? section.getBoundingClientRect().top : null,
      h2Text: h2 ? h2.textContent : null,
      chapters: range.length,
      range,
      hasNumberedIndex: !!numbered,
      hasMeta: !!document.querySelector('.lxh-chapter__meta'),
      hasTag: !!tagInRange,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      overflow:
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth + 1,
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

  // Scroll the range section into view so it fills the frame.
  await page.evaluate(() => {
    const section = document.querySelector(".lxh-intro");
    if (section) {
      section.scrollIntoView({ behavior: "instant", block: "start" });
    }
    window.scrollTo(0, window.scrollY);
  });
  await page.waitForTimeout(2200);

  const range = await readRange(page);
  await shot(page, `${vp.dir}/range.png`);

  check(`${vp.dir} range section visible`, range.sectionVisible, range);
  check(`${vp.dir} h2 heading`, !!range.h2Text && range.h2Text.length > 0, range.h2Text);
  check(`${vp.dir} 3 chapters`, range.chapters === 3, range.chapters);
  check(`${vp.dir} chapter compositions`, range.range.map((r) => r.composition).sort().join(","), "lxh-chapter--generate,lxh-chapter--move,lxh-chapter--store");
  check(`${vp.dir} no numbering`, !range.hasNumberedIndex, range);
  check(`${vp.dir} no meta block`, !range.hasMeta, range);
  check(`${vp.dir} no image tag`, !range.hasTag, range);
  check(`${vp.dir} no horizontal overflow`, !range.overflow, `${range.scrollWidth} > ${range.clientWidth}`);
  check(`${vp.dir} all chapters have image`, range.range.every((r) => !!r.image), range.range);

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
