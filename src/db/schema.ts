import { relations } from "drizzle-orm";
import {
  boolean,
  decimal,
  index,
  int,
  json,
  mysqlTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

import { user } from "./auth-schema";

/**
 * LONEX v2.4 schema.
 *
 * Identity (user, session, account, verification) lives in auth-schema.ts.
 * Sprint 02 tables media_assets, site_settings, public_paths, audit_log and
 * rate_limit are preserved. Sprint 03 replaces the page builder with the LONEX
 * business model: categories, products, sellers, blog and model verification.
 */

// Better Auth identity tables.
export * from "./auth-schema";

// --------------------------------------------------
// 1. ADMINISTRATOR ROLES
// --------------------------------------------------

export const adminRoles = mysqlTable("admin_roles", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: varchar("description", { length: 500 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// --------------------------------------------------
// 2. ADMINISTRATOR PERMISSIONS
// --------------------------------------------------

export const adminPermissions = mysqlTable("admin_permissions", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 150 }).notNull().unique(),
  description: varchar("description", { length: 500 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// --------------------------------------------------
// 3. USER TO ROLE ASSIGNMENTS
// --------------------------------------------------

export const adminUserRoles = mysqlTable(
  "admin_user_roles",
  {
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    roleId: int("role_id")
      .notNull()
      .references(() => adminRoles.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.userId, table.roleId] })],
);

// --------------------------------------------------
// 4. ROLE TO PERMISSION ASSIGNMENTS
// --------------------------------------------------

export const adminRolePermissions = mysqlTable(
  "admin_role_permissions",
  {
    roleId: int("role_id")
      .notNull()
      .references(() => adminRoles.id, { onDelete: "cascade" }),
    permissionId: int("permission_id")
      .notNull()
      .references(() => adminPermissions.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.roleId, table.permissionId] })],
);

// --------------------------------------------------
// 5. AUDIT LOG
// --------------------------------------------------

export const auditLog = mysqlTable(
  "audit_log",
  {
    id: int("id").autoincrement().primaryKey(),
    actorUserId: varchar("actor_user_id", { length: 36 }).references(
      () => user.id,
      { onDelete: "set null" },
    ),
    action: varchar("action", { length: 100 }).notNull(),
    targetType: varchar("target_type", { length: 50 }).notNull(),
    targetId: varchar("target_id", { length: 64 }),
    metadata: json("metadata"),
    createdAt: timestamp("created_at", { fsp: 3 }).notNull().defaultNow(),
  },
  (table) => [
    index("audit_log_actor_idx").on(table.actorUserId),
    index("audit_log_created_idx").on(table.createdAt),
  ],
);

// --------------------------------------------------
// 6. MEDIA LIBRARY (private, signature validated)
// --------------------------------------------------

export const mediaAssets = mysqlTable(
  "media_assets",
  {
    id: int("id").autoincrement().primaryKey(),
    storageKey: varchar("storage_key", { length: 255 }).notNull().unique(),
    originalName: varchar("original_name", { length: 255 }).notNull(),
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    bytes: int("bytes").notNull(),
    width: int("width"),
    height: int("height"),
    altText: varchar("alt_text", { length: 500 }),
    uploadedBy: varchar("uploaded_by", { length: 36 }).references(
      () => user.id,
      { onDelete: "set null" },
    ),
    createdAt: timestamp("created_at", { fsp: 3 }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .notNull()
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date()),
  },
  (table) => [
    index("media_assets_created_idx").on(table.createdAt),
    index("media_assets_uploaded_by_idx").on(table.uploadedBy),
  ],
);

// --------------------------------------------------
// 7. SITE SETTINGS (typed, non-secret JSON)
// --------------------------------------------------

export const siteSettings = mysqlTable(
  "site_settings",
  {
    id: int("id").autoincrement().primaryKey(),
    key: varchar("key", { length: 100 }).notNull().unique(),
    valueJson: json("value_json").$type<Record<string, unknown>>().notNull(),
    updatedBy: varchar("updated_by", { length: 36 }).references(
      () => user.id,
      { onDelete: "set null" },
    ),
    createdAt: timestamp("created_at", { fsp: 3 }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .notNull()
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date()),
  },
  (table) => [index("site_settings_updated_by_idx").on(table.updatedBy)],
);

// --------------------------------------------------
// 8. CATEGORIES
// --------------------------------------------------

export const categories = mysqlTable(
  "categories",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 120 }).notNull().unique(),
    description: text("description"),
    coverMediaId: int("cover_media_id").references(() => mediaAssets.id, {
      onDelete: "set null",
    }),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    sortOrder: int("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { fsp: 3 }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .notNull()
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date()),
  },
  (table) => [
    index("categories_status_sort_idx").on(table.status, table.sortOrder),
    index("categories_cover_idx").on(table.coverMediaId),
  ],
);

