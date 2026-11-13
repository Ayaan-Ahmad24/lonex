import { mysqlTable, mysqlSchema, AnyMySqlColumn, index, foreignKey, primaryKey, varchar, text, unique, int, timestamp, json, decimal, bigint } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const account = mysqlTable("account", {
	id: varchar({ length: 36 }).notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => user.id, { onDelete: "cascade" } ),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { fsp: 3, mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { fsp: 3, mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { fsp: 3, mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { fsp: 3, mode: 'string' }).notNull(),
},
(table) => [
	index("account_userId_idx").on(table.userId),
	primaryKey({ columns: [table.id], name: "account_id"}),
]);

export const adminPermissions = mysqlTable("admin_permissions", {
	id: int().autoincrement().notNull(),
	code: varchar({ length: 150 }).notNull(),
	description: varchar({ length: 500 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "admin_permissions_id"}),
	unique("admin_permissions_code_unique").on(table.code),
]);

export const adminRolePermissions = mysqlTable("admin_role_permissions", {
	roleId: int("role_id").notNull().references(() => adminRoles.id, { onDelete: "cascade" } ),
	permissionId: int("permission_id").notNull().references(() => adminPermissions.id, { onDelete: "cascade" } ),
},
(table) => [
	primaryKey({ columns: [table.roleId, table.permissionId], name: "admin_role_permissions_role_id_permission_id"}),
]);

export const adminRoles = mysqlTable("admin_roles", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 100 }).notNull(),
	slug: varchar({ length: 100 }).notNull(),
	description: varchar({ length: 500 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "admin_roles_id"}),
	unique("admin_roles_slug_unique").on(table.slug),
]);

export const adminUserRoles = mysqlTable("admin_user_roles", {
	userId: varchar("user_id", { length: 36 }).notNull().references(() => user.id, { onDelete: "cascade" } ),
	roleId: int("role_id").notNull().references(() => adminRoles.id, { onDelete: "cascade" } ),
},
(table) => [
	primaryKey({ columns: [table.userId, table.roleId], name: "admin_user_roles_user_id_role_id"}),
]);

