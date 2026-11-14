export const instant = false;

import Link from "next/link";
import { requireAdminModule } from "@/admin/config/access";
import { PageHeader } from "@/admin/core/ui/page-header";
import {
  listMediaForSelect,
  listPdfForSelect,
} from "@/admin/core/media/service";
import { listCategoryOptions } from "@/admin/modules/categories/queries";
import { ProductForm } from "@/admin/modules/products/product-form";

export default async function NewProductPage() {
  const { permissions } = await requireAdminModule("products");
  const [categoryOptions, imageOptions, pdfOptions] = await Promise.all([
    listCategoryOptions(),
    listMediaForSelect(),
    listPdfForSelect(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="New product"
        description="Draft products are never visible on the public website. Prices stay hidden unless explicitly enabled."
        actions={
          <Link
            href="/admin/products"
            className="text-sm font-medium text-lonex-ink-soft hover:text-lonex-ink hover:underline"
          >
            Back to products
          </Link>
        }
      />

      <ProductForm
        categoryOptions={categoryOptions}
        imageOptions={imageOptions}
        pdfOptions={pdfOptions}
        canPublish={permissions.has("content.publish")}
      />
    </div>
  );
}
