'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems = [
    { href: '/', label: 'レシピ一覧' },
    { href: '/recipes/new', label: '+ レシピを追加' },
    { href: '/meal-plan', label: 'AI献立提案' },
  ]

  return (
    <header className="border-b border-stone-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-stone-800 font-medium tracking-wide text-lg">
          My Flavor Archive
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
            onClick={handleLogout}
            className="ml-2 px-3 py-1.5 text-sm text-stone-400 hover:text-stone-600 transition-colors"
          >
            ログアウト
          </button>
        </nav>
      </div>
    </header>
  )
}
