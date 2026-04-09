'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function DeleteButton({ recipeId }: { recipeId: string }) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleDelete = async () => {
    setLoading(true)
    await supabase.from('recipes').delete().eq('id', recipeId)
    router.push('/')
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-stone-500">本当に削除しますか？</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-3 py-1.5 bg-red-500 text-white rounded-full text-sm hover:bg-red-600 disabled:opacity-50 transition-colors"
        >
          {loading ? '削除中...' : '削除する'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-3 py-1.5 border border-stone-200 rounded-full text-sm text-stone-500 hover:bg-stone-50 transition-colors"
        >
          キャンセル
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="px-4 py-2 text-red-400 border border-red-200 rounded-full text-sm hover:bg-red-50 transition-colors"
    >
      削除
    </button>
  )
}
