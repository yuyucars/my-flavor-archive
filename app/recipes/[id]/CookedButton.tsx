'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Log = { id: string; created_at: string }

export default function CookedButton({
  recipeId,
  logs,
  lastCookedAt,
}: {
  recipeId: string
  logs: Log[]
  lastCookedAt: string | null
}) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showEditDate, setShowEditDate] = useState(false)
  const toLocalDatetime = (iso: string) => {
    const d = new Date(iso)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }
  const [editDate, setEditDate] = useState(
    lastCookedAt ? toLocalDatetime(lastCookedAt) : toLocalDatetime(new Date().toISOString())
  )
  const supabase = createClient()
  const router = useRouter()

  const handleCooked = async () => {
    setShowConfirm(false)
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
    setTimeout(() => { setDone(false); router.refresh() }, 1500)
  }

  const handleEditDate = async () => {
    setLoading(true)
    // datetime-local の値をそのままDateに変換（ローカル時刻として解釈）
    await supabase.from('recipes').update({ last_cooked_at: new Date(editDate).toISOString() }).eq('id', recipeId)
    setShowEditDate(false)
    setLoading(false)
    router.refresh()
  }

  const lastCookedLabel = lastCookedAt
    ? new Date(lastCookedAt).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' })
    : '未調理'

  return (
    <>
      {/* コンパクトな調理記録エリア */}
      <div className="flex items-center justify-between bg-stone-50 rounded-2xl px-4 py-3">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-xs text-stone-400">最終調理日</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-sm font-medium text-stone-700">{lastCookedLabel}</p>
              <button
                onClick={() => setShowEditDate(true)}
                className="text-stone-300 hover:text-stone-500 transition-colors"
                title="日付を修正"
              >
                ✏️
              </button>
            </div>
            {logs.length > 0 && (
              <button onClick={() => setShowHistory(true)} className="text-xs text-stone-400 hover:text-stone-600 mt-0.5">
                🍳 {logs.length}回調理済み
              </button>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowConfirm(true)}
          disabled={loading || done}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
            done ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'
          } disabled:cursor-not-allowed`}
        >
          {done ? '✓ 記録!' : loading ? '...' : '✓ 今日作った'}
        </button>
      </div>

      {/* 今日作った確認モーダル */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 px-4 pb-4 sm:pb-0">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <p className="text-lg font-medium text-stone-800 mb-1">今日作りましたか？</p>
            <p className="text-sm text-stone-400 mb-6">調理記録が保存され、AI献立の精度が上がります📊</p>
            <div className="flex flex-col gap-2">
              <button onClick={handleCooked} className="w-full py-3 bg-green-500 text-white rounded-full text-sm font-medium hover:bg-green-600 transition-colors">
                ✓ はい、作りました！
              </button>
              <button onClick={() => setShowConfirm(false)} className="w-full py-3 border border-stone-200 rounded-full text-stone-600 text-sm hover:bg-stone-50 transition-colors">
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 日付修正モーダル */}
      {showEditDate && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 px-4 pb-4 sm:pb-0">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <p className="text-lg font-medium text-stone-800 mb-1">最終調理日を修正</p>
            <p className="text-sm text-stone-400 mb-4">実際に作った日付に変更できます</p>
            <input
              type="datetime-local"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              max={toLocalDatetime(new Date().toISOString())}
              className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-800 mb-4 focus:outline-none focus:ring-2 focus:ring-stone-300"
            />
            <div className="flex flex-col gap-2">
              <button
                onClick={handleEditDate}
                disabled={loading}
                className="w-full py-3 bg-stone-800 text-white rounded-full text-sm font-medium hover:bg-stone-700 disabled:opacity-50 transition-colors"
              >
                {loading ? '保存中...' : '保存する'}
              </button>
              <button onClick={() => setShowEditDate(false)} className="w-full py-3 border border-stone-200 rounded-full text-stone-600 text-sm hover:bg-stone-50 transition-colors">
                キャンセル
              </button>
            </div>
          </div>
        </div>
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
                  {new Date(log.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
                </li>
              ))}
            </ul>
            <button onClick={() => setShowHistory(false)} className="w-full py-2.5 border border-stone-200 rounded-full text-stone-600 text-sm hover:bg-stone-50 transition-colors">
              閉じる
            </button>
          </div>
        </div>
      )}
    </>
  )
}
