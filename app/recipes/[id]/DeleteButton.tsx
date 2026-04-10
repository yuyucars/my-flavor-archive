'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function DeleteButton({ recipeId }: { recipeId: string }) {
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleDelete = async () => {
    setLoading(true)
    await supabase.from('recipes').delete().eq('id', recipeId)
    router.push('/')
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 text-red-400 border border-red-200 rounded-full text-sm hover:bg-red-50 transition-colors"
      >
        削除
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 px-4 pb-4 sm:pb-0">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <p className="text-lg font-medium text-stone-800 mb-2">このレシピを削除しますか？</p>
            <p className="text-sm text-stone-400 mb-6">削除すると元に戻せません。</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleDelete}
                disabled={loading}
                className="w-full py-3 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {loading ? '削除中...' : '削除する'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-3 border border-stone-200 rounded-full text-stone-600 text-sm hover:bg-stone-50 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
