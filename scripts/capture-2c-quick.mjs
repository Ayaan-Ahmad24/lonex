import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const base = process.env.BASE_URL ?? "http://localhost:3400";
const out = "artifacts/lonex-milestone-2c-review/_quick";
await mkdir(out, { recursive: true });

const browser = await chromium.launch({ headless: true });
const errors = [];

for (const size of [
  { name: "1440", width: 1440, height: 900 },
  { name: "1024", width: 1024, height: 768 },
  { name: "768", width: 768, height: 1024 },
  { name: "390", width: 390, height: 844 },
  { name: "360", width: 360, height: 780 },
]) {
  const context = await browser.newContext({
    viewport: { width: size.width, height: size.height },
  });
  const page = await context.newPage();
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`${size.name}: ${msg.text()}`);
  });
  page.on("pageerror", (err) =>
    errors.push(`${size.name}: PAGE: ${err.message}`),
  );

  const response = await page.goto(`${base}/`, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
  await page.waitForTimeout(700);
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.7;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 100));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(500);

  const metrics = await page.evaluate(() => ({
    overflowX:
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
    height: document.body.scrollHeight,
    brokenImages: Array.from(document.images)
      .filter(
        (img) =>
          img.getBoundingClientRect().width > 0 &&
          (!img.complete || img.naturalWidth === 0),
      )
      .map((img) => img.currentSrc || img.src),
  }));

  console.log(size.name, response?.status(), JSON.stringify(metrics));

  await page.screenshot({ path: `${out}/${size.name}-fold.png` });
  await page.screenshot({
    path: `${out}/${size.name}-full.png`,
    fullPage: true,
  });

  if (size.name === "1440" || size.name === "390") {
    for (const [name, selector] of [
      ["range", "#range"],
      ["story", "#story"],
      ["models", "#models"],
      ["registry", "#registry"],
      ["sellers", "#sellers"],
      ["journal", "#journal"],
      ["closing", ".lxh-close"],
    ]) {
      const loc = page.locator(selector);
      if ((await loc.count()) > 0) {
        await page.evaluate(
          ([sel]) => {
            const el = document.querySelector(sel);
            if (el) {
              window.scrollTo(
                0,
                el.getBoundingClientRect().top + window.scrollY - 92,
              );
            }
          },
          [selector],
        );
        await page.waitForTimeout(300);
        await loc.screenshot({ path: `${out}/${size.name}-section-${name}.png` });
      }
    }
  }

  await context.close();
}

console.log("ERRORS", JSON.stringify(errors, null, 2));
await browser.close();
