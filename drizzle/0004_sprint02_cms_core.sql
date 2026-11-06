CREATE TABLE `content_revisions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entity_type` varchar(50) NOT NULL,
	`entity_id` varchar(64) NOT NULL,
	`snapshot_json` json NOT NULL,
	`changed_by` varchar(36),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `content_revisions_id` PRIMARY KEY(`id`)
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
CREATE TABLE `page_sections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`page_id` int NOT NULL,
	`section_type` varchar(50) NOT NULL,
	`schema_version` int NOT NULL DEFAULT 1,
	`config_json` json NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`is_visible` boolean NOT NULL DEFAULT true,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `page_sections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(200) NOT NULL,
	`template` varchar(50) NOT NULL DEFAULT 'standard',
	`status` varchar(20) NOT NULL DEFAULT 'draft',
	`seo_title` varchar(255),
	`seo_description` varchar(500),
	`og_media_id` int,
	`no_index` boolean NOT NULL DEFAULT false,
	`published_at` timestamp(3),
	`created_by` varchar(36),
	`updated_by` varchar(36),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `pages_id` PRIMARY KEY(`id`)
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
ALTER TABLE `content_revisions` ADD CONSTRAINT `content_revisions_changed_by_user_id_fk` FOREIGN KEY (`changed_by`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media_assets` ADD CONSTRAINT `media_assets_uploaded_by_user_id_fk` FOREIGN KEY (`uploaded_by`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `page_sections` ADD CONSTRAINT `page_sections_page_id_pages_id_fk` FOREIGN KEY (`page_id`) REFERENCES `pages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pages` ADD CONSTRAINT `pages_og_media_id_media_assets_id_fk` FOREIGN KEY (`og_media_id`) REFERENCES `media_assets`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pages` ADD CONSTRAINT `pages_created_by_user_id_fk` FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pages` ADD CONSTRAINT `pages_updated_by_user_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `site_settings` ADD CONSTRAINT `site_settings_updated_by_user_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `content_revisions_entity_idx` ON `content_revisions` (`entity_type`,`entity_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `media_assets_created_idx` ON `media_assets` (`created_at`);--> statement-breakpoint
CREATE INDEX `media_assets_uploaded_by_idx` ON `media_assets` (`uploaded_by`);--> statement-breakpoint
CREATE INDEX `page_sections_page_sort_idx` ON `page_sections` (`page_id`,`sort_order`);--> statement-breakpoint
CREATE INDEX `pages_status_idx` ON `pages` (`status`);--> statement-breakpoint
CREATE INDEX `pages_slug_idx` ON `pages` (`slug`);--> statement-breakpoint
CREATE INDEX `pages_created_by_idx` ON `pages` (`created_by`);--> statement-breakpoint
CREATE INDEX `public_paths_owner_idx` ON `public_paths` (`owner_type`,`owner_id`);--> statement-breakpoint
CREATE INDEX `public_paths_status_idx` ON `public_paths` (`status`);--> statement-breakpoint
CREATE INDEX `site_settings_updated_by_idx` ON `site_settings` (`updated_by`);