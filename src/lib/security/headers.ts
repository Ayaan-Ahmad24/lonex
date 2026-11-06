export type SecurityHeader = { key: string; value: string };

/**
 * Static security headers applied to every response by next.config.ts.
 *
 * Content-Security-Policy is generated per request in src/proxy.ts so Next.js
 * can attach the nonce to its own scripts. HSTS is only emitted when the
 * deployment is actually served over HTTPS.
 */
export function buildSecurityHeaders(options: {
  https: boolean;
}): SecurityHeader[] {
  const headers: SecurityHeader[] = [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    {
      key: "Referrer-Policy",
      value: "strict-origin-when-cross-origin",
    },
    {
      key: "Permissions-Policy",
      value:
        "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
    },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    { key: "X-DNS-Prefetch-Control", value: "off" },
    { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  ];

  if (options.https) {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    });
  }

  return headers;
}
