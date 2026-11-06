import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  categories,
  mediaAssets,
  productDocuments,
  productImages,
  productSpecifications,
  products,
} from "@/db/schema";
import { recordAudit } from "@/lib/audit";
import {
  claimPublicPath,
  releasePublicPath,
  renamePublicPath,
} from "@/lib/content/paths";
import type { ProductInput } from "./schema";

export type ProductMutation =
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

type Executor = Pick<typeof db, "select">;

async function getCategorySlug(
  executor: Executor,
  categoryId: number,
): Promise<string> {
  const [row] = await executor
    .select({ slug: categories.slug })
    .from(categories)
    .where(eq(categories.id, categoryId))
    .limit(1);

  if (!row) {
    throw new MutationError("The selected category does not exist.");
  }

  return row.slug;
}

async function assertMediaTypes(
  executor: Executor,
  imageIds: number[],
  documentIds: number[],
): Promise<void> {
  const ids = Array.from(new Set([...imageIds, ...documentIds]));

  if (ids.length === 0) {
    return;
  }

  const rows = await executor
    .select({ id: mediaAssets.id, mimeType: mediaAssets.mimeType })
    .from(mediaAssets)
    .where(inArray(mediaAssets.id, ids));

  const mimeById = new Map(rows.map((row) => [row.id, row.mimeType]));

  for (const id of imageIds) {
    if (!mimeById.get(id)?.startsWith("image/")) {
      throw new MutationError("Every gallery item must be an image.");
    }
  }

  for (const id of documentIds) {
    if (mimeById.get(id) !== "application/pdf") {
      throw new MutationError("Datasheets must be PDF files.");
    }
  }
}

function normalizedImages(input: ProductInput) {
  const images = input.images.map((image, index) => ({
    ...image,
    sortOrder: index,
  }));

  if (images.length === 0) {
    return images;
  }

  const requested = images.findIndex((image) => image.isPrimary);
  const primaryIndex = requested >= 0 ? requested : 0;

  return images.map((image, index) => ({
    ...image,
    isPrimary: index === primaryIndex,
  }));
}

async function replaceChildren(
  executor: Pick<typeof db, "insert" | "delete">,
  productId: number,
  input: ProductInput,
): Promise<void> {
  await executor
    .delete(productImages)
    .where(eq(productImages.productId, productId));
  await executor
    .delete(productSpecifications)
    .where(eq(productSpecifications.productId, productId));
  await executor
    .delete(productDocuments)
    .where(eq(productDocuments.productId, productId));

  const images = normalizedImages(input);

  if (images.length > 0) {
    await executor.insert(productImages).values(
      images.map((image) => ({
        productId,
        mediaId: image.mediaId,
        alt: image.alt || null,
        isPrimary: image.isPrimary,
        sortOrder: image.sortOrder,
      })),
    );
  }

  if (input.specifications.length > 0) {
    await executor.insert(productSpecifications).values(
      input.specifications.map((spec, index) => ({
        productId,
        groupName: spec.groupName || null,
        label: spec.label,
        value: spec.value,
        isHighlight: spec.isHighlight,
        sortOrder: index,
      })),
    );
  }

  if (input.documents.length > 0) {
    await executor.insert(productDocuments).values(
      input.documents.map((document, index) => ({
        productId,
        mediaId: document.mediaId,
        title: document.title,
        sortOrder: index,
      })),
    );
  }
}

