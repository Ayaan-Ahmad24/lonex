export const instant = false;

import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminModule } from "@/admin/config/access";
import { PageHeader } from "@/admin/core/ui/page-header";
import { Card, CardBody, CardHeader } from "@/admin/core/ui/card";
import { buttonClassName } from "@/admin/core/ui/button";
import { listMediaForSelect } from "@/admin/core/media/service";
import { CategoryForm } from "@/admin/modules/categories/category-form";
import { DeleteForm } from "@/admin/modules/shared/delete-form";
import { deleteCategoryAction } from "@/admin/modules/categories/actions";
import { getCategoryById } from "@/admin/modules/categories/queries";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { permissions } = await requireAdminModule("categories");
  const { id } = await params;
  const categoryId = Number(id);

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    notFound();
  }

  const [category, mediaOptions] = await Promise.all([
    getCategoryById(categoryId),
    listMediaForSelect(),
  ]);

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={category.name}
        description={`Public URL /${category.slug}. The category can be deleted only when no products reference it.`}
        actions={
          <>
            {category.status === "published" ? (
              <Link
                href={`/${category.slug}`}
                className={buttonClassName("secondary", "sm")}
                target="_blank"
                rel="noreferrer"
              >
                View public page
              </Link>
            ) : null}
            <Link
              href="/admin/categories"
              className="text-sm font-medium text-lonex-ink-soft hover:text-lonex-ink hover:underline"
            >
              Back to categories
            </Link>
          </>
        }
      />

      <CategoryForm
        category={{
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description ?? "",
          coverMediaId: category.coverMediaId,
          status: category.status,
          sortOrder: category.sortOrder,
        }}
        mediaOptions={mediaOptions}
        canPublish={permissions.has("content.publish")}
      />

      <Card>
        <CardHeader
          title="Danger zone"
          description="Deleting a category is permanent and is blocked while products still reference it."
        />
        <CardBody>
          <DeleteForm
            action={deleteCategoryAction}
            id={category.id}
            label="Delete category"
            confirmTitle="Delete this category?"
            confirmMessage="The category and its public URL will be removed. This cannot be undone."
          />
        </CardBody>
      </Card>
    </div>
  );
}
