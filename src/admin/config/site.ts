/**
 * LONEX deployment configuration.
 *
 * This application is built exclusively for LONEX. The admin shell and module
 * registry are still small reusable primitives, but the module list, brand and
 * public website are LONEX-specific and are not intended for other clients.
 */
export const siteConfig = {
  name: "LONEX",
  shortName: "LONEX",
  tagline: "Solar, EV and power solutions",
  description:
    "The official LONEX website for solar, electric mobility and power solutions.",
  brand: {
    red: "#CF0A0A",
    black: "#000000",
    white: "#FFFFFF",
    soft: "#F5EDED",
  },
  // Static module allowlist. Disabling an id removes its navigation entry and
  // makes its routes/handlers inaccessible; it never deletes module code.
  enabledModules: [
    "categories",
    "products",
    "sellers",
    "verification",
    "blog",
    "media",
    "settings",
    "users",
    "audit",
  ] as string[],
  adminPath: "/admin",
  admin: {
    productName: "LONEX Admin",
    logoText: "LX",
    accentColor: "#CF0A0A",
    accentSoftColor: "#FDF2F2",
    supportEmail: "support@lonex.example",
  },
} as const;

export type SiteConfig = typeof siteConfig;
