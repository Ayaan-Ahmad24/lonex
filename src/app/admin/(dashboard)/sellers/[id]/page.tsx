import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminModule } from "@/admin/config/access";
import { PageHeader } from "@/admin/core/ui/page-header";
import { Card, CardBody, CardHeader } from "@/admin/core/ui/card";
import { SellerForm } from "@/admin/modules/sellers/seller-form";
import { DeleteForm } from "@/admin/modules/shared/delete-form";
import { deleteSellerAction } from "@/admin/modules/sellers/actions";
import { getSellerById } from "@/admin/modules/sellers/queries";

export default async function EditSellerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminModule("sellers");
  const { id } = await params;
  const sellerId = Number(id);

  if (!Number.isInteger(sellerId) || sellerId <= 0) {
    notFound();
  }

  const seller = await getSellerById(sellerId);

  if (!seller) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={seller.name}
        description={`${seller.city} · ${seller.status}`}
        actions={
          <Link
            href="/admin/sellers"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:underline"
          >
            Back to sellers
          </Link>
        }
      />

      <SellerForm
        seller={{
          id: seller.id,
          name: seller.name,
          city: seller.city,
          address: seller.address,
          phone: seller.phone,
          whatsapp: seller.whatsapp ?? "",
          googleMapsUrl: seller.googleMapsUrl ?? "",
          sortOrder: seller.sortOrder,
          status: seller.status,
        }}
      />

      <Card>
        <CardHeader
          title="Danger zone"
          description="Deleting a seller removes the listing from the public directory."
        />
        <CardBody>
          <DeleteForm
            action={deleteSellerAction}
            id={seller.id}
            label="Delete seller"
            confirmTitle="Delete this seller?"
            confirmMessage="The seller listing will be removed permanently."
          />
        </CardBody>
      </Card>
    </div>
  );
}
