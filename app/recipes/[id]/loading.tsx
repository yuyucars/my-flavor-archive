export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-32 md:pb-12">
      <div className="h-4 w-24 bg-stone-100 rounded animate-pulse mb-6" />
      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        <div className="h-56 bg-stone-100 animate-pulse" />
        <div className="px-6 pt-6 pb-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="h-7 bg-stone-100 rounded animate-pulse" />
              <div className="h-7 w-2/3 bg-stone-100 rounded animate-pulse" />
            </div>
            <div className="flex gap-2">
              <div className="h-9 w-16 bg-stone-100 rounded-full animate-pulse" />
              <div className="h-9 w-16 bg-stone-100 rounded-full animate-pulse" />
            </div>
          </div>
          <div className="h-16 bg-stone-100 rounded-2xl animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-12 bg-stone-100 rounded animate-pulse" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-stone-100 rounded animate-pulse" />
            ))}
          </div>
          <div className="space-y-2">
            <div className="h-4 w-12 bg-stone-100 rounded animate-pulse" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 bg-stone-100 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
