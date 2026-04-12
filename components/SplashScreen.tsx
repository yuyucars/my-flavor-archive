'use client'

import { useState, useEffect } from 'react'

export default function SplashScreen() {
  const [visible, setVisible] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const hasShown = sessionStorage.getItem('monrepe-splash-shown')
    if (hasShown) {
      setVisible(false)
      return
    }

    const minDisplay = 800 // 最低表示時間（ms）
    const startTime = Date.now()

    const hide = () => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, minDisplay - elapsed)
      setTimeout(() => {
        setFadeOut(true)
        setTimeout(() => {
          setVisible(false)
          sessionStorage.setItem('monrepe-splash-shown', '1')
        }, 400)
      }, remaining)
    }

    // ページが完全に読み込まれたら非表示にする
    if (document.readyState === 'complete') {
      hide()
    } else {
      window.addEventListener('load', hide, { once: true })
      return () => window.removeEventListener('load', hide)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-6"
      style={{
        backgroundColor: '#fdfbf8',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.4s ease-out',
      }}
    >
      <div className="space-y-3 text-center">
        <h1 className="text-4xl font-light tracking-wide text-stone-800">Monrepe</h1>
        <p className="text-stone-400 text-sm">ようこそ、Monrepeへ</p>
      </div>

      <div className="w-16 h-px bg-stone-200" />

      <div className="flex gap-2">
        <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>

      <p className="text-xs text-stone-300">準備中...</p>
    </div>
  )
}
