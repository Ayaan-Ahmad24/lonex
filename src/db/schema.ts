
import {
  boolean,
  int,
  mysqlTable,
  primaryKey,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * LONEX Reusable CMS
 * Phase 01: Core administrator and permission schema.
 *
 * Client-specific modules will be added separately.
 */

// --------------------------------------------------
// 1. ADMINISTRATOR USERS
// --------------------------------------------------

export const adminUsers = mysqlTable("admin_users", {
  id: int("id").autoincrement().primaryKey(),

  name: varchar("name", {
    length: 150,
  }).notNull(),

  email: varchar("email", {
    length: 254,
  }).notNull().unique(),

  passwordHash: varchar("password_hash", {
    length: 255,
  }).notNull(),

  isActive: boolean("is_active")
    .notNull()
    .default(true),

  lastLoginAt: timestamp("last_login_at"),

  createdAt: timestamp("created_at")
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow(),
});

// --------------------------------------------------
// 2. ADMINISTRATOR ROLES
// --------------------------------------------------

export const adminRoles = mysqlTable("admin_roles", {
  id: int("id").autoincrement().primaryKey(),

  name: varchar("name", {
    length: 100,
  }).notNull(),

  slug: varchar("slug", {
    length: 100,
  }).notNull().unique(),

  description: varchar("description", {
    length: 500,
  }),

  createdAt: timestamp("created_at")
    .notNull()
    .defaultNow(),
});

// --------------------------------------------------
// 3. ADMINISTRATOR PERMISSIONS
// --------------------------------------------------

export const adminPermissions = mysqlTable(
  "admin_permissions",
  {
    id: int("id").autoincrement().primaryKey(),

    code: varchar("code", {
      length: 150,
    }).notNull().unique(),

    description: varchar("description", {
      length: 500,
    }),

    createdAt: timestamp("created_at")
      .notNull()
      .defaultNow(),
  }
);

// --------------------------------------------------
// 4. USER TO ROLE ASSIGNMENTS
// --------------------------------------------------

export const adminUserRoles = mysqlTable(
  "admin_user_roles",
  {
    userId: int("user_id")
      .notNull()
      .references(() => adminUsers.id, {
        onDelete: "cascade",
      }),

    roleId: int("role_id")
      .notNull()
      .references(() => adminRoles.id, {
        onDelete: "cascade",
      }),
  },
  (table) => [
    primaryKey({
      columns: [table.userId, table.roleId],
    }),
  ]
);

// --------------------------------------------------
// 5. ROLE TO PERMISSION ASSIGNMENTS
// --------------------------------------------------

export const adminRolePermissions = mysqlTable(
  "admin_role_permissions",
  {
    roleId: int("role_id")
      .notNull()
      .references(() => adminRoles.id, {
        onDelete: "cascade",
      }),

    permissionId: int("permission_id")
      .notNull()
      .references(() => adminPermissions.id, {
        onDelete: "cascade",
      }),
  },
  (table) => [
    primaryKey({
      columns: [table.roleId, table.permissionId],
    }),
  ]
);

// --------------------------------------------------
// INFERRED TYPES
// --------------------------------------------------

export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;

export type AdminRole = typeof adminRoles.$inferSelect;
export type AdminPermission =
  typeof adminPermissions.$inferSelect;
