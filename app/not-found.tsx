'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => router.replace('/'), 2000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-4"
      style={{ backgroundColor: '#fdfbf8' }}
    >
      <p className="text-4xl">🍳</p>
      <p className="text-stone-500">ページが見つかりません</p>
      <p className="text-stone-300 text-sm">ホームに移動します...</p>
    </div>
  )
}
