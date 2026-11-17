import type { NextConfig } from "next";
import { buildSecurityHeaders } from "./src/lib/security/headers";
import { buildContentSecurityPolicy } from "./src/lib/security/csp";

const httpsDeployment =
  process.env.ENABLE_HSTS === "1" ||
  (process.env.BETTER_AUTH_URL ?? "").startsWith("https://");

const contentSecurityPolicy = buildContentSecurityPolicy({
  dev: process.env.NODE_ENV !== "production",
  https: httpsDeployment,
});

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // The floating dev indicator is a development affordance, not part of the
  // public site. Compile and runtime errors are still surfaced.
  devIndicators: false,
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Allow Next.js to optimize images served from the private media route.
    // These URLs are same-origin (/media/:id) and are protected by the
    // published-content reference check in src/lib/public/media.ts.
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "localhost",
        port: "3000",
        pathname: "/media/**",
      },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  allowedDevOrigins: [
  "*.ngrok-free.app",
],

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          ...buildSecurityHeaders({ https: httpsDeployment }),
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
      {
        source: "/api/admin/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
    ];
  },
};

export default nextConfig;
