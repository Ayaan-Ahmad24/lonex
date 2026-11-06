/**
 * Client-agnostic admin contracts.
 *
 * The core never imports a client configuration or a business module. A
 * deployment supplies a brand configuration plus a static, trusted list of
 * module definitions. Nothing here is read from the database.
 */

export const ADMIN_MODULE_GROUPS = ["content", "library", "system"] as const;

export type AdminModuleGroup = (typeof ADMIN_MODULE_GROUPS)[number];

export const ADMIN_ICONS = [
  "dashboard",
  "users",
  "settings",
  "media",
  "pages",
  "audit",
  "shield",
  "categories",
  "products",
  "sellers",
  "verification",
  "blog",
] as const;

export type AdminIconName = (typeof ADMIN_ICONS)[number];

export type AdminBrand = {
  /** Admin product name shown in the shell. */
  productName: string;
  /** Short mark shown next to the product name. */
  logoText: string;
  /** Brand accent used sparingly for active navigation and primary actions. */
  accentColor: string;
  /** Very light accent used for active navigation backgrounds. */
  accentSoftColor: string;
  /** Optional public-facing support address shown in the shell. */
  supportEmail?: string;
};

export type AdminConfig = {
  brand: AdminBrand;
  /** `/admin` by default. Every module path must live below it. */
  adminPath: string;
  /** Static allowlist of module ids. A disabled module is not routable. */
  enabledModules: readonly string[];
};

export type AdminModuleDefinition = {
  /** Stable, lowercase identifier. Used by configuration and tests. */
  id: string;
  title: string;
  description: string;
  navigationLabel?: string;
  /** Route root, for example `/admin/users`. */
  basePath: string;
  icon: AdminIconName;
  group: AdminModuleGroup;
  /** Modules are sorted ascending inside their group. */
  order: number;
  /** Permission required to see the navigation entry and open the route. */
  requiredPermission: string;
  /** Optional owner type used by the public path registry. */
  publicPathOwnerType?: string;
};

export type AdminModuleRegistry = {
  readonly adminPath: string;
  readonly modules: readonly AdminModuleDefinition[];
  readonly enabled: readonly AdminModuleDefinition[];
  get(moduleId: string): AdminModuleDefinition | undefined;
  getEnabled(moduleId: string): AdminModuleDefinition | undefined;
  /** Longest matching module root for a pathname. */
  getByPath(pathname: string): AdminModuleDefinition | undefined;
  isEnabled(moduleId: string): boolean;
};
