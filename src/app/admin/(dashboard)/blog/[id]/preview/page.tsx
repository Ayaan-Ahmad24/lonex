import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminModule } from "@/admin/config/access";
import { PageHeader } from "@/admin/core/ui/page-header";
import { Card, CardBody } from "@/admin/core/ui/card";
import { Badge } from "@/admin/core/ui/badge";
import { buttonClassName } from "@/admin/core/ui/button";
import { parseStoredRichText } from "@/lib/content/rich-text";
import { RichTextRenderer } from "@/components/public/rich-text";
import { getBlogPostContent } from "@/admin/modules/blog/queries";

export default async function BlogPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminModule("blog");
  const { id } = await params;
  const postId = Number(id);

  if (!Number.isInteger(postId) || postId <= 0) {
    notFound();
  }

  const post = await getBlogPostContent(postId);

  if (!post) {
    notFound();
  }

  const document = parseStoredRichText(post.document);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Preview"
        description="Admin-only preview. Draft content is never served on the public site."
        actions={
          <>
            <Badge tone={post.status === "published" ? "success" : "warning"}>
              {post.status === "published" ? "Published" : "Draft preview"}
            </Badge>
            <Link
              href={`/admin/blog/${postId}`}
              className={buttonClassName("secondary", "sm")}
            >
              Back to editor
            </Link>
          </>
        }
      />

      <Card>
        <CardBody className="mx-auto max-w-3xl space-y-6 px-6 py-8">
          <header className="space-y-2 border-b border-slate-200 pb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#CF0A0A]">
              LONEX Journal
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-black">
              {post.title}
            </h1>
          </header>
          {document ? (
            <RichTextRenderer document={document} />
          ) : (
            <p className="text-sm text-red-600">
              Stored content is invalid and would not render publicly. Re-save the
              article to repair it.
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
