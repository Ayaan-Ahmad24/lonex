import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminModule } from "@/admin/config/access";
import { PageHeader } from "@/admin/core/ui/page-header";
import { Card, CardBody, CardHeader } from "@/admin/core/ui/card";
import { Badge } from "@/admin/core/ui/badge";
import { buttonClassName } from "@/admin/core/ui/button";
import {
  listMediaForSelect,
  listPdfForSelect,
} from "@/admin/core/media/service";
import { listCategoryOptions } from "@/admin/modules/categories/queries";
import { ProductForm } from "@/admin/modules/products/product-form";
import { DeleteForm } from "@/admin/modules/shared/delete-form";
import { deleteProductAction } from "@/admin/modules/products/actions";
import { getProductDetail } from "@/admin/modules/products/queries";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { permissions } = await requireAdminModule("products");
  const { id } = await params;
  const productId = Number(id);

  if (!Number.isInteger(productId) || productId <= 0) {
    notFound();
  }

  const [product, categoryOptions, imageOptions, pdfOptions] =
    await Promise.all([
      getProductDetail(productId),
      listCategoryOptions(),
      listMediaForSelect(),
      listPdfForSelect(),
    ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={product.name}
        description={`/${product.categorySlug}/${product.slug} · ${product.categoryName}`}
        actions={
          <>
            {product.status === "published" ? (
              <Link
                href={`/${product.categorySlug}/${product.slug}`}
                className={buttonClassName("secondary", "sm")}
                target="_blank"
                rel="noreferrer"
              >
                View public page
              </Link>
            ) : null}
            <Link
              href="/admin/products"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:underline"
            >
              Back to products
            </Link>
          </>
        }
      />

      <Card>
        <CardHeader
          title="Model verification"
          description="One active code can be registered for this product model. Codes prove model registration, not the authenticity of a physical unit."
          action={
            <Link
              href={`/admin/verification?product=${product.id}`}
              className={buttonClassName("secondary", "sm")}
            >
              Manage code
            </Link>
          }
        />
        <CardBody className="flex flex-wrap items-center gap-3 text-sm">
          {product.verification ? (
            <>
              <Badge tone={product.verification.active ? "success" : "danger"}>
                {product.verification.active ? "Registered" : "Inactive"}
              </Badge>
              <span className="text-slate-600">
                Registered{" "}
                {product.verification.registeredAt.toLocaleDateString("en-GB")}
              </span>
            </>
          ) : (
            <span className="text-slate-500">
              No verification code has been generated for this product model.
            </span>
          )}
        </CardBody>
      </Card>

      <ProductForm
        product={product}
        categoryOptions={categoryOptions}
        imageOptions={imageOptions}
        pdfOptions={pdfOptions}
        canPublish={permissions.has("content.publish")}
      />

      <Card>
        <CardHeader
          title="Danger zone"
          description="Deleting a product also removes its gallery, specifications, documents and verification code."
        />
        <CardBody>
          <DeleteForm
            action={deleteProductAction}
            id={product.id}
            label="Delete product"
            confirmTitle="Delete this product?"
            confirmMessage="The product and its public URL will be removed permanently."
          />
        </CardBody>
      </Card>
    </div>
  );
}
