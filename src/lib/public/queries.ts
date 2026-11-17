import "server-only";

import { and, asc, count, desc, eq, ne, or, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  authorizedSellers,
  blogPosts,
  categories,
  mediaAssets,
  productDocuments,
  productImages,
  productSpecifications,
  products,
} from "@/db/schema";
import {
  formatPublishedDate,
  publicPriceLabel,
  type PublicBlogCard,
  type PublicBlogPost,
  type PublicCategory,
  type PublicImage,
  type PublicProduct,
  type PublicProductCard,
  type PublicProductImage,
  type PublicSeller,
  type PublicSitemapEntry,
  type PublicSpecificationGroup,
} from "./dto";

/**
 * Public read model.
 *
 * Every query filters to published rows. Draft categories, products and posts
 * therefore cannot appear in HTML, metadata, sitemap output or API responses.
 */

const PUBLISHED = "published";

type MediaRow = {
  id: number;
  altText: string | null;
  width: number | null;
  height: number | null;
};

function toImage(media: MediaRow | null, fallbackAlt: string): PublicImage | null {
  if (!media) {
    return null;
  }

  return {
    id: media.id,
    url: `/media/${media.id}`,
    alt: media.altText?.trim() || fallbackAlt,
    width: media.width,
    height: media.height,
  };
}

const mediaSelection = {
  id: mediaAssets.id,
  altText: mediaAssets.altText,
  width: mediaAssets.width,
  height: mediaAssets.height,
};

export async function listPublishedCategories(): Promise<PublicCategory[]> {
  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      mediaId: mediaAssets.id,
      mediaAlt: mediaAssets.altText,
      mediaWidth: mediaAssets.width,
      mediaHeight: mediaAssets.height,
      productCount: sql<number>`(
        SELECT COUNT(*) FROM ${products}
        WHERE ${products.categoryId} = ${categories.id}
          AND ${products.status} = ${PUBLISHED}
      )`,
    })
    .from(categories)
    .leftJoin(mediaAssets, eq(mediaAssets.id, categories.coverMediaId))
    .where(eq(categories.status, PUBLISHED))
    .orderBy(asc(categories.sortOrder), asc(categories.name));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    path: `/${row.slug}`,
    description: row.description,
    cover: toImage(
      row.mediaId
        ? {
            id: row.mediaId,
            altText: row.mediaAlt,
            width: row.mediaWidth,
            height: row.mediaHeight,
          }
        : null,
      row.name,
    ),
    hasProducts: Number(row.productCount) > 0,
  }));
}

export async function getPublishedCategoryBySlug(
  slug: string,
): Promise<PublicCategory | null> {
  const rows = await listPublishedCategories();

  return rows.find((category) => category.slug === slug) ?? null;
}

export type ProductListResult = {
  items: PublicProductCard[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

function mapCard(row: {
  id: number;
  name: string;
  slug: string;
  shortDescription: string | null;
  price: string | null;
  showPrice: boolean;
  isFeatured: boolean;
  categorySlug: string;
  mediaId: number | null;
  mediaAlt: string | null;
  mediaWidth: number | null;
  mediaHeight: number | null;
}): PublicProductCard {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    path: `/${row.categorySlug}/${row.slug}`,
    shortDescription: row.shortDescription,
    image: toImage(
      row.mediaId
        ? {
            id: row.mediaId,
            altText: row.mediaAlt,
            width: row.mediaWidth,
            height: row.mediaHeight,
          }
        : null,
      row.name,
    ),
    priceLabel: publicPriceLabel(row.price, row.showPrice),
    isFeatured: row.isFeatured,
  };
}

function primaryImageJoin() {
  return sql`${productImages.id} = (
    SELECT pi.id FROM ${productImages} pi
    WHERE pi.product_id = ${products.id}
    ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.id ASC
    LIMIT 1
  )`;
}

export async function listPublishedProducts(options: {
  categoryId: number;
  page?: number;
  pageSize?: number;
}): Promise<ProductListResult> {
  const pageSize = options.pageSize ?? 12;
  const requestedPage = Number.isFinite(options.page) ? (options.page as number) : 1;

  const conditions = and(
    eq(products.categoryId, options.categoryId),
    eq(products.status, PUBLISHED),
  );

  const [countRow] = await db
    .select({ total: count() })
    .from(products)
    .where(conditions);

  const total = Number(countRow?.total ?? 0);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, requestedPage), pageCount);

  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      shortDescription: products.shortDescription,
      price: products.price,
      showPrice: products.showPrice,
      isFeatured: products.isFeatured,
      categorySlug: categories.slug,
      mediaId: mediaAssets.id,
      mediaAlt: mediaAssets.altText,
      mediaWidth: mediaAssets.width,
      mediaHeight: mediaAssets.height,
    })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .leftJoin(productImages, primaryImageJoin())
    .leftJoin(mediaAssets, eq(mediaAssets.id, productImages.mediaId))
    .where(conditions)
    .orderBy(asc(products.sortOrder), asc(products.name))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return {
    items: rows.map(mapCard),
    total,
    page,
    pageSize,
    pageCount,
  };
}

