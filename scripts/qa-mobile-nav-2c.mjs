import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
});
const page = await context.newPage();
await page.goto("http://localhost:3401/", { waitUntil: "networkidle" });
const read = () =>
  page.evaluate(() => {
    const drawer = document.querySelector(".site-drawer");
    const toggle = document.querySelector(".site-menu-toggle");
    return {
      drawerOpen: drawer?.getAttribute("data-open") ?? null,
      drawerAriaHidden: drawer?.getAttribute("aria-hidden") ?? null,
      drawerInert: drawer?.hasAttribute("inert") ?? null,
      toggleExpanded: toggle?.getAttribute("aria-expanded") ?? null,
      toggleLabel: toggle?.getAttribute("aria-label") ?? null,
      bodyOverflow: getComputedStyle(document.body).overflow,
    };
  });

const closedBefore = await read();
await page.locator(".site-menu-toggle").click();
await page.waitForTimeout(450);
const opened = await read();
await page.keyboard.press("Escape");
await page.waitForTimeout(550);
const closedAfter = await read();
console.log(
  JSON.stringify({ closedBefore, opened, closedAfter }, null, 2),
);
await browser.close();
