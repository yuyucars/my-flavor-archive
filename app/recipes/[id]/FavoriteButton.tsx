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
  const supabase = createClient()

  const toggle = async () => {
    setLoading(true)
    const next = !isFavorite
    const { error } = await supabase
      .from('recipes')
      .update({ is_favorite: next })
      .eq('id', recipeId)

    if (!error) setIsFavorite(next)
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all active:scale-95 ${
        isFavorite
          ? 'bg-amber-50 border-amber-200 text-amber-500'
          : 'bg-white border-stone-200 text-stone-400 hover:border-stone-300'
      }`}
    >
      <span className="text-base">{isFavorite ? '⭐' : '☆'}</span>
      <span>{isFavorite ? 'お気に入り済み' : 'お気に入り'}</span>
    </button>
  )
}
