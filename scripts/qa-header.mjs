// Header interaction QA: node scripts/qa-header.mjs
import { chromium } from "playwright";

const base = process.env.BASE_URL ?? "http://localhost:3000";
const browser = await chromium.launch();
const results = [];

function check(name, condition, detail = "") {
  results.push({ name, pass: Boolean(condition), detail });
  console.log(`${condition ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
}

async function pageAt(width, height) {
  const context = await browser.newContext({
    viewport: { width, height },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${base}/`, { waitUntil: "networkidle", timeout: 120_000 });
  return { context, page, errors };
}

// Desktop
{
  const { context, page, errors } = await pageAt(1440, 900);
  const before = await page.evaluate(() => document.documentElement.scrollHeight);

  const trigger = page.locator('[data-nav-menu="products"]');
  await trigger.focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(250);

  check(
    "Enter opens products menu",
    (await trigger.getAttribute("aria-expanded")) === "true",
  );
  check(
    "Focus moves to first category link",
    await page
      .locator(".site-mega a[href]")
      .first()
      .evaluate((el) => el === document.activeElement),
  );

  const after = await page.evaluate(() => document.documentElement.scrollHeight);
  check("Mega menu does not shift layout", before === after, `${before} vs ${after}`);

  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  check(
    "Escape closes and returns focus",
    (await trigger.getAttribute("aria-expanded")) === "false" &&
      (await trigger.evaluate((el) => el === document.activeElement)),
  );

  // Space also opens.
  await page.keyboard.press(" ");
  await page.waitForTimeout(200);
  check(
    "Space opens products menu",
    (await trigger.getAttribute("aria-expanded")) === "true",
  );
  await page.keyboard.press("Escape");

  // Outside click closes.
  await trigger.click();
  await page.waitForTimeout(200);
  await page.mouse.click(700, 700);
  await page.waitForTimeout(200);
  check(
    "Outside click closes menu",
    (await trigger.getAttribute("aria-expanded")) === "false",
  );

  // Company flyout keyboard focus.
  const company = page.locator('[data-nav-menu="company"]');
  await company.focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(200);
  check(
    "Enter opens company flyout",
    (await company.getAttribute("aria-expanded")) === "true",
  );
  check(
    "Company focus moves into flyout",
    await page
      .locator(".site-flyout a[href]")
      .first()
      .evaluate((el) => el === document.activeElement),
  );
  await page.keyboard.press("Tab");
  check(
    "Tab reaches second company link",
    (await page.evaluate(() => document.activeElement?.textContent ?? "")).includes(
      "Authorized Sellers",
    ),
  );
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  check(
    "Escape closes company flyout",
    (await company.getAttribute("aria-expanded")) === "false",
  );

  // Hamburger is hidden on desktop.
  check(
    "Mobile toggle hidden on desktop",
    !(await page.locator("[data-nav-toggle]").isVisible()),
  );

  // Hover opens on pointer devices.
  await page.mouse.move(560, 38);
  await page.waitForTimeout(200);
  check(
    "Hover opens products menu",
    (await trigger.getAttribute("aria-expanded")) === "true",
  );
  await page.mouse.move(720, 700);
  await page.waitForTimeout(300);
  check(
    "Leaving the nav closes the menu",
    (await trigger.getAttribute("aria-expanded")) === "false",
  );

  check("No console errors (desktop)", errors.length === 0, errors.join(" | "));
  await context.close();
}

// Mobile
{
  const { context, page, errors } = await pageAt(390, 844);
  const toggle = page.locator("[data-nav-toggle]");
  await toggle.click();
  await page.waitForTimeout(350);

  check("Drawer opens", await page.locator(".site-drawer").getAttribute("data-open") === "true");
  check(
    "Drawer focus moves to close button",
    await page
      .locator(".site-drawer__close")
      .evaluate((el) => el === document.activeElement),
  );
  check(
    "Body scroll is locked",
    (await page.evaluate(() => getComputedStyle(document.body).overflow)) === "hidden",
  );

  const accordion = page.locator('[data-drawer-accordion="products"]');
  await accordion.click();
  await page.waitForTimeout(200);
  check(
    "Products accordion opens",
    (await accordion.getAttribute("aria-expanded")) === "true",
  );
  check(
    "Category links are reachable",
    (await page.locator(".site-drawer__category").count()) === 3,
  );

  const companyAccordion = page.locator('[data-drawer-accordion="company"]');
  await companyAccordion.click();
  await page.waitForTimeout(200);
  check(
    "Company accordion opens",
    (await companyAccordion.getAttribute("aria-expanded")) === "true",
  );

  // Focus trap: shift-tab from close wraps to the last focusable item.
  await page.locator(".site-drawer__close").focus();
  await page.keyboard.press("Shift+Tab");
  check(
    "Focus trap wraps backwards",
    await page.evaluate(() => {
      const active = document.activeElement;
      const drawer = document.querySelector(".site-drawer__panel");
      return Boolean(drawer && active && drawer.contains(active));
    }),
  );

  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  check(
    "Escape closes drawer",
    (await page.locator(".site-drawer").getAttribute("data-open")) === "false" &&
      (await page.evaluate(() => getComputedStyle(document.body).overflow)) !== "hidden",
  );
  check(
    "Focus returns to menu toggle",
    await toggle.evaluate((el) => el === document.activeElement),
  );

  check("No console errors (mobile)", errors.length === 0, errors.join(" | "));
  await context.close();
}

await browser.close();

const failed = results.filter((result) => !result.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length > 0) {
  process.exitCode = 1;
}
