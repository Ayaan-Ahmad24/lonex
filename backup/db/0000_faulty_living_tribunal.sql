-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `account` (
	`id` varchar(36) NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` timestamp(3),
	`refresh_token_expires_at` timestamp(3),
	`scope` text,
	`password` text,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL,
	CONSTRAINT `account_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admin_permissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(150) NOT NULL,
	`description` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_permissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_permissions_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `admin_role_permissions` (
	`role_id` int NOT NULL,
	`permission_id` int NOT NULL,
	CONSTRAINT `admin_role_permissions_role_id_permission_id` PRIMARY KEY(`role_id`,`permission_id`)
);
--> statement-breakpoint
CREATE TABLE `admin_roles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_roles_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `admin_user_roles` (
	`user_id` varchar(36) NOT NULL,
	`role_id` int NOT NULL,
	CONSTRAINT `admin_user_roles_user_id_role_id` PRIMARY KEY(`user_id`,`role_id`)
);
--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`actor_user_id` varchar(36),
	`action` varchar(100) NOT NULL,
	`target_type` varchar(50) NOT NULL,
	`target_id` varchar(64),
	`metadata` json,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `authorized_sellers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`city` varchar(120) NOT NULL,
	`address` varchar(300) NOT NULL,
	`phone` varchar(50) NOT NULL,
	`whatsapp` varchar(50),
	`google_maps_url` varchar(500),
	`sort_order` int NOT NULL DEFAULT 0,
	`status` varchar(20) NOT NULL DEFAULT 'active',
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `authorized_sellers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `blog_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(200) NOT NULL,
	`excerpt` varchar(500),
	`content_json` json NOT NULL,
	`cover_media_id` int,
	`seo_title` varchar(255),
	`seo_description` varchar(500),
	`status` varchar(20) NOT NULL DEFAULT 'draft',
	`published_at` timestamp(3),
	`created_by` varchar(36),
	`updated_by` varchar(36),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `blog_posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `blog_posts_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`slug` varchar(120) NOT NULL,
	`description` text,
	`cover_media_id` int,
	`status` varchar(20) NOT NULL DEFAULT 'draft',
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `media_assets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storage_key` varchar(255) NOT NULL,
	`original_name` varchar(255) NOT NULL,
	`mime_type` varchar(100) NOT NULL,
	`bytes` int NOT NULL,
	`width` int,
	`height` int,
	`alt_text` varchar(500),
	`uploaded_by` varchar(36),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `media_assets_id` PRIMARY KEY(`id`),
	CONSTRAINT `media_assets_storage_key_unique` UNIQUE(`storage_key`)
);
--> statement-breakpoint
CREATE TABLE `product_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`product_id` int NOT NULL,
	`media_id` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `product_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`product_id` int NOT NULL,
	`media_id` int NOT NULL,
	`alt` varchar(500),
	`is_primary` tinyint(1) NOT NULL DEFAULT 0,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `product_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_specifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`product_id` int NOT NULL,
	`group_name` varchar(100),
	`label` varchar(150) NOT NULL,
	`value` varchar(300) NOT NULL,
	`is_highlight` tinyint(1) NOT NULL DEFAULT 0,
	`sort_order` int NOT NULL DEFAULT 0,
	CONSTRAINT `product_specifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_verification_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`product_id` int NOT NULL,
	`code_digest` varchar(128) NOT NULL,
	`active` tinyint(1) NOT NULL DEFAULT 1,
	`registered_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `product_verification_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_verification_codes_product_id_unique` UNIQUE(`product_id`),
	CONSTRAINT `product_verification_codes_code_digest_unique` UNIQUE(`code_digest`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category_id` int NOT NULL,
	`name` varchar(200) NOT NULL,
	`slug` varchar(200) NOT NULL,
	`short_description` text,
	`description` text,
	`price` decimal(12,2),
	`show_price` tinyint(1) NOT NULL DEFAULT 0,
	`is_featured` tinyint(1) NOT NULL DEFAULT 0,
	`featured_sort_order` int NOT NULL DEFAULT 0,
	`status` varchar(20) NOT NULL DEFAULT 'draft',
	`sort_order` int NOT NULL DEFAULT 0,
	`seo_title` varchar(255),
	`seo_description` varchar(500),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_category_slug_unique` UNIQUE(`category_id`,`slug`)
);
--> statement-breakpoint
CREATE TABLE `public_paths` (
	`id` int AUTO_INCREMENT NOT NULL,
	`path` varchar(255) NOT NULL,
	`owner_type` varchar(30) NOT NULL,
	`owner_id` varchar(64) NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'draft',
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `public_paths_id` PRIMARY KEY(`id`),
	CONSTRAINT `public_paths_path_unique` UNIQUE(`path`)
);
--> statement-breakpoint
CREATE TABLE `rate_limit` (
	`id` varchar(36) NOT NULL,
	`key` varchar(255) NOT NULL,
	`count` int NOT NULL,
	`last_request` bigint NOT NULL,
	CONSTRAINT `rate_limit_id` PRIMARY KEY(`id`),
	CONSTRAINT `rate_limit_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` varchar(36) NOT NULL,
	`expires_at` timestamp(3) NOT NULL,
	`token` varchar(255) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` varchar(36) NOT NULL,
	CONSTRAINT `session_id` PRIMARY KEY(`id`),
	CONSTRAINT `session_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `site_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`value_json` json NOT NULL,
	`updated_by` varchar(36),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `site_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `site_settings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `url_redirects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`old_path` varchar(255) NOT NULL,
	`new_path` varchar(255) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `url_redirects_id` PRIMARY KEY(`id`),
	CONSTRAINT `url_redirects_old_path_unique` UNIQUE(`old_path`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`email_verified` tinyint(1) NOT NULL DEFAULT 0,
	`image` text,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	`is_active` tinyint(1) NOT NULL DEFAULT 1,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` varchar(36) NOT NULL,
	`identifier` varchar(255) NOT NULL,
	`value` text NOT NULL,
	`expires_at` timestamp(3) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `verification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `account` ADD CONSTRAINT `account_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `admin_role_permissions` ADD CONSTRAINT `admin_role_permissions_permission_id_admin_permissions_id_fk` FOREIGN KEY (`permission_id`) REFERENCES `admin_permissions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `admin_role_permissions` ADD CONSTRAINT `admin_role_permissions_role_id_admin_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `admin_roles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `admin_user_roles` ADD CONSTRAINT `admin_user_roles_role_id_admin_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `admin_roles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `admin_user_roles` ADD CONSTRAINT `admin_user_roles_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_log` ADD CONSTRAINT `audit_log_actor_user_id_user_id_fk` FOREIGN KEY (`actor_user_id`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `blog_posts` ADD CONSTRAINT `blog_posts_cover_media_id_media_assets_id_fk` FOREIGN KEY (`cover_media_id`) REFERENCES `media_assets`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `blog_posts` ADD CONSTRAINT `blog_posts_created_by_user_id_fk` FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `blog_posts` ADD CONSTRAINT `blog_posts_updated_by_user_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `categories` ADD CONSTRAINT `categories_cover_media_id_media_assets_id_fk` FOREIGN KEY (`cover_media_id`) REFERENCES `media_assets`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media_assets` ADD CONSTRAINT `media_assets_uploaded_by_user_id_fk` FOREIGN KEY (`uploaded_by`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_documents` ADD CONSTRAINT `product_documents_media_id_media_assets_id_fk` FOREIGN KEY (`media_id`) REFERENCES `media_assets`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_documents` ADD CONSTRAINT `product_documents_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_images` ADD CONSTRAINT `product_images_media_id_media_assets_id_fk` FOREIGN KEY (`media_id`) REFERENCES `media_assets`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_images` ADD CONSTRAINT `product_images_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_specifications` ADD CONSTRAINT `product_specifications_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_verification_codes` ADD CONSTRAINT `product_verification_codes_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `site_settings` ADD CONSTRAINT `site_settings_updated_by_user_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE INDEX `audit_log_actor_idx` ON `audit_log` (`actor_user_id`);--> statement-breakpoint
