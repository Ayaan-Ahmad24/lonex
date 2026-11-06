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
import {
  FilterSelect,
  ListToolbar,
  SearchInput,
} from "@/admin/core/ui/list-toolbar";
import { Pagination } from "@/admin/core/ui/pagination";
import { Card } from "@/admin/core/ui/card";
import { PageHeader } from "@/admin/core/ui/page-header";
import { Badge } from "@/admin/core/ui/badge";
import { TableSkeleton } from "@/admin/core/ui/states";
import { formatDateTime } from "@/admin/core/ui/format";

const SORTS = ["createdAt"] as const;

export default function AuditPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit log"
        description="Read-only record of security and content changes. Entries cannot be edited or deleted from the dashboard."
      />
      <Suspense fallback={<Card><TableSkeleton /></Card>}>
        <AuditList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

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

async function AuditList({
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
      render: (row) => (
        <Badge tone={row.action.includes("delete") ? "danger" : "neutral"}>
          {row.action}
        </Badge>
      ),
    },
    {
      key: "target",
      header: "Target",
      render: (row) => (
        <span className="text-xs text-slate-700">
          {row.targetType}
          {row.targetId ? (
            <span className="text-slate-400"> #{row.targetId}</span>
          ) : null}
        </span>
      ),
    },
    {
      key: "actor",
      header: "Actor",
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-slate-800">
            {row.actorName ?? "Deleted or system user"}
          </p>
          {row.actorEmail ? (
            <p className="truncate text-[11px] text-slate-500">
              {row.actorEmail}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      key: "metadata",
      header: "Details",
      render: (row) => (
        <span className="block max-w-72 truncate text-xs text-slate-500">
          {summarizeMetadata(row.metadata)}
        </span>
      ),
    },
    {
      key: "created",
      header: "When",
      render: (row) => (
        <span className="whitespace-nowrap text-xs text-slate-500">
          {formatDateTime(row.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <Card>
      <ListToolbar action="/admin/audit">
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
  );
}
