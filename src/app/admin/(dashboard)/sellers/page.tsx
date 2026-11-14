export const instant = false;

import Link from "next/link";
import { requireAdminModule } from "@/admin/config/access";
import {
  buildListQuery,
  parseListParams,
} from "@/admin/core/crud/list-params";
import { DataTable, type DataTableColumn } from "@/admin/core/ui/data-table";
import { FilterSelect, ListToolbar, SearchInput } from "@/admin/core/ui/list-toolbar";
import { Pagination } from "@/admin/core/ui/pagination";
import { Card } from "@/admin/core/ui/card";
import { PageHeader } from "@/admin/core/ui/page-header";
import { StatusBadge } from "@/admin/core/ui/badge";
import { buttonClassName } from "@/admin/core/ui/button";
import { formatDate } from "@/admin/core/ui/format";
import { listSellers, type SellerListRow } from "@/admin/modules/sellers/queries";

const SORTS = ["sortOrder", "name", "city", "status", "updatedAt"] as const;

export default async function SellersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminModule("sellers");
  const raw = await searchParams;
  const params = parseListParams(raw, {
    allowedSorts: SORTS,
    defaultSort: "sortOrder",
    filterValues: { status: ["active", "inactive"] },
  });
  const result = await listSellers(params);

  const columns: DataTableColumn<SellerListRow>[] = [
    {
      key: "name",
      header: "Seller",
      render: (row) => (
        <Link
          href={`/admin/sellers/${row.id}`}
          className="font-medium text-lonex-ink hover:underline"
        >
          {row.name}
        </Link>
      ),
    },
    { key: "city", header: "City", render: (row) => row.city },
    { key: "phone", header: "Phone", render: (row) => row.phone },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "updated",
      header: "Updated",
      render: (row) => formatDate(row.updatedAt),
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Authorized sellers"
        description="Active sellers appear in the public dealer directory with city filtering, call links and map links."
        actions={
          <Link
            href="/admin/sellers/new"
            className={buttonClassName("primary", "sm")}
          >
            New seller
          </Link>
        }
      />

      <Card>
        <ListToolbar action="/admin/sellers">
          <SearchInput defaultValue={params.q} placeholder="Search name, city or phone" />
          <FilterSelect
            name="status"
            label="Status"
            value={params.filters.status}
            options={[
              { value: "", label: "All statuses" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
          />
        </ListToolbar>

        <DataTable
          columns={columns}
          rows={result.rows}
          caption="Authorized sellers"
          emptyTitle="No sellers yet"
          emptyDescription="Add approved dealer details. Do not invent dealers."
          emptyAction={
            <Link
              href="/admin/sellers/new"
              className={buttonClassName("primary", "sm")}
            >
              New seller
            </Link>
          }
        />

        <Pagination
          page={result.page}
          pageCount={result.pageCount}
          total={result.total}
          buildHref={(page) => `/admin/sellers${buildListQuery(raw, { page })}`}
        />
      </Card>
    </div>
  );
}
