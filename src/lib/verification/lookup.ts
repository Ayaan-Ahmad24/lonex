import "server-only";

import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  categories,
  mediaAssets,
  productImages,
  productVerificationCodes,
  products,
} from "@/db/schema";
import { digestModelCode, normalizeModelCode } from "./code";

/**
 * Public verification lookup.
 *
 * Returns nothing unless the code is active AND the product and its category
 * are published. Callers must apply rate limiting and return one generic
 * failure message so the endpoint cannot be used to enumerate models.
 */

export type VerifiedModelImage = {
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
};

export type VerifiedModel = {
  productName: string;
  productPath: string;
  categoryName: string;
  registeredAt: Date;
  /** Primary product image, when one is attached. Never required for a match. */
  image: VerifiedModelImage | null;
};

export async function verifyModelCode(
  rawCode: string,
): Promise<VerifiedModel | null> {
  const normalized = normalizeModelCode(rawCode);

  if (!normalized) {
    return null;
  }

  const digest = digestModelCode(normalized);

  const [row] = await db
    .select({
      productName: products.name,
      categorySlug: categories.slug,
      productSlug: products.slug,
      categoryName: categories.name,
      registeredAt: productVerificationCodes.registeredAt,
      imageId: mediaAssets.id,
      imageAlt: mediaAssets.altText,
      imageWidth: mediaAssets.width,
      imageHeight: mediaAssets.height,
    })
    .from(productVerificationCodes)
    .innerJoin(products, eq(products.id, productVerificationCodes.productId))
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .leftJoin(
      productImages,
      and(
        eq(productImages.productId, products.id),
        eq(productImages.isPrimary, true),
      ),
    )
    .leftJoin(mediaAssets, eq(mediaAssets.id, productImages.mediaId))
    .where(
      and(
        eq(productVerificationCodes.codeDigest, digest),
        eq(productVerificationCodes.active, true),
        eq(products.status, "published"),
        eq(categories.status, "published"),
      ),
    )
    .orderBy(asc(productImages.sortOrder))
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    productName: row.productName,
    productPath: `/${row.categorySlug}/${row.productSlug}`,
    categoryName: row.categoryName,
    registeredAt: row.registeredAt,
    image: row.imageId
      ? {
          url: `/media/${row.imageId}`,
          alt: row.imageAlt?.trim() || row.productName,
          width: row.imageWidth,
          height: row.imageHeight,
        }
      : null,
  };
}
