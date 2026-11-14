export const instant = false;

import Link from "next/link";
import { requireAdminModule } from "@/admin/config/access";
import { PageHeader } from "@/admin/core/ui/page-header";
import { listMediaForSelect } from "@/admin/core/media/service";
import { BlogForm } from "@/admin/modules/blog/blog-form";

export default async function NewBlogPostPage() {
  const { permissions } = await requireAdminModule("blog");
  const mediaOptions = await listMediaForSelect();

  return (
    <div className="space-y-6">
      <PageHeader
        title="New article"
        description="Articles use a safe structured text format. Drafts never reach the public site, metadata or sitemap."
        actions={
          <Link
            href="/admin/blog"
            className="text-sm font-medium text-lonex-ink-soft hover:text-lonex-ink hover:underline"
          >
            Back to blog
          </Link>
        }
      />

      <BlogForm
        mediaOptions={mediaOptions}
        canPublish={permissions.has("content.publish")}
      />
    </div>
  );
}
