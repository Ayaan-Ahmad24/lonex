import { and, asc, count, desc, eq, like, or } from "drizzle-orm";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { pageCountFor } from "@/admin/core/crud/list-params";
import type { ListParams, ListResult } from "@/admin/core/crud/types";

export type CategoryListRow = {
  id: number;
  name: string;
  slug: string;
  status: string;
  sortOrder: number;
  productCount: number;
  updatedAt: Date;
};

export async function listCategories(
  params: ListParams,
): Promise<ListResult<CategoryListRow>> {
  const conditions = [];

  if (params.q) {
    conditions.push(
      or(
        like(categories.name, `%${params.q}%`),
        like(categories.slug, `%${params.q}%`),
      ),
    );
  }

  const status = params.filters.status;

  if (status === "draft" || status === "published") {
    conditions.push(eq(categories.status, status));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [countRow] = await db
    .select({ total: count() })
    .from(categories)
    .where(where);
  const total = Number(countRow?.total ?? 0);
  const page = Math.min(params.page, pageCountFor(total, params.pageSize));

  const direction = params.direction === "asc" ? asc : desc;
  const sortColumn =
    params.sort === "name"
      ? categories.name
      : params.sort === "status"
        ? categories.status
        : params.sort === "sortOrder"
          ? categories.sortOrder
          : categories.updatedAt;

  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      status: categories.status,
      sortOrder: categories.sortOrder,
      updatedAt: categories.updatedAt,
      productCount: count(products.id),
    })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .where(where)
    .groupBy(categories.id)
    .orderBy(
      direction(sortColumn),
      // Match the public catalogue's stable secondary order for priority.
      params.sort === "sortOrder" ? asc(categories.name) : asc(categories.id),
    )
    .limit(params.pageSize)
    .offset((page - 1) * params.pageSize);

  return {
    rows: rows.map((row) => ({
      ...row,
      productCount: Number(row.productCount ?? 0),
    })),
    total,
    page,
    pageSize: params.pageSize,
    pageCount: pageCountFor(total, params.pageSize),
  };
}

export async function getCategoryById(id: number) {
  const [row] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);

  return row ?? null;
}

export async function listCategoryOptions(): Promise<
  { id: number; name: string; status: string }[]
> {
  return db
    .select({ id: categories.id, name: categories.name, status: categories.status })
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}
