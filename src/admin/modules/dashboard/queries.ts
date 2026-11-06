import { count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  auditLog,
  authorizedSellers,
  blogPosts,
  categories,
  mediaAssets,
  productVerificationCodes,
  products,
  user,
} from "@/db/schema";

export async function getDashboardCounts() {
  const [
    [userRow],
    [categoryRow],
    [publishedCategoryRow],
    [productRow],
    [publishedProductRow],
    [sellerRow],
    [postRow],
    [publishedPostRow],
    [codeRow],
    [mediaRow],
    [auditRow],
  ] = await Promise.all([
    db.select({ total: count() }).from(user),
    db.select({ total: count() }).from(categories),
    db
      .select({ total: count() })
      .from(categories)
      .where(eq(categories.status, "published")),
    db.select({ total: count() }).from(products),
    db
      .select({ total: count() })
      .from(products)
      .where(eq(products.status, "published")),
    db
      .select({ total: count() })
      .from(authorizedSellers)
      .where(eq(authorizedSellers.status, "active")),
    db.select({ total: count() }).from(blogPosts),
    db
      .select({ total: count() })
      .from(blogPosts)
      .where(eq(blogPosts.status, "published")),
    db
      .select({ total: count() })
      .from(productVerificationCodes)
      .where(eq(productVerificationCodes.active, true)),
    db.select({ total: count() }).from(mediaAssets),
    db.select({ total: count() }).from(auditLog),
  ]);

  return {
    users: Number(userRow?.total ?? 0),
    categories: Number(categoryRow?.total ?? 0),
    publishedCategories: Number(publishedCategoryRow?.total ?? 0),
    products: Number(productRow?.total ?? 0),
    publishedProducts: Number(publishedProductRow?.total ?? 0),
    activeSellers: Number(sellerRow?.total ?? 0),
    posts: Number(postRow?.total ?? 0),
    publishedPosts: Number(publishedPostRow?.total ?? 0),
    activeCodes: Number(codeRow?.total ?? 0),
    media: Number(mediaRow?.total ?? 0),
    auditEvents: Number(auditRow?.total ?? 0),
  };
}

export async function getRecentProducts() {
  return db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      status: products.status,
      updatedAt: products.updatedAt,
      categorySlug: categories.slug,
    })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .orderBy(desc(products.updatedAt))
    .limit(5);
}

export async function getRecentAudit() {
  return db
    .select({
      id: auditLog.id,
      action: auditLog.action,
      targetType: auditLog.targetType,
      targetId: auditLog.targetId,
      createdAt: auditLog.createdAt,
    })
    .from(auditLog)
    .orderBy(desc(auditLog.createdAt))
    .limit(5);
}
