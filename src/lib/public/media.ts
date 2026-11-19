import "server-only";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  authorizedSellers,
  blogPosts,
  categories,
  mediaAssets,
  productDocuments,
  productImages,
  products,
  siteSettings,
} from "@/db/schema";
import { readMediaFile } from "@/admin/core/media/service";
import { SETTINGS_KEY } from "@/admin/core/settings/schema";

/**
 * Public media delivery.
 *
 * The media library is private. An asset becomes publicly reachable only while
 * it is referenced by published content (or is the configured public logo).
 * PDFs are always served as attachments.
 */

export type DeliverableMedia = {
  data: Buffer;
  mimeType: string;
  fileName: string;
  disposition: "inline" | "attachment";
};

async function isReferencedByPublishedContent(mediaId: number): Promise<boolean> {
  const categoryCover = await db
    .select({ id: categories.id })
    .from(categories)
    .where(
      and(
        eq(categories.coverMediaId, mediaId),
        eq(categories.status, "published"),
      ),
    )
    .limit(1);

  if (categoryCover.length > 0) {
    return true;
  }

  const productImage = await db
    .select({ id: productImages.id })
    .from(productImages)
    .innerJoin(products, eq(products.id, productImages.productId))
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .where(
      and(
        eq(productImages.mediaId, mediaId),
        eq(products.status, "published"),
        eq(categories.status, "published"),
      ),
    )
    .limit(1);

  if (productImage.length > 0) {
    return true;
  }

  const productDocument = await db
    .select({ id: productDocuments.id })
    .from(productDocuments)
    .innerJoin(products, eq(products.id, productDocuments.productId))
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .where(
      and(
        eq(productDocuments.mediaId, mediaId),
        eq(products.status, "published"),
        eq(categories.status, "published"),
      ),
    )
    .limit(1);

  if (productDocument.length > 0) {
    return true;
  }

  const blogCover = await db
    .select({ id: blogPosts.id })
    .from(blogPosts)
    .where(
      and(eq(blogPosts.coverMediaId, mediaId), eq(blogPosts.status, "published")),
    )
    .limit(1);

  if (blogCover.length > 0) {
    return true;
  }

  // An active seller's published image is public directory content.
  const sellerImage = await db
    .select({ id: authorizedSellers.id })
    .from(authorizedSellers)
    .where(
      and(
        eq(authorizedSellers.imageMediaId, mediaId),
        eq(authorizedSellers.status, "active"),
      ),
    )
    .limit(1);

  if (sellerImage.length > 0) {
    return true;
  }

  // The configured logo is an intentional public brand asset.
  const [settingsRow] = await db
    .select({ valueJson: siteSettings.valueJson })
    .from(siteSettings)
    .where(eq(siteSettings.key, SETTINGS_KEY))
    .limit(1);

  const logoMediaId =
    settingsRow && typeof settingsRow.valueJson === "object"
      ? (settingsRow.valueJson as Record<string, unknown>).logoMediaId
      : null;

  return Number(logoMediaId) === mediaId;
}

export async function getDeliverableMedia(
  id: number,
): Promise<DeliverableMedia | null> {
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  const [asset] = await db
    .select({ mimeType: mediaAssets.mimeType })
    .from(mediaAssets)
    .where(eq(mediaAssets.id, id))
    .limit(1);

  if (!asset) {
    return null;
  }

  const isImage = asset.mimeType.startsWith("image/");
  const isPdf = asset.mimeType === "application/pdf";

  if (!isImage && !isPdf) {
    return null;
  }

  if (!(await isReferencedByPublishedContent(id))) {
    return null;
  }

  const file = await readMediaFile(id);

  if (!file) {
    return null;
  }

  return {
    data: file.data,
    mimeType: file.mimeType,
    fileName: file.originalName,
    disposition: isPdf ? "attachment" : "inline",
  };
}
