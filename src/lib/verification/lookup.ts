import "server-only";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  categories,
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

export type VerifiedModel = {
  productName: string;
  productPath: string;
  categoryName: string;
  registeredAt: Date;
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
    })
    .from(productVerificationCodes)
    .innerJoin(products, eq(products.id, productVerificationCodes.productId))
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .where(
      and(
        eq(productVerificationCodes.codeDigest, digest),
        eq(productVerificationCodes.active, true),
        eq(products.status, "published"),
        eq(categories.status, "published"),
      ),
    )
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    productName: row.productName,
    productPath: `/${row.categorySlug}/${row.productSlug}`,
    categoryName: row.categoryName,
    registeredAt: row.registeredAt,
  };
}