export async function createProduct(
  actorUserId: string,
  input: ProductInput,
): Promise<ProductMutation> {
  try {
    return await db.transaction(async (tx) => {
      const categorySlug = await getCategorySlug(tx, input.categoryId);

      await assertMediaTypes(
        tx,
        input.images.map((image) => image.mediaId),
        input.documents.map((document) => document.mediaId),
      );

      const [inserted] = await tx
        .insert(products)
        .values({
          categoryId: input.categoryId,
          name: input.name,
          slug: input.slug,
          shortDescription: input.shortDescription || null,
          description: input.description || null,
          price: input.price === null ? null : input.price.toFixed(2),
          showPrice: input.showPrice,
          isFeatured: input.isFeatured,
          featuredSortOrder: input.featuredSortOrder,
          status: input.status,
          sortOrder: input.sortOrder,
          seoTitle: input.seoTitle || null,
          seoDescription: input.seoDescription || null,
        })
        .$returningId();

      await replaceChildren(tx, inserted.id, input);

      const claimed = await claimPublicPath(
        tx,
        { ownerType: "product", ownerId: String(inserted.id) },
        { path: `/${categorySlug}/${input.slug}`, status: input.status },
      );

      if (!claimed.ok) {
        throw new MutationError(claimed.reason);
      }

      await recordAudit(tx, {
        actorUserId,
        action: "product.create",
        targetType: "product",
        targetId: String(inserted.id),
        metadata: { categoryId: input.categoryId, status: input.status },
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
        message: "That product slug is already used in this category.",
      };
    }

    throw error;
  }
}

export async function updateProduct(
  actorUserId: string,
  id: number,
  input: ProductInput,
): Promise<ProductMutation> {
  try {
    return await db.transaction(async (tx) => {
      const [existing] = await tx
        .select({
          slug: products.slug,
          categoryId: products.categoryId,
        })
        .from(products)
        .where(eq(products.id, id))
        .limit(1);

      if (!existing) {
        throw new MutationError("Product not found.");
      }

      const [oldCategorySlug, newCategorySlug] = await Promise.all([
        getCategorySlug(tx, existing.categoryId),
        getCategorySlug(tx, input.categoryId),
      ]);

      await assertMediaTypes(
        tx,
        input.images.map((image) => image.mediaId),
        input.documents.map((document) => document.mediaId),
      );

      await tx
        .update(products)
        .set({
          categoryId: input.categoryId,
          name: input.name,
          slug: input.slug,
          shortDescription: input.shortDescription || null,
          description: input.description || null,
          price: input.price === null ? null : input.price.toFixed(2),
          showPrice: input.showPrice,
          isFeatured: input.isFeatured,
          featuredSortOrder: input.featuredSortOrder,
          status: input.status,
          sortOrder: input.sortOrder,
          seoTitle: input.seoTitle || null,
          seoDescription: input.seoDescription || null,
        })
        .where(eq(products.id, id));

      await replaceChildren(tx, id, input);

      const oldPath = `/${oldCategorySlug}/${existing.slug}`;
      const newPath = `/${newCategorySlug}/${input.slug}`;
      const owner = { ownerType: "product", ownerId: String(id) };
      const pathResult =
        oldPath === newPath
          ? await claimPublicPath(tx, owner, {
              path: newPath,
              status: input.status,
            })
          : await renamePublicPath(tx, owner, {
              from: oldPath,
              to: newPath,
              status: input.status,
            });

      if (!pathResult.ok) {
        throw new MutationError(pathResult.reason);
      }

      await recordAudit(tx, {
        actorUserId,
        action: "product.update",
        targetType: "product",
        targetId: String(id),
        metadata: {
          categoryId: input.categoryId,
          status: input.status,
          redirectCreated: pathResult.redirectCreated,
        },
      });

      return { ok: true as const, id };
    });
  } catch (error) {
    if (error instanceof MutationError) {
      return { ok: false, message: error.message };
    }

    if (isDuplicateKey(error)) {
      return {
        ok: false,
        message: "That product slug is already used in this category.",
      };
    }

    throw error;
  }
}

export async function deleteProduct(
  actorUserId: string,
  id: number,
): Promise<ProductMutation> {
  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ slug: products.slug, categoryId: products.categoryId })
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!existing) {
      return { ok: false as const, message: "Product not found." };
    }

    await releasePublicPath(tx, {
      ownerType: "product",
      ownerId: String(id),
    });

    await tx.delete(products).where(eq(products.id, id));

    await recordAudit(tx, {
      actorUserId,
      action: "product.delete",
      targetType: "product",
      targetId: String(id),
      metadata: { slug: existing.slug },
    });

    return { ok: true as const, id };
  });
}