export async function listFeaturedProducts(
  limit = 4,
): Promise<PublicProductCard[]> {
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      shortDescription: products.shortDescription,
      price: products.price,
      showPrice: products.showPrice,
      isFeatured: products.isFeatured,
      categorySlug: categories.slug,
      mediaId: mediaAssets.id,
      mediaAlt: mediaAssets.altText,
      mediaWidth: mediaAssets.width,
      mediaHeight: mediaAssets.height,
    })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .leftJoin(productImages, primaryImageJoin())
    .leftJoin(mediaAssets, eq(mediaAssets.id, productImages.mediaId))
    .where(
      and(
        eq(products.status, PUBLISHED),
        eq(products.isFeatured, true),
        eq(categories.status, PUBLISHED),
      ),
    )
    .orderBy(asc(products.featuredSortOrder), asc(products.name))
    .limit(limit);

  return rows.map(mapCard);
}

export async function getPublishedProductBySlugs(
  categorySlug: string,
  productSlug: string,
): Promise<{ product: PublicProduct; category: PublicCategory } | null> {
  const [row] = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      shortDescription: products.shortDescription,
      description: products.description,
      price: products.price,
      showPrice: products.showPrice,
      isFeatured: products.isFeatured,
      seoTitle: products.seoTitle,
      seoDescription: products.seoDescription,
      categoryId: categories.id,
      categoryName: categories.name,
      categorySlug: categories.slug,
      categoryDescription: categories.description,
      categoryMediaId: categories.coverMediaId,
    })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .where(
      and(
        eq(products.slug, productSlug),
        eq(categories.slug, categorySlug),
        eq(products.status, PUBLISHED),
        eq(categories.status, PUBLISHED),
      ),
    )
    .limit(1);

  if (!row) {
    return null;
  }

  const [imageRows, specRows, documentRows, categoryCover] = await Promise.all([
    db
      .select({
        id: productImages.id,
        mediaId: mediaAssets.id,
        alt: productImages.alt,
        isPrimary: productImages.isPrimary,
        altText: mediaAssets.altText,
        width: mediaAssets.width,
        height: mediaAssets.height,
      })
      .from(productImages)
      .innerJoin(mediaAssets, eq(mediaAssets.id, productImages.mediaId))
      .where(eq(productImages.productId, row.id))
      .orderBy(
        desc(productImages.isPrimary),
        asc(productImages.sortOrder),
        asc(productImages.id),
      ),
    db
      .select({
        groupName: productSpecifications.groupName,
        label: productSpecifications.label,
        value: productSpecifications.value,
        isHighlight: productSpecifications.isHighlight,
        sortOrder: productSpecifications.sortOrder,
      })
      .from(productSpecifications)
      .where(eq(productSpecifications.productId, row.id))
      .orderBy(
        asc(productSpecifications.sortOrder),
        asc(productSpecifications.id),
      ),
    db
      .select({
        id: productDocuments.id,
        mediaId: mediaAssets.id,
        title: productDocuments.title,
        fileName: mediaAssets.originalName,
      })
      .from(productDocuments)
      .innerJoin(mediaAssets, eq(mediaAssets.id, productDocuments.mediaId))
      .where(eq(productDocuments.productId, row.id))
      .orderBy(
        asc(productDocuments.sortOrder),
        asc(productDocuments.id),
      ),
    row.categoryMediaId
      ? db
          .select(mediaSelection)
          .from(mediaAssets)
          .where(eq(mediaAssets.id, row.categoryMediaId))
          .limit(1)
      : Promise.resolve([]),
  ]);

  const images: PublicProductImage[] = imageRows.map((image) => ({
    id: image.mediaId,
    url: `/media/${image.mediaId}`,
    alt: image.alt?.trim() || image.altText?.trim() || row.name,
    width: image.width,
    height: image.height,
    isPrimary: image.isPrimary,
  }));

  const groups = new Map<string, PublicSpecificationGroup>();

  for (const spec of specRows) {
    const groupName = spec.groupName?.trim() || "Specifications";
    const group = groups.get(groupName) ?? { groupName, items: [] };
    group.items.push({
      label: spec.label,
      value: spec.value,
      isHighlight: spec.isHighlight,
    });
    groups.set(groupName, group);
  }

  const highlights = specRows
    .filter((spec) => spec.isHighlight)
    .slice(0, 4)
    .map((spec) => ({ label: spec.label, value: spec.value }));

  const category: PublicCategory = {
    id: row.categoryId,
    name: row.categoryName,
    slug: row.categorySlug,
    path: `/${row.categorySlug}`,
    description: row.categoryDescription,
    cover: toImage(
      categoryCover[0]
        ? {
            id: categoryCover[0].id,
            altText: categoryCover[0].altText,
            width: categoryCover[0].width,
            height: categoryCover[0].height,
          }
        : null,
      row.categoryName,
    ),
    hasProducts: true,
  };

  const product: PublicProduct = {
    id: row.id,
    name: row.name,
    slug: row.slug,
    path: `/${row.categorySlug}/${row.slug}`,
    shortDescription: row.shortDescription,
    description: row.description,
    image: images[0] ?? null,
    priceLabel: publicPriceLabel(row.price, row.showPrice),
    isFeatured: row.isFeatured,
    category,
    images,
    highlights,
    specificationGroups: Array.from(groups.values()),
    documents: documentRows.map((document) => ({
      id: document.id,
      title: document.title,
      url: `/media/${document.mediaId}`,
      fileName: document.fileName,
    })),
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
  };

  return { product, category };
}

