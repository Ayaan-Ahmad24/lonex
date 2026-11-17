import { readFileSync } from "node:fs";
import type { RowDataPacket } from "mysql2";
import { test, expect } from "@playwright/test";
import type { E2eFixtures } from "./fixtures";
import { FIXTURE_FILE } from "./fixtures";

let fixtures: E2eFixtures;

test.describe.configure({ mode: "serial" });

test.beforeAll(() => {
  fixtures = JSON.parse(readFileSync(FIXTURE_FILE, "utf8")) as E2eFixtures;
});

async function signIn(page: import("@playwright/test").Page, user: E2eFixtures["admin"]) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/admin");
}

test("homepage renders the branded LONEX experience", async ({ page }) => {
  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  await expect(page.locator("h1")).toContainText("Power for what's next.");
  await expect(page.locator("header")).toContainText("LONEX");
  await expect(page.locator("footer")).toContainText("LONEX");
  await expect(page.locator("body")).not.toContainText("Create Next App");
  await expect(page.locator("body")).not.toContainText("Deploy Now");
});

test("security headers are present and X-Powered-By is gone", async ({
  request,
}) => {
  const response = await request.get("/");
  const headers = response.headers();

  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["permissions-policy"]).toContain("camera=()");
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["content-security-policy"]).toContain("object-src 'none'");
  expect(headers["content-security-policy"]).toContain("base-uri 'self'");
  expect(headers["content-security-policy"]).toContain("form-action 'self'");
  expect(headers["x-powered-by"]).toBeUndefined();
});

test("statically prerendered pages use the documented CSP variant", async ({
  page,
}) => {
  const cspErrors: string[] = [];

  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      message.text().toLowerCase().includes("content security policy")
    ) {
      cspErrors.push(message.text());
    }
  });

  const response = await page.goto("/");
  const policy = response?.headers()["content-security-policy"] ?? "";

  // Next.js attaches nonces only to dynamically rendered responses. "/" is
  // statically prerendered, so the static variant is expected here. The
  // nonce/strict-dynamic branch stays covered by tests/unit/csp.test.ts.
  expect(policy).toContain("script-src 'self' 'unsafe-inline'");
  expect(policy).not.toContain("'nonce-");
  expect(policy).not.toContain("'strict-dynamic'");

  // The page must still boot with this policy.
  await page.waitForLoadState("networkidle");
  await expect(page.locator("h1")).toBeVisible();
  expect(cspErrors).toEqual([]);
});

test("unauthenticated admin requests are rejected", async ({ page, request }) => {
  await page.goto("/admin");
  await page.waitForURL("**/admin/login");

  const me = await request.get("/api/admin/me");
  expect(me.status()).toBe(401);

  const deactivate = await request.post(
    `/api/admin/users/${fixtures.target.id}/deactivate`,
    { headers: { origin: "http://127.0.0.1:3101" } },
  );
  expect(deactivate.status()).toBe(401);
});

test("login page renders the sign-in form", async ({ page }) => {
  await page.goto("/admin/login");

  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});

test("administrator can sign in and read permissions", async ({ page }) => {
  await signIn(page, fixtures.admin);

  await expect(page.getByRole("heading", { name: "LONEX dashboard" })).toBeVisible();
  await expect(page.locator("body")).toContainText(fixtures.admin.email);

  const me = await page.request.get("/api/admin/me");
  expect(me.status()).toBe(200);

  const body = (await me.json()) as { permissions: string[] };
  expect(body.permissions).toContain("users.manage");
});

test("deactivation rejects a foreign origin and validates the id", async ({
  page,
}) => {
  await signIn(page, fixtures.admin);

  const foreignOrigin = await page.request.post(
    `/api/admin/users/${fixtures.target.id}/deactivate`,
    { headers: { origin: "https://evil.example" } },
  );
  expect(foreignOrigin.status()).toBe(403);

  const invalidId = await page.request.post(
    "/api/admin/users/not-a-uuid/deactivate",
    { headers: { origin: "http://127.0.0.1:3101" } },
  );
  expect(invalidId.status()).toBe(400);

  const self = await page.request.post(
    `/api/admin/users/${fixtures.admin.id}/deactivate`,
    { headers: { origin: "http://127.0.0.1:3101" } },
  );
  expect(self.status()).toBe(400);
  expect(await self.json()).toEqual({ status: "cannot_deactivate_self" });
});

