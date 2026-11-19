import { config } from "dotenv";
config({ path: ".env.local", quiet: true });

async function main() {
  const { eq } = await import("drizzle-orm");
  const { db, closeDbPool } = await import("../src/db/client");
  const { blogPosts } = await import("../src/db/schema");

  await db
    .update(blogPosts)
    .set({ status: "draft" })
    .where(eq(blogPosts.slug, "www"));

  const rows = await db
    .select({ slug: blogPosts.slug, status: blogPosts.status })
    .from(blogPosts);

  console.log(rows);
  await closeDbPool();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
