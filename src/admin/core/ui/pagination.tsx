import Link from "next/link";

export function Pagination({
  page,
  pageCount,
  total,
  buildHref,
}: {
  page: number;
  pageCount: number;
  total: number;
  buildHref: (page: number) => string;
}) {
  if (pageCount <= 1) {
    return (
      <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-500">
        <span>
          {total} {total === 1 ? "record" : "records"}
        </span>
      </div>
    );
  }

  const previous = Math.max(1, page - 1);
  const next = Math.min(pageCount, page + 1);

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-xs text-slate-500"
    >
      <span>
        Page {page} of {pageCount} · {total}{" "}
        {total === 1 ? "record" : "records"}
      </span>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link
            href={buildHref(previous)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
          >
            Previous
          </Link>
        ) : (
          <span className="cursor-not-allowed rounded-lg border border-slate-200 px-3 py-1.5 text-slate-400">
            Previous
          </span>
        )}
        {page < pageCount ? (
          <Link
            href={buildHref(next)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
          >
            Next
          </Link>
        ) : (
          <span className="cursor-not-allowed rounded-lg border border-slate-200 px-3 py-1.5 text-slate-400">
            Next
          </span>
        )}
      </div>
    </nav>
  );
}
