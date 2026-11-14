export function ShellSkeleton() {
  return (
    <div className="min-h-screen bg-lonex-stone">
      <aside className="fixed inset-y-0 left-0 hidden w-[260px] flex-col border-r border-lonex-line bg-lonex-paper p-5 lg:flex">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-lonex-line-soft" />
        <div className="mt-8 space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-8 animate-pulse rounded-lg bg-lonex-line-soft"
            />
          ))}
        </div>
      </aside>
      <div className="lg:pl-[260px]">
        <div className="h-16 border-b border-lonex-line bg-lonex-paper" />
        <main className="mx-auto max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8">
          <div className="h-8 w-48 animate-pulse rounded bg-lonex-line" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-xl border border-lonex-line bg-lonex-paper"
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
