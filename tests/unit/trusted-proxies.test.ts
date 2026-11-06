import { describe, expect, it } from "vitest";
import { getIPFromHeader } from "@better-auth/core/utils/ip";
import {
  parseTrustedProxies,
  resolveIpAddressConfig,
} from "@/lib/security/trusted-proxies";

describe("trusted proxy policy (SEC-03)", () => {
  it("parses comma-separated proxies and ignores blanks", () => {
    expect(parseTrustedProxies("10.0.0.0/8, 192.0.2.10 ,")).toEqual([
      "10.0.0.0/8",
      "192.0.2.10",
    ]);
  });

  it("rejects malformed proxy entries", () => {
    expect(() => resolveIpAddressConfig("10.0.0.0/99")).toThrow(
      /invalid IP\/CIDR/,
    );
    expect(() => resolveIpAddressConfig("not-an-ip")).toThrow(
      /invalid IP\/CIDR/,
    );
  });

  it("does not trust forwarded headers in production without configured proxies", () => {
    expect(resolveIpAddressConfig(undefined, "production")).toEqual({
      ipAddressHeaders: [],
    });
  });

  it("trusts the configured proxy chain in production", () => {
    expect(resolveIpAddressConfig("10.0.0.0/8", "production")).toEqual({
      ipAddressHeaders: ["x-forwarded-for"],
      trustedProxies: ["10.0.0.0/8"],
    });
  });

  it("leaves the development localhost fallback alone", () => {
    expect(resolveIpAddressConfig(undefined, "development")).toEqual({});
    expect(resolveIpAddressConfig(undefined, "test")).toEqual({});
  });

  it("ignores a spoofed left-most value when the proxy chain is trusted", () => {
    // Client sent "9.9.9.9"; the trusted proxy appended the real client IP.
    const resolved = getIPFromHeader("9.9.9.9, 203.0.113.7", {
      trustedProxies: ["10.0.0.0/8"],
    });

    expect(resolved).toBe("203.0.113.7");
  });

  it("returns null for a multi-value header when no proxy is trusted", () => {
    // Better Auth refuses to guess instead of trusting the spoofable leftmost
    // entry.
    expect(getIPFromHeader("1.2.3.4, 5.6.7.8")).toBeNull();
  });

  it("accepts a single-value header when no proxy is configured", () => {
    expect(getIPFromHeader("203.0.113.7")).toBe("203.0.113.7");
  });
});
