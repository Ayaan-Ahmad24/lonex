import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminModule } from "@/admin/config/access";
import { PageHeader } from "@/admin/core/ui/page-header";
import { Card, CardBody, CardHeader } from "@/admin/core/ui/card";
import { Badge } from "@/admin/core/ui/badge";
import { buttonClassName } from "@/admin/core/ui/button";
import { formatDateTime } from "@/admin/core/ui/format";
import { listMediaForSelect } from "@/admin/core/media/service";
import { BlogForm } from "@/admin/modules/blog/blog-form";
import { DeleteForm } from "@/admin/modules/shared/delete-form";
import { deleteBlogPostAction } from "@/admin/modules/blog/actions";
import { getBlogPostById } from "@/admin/modules/blog/queries";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { permissions } = await requireAdminModule("blog");
  const { id } = await params;
  const postId = Number(id);

  if (!Number.isInteger(postId) || postId <= 0) {
    notFound();
  }

  const [post, mediaOptions] = await Promise.all([
    getBlogPostById(postId),
    listMediaForSelect(),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={post.title}
        description={`Public URL /blog/${post.slug}`}
        actions={
          <>
            <Link
              href={`/admin/blog/${post.id}/preview`}
              className={buttonClassName("secondary", "sm")}
            >
              Preview
            </Link>
            {post.status === "published" ? (
              <Link
                href={`/blog/${post.slug}`}
                className={buttonClassName("secondary", "sm")}
                target="_blank"
                rel="noreferrer"
              >
                View public page
              </Link>
            ) : null}
            <Link
              href="/admin/blog"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:underline"
            >
              Back to blog
            </Link>
          </>
        }
      />

      <Card>
        <CardBody className="flex flex-wrap items-center gap-3 text-sm">
          <Badge tone={post.status === "published" ? "success" : "warning"}>
            {post.status === "published" ? "Published" : "Draft"}
          </Badge>
          {post.publishedAt ? (
            <span className="text-slate-600">
              Published {formatDateTime(post.publishedAt)}
            </span>
          ) : (
            <span className="text-slate-500">
              This article has never been published.
            </span>
          )}
        </CardBody>
      </Card>

      <BlogForm
        post={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          contentHtml: post.contentHtml,
          coverMediaId: post.coverMediaId,
          seoTitle: post.seoTitle,
          seoDescription: post.seoDescription,
          status: post.status,
        }}
        mediaOptions={mediaOptions}
        canPublish={permissions.has("content.publish")}
      />

      <Card>
        <CardHeader
          title="Danger zone"
          description="Deleting an article removes it and its public URL permanently."
        />
        <CardBody>
          <DeleteForm
            action={deleteBlogPostAction}
            id={post.id}
            label="Delete article"
            confirmTitle="Delete this article?"
            confirmMessage="The article and its public URL will be removed permanently. This cannot be undone."
          />
        </CardBody>
      </Card>
    </div>
  );
}
