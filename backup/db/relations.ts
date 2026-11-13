import { relations } from "drizzle-orm/relations";
import { user, account, adminPermissions, adminRolePermissions, adminRoles, adminUserRoles, auditLog, mediaAssets, blogPosts, categories, productDocuments, products, productImages, productSpecifications, productVerificationCodes, session, siteSettings } from "./schema";

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	accounts: many(account),
	adminUserRoles: many(adminUserRoles),
	auditLogs: many(auditLog),
	blogPosts_createdBy: many(blogPosts, {
		relationName: "blogPosts_createdBy_user_id"
	}),
	blogPosts_updatedBy: many(blogPosts, {
		relationName: "blogPosts_updatedBy_user_id"
	}),
	mediaAssets: many(mediaAssets),
	sessions: many(session),
	siteSettings: many(siteSettings),
}));

export const adminRolePermissionsRelations = relations(adminRolePermissions, ({one}) => ({
	adminPermission: one(adminPermissions, {
		fields: [adminRolePermissions.permissionId],
		references: [adminPermissions.id]
	}),
	adminRole: one(adminRoles, {
		fields: [adminRolePermissions.roleId],
		references: [adminRoles.id]
	}),
}));

export const adminPermissionsRelations = relations(adminPermissions, ({many}) => ({
	adminRolePermissions: many(adminRolePermissions),
}));

export const adminRolesRelations = relations(adminRoles, ({many}) => ({
	adminRolePermissions: many(adminRolePermissions),
	adminUserRoles: many(adminUserRoles),
}));

export const adminUserRolesRelations = relations(adminUserRoles, ({one}) => ({
	adminRole: one(adminRoles, {
		fields: [adminUserRoles.roleId],
		references: [adminRoles.id]
	}),
	user: one(user, {
		fields: [adminUserRoles.userId],
		references: [user.id]
	}),
}));

export const auditLogRelations = relations(auditLog, ({one}) => ({
	user: one(user, {
		fields: [auditLog.actorUserId],
		references: [user.id]
	}),
}));

export const blogPostsRelations = relations(blogPosts, ({one}) => ({
	mediaAsset: one(mediaAssets, {
		fields: [blogPosts.coverMediaId],
		references: [mediaAssets.id]
	}),
	user_createdBy: one(user, {
		fields: [blogPosts.createdBy],
		references: [user.id],
		relationName: "blogPosts_createdBy_user_id"
	}),
	user_updatedBy: one(user, {
		fields: [blogPosts.updatedBy],
		references: [user.id],
		relationName: "blogPosts_updatedBy_user_id"
	}),
}));

export const mediaAssetsRelations = relations(mediaAssets, ({one, many}) => ({
	blogPosts: many(blogPosts),
	categories: many(categories),
	user: one(user, {
		fields: [mediaAssets.uploadedBy],
		references: [user.id]
	}),
	productDocuments: many(productDocuments),
	productImages: many(productImages),
}));

export const categoriesRelations = relations(categories, ({one, many}) => ({
	mediaAsset: one(mediaAssets, {
		fields: [categories.coverMediaId],
		references: [mediaAssets.id]
	}),
	products: many(products),
}));

export const productDocumentsRelations = relations(productDocuments, ({one}) => ({
	mediaAsset: one(mediaAssets, {
		fields: [productDocuments.mediaId],
		references: [mediaAssets.id]
	}),
	product: one(products, {
		fields: [productDocuments.productId],
		references: [products.id]
	}),
}));

export const productsRelations = relations(products, ({one, many}) => ({
	productDocuments: many(productDocuments),
	productImages: many(productImages),
	productSpecifications: many(productSpecifications),
	productVerificationCodes: many(productVerificationCodes),
	category: one(categories, {
		fields: [products.categoryId],
		references: [categories.id]
	}),
}));

export const productImagesRelations = relations(productImages, ({one}) => ({
	mediaAsset: one(mediaAssets, {
		fields: [productImages.mediaId],
		references: [mediaAssets.id]
	}),
	product: one(products, {
		fields: [productImages.productId],
		references: [products.id]
	}),
}));

export const productSpecificationsRelations = relations(productSpecifications, ({one}) => ({
	product: one(products, {
		fields: [productSpecifications.productId],
		references: [products.id]
	}),
}));

export const productVerificationCodesRelations = relations(productVerificationCodes, ({one}) => ({
	product: one(products, {
		fields: [productVerificationCodes.productId],
		references: [products.id]
	}),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const siteSettingsRelations = relations(siteSettings, ({one}) => ({
	user: one(user, {
		fields: [siteSettings.updatedBy],
		references: [user.id]
	}),
}));