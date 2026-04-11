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
  const [localLogs, setLocalLogs] = useState<Log[]>(logs)

  // 削除
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  // 編集
  const [editingLog, setEditingLog] = useState<Log | null>(null)
  const [editDate, setEditDate] = useState('')
  const [editHour, setEditHour] = useState(0)

  const supabase = createClient()
  const router = useRouter()

  const toLocalDate = (iso: string) => {
    const d = new Date(iso)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  }

  const syncLastCooked = async (newLogs: Log[]) => {
    const sorted = [...newLogs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    const newLastCooked = sorted.length > 0 ? sorted[0].created_at : null
    await supabase.from('recipes').update({ last_cooked_at: newLastCooked }).eq('id', recipeId)
  }

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

  const handleDeleteLog = async (logId: string) => {
    setConfirmDeleteId(null)
    setDeletingId(logId)
    await supabase.from('cooking_logs').delete().eq('id', logId)
    const newLogs = localLogs.filter(l => l.id !== logId)
    setLocalLogs(newLogs)
    await syncLastCooked(newLogs)
    setDeletingId(null)
    router.refresh()
  }

  const openEditLog = (log: Log) => {
    setEditingLog(log)
    setEditDate(toLocalDate(log.created_at))
    setEditHour(new Date(log.created_at).getHours())
  }

  const handleEditLog = async () => {
    if (!editingLog) return
    setLoading(true)
    const dt = new Date(`${editDate}T${String(editHour).padStart(2, '0')}:00:00`)
    await supabase.from('cooking_logs').update({ created_at: dt.toISOString() }).eq('id', editingLog.id)
    const newLogs = localLogs.map(l => l.id === editingLog.id ? { ...l, created_at: dt.toISOString() } : l)
    setLocalLogs(newLogs)
    await syncLastCooked(newLogs)
    setEditingLog(null)
    setLoading(false)
    router.refresh()
  }

  const lastCookedLabel = (() => {
    const sorted = [...localLogs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    const latest = sorted[0]?.created_at ?? lastCookedAt
    return latest
      ? new Date(latest).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' })
      : '未調理'
  })()

  return (
    <>
      <div className="space-y-2">
        {/* 調理記録エリア */}
        <div className="flex items-center justify-between bg-stone-50 rounded-2xl px-4 py-3">
          <button
            onClick={() => localLogs.length > 0 && setShowHistory(true)}
            className={localLogs.length > 0 ? 'text-left hover:opacity-70 transition-opacity active:opacity-50' : 'text-left'}
          >
            <p className="text-xs text-stone-400">最終調理日</p>
            <p className="text-sm font-medium text-stone-700 mt-0.5">{lastCookedLabel}</p>
            {localLogs.length > 0 && (
              <p className="text-xs text-stone-400 mt-0.5">🍳 {localLogs.length}回調理済み</p>
            )}
          </button>
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

      {/* 調理履歴モーダル */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 px-4 pb-4 sm:pb-0">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <p className="text-lg font-medium text-stone-800 mb-4">🍳 調理履歴</p>
            {localLogs.length === 0 ? (
              <p className="text-sm text-stone-400 text-center py-4 mb-4">調理記録がありません</p>
            ) : (
              <ul className="space-y-1 max-h-64 overflow-y-auto mb-4">
                {[...localLogs]
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map((log) => (
                    <li key={log.id} className="flex items-center gap-2 py-1.5">
                      {/* 日付＋編集（まとめてタップエリア） */}
                      <button
                        onClick={() => { setShowHistory(false); openEditLog(log) }}
                        className="flex items-center gap-2 flex-1 px-2 py-2 rounded-xl hover:bg-stone-100 active:bg-stone-200 transition-colors text-left"
                      >
                        <span className="w-2 h-2 rounded-full bg-green-300 flex-shrink-0" />
                        <span className="text-sm text-stone-600">
                          {new Date(log.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-stone-300 flex-shrink-0">
                          <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                          <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                        </svg>
                      </button>
                      {/* 削除ボタン（右端に独立） */}
                      <button
                        onClick={() => setConfirmDeleteId(log.id)}
                        disabled={deletingId === log.id}
                        className="p-2.5 text-stone-300 hover:text-red-400 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-40 flex-shrink-0"
                      >
                        {deletingId === log.id ? (
                          <span className="text-xs w-5 h-5 flex items-center justify-center">...</span>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    </li>
                  ))}
              </ul>
            )}
            <button onClick={() => setShowHistory(false)} className="w-full py-2.5 border border-stone-200 rounded-full text-stone-600 text-sm hover:bg-stone-50 transition-colors">
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* 調理日編集モーダル */}
      {editingLog && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 px-4 pb-4 sm:pb-0">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <p className="text-lg font-medium text-stone-800 mb-1">調理日を修正</p>
            <p className="text-sm text-stone-400 mb-4">実際に作った日時に変更できます</p>
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs text-stone-500 mb-1 block">日付</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  max={toLocalDate(new Date().toISOString())}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-300"
                />
              </div>
              <div>
                <label className="text-xs text-stone-500 mb-1 block">時間</label>
                <select
                  value={editHour}
                  onChange={(e) => setEditHour(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-300 bg-white"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{String(i).padStart(2, '0')}時</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleEditLog}
                disabled={loading}
                className="w-full py-3 bg-stone-800 text-white rounded-full text-sm font-medium hover:bg-stone-700 disabled:opacity-50 transition-colors"
              >
                {loading ? '保存中...' : '保存する'}
              </button>
              <button
                onClick={() => { setEditingLog(null); setShowHistory(true) }}
                className="w-full py-3 border border-stone-200 rounded-full text-stone-600 text-sm hover:bg-stone-50 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 調理日削除確認モーダル */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 px-4 pb-4 sm:pb-0">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <p className="text-lg font-medium text-stone-800 mb-1">調理日を削除しますか？</p>
            <p className="text-sm text-stone-400 mb-2">
              {new Date(localLogs.find(l => l.id === confirmDeleteId)?.created_at ?? '').toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-xs text-stone-400 mb-6">この操作は取り消せません。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2.5 border border-stone-200 rounded-full text-stone-600 text-sm hover:bg-stone-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={() => handleDeleteLog(confirmDeleteId)}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600 transition-colors"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
