import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-lonex-line bg-lonex-line-soft text-lonex-muted">
        {icon ?? (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 13.5 5.2 6.4A2 2 0 0 1 7.1 5h9.8a2 2 0 0 1 1.9 1.4L21 13.5" />
            <path d="M3 13.5h5l1 2h6l1-2h5v4.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </svg>
        )}
      </div>
      <p className="mt-3 text-sm font-semibold text-lonex-ink">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-lonex-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function LoadingState({
  label = "Loading…",
  rows = 3,
}: {
  label?: string;
  rows?: number;
}) {
  return (
    <div className="space-y-3 p-5" role="status" aria-label={label}>
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-10 animate-pulse rounded-lg border border-lonex-line bg-lonex-line-soft"
        />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2 p-5" role="status" aria-label="Loading table">
      <span className="sr-only">Loading…</span>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-11 animate-pulse rounded-lg border border-lonex-line bg-lonex-line-soft"
        />
      ))}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-lonex-red/20 bg-lonex-red-soft px-4 py-3.5"
    >
      <p className="text-sm font-semibold text-lonex-red">{title}</p>
      {description ? (
        <p className="mt-1 text-sm text-lonex-ink-soft">{description}</p>
      ) : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
