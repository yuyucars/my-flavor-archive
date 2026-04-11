'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function FavoriteButton({
  recipeId,
  initialFavorite,
}: {
  recipeId: string
  initialFavorite: boolean
}) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const toggle = async () => {
    setLoading(true)
    setError('')
    const next = !isFavorite
    const { error: updateError } = await supabase
      .from('recipes')
      .update({ is_favorite: next })
      .eq('id', recipeId)

    if (updateError) {
      console.error(updateError)
      setError('更新に失敗しました')
    } else {
      setIsFavorite(next)
    }
    setLoading(false)
  }

  return (
    <div>
      <button
        onClick={toggle}
        disabled={loading}
        aria-label={isFavorite ? 'お気に入りを解除' : 'お気に入りに追加'}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all active:scale-95 disabled:opacity-50 ${
          isFavorite
            ? 'bg-rose-50 border-rose-200 text-rose-400'
            : 'bg-white border-stone-200 text-stone-300 hover:border-rose-200 hover:text-rose-300'
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="w-4 h-4 transition-all"
          fill={isFavorite ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
        <span>{isFavorite ? 'お気に入り済み' : 'お気に入り'}</span>
      </button>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  )
}
