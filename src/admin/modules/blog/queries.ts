import { and, asc, count, desc, eq, like } from "drizzle-orm";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { clampPage, pageCountFor } from "@/admin/core/crud/list-params";
import type { ListParams, ListResult } from "@/admin/core/crud/types";
import {
  parseStoredRichText,
  richTextDocumentToHtml,
} from "@/lib/content/rich-text";

export type BlogListRow = {
  id: number;
  title: string;
  slug: string;
  status: string;
  publishedAt: Date | null;
  updatedAt: Date;
};

export async function listBlogPosts(
  params: ListParams,
): Promise<ListResult<BlogListRow>> {
  const conditions = [];

  if (params.q) {
    conditions.push(like(blogPosts.title, `%${params.q}%`));
  }

  if (params.filters.status === "draft" || params.filters.status === "published") {
    conditions.push(eq(blogPosts.status, params.filters.status));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [countRow] = await db
    .select({ total: count() })
    .from(blogPosts)
    .where(where);
  const total = Number(countRow?.total ?? 0);
  const page = clampPage(params.page, total, params.pageSize);

  const direction = params.direction === "asc" ? asc : desc;
  const sortColumn =
    params.sort === "title"
      ? blogPosts.title
      : params.sort === "status"
        ? blogPosts.status
        : params.sort === "publishedAt"
          ? blogPosts.publishedAt
          : blogPosts.updatedAt;

  const rows = await db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      status: blogPosts.status,
      publishedAt: blogPosts.publishedAt,
      updatedAt: blogPosts.updatedAt,
    })
    .from(blogPosts)
    .where(where)
    .orderBy(direction(sortColumn), asc(blogPosts.id))
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

export type BlogPostDetail = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  contentHtml: string;
  coverMediaId: number | null;
  seoTitle: string;
  seoDescription: string;
  status: string;
  publishedAt: Date | null;
};

export async function getBlogPostById(
  id: number,
): Promise<BlogPostDetail | null> {
  const [row] = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.id, id))
    .limit(1);

  if (!row) {
    return null;
  }

  const document = parseStoredRichText(row.contentJson);

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt ?? "",
    contentHtml: document ? richTextDocumentToHtml(document) : "",
    coverMediaId: row.coverMediaId,
    seoTitle: row.seoTitle ?? "",
    seoDescription: row.seoDescription ?? "",
    status: row.status,
    publishedAt: row.publishedAt,
  };
}

export async function getBlogPostContent(
  id: number,
): Promise<{ title: string; document: unknown; status: string } | null> {
  const [row] = await db
    .select({
      title: blogPosts.title,
      contentJson: blogPosts.contentJson,
      status: blogPosts.status,
    })
    .from(blogPosts)
    .where(eq(blogPosts.id, id))
    .limit(1);

  return row
    ? { title: row.title, document: row.contentJson, status: row.status }
    : null;
}
