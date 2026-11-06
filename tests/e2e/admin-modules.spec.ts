import { readFileSync } from "node:fs";
import {
  test,
  expect,
  request as playwrightRequest,
  type BrowserContext,
  type Page,
} from "@playwright/test";
import type { E2eFixtures } from "./fixtures";
import {
  FIXTURE_FILE,
  createExtraUser,
  createVerificationProduct,
  removeExtraUser,
  removeVerificationProduct,
} from "./fixtures";

let fixtures: E2eFixtures;

type Cookies = Awaited<ReturnType<BrowserContext["storageState"]>>["cookies"];

let adminCookies: Cookies;
let editorCookies: Cookies;

const BASE_URL = "http://127.0.0.1:3101";

test.describe.configure({ mode: "serial" });

/**
 * Sign in once per role through the real auth API and reuse the cookies.
 * The login UI and the rate limiter are covered by foundation.spec.ts; doing
 * nine UI sign-ins here would exhaust the documented 10-per-5-minutes limit.
 */
async function cookiesFor(user: E2eFixtures["admin"]): Promise<Cookies> {
  const context = await playwrightRequest.newContext({ baseURL: BASE_URL });

  try {
    const response = await context.post("/api/auth/sign-in/email", {
      headers: { origin: BASE_URL, "content-type": "application/json" },
      data: { email: user.email, password: user.password },
    });

    expect(response.ok(), `API sign-in failed for ${user.email}`).toBe(true);

    return (await context.storageState()).cookies;
  } finally {
    await context.dispose();
  }
}

async function authenticate(page: Page, cookies: Cookies) {
  await page.context().addCookies(cookies);
  await page.goto("/admin");
  await page.waitForURL("**/admin");
}

test.beforeAll(async () => {
  fixtures = JSON.parse(readFileSync(FIXTURE_FILE, "utf8")) as E2eFixtures;
  [adminCookies, editorCookies] = await Promise.all([
    cookiesFor(fixtures.admin),
    cookiesFor(fixtures.editor),
  ]);
});

function pngBuffer(): Buffer {
  const buffer = Buffer.alloc(24);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buffer, 0);
  buffer.writeUInt32BE(13, 8);
  buffer.write("IHDR", 12, "ascii");
  buffer.writeUInt32BE(32, 16);
  buffer.writeUInt32BE(32, 20);

  return buffer;
}

/**
 * Random Crockford-base32 code. Avoids four identical characters in a row,
 * which the verification validator rejects.
 */
function randomVerificationCode(): string {
  const alphabet = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  let body = "";

  while (body.length < 12) {
    const char = alphabet[Math.floor(Math.random() * alphabet.length)];

    if (body.length >= 3 && body.slice(-3) === char.repeat(3)) {
      continue;
    }

    body += char;
  }

  return `LNX-${body.slice(0, 4)}-${body.slice(4, 8)}-${body.slice(8, 12)}`;
}

test("administrator dashboard shows authorized modules", async ({ page }) => {
  await authenticate(page, adminCookies);

  await expect(page.getByRole("heading", { name: "LONEX dashboard" })).toBeVisible();
  await expect(page.locator("body")).toContainText(fixtures.admin.email);

  const nav = page.getByRole("navigation", { name: "Admin navigation" });

  for (const label of ["Media", "Settings", "Users", "Audit", "Categories", "Products"]) {
    await expect(nav.getByRole("link", { name: label })).toBeVisible();
  }
});

