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
import { Badge, StatusBadge } from "@/admin/core/ui/badge";
import { buttonClassName } from "@/admin/core/ui/button";
import { formatDate } from "@/admin/core/ui/format";
import { listCategoryOptions } from "@/admin/modules/categories/queries";
import { listProducts, type ProductListRow } from "@/admin/modules/products/queries";

const SORTS = ["sortOrder", "name", "status", "updatedAt"] as const;

function priceLabel(row: ProductListRow): string {
  if (!row.showPrice) {
    return "Hidden";
  }

  if (!row.price) {
    return "Missing";
  }

  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(Number(row.price));
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminModule("products");
  const raw = await searchParams;
  const params = parseListParams(raw, {
    allowedSorts: SORTS,
    defaultSort: "sortOrder",
    filterValues: { status: ["draft", "published"] },
  });
  const categoryOptions = await listCategoryOptions();
  const categoryParam = Array.isArray(raw.categoryId)
    ? raw.categoryId[0]
    : raw.categoryId;
  const categoryId = Number(categoryParam);
  const validCategoryId = categoryOptions.some(
    (option) => option.id === categoryId,
  )
    ? categoryId
    : undefined;

  const result = await listProducts(params, validCategoryId);

  const columns: DataTableColumn<ProductListRow>[] = [
    {
      key: "name",
      header: "Product",
      render: (row) => (
        <div>
          <Link
            href={`/admin/products/${row.id}`}
            className="font-medium text-lonex-ink no-underline transition-colors hover:text-lonex-red"
          >
            {row.name}
          </Link>
          <p className="font-mono text-[11px] text-lonex-muted">
            /{row.categorySlug}/{row.slug}
          </p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (row) => row.categoryName,
    },
    {
      key: "price",
      header: "Price",
      className: "whitespace-nowrap",
      render: (row) => (
        <span
          className={
            row.showPrice
              ? "lx-num text-lonex-ink"
              : "text-xs font-medium text-lonex-muted"
          }
        >
          {priceLabel(row)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <div className="flex flex-wrap items-center gap-1">
          <StatusBadge status={row.status} />
          {row.isFeatured ? <Badge tone="info">Featured</Badge> : null}
        </div>
      ),
    },
    {
      key: "updated",
      header: "Updated",
      className: "w-32 whitespace-nowrap",
      render: (row) => formatDate(row.updatedAt),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Products belong to one category. Public URLs follow /{category}/{product} and hidden prices never reach the storefront."
        actions={
          <Link
            href="/admin/products/new"
            className={buttonClassName("primary", "sm")}
          >
            New product
          </Link>
        }
      />

      <Card>
        <ListToolbar action="/admin/products" resetHref="/admin/products">
          <SearchInput defaultValue={params.q} placeholder="Search name or slug" />
          <FilterSelect
            name="categoryId"
            label="Category"
            value={validCategoryId ? String(validCategoryId) : ""}
            options={[
              { value: "", label: "All categories" },
              ...categoryOptions.map((option) => ({
                value: String(option.id),
                label: option.name,
              })),
            ]}
          />
          <FilterSelect
            name="status"
            label="Status"
            value={params.filters.status}
            options={[
              { value: "", label: "All statuses" },
              { value: "draft", label: "Draft" },
              { value: "published", label: "Published" },
            ]}
          />
        </ListToolbar>

        <DataTable
          columns={columns}
          rows={result.rows}
          caption="Products"
          emptyTitle="No products found"
          emptyDescription="Create a product in one of the published categories."
          emptyAction={
            <Link
              href="/admin/products/new"
              className={buttonClassName("primary", "sm")}
            >
              New product
            </Link>
          }
        />

        <Pagination
          page={result.page}
          pageCount={result.pageCount}
          total={result.total}
          buildHref={(page) =>
            `/admin/products${buildListQuery(raw, { page })}`
          }
        />
      </Card>
    </div>
  );
}
