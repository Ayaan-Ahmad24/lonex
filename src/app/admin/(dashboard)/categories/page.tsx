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
import { listCategories, type CategoryListRow } from "@/admin/modules/categories/queries";

const SORTS = ["sortOrder", "name", "status", "updatedAt"] as const;

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { permissions } = await requireAdminModule("categories");
  const raw = await searchParams;
  const params = parseListParams(raw, {
    allowedSorts: SORTS,
    defaultSort: "sortOrder",
    defaultDirection: "asc",
    filterValues: { status: ["draft", "published"] },
  });
  const result = await listCategories(params);
  const canPublish = permissions.has("content.publish");

  const columns: DataTableColumn<CategoryListRow>[] = [
    {
      key: "name",
      header: "Category",
      render: (row) => (
        <Link
          href={`/admin/categories/${row.id}`}
          className="font-medium text-lonex-ink no-underline transition-colors hover:text-lonex-red"
        >
          {row.name}
        </Link>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      className: "w-24",
      render: (row) => (
        <span
          className="font-mono text-xs text-lonex-muted"
          title="Lower numbers appear first in the public catalogue."
        >
          {row.sortOrder}
        </span>
      ),
    },
    {
      key: "slug",
      header: "Public URL",
      render: (row) => (
        <span className="font-mono text-xs text-lonex-muted">/{row.slug}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      className: "w-28",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "products",
      header: "Products",
      className: "w-24 text-right",
      render: (row) => <span className="lx-num">{row.productCount}</span>,
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
        title="Categories"
        description="Published categories appear in the public navigation and own a top-level URL such as /solar. Lower priority numbers appear first."
        actions={
          <Link
            href="/admin/categories/new"
            className={buttonClassName("primary", "sm")}
          >
            New category
          </Link>
        }
      />

      <Card>
        <ListToolbar action="/admin/categories" resetHref="/admin/categories">
          <SearchInput
            defaultValue={params.q}
            placeholder="Search name or slug"
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
          caption="Product categories"
          emptyTitle="No categories yet"
          emptyDescription={
            canPublish
              ? "Create the first category to start building the catalogue."
              : "Ask an administrator to create categories."
          }
          emptyAction={
            canPublish ? (
              <Link
                href="/admin/categories/new"
                className={buttonClassName("primary", "sm")}
              >
                New category
              </Link>
            ) : undefined
          }
        />

        <Pagination
          page={result.page}
          pageCount={result.pageCount}
          total={result.total}
          buildHref={(page) =>
            `/admin/categories${buildListQuery(raw, { page })}`
          }
        />
      </Card>
    </div>
  );
}
