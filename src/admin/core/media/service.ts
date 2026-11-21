import { and, count, desc, eq, like, or } from "drizzle-orm";
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
import { recordAudit } from "@/lib/audit";
import { getServerEnv } from "@/lib/env";
import type { ListParams, ListResult } from "../crud/types";
import { clampPage, pageCountFor } from "../crud/list-params";
import { newStorageKey, createLocalMediaStorage } from "./storage";
import { validateUpload } from "./validation";

export type MediaListRow = {
  id: number;
  originalName: string;
  mimeType: string;
  bytes: number;
  width: number | null;
  height: number | null;
  altText: string | null;
  createdAt: Date;
};

export type MediaResult =
  | { ok: true; id: number }
  | { ok: false; message: string };

export async function listMedia(
  params: ListParams,
): Promise<ListResult<MediaListRow>> {
  const conditions = [];

  if (params.q) {
    conditions.push(
      or(
        like(mediaAssets.originalName, `%${params.q}%`),
        like(mediaAssets.altText, `%${params.q}%`),
      ),
    );
  }

  const kind = params.filters.kind;

  if (kind === "image") {
    conditions.push(like(mediaAssets.mimeType, "image/%"));
  } else if (kind === "pdf") {
    conditions.push(eq(mediaAssets.mimeType, "application/pdf"));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [countRow] = await db
    .select({ total: count() })
    .from(mediaAssets)
    .where(where);
  const total = Number(countRow?.total ?? 0);
  const page = clampPage(params.page, total, params.pageSize);

  const rows = await db
    .select({
      id: mediaAssets.id,
      originalName: mediaAssets.originalName,
      mimeType: mediaAssets.mimeType,
      bytes: mediaAssets.bytes,
      width: mediaAssets.width,
      height: mediaAssets.height,
      altText: mediaAssets.altText,
      createdAt: mediaAssets.createdAt,
    })
    .from(mediaAssets)
    .where(where)
    .orderBy(desc(mediaAssets.createdAt), desc(mediaAssets.id))
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

export async function listMediaForSelect(): Promise<
  { id: number; label: string; mimeType: string }[]
> {
  const rows = await db
    .select({
      id: mediaAssets.id,
      originalName: mediaAssets.originalName,
      altText: mediaAssets.altText,
      mimeType: mediaAssets.mimeType,
    })
    .from(mediaAssets)
    .orderBy(desc(mediaAssets.createdAt))
    .limit(200);

  return rows
    .filter((row) => row.mimeType.startsWith("image/"))
    .map((row) => ({
      id: row.id,
      label: row.altText || row.originalName,
      mimeType: row.mimeType,
    }));
}

/** PDF-only options for product datasheets. */
export async function listPdfForSelect(): Promise<
  { id: number; label: string }[]
> {
  const rows = await db
    .select({
      id: mediaAssets.id,
      originalName: mediaAssets.originalName,
      altText: mediaAssets.altText,
    })
    .from(mediaAssets)
    .where(eq(mediaAssets.mimeType, "application/pdf"))
    .orderBy(desc(mediaAssets.createdAt))
    .limit(200);

  return rows.map((row) => ({
    id: row.id,
    label: row.altText || row.originalName,
  }));
}

export async function getMediaAsset(id: number) {
  const [row] = await db
    .select()
    .from(mediaAssets)
    .where(eq(mediaAssets.id, id))
    .limit(1);

  return row ?? null;
}

function collectMediaReferences(
  value: unknown,
  mediaId: number,
  path: string,
  found: string[],
): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      collectMediaReferences(item, mediaId, `${path}[${index}]`, found),
    );
    return;
  }

  if (!value || typeof value !== "object") {
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    const childPath = path ? `${path}.${key}` : key;

    if (
      (key === "mediaId" || key === "ogMediaId" || key === "logoMediaId") &&
      Number(child) === mediaId
    ) {
      found.push(childPath);
      continue;
    }

    collectMediaReferences(child, mediaId, childPath, found);
  }
}

