import { isReservedTopLevelSegment } from "@/lib/routing/reserved";

/**
 * Slug validation shared by categories, products and blog posts.
 *
 * Category and blog slugs are validated against the reserved top-level list
 * because they appear as, or immediately below, the first URL segment.
 */

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const CATEGORY_SLUG_MAX = 120;
export const PRODUCT_SLUG_MAX = 200;

export type SlugResult =
  | { ok: true; slug: string }
  | { ok: false; reason: string };

export function normalizeSlugInput(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function validateSlug(
  input: string,
  options: { max: number; reservedTopLevel: boolean },
): SlugResult {
  const slug = normalizeSlugInput(input);

  if (slug.length === 0) {
    return { ok: false, reason: "Slug is required." };
  }

  if (slug.length > options.max) {
    return {
      ok: false,
      reason: `Slug must be ${options.max} characters or fewer.`,
    };
  }

  if (!SLUG_PATTERN.test(slug)) {
    return {
      ok: false,
      reason:
        "Slug may contain lowercase letters, numbers and single dashes only.",
    };
  }

  if (options.reservedTopLevel && isReservedTopLevelSegment(slug)) {
    return { ok: false, reason: "This slug is reserved by the system." };
  }

  return { ok: true, slug };
}

export function validateCategorySlug(input: string): SlugResult {
  return validateSlug(input, {
    max: CATEGORY_SLUG_MAX,
    reservedTopLevel: true,
  });
}

export function validateProductSlug(input: string): SlugResult {
  return validateSlug(input, {
    max: PRODUCT_SLUG_MAX,
    reservedTopLevel: false,
  });
}

export function validateBlogSlug(input: string): SlugResult {
  return validateSlug(input, {
    max: PRODUCT_SLUG_MAX,
    reservedTopLevel: false,
  });
}

/** Derive a slug from a title when the editor leaves the field empty. */
export function slugFromTitle(title: string): string {
  return normalizeSlugInput(
    title
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-"),
  ).slice(0, PRODUCT_SLUG_MAX);
}
