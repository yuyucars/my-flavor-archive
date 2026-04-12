export default function Loading() {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center gap-6"
      style={{ backgroundColor: '#fdfbf8' }}
    >
      <div className="space-y-3 text-center">
        <h1 className="text-4xl font-light tracking-wide text-stone-800">Monrepe</h1>
        <p className="text-stone-400 text-sm">ようこそ、Monrepeへ</p>
      </div>

      <div className="w-16 h-px bg-stone-200" />

      {/* ドットアニメーション */}
      <div className="flex gap-2">
        <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>

      <p className="text-xs text-stone-300">準備中...</p>
    </div>
  )
}
