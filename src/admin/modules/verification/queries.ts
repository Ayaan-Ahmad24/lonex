import { and, asc, count, desc, eq, isNull, like, or } from "drizzle-orm";
import { db } from "@/db";
import { categories, productVerificationCodes, products } from "@/db/schema";
import { clampPage, pageCountFor } from "@/admin/core/crud/list-params";
import type { ListParams, ListResult } from "@/admin/core/crud/types";

export type VerificationRow = {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  categorySlug: string;
  status: string;
  active: boolean | null;
  registeredAt: Date | null;
  updatedAt: Date | null;
};

export async function listVerificationRows(
  params: ListParams,
): Promise<ListResult<VerificationRow>> {
  const conditions = [];

  if (params.q) {
    conditions.push(
      or(
        like(products.name, `%${params.q}%`),
        like(products.slug, `%${params.q}%`),
      ),
    );
  }

  const codeState = params.filters.code;

  if (codeState === "active") {
    conditions.push(eq(productVerificationCodes.active, true));
  } else if (codeState === "inactive") {
    conditions.push(eq(productVerificationCodes.active, false));
  } else if (codeState === "missing") {
    conditions.push(isNull(productVerificationCodes.id));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [countRow] = await db
    .select({ total: count() })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .leftJoin(
      productVerificationCodes,
      eq(productVerificationCodes.productId, products.id),
    )
    .where(where);
  const total = Number(countRow?.total ?? 0);
  const page = clampPage(params.page, total, params.pageSize);

    const rows = await db
      .select({
        id: products.id,
        productId: products.id,
        productName: products.name,
      productSlug: products.slug,
      categorySlug: categories.slug,
      status: products.status,
      active: productVerificationCodes.active,
      registeredAt: productVerificationCodes.registeredAt,
      updatedAt: productVerificationCodes.updatedAt,
    })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .leftJoin(
      productVerificationCodes,
      eq(productVerificationCodes.productId, products.id),
    )
    .where(where)
    .orderBy(asc(products.name), desc(products.id))
    .limit(params.pageSize)
    .offset((page - 1) * params.pageSize);

  return {
    rows,
    total,
    page,
    pageSize: params.pageSize,
    pageCount: pageCountFor(total, params.pageSize),
  };
}

export async function getVerificationForProduct(
  productId: number,
): Promise<VerificationRow | null> {
  const [row] = await db
    .select({
      id: products.id,
      productId: products.id,
      productName: products.name,
      productSlug: products.slug,
      categorySlug: categories.slug,
      status: products.status,
      active: productVerificationCodes.active,
      registeredAt: productVerificationCodes.registeredAt,
      updatedAt: productVerificationCodes.updatedAt,
    })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .leftJoin(
      productVerificationCodes,
      eq(productVerificationCodes.productId, products.id),
    )
    .where(eq(products.id, productId))
    .limit(1);

  return row ?? null;
}
