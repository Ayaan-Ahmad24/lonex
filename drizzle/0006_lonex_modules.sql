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
	`is_primary` boolean NOT NULL DEFAULT false,
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
	`is_highlight` boolean NOT NULL DEFAULT false,
	`sort_order` int NOT NULL DEFAULT 0,
	CONSTRAINT `product_specifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_verification_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`product_id` int NOT NULL,
	`code_digest` varchar(128) NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
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
	`show_price` boolean NOT NULL DEFAULT false,
	`is_featured` boolean NOT NULL DEFAULT false,
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
CREATE TABLE `url_redirects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`old_path` varchar(255) NOT NULL,
	`new_path` varchar(255) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `url_redirects_id` PRIMARY KEY(`id`),
	CONSTRAINT `url_redirects_old_path_unique` UNIQUE(`old_path`)
);
--> statement-breakpoint
ALTER TABLE `blog_posts` ADD CONSTRAINT `blog_posts_cover_media_id_media_assets_id_fk` FOREIGN KEY (`cover_media_id`) REFERENCES `media_assets`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `blog_posts` ADD CONSTRAINT `blog_posts_created_by_user_id_fk` FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `blog_posts` ADD CONSTRAINT `blog_posts_updated_by_user_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `categories` ADD CONSTRAINT `categories_cover_media_id_media_assets_id_fk` FOREIGN KEY (`cover_media_id`) REFERENCES `media_assets`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_documents` ADD CONSTRAINT `product_documents_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_documents` ADD CONSTRAINT `product_documents_media_id_media_assets_id_fk` FOREIGN KEY (`media_id`) REFERENCES `media_assets`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_images` ADD CONSTRAINT `product_images_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_images` ADD CONSTRAINT `product_images_media_id_media_assets_id_fk` FOREIGN KEY (`media_id`) REFERENCES `media_assets`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_specifications` ADD CONSTRAINT `product_specifications_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_verification_codes` ADD CONSTRAINT `product_verification_codes_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `authorized_sellers_city_idx` ON `authorized_sellers` (`city`);--> statement-breakpoint
CREATE INDEX `authorized_sellers_status_sort_idx` ON `authorized_sellers` (`status`,`sort_order`);--> statement-breakpoint
CREATE INDEX `blog_posts_status_published_idx` ON `blog_posts` (`status`,`published_at`);--> statement-breakpoint
CREATE INDEX `blog_posts_cover_idx` ON `blog_posts` (`cover_media_id`);--> statement-breakpoint
CREATE INDEX `categories_status_sort_idx` ON `categories` (`status`,`sort_order`);--> statement-breakpoint
CREATE INDEX `categories_cover_idx` ON `categories` (`cover_media_id`);--> statement-breakpoint
CREATE INDEX `product_documents_product_sort_idx` ON `product_documents` (`product_id`,`sort_order`);--> statement-breakpoint
CREATE INDEX `product_documents_media_idx` ON `product_documents` (`media_id`);--> statement-breakpoint
CREATE INDEX `product_images_product_sort_idx` ON `product_images` (`product_id`,`sort_order`);--> statement-breakpoint
CREATE INDEX `product_images_media_idx` ON `product_images` (`media_id`);--> statement-breakpoint
CREATE INDEX `product_specs_product_sort_idx` ON `product_specifications` (`product_id`,`sort_order`);--> statement-breakpoint
CREATE INDEX `model_codes_active_idx` ON `product_verification_codes` (`active`);--> statement-breakpoint
CREATE INDEX `products_category_status_sort_idx` ON `products` (`category_id`,`status`,`sort_order`);--> statement-breakpoint
CREATE INDEX `products_featured_idx` ON `products` (`is_featured`,`featured_sort_order`);--> statement-breakpoint
CREATE INDEX `url_redirects_new_idx` ON `url_redirects` (`new_path`);--> statement-breakpoint
-- LONEX approved starter categories. Names are approved; descriptions and
-- imagery are intentionally empty until the client supplies real content.
INSERT INTO `categories` (`name`, `slug`, `description`, `status`, `sort_order`) VALUES
	('Solar Panels', 'solar', NULL, 'published', 10),
	('EV Bikes', 'ev-bikes', NULL, 'published', 20),
	('Batteries', 'batteries', NULL, 'published', 30);--> statement-breakpoint
-- Claim the matching public paths through the single URL registry (decision 0001).
INSERT INTO `public_paths` (`path`, `owner_type`, `owner_id`, `status`)
SELECT CONCAT('/', `slug`), 'category', CAST(`id` AS CHAR), 'published'
FROM `categories`;