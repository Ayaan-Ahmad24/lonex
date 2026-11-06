import { describe, expect, it } from "vitest";
import {
  buildContentSecurityPolicy,
  createNonce,
} from "@/lib/security/csp";

describe("Content-Security-Policy", () => {
  it("uses a nonce and strict-dynamic instead of unsafe-inline scripts", () => {
    const policy = buildContentSecurityPolicy({
      nonce: "test-nonce",
      dev: false,
      https: true,
    });

    expect(policy).toContain("'nonce-test-nonce'");
    expect(policy).toContain("'strict-dynamic'");
    expect(policy).not.toContain("script-src 'self' 'unsafe-inline'");
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("base-uri 'self'");
    expect(policy).toContain("form-action 'self'");
    expect(policy).toContain("upgrade-insecure-requests");
  });

  it("falls back to unsafe-inline without a nonce (static pages)", () => {
    const policy = buildContentSecurityPolicy({ dev: false, https: false });

    expect(policy).toContain("script-src 'self' 'unsafe-inline'");
    expect(policy).not.toContain("'nonce-");
    expect(policy).not.toContain("'strict-dynamic'");
    // The rest of the policy is still enforced.
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("base-uri 'self'");
    expect(policy).toContain("form-action 'self'");
  });

  it("allows eval only in development", () => {
    expect(
      buildContentSecurityPolicy({ nonce: "n", dev: true, https: false }),
    ).toContain("'unsafe-eval'");
    expect(
      buildContentSecurityPolicy({ nonce: "n", dev: false, https: false }),
    ).not.toContain("'unsafe-eval'");
  });

  it("allows websockets in development and not in production", () => {
    expect(
      buildContentSecurityPolicy({ nonce: "n", dev: true, https: false }),
    ).toContain("ws:");
    expect(
      buildContentSecurityPolicy({ nonce: "n", dev: false, https: false }),
    ).not.toContain("ws:");
  });

  it("generates a non-empty, distinct nonce", () => {
    const first = createNonce();
    const second = createNonce();

    expect(first.length).toBeGreaterThan(10);
    expect(first).not.toBe(second);
    expect(first).not.toContain("=");
  });
});
