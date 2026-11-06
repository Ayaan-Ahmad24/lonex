import { eq } from "drizzle-orm";
import { db } from "@/db";
import { blogPosts, mediaAssets } from "@/db/schema";
import { recordAudit } from "@/lib/audit";
import {
  claimPublicPath,
  releasePublicPath,
  renamePublicPath,
} from "@/lib/content/paths";
import type { BlogInput } from "./schema";

export type BlogMutation =
  | { ok: true; id: number }
  | { ok: false; message: string };

class MutationError extends Error {}

function isDuplicateKey(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "ER_DUP_ENTRY"
  );
}

async function validateCover(
  executor: Pick<typeof db, "select">,
  mediaId: number | null,
): Promise<void> {
  if (!mediaId) {
    return;
  }

  const [row] = await executor
    .select({ mimeType: mediaAssets.mimeType })
    .from(mediaAssets)
    .where(eq(mediaAssets.id, mediaId))
    .limit(1);

  if (!row?.mimeType.startsWith("image/")) {
    throw new MutationError("The cover must be an image from the media library.");
  }
}

export async function createBlogPost(
  actorUserId: string,
  input: BlogInput,
): Promise<BlogMutation> {
  try {
    return await db.transaction(async (tx) => {
      await validateCover(tx, input.coverMediaId);

      const [inserted] = await tx
        .insert(blogPosts)
        .values({
          title: input.title,
          slug: input.slug,
          excerpt: input.excerpt || null,
          contentJson: input.document,
          coverMediaId: input.coverMediaId,
          seoTitle: input.seoTitle || null,
          seoDescription: input.seoDescription || null,
          status: input.status,
          publishedAt: input.status === "published" ? new Date() : null,
          createdBy: actorUserId,
          updatedBy: actorUserId,
        })
        .$returningId();

      const claimed = await claimPublicPath(
        tx,
        { ownerType: "blog", ownerId: String(inserted.id) },
        {
          path: `/blog/${input.slug}`,
          status: input.status,
          allowBlog: true,
        },
      );

      if (!claimed.ok) {
        throw new MutationError(claimed.reason);
      }

      await recordAudit(tx, {
        actorUserId,
        action: "blog.create",
        targetType: "blog",
        targetId: String(inserted.id),
        metadata: { status: input.status },
      });

      return { ok: true as const, id: inserted.id };
    });
  } catch (error) {
    if (error instanceof MutationError) {
      return { ok: false, message: error.message };
    }

    if (isDuplicateKey(error)) {
      return { ok: false, message: "That article slug is already in use." };
    }

    throw error;
  }
}

export async function updateBlogPost(
  actorUserId: string,
  id: number,
  input: BlogInput,
): Promise<BlogMutation> {
  try {
    return await db.transaction(async (tx) => {
      const [existing] = await tx
        .select({
          slug: blogPosts.slug,
          status: blogPosts.status,
          publishedAt: blogPosts.publishedAt,
        })
        .from(blogPosts)
        .where(eq(blogPosts.id, id))
        .limit(1);

      if (!existing) {
        throw new MutationError("Article not found.");
      }

      await validateCover(tx, input.coverMediaId);

      const publishing = input.status === "published";
      const publishedAt = publishing
        ? existing.publishedAt ?? new Date()
        : existing.publishedAt;

      await tx
        .update(blogPosts)
        .set({
          title: input.title,
          slug: input.slug,
          excerpt: input.excerpt || null,
          contentJson: input.document,
          coverMediaId: input.coverMediaId,
          seoTitle: input.seoTitle || null,
          seoDescription: input.seoDescription || null,
          status: input.status,
          publishedAt,
          updatedBy: actorUserId,
        })
        .where(eq(blogPosts.id, id));

      const owner = { ownerType: "blog", ownerId: String(id) };
      const pathResult =
        existing.slug === input.slug
          ? await claimPublicPath(tx, owner, {
              path: `/blog/${input.slug}`,
              status: input.status,
              allowBlog: true,
            })
          : await renamePublicPath(tx, owner, {
              from: `/blog/${existing.slug}`,
              to: `/blog/${input.slug}`,
              status: input.status,
              allowBlog: true,
            });

      if (!pathResult.ok) {
        throw new MutationError(pathResult.reason);
      }

      await recordAudit(tx, {
        actorUserId,
        action:
          publishing && existing.status !== "published"
            ? "blog.publish"
            : existing.status === "published" && !publishing
              ? "blog.unpublish"
              : "blog.update",
        targetType: "blog",
        targetId: String(id),
        metadata: { status: input.status, redirectCreated: pathResult.redirectCreated },
      });

      return { ok: true as const, id };
    });
  } catch (error) {
    if (error instanceof MutationError) {
      return { ok: false, message: error.message };
    }

    if (isDuplicateKey(error)) {
      return { ok: false, message: "That article slug is already in use." };
    }

    throw error;
  }
}

export async function deleteBlogPost(
  actorUserId: string,
  id: number,
): Promise<BlogMutation> {
  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ slug: blogPosts.slug })
      .from(blogPosts)
      .where(eq(blogPosts.id, id))
      .limit(1);

    if (!existing) {
      return { ok: false as const, message: "Article not found." };
    }

    await releasePublicPath(tx, { ownerType: "blog", ownerId: String(id) });
    await tx.delete(blogPosts).where(eq(blogPosts.id, id));

    await recordAudit(tx, {
      actorUserId,
      action: "blog.delete",
      targetType: "blog",
      targetId: String(id),
      metadata: { slug: existing.slug },
    });

    return { ok: true as const, id };
  });
}
