import { findInvalidTrustedProxies } from "@better-auth/core/utils/ip";

/**
 * Client-IP resolution policy for Better Auth rate limiting.
 *
 * X-Forwarded-For is client-controlled unless the application is reachable
 * only through a known reverse proxy. The safe defaults are:
 *
 * - TRUSTED_PROXIES set: walk the forwarded chain right-to-left and skip the
 *   listed proxy IPs/CIDRs. The first untrusted hop is the client.
 * - TRUSTED_PROXIES empty in production: ignore all forwarded IP headers.
 *   Better Auth then uses one shared bucket per path instead of a spoofable
 *   per-IP bucket.
 * - Development/test: Better Auth falls back to 127.0.0.1, so local work is
 *   unaffected.
 */
export type IpAddressConfig = {
  ipAddressHeaders?: string[];
  trustedProxies?: string[];
};

export function parseTrustedProxies(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function assertValidTrustedProxies(entries: string[]): void {
  const invalid = findInvalidTrustedProxies(entries);

  if (invalid.length > 0) {
    // Do not echo anything that could be sensitive; proxy ranges are not
    // secrets, but keep the message short and deterministic.
    throw new Error(
      `TRUSTED_PROXIES contains invalid IP/CIDR entries: ${invalid.join(", ")}`,
    );
  }
}

export function resolveIpAddressConfig(
  rawTrustedProxies: string | undefined = process.env.TRUSTED_PROXIES,
  nodeEnv: string = process.env.NODE_ENV ?? "development",
): IpAddressConfig {
  const trustedProxies = parseTrustedProxies(rawTrustedProxies);

  assertValidTrustedProxies(trustedProxies);

  if (trustedProxies.length > 0) {
    return {
      ipAddressHeaders: ["x-forwarded-for"],
      trustedProxies,
    };
  }

  if (nodeEnv === "production") {
    // Never trust a client-supplied forwarded header without a known proxy.
    return { ipAddressHeaders: [] };
  }

  // Development/test: leave Better Auth's localhost fallback in place.
  return {};
}
