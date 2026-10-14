// Shown while /experts loads: same shape as the page, so nothing jumps.
export default function Loading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading experts">
      <div className="rounded-3xl border border-line bg-surface px-5 py-8 sm:px-10 sm:py-12">
        <div className="skeleton h-12 w-64 max-w-full" />
        <div className="skeleton mt-4 h-5 w-96 max-w-full" />
        <div className="skeleton mt-7 h-16 max-w-3xl rounded-2xl" />
        <div className="mt-5 flex gap-2">
          {[110, 120, 130, 140, 120].map((w, i) => <div key={i} className="skeleton h-9 rounded-full" style={{ width: w }} />)}
        </div>
      </div>
      <div className="space-y-4">
        <div className="skeleton h-7 w-28" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="card grid gap-5 p-6 md:grid-cols-[minmax(0,1fr)_290px]">
            <div className="flex gap-4">
              <div className="skeleton h-16 w-16 shrink-0 rounded-2xl" />
              <div className="flex-1 space-y-2.5">
                <div className="skeleton h-6 w-44" />
                <div className="skeleton h-4 w-56 max-w-full" />
                <div className="skeleton h-4 w-40" />
                <div className="skeleton mt-3 h-10 w-full max-w-md" />
              </div>
            </div>
            <div className="skeleton h-36 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
