import { describe, expect, it } from "vitest";
import {
  MAX_PUBLIC_PATH_LENGTH,
  normalizePublicPath,
  validateClaimablePath,
  validatePageSlug,
} from "@/lib/routing/path";
import {
  isReservedPath,
  isReservedTopLevelSegment,
} from "@/lib/routing/reserved";

describe("reserved paths", () => {
  it("reserves first segments case-insensitively", () => {
    expect(isReservedTopLevelSegment("admin")).toBe(true);
    expect(isReservedTopLevelSegment("API")).toBe(true);
    expect(isReservedTopLevelSegment("blog")).toBe(true);
    expect(isReservedTopLevelSegment("about")).toBe(true);
  });

  it("reserves exact files and the homepage", () => {
    expect(isReservedPath("/")).toBe(true);
    expect(isReservedPath("/robots.txt")).toBe(true);
    expect(isReservedPath("/SITEMAP.XML")).toBe(true);
    expect(isReservedPath("/about")).toBe(false);
  });
});

describe("public path normalization", () => {
  it("lowercases and normalizes slashes", () => {
    const result = normalizePublicPath("  //About//Team/  ");

    expect(result).toEqual({
      ok: true,
      path: "/about/team",
      segments: ["about", "team"],
    });
  });

  it("normalizes the homepage", () => {
    expect(normalizePublicPath("/")).toEqual({
      ok: true,
      path: "/",
      segments: [],
    });
  });

  it("decodes percent-encoding once", () => {
    const result = normalizePublicPath("/a%62out");

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.path).toBe("/about");
    }
  });

  it("rejects invalid percent encoding", () => {
    expect(normalizePublicPath("/bad%zz").ok).toBe(false);
  });

  it("rejects query strings and fragments", () => {
    expect(normalizePublicPath("/about?x=1").ok).toBe(false);
    expect(normalizePublicPath("/about#team").ok).toBe(false);
  });

  it("rejects backslashes, nulls and control characters", () => {
    expect(normalizePublicPath("/a\\b").ok).toBe(false);
    expect(normalizePublicPath("/a\u0000b").ok).toBe(false);
    expect(normalizePublicPath("/a\u0007b").ok).toBe(false);
  });

  it("rejects dot segments", () => {
    expect(normalizePublicPath("/a/../b").ok).toBe(false);
    expect(normalizePublicPath("/./a").ok).toBe(false);
  });

  it("rejects invalid characters and empty input", () => {
    expect(normalizePublicPath("").ok).toBe(false);
    expect(normalizePublicPath("/has space").ok).toBe(false);
    expect(normalizePublicPath("/<script>").ok).toBe(false);
  });

  it("enforces the maximum length", () => {
    const tooLong = `/${"a".repeat(MAX_PUBLIC_PATH_LENGTH + 1)}`;

    expect(normalizePublicPath(tooLong).ok).toBe(false);
  });
});

describe("page slug validation", () => {
  it("accepts a simple slug and derives the path", () => {
    expect(validatePageSlug(" About-Us ")).toEqual({
      ok: true,
      slug: "about-us",
      path: "/about-us",
    });
  });

  it("strips leading and trailing slashes", () => {
    const result = validatePageSlug("/hello/");

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.slug).toBe("hello");
      expect(result.path).toBe("/hello");
    }
  });

  it("rejects empty, uppercase-normalized-invalid and spaced slugs", () => {
    expect(validatePageSlug("").ok).toBe(false);
    expect(validatePageSlug("has space").ok).toBe(false);
    expect(validatePageSlug("double--dash").ok).toBe(false);
    expect(validatePageSlug("-leading").ok).toBe(false);
    expect(validatePageSlug("trailing-").ok).toBe(false);
  });

  it("rejects reserved top-level slugs", () => {
    for (const slug of ["admin", "api", "blog", "verify", "media"]) {
      expect(validatePageSlug(slug).ok).toBe(false);
    }
  });

  it("rejects slugs longer than 120 characters", () => {
    expect(validatePageSlug("a".repeat(121)).ok).toBe(false);
  });
});

describe("claimable path validation", () => {
  it("accepts a normal nested path", () => {
    expect(validateClaimablePath("/solar/rooftop")).toEqual({
      ok: true,
      path: "/solar/rooftop",
    });
  });

  it("rejects the homepage", () => {
    const result = validateClaimablePath("/");

    expect(result.ok).toBe(false);
  });

  it("rejects reserved files and prefixes", () => {
    expect(validateClaimablePath("/robots.txt").ok).toBe(false);
    expect(validateClaimablePath("/admin/anything").ok).toBe(false);
    expect(validateClaimablePath("/api/v1").ok).toBe(false);
  });
});
