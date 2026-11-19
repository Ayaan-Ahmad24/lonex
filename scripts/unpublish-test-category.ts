import { config } from "dotenv";
config({ path: ".env.local", quiet: true });

/**
 * Removes the stray "Car" test category from the public site by setting it to
 * draft. Nothing is deleted: the row, its slug and any future products remain
 * in the database, and an administrator can republish it from the dashboard.
 */
async function main() {
  const { eq } = await import("drizzle-orm");
  const { db, closeDbPool } = await import("../src/db/client");
  const { categories } = await import("../src/db/schema");

  await db
    .update(categories)
    .set({ status: "draft" })
    .where(eq(categories.slug, "car"));

  const rows = await db
    .select({
      slug: categories.slug,
      name: categories.name,
      status: categories.status,
    })
    .from(categories);

  console.log(rows);
  await closeDbPool();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
