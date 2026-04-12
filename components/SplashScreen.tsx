'use client'

import { useState, useEffect } from 'react'

export default function SplashScreen() {
  const [visible, setVisible] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // セッション内で一度だけ表示
    const hasShown = sessionStorage.getItem('monrepe-splash-shown')
    if (hasShown) {
      setVisible(false)
      return
    }

    const fadeTimer = setTimeout(() => setFadeOut(true), 1400)
    const hideTimer = setTimeout(() => {
      setVisible(false)
      sessionStorage.setItem('monrepe-splash-shown', '1')
    }, 1800)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-6 transition-opacity duration-400"
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
