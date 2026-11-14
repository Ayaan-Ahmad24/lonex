import type { ReactNode } from "react";
import { EmptyState } from "./states";

export type DataTableColumn<Row> = {
  key: string;
  header: string;
  className?: string;
  render: (row: Row) => ReactNode;
};

export function DataTable<Row extends { id: string | number }>({
  columns,
  rows,
  caption,
  fixed = false,
  emptyTitle = "Nothing here yet",
  emptyDescription,
  emptyAction,
}: {
  columns: readonly DataTableColumn<Row>[];
  rows: readonly Row[];
  caption: string;
  /** Use fixed table layout so long unbreakable values can truncate. */
  fixed?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
}) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <div className="lx-scroll w-full overflow-x-auto">
      <table
        className={`w-full min-w-[680px] border-collapse text-left text-sm ${
          fixed ? "table-fixed" : ""
        }`}
      >
        <caption className="sr-only">{caption}</caption>
        <thead className="border-b border-lonex-line bg-lonex-stone">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-lonex-muted ${column.className ?? ""}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-lonex-line">
          {rows.map((row) => (
            <tr
              key={row.id}
              className="align-middle transition-colors hover:bg-lonex-stone/70"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-5 py-3.5 text-sm text-lonex-ink ${column.className ?? ""}`}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
