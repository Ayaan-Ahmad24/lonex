import { chromium } from "playwright";

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
await page.goto("http://localhost:3000/about", { waitUntil: "load" });
await page.waitForTimeout(700);

await page.click('a[href="#pillars"]');
await page.waitForTimeout(1500);
const anchor = await page.evaluate(() => {
  const section = document.querySelector("#pillars").getBoundingClientRect();
  const header = document.querySelector(".site-header__bar").getBoundingClientRect();
  return {
    sectionTop: Math.round(section.top),
    headerBottom: Math.round(header.bottom),
    gap: Math.round(section.top - header.bottom),
    hash: location.hash,
  };
});
console.log("anchor", JSON.stringify(anchor));

await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(400);
const media = page.locator(".lxa-pillar--generate .lxa-pillar__media");
await media.scrollIntoViewIfNeeded();
await page.waitForTimeout(700);
const before = await page.evaluate(
  () => getComputedStyle(document.querySelector(".lxa-pillar--generate .lxa-pillar__image")).transform,
);
await media.hover();
await page.waitForTimeout(1100);
const after = await page.evaluate(
  () => getComputedStyle(document.querySelector(".lxa-pillar--generate .lxa-pillar__image")).transform,
);
console.log("hover", JSON.stringify({ before, after }));

// Keyboard focus ring on the first CTA.
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(300);
await page.keyboard.press("Tab");
await page.keyboard.press("Tab");
const focus = await page.evaluate(() => {
  const el = document.activeElement;
  return { tag: el.tagName, text: (el.textContent || "").trim().slice(0, 40) };
});
console.log("focus", JSON.stringify(focus));

await browser.close();
