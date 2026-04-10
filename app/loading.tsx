export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-7 w-28 bg-stone-100 rounded-lg animate-pulse" />
          <div className="h-4 w-16 bg-stone-100 rounded mt-2 animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-stone-100 rounded-full animate-pulse" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
            <div className="h-36 bg-stone-100 animate-pulse" />
            <div className="p-5 space-y-3">
              <div className="h-4 bg-stone-100 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-stone-100 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-stone-100 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
