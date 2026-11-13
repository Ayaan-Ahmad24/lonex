import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

for (const route of ["/solar", "/batteries", "/ev-bikes"]) {
  const errors = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text().slice(0, 200));
  });
  await page.goto(`http://localhost:3000${route}`, { waitUntil: "load", timeout: 60000 });
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 150));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1500);
  const info = await page.evaluate(() => ({
    h1: document.querySelector("h1")?.textContent?.trim(),
    height: document.documentElement.scrollHeight,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    broken: Array.from(document.images)
      .filter((i) => i.naturalWidth === 0)
      .map((i) => i.currentSrc || i.src),
  }));
  console.log(JSON.stringify({ route, ...info, errors: errors.slice(0, 3) }, null, 2));
}

await browser.close();
