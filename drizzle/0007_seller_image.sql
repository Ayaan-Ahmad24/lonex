ALTER TABLE `authorized_sellers` ADD `image_media_id` int;--> statement-breakpoint
ALTER TABLE `authorized_sellers` ADD CONSTRAINT `authorized_sellers_image_media_id_media_assets_id_fk` FOREIGN KEY (`image_media_id`) REFERENCES `media_assets`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `authorized_sellers_image_idx` ON `authorized_sellers` (`image_media_id`);