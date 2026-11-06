import { Suspense } from "react";
import Link from "next/link";
import { requireAdminModule } from "@/admin/config/access";
import {
  buildListQuery,
  parseListParams,
} from "@/admin/core/crud/list-params";
import { DataTable, type DataTableColumn } from "@/admin/core/ui/data-table";
import { ListToolbar, SearchInput, FilterSelect } from "@/admin/core/ui/list-toolbar";
import { Pagination } from "@/admin/core/ui/pagination";
import { Card } from "@/admin/core/ui/card";
import { PageHeader } from "@/admin/core/ui/page-header";
import { Badge, StatusBadge } from "@/admin/core/ui/badge";
import { TableSkeleton } from "@/admin/core/ui/states";
import { formatDate } from "@/admin/core/ui/format";
import { listUsers, type UserListRow } from "@/admin/modules/users/queries";

const SORTS = ["createdAt", "name", "email", "status"] as const;

export default function UsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Administrator accounts are provisioned only through the CLI. The dashboard cannot create users."
      />
      <Suspense fallback={<Card><TableSkeleton /></Card>}>
        <UsersList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

function roleBadge(role: string) {
  return (
    <Badge tone={role === "administrator" ? "info" : "neutral"}>
      {role}
    </Badge>
  );
}

async function UsersList({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminModule("users");
  const raw = await searchParams;
  const params = parseListParams(raw, {
    allowedSorts: SORTS,
    defaultSort: "createdAt",
    filterValues: {
      role: ["administrator", "editor"],
      status: ["active", "inactive"],
    },
  });
  const result = await listUsers(params);

  const columns: DataTableColumn<UserListRow>[] = [
    {
      key: "user",
      header: "User",
      render: (row) => (
        <div className="min-w-0">
          <Link
            href={`/admin/users/${row.id}`}
            className="block truncate font-medium text-slate-900 hover:underline"
          >
            {row.name}
          </Link>
          <p className="truncate text-xs text-slate-500">{row.email}</p>
        </div>
      ),
    },
    {
      key: "roles",
      header: "Role",
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.roles.length > 0 ? (
            row.roles.map((role) => (
              <span key={role}>{roleBadge(role)}</span>
            ))
          ) : (
            <span className="text-xs text-slate-400">No role</span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <StatusBadge status={row.isActive ? "active" : "inactive"} />
      ),
    },
    {
      key: "created",
      header: "Created",
      render: (row) => (
        <span className="text-xs text-slate-500">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (row) => (
        <Link
          href={`/admin/users/${row.id}`}
          className="text-xs font-medium text-slate-600 hover:text-slate-900 hover:underline"
        >
          Details
        </Link>
      ),
    },
  ];

  return (
    <Card>
      <ListToolbar action="/admin/users">
        <SearchInput
          defaultValue={params.q}
          placeholder="Search name or email"
        />
        <FilterSelect
          name="role"
          label="Role"
          value={params.filters.role}
          options={[
            { value: "", label: "All roles" },
            { value: "administrator", label: "Administrator" },
            { value: "editor", label: "Editor" },
          ]}
        />
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
        caption="Admin users"
        emptyTitle="No users match this filter"
        emptyDescription="Try clearing the search or status filter."
      />

      <Pagination
        page={result.page}
        pageCount={result.pageCount}
        total={result.total}
        buildHref={(page) =>
          `/admin/users${buildListQuery(raw, { page, pageSize: params.pageSize })}`
        }
      />
    </Card>
  );
}
