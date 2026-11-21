import { createHash } from "node:crypto";
import { parseTrustedProxies } from "@/lib/security/trusted-proxies";
import {
  clearCounters,
  incrementCounter,
  readCounter,
} from "./rate-limit-store";

/**
 * Public model-verification throttle.
 *
 * Verification must not become an enumeration oracle. Attempts are counted per
 * client (when a client address can be trusted) and globally, in the existing
 * `rate_limit` table. Only hashed addresses are stored.
 */

export const VERIFY_WINDOW_SECONDS = 600;
export const VERIFY_MAX_ATTEMPTS_PER_CLIENT = 10;
export const VERIFY_MAX_ATTEMPTS_GLOBAL = 300;

function hashKey(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 40);
}

/**
 * Resolve a client address only when the deployment declares trusted proxies.
 * Without that declaration, forwarded headers are ignored and every anonymous
 * caller shares one bucket.
 */
export function resolveClientAddress(headers: Headers): string {
  const trusted = parseTrustedProxies(process.env.TRUSTED_PROXIES);

  if (trusted.length === 0) {
    return "untrusted";
  }

  const forwarded = headers.get("x-forwarded-for");

  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();

    if (first) {
      return first;
    }
  }

  return headers.get("x-real-ip")?.trim() || "unknown";
}

export function verificationThrottleKeys(address: string): {
  clientKey: string;
  globalKey: string;
} {
  return {
    clientKey: `verify:client:${hashKey(address)}`,
    globalKey: "verify:global",
  };
}

export async function isVerificationThrottled(
  address: string,
  now: number = Date.now(),
): Promise<boolean> {
  const { clientKey, globalKey } = verificationThrottleKeys(address);
  const [client, global] = await Promise.all([
    readCounter(clientKey, VERIFY_WINDOW_SECONDS, now),
    readCounter(globalKey, VERIFY_WINDOW_SECONDS, now),
  ]);

  return (
    (client.withinWindow && client.count >= VERIFY_MAX_ATTEMPTS_PER_CLIENT) ||
    (global.withinWindow && global.count >= VERIFY_MAX_ATTEMPTS_GLOBAL)
  );
}

export async function recordVerificationAttempt(
  address: string,
  now: number = Date.now(),
): Promise<void> {
  const { clientKey, globalKey } = verificationThrottleKeys(address);

  for (const key of [clientKey, globalKey]) {
    await incrementCounter(key, VERIFY_WINDOW_SECONDS, now);
  }
}

/** Test helper: clear verification counters. */
export async function clearVerificationThrottle(address: string): Promise<void> {
  const { clientKey, globalKey } = verificationThrottleKeys(address);

  await clearCounters([clientKey, globalKey]);
}
