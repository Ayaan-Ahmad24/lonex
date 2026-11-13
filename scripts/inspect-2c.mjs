import { chromium } from "playwright";

const base = process.env.BASE_URL ?? "http://localhost:3400";
const browser = await chromium.launch({ headless: true });
for (const reducedMotion of ["no-preference", "reduce"]) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion,
  });
  const page = await context.newPage();
  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  const info = await page.evaluate(() => {
    const box = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        sel,
        x: Math.round(r.x),
        y: Math.round(r.y),
        w: Math.round(r.width),
        h: Math.round(r.height),
        display: cs.display,
        gridArea: cs.gridArea,
        gridColumn: cs.gridColumn,
        gridRow: cs.gridRow,
        opacity: cs.opacity,
        visibility: cs.visibility,
        color: cs.color,
        fontSize: cs.fontSize,
        text: el.textContent?.trim().slice(0, 60),
      };
    };
    return {
      inner: box(".lx-hero__inner"),
      text: box(".lx-hero__text"),
      figure: box(".lx-hero__figure"),
      eyebrow: box(".lx-hero__eyebrow"),
      headline: box(".lx-hero__headline"),
      lead: box(".lx-hero__lead"),
      cta: box(".lx-hero__cta-group"),
      range: box(".lx-hero__range-bar"),
      hero: box(".lx-hero"),
      styles: Array.from(document.styleSheets)
        .flatMap((s) => {
          try {
            return Array.from(s.cssRules);
          } catch {
            return [];
          }
        })
        .filter((r) => r.cssText?.includes(".lx-hero__inner"))
        .map((r) => r.cssText.slice(0, 300)),
    };
  });
  console.log(`\n=== ${reducedMotion} ===\n`, JSON.stringify(info, null, 2));
  await page.screenshot({ path: `artifacts/lonex-milestone-2c-review/_quick/hero-${reducedMotion}.png` });
  await context.close();
}
await browser.close();