export async function listRelatedProducts(
  categoryId: number,
  excludeProductId: number,
  limit = 3,
): Promise<PublicProductCard[]> {
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      shortDescription: products.shortDescription,
      price: products.price,
      showPrice: products.showPrice,
      isFeatured: products.isFeatured,
      categorySlug: categories.slug,
      mediaId: mediaAssets.id,
      mediaAlt: mediaAssets.altText,
      mediaWidth: mediaAssets.width,
      mediaHeight: mediaAssets.height,
    })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .leftJoin(productImages, primaryImageJoin())
    .leftJoin(mediaAssets, eq(mediaAssets.id, productImages.mediaId))
    .where(
      and(
        eq(products.categoryId, categoryId),
        eq(products.status, PUBLISHED),
        ne(products.id, excludeProductId),
      ),
    )
    .orderBy(asc(products.sortOrder), asc(products.name))
    .limit(limit);

  return rows.map(mapCard);
}

export async function listPublishedSellers(
  city?: string,
): Promise<PublicSeller[]> {
  const normalizedCity = city?.trim();

  const rows = await db
    .select({
      id: authorizedSellers.id,
      name: authorizedSellers.name,
      city: authorizedSellers.city,
      address: authorizedSellers.address,
      phone: authorizedSellers.phone,
      whatsapp: authorizedSellers.whatsapp,
      googleMapsUrl: authorizedSellers.googleMapsUrl,
    })
    .from(authorizedSellers)
    .where(
      normalizedCity
        ? and(
            eq(authorizedSellers.status, "active"),
            eq(authorizedSellers.city, normalizedCity),
          )
        : eq(authorizedSellers.status, "active"),
    )
    .orderBy(
      asc(authorizedSellers.sortOrder),
      asc(authorizedSellers.city),
      asc(authorizedSellers.name),
    );

  return rows;
}

