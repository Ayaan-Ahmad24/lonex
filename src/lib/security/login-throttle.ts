import { createHash } from "node:crypto";
import {
  clearCounter,
  incrementCounter,
  readCounter,
} from "./rate-limit-store";

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
  const counter = await readCounter(
    accountThrottleKey(email),
    ACCOUNT_THROTTLE_WINDOW_SECONDS,
    now,
  );

  return counter.withinWindow && counter.count >= ACCOUNT_THROTTLE_MAX_FAILURES;
}

export async function recordAccountFailure(
  email: string,
  now: number = Date.now(),
): Promise<void> {
  await incrementCounter(
    accountThrottleKey(email),
    ACCOUNT_THROTTLE_WINDOW_SECONDS,
    now,
  );
}

export async function clearAccountFailures(email: string): Promise<void> {
  await clearCounter(accountThrottleKey(email));
}
