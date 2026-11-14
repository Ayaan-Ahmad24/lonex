export const instant = false;

import { Suspense } from "react";
import { requireAdminModule } from "@/admin/config/access";
import {
  buildListQuery,
  parseListParams,
} from "@/admin/core/crud/list-params";
import {
  listAuditEvents,
  listAuditTargetTypes,
  type AuditListRow,
} from "@/admin/core/audit/query";
import { DataTable, type DataTableColumn } from "@/admin/core/ui/data-table";
import { FilterSelect, ListToolbar, SearchInput } from "@/admin/core/ui/list-toolbar";
import { Pagination } from "@/admin/core/ui/pagination";
import { Card } from "@/admin/core/ui/card";
import { PageHeader } from "@/admin/core/ui/page-header";
import { Badge } from "@/admin/core/ui/badge";
import { TableSkeleton } from "@/admin/core/ui/states";
import { formatDateTime } from "@/admin/core/ui/format";

const SORTS = ["createdAt"] as const;

function summarizeMetadata(metadata: unknown): string {
  if (!metadata || typeof metadata !== "object") {
    return "—";
  }

  const entries = Object.entries(metadata as Record<string, unknown>)
    .filter(([, value]) => value !== null && value !== undefined)
    .slice(0, 6)
    .map(([key, value]) => {
      const text =
        typeof value === "string" || typeof value === "number" || typeof value === "boolean"
          ? String(value)
          : Array.isArray(value)
            ? `${value.length} item(s)`
            : "…";
      return `${key}: ${text}`;
    });

  return entries.length > 0 ? entries.join(", ") : "—";
}

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminModule("audit");
  const raw = await searchParams;
  const targetTypes = await listAuditTargetTypes();
  const params = parseListParams(raw, {
    allowedSorts: SORTS,
    defaultSort: "createdAt",
    filterValues: { targetType: targetTypes },
  });
  const result = await listAuditEvents(params);

  const columns: DataTableColumn<AuditListRow>[] = [
    {
      key: "action",
      header: "Action",
      className: "w-[128px]",
      render: (row) => (
        <Badge tone={row.action.includes("delete") ? "danger" : "neutral"}>
          {row.action}
        </Badge>
      ),
    },
    {
      key: "target",
      header: "Target",
      className: "w-[230px]",
      render: (row) => (
        <div className="min-w-0">
          <p className="text-xs font-medium text-lonex-ink">{row.targetType}</p>
          {row.targetId ? (
            <p
              className="lx-mono max-w-[13rem] truncate text-[11px] text-lonex-muted"
              title={String(row.targetId)}
            >
              #{row.targetId}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      key: "actor",
      header: "Actor",
      className: "w-[300px]",
      render: (row) => (
        <div className="min-w-0">
          <p className="max-w-[17rem] truncate text-xs font-medium text-lonex-ink">
            {row.actorName ?? "Deleted or system user"}
          </p>
          {row.actorEmail ? (
            <p
              className="max-w-[17rem] truncate text-[11px] text-lonex-muted"
              title={row.actorEmail}
            >
              {row.actorEmail}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      key: "metadata",
      header: "Details",
      className: "hidden w-[170px] xl:table-cell",
      render: (row) => (
        <span className="block max-w-[10rem] truncate text-xs text-lonex-muted">
          {summarizeMetadata(row.metadata)}
        </span>
      ),
    },
    {
      key: "created",
      header: "When",
      className: "w-[150px]",
      render: (row) => (
        <span className="whitespace-nowrap text-xs text-lonex-muted">
          {formatDateTime(row.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit log"
        description="Read-only record of security and content changes. Entries cannot be edited or deleted from the dashboard."
      />
      <Suspense fallback={<Card><TableSkeleton /></Card>}>
        <Card>
          <ListToolbar action="/admin/audit" resetHref="/admin/audit">
            <SearchInput
              defaultValue={params.q}
              placeholder="Search action, target or actor"
            />
            <FilterSelect
              name="targetType"
              label="Target type"
              value={params.filters.targetType}
              options={[
                { value: "", label: "All types" },
                ...targetTypes.map((type) => ({ value: type, label: type })),
              ]}
            />
          </ListToolbar>

          <DataTable
            columns={columns}
            rows={result.rows}
            caption="Audit events"
            fixed
            emptyTitle="No audit events"
            emptyDescription="Sensitive operations will appear here once performed."
          />

          <Pagination
            page={result.page}
            pageCount={result.pageCount}
            total={result.total}
            buildHref={(page) =>
              `/admin/audit${buildListQuery(raw, { page, pageSize: params.pageSize })}`
            }
          />
        </Card>
      </Suspense>
    </div>
  );
}
