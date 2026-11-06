import type { AdminModuleDefinition } from "@/admin/core/registry/types";

/**
 * LONEX business modules.
 *
 * Ordering matches the approved admin navigation: Dashboard is part of the
 * shell, then categories, products, sellers, verification, blog, media,
 * settings, users and audit.
 */

export const categoriesModule: AdminModuleDefinition = {
  id: "categories",
  title: "Categories",
  navigationLabel: "Categories",
  description: "Product categories, public URLs, covers and publish state.",
  basePath: "/admin/categories",
  icon: "categories",
  group: "content",
  order: 10,
  requiredPermission: "content.edit",
  publicPathOwnerType: "category",
};

export const productsModule: AdminModuleDefinition = {
  id: "products",
  title: "Products",
  navigationLabel: "Products",
  description: "Catalogue, imagery, specifications, datasheets and pricing.",
  basePath: "/admin/products",
  icon: "products",
  group: "content",
  order: 20,
  requiredPermission: "content.edit",
  publicPathOwnerType: "product",
};

export const sellersModule: AdminModuleDefinition = {
  id: "sellers",
  title: "Authorized sellers",
  navigationLabel: "Sellers",
  description: "Published dealer directory with city and map details.",
  basePath: "/admin/sellers",
  icon: "sellers",
  group: "content",
  order: 30,
  requiredPermission: "content.edit",
};

export const verificationModule: AdminModuleDefinition = {
  id: "verification",
  title: "Model verification",
  navigationLabel: "Verification",
  description: "Register and rotate one verification code per product model.",
  basePath: "/admin/verification",
  icon: "verification",
  group: "content",
  order: 40,
  requiredPermission: "model_codes.manage",
};

export const blogModule: AdminModuleDefinition = {
  id: "blog",
  title: "Blog",
  navigationLabel: "Blog",
  description: "Draft, preview and publish structured articles.",
  basePath: "/admin/blog",
  icon: "blog",
  group: "content",
  order: 50,
  requiredPermission: "content.edit",
  publicPathOwnerType: "blog",
};

export const mediaModule: AdminModuleDefinition = {
  id: "media",
  title: "Media library",
  navigationLabel: "Media",
  description: "Private image and PDF assets with validated uploads.",
  basePath: "/admin/media",
  icon: "media",
  group: "library",
  order: 60,
  requiredPermission: "media.manage",
};

export const settingsModule: AdminModuleDefinition = {
  id: "settings",
  title: "Website settings",
  navigationLabel: "Settings",
  description: "Public identity, contact details and SEO defaults.",
  basePath: "/admin/settings",
  icon: "settings",
  group: "system",
  order: 70,
  requiredPermission: "settings.manage",
};

export const usersModule: AdminModuleDefinition = {
  id: "users",
  title: "Users",
  navigationLabel: "Users",
  description: "Administrator accounts, roles and account status.",
  basePath: "/admin/users",
  icon: "users",
  group: "system",
  order: 80,
  requiredPermission: "users.manage",
};

export const auditModule: AdminModuleDefinition = {
  id: "audit",
  title: "Audit log",
  navigationLabel: "Audit",
  description: "Read-only record of security and content changes.",
  basePath: "/admin/audit",
  icon: "audit",
  group: "system",
  order: 90,
  requiredPermission: "audit.view",
};
