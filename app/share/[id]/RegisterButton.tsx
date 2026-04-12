'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Ingredient = { name: string; amount: string }
type Step = { order: number; description: string }
type Recipe = {
  id: string
  title: string
  image_url: string | null
  genre: string | null
  servings: number | null
  cooking_time: number | null
  ingredients: Ingredient[] | null
  steps: Step[] | null
  source_url: string | null
}

export default function RegisterButton({ recipe }: { recipe: Recipe }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleClick = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push(`/login?next=/share/${recipe.id}`)
      return
    }
    setShowConfirm(true)
  }

  const handleRegister = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from('recipes').insert({
        user_id: user.id,
        title: recipe.title,
        image_url: recipe.image_url,
        genre: recipe.genre,
        servings: recipe.servings,
        cooking_time: recipe.cooking_time,
        ingredients: recipe.ingredients ?? [],
        steps: recipe.steps ?? [],
        source_url: recipe.source_url,
      })

      setDone(true)
      setShowConfirm(false)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="text-center space-y-4">
        <p className="text-4xl">🎉</p>
        <p className="font-medium text-stone-800">登録しました！</p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-2.5 bg-stone-800 text-white rounded-full text-sm font-medium hover:bg-stone-700 transition-colors"
        >
          レシピ一覧を見る
        </button>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="w-full py-3 bg-stone-800 text-white rounded-full font-medium hover:bg-stone-700 transition-colors active:scale-95"
      >
        ✨ Monrepeに登録する
      </button>

      {/* 確認モーダル */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl space-y-4">
            <div>
              <p className="text-lg font-medium text-stone-800 mb-1">このレシピを登録しますか？</p>
              <p className="text-sm text-stone-400">「{recipe.title}」をあなたのMonrepeに追加します。</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 border border-stone-200 rounded-full text-stone-600 text-sm hover:bg-stone-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleRegister}
                disabled={loading}
                className="flex-1 py-2.5 bg-stone-800 text-white rounded-full text-sm font-medium hover:bg-stone-700 disabled:opacity-50 transition-colors"
              >
                {loading ? '登録中...' : '登録する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
