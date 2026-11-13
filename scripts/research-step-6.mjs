import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve("artifacts/lonex-step-6-research/reference");
await mkdir(OUT, { recursive: true });

const TARGETS = [
  { key: "tesla-solar", label: "Tesla Solar Panels", url: "https://www.tesla.com/solarpanels" },
  { key: "enphase", label: "Enphase", url: "https://enphase.com/" },
  { key: "sunpower", label: "SunPower", url: "https://us.sunpower.com/" },
  { key: "tesla-powerwall", label: "Tesla Powerwall", url: "https://www.tesla.com/powerwall" },
  { key: "ecoflow", label: "EcoFlow Energy", url: "https://energy.ecoflow.com/us" },
  { key: "specialized-ebikes", label: "Specialized E-Bikes", url: "https://www.specialized.com/gb/en/shop/bikes/electric-bikes" },
  { key: "trek-ebikes", label: "Trek E-Bikes", url: "https://www.trekbikes.com/us/en_US/bikes/electric-bikes/c/B507/" },
  { key: "baymard-category", label: "Baymard Category Pages", url: "https://baymard.com/blog/ecommerce-category-page" },
];

const VIEWPORTS = [
  { key: "desktop", width: 1440, height: 900 },
  { key: "mobile", width: 390, height: 844 },
];

const DISMISS = [
  "Reject",
  "Reject all",
  "Decline",
  "Accept",
  "Accept all",
  "I agree",
  "Got it",
  "Close",
  "No thanks",
];

const report = [];

const browser = await chromium.launch({ headless: true });

for (const target of TARGETS) {
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      isMobile: vp.key === "mobile",
      userAgent:
        vp.key === "mobile"
          ? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
          : undefined,
    });
    const page = await context.newPage();
    const row = { key: target.key, label: target.label, url: target.url, viewport: vp.key, status: null, title: null, height: null, file: null, error: null, headings: [], fonts: [] };
    try {
      const res = await page.goto(target.url, { waitUntil: "domcontentloaded", timeout: 60000 });
      row.status = res ? res.status() : null;
      await page.waitForTimeout(2500);

      for (const label of DISMISS) {
        const btn = page.getByRole("button", { name: label, exact: false }).first();
        if (await btn.count().catch(() => 0)) {
          await btn.click({ timeout: 1500 }).catch(() => {});
          await page.waitForTimeout(400);
          break;
        }
      }

      await page.evaluate(async () => {
        const step = window.innerHeight * 0.9;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        window.scrollTo(0, 0);
      }).catch(() => {});
      await page.waitForTimeout(1200);

      row.title = await page.title();
      row.height = await page.evaluate(() => document.documentElement.scrollHeight);
      row.headings = await page.evaluate(() =>
        Array.from(document.querySelectorAll("h1, h2, h3"))
          .slice(0, 24)
          .map((el) => ({
            tag: el.tagName.toLowerCase(),
            text: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 90),
            size: getComputedStyle(el).fontSize,
            weight: getComputedStyle(el).fontWeight,
            family: getComputedStyle(el).fontFamily.split(",")[0].replace(/"/g, ""),
          }))
          .filter((h) => h.text),
      );
      row.fonts = await page.evaluate(() =>
        Array.from(document.querySelectorAll("body *")).slice(0, 400).reduce((acc, el) => {
          const f = getComputedStyle(el).fontFamily.split(",")[0].replace(/"/g, "").trim();
          if (f && !acc.includes(f)) acc.push(f);
          return acc;
        }, []).slice(0, 8),
      );

      const file = path.join(OUT, `${target.key}-${vp.key}.png`);
      await page.screenshot({ path: file, fullPage: true, timeout: 45000 });
      row.file = path.relative(process.cwd(), file).replace(/\\/g, "/");
    } catch (err) {
      row.error = String(err).split("\n")[0].slice(0, 300);
    }
    report.push(row);
    console.log(JSON.stringify({ key: row.key, vp: row.viewport, status: row.status, height: row.height, error: row.error }));
    await context.close();
  }
}

await writeFile(
  path.join(OUT, "reference-inspection.json"),
  JSON.stringify(report, null, 2),
  "utf8",
);

await browser.close();
