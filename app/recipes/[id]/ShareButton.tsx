'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ShareButton({ recipeId, isPublic }: { recipeId: string; isPublic: boolean }) {
  const [shared, setShared] = useState(isPublic)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const supabase = createClient()

  const handleShare = async () => {
    setLoading(true)
    try {
      if (!shared) {
        await supabase.from('recipes').update({ is_public: true }).eq('id', recipeId)
        setShared(true)
      }
      const url = `${window.location.origin}/share/${recipeId}`

      // ネイティブ共有シート（LINE・メッセージ等の候補が出る）
      if (navigator.share) {
        await navigator.share({
          title: 'Monrepeでレシピを共有',
          text: 'レシピを見てみて！Monrepeに登録できるよ🍳',
          url,
        })
      } else {
        // 非対応ブラウザはクリップボードにコピー
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleShare}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-200 rounded-full text-sm text-stone-500 hover:bg-stone-50 transition-colors disabled:opacity-50 active:scale-95"
    >
      {copied ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-green-500">
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
          </svg>
          <span className="text-green-500">コピー済み</span>
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M13 4.5a2.5 2.5 0 11.702 1.737L6.97 9.604a2.518 2.518 0 010 .792l6.733 3.367a2.5 2.5 0 11-.671 1.341l-6.733-3.367a2.5 2.5 0 110-3.475l6.733-3.366A2.52 2.52 0 0113 4.5z" />
          </svg>
          共有
        </>
      )}
    </button>
  )
}