export const auditLog = mysqlTable("audit_log", {
	id: int().autoincrement().notNull(),
	actorUserId: varchar("actor_user_id", { length: 36 }).references(() => user.id, { onDelete: "set null" } ),
	action: varchar({ length: 100 }).notNull(),
	targetType: varchar("target_type", { length: 50 }).notNull(),
	targetId: varchar("target_id", { length: 64 }),
	metadata: json(),
	createdAt: timestamp("created_at", { fsp: 3, mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("audit_log_actor_idx").on(table.actorUserId),
	index("audit_log_created_idx").on(table.createdAt),
	primaryKey({ columns: [table.id], name: "audit_log_id"}),
]);

export const authorizedSellers = mysqlTable("authorized_sellers", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 200 }).notNull(),
	city: varchar({ length: 120 }).notNull(),
	address: varchar({ length: 300 }).notNull(),
	phone: varchar({ length: 50 }).notNull(),
	whatsapp: varchar({ length: 50 }),
	googleMapsUrl: varchar("google_maps_url", { length: 500 }),
	sortOrder: int("sort_order").default(0).notNull(),
	status: varchar({ length: 20 }).default('active').notNull(),
	createdAt: timestamp("created_at", { fsp: 3, mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { fsp: 3, mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("authorized_sellers_city_idx").on(table.city),
	index("authorized_sellers_status_sort_idx").on(table.status, table.sortOrder),
	primaryKey({ columns: [table.id], name: "authorized_sellers_id"}),
]);

export const blogPosts = mysqlTable("blog_posts", {
	id: int().autoincrement().notNull(),
	title: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 200 }).notNull(),
	excerpt: varchar({ length: 500 }),
	contentJson: json("content_json").notNull(),
	coverMediaId: int("cover_media_id").references(() => mediaAssets.id, { onDelete: "set null" } ),
	seoTitle: varchar("seo_title", { length: 255 }),
	seoDescription: varchar("seo_description", { length: 500 }),
	status: varchar({ length: 20 }).default('draft').notNull(),
	publishedAt: timestamp("published_at", { fsp: 3, mode: 'string' }),
	createdBy: varchar("created_by", { length: 36 }).references(() => user.id, { onDelete: "set null" } ),
	updatedBy: varchar("updated_by", { length: 36 }).references(() => user.id, { onDelete: "set null" } ),
	createdAt: timestamp("created_at", { fsp: 3, mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { fsp: 3, mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("blog_posts_status_published_idx").on(table.status, table.publishedAt),
	index("blog_posts_cover_idx").on(table.coverMediaId),
	primaryKey({ columns: [table.id], name: "blog_posts_id"}),
	unique("blog_posts_slug_unique").on(table.slug),
]);

export const categories = mysqlTable("categories", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 120 }).notNull(),
	slug: varchar({ length: 120 }).notNull(),
	description: text(),
	coverMediaId: int("cover_media_id").references(() => mediaAssets.id, { onDelete: "set null" } ),
	status: varchar({ length: 20 }).default('draft').notNull(),
	sortOrder: int("sort_order").default(0).notNull(),
	createdAt: timestamp("created_at", { fsp: 3, mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { fsp: 3, mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("categories_status_sort_idx").on(table.status, table.sortOrder),
	index("categories_cover_idx").on(table.coverMediaId),
	primaryKey({ columns: [table.id], name: "categories_id"}),
	unique("categories_slug_unique").on(table.slug),
]);

export const mediaAssets = mysqlTable("media_assets", {
	id: int().autoincrement().notNull(),
	storageKey: varchar("storage_key", { length: 255 }).notNull(),
	originalName: varchar("original_name", { length: 255 }).notNull(),
	mimeType: varchar("mime_type", { length: 100 }).notNull(),
	bytes: int().notNull(),
	width: int(),
	height: int(),
	altText: varchar("alt_text", { length: 500 }),
	uploadedBy: varchar("uploaded_by", { length: 36 }).references(() => user.id, { onDelete: "set null" } ),
	createdAt: timestamp("created_at", { fsp: 3, mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { fsp: 3, mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("media_assets_created_idx").on(table.createdAt),
	index("media_assets_uploaded_by_idx").on(table.uploadedBy),
	primaryKey({ columns: [table.id], name: "media_assets_id"}),
	unique("media_assets_storage_key_unique").on(table.storageKey),
]);

export const productDocuments = mysqlTable("product_documents", {
	id: int().autoincrement().notNull(),
	productId: int("product_id").notNull().references(() => products.id, { onDelete: "cascade" } ),
	mediaId: int("media_id").notNull().references(() => mediaAssets.id, { onDelete: "restrict" } ),
	title: varchar({ length: 200 }).notNull(),
	sortOrder: int("sort_order").default(0).notNull(),
	createdAt: timestamp("created_at", { fsp: 3, mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("product_documents_product_sort_idx").on(table.productId, table.sortOrder),
	index("product_documents_media_idx").on(table.mediaId),
	primaryKey({ columns: [table.id], name: "product_documents_id"}),
]);

export const productImages = mysqlTable("product_images", {
	id: int().autoincrement().notNull(),
	productId: int("product_id").notNull().references(() => products.id, { onDelete: "cascade" } ),
	mediaId: int("media_id").notNull().references(() => mediaAssets.id, { onDelete: "restrict" } ),
	alt: varchar({ length: 500 }),
	isPrimary: tinyint("is_primary").default(0).notNull(),
	sortOrder: int("sort_order").default(0).notNull(),
	createdAt: timestamp("created_at", { fsp: 3, mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("product_images_product_sort_idx").on(table.productId, table.sortOrder),
	index("product_images_media_idx").on(table.mediaId),
	primaryKey({ columns: [table.id], name: "product_images_id"}),
]);

export const productSpecifications = mysqlTable("product_specifications", {
	id: int().autoincrement().notNull(),
	productId: int("product_id").notNull().references(() => products.id, { onDelete: "cascade" } ),
	groupName: varchar("group_name", { length: 100 }),
	label: varchar({ length: 150 }).notNull(),
	value: varchar({ length: 300 }).notNull(),
	isHighlight: tinyint("is_highlight").default(0).notNull(),
	sortOrder: int("sort_order").default(0).notNull(),
},
(table) => [
	index("product_specs_product_sort_idx").on(table.productId, table.sortOrder),
	primaryKey({ columns: [table.id], name: "product_specifications_id"}),
]);

export const productVerificationCodes = mysqlTable("product_verification_codes", {
	id: int().autoincrement().notNull(),
	productId: int("product_id").notNull().references(() => products.id, { onDelete: "cascade" } ),
	codeDigest: varchar("code_digest", { length: 128 }).notNull(),
	active: tinyint().default(1).notNull(),
	registeredAt: timestamp("registered_at", { fsp: 3, mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { fsp: 3, mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("model_codes_active_idx").on(table.active),
	primaryKey({ columns: [table.id], name: "product_verification_codes_id"}),
	unique("product_verification_codes_product_id_unique").on(table.productId),
	unique("product_verification_codes_code_digest_unique").on(table.codeDigest),
]);

export const products = mysqlTable("products", {
	id: int().autoincrement().notNull(),
	categoryId: int("category_id").notNull().references(() => categories.id, { onDelete: "restrict" } ),
	name: varchar({ length: 200 }).notNull(),
	slug: varchar({ length: 200 }).notNull(),
	shortDescription: text("short_description"),
	description: text(),
	price: decimal({ precision: 12, scale: 2 }),
	showPrice: tinyint("show_price").default(0).notNull(),
	isFeatured: tinyint("is_featured").default(0).notNull(),
	featuredSortOrder: int("featured_sort_order").default(0).notNull(),
	status: varchar({ length: 20 }).default('draft').notNull(),
	sortOrder: int("sort_order").default(0).notNull(),
	seoTitle: varchar("seo_title", { length: 255 }),
	seoDescription: varchar("seo_description", { length: 500 }),
	createdAt: timestamp("created_at", { fsp: 3, mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { fsp: 3, mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("products_category_status_sort_idx").on(table.categoryId, table.status, table.sortOrder),
	index("products_featured_idx").on(table.isFeatured, table.featuredSortOrder),
	primaryKey({ columns: [table.id], name: "products_id"}),
	unique("products_category_slug_unique").on(table.categoryId, table.slug),
]);

export const publicPaths = mysqlTable("public_paths", {
	id: int().autoincrement().notNull(),
	path: varchar({ length: 255 }).notNull(),
	ownerType: varchar("owner_type", { length: 30 }).notNull(),
	ownerId: varchar("owner_id", { length: 64 }).notNull(),
	status: varchar({ length: 20 }).default('draft').notNull(),
	createdAt: timestamp("created_at", { fsp: 3, mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { fsp: 3, mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("public_paths_owner_idx").on(table.ownerType, table.ownerId),
	index("public_paths_status_idx").on(table.status),
	primaryKey({ columns: [table.id], name: "public_paths_id"}),
	unique("public_paths_path_unique").on(table.path),
]);

export const rateLimit = mysqlTable("rate_limit", {
	id: varchar({ length: 36 }).notNull(),
	key: varchar({ length: 255 }).notNull(),
	count: int().notNull(),
	lastRequest: bigint("last_request", { mode: "number" }).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "rate_limit_id"}),
	unique("rate_limit_key_unique").on(table.key),
]);

export const session = mysqlTable("session", {
	id: varchar({ length: 36 }).notNull(),
	expiresAt: timestamp("expires_at", { fsp: 3, mode: 'string' }).notNull(),
	token: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { fsp: 3, mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { fsp: 3, mode: 'string' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => user.id, { onDelete: "cascade" } ),
},
(table) => [
	index("session_userId_idx").on(table.userId),
	primaryKey({ columns: [table.id], name: "session_id"}),
	unique("session_token_unique").on(table.token),
]);

export const siteSettings = mysqlTable("site_settings", {
	id: int().autoincrement().notNull(),
	key: varchar({ length: 100 }).notNull(),
	valueJson: json("value_json").notNull(),
	updatedBy: varchar("updated_by", { length: 36 }).references(() => user.id, { onDelete: "set null" } ),
	createdAt: timestamp("created_at", { fsp: 3, mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { fsp: 3, mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("site_settings_updated_by_idx").on(table.updatedBy),
	primaryKey({ columns: [table.id], name: "site_settings_id"}),
	unique("site_settings_key_unique").on(table.key),
]);

export const urlRedirects = mysqlTable("url_redirects", {
	id: int().autoincrement().notNull(),
	oldPath: varchar("old_path", { length: 255 }).notNull(),
	newPath: varchar("new_path", { length: 255 }).notNull(),
	createdAt: timestamp("created_at", { fsp: 3, mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("url_redirects_new_idx").on(table.newPath),
	primaryKey({ columns: [table.id], name: "url_redirects_id"}),
	unique("url_redirects_old_path_unique").on(table.oldPath),
]);

export const user = mysqlTable("user", {
	id: varchar({ length: 36 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	emailVerified: tinyint("email_verified").default(0).notNull(),
	image: text(),
	createdAt: timestamp("created_at", { fsp: 3, mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { fsp: 3, mode: 'string' }).default(sql`(now())`).notNull(),
	isActive: tinyint("is_active").default(1).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "user_id"}),
	unique("user_email_unique").on(table.email),
]);

export const verification = mysqlTable("verification", {
	id: varchar({ length: 36 }).notNull(),
	identifier: varchar({ length: 255 }).notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { fsp: 3, mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { fsp: 3, mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { fsp: 3, mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("verification_identifier_idx").on(table.identifier),
	primaryKey({ columns: [table.id], name: "verification_id"}),
]);
