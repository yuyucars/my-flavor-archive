'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Log = {
  id: string
  created_at: string
}

export default function CookedButton({ recipeId, logs }: { recipeId: string; logs: Log[] }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleCooked = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await Promise.all([
        supabase.from('recipes').update({ last_cooked_at: new Date().toISOString() }).eq('id', recipeId),
        supabase.from('cooking_logs').insert({ recipe_id: recipeId, user_id: user.id }),
      ])
    }
    setDone(true)
    setLoading(false)
    setTimeout(() => {
      setDone(false)
      router.refresh()
    }, 1500)
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleCooked}
        disabled={loading || done}
        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
          done
            ? 'bg-green-500 text-white scale-95'
            : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
        } disabled:cursor-not-allowed`}
      >
        {done ? '✓ 記録しました！' : loading ? '記録中...' : '✓ 今日作った'}
      </button>

      {/* 調理回数・履歴ボタン */}
      {logs.length > 0 && (
        <button
          onClick={() => setShowHistory(true)}
          className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
        >
          🍳 {logs.length}回調理済み
        </button>
      )}

      {/* 調理履歴モーダル */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 px-4 pb-4 sm:pb-0">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <p className="text-lg font-medium text-stone-800 mb-4">🍳 調理履歴</p>
            <ul className="space-y-2 max-h-64 overflow-y-auto mb-4">
              {logs.map((log) => (
                <li key={log.id} className="flex items-center gap-2 text-sm text-stone-600">
                  <span className="w-2 h-2 rounded-full bg-green-300 flex-shrink-0" />
                  {new Date(log.created_at).toLocaleDateString('ja-JP', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowHistory(false)}
              className="w-full py-2.5 border border-stone-200 rounded-full text-stone-600 text-sm hover:bg-stone-50 transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
