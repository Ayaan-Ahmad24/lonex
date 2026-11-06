import {
  isReservedPath,
  isReservedTopLevelSegment,
} from "./reserved";

/**
 * Canonical public path normalization (decision 0001).
 *
 * Rules:
 * - lowercase
 * - exactly one leading slash, no trailing slash
 * - no query string or fragment
 * - percent-decoded once
 * - repeated slashes collapsed
 * - only `/` may be a single slash
 *
 * Two inputs that normalize to the same value are the same public path.
 */

export const MAX_PUBLIC_PATH_LENGTH = 200;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SEGMENT_PATTERN = /^[a-z0-9]+(?:[-._~][a-z0-9]+)*$/;

export type PathValidation =
  | { ok: true; path: string; segments: string[] }
  | { ok: false; reason: string };

function safeDecode(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

export function normalizePublicPath(input: string): PathValidation {
  const trimmed = input.trim();

  if (trimmed.length === 0) {
    return { ok: false, reason: "Path is required." };
  }

  if (trimmed.includes("?") || trimmed.includes("#")) {
    return { ok: false, reason: "Path must not contain a query or fragment." };
  }

  if (trimmed.includes("\\") || trimmed.includes("\0")) {
    return { ok: false, reason: "Path contains invalid characters." };
  }

  const decoded = safeDecode(trimmed);

  if (decoded === null) {
    return { ok: false, reason: "Path contains invalid percent-encoding." };
  }

  if (decoded.length > MAX_PUBLIC_PATH_LENGTH + 2) {
    return { ok: false, reason: "Path is too long." };
  }

  if (/[\u0000-\u001f\u007f]/.test(decoded)) {
    return { ok: false, reason: "Path contains control characters." };
  }

  const withoutLeading = decoded.replace(/^\/+/, "");
  const withoutTrailing = withoutLeading.replace(/\/+$/, "");
  const collapsed = withoutTrailing.replace(/\/{2,}/g, "/");

  if (collapsed.length === 0) {
    return { ok: true, path: "/", segments: [] };
  }

  if (collapsed.length > MAX_PUBLIC_PATH_LENGTH) {
    return { ok: false, reason: "Path is too long." };
  }

  const segments = collapsed.split("/");

  for (const segment of segments) {
    if (segment === "." || segment === "..") {
      return { ok: false, reason: "Path must not contain dot segments." };
    }

    const normalized = segment.toLowerCase();

    if (!SEGMENT_PATTERN.test(normalized)) {
      return {
        ok: false,
        reason:
          "Path segments may contain lowercase letters, numbers, dots, underscores, tildes and single dashes.",
      };
    }
  }

  return {
    ok: true,
    path: `/${segments.map((segment) => segment.toLowerCase()).join("/")}`,
    segments: segments.map((segment) => segment.toLowerCase()),
  };
}

export type SlugValidation =
  | { ok: true; slug: string; path: string }
  | { ok: false; reason: string };

/**
 * Validate a single page slug. The stored value and the public path are
 * derived from the same function so they cannot drift.
 */
export function validatePageSlug(input: string): SlugValidation {
  const slug = input.trim().toLowerCase().replace(/^\/+|\/+$/g, "");

  if (slug.length === 0) {
    return { ok: false, reason: "Slug is required." };
  }

  if (slug.length > 120) {
    return { ok: false, reason: "Slug must be 120 characters or fewer." };
  }

  if (!SLUG_PATTERN.test(slug)) {
    return {
      ok: false,
      reason:
        "Slug may contain lowercase letters, numbers and single dashes only.",
    };
  }

  if (isReservedTopLevelSegment(slug)) {
    return { ok: false, reason: "This slug is reserved by the system." };
  }

  const path = `/${slug}`;

  if (isReservedPath(path)) {
    return { ok: false, reason: "This path is reserved by the system." };
  }

  return { ok: true, slug, path };
}

export type ClaimValidation =
  | { ok: true; path: string }
  | { ok: false; reason: string };

/** Validate a path that a content module wants to own. */
export function validateClaimablePath(input: string): ClaimValidation {
  const normalized = normalizePublicPath(input);

  if (!normalized.ok) {
    return normalized;
  }

  if (normalized.path === "/") {
    return {
      ok: false,
      reason: "The homepage is reserved and cannot be owned by content.",
    };
  }

  if (isReservedPath(normalized.path)) {
    return { ok: false, reason: "This path is reserved by the system." };
  }

  const first = normalized.segments[0];

  if (isReservedTopLevelSegment(first)) {
    return {
      ok: false,
      reason: `The "${first}" path prefix is reserved by the system.`,
    };
  }

  return { ok: true, path: normalized.path };
}
