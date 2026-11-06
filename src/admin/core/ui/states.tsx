import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-400">
        ∅
      </div>
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      {description ? (
        <p className="max-w-sm text-sm text-slate-500">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export function LoadingState({
  label = "Loading...",
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
          className="h-10 animate-pulse rounded-lg bg-slate-100"
        />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2 p-5" role="status" aria-label="Loading table">
      <span className="sr-only">Loading...</span>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-11 animate-pulse rounded-lg bg-slate-100"
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
      className="flex flex-col items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4"
    >
      <p className="text-sm font-semibold text-red-800">{title}</p>
      {description ? (
        <p className="text-sm text-red-700">{description}</p>
      ) : null}
      {action}
    </div>
  );
}
