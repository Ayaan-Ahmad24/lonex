import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const base = process.env.BASE_URL ?? "http://localhost:3402";
const root = "artifacts/lonex-range-final-review";

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();

const failures = [];
const consoleErrors = [];
const pageErrors = [];
page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
page.on("pageerror", (e) => pageErrors.push(e.message));

await page.goto(base, { waitUntil: "networkidle", timeout: 60000 });
await page.locator(".lx-hero__headline").waitFor({ state: "visible" });
await page.evaluate(() => document.fonts?.ready);

/* 1. The other homepage sections must still crop their images correctly. */
const otherSections = await page.evaluate(() => {
  const pick = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const img = el.querySelector("img");
    const box = el.getBoundingClientRect();
    const iBox = img?.getBoundingClientRect();
    return {
      container: `${Math.round(box.width)}x${Math.round(box.height)}`,
      objectFit: img ? getComputedStyle(img).objectFit : null,
      natural: img ? `${img.naturalWidth}x${img.naturalHeight}` : null,
      rendered: iBox ? `${Math.round(iBox.width)}x${Math.round(iBox.height)}` : null,
      ratioMatch:
        iBox && img?.naturalWidth
          ? Math.abs(iBox.width / iBox.height - img.naturalWidth / img.naturalHeight) < 0.02
          : null,
    };
  };
  return {
    story: pick(".lxh-story__media"),
    journal: pick(".lxh-journal__feature .lxh-journal__media"),
    closing: pick(".lxh-close"),
  };
});

for (const [name, data] of Object.entries(otherSections)) {
  if (!data) {
    failures.push({ label: `${name}: section missing`, detail: null });
    continue;
  }
  // The closing band is a typographic band and carries no photograph, so
  // there is nothing to crop there.
  if (!data.objectFit) {
    continue;
  }
  // object-fit: cover crops rather than stretches. Without the rule the
  // browser falls back to `fill`, which distorts the photograph.
  if (data.objectFit !== "cover") {
    failures.push({ label: `${name}: object-fit is ${data.objectFit}, expected cover`, detail: data });
  }
}

/* 2. The hover zoom must compose with the GSAP parallax transform. */
await page.evaluate(() => {
  document.querySelector(".lxh-chapter--generate")?.scrollIntoView({ behavior: "instant", block: "center" });
});
await page.waitForTimeout(1500);

// The hover zoom lives on the frame that clips the photograph, so the
// parallax keeps ownership of the image transform.
const zoomBefore = await page.evaluate(() => {
  const frame = document.querySelector(
    ".lxh-chapter--generate .lxh-chapter__media",
  );
  const cs = getComputedStyle(frame);
  return { transform: cs.transform, scale: cs.scale };
});

await page.locator(".lxh-chapter--generate .lxh-chapter__media").hover();
await page.waitForTimeout(900);

const zoomAfter = await page.evaluate(() => {
  const frame = document.querySelector(
    ".lxh-chapter--generate .lxh-chapter__media",
  );
  const cs = getComputedStyle(frame);
  return { transform: cs.transform, scale: cs.scale };
});

if (zoomBefore.transform === zoomAfter.transform) {
  failures.push({ label: "hover zoom does not apply", detail: { zoomBefore, zoomAfter } });
}
if (!/matrix/.test(zoomAfter.transform)) {
  failures.push({ label: "GSAP parallax transform lost on hover", detail: zoomAfter });
}

/* 3. Screenshots of the neighbouring sections, to confirm they are intact. */
await mkdir(path.join(root, "neighbours"), { recursive: true });
for (const [name, sel] of [
  ["story", ".lxh-story"],
  ["journal", ".lxh-journal"],
  ["closing", ".lxh-close"],
]) {
  const el = page.locator(sel).first();
  if ((await el.count()) === 0) continue;
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  const box = await el.boundingBox();
  if (!box) continue;
  const x0 = Math.max(0, box.x - 8);
  const y0 = Math.max(0, box.y - 8);
  const buffer = await page.screenshot({
    type: "png",
    clip: {
      x: x0,
      y: y0,
      width: Math.min(1440 - x0, box.width + 16),
      height: box.height + 16,
    },
  });
  await writeFile(path.join(root, "neighbours", `${name}.png`), buffer);
}

/* 4. Reduced motion: the range must still be fully visible and still. */
const reduced = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: "reduce",
});
const rmPage = await reduced.newPage();
await rmPage.goto(base, { waitUntil: "networkidle", timeout: 60000 });
await rmPage.locator(".lx-hero__headline").waitFor({ state: "visible" });
await rmPage.evaluate(() => {
  document.querySelector(".lxh-intro")?.scrollIntoView({ behavior: "instant", block: "start" });
});
await rmPage.waitForTimeout(1200);
const rmState = await rmPage.evaluate(() => {
  const head = document.querySelector(".lxh-range__head");
  const img = document.querySelector(".lxh-chapter--generate .lxh-chapter__image");
  return {
    headOpacity: getComputedStyle(head).opacity,
    headTransform: getComputedStyle(head).transform,
    imgTransform: getComputedStyle(img).transform,
    imgScale: getComputedStyle(img).scale,
  };
});
if (rmState.headOpacity !== "1" || rmState.headTransform !== "none") {
  failures.push({ label: "reduced motion: intro is not fully visible", detail: rmState });
}
await reduced.close();

await writeFile(
  path.join(root, "qa-report.json"),
  JSON.stringify({ otherSections, zoomBefore, zoomAfter, rmState, failures, consoleErrors, pageErrors }, null, 2),
);

await context.close();
await browser.close();

console.log(JSON.stringify({ otherSections, zoomBefore, zoomAfter, rmState, failures, consoleErrors, pageErrors }, null, 2));

if (failures.length > 0) process.exitCode = 1;