export async function listSellerCities(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ city: authorizedSellers.city })
    .from(authorizedSellers)
    .where(eq(authorizedSellers.status, "active"))
    .orderBy(asc(authorizedSellers.city));

  return rows.map((row) => row.city).filter(Boolean);
}

export type BlogListResult = {
  items: PublicBlogCard[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

function mapBlogCard(row: {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  publishedAt: Date | null;
  mediaId: number | null;
  mediaAlt: string | null;
  mediaWidth: number | null;
  mediaHeight: number | null;
}): PublicBlogCard {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    path: `/blog/${row.slug}`,
    excerpt: row.excerpt,
    cover: toImage(
      row.mediaId
        ? {
            id: row.mediaId,
            altText: row.mediaAlt,
            width: row.mediaWidth,
            height: row.mediaHeight,
          }
        : null,
      row.title,
    ),
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : "",
    publishedLabel: formatPublishedDate(row.publishedAt),
  };
}

export async function listPublishedBlogPosts(options?: {
  page?: number;
  pageSize?: number;
}): Promise<BlogListResult> {
  const pageSize = options?.pageSize ?? 9;
  const requestedPage = options?.page ?? 1;

  const conditions = eq(blogPosts.status, PUBLISHED);

  const [countRow] = await db
    .select({ total: count() })
    .from(blogPosts)
    .where(conditions);

  const total = Number(countRow?.total ?? 0);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, requestedPage), pageCount);

  const rows = await db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      excerpt: blogPosts.excerpt,
      publishedAt: blogPosts.publishedAt,
      mediaId: mediaAssets.id,
      mediaAlt: mediaAssets.altText,
      mediaWidth: mediaAssets.width,
      mediaHeight: mediaAssets.height,
    })
    .from(blogPosts)
    .leftJoin(mediaAssets, eq(mediaAssets.id, blogPosts.coverMediaId))
    .where(conditions)
    .orderBy(desc(blogPosts.publishedAt), desc(blogPosts.id))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return {
    items: rows.map(mapBlogCard),
    total,
    page,
    pageSize,
    pageCount,
  };
}

/**
 * Every published post, newest first.
 *
 * The journal archive is a complete index, so this query deliberately has no
 * LIMIT and no OFFSET: a newly published article is visible on the next
 * request, and the archive grows with the database rather than with the code.
 */
export async function listAllPublishedBlogPosts(): Promise<PublicBlogCard[]> {
  const rows = await db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      excerpt: blogPosts.excerpt,
      publishedAt: blogPosts.publishedAt,
      mediaId: mediaAssets.id,
      mediaAlt: mediaAssets.altText,
      mediaWidth: mediaAssets.width,
      mediaHeight: mediaAssets.height,
    })
    .from(blogPosts)
    .leftJoin(mediaAssets, eq(mediaAssets.id, blogPosts.coverMediaId))
    .where(eq(blogPosts.status, PUBLISHED))
    .orderBy(desc(blogPosts.publishedAt), desc(blogPosts.id));

  return rows.map(mapBlogCard);
}

export async function listLatestBlogPosts(limit = 3): Promise<PublicBlogCard[]> {
  const result = await listPublishedBlogPosts({ page: 1, pageSize: limit });

  return result.items;
}

export async function getPublishedBlogPostBySlug(slug: string): Promise<
  | (PublicBlogPost & { contentJson: unknown })
  | null
