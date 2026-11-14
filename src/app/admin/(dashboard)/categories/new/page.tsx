export const instant = false;

import Link from "next/link";
import { requireAdminModule } from "@/admin/config/access";
import { PageHeader } from "@/admin/core/ui/page-header";
import { listMediaForSelect } from "@/admin/core/media/service";
import { CategoryForm } from "@/admin/modules/categories/category-form";

export default async function NewCategoryPage() {
  const { permissions } = await requireAdminModule("categories");
  const mediaOptions = await listMediaForSelect();

  return (
    <div className="space-y-6">
      <PageHeader
        title="New category"
        description="Create a category, then add products to it. Drafts never appear on the public site."
        actions={
          <Link
            href="/admin/categories"
            className="text-sm font-medium text-lonex-ink-soft hover:text-lonex-ink hover:underline"
          >
            Back to categories
          </Link>
        }
      />

      <CategoryForm
        mediaOptions={mediaOptions}
        canPublish={permissions.has("content.publish")}
      />
    </div>
  );
}
