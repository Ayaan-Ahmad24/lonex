export const instant = false;

import Link from "next/link";
import { requireAdminModule } from "@/admin/config/access";
import { PageHeader } from "@/admin/core/ui/page-header";
import { SellerForm } from "@/admin/modules/sellers/seller-form";

export default async function NewSellerPage() {
  await requireAdminModule("sellers");

  return (
    <div className="space-y-6">
      <PageHeader
        title="New authorized seller"
        description="Only add dealers confirmed by LONEX. The directory is public when a seller is active."
        actions={
          <Link
            href="/admin/sellers"
            className="text-sm font-medium text-lonex-ink-soft hover:text-lonex-ink hover:underline"
          >
            Back to sellers
          </Link>
        }
      />

      <SellerForm />
    </div>
  );
}
