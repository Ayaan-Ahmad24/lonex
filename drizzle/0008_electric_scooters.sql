-- LONEX 0008 — Reposition Electric Bikes as Electric Scooters
--
-- Renames the existing EV Bikes category to Electric Scooters with slug
-- `electric-scooters`, preserves the category ID and product relationships,
-- and records permanent redirects for every historical path.
--
-- Up (applied once):
--   1. Rename category record (name + slug), keeping id.
--   2. Rename category public path /ev-bikes -> /electric-scooters.
--   3. Rename product public paths /ev-bikes/* -> /electric-scooters/*.
--   4. Record redirects from old paths to new paths.
--   5. Keep product slugs intact (products keep id, slug, name).
--
-- Down (reversible):
--   Reverts category name/slug and public paths to the historical values.

-- 1. Rename the category record, preserving id, sortOrder and coverMediaId.
UPDATE `categories`
SET `name` = 'Electric Scooters',
    `slug` = 'electric-scooters'
WHERE `id` = 2;

-- 2. Move the category public path and record the redirect.
UPDATE `public_paths`
SET `path` = '/electric-scooters'
WHERE `owner_type` = 'category' AND `owner_id` = '2' AND `path` = '/ev-bikes';

INSERT INTO `url_redirects` (`old_path`, `new_path`)
VALUES ('/ev-bikes', '/electric-scooters')
ON DUPLICATE KEY UPDATE `new_path` = VALUES(`new_path`);

-- 3. Move every product path below the category and record redirects.
UPDATE `public_paths` pp
JOIN `products` p ON p.id = CAST(pp.owner_id AS UNSIGNED)
SET pp.`path` = CONCAT('/electric-scooters/', p.`slug`)
WHERE pp.`owner_type` = 'product'
  AND pp.`path` LIKE '/ev-bikes/%';

INSERT INTO `url_redirects` (`old_path`, `new_path`)
SELECT CONCAT('/ev-bikes/', p.`slug`), CONCAT('/electric-scooters/', p.`slug`)
FROM `products` p
WHERE p.`category_id` = 2
ON DUPLICATE KEY UPDATE `new_path` = VALUES(`new_path`);
