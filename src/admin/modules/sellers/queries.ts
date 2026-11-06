import { and, asc, count, desc, eq, like, or } from "drizzle-orm";
import { db } from "@/db";
import { authorizedSellers } from "@/db/schema";
import { pageCountFor } from "@/admin/core/crud/list-params";
import type { ListParams, ListResult } from "@/admin/core/crud/types";

export type SellerListRow = {
  id: number;
  name: string;
  city: string;
  phone: string;
  status: string;
  sortOrder: number;
  updatedAt: Date;
};

export async function listSellers(
  params: ListParams,
): Promise<ListResult<SellerListRow>> {
  const conditions = [];

  if (params.q) {
    conditions.push(
      or(
        like(authorizedSellers.name, `%${params.q}%`),
        like(authorizedSellers.city, `%${params.q}%`),
        like(authorizedSellers.phone, `%${params.q}%`),
      ),
    );
  }

  if (
    params.filters.status === "active" ||
    params.filters.status === "inactive"
  ) {
    conditions.push(eq(authorizedSellers.status, params.filters.status));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [countRow] = await db
    .select({ total: count() })
    .from(authorizedSellers)
    .where(where);
  const total = Number(countRow?.total ?? 0);
  const page = Math.min(params.page, pageCountFor(total, params.pageSize));

  const direction = params.direction === "asc" ? asc : desc;
  const sortColumn =
    params.sort === "name"
      ? authorizedSellers.name
      : params.sort === "city"
        ? authorizedSellers.city
        : params.sort === "status"
          ? authorizedSellers.status
          : params.sort === "sortOrder"
            ? authorizedSellers.sortOrder
            : authorizedSellers.updatedAt;

  const rows = await db
    .select({
      id: authorizedSellers.id,
      name: authorizedSellers.name,
      city: authorizedSellers.city,
      phone: authorizedSellers.phone,
      status: authorizedSellers.status,
      sortOrder: authorizedSellers.sortOrder,
      updatedAt: authorizedSellers.updatedAt,
    })
    .from(authorizedSellers)
    .where(where)
    .orderBy(direction(sortColumn), asc(authorizedSellers.id))
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

export async function getSellerById(id: number) {
  const [row] = await db
    .select()
    .from(authorizedSellers)
    .where(eq(authorizedSellers.id, id))
    .limit(1);

  return row ?? null;
}
