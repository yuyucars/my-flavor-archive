'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Recipe = {
  id: string
  title: string
  source_url: string | null
  last_cooked_at: string | null
  image_url: string | null
  created_at: string
}

function daysSince(dateStr: string | null): string {
  if (!dateStr) return '未調理'
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return '今日'
  if (diff === 1) return '昨日'
  return `${diff}日前`
}

// メモリキャッシュ（ページ遷移後も保持）
let cachedRecipes: Recipe[] | null = null

export default function RecipeList() {
  const [recipes, setRecipes] = useState<Recipe[] | null>(cachedRecipes)
  const [loading, setLoading] = useState(cachedRecipes === null)
  const supabase = createClient()

  const fetchRecipes = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true)
    const { data } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) {
      cachedRecipes = data as Recipe[]
      setRecipes(cachedRecipes)
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    if (cachedRecipes) {
      // キャッシュがあれば即表示 → 裏で最新データを取得
      fetchRecipes(false)
    } else {
      fetchRecipes(true)
    }
  }, [fetchRecipes])

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
            <div className="h-36 bg-stone-100 animate-pulse" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-stone-100 rounded animate-pulse" />
              <div className="h-3 w-2/3 bg-stone-100 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!recipes || recipes.length === 0) {
    return (
      <div className="text-center py-24 space-y-4">
        <p className="text-5xl">🍳</p>
        <p className="text-stone-500">まだレシピがありません</p>
        <p className="text-stone-400 text-sm">URLを貼るだけでAIがレシピを自動登録します</p>
        <Link
          href="/recipes/new"
          className="inline-block mt-2 px-6 py-2.5 bg-stone-800 text-white rounded-full text-sm hover:bg-stone-700 transition-colors"
        >
          はじめてのレシピを追加
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      {recipes.map((recipe) => (
        <Link
          key={recipe.id}
          href={`/recipes/${recipe.id}`}
          className="group bg-white rounded-2xl border border-stone-100 overflow-hidden hover:shadow-md hover:border-stone-200 transition-all active:scale-95 active:opacity-70"
        >
          {recipe.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={recipe.image_url} alt={recipe.title} className="w-full h-36 object-cover" />
          )}
          <div className="p-3 sm:p-5">
            <h2 className="font-medium text-stone-800 group-hover:text-stone-600 transition-colors line-clamp-2 mb-2 text-sm sm:text-base">
              {recipe.title}
            </h2>
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span>{daysSince(recipe.last_cooked_at)}</span>
              {recipe.source_url && (
                <span className="bg-stone-50 px-1.5 py-0.5 rounded-full">URL</span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