/** Referential integrity for media deletion. */
export async function findMediaReferences(mediaId: number): Promise<string[]> {
  const references: string[] = [];

  const categoryRows = await db
    .select({ name: categories.name })
    .from(categories)
    .where(eq(categories.coverMediaId, mediaId));

  for (const category of categoryRows) {
    references.push(`Category "${category.name}" cover image`);
  }

  const blogRows = await db
    .select({ title: blogPosts.title })
    .from(blogPosts)
    .where(eq(blogPosts.coverMediaId, mediaId));

  for (const post of blogRows) {
    references.push(`Blog post "${post.title}" cover image`);
  }

  const sellerRows = await db
    .select({ name: authorizedSellers.name })
    .from(authorizedSellers)
    .where(eq(authorizedSellers.imageMediaId, mediaId));

  for (const seller of sellerRows) {
    references.push(`Authorized seller "${seller.name}" image`);
  }

  const imageRows = await db
    .select({ productName: products.name })
    .from(productImages)
    .innerJoin(products, eq(products.id, productImages.productId))
    .where(eq(productImages.mediaId, mediaId));

  for (const image of imageRows) {
    references.push(`Product "${image.productName}" image`);
  }

  const documentRows = await db
    .select({ productName: products.name, title: productDocuments.title })
    .from(productDocuments)
    .innerJoin(products, eq(products.id, productDocuments.productId))
    .where(eq(productDocuments.mediaId, mediaId));

  for (const document of documentRows) {
    references.push(
      `Product "${document.productName}" document "${document.title}"`,
    );
  }

  const settingsRows = await db
    .select({ key: siteSettings.key, valueJson: siteSettings.valueJson })
    .from(siteSettings);

  for (const row of settingsRows) {
    const found: string[] = [];
    collectMediaReferences(row.valueJson, mediaId, "", found);

    for (const path of found) {
      references.push(`Website settings (${row.key}) field ${path}`);
    }
  }

  return references;
}

export async function uploadMedia(
  actorUserId: string,
  file: File,
  altTextInput: string,
): Promise<MediaResult> {
  const env = getServerEnv();
  const maxBytes = env.MEDIA_MAX_UPLOAD_BYTES;

  if (file.size > maxBytes) {
    return {
      ok: false,
      message: `File is larger than ${Math.round(maxBytes / 1024 / 1024)} MB.`,
    };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const validation = validateUpload({
    buffer,
    originalName: file.name,
    declaredMimeType: file.type,
    maxBytes,
  });

  if (!validation.ok) {
    return { ok: false, message: validation.reason };
  }

  const altText = altTextInput.trim().slice(0, 500);
  const storageKey = newStorageKey(validation.detected.extension);
  const storage = createLocalMediaStorage();

  try {
    await storage.save(storageKey, buffer);
  } catch {
    return {
      ok: false,
      message: "The file could not be stored. Check the media directory.",
    };
  }

  try {
    return await db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(mediaAssets)
        .values({
          storageKey,
          originalName: validation.safeOriginalName,
          mimeType: validation.detected.mimeType,
          bytes: buffer.length,
          width: validation.detected.width,
          height: validation.detected.height,
          altText: altText || null,
          uploadedBy: actorUserId,
        })
        .$returningId();

      await recordAudit(tx, {
        actorUserId,
        action: "media.upload",
        targetType: "media",
        targetId: String(inserted.id),
        metadata: {
          mimeType: validation.detected.mimeType,
          bytes: buffer.length,
        },
      });

      return { ok: true as const, id: inserted.id };
    });
  } catch (error) {
    // Do not leave an unreferenced file behind if metadata could not commit.
    await storage.remove(storageKey).catch(() => undefined);
    throw error;
  }
}

export async function updateMediaAlt(
  actorUserId: string,
  id: number,
  altTextInput: string,
): Promise<MediaResult> {
  const altText = altTextInput.trim().slice(0, 500);

  return db.transaction(async (tx) => {
    const [row] = await tx
      .select({ id: mediaAssets.id })
      .from(mediaAssets)
      .where(eq(mediaAssets.id, id))
      .limit(1);

    if (!row) {
      return { ok: false, message: "Media asset not found." };
    }

    await tx
      .update(mediaAssets)
      .set({ altText: altText || null })
      .where(eq(mediaAssets.id, id));

    await recordAudit(tx, {
      actorUserId,
      action: "media.alt.update",
      targetType: "media",
      targetId: String(id),
    });

    return { ok: true, id };
  });
}

export async function deleteMedia(
  actorUserId: string,
  id: number,
): Promise<MediaResult> {
  const references = await findMediaReferences(id);

  if (references.length > 0) {
    return {
      ok: false,
      message: `This asset is still used by: ${references.slice(0, 3).join("; ")}.`,
    };
  }

  const [asset] = await db
    .select({ id: mediaAssets.id, storageKey: mediaAssets.storageKey })
    .from(mediaAssets)
    .where(eq(mediaAssets.id, id))
    .limit(1);

  if (!asset) {
    return { ok: false, message: "Media asset not found." };
  }

  await db.transaction(async (tx) => {
    await tx.delete(mediaAssets).where(eq(mediaAssets.id, id));
    await recordAudit(tx, {
      actorUserId,
      action: "media.delete",
      targetType: "media",
      targetId: String(id),
    });
  });

  const storage = createLocalMediaStorage();
  await storage.remove(asset.storageKey).catch(() => undefined);

  return { ok: true, id };
}

export async function readMediaFile(
  id: number,
): Promise<{ data: Buffer; mimeType: string; originalName: string } | null> {
  const asset = await getMediaAsset(id);

  if (!asset) {
    return null;
  }

  const storage = createLocalMediaStorage();

  try {
    const data = await storage.read(asset.storageKey);
    return {
      data,
      mimeType: asset.mimeType,
      originalName: asset.originalName,
    };
  } catch {
    return null;
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
