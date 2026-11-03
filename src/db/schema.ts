import {
  int,
  mysqlTable,
  primaryKey,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

import { user } from "./auth-schema";

/**
 * LONEX Reusable CMS
 * Core schema: Better Auth identity tables + custom RBAC.
 *
 * Identity (user, session, account, verification) is defined in
 * auth-schema.ts and re-exported here so Drizzle Kit and the db
 * client see one complete schema.
 *
 * Client-specific modules will be added separately.
 */

// Better Auth identity tables.
export * from "./auth-schema";

// --------------------------------------------------
// 1. ADMINISTRATOR ROLES
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
// 2. ADMINISTRATOR PERMISSIONS
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
// 3. USER TO ROLE ASSIGNMENTS
// --------------------------------------------------

export const adminUserRoles = mysqlTable(
  "admin_user_roles",
  {
    // Better Auth user.id (varchar 36).
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => user.id, {
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
// 4. ROLE TO PERMISSION ASSIGNMENTS
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

export type AuthUser = typeof user.$inferSelect;

export type AdminRole = typeof adminRoles.$inferSelect;
export type AdminPermission =
  typeof adminPermissions.$inferSelect;
  