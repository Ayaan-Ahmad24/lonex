import { and, asc, count, desc, eq, like, or } from "drizzle-orm";
import { db } from "@/db";
import { authorizedSellers, mediaAssets } from "@/db/schema";
import { clampPage, pageCountFor } from "@/admin/core/crud/list-params";
import type { ListParams, ListResult } from "@/admin/core/crud/types";

export type SellerListRow = {
  id: number;
  name: string;
  city: string;
  phone: string;
  status: string;
  sortOrder: number;
  updatedAt: Date;
  imageMediaId: number | null;
  imageUrl: string | null;
  imageAlt: string | null;
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
  const page = clampPage(params.page, total, params.pageSize);

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
      imageMediaId: authorizedSellers.imageMediaId,
    })
    .from(authorizedSellers)
    .leftJoin(mediaAssets, eq(mediaAssets.id, authorizedSellers.imageMediaId))
    .where(where)
    .orderBy(direction(sortColumn), asc(authorizedSellers.id))
    .limit(params.pageSize)
    .offset((page - 1) * params.pageSize);

  return {
    rows: rows.map((row) => ({
      ...row,
      imageUrl: row.imageMediaId ? `/admin/media/${row.imageMediaId}/file` : null,
      imageAlt: null,
    })),
    total,
    page,
    pageSize: params.pageSize,
    pageCount: pageCountFor(total, params.pageSize),
  };
}

export async function getSellerById(id: number) {
  const [row] = await db
    .select({
      id: authorizedSellers.id,
      name: authorizedSellers.name,
      city: authorizedSellers.city,
      address: authorizedSellers.address,
      phone: authorizedSellers.phone,
      whatsapp: authorizedSellers.whatsapp,
      googleMapsUrl: authorizedSellers.googleMapsUrl,
      imageMediaId: authorizedSellers.imageMediaId,
      imageAlt: mediaAssets.altText,
      sortOrder: authorizedSellers.sortOrder,
      status: authorizedSellers.status,
      createdAt: authorizedSellers.createdAt,
      updatedAt: authorizedSellers.updatedAt,
    })
    .from(authorizedSellers)
    .leftJoin(mediaAssets, eq(mediaAssets.id, authorizedSellers.imageMediaId))
    .where(eq(authorizedSellers.id, id))
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    ...row,
    imageUrl: row.imageMediaId ? `/admin/media/${row.imageMediaId}/file` : null,
  };
}
