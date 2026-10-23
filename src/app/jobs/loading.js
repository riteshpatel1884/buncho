import { Skeleton } from '@/components/Skeletons';

export default function Loading() {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className="mx-auto w-full max-w-6xl px-4 pb-20 pt-6 sm:px-6">
      <div className="rounded-3xl border border-line bg-surface px-6 py-10 sm:px-10 sm:py-14">
        <Skeleton className="h-6 w-40 rounded-full" />
        <Skeleton className="mt-5 h-11 w-3/4 max-w-xl" />
        <Skeleton className="mt-3 h-11 w-1/2 max-w-md" />
        <Skeleton className="mt-5 h-4 w-full max-w-xl" />
        <Skeleton className="mt-2 h-4 w-2/3 max-w-md" />
        <Skeleton className="mt-7 h-11 w-40 rounded-full" />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-4 rounded-2xl border border-line bg-surface p-5">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-14 w-14 rounded-full" />
            </div>
            <Skeleton className="h-6 w-1/2 rounded-full" />
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}