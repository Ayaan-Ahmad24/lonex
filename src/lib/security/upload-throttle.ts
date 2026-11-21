import {
  incrementCounter,
  readCounter,
} from "./rate-limit-store";

/**
 * Per-account upload throttle.
 *
 * Reuses the existing `rate_limit` table (also used by login throttling) so
 * no new database table is required. Keys are scoped to the authenticated
 * user ID, so one user cannot exhaust another's upload allowance.
 *
 * Limit: 20 uploads per authenticated admin per 5 minutes.
 */

export const UPLOAD_THROTTLE_WINDOW_SECONDS = 300;
export const UPLOAD_THROTTLE_MAX_UPLOADS = 20;
export const UPLOAD_THROTTLE_KEY_PREFIX = "upload:";

export function uploadThrottleKey(userId: string): string {
  return `${UPLOAD_THROTTLE_KEY_PREFIX}${userId}`;
}

export async function isUploadThrottled(
  userId: string,
  now: number = Date.now(),
): Promise<boolean> {
  const counter = await readCounter(
    uploadThrottleKey(userId),
    UPLOAD_THROTTLE_WINDOW_SECONDS,
    now,
  );

  return counter.withinWindow && counter.count >= UPLOAD_THROTTLE_MAX_UPLOADS;
}

export async function recordUploadAttempt(
  userId: string,
  now: number = Date.now(),
): Promise<void> {
  await incrementCounter(
    uploadThrottleKey(userId),
    UPLOAD_THROTTLE_WINDOW_SECONDS,
    now,
  );
}
