export default function TransactionsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-pulse">
      {/* Header skeleton */}
      <div className="mb-6 flex items-end justify-between">
        <div className="space-y-2">
          <div className="h-8 w-40 rounded-xl bg-white/5" />
          <div className="h-4 w-28 rounded-lg bg-white/5" />
        </div>
        <div className="h-10 w-40 rounded-xl bg-white/5" />
      </div>

      {/* Filter bar skeleton */}
      <div className="mb-4 flex gap-3">
        <div className="h-9 w-52 rounded-xl bg-white/5" />
        <div className="h-9 w-36 rounded-xl bg-white/5" />
        <div className="h-9 w-36 rounded-xl bg-white/5" />
      </div>

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <div className="h-10 border-b border-white/10 bg-white/[0.03]" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-white/5 px-5 py-3.5">
            <div className="h-4 w-20 rounded bg-white/5" />
            <div className="h-4 flex-1 rounded bg-white/5" />
            <div className="h-6 w-20 rounded-md bg-white/5" />
            <div className="h-6 w-16 rounded-md bg-white/5" />
            <div className="ml-auto h-4 w-20 rounded bg-white/5" />
            <div className="h-7 w-16 rounded-lg bg-white/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
