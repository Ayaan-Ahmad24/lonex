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
import { Card, CardHeader, CardBody } from "@/admin/core/ui/card";
import { PageHeader } from "@/admin/core/ui/page-header";
import { StatusBadge } from "@/admin/core/ui/badge";
import { buttonClassName } from "@/admin/core/ui/button";
import { formatDateTime } from "@/admin/core/ui/format";
import {
  listVerificationRows,
  type VerificationRow,
} from "@/admin/modules/verification/queries";
import { VerificationActions } from "@/admin/modules/verification/verification-actions";

export default async function VerificationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminModule("verification");
  const raw = await searchParams;
  const params = parseListParams(raw, {
    allowedSorts: ["name", "updatedAt"],
    defaultSort: "name",
    filterValues: { code: ["active", "inactive", "missing"] },
  });
  const result = await listVerificationRows(params);

  const columns: DataTableColumn<VerificationRow>[] = [
    {
      key: "product",
      header: "Product model",
      render: (row) => (
        <div>
          <Link
            href={`/admin/products/${row.productId}`}
            className="font-medium text-lonex-ink hover:underline"
          >
            {row.productName}
          </Link>
          <p className="font-mono text-[11px] text-lonex-muted">
            /{row.categorySlug}/{row.productSlug}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Product",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "code",
      header: "Verification code",
      render: () => (
        <span
          className="lx-mono select-none text-xs text-lonex-ink"
          title="Code stored as HMAC digest"
        >
          •••••
        </span>
      ),
    },
    {
      key: "registered",
      header: "Registered",
      render: (row) =>
        row.registeredAt ? formatDateTime(row.registeredAt) : "—",
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => <VerificationActions row={row} />,
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Model verification"
        description="One verification code per product model. Only an HMAC digest is stored; the raw code is shown once when generated or rotated."
      />

      <Card>
        <CardHeader title="How verification works" />
        <CardBody className="space-y-2 text-sm text-lonex-muted">
          <p>
            A matching code confirms that the model is registered with LONEX. It
            does <strong>not</strong> prove that a physical unit is authentic.
          </p>
          <p>
            Rotating a code invalidates the previous one immediately. The raw
            code is never stored, logged or shown again.
          </p>
        </CardBody>
      </Card>

      <Card>
        <ListToolbar action="/admin/verification">
          <SearchInput
            defaultValue={params.q}
            placeholder="Search product name or slug"
          />
          <FilterSelect
            name="code"
            label="Code state"
            value={params.filters.code}
            options={[
              { value: "", label: "All" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
              { value: "missing", label: "Not registered" },
            ]}
          />
        </ListToolbar>

        <DataTable
          columns={columns}
          rows={result.rows}
          caption="Product model verification codes"
          emptyTitle="No products found"
          emptyDescription="Create a product first, then register one verification code per model."
          emptyAction={
            <Link
              href="/admin/products"
              className={buttonClassName("secondary", "sm")}
            >
              Go to products
            </Link>
          }
        />

        <Pagination
          page={result.page}
          pageCount={result.pageCount}
          total={result.total}
          buildHref={(page) =>
            `/admin/verification${buildListQuery(raw, { page })}`
          }
        />
      </Card>
    </div>
  );
}