test("authenticated deactivation succeeds atomically", async ({ page }) => {
  await signIn(page, fixtures.admin);

  const response = await page.request.post(
    `/api/admin/users/${fixtures.target.id}/deactivate`,
    { headers: { origin: "http://127.0.0.1:3101" } },
  );

  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ status: "ok" });

  const state = await readState(fixtures.target.id);

  expect(state.isActive).toBe(0);
  expect(state.sessions).toBe(0);
  expect(state.auditRows).toBe(1);
  expect(state.auditActor).toBe(fixtures.admin.id);
});

test("editor cannot deactivate another user", async ({ browser }) => {
  const context = await browser.newContext({
    baseURL: "http://127.0.0.1:3101",
  });
  const page = await context.newPage();

  try {
    await signIn(page, fixtures.editor);

    const response = await page.request.post(
      `/api/admin/users/${fixtures.target.id}/deactivate`,
      { headers: { origin: "http://127.0.0.1:3101" } },
    );

    expect(response.status()).toBe(403);
  } finally {
    await context.close();
  }
});

test("an inactive user cannot sign in", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(fixtures.inactive.email);
  await page.getByLabel("Password").fill(fixtures.inactive.password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(
    page
      .getByRole("main")
      .getByRole("alert")
      .filter({ hasText: "Invalid email or password" }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test("logout invalidates the session", async ({ page }) => {
  await signIn(page, fixtures.admin);
  await expect(page.getByRole("heading", { name: "LONEX dashboard" })).toBeVisible();

  await page.getByRole("button", { name: "Sign out" }).click();
  await page.waitForURL("**/admin/login");

  const me = await page.request.get("/api/admin/me");
  expect(me.status()).toBe(401);
});

test("rotating X-Forwarded-For does not reset the login limiter (SEC-03)", async ({
  request,
}) => {
  let saw429 = false;

  for (let i = 0; i < 15 && !saw429; i += 1) {
    const response = await request.post("/api/auth/sign-in/email", {
      headers: {
        "content-type": "application/json",
        origin: "http://127.0.0.1:3101",
        "x-forwarded-for": `203.0.113.${i + 1}`,
      },
      data: {
        email: `nobody-${i}-${Date.now()}@example.invalid`,
        password: "WrongPassword123!",
      },
    });

    saw429 = response.status() === 429;
  }

  expect(saw429).toBe(true);

  // A brand-new spoofed address must not open a fresh bucket.
  const retry = await request.post("/api/auth/sign-in/email", {
    headers: {
      "content-type": "application/json",
      origin: "http://127.0.0.1:3101",
      "x-forwarded-for": "198.51.100.200",
    },
    data: {
      email: `nobody-final-${Date.now()}@example.invalid`,
      password: "WrongPassword123!",
    },
  });

  expect(retry.status()).toBe(429);
});

async function readState(userId: string) {
  const mysql = await import("mysql2/promise");
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  try {
    const [userRows] = await connection.execute<RowDataPacket[]>(
      "SELECT is_active FROM `user` WHERE id = ?",
      [userId],
    );
    const [sessionRows] = await connection.execute<RowDataPacket[]>(
      "SELECT COUNT(*) AS total FROM `session` WHERE user_id = ?",
      [userId],
    );
    const [auditRows] = await connection.execute<RowDataPacket[]>(
      "SELECT COUNT(*) AS total, MAX(actor_user_id) AS actor FROM audit_log WHERE target_id = ?",
      [userId],
    );

    return {
      isActive: Number(userRows[0]?.is_active ?? -1),
      sessions: Number(sessionRows[0]?.total ?? -1),
      auditRows: Number(auditRows[0]?.total ?? -1),
      auditActor: auditRows[0]?.actor as string | null,
    };
  } finally {
    await connection.end();
  }
}
