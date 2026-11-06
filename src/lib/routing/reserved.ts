/**
 * Central reserved public paths (decision 0001).
 *
 * Validation, the public_paths registry and any future import tooling must use
 * this single list. A module author must not remove entries.
 */

/** Reserved first path segment. Content may not own anything below these. */
export const RESERVED_TOP_LEVEL_SEGMENTS = [
  "admin",
  "api",
  "_next",
  "media",
  "assets",
  "uploads",
  "blog",
  "search",
  "verify",
  // LONEX static public pages. A category or blog slug must never shadow them.
  "about",
  "contact",
  "authorized-sellers",
] as const;

/** Fully reserved paths (including files served by the app or hosting). */
export const RESERVED_PATHS = [
  "/",
  "/sitemap.xml",
  "/robots.txt",
  "/favicon.ico",
] as const;

export type ReservedTopLevelSegment =
  (typeof RESERVED_TOP_LEVEL_SEGMENTS)[number];

const reservedSegments = new Set<string>(RESERVED_TOP_LEVEL_SEGMENTS);
const reservedPaths = new Set<string>(RESERVED_PATHS);

export function isReservedTopLevelSegment(segment: string): boolean {
  return reservedSegments.has(segment.toLowerCase());
}

export function isReservedPath(path: string): boolean {
  return reservedPaths.has(path.toLowerCase());
}
