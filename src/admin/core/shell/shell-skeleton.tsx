export function ShellSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white p-4 lg:block">
        <div className="h-9 w-40 animate-pulse rounded-lg bg-slate-100" />
        <div className="mt-8 space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-9 animate-pulse rounded-lg bg-slate-100"
            />
          ))}
        </div>
      </aside>
      <div className="lg:pl-64">
        <div className="h-14 border-b border-slate-200 bg-white" />
        <main className="mx-auto max-w-7xl p-6">
          <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-xl bg-white"
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