CREATE INDEX `audit_log_created_idx` ON `audit_log` (`created_at`);--> statement-breakpoint
CREATE INDEX `authorized_sellers_city_idx` ON `authorized_sellers` (`city`);--> statement-breakpoint
CREATE INDEX `authorized_sellers_status_sort_idx` ON `authorized_sellers` (`status`,`sort_order`);--> statement-breakpoint
CREATE INDEX `blog_posts_status_published_idx` ON `blog_posts` (`status`,`published_at`);--> statement-breakpoint
CREATE INDEX `blog_posts_cover_idx` ON `blog_posts` (`cover_media_id`);--> statement-breakpoint
CREATE INDEX `categories_status_sort_idx` ON `categories` (`status`,`sort_order`);--> statement-breakpoint
CREATE INDEX `categories_cover_idx` ON `categories` (`cover_media_id`);--> statement-breakpoint
CREATE INDEX `media_assets_created_idx` ON `media_assets` (`created_at`);--> statement-breakpoint
CREATE INDEX `media_assets_uploaded_by_idx` ON `media_assets` (`uploaded_by`);--> statement-breakpoint
CREATE INDEX `product_documents_product_sort_idx` ON `product_documents` (`product_id`,`sort_order`);--> statement-breakpoint
CREATE INDEX `product_documents_media_idx` ON `product_documents` (`media_id`);--> statement-breakpoint
CREATE INDEX `product_images_product_sort_idx` ON `product_images` (`product_id`,`sort_order`);--> statement-breakpoint
CREATE INDEX `product_images_media_idx` ON `product_images` (`media_id`);--> statement-breakpoint
CREATE INDEX `product_specs_product_sort_idx` ON `product_specifications` (`product_id`,`sort_order`);--> statement-breakpoint
CREATE INDEX `model_codes_active_idx` ON `product_verification_codes` (`active`);--> statement-breakpoint
CREATE INDEX `products_category_status_sort_idx` ON `products` (`category_id`,`status`,`sort_order`);--> statement-breakpoint
CREATE INDEX `products_featured_idx` ON `products` (`is_featured`,`featured_sort_order`);--> statement-breakpoint
CREATE INDEX `public_paths_owner_idx` ON `public_paths` (`owner_type`,`owner_id`);--> statement-breakpoint
CREATE INDEX `public_paths_status_idx` ON `public_paths` (`status`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE INDEX `site_settings_updated_by_idx` ON `site_settings` (`updated_by`);--> statement-breakpoint
CREATE INDEX `url_redirects_new_idx` ON `url_redirects` (`new_path`);--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);
*/