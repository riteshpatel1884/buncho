// Placeholder screens shown by loading.js while a route's data is being fetched.

export function Skeleton({ className = '' }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-md bg-surface-2 ${className}`} />;
}

function Shell({ children, className = '', ...rest }) {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className={className} {...rest}>
      {children}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <Shell className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="mt-3 h-4 w-96 max-w-full" />
      <div className="mt-8 space-y-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card space-y-4 p-6">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    </Shell>
  );
}

export function ListSkeleton({ rows = 8 }) {
  return (
    <Shell className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="mt-3 h-4 w-80 max-w-full" />
      <div className="mt-6 flex flex-wrap gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>
      <div className="card mt-6 divide-y divide-line">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center justify-between gap-6 px-5 py-4">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </div>
    </Shell>
  );
}

export function DashboardSkeleton() {
  return (
    <Shell className="mx-auto w-full max-w-[80rem] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      {/* greeting + banner row */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-full" />
          <Skeleton className="h-8 w-56" />
        </div>
        <Skeleton className="h-[4.5rem] w-full rounded-2xl lg:flex-1" />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card space-y-3 p-5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-8 w-14" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-8">
          {/* activity chart */}
          <div className="card p-6">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="mt-2 h-3 w-36" />
            <Skeleton className="mt-6 h-48 w-full" />
          </div>
          <div className="card p-6">
            <Skeleton className="h-5 w-40" />
            <div className="mt-6 flex items-center gap-8">
              <Skeleton className="h-28 w-28 shrink-0 rounded-full" />
              <div className="flex-1 space-y-4">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-3 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* calendar */}
          <div className="card p-6">
            <Skeleton className="mx-auto h-4 w-24" />
            <Skeleton className="mx-auto mt-4 h-6 w-40" />
            <div className="mt-6 grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }, (_, i) => (
                <Skeleton key={i} className="aspect-square w-full rounded-xl" />
              ))}
            </div>
          </div>
          <div className="card space-y-3 p-6">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      </div>
    </Shell>
  );
}

// Matches the problem page: question on the left, answer editor on the right.
export function WorkspaceSkeleton() {
  return (
    <Shell data-workspace className="grid gap-4 p-4 lg:grid-cols-2">
      <div className="card h-[75vh] space-y-4 p-6">
        <Skeleton className="h-7 w-2/3" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className={`h-3 ${i % 3 === 2 ? 'w-2/3' : 'w-full'}`} />
        ))}
      </div>
      <div className="card h-[75vh] space-y-4 p-6">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-[85%] w-full" />
      </div>
    </Shell>
  );
}