// Step 7 audit: dump the real published content so page copy is written
// against actual records, not assumptions.
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config({ path: ".env.local", quiet: true });

const connection = await mysql.createConnection({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT ?? 3306),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

const [categories] = await connection.query(
  `SELECT id, name, slug, status, description, cover_media_id, sort_order
   FROM categories ORDER BY sort_order, name`,
);

const [products] = await connection.query(
  `SELECT id, category_id, name, slug, status, is_featured, short_description,
          description, price, show_price, sort_order
   FROM products ORDER BY category_id, sort_order, name`,
);

const [images] = await connection.query(
  `SELECT pi.product_id, pi.media_id, pi.alt, pi.is_primary, pi.sort_order,
          ma.alt_text, ma.width, ma.height, ma.original_name, ma.storage_key
   FROM product_images pi
   JOIN media_assets ma ON ma.id = pi.media_id
   ORDER BY pi.product_id, pi.is_primary DESC, pi.sort_order`,
);

const [specs] = await connection.query(
  `SELECT product_id, group_name, label, value, is_highlight, sort_order
   FROM product_specifications ORDER BY product_id, sort_order`,
);

const [media] = await connection.query(
  `SELECT id, alt_text, width, height, original_name, storage_key FROM media_assets ORDER BY id`,
);

const [settings] = await connection.query(
  `SELECT * FROM site_settings LIMIT 1`,
);

await connection.end();

const byProduct = (rows, key = "product_id") =>
  rows.reduce((acc, row) => {
    (acc[row[key]] ??= []).push(row);
    return acc;
  }, {});

const imagesByProduct = byProduct(images);
const specsByProduct = byProduct(specs);

const published = products.filter((p) => p.status === "published");

const report = {
  categories: categories.map((c) => ({
    ...c,
    products: published
      .filter((p) => p.category_id === c.id)
      .map((p) => ({
        ...p,
        images: imagesByProduct[p.id] ?? [],
        specs: specsByProduct[p.id] ?? [],
      })),
  })),
  unpublishedProducts: products
    .filter((p) => p.status !== "published")
    .map((p) => ({ id: p.id, name: p.name, status: p.status })),
  media,
  settings,
};

console.log(JSON.stringify(report, null, 2));
