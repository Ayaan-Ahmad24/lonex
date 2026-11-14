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
import { listBlogPosts, type BlogListRow } from "@/admin/modules/blog/queries";

const SORTS = ["title", "status", "publishedAt", "updatedAt"] as const;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminModule("blog");
  const raw = await searchParams;
  const params = parseListParams(raw, {
    allowedSorts: SORTS,
    defaultSort: "updatedAt",
    filterValues: { status: ["draft", "published"] },
  });
  const result = await listBlogPosts(params);

  const columns: DataTableColumn<BlogListRow>[] = [
    {
      key: "title",
      header: "Article",
      render: (row) => (
        <div>
          <Link
            href={`/admin/blog/${row.id}`}
            className="font-medium text-lonex-ink hover:underline"
          >
            {row.title}
          </Link>
          <p className="font-mono text-[11px] text-lonex-muted">/blog/{row.slug}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "published",
      header: "Published",
      render: (row) =>
        row.publishedAt ? formatDate(row.publishedAt) : "—",
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
        title="Blog"
        description="Draft and published articles. Only published posts appear on the public site; content is stored as safe structured blocks, never raw HTML."
        actions={
          <Link
            href="/admin/blog/new"
            className={buttonClassName("primary", "sm")}
          >
            New article
          </Link>
        }
      />

      <Card>
        <ListToolbar action="/admin/blog">
          <SearchInput defaultValue={params.q} placeholder="Search title" />
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
          caption="Blog articles"
          emptyTitle="No articles yet"
          emptyDescription="Write the first article. Drafts stay private until published by an authorized user."
          emptyAction={
            <Link
              href="/admin/blog/new"
              className={buttonClassName("primary", "sm")}
            >
              New article
            </Link>
          }
        />

        <Pagination
          page={result.page}
          pageCount={result.pageCount}
          total={result.total}
          buildHref={(page) => `/admin/blog${buildListQuery(raw, { page })}`}
        />
      </Card>
    </div>
  );
}