// --------------------------------------------------
// 9. PRODUCTS
// --------------------------------------------------

export const products = mysqlTable(
  "products",
  {
    id: int("id").autoincrement().primaryKey(),
    categoryId: int("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    name: varchar("name", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 200 }).notNull(),
    shortDescription: text("short_description"),
    description: text("description"),
    // Nullable on purpose: prices are optional and never invented.
    price: decimal("price", { precision: 12, scale: 2 }),
    showPrice: boolean("show_price").notNull().default(false),
    isFeatured: boolean("is_featured").notNull().default(false),
    featuredSortOrder: int("featured_sort_order").notNull().default(0),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    sortOrder: int("sort_order").notNull().default(0),
    seoTitle: varchar("seo_title", { length: 255 }),
    seoDescription: varchar("seo_description", { length: 500 }),
    createdAt: timestamp("created_at", { fsp: 3 }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .notNull()
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date()),
  },
  (table) => [
    uniqueIndex("products_category_slug_unique").on(
      table.categoryId,
      table.slug,
    ),
    index("products_category_status_sort_idx").on(
      table.categoryId,
      table.status,
      table.sortOrder,
    ),
    index("products_featured_idx").on(table.isFeatured, table.featuredSortOrder),
  ],
);

// --------------------------------------------------
// 10. PRODUCT IMAGES
// --------------------------------------------------

export const productImages = mysqlTable(
  "product_images",
  {
    id: int("id").autoincrement().primaryKey(),
    productId: int("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    mediaId: int("media_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "restrict" }),
    alt: varchar("alt", { length: 500 }),
    isPrimary: boolean("is_primary").notNull().default(false),
    sortOrder: int("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { fsp: 3 }).notNull().defaultNow(),
  },
  (table) => [
    index("product_images_product_sort_idx").on(
      table.productId,
      table.sortOrder,
    ),
    index("product_images_media_idx").on(table.mediaId),
  ],
);

// --------------------------------------------------
// 11. PRODUCT SPECIFICATIONS
// --------------------------------------------------

export const productSpecifications = mysqlTable(
  "product_specifications",
  {
    id: int("id").autoincrement().primaryKey(),
    productId: int("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    groupName: varchar("group_name", { length: 100 }),
    label: varchar("label", { length: 150 }).notNull(),
    value: varchar("value", { length: 300 }).notNull(),
    isHighlight: boolean("is_highlight").notNull().default(false),
    sortOrder: int("sort_order").notNull().default(0),
  },
  (table) => [
    index("product_specs_product_sort_idx").on(table.productId, table.sortOrder),
  ],
);

// --------------------------------------------------
// 12. PRODUCT DOCUMENTS (PDF datasheets)
// --------------------------------------------------

export const productDocuments = mysqlTable(
  "product_documents",
  {
    id: int("id").autoincrement().primaryKey(),
    productId: int("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    mediaId: int("media_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "restrict" }),
    title: varchar("title", { length: 200 }).notNull(),
    sortOrder: int("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { fsp: 3 }).notNull().defaultNow(),
  },
  (table) => [
    index("product_documents_product_sort_idx").on(
      table.productId,
      table.sortOrder,
    ),
    index("product_documents_media_idx").on(table.mediaId),
  ],
);

// --------------------------------------------------
// 13. AUTHORIZED SELLERS
// --------------------------------------------------

export const authorizedSellers = mysqlTable(
  "authorized_sellers",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 200 }).notNull(),
    city: varchar("city", { length: 120 }).notNull(),
    address: varchar("address", { length: 300 }).notNull(),
    phone: varchar("phone", { length: 50 }).notNull(),
    whatsapp: varchar("whatsapp", { length: 50 }),
    googleMapsUrl: varchar("google_maps_url", { length: 500 }),
    /**
     * Optional primary business image (logo or photograph). References the
     * existing media library; the bytes are never stored in this table.
     * Nullable so sellers created before the feature keep working unchanged.
     */
    imageMediaId: int("image_media_id").references(() => mediaAssets.id, {
      onDelete: "set null",
    }),
    sortOrder: int("sort_order").notNull().default(0),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    createdAt: timestamp("created_at", { fsp: 3 }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .notNull()
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date()),
  },
  (table) => [
    index("authorized_sellers_city_idx").on(table.city),
    index("authorized_sellers_status_sort_idx").on(
      table.status,
      table.sortOrder,
    ),
    index("authorized_sellers_image_idx").on(table.imageMediaId),
  ],
);

