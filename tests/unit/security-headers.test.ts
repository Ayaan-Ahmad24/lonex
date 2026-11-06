import { describe, expect, it } from "vitest";
import { buildSecurityHeaders } from "@/lib/security/headers";

function headerMap(headers: ReturnType<typeof buildSecurityHeaders>) {
  return new Map(headers.map((header) => [header.key, header.value]));
}

describe("static security headers", () => {
  it("sets core headers without HSTS on HTTP", () => {
    const headers = headerMap(buildSecurityHeaders({ https: false }));

    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("X-Frame-Options")).toBe("DENY");
    expect(headers.get("Referrer-Policy")).toBe(
      "strict-origin-when-cross-origin",
    );
    expect(headers.get("Permissions-Policy")).toContain("camera=()");
    expect(headers.get("Permissions-Policy")).toContain("payment=()");
    expect(headers.get("Strict-Transport-Security")).toBeUndefined();
    expect(headers.get("X-Powered-By")).toBeUndefined();
  });

  it("sets HSTS for HTTPS deployments", () => {
    const headers = headerMap(buildSecurityHeaders({ https: true }));

    expect(headers.get("Strict-Transport-Security")).toBe(
      "max-age=63072000; includeSubDomains; preload",
    );
  });
});
