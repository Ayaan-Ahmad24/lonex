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
  const summary = (
    <span className="text-xs text-lonex-muted">
      {pageCount <= 1
        ? `${total} ${total === 1 ? "record" : "records"}`
        : `Page ${page} of ${pageCount} · ${total} ${
            total === 1 ? "record" : "records"
          }`}
    </span>
  );

  if (pageCount <= 1) {
    return (
      <div className="flex items-center justify-between border-t border-lonex-line px-5 py-3 sm:px-6">
        {summary}
      </div>
    );
  }

  const previous = Math.max(1, page - 1);
  const next = Math.min(pageCount, page + 1);

  const linkClass =
    "inline-flex h-8 items-center rounded-lg border border-lonex-line bg-lonex-paper px-2.5 text-xs font-medium text-lonex-ink no-underline transition-colors hover:bg-lonex-stone";
  const disabledClass =
    "inline-flex h-8 items-center rounded-lg border border-lonex-line/60 px-2.5 text-xs font-medium text-lonex-muted/70";

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-between gap-3 border-t border-lonex-line px-5 py-3 sm:px-6"
    >
      {summary}
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link href={buildHref(previous)} className={linkClass}>
            Previous
          </Link>
        ) : (
          <span aria-disabled="true" className={disabledClass}>
            Previous
          </span>
        )}
        {page < pageCount ? (
          <Link href={buildHref(next)} className={linkClass}>
            Next
          </Link>
        ) : (
          <span aria-disabled="true" className={disabledClass}>
            Next
          </span>
        )}
      </div>
    </nav>
  );
}
