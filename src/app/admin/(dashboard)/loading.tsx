export default function AdminLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading admin page">
      <span className="sr-only">Loading...</span>
      <div className="h-8 w-56 animate-pulse rounded bg-slate-200" />
      <div className="h-4 w-80 animate-pulse rounded bg-slate-100" />
      <div className="h-64 animate-pulse rounded-xl bg-white" />
    </div>
  );
}
