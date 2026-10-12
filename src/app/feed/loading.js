function PostSkeleton() {
  return (
    <div className="card space-y-4 p-5" aria-hidden="true">
      <div className="flex items-center gap-3">
        <div className="skeleton h-11 w-11 !rounded-[28%]" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3.5 w-1/3" />
          <div className="skeleton h-3 w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="skeleton h-3.5 w-full" />
        <div className="skeleton h-3.5 w-11/12" />
        <div className="skeleton h-3.5 w-2/3" />
      </div>
      <div className="flex gap-2 border-t border-line pt-3">
        <div className="skeleton h-8 w-16 !rounded-full" />
        <div className="skeleton h-8 w-16 !rounded-full" />
        <div className="skeleton h-8 w-16 !rounded-full" />
      </div>
    </div>
  );
}

export default function FeedLoading() {
  return (
    <div role="status" aria-label="Loading feed" className="relative left-1/2 grid w-[min(calc(100vw-2rem),1480px)] -translate-x-1/2 grid-cols-1 gap-8 sm:w-[min(calc(100vw-3rem),1480px)] lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[290px_minmax(0,1fr)_350px] xl:gap-10">
      <aside className="hidden space-y-4 lg:block">
        <div className="card space-y-3 p-5">
          <div className="skeleton h-12 w-12 !rounded-[28%]" />
          <div className="skeleton h-4 w-2/3" />
          <div className="skeleton h-3 w-1/2" />
        </div>
        <div className="card space-y-3 p-4">
          <div className="skeleton h-9 w-full" />
          <div className="skeleton h-9 w-full" />
          <div className="skeleton h-9 w-full" />
        </div>
      </aside>
      <div className="space-y-4">
        <div className="skeleton h-[72px] w-full !rounded-2xl" />
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
      <aside className="hidden space-y-4 xl:block">
        <div className="card space-y-4 p-5">
          <div className="skeleton h-4 w-1/2" />
          <div className="skeleton h-10 w-full" />
          <div className="skeleton h-10 w-full" />
          <div className="skeleton h-10 w-full" />
        </div>
      </aside>
    </div>
  );
}