test("editor sees only permitted modules and is server-blocked elsewhere", async ({
  page,
}) => {
  await authenticate(page, editorCookies);

  const nav = page.getByRole("navigation", { name: "Admin navigation" });

  await expect(nav.getByRole("link", { name: "Media" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Users" })).toHaveCount(0);
  await expect(nav.getByRole("link", { name: "Settings" })).toHaveCount(0);
  await expect(nav.getByRole("link", { name: "Audit" })).toHaveCount(0);

  await page.goto("/admin/users");
  await page.waitForURL("**/admin/forbidden");
  await expect(
    page.getByRole("heading", { name: "You do not have access" }),
  ).toBeVisible();

  await page.goto("/admin/settings");
  await page.waitForURL("**/admin/forbidden");
});

test("users list and detail are read-only for account creation", async ({
  page,
}) => {
  await authenticate(page, adminCookies);
  await page.goto("/admin/users");

  await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();
  await expect(page.locator("body")).toContainText(fixtures.editor.email);
  await expect(
    page.getByText(/provisioned only through the CLI/i),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /create user/i }),
  ).toHaveCount(0);

  await page.goto(`/admin/users/${fixtures.editor.id}`);
  await expect(page.getByRole("heading", { name: "E2E Fixture" })).toBeVisible();
  await expect(page.getByText(fixtures.editor.email).first()).toBeVisible();
  await expect(page.getByText(/Role changes are audited/i)).toBeVisible();
});

test("settings save is validated, audited and restorable", async ({ page }) => {
  await authenticate(page, adminCookies);
  await page.goto("/admin/settings");

  const siteName = page.getByLabel("Website name");
  await expect(siteName).toHaveValue("LONEX");

  await siteName.fill("E2E Site");
  await page.getByLabel("Tagline").fill("E2E tagline");
  await page.getByRole("button", { name: "Save settings" }).click();

  await expect(page.getByRole("status")).toContainText("Settings saved");
  await page.reload();
  await expect(page.getByLabel("Website name")).toHaveValue("E2E Site");

  // Invalid phone characters are rejected by the server-side Zod schema.
  // `type=tel` has no native constraint, so the request reaches the action.
  await page.getByLabel("Contact phone").fill("abc");
  await page.getByRole("button", { name: "Save settings" }).click();
  await expect(page.getByText(/Could not save/i)).toBeVisible();
  await expect(page.getByText(/valid phone number/i).first()).toBeVisible();

  // Restore so the rest of the run sees the documented default.
  await page.getByLabel("Contact phone").fill("");
  await page.getByLabel("Website name").fill("LONEX");
  await page.getByLabel("Tagline").fill("Solar, EV and power solutions");
  await page.getByRole("button", { name: "Save settings" }).click();
  await expect(page.getByRole("status")).toContainText("Settings saved");
});

test("media rejects SVG, accepts a validated PNG and deletes it", async ({
  page,
}) => {
  await authenticate(page, adminCookies);
  await page.goto("/admin/media");

  await page
    .getByLabel("Choose media file")
    .setInputFiles({
      name: "e2e-vector.svg",
      mimeType: "image/svg+xml",
      buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'),
    });
  await page.getByLabel("Alt text").fill("Should be rejected");
  await page.getByRole("button", { name: "Upload file" }).click();
  await expect(page.getByText(/Could not save/i)).toBeVisible();

  await page
    .getByLabel("Choose media file")
    .setInputFiles({
      name: "e2e-photo.png",
      mimeType: "image/png",
      buffer: pngBuffer(),
    });
  await page.getByLabel("Alt text").fill("E2E photo");
  await page.getByRole("button", { name: "Upload file" }).click();
  await expect(page.getByText(/uploaded to private storage/i)).toBeVisible();

  await expect(page.getByRole("link", { name: "e2e-photo.png" })).toBeVisible();
  await page.getByRole("link", { name: "e2e-photo.png" }).click();

  await expect(page.getByText("image/png").first()).toBeVisible();
  await expect(page.getByText("32 × 32")).toBeVisible();

  await page.getByRole("button", { name: "Delete media" }).click();
  await page.getByRole("button", { name: "Delete permanently" }).click();
  await page.waitForURL("**/admin/media");
  await expect(page.getByRole("link", { name: "e2e-photo.png" })).toHaveCount(0);
});

test("audit viewer is read-only and lists recent changes", async ({ page }) => {
  await authenticate(page, adminCookies);
  await page.goto("/admin/audit");

  await expect(page.getByRole("heading", { name: "Audit log" })).toBeVisible();
  await expect(page.getByText(/Read-only record/i)).toBeVisible();

  await expect(page.getByRole("button", { name: /delete/i })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /edit/i })).toHaveCount(0);

  // Settings rows are older than the page/media rows, so search for them
  // instead of relying on them being on page 1.
  await page.getByPlaceholder("Search action, target or actor").fill("settings.");
  await page.getByRole("button", { name: "Apply" }).click();
  await expect(page.getByText("settings.update").first()).toBeVisible();

  await page.getByPlaceholder("Search action, target or actor").fill("page.");
  await page.getByRole("button", { name: "Apply" }).click();
  await expect(page.getByText(/page\./).first()).toBeVisible();
});

test("mobile navigation opens and closes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await authenticate(page, adminCookies);

  await page.getByRole("button", { name: "Open navigation" }).click();

  // The close control is the backdrop behind the panel; click the exposed
  // area to the right of the panel rather than its intercepted centre.
  await page
    .getByRole("button", { name: "Close navigation" })
    .click({ position: { x: 370, y: 300 } });
  await expect(
    page.getByRole("button", { name: "Close navigation" }),
  ).toHaveCount(0);
});

