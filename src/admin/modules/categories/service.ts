import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, mediaAssets, products } from "@/db/schema";
import { recordAudit } from "@/lib/audit";
import {
  claimPublicPath,
  releasePublicPath,
  renamePublicPath,
} from "@/lib/content/paths";
import type { CategoryInput } from "./schema";

export type CategoryMutation =
  | { ok: true; id: number }
  | { ok: false; message: string };

class MutationError extends Error {}

function isDuplicateKey(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "ER_DUP_ENTRY"
  );
}

async function hasImage(
  executor: Pick<typeof db, "select">,
  mediaId: number|null,
): Promise<boolean> {
  if (!mediaId) {
    return true;
  }

  const [row] = await executor
    .select({ mimeType: mediaAssets.mimeType })
    .from(mediaAssets)
    .where(eq(mediaAssets.id, mediaId))
    .limit(1);

  return Boolean(row && row.mimeType.startsWith("image/"));
}

export async function createCategory(
  actorUserId: string,
  input: CategoryInput,
): Promise<CategoryMutation> {
  try {
    return await db.transaction(async (tx) => {
      if (!(await hasImage(tx, input.coverMediaId))) {
        throw new MutationError("The selected cover is not an image.");
      }

      const [inserted] = await tx
        .insert(categories)
        .values({
          name: input.name,
          slug: input.slug,
          description: input.description || null,
          coverMediaId: input.coverMediaId,
          status: input.status,
          sortOrder: input.sortOrder,
        })
        .$returningId();

      const claimed = await claimPublicPath(
        tx,
        { ownerType: "category", ownerId: String(inserted.id) },
        { path: `/${input.slug}`, status: input.status },
      );

      if (!claimed.ok) {
        throw new MutationError(claimed.reason);
      }

      await recordAudit(tx, {
        actorUserId,
        action: "category.create",
        targetType: "category",
        targetId: String(inserted.id),
        metadata: { slug: input.slug, status: input.status },
      });

      return { ok: true as const, id: inserted.id };
    });
  } catch (error) {
    if (error instanceof MutationError) {
      return { ok: false, message: error.message };
    }

    if (isDuplicateKey(error)) {
      return {
        ok: false,
        message: "That category slug is already in use.",
      };
    }

    throw error;
  }
}

export async function updateCategory(
  actorUserId: string,
  id: number,
  input: CategoryInput,
): Promise<CategoryMutation> {
  try {
    return await db.transaction(async (tx) => {
      const [existing] = await tx
        .select({ slug: categories.slug })
        .from(categories)
        .where(eq(categories.id, id))
        .limit(1);

      if (!existing) {
        throw new MutationError("Category not found.");
      }

      if (!(await hasImage(tx, input.coverMediaId))) {
        throw new MutationError("The selected cover is not an image.");
      }

      await tx
        .update(categories)
        .set({
          name: input.name,
          slug: input.slug,
          description: input.description || null,
          coverMediaId: input.coverMediaId,
          status: input.status,
          sortOrder: input.sortOrder,
        })
        .where(eq(categories.id, id));

      const owner = { ownerType: "category", ownerId: String(id) };
      const slugChanged = existing.slug !== input.slug;
      const pathResult = slugChanged
        ? await renamePublicPath(tx, owner, {
            from: `/${existing.slug}`,
            to: `/${input.slug}`,
            status: input.status,
          })
        : await claimPublicPath(tx, owner, {
            path: `/${input.slug}`,
            status: input.status,
          });

      if (!pathResult.ok) {
        throw new MutationError(pathResult.reason);
      }

      // A category slug is the first segment of every product URL. Move the
      // children within the same transaction so no product path is left
      // pointing at a category URL that no longer exists.
      let productRedirects = 0;

      if (slugChanged) {
        const children = await tx
          .select({
            id: products.id,
            slug: products.slug,
            status: products.status,
          })
          .from(products)
          .where(eq(products.categoryId, id));

        for (const child of children) {
          const moved = await renamePublicPath(
            tx,
            { ownerType: "product", ownerId: String(child.id) },
            {
              from: `/${existing.slug}/${child.slug}`,
              to: `/${input.slug}/${child.slug}`,
              status: child.status,
            },
          );

          if (!moved.ok) {
            throw new MutationError(
              `Could not move the public URL for product "${child.slug}": ${moved.reason}`,
            );
          }

          if (moved.redirectCreated) {
            productRedirects += 1;
          }
        }
      }

      await recordAudit(tx, {
        actorUserId,
        action: "category.update",
        targetType: "category",
        targetId: String(id),
        metadata: {
          slugChanged,
          status: input.status,
          redirectCreated: pathResult.redirectCreated,
          productRedirects,
        },
      });

      return { ok: true as const, id };
    });
  } catch (error) {
    if (error instanceof MutationError) {
      return { ok: false, message: error.message };
    }

    if (isDuplicateKey(error)) {
      return { ok: false, message: "That category slug is already in use." };
    }

    throw error;
  }
}

export async function setCategoryStatus(
  actorUserId: string,
  id: number,
  status: "draft" | "published",
): Promise<CategoryMutation> {
  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ slug: categories.slug })
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (!existing) {
      return { ok: false as const, message: "Category not found." };
    }

    await tx.update(categories).set({ status }).where(eq(categories.id, id));

    const claimed = await claimPublicPath(
      tx,
      { ownerType: "category", ownerId: String(id) },
      { path: `/${existing.slug}`, status },
    );

    if (!claimed.ok) {
      throw new MutationError(claimed.reason);
    }

    await recordAudit(tx, {
      actorUserId,
      action: status === "published" ? "category.publish" : "category.unpublish",
      targetType: "category",
      targetId: String(id),
    });

    return { ok: true as const, id };
  });
}

export async function deleteCategory(
  actorUserId: string,
  id: number,
): Promise<CategoryMutation> {
  const [productCount] = await db
    .select({ total: count() })
    .from(products)
    .where(eq(products.categoryId, id));

  if (Number(productCount?.total ?? 0) > 0) {
    return {
      ok: false,
      message:
        "This category still has products. Move or delete them before deleting the category.",
    };
  }

  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ slug: categories.slug })
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (!existing) {
      return { ok: false as const, message: "Category not found." };
    }

    await releasePublicPath(tx, {
      ownerType: "category",
      ownerId: String(id),
    });

    await tx.delete(categories).where(eq(categories.id, id));

    await recordAudit(tx, {
      actorUserId,
      action: "category.delete",
      targetType: "category",
      targetId: String(id),
      metadata: { slug: existing.slug },
    });

    return { ok: true as const, id };
  });
}