// --------------------------------------------------
// 14. BLOG POSTS
// --------------------------------------------------

export const blogPosts = mysqlTable(
  "blog_posts",
  {
    id: int("id").autoincrement().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 200 }).notNull().unique(),
    excerpt: varchar("excerpt", { length: 500 }),
    // Safe structured blocks only. Never raw HTML.
    contentJson: json("content_json").$type<unknown>().notNull(),
    coverMediaId: int("cover_media_id").references(() => mediaAssets.id, {
      onDelete: "set null",
    }),
    seoTitle: varchar("seo_title", { length: 255 }),
    seoDescription: varchar("seo_description", { length: 500 }),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    publishedAt: timestamp("published_at", { fsp: 3 }),
    createdBy: varchar("created_by", { length: 36 }).references(() => user.id, {
      onDelete: "set null",
    }),
    updatedBy: varchar("updated_by", { length: 36 }).references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { fsp: 3 }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .notNull()
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date()),
  },
  (table) => [
    index("blog_posts_status_published_idx").on(
      table.status,
      table.publishedAt,
    ),
    index("blog_posts_cover_idx").on(table.coverMediaId),
  ],
);

// --------------------------------------------------
// 15. PRODUCT MODEL VERIFICATION CODES
// --------------------------------------------------
// Only a keyed HMAC digest is stored. The raw code is shown once at
// generation time and is never logged or exposed publicly.

export const productVerificationCodes = mysqlTable(
  "product_verification_codes",
  {
    id: int("id").autoincrement().primaryKey(),
    productId: int("product_id")
      .notNull()
      .unique()
      .references(() => products.id, { onDelete: "cascade" }),
    codeDigest: varchar("code_digest", { length: 128 }).notNull().unique(),
    active: boolean("active").notNull().default(true),
    registeredAt: timestamp("registered_at", { fsp: 3 })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .notNull()
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date()),
  },
  (table) => [index("model_codes_active_idx").on(table.active)],
);

// --------------------------------------------------
// 16. URL REDIRECTS (historical slugs)
// --------------------------------------------------

export const urlRedirects = mysqlTable(
  "url_redirects",
  {
    id: int("id").autoincrement().primaryKey(),
    oldPath: varchar("old_path", { length: 255 }).notNull().unique(),
    newPath: varchar("new_path", { length: 255 }).notNull(),
    createdAt: timestamp("created_at", { fsp: 3 }).notNull().defaultNow(),
  },
  (table) => [index("url_redirects_new_idx").on(table.newPath)],
);

// --------------------------------------------------
// 17. GLOBAL PUBLIC PATH REGISTRY (decision 0001)
// --------------------------------------------------

export const publicPaths = mysqlTable(
  "public_paths",
  {
    id: int("id").autoincrement().primaryKey(),
    path: varchar("path", { length: 255 }).notNull().unique(),
    ownerType: varchar("owner_type", { length: 30 }).notNull(),
    ownerId: varchar("owner_id", { length: 64 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    createdAt: timestamp("created_at", { fsp: 3 }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .notNull()
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date()),
  },
  (table) => [
    index("public_paths_owner_idx").on(table.ownerType, table.ownerId),
    index("public_paths_status_idx").on(table.status),
  ],
);

// --------------------------------------------------
// RELATIONS
// --------------------------------------------------

export const categoryRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  images: many(productImages),
  specifications: many(productSpecifications),
  documents: many(productDocuments),
}));

export const productImageRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

// --------------------------------------------------
// INFERRED TYPES
// --------------------------------------------------

export type AuthUser = typeof user.$inferSelect;

export type AdminRole = typeof adminRoles.$inferSelect;
export type AdminPermission = typeof adminPermissions.$inferSelect;

export type MediaAsset = typeof mediaAssets.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ProductImage = typeof productImages.$inferSelect;
export type ProductSpecification = typeof productSpecifications.$inferSelect;
export type ProductDocument = typeof productDocuments.$inferSelect;
export type AuthorizedSeller = typeof authorizedSellers.$inferSelect;
export type BlogPost = typeof blogPosts.$inferSelect;
export type ProductVerificationCode =
  typeof productVerificationCodes.$inferSelect;
export type UrlRedirect = typeof urlRedirects.$inferSelect;
export type PublicPath = typeof publicPaths.$inferSelect;
