'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems = [
    { href: '/', label: 'レシピ', icon: '📋' },
    { href: '/favorites', label: 'お気に入り', icon: '⭐' },
    { href: '/recipes/new', label: '追加', icon: '➕' },
    { href: '/meal-plan', label: 'AI献立', icon: '👨‍🍳' },
  ]

  return (
    <>
      {/* ===== PC用ヘッダー ===== */}
      <header className="border-b border-stone-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10 hidden md:block">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-stone-800 font-medium tracking-wide text-lg">
            Monrepe
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  pathname === item.href
                    ? 'bg-stone-100 text-stone-800 font-medium'
                    : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="ml-2 px-3 py-1.5 text-sm text-stone-400 hover:text-stone-600 transition-colors"
            >
              ログアウト
            </button>
          </nav>
        </div>
      </header>

      {/* ===== スマホ用ヘッダー（上部タイトルのみ） ===== */}
      <header className="border-b border-stone-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10 md:hidden">
        <div className="px-4 h-12 flex items-center justify-between">
          <Link href="/" className="text-stone-800 font-medium tracking-wide">
            Monrepe
          </Link>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="text-sm text-stone-400 hover:text-stone-600 transition-colors px-2 py-1"
          >
            ログアウト
          </button>
        </div>
      </header>

      {/* ===== スマホ用ボトムナビ ===== */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-100 z-10 md:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const isFavorites = item.href === '/favorites'
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-xl transition-colors active:scale-95 active:opacity-60 ${
                  isActive ? 'text-stone-800' : 'text-stone-400'
                }`}
              >
                {isFavorites ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="w-6 h-6"
                    fill={isActive ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                ) : (
                  <span className="text-xl">{item.icon}</span>
                )}
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* スマホ用ボトムナビの高さ分の余白 */}
      <div className="h-16 md:hidden" />

      {/* ===== ログアウト確認モーダル ===== */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <p className="text-lg font-medium text-stone-800 mb-2">ログアウトしますか？</p>
            <p className="text-sm text-stone-400 mb-6">ログアウトするとログイン画面に戻ります。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 border border-stone-200 rounded-full text-stone-600 text-sm hover:bg-stone-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 bg-stone-800 text-white rounded-full text-sm font-medium hover:bg-stone-700 transition-colors"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
