import { and, asc, count, desc, eq, inArray, like, or } from "drizzle-orm";
import { db } from "@/db";
import {
  categories,
  mediaAssets,
  productDocuments,
  productImages,
  productSpecifications,
  productVerificationCodes,
  products,
} from "@/db/schema";
import { clampPage, pageCountFor } from "@/admin/core/crud/list-params";
import type { ListParams, ListResult } from "@/admin/core/crud/types";

export type ProductListRow = {
  id: number;
  name: string;
  slug: string;
  status: string;
  showPrice: boolean;
  price: string | null;
  isFeatured: boolean;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  updatedAt: Date;
};

export async function listProducts(
  params: ListParams,
  categoryId?: number,
): Promise<ListResult<ProductListRow>> {
  const conditions = [];

  if (params.q) {
    conditions.push(
      or(
        like(products.name, `%${params.q}%`),
        like(products.slug, `%${params.q}%`),
      ),
    );
  }

  if (params.filters.status === "draft" || params.filters.status === "published") {
    conditions.push(eq(products.status, params.filters.status));
  }

  if (categoryId) {
    conditions.push(eq(products.categoryId, categoryId));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [countRow] = await db
    .select({ total: count() })
    .from(products)
    .where(where);
  const total = Number(countRow?.total ?? 0);
  const page = clampPage(params.page, total, params.pageSize);

  const direction = params.direction === "asc" ? asc : desc;
  const sortColumn =
    params.sort === "name"
      ? products.name
      : params.sort === "status"
        ? products.status
        : params.sort === "sortOrder"
          ? products.sortOrder
          : products.updatedAt;

  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      status: products.status,
      showPrice: products.showPrice,
      price: products.price,
      isFeatured: products.isFeatured,
      categoryId: products.categoryId,
      categoryName: categories.name,
      categorySlug: categories.slug,
      updatedAt: products.updatedAt,
    })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .where(where)
    .orderBy(direction(sortColumn), asc(products.id))
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

export type ProductEditImage = {
  id: number;
  mediaId: number;
  alt: string;
  isPrimary: boolean;
  sortOrder: number;
  label: string;
};

export type ProductEditSpecification = {
  id: number;
  groupName: string;
  label: string;
  value: string;
  isHighlight: boolean;
  sortOrder: number;
};

export type ProductEditDocument = {
  id: number;
  mediaId: number;
  title: string;
  sortOrder: number;
  label: string;
};

export type ProductDetail = {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: string;
  showPrice: boolean;
  isFeatured: boolean;
  featuredSortOrder: number;
  status: string;
  sortOrder: number;
  seoTitle: string;
  seoDescription: string;
  images: ProductEditImage[];
  specifications: ProductEditSpecification[];
  documents: ProductEditDocument[];
  categoryName: string;
  categorySlug: string;
  verification: {
    active: boolean;
    registeredAt: Date;
    updatedAt: Date;
  } | null;
};

export async function getProductDetail(
  id: number,
): Promise<ProductDetail | null> {
  const [row] = await db
    .select({
      product: products,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .where(eq(products.id, id))
    .limit(1);

  if (!row) {
    return null;
  }

  const [imageRows, specRows, documentRows, codeRow] = await Promise.all([
    db
      .select({
        id: productImages.id,
        mediaId: productImages.mediaId,
        alt: productImages.alt,
        isPrimary: productImages.isPrimary,
        sortOrder: productImages.sortOrder,
        label: mediaAssets.originalName,
      })
      .from(productImages)
      .innerJoin(mediaAssets, eq(mediaAssets.id, productImages.mediaId))
      .where(eq(productImages.productId, id))
      .orderBy(asc(productImages.sortOrder), asc(productImages.id)),
    db
      .select()
      .from(productSpecifications)
      .where(eq(productSpecifications.productId, id))
      .orderBy(
        asc(productSpecifications.sortOrder),
        asc(productSpecifications.id),
      ),
    db
      .select({
        id: productDocuments.id,
        mediaId: productDocuments.mediaId,
        title: productDocuments.title,
        sortOrder: productDocuments.sortOrder,
        label: mediaAssets.originalName,
      })
      .from(productDocuments)
      .innerJoin(mediaAssets, eq(mediaAssets.id, productDocuments.mediaId))
      .where(eq(productDocuments.productId, id))
      .orderBy(asc(productDocuments.sortOrder), asc(productDocuments.id)),
    db
      .select({
        active: productVerificationCodes.active,
        registeredAt: productVerificationCodes.registeredAt,
        updatedAt: productVerificationCodes.updatedAt,
      })
      .from(productVerificationCodes)
      .where(eq(productVerificationCodes.productId, id))
      .limit(1),
  ]);

  const product = row.product;

  return {
    id: product.id,
    categoryId: product.categoryId,
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription ?? "",
    description: product.description ?? "",
    price: product.price ?? "",
    showPrice: product.showPrice,
    isFeatured: product.isFeatured,
    featuredSortOrder: product.featuredSortOrder,
    status: product.status,
    sortOrder: product.sortOrder,
    seoTitle: product.seoTitle ?? "",
    seoDescription: product.seoDescription ?? "",
    categoryName: row.categoryName,
    categorySlug: row.categorySlug,
    images: imageRows.map((image) => ({
      ...image,
      alt: image.alt ?? "",
    })),
    specifications: specRows.map((spec) => ({
      id: spec.id,
      groupName: spec.groupName ?? "",
      label: spec.label,
      value: spec.value,
      isHighlight: spec.isHighlight,
      sortOrder: spec.sortOrder,
    })),
    documents: documentRows,
    verification: codeRow[0] ?? null,
  };
}

export type ProductOption = {
  id: number;
  name: string;
  status: string;
  categoryName: string;
  codeActive: boolean | null;
  codeRegisteredAt: Date | null;
};

export async function listProductOptions(): Promise<ProductOption[]> {
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      status: products.status,
      categoryName: categories.name,
      codeActive: productVerificationCodes.active,
      codeRegisteredAt: productVerificationCodes.registeredAt,
    })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .leftJoin(
      productVerificationCodes,
      eq(productVerificationCodes.productId, products.id),
    )
    .orderBy(asc(categories.sortOrder), asc(products.name));

  return rows;
}

export async function countProductsInCategories(
  categoryIds: number[],
): Promise<Map<number, number>> {
  if (categoryIds.length === 0) {
    return new Map();
  }

  const rows = await db
    .select({ categoryId: products.categoryId, total: count() })
    .from(products)
    .where(inArray(products.categoryId, categoryIds))
    .groupBy(products.categoryId);

  return new Map(rows.map((row) => [row.categoryId, Number(row.total)]));
}

export async function getProductNameById(id: number): Promise<string | null> {
  const [row] = await db
    .select({ name: products.name })
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  return row?.name ?? null;
}