> {
  const [row] = await db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      excerpt: blogPosts.excerpt,
      contentJson: blogPosts.contentJson,
      seoTitle: blogPosts.seoTitle,
      seoDescription: blogPosts.seoDescription,
      publishedAt: blogPosts.publishedAt,
      mediaId: mediaAssets.id,
      mediaAlt: mediaAssets.altText,
      mediaWidth: mediaAssets.width,
      mediaHeight: mediaAssets.height,
    })
    .from(blogPosts)
    .leftJoin(mediaAssets, eq(mediaAssets.id, blogPosts.coverMediaId))
    .where(and(eq(blogPosts.slug, slug), eq(blogPosts.status, PUBLISHED)))
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    ...mapBlogCard(row),
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    contentJson: row.contentJson,
  };
}

export async function listSitemapEntries(): Promise<PublicSitemapEntry[]> {
  const [categoryRows, productRows, postRows] = await Promise.all([
    db
      .select({ slug: categories.slug, updatedAt: categories.updatedAt })
      .from(categories)
      .where(eq(categories.status, PUBLISHED)),
    db
      .select({
        categorySlug: categories.slug,
        productSlug: products.slug,
        updatedAt: products.updatedAt,
      })
      .from(products)
      .innerJoin(categories, eq(categories.id, products.categoryId))
      .where(
        and(eq(products.status, PUBLISHED), eq(categories.status, PUBLISHED)),
      ),
    db
      .select({ slug: blogPosts.slug, updatedAt: blogPosts.updatedAt })
      .from(blogPosts)
      .where(eq(blogPosts.status, PUBLISHED)),
  ]);

  const entries: PublicSitemapEntry[] = [
    { path: "/" },
    { path: "/authorized-sellers" },
    { path: "/verify" },
    { path: "/blog" },
    { path: "/about" },
    { path: "/contact" },
  ];

  for (const category of categoryRows) {
    entries.push({
      path: `/${category.slug}`,
      lastModified: category.updatedAt,
    });
  }

  for (const product of productRows) {
    entries.push({
      path: `/${product.categorySlug}/${product.productSlug}`,
      lastModified: product.updatedAt,
    });
  }

  for (const post of postRows) {
    entries.push({
      path: `/blog/${post.slug}`,
      lastModified: post.updatedAt,
    });
  }

  return entries;
}

/** Published categories and recent posts for navigation and footer links. */
export async function getPublicNavigation(): Promise<{
  categories: PublicCategory[];
}> {
  return { categories: await listPublishedCategories() };
}

/** Search helper used by the unpublished-protection tests. */
export async function publishedPathExists(path: string): Promise<boolean> {
  if (path === "/") {
    return true;
  }

  const segments = path.split("/").filter(Boolean);

  if (segments.length === 1) {
    const [row] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(and(eq(categories.slug, segments[0]), eq(categories.status, PUBLISHED)))
      .limit(1);

    return Boolean(row);
  }

  if (segments.length === 2 && segments[0] === "blog") {
    const [row] = await db
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(
        and(eq(blogPosts.slug, segments[1]), eq(blogPosts.status, PUBLISHED)),
      )
      .limit(1);

    return Boolean(row);
  }

  if (segments.length === 2) {
    const [row] = await db
      .select({ id: products.id })
      .from(products)
      .innerJoin(categories, eq(categories.id, products.categoryId))
      .where(
        and(
          eq(categories.slug, segments[0]),
          eq(categories.status, PUBLISHED),
          eq(products.slug, segments[1]),
          eq(products.status, PUBLISHED),
        ),
      )
      .limit(1);

    return Boolean(row);
  }

  return false;
}

/** Used by the public 404 resolver to distinguish unknown vs draft routes. */
export async function findRedirectTarget(path: string): Promise<string | null> {
  const { resolveRedirect } = await import("@/lib/content/paths");
  return resolveRedirect(db, path);
}

export const publicQueryFilters = { or };

