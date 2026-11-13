// Step 8 QA: capture every verification state at 1440 and the success state at
// 390. Requires the temporary QA digest to be installed on verification code
// row 12 and a clean verification throttle (scripts/qa-clean-throttle.mjs).
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = "artifacts/lonex-step-8-review/states";
const SUCCESS_CODE = process.env.QA_SUCCESS_CODE ?? "LNX-4C7K-92XM-8TRW";
const INVALID_CODE = "LNX-0000-0000-0000";

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

const consoleErrors = [];
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("pageerror", (error) => consoleErrors.push(String(error)));

const panel = page.locator(".lxv-panel");
const input = page.locator("#code");

async function submit(code) {
  await input.fill(code);
  await page.locator(".lxv-submit").click();
}

await page.goto(`${BASE}/verify`, { waitUntil: "load", timeout: 120000 });
await page.waitForTimeout(900);
// The sticky header paints over a tall element capture; it is not part of the
// verification panel, so hide it for these focused state screenshots only.
await page.addStyleTag({
  content:
    ".site-header { display: none !important; } nextjs-portal { display: none !important; }",
});
await page.locator("#verify").scrollIntoViewIfNeeded();
await page.waitForTimeout(400);

// 1. Loading ---------------------------------------------------------------
let delayed = true;
await page.route("**/verify", async (route) => {
  if (delayed && route.request().method() === "POST") {
    await new Promise((resolve) => setTimeout(resolve, 1400));
  }
  await route.continue();
});

await input.fill(SUCCESS_CODE);
await page.locator(".lxv-submit").click();
await page.waitForTimeout(420);
await panel.screenshot({ path: `${OUT}/state-loading-1440.png` });
await page.locator(".lxv-result").waitFor({ timeout: 30000 });
delayed = false;
await page.unroute("**/verify");
await page.locator(".lxv-result").screenshot({ path: `${OUT}/state-success-1440-result.png` });
await panel.screenshot({ path: `${OUT}/state-success-1440.png` });
await page.screenshot({ path: `${OUT}/state-success-1440-viewport.png` });
await page.waitForTimeout(400);

// 2. Success at mobile ----------------------------------------------------
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(700);
await page.locator("#verify").scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
await panel.screenshot({ path: `${OUT}/state-success-390.png` });

// 3. Reset back to desktop ------------------------------------------------
await page.setViewportSize({ width: 1440, height: 900 });
await page.waitForTimeout(500);
await page.getByRole("button", { name: "Check another code" }).click();
await page.waitForTimeout(300);

// 4. Unavailable (POST aborted before it reaches the server) ---------------
await page.route("**/verify", async (route) => {
  if (route.request().method() === "POST") {
    await route.abort("failed");
    return;
  }
  await route.continue();
});

await submit(INVALID_CODE);
await page.locator(".lxv-state--unavailable").waitFor({ timeout: 30000 });
await page.waitForTimeout(400);
await panel.screenshot({ path: `${OUT}/state-unavailable-1440.png` });
await page.unroute("**/verify");

// 5. Invalid / no match ---------------------------------------------------
// The retry re-submits the invalid code now that the route is restored.
await page.getByRole("button", { name: "Retry the check" }).click();
await page.locator(".lxv-state--error").waitFor({ timeout: 30000 });
await page.waitForTimeout(400);
await panel.screenshot({ path: `${OUT}/state-error-1440.png` });
await page.screenshot({ path: `${OUT}/state-error-1440-viewport.png` });

// 6. Throttled ------------------------------------------------------------
await page.getByRole("button", { name: "Try another code" }).click();
await page.waitForTimeout(250);

let throttled = false;
for (let attempt = 0; attempt < 12; attempt += 1) {
  await submit(INVALID_CODE);
  try {
    await page.locator(".lxv-state--throttled").waitFor({ timeout: 12000 });
    throttled = true;
    break;
  } catch {
    await page.waitForTimeout(500);
  }
}

if (!throttled) {
  throw new Error("Throttled state was never reached.");
}

await page.waitForTimeout(400);
await panel.screenshot({ path: `${OUT}/state-throttled-1440.png` });

console.log(JSON.stringify({ consoleErrors, throttled }, null, 2));
await browser.close();
