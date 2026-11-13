import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const base = process.env.BASE_URL ?? "http://localhost:3400";
const out = "artifacts/lonex-milestone-2c-review/_quick";
await mkdir(out, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 360, height: 780 },
});
const page = await context.newPage();
await page.goto(`${base}/`, { waitUntil: "networkidle" });
await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
await page.waitForTimeout(600);
await page.evaluate(async () => {
  const step = window.innerHeight * 0.6;
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 90));
  }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(400);

for (const [name, selector] of [
  ["range", "#range"],
  ["story", "#story"],
  ["models", "#models"],
  ["journal", "#journal"],
  ["closing", ".lxh-close"],
  ["sellers", "#sellers"],
]) {
  const loc = page.locator(selector);
  await page.evaluate(
    ([sel]) => {
      const el = document.querySelector(sel);
      if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 80);
    },
    [selector],
  );
  await page.waitForTimeout(300);
  await loc.screenshot({ path: `${out}/360-sec-${name}.png` });
}

const heroRange = await page.evaluate(() => {
  const bar = document.querySelector(".lx-hero__range-bar");
  if (!bar) return "missing";
  const r = bar.getBoundingClientRect();
  return {
    x: Math.round(r.x),
    w: Math.round(r.width),
    text: bar.textContent?.trim(),
    children: bar.children.length,
  };
});
console.log("heroRange", JSON.stringify(heroRange));

await browser.close();
