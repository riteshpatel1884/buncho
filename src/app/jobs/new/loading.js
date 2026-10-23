import { Skeleton } from '@/components/Skeletons';

export default function Loading() {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className="mx-auto w-full max-w-6xl px-4 pb-20 pt-6 sm:px-6">
      <Skeleton className="h-5 w-36 rounded-full" />
      <div className="mt-3 rounded-3xl border border-line bg-surface px-6 py-10 sm:px-10">
        <Skeleton className="h-6 w-28 rounded-full" />
        <Skeleton className="mt-4 h-10 w-3/4 max-w-xl" />
        <Skeleton className="mt-3 h-4 w-full max-w-2xl" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <Skeleton className="h-[34rem] rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}