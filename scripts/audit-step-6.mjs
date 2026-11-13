import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve("artifacts/lonex-step-6-research/audit");
await mkdir(OUT, { recursive: true });

const pages = ["/", "/solar", "/batteries", "/ev-bikes"];
const viewports = [
  { key: "desktop", width: 1440, height: 900 },
  { key: "mobile", width: 390, height: 844 },
];

const browser = await chromium.launch({ headless: true });

for (const vp of viewports) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  for (const route of pages) {
    const name = route === "/" ? "home" : route.slice(1);
    try {
      await page.goto(`http://localhost:3000${route}`, { waitUntil: "load", timeout: 60000 });
      await page.waitForTimeout(1200);
      const info = await page.evaluate(() => {
        const broken = Array.from(document.images)
          .filter((img) => !img.complete || img.naturalWidth === 0)
          .map((img) => img.currentSrc || img.src);
        const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
        return {
          title: document.title,
          height: document.documentElement.scrollHeight,
          broken,
          overflow,
        };
      });
      console.log(JSON.stringify({ route, vp: vp.key, ...info }));
      await page.screenshot({
        path: path.join(OUT, `${name}-${vp.key}.png`),
        fullPage: true,
        timeout: 45000,
      });
    } catch (e) {
      console.log("fail " + route + " " + String(e).split("\n")[0]);
    }
  }
  await context.close();
}

await browser.close();
