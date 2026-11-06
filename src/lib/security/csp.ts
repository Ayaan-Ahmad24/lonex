/**
 * Content-Security-Policy.
 *
 * Next.js only attaches a nonce to script tags on dynamically rendered pages.
 * The Phase 01 public homepage is statically prerendered, so the default policy
 * allows inline scripts (`'unsafe-inline'`) while still restricting sources,
 * frames, objects, forms and base URLs. A nonce/strict-dynamic variant is kept
 * for dynamic or admin-only surfaces that opt into it later.
 *
 * This trade-off is documented in docs/progress/SPRINT_01_FOUNDATION_SECURITY_QA.md.
 */
export function buildContentSecurityPolicy(options: {
  dev: boolean;
  https: boolean;
  nonce?: string;
}): string {
  const scriptSrc = ["'self'"];

  if (options.nonce) {
    scriptSrc.push(`'nonce-${options.nonce}'`, "'strict-dynamic'");
  } else {
    scriptSrc.push("'unsafe-inline'");
  }

  if (options.dev) {
    // React Fast Refresh and the Next.js dev overlay need eval.
    scriptSrc.push("'unsafe-eval'");
  }

  const connectSrc = ["'self'"];

  if (options.dev) {
    connectSrc.push("ws:", "wss:");
  }

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSrc.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self' data:",
    `connect-src ${connectSrc.join(" ")}`,
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];

  if (options.https) {
    directives.push("upgrade-insecure-requests");
  }

  return directives.join("; ");
}

export function createNonce(): string {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);

  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}
