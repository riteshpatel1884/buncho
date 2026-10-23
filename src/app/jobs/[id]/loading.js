import { Skeleton } from '@/components/Skeletons';

// Shown while a role page, its mock assessment or its results load
export default function Loading() {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className="mx-auto w-full max-w-6xl px-4 pb-20 pt-6 sm:px-6">
      <Skeleton className="h-5 w-36 rounded-full" />
      <div className="mt-3 flex flex-col gap-6 rounded-3xl border border-line bg-surface p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-5">
          <Skeleton className="h-16 w-16 rounded-2xl" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-9 w-64 max-w-full" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <Skeleton className="h-24 w-56 rounded-2xl" />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-3 rounded-2xl border border-line bg-surface p-6">
          <Skeleton className="h-6 w-40" />
          {[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
        </div>
        <div className="space-y-6">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}