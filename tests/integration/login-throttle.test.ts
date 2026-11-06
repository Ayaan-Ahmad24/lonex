import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACCOUNT_THROTTLE_MAX_FAILURES,
  accountThrottleKey,
  clearAccountFailures,
  isAccountThrottled,
  recordAccountFailure,
} from "@/lib/security/login-throttle";
import { closeDbPool } from "@/db/client";
import {
  closeTestPool,
  createTestPool,
  deleteRateLimitKey,
  uniqueEmail,
  type TestDb,
} from "../helpers/db";

let pool: TestDb;
const email = uniqueEmail("vitest-throttle");

beforeAll(async () => {
  pool = createTestPool();
});

afterAll(async () => {
  await deleteRateLimitKey(pool, accountThrottleKey(email));
  await closeTestPool(pool);
  await closeDbPool();
});

describe("account-based sign-in throttle", () => {
  it("hashes the email into the rate-limit key", () => {
    const key = accountThrottleKey(email);

    expect(key.startsWith("acct-login:")).toBe(true);
    expect(key).not.toContain("@");
    expect(key).not.toContain(email);
  });

  it("starts unthrottled", async () => {
    expect(await isAccountThrottled(email)).toBe(false);
  });

  it(`throttles after ${ACCOUNT_THROTTLE_MAX_FAILURES} failures`, async () => {
    for (let i = 0; i < ACCOUNT_THROTTLE_MAX_FAILURES; i += 1) {
      expect(await isAccountThrottled(email)).toBe(false);
      await recordAccountFailure(email);
    }

    expect(await isAccountThrottled(email)).toBe(true);
  });

  it("stays throttled on further failures", async () => {
    await recordAccountFailure(email);

    expect(await isAccountThrottled(email)).toBe(true);
  });

  it("clears failures after a successful sign-in", async () => {
    await clearAccountFailures(email);

    expect(await isAccountThrottled(email)).toBe(false);
  });

  it("ignores a stale window", async () => {
    const stale = Date.now() - 10 * 60 * 1000;

    await clearAccountFailures(email);

    for (let i = 0; i < ACCOUNT_THROTTLE_MAX_FAILURES; i += 1) {
      await recordAccountFailure(email, stale);
    }

    // The row is old enough that a new attempt starts a fresh window.
    expect(await isAccountThrottled(email)).toBe(false);
  });
});