test("deleting a user redirects to the list with a confirmation toast", async ({
  page,
}) => {
  // Use a dedicated account: the shared `target` fixture is deactivated by
  // foundation.spec.ts, which runs after this file.
  const victim = await createExtraUser("e2e-delete-target");

  try {
    await authenticate(page, adminCookies);
    await page.goto(`/admin/users/${victim.id}`);

    await expect(
      page.getByRole("heading", { name: "E2E Fixture" }),
    ).toBeVisible();
    await expect(page.getByText(victim.email).first()).toBeVisible();
    await page.getByRole("button", { name: "Delete user" }).click();
    await page.getByRole("button", { name: "Delete permanently" }).click();

    // The deleted detail route must not render a 404: the action redirects to
    // the list and the flash message is shown there.
    await page.waitForURL(/\/admin\/users(\?|$)/);
    await expect(page.locator(".Toastify__toast")).toContainText("User deleted");
    await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();

    // The flash parameters are stripped so a reload does not repeat the toast.
    await expect(page).toHaveURL(/\/admin\/users$/);
  } finally {
    await removeExtraUser(victim.id);
  }
});

test("generating a verification code shows the raw code and a toast", async ({
  page,
}) => {
  // A product with no code row starts on the "Generate code" path. Once the
  // action revalidates the route the row becomes registered, so the action
  // result must still be captured before/while the list updates.
  const product = await createVerificationProduct("e2e-verify");

  try {
    await authenticate(page, adminCookies);
    await page.goto("/admin/verification");

    const row = page.getByRole("row").filter({ hasText: product.name });
    await expect(row).toBeVisible();
    await expect(row).toContainText("Not registered");

    await row.getByRole("button", { name: "Generate code" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toContainText("Generate verification code?");
    await dialog.getByRole("button", { name: "Generate and show code" }).click();

    await expect(page.locator(".Toastify__toast")).toContainText(
      "Verification code generated",
    );
    await expect(row).toContainText("Active");

    // The raw code is returned once and kept in this tab only.
    const stored = await page.evaluate(() =>
      sessionStorage.getItem("lonex.admin.verificationCodes"),
    );
    expect(stored).toBeTruthy();

    const codes = JSON.parse(stored as string) as Record<string, string>;
    const code = codes[product.id];

    expect(code).toMatch(/^LNX-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}$/);
    await expect(row).toContainText(code);

    // The same flow is offered as a rotation once a code exists.
    await expect(
      row.getByRole("button", { name: "Rotate code" }),
    ).toBeVisible();
  } finally {
    await removeVerificationProduct(product.id);
  }
});

test("a custom verification code closes the form and survives a reload", async ({
  page,
}) => {
  await authenticate(page, adminCookies);
  await page.goto("/admin/verification");

  // Each run needs a fresh code: digests are unique across products, so a
  // hard-coded value would collide with the previous run's row.
  const code = randomVerificationCode();
  const row = page
    .getByRole("row")
    .filter({ has: page.getByRole("button", { name: "Set custom code" }) })
    .filter({ hasText: "Active" })
    .first();

  await row.getByRole("button", { name: "Set custom code" }).click();
  await page.getByLabel("Verification code").fill(code);
  await page.getByLabel("Confirm code").fill(code);
  await page.getByRole("button", { name: "Assign code" }).click();

  await expect(page.locator(".Toastify__toast")).toContainText(
    "Verification code saved",
  );
  // The form closes after a successful assignment instead of staying open.
  await expect(page.locator('input[name="code"]')).toHaveCount(0);
  await expect(page.getByText(code, { exact: true })).toBeVisible();

  // The raw code is never stored server-side; it is restored from the
  // tab-scoped session store after a reload.
  await page.reload();
  await expect(page.getByText(code, { exact: true })).toBeVisible();
});

test("sign out returns to the login page and confirms with a toast", async ({
  page,
}) => {
  await authenticate(page, adminCookies);

  // Runs last: signing out revokes the shared API session used by this suite.
  await page.getByRole("button", { name: "Sign out" }).first().click();

  await page.waitForURL("**/admin/login");
  await expect(page.getByRole("heading", { name: "LONEX Admin" })).toBeVisible();
  await expect(page.locator(".Toastify__toast")).toContainText("Signed out");
});
