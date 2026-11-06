import { createHash, randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { rateLimit } from "@/db/schema";

/**
 * Per-account sign-in throttle.
 *
 * Better Auth's built-in limiter keys by client IP + path. That is not enough
 * on its own: a rotating IP must not grant unlimited attempts against one
 * account. This module adds a second, account-scoped counter in the existing
 * `rate_limit` table and is enforced from auth hooks.
 *
 * The key contains a SHA-256 digest of the normalised email, never the email
 * itself. Rows are only read/written by the server.
 */

export const ACCOUNT_THROTTLE_WINDOW_SECONDS = 300;
export const ACCOUNT_THROTTLE_MAX_FAILURES = 5;
export const ACCOUNT_THROTTLE_KEY_PREFIX = "acct-login:";

export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function accountThrottleKey(email: string): string {
  const digest = createHash("sha256")
    .update(normaliseEmail(email))
    .digest("hex");

  return `${ACCOUNT_THROTTLE_KEY_PREFIX}${digest}`;
}

export async function isAccountThrottled(
  email: string,
  now: number = Date.now(),
): Promise<boolean> {
  const key = accountThrottleKey(email);
  const [row] = await db
    .select({
      count: rateLimit.count,
      lastRequest: rateLimit.lastRequest,
    })
    .from(rateLimit)
    .where(sql`${rateLimit.key} = ${key}`)
    .limit(1);

  if (!row) {
    return false;
  }

  const windowMs = ACCOUNT_THROTTLE_WINDOW_SECONDS * 1000;
  const withinWindow = now - Number(row.lastRequest) < windowMs;

  return withinWindow && Number(row.count) >= ACCOUNT_THROTTLE_MAX_FAILURES;
}

export async function recordAccountFailure(
  email: string,
  now: number = Date.now(),
): Promise<void> {
  const key = accountThrottleKey(email);
  const windowStart = now - ACCOUNT_THROTTLE_WINDOW_SECONDS * 1000;

  await db.execute(sql`
    INSERT INTO \`rate_limit\` (\`id\`, \`key\`, \`count\`, \`last_request\`)
    VALUES (${randomUUID()}, ${key}, 1, ${now})
    ON DUPLICATE KEY UPDATE
      \`count\` = IF(\`last_request\` < ${windowStart}, 1, \`count\` + 1),
      \`last_request\` = ${now}
  `);
}

export async function clearAccountFailures(email: string): Promise<void> {
  const key = accountThrottleKey(email);

  await db.execute(sql`DELETE FROM \`rate_limit\` WHERE \`key\` = ${key}`);
}
