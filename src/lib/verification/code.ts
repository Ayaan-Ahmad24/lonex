import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { getModelCodeSecret, getServerEnv } from "@/lib/env";

/**
 * LONEX product-model verification codes.
 *
 * One code is registered per product model. Only a keyed HMAC-SHA256 digest is
 * stored; the raw code is returned once at generation time. A digest match
 * proves the model is registered, not that a physical unit is authentic.
 */

const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const BODY_LENGTH = 12;
const PREFIX = "LNX";
const NORMALIZED_PATTERN = new RegExp(`^[${ALPHABET}]{${BODY_LENGTH}}$`);

export const MODEL_CODE_PREFIX = PREFIX;

function randomBody(): string {
  let body = "";

  for (let index = 0; index < BODY_LENGTH; index += 1) {
    body += ALPHABET[randomInt(0, ALPHABET.length)];
  }

  return body;
}

/** Generate a raw, human-transcribable code. Never store the result. */
export function generateModelCode(): string {
  const body = randomBody();

  return `${PREFIX}-${body.slice(0, 4)}-${body.slice(4, 8)}-${body.slice(8, 12)}`;
}

/**
 * Normalize user input to the canonical code format.
 * Accepts lowercase, spaces and missing dashes; returns null for anything that
 * cannot be a LONEX code.
 */
export function normalizeModelCode(input: string): string | null {
  const compact = input.toUpperCase().replace(/[^0-9A-Z]/g, "");

  const body = compact.startsWith(PREFIX)
    ? compact.slice(PREFIX.length)
    : compact;

  if (!NORMALIZED_PATTERN.test(body)) {
    return null;
  }

  return `${PREFIX}-${body.slice(0, 4)}-${body.slice(4, 8)}-${body.slice(8, 12)}`;
}

/**
 * Minimum code body length for administrator-entered codes.
 */
export const MIN_CODE_BODY_LENGTH = 12;

/**
 * Validate an administrator-entered verification code.
 *
 * Returns an object with `ok` and either a normalized code or a reason.
 * Rules:
 * - Must normalize to the canonical LNX-XXXX-XXXX-XXXX format.
 * - Body must be at least 12 alphanumeric characters.
 * - No repeated sequences (4+ identical characters).
 */
export function validateModelCode(input: string):
  | { ok: true; normalized: string }
  | { ok: false; reason: string } {
  const normalized = normalizeModelCode(input);

  if (!normalized) {
    return {
      ok: false,
      reason:
        "Code must use the format LNX-XXXX-XXXX-XXXX with letters and digits only.",
    };
  }

  const body = normalized.slice(PREFIX.length).replace(/-/g, "");

  if (body.length < MIN_CODE_BODY_LENGTH) {
    return {
      ok: false,
      reason: `Code body must be at least ${MIN_CODE_BODY_LENGTH} characters.`,
    };
  }

  // Reject repeated sequences (4+ identical characters).
  const repeatedPattern = /(.)\1{3,}/;
  if (repeatedPattern.test(body)) {
    return {
      ok: false,
      reason: "Code must not contain repeated character sequences.",
    };
  }

  return { ok: true, normalized };
}

/** Keyed digest. The secret never leaves the server. */
export function digestModelCode(rawCode: string): string {
  const normalized = normalizeModelCode(rawCode);

  if (!normalized) {
    throw new Error("Cannot digest an invalid model code.");
  }

  return createHmac("sha256", getModelCodeSecret(getServerEnv()))
    .update(normalized)
    .digest("hex");
}

/** Constant-time comparison helper for tests and defensive checks. */
export function digestsEqual(a: string, b: string): boolean {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}
