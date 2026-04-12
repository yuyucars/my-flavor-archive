'use client'

import { useEffect, useState } from 'react'

export default function AppBanner({ shareUrl }: { shareUrl: string }) {
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as { standalone?: boolean }).standalone === true
    if (isStandalone) return // PWA内なら何も表示しない

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(ios)
    setShow(true)
  }, [])

  if (!show) return null

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-amber-800">📱 Monrepeアプリをお持ちですか？</p>
          {isIOS ? (
            <p className="text-xs text-amber-600 mt-1 leading-relaxed">
              ホーム画面のMonrepeを開いてから、このURLを貼り付けると登録できます
            </p>
          ) : (
            <p className="text-xs text-amber-600 mt-1 leading-relaxed">
              インストール済みのMonrepeアプリを開いて、このURLから登録できます
            </p>
          )}
        </div>
        <button
          onClick={() => setShow(false)}
          className="text-amber-300 hover:text-amber-500 text-xl leading-none flex-shrink-0 mt-0.5"
        >
          ×
        </button>
      </div>

      {/* URLコピーボタン（iOS向けに便利） */}
      <button
        onClick={handleCopy}
        className="mt-3 w-full py-2 border border-amber-200 rounded-xl text-xs text-amber-700 hover:bg-amber-100 transition-colors flex items-center justify-center gap-1.5"
      >
        {copied ? (
          <>✅ URLをコピーしました</>
        ) : (
          <>📋 このページのURLをコピー</>
        )}
      </button>
    </div>
  )
}
