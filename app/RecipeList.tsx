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
  is_favorite: boolean
  created_at: string
}

function daysSince(dateStr: string | null): string {
  if (!dateStr) return '未調理'
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return '今日'
  if (diff === 1) return '昨日'
  return `${diff}日前`
}

let cachedRecipes: Recipe[] | null = null

export default function RecipeList() {
  const [recipes, setRecipes] = useState<Recipe[] | null>(cachedRecipes)
  const [loading, setLoading] = useState(cachedRecipes === null)
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [processing, setProcessing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
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
      fetchRecipes(false)
    } else {
      fetchRecipes(true)
    }
  }, [fetchRecipes])

  const exitSelectMode = () => {
    setSelectMode(false)
    setSelected(new Set())
  }

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (!recipes) return
    if (selected.size === recipes.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(recipes.map(r => r.id)))
    }
  }

  // まとめてお気に入り
  const bulkFavorite = async () => {
    if (selected.size === 0) return
    setProcessing(true)
    const ids = Array.from(selected)
    // 選択中のレシピが全部お気に入り済みなら解除、それ以外は登録
    const allFavorited = ids.every(id => recipes?.find(r => r.id === id)?.is_favorite)
    await supabase
      .from('recipes')
      .update({ is_favorite: !allFavorited })
      .in('id', ids)
    await fetchRecipes(false)
    exitSelectMode()
    setProcessing(false)
  }

  // まとめて削除
  const bulkDelete = async () => {
    if (selected.size === 0) return
    setProcessing(true)
    const ids = Array.from(selected)
    await supabase.from('recipes').delete().in('id', ids)
    cachedRecipes = null
    await fetchRecipes(false)
    setShowDeleteConfirm(false)
    exitSelectMode()
    setProcessing(false)
  }

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

  const allFavoritedInSelection = selected.size > 0 &&
    Array.from(selected).every(id => recipes.find(r => r.id === id)?.is_favorite)

  return (
    <>
      {/* 選択モード切替ヘッダー */}
      <div className="flex items-center justify-between mb-3">
        {selectMode ? (
          <>
            <button
              onClick={toggleSelectAll}
              className="text-sm text-stone-500 hover:text-stone-700"
            >
              {selected.size === recipes.length ? 'すべて解除' : 'すべて選択'}
            </button>
            <span className="text-sm text-stone-400">{selected.size}件選択中</span>
            <button
              onClick={exitSelectMode}
              className="text-sm text-stone-500 hover:text-stone-700"
            >
              キャンセル
            </button>
          </>
        ) : (
          <button
            onClick={() => setSelectMode(true)}
            className="ml-auto text-sm text-stone-400 hover:text-stone-600 transition-colors"
          >
            選択
          </button>
        )}
      </div>

      {/* レシピグリッド */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {recipes.map((recipe) => {
          const isSelected = selected.has(recipe.id)
          return selectMode ? (
            <button
              key={recipe.id}
              onClick={() => toggleSelect(recipe.id)}
              className={`relative text-left bg-white rounded-2xl border overflow-hidden transition-all active:scale-95 ${
                isSelected
                  ? 'border-stone-800 ring-2 ring-stone-800'
                  : 'border-stone-100'
              }`}
            >
              {/* チェックマーク */}
              <div className={`absolute top-2 right-2 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                isSelected
                  ? 'bg-stone-800 border-stone-800'
                  : 'bg-white/80 border-stone-300'
              }`}>
                {isSelected && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" className="w-3.5 h-3.5">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              {recipe.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={recipe.image_url} alt={recipe.title} className="w-full h-36 object-cover" />
              )}
              <div className="p-3 sm:p-5">
                <h2 className="font-medium text-stone-800 line-clamp-2 mb-2 text-sm sm:text-base">
                  {recipe.title}
                </h2>
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span>{daysSince(recipe.last_cooked_at)}</span>
                  {recipe.is_favorite && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-rose-400">
                      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          ) : (
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
                  {recipe.is_favorite && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-rose-400">
                      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                    </svg>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* 選択時のアクションバー */}
      {selectMode && selected.size > 0 && (
        <div className="fixed bottom-20 left-0 right-0 px-4 z-20 md:bottom-4">
          <div className="max-w-sm mx-auto bg-stone-800 rounded-2xl p-3 flex items-center gap-2 shadow-xl">
            <button
              onClick={bulkFavorite}
              disabled={processing}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={allFavoritedInSelection ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-rose-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              {allFavoritedInSelection ? 'お気に入り解除' : 'お気に入り登録'}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={processing}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-500/80 hover:bg-red-500 rounded-xl text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              削除
            </button>
          </div>
        </div>
      )}

      {/* 削除確認モーダル */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <p className="text-lg font-medium text-stone-800 mb-2">
              {selected.size}件のレシピを削除しますか？
            </p>
            <p className="text-sm text-stone-400 mb-6">この操作は取り消せません。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 border border-stone-200 rounded-full text-stone-600 text-sm hover:bg-stone-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={bulkDelete}
                disabled={processing}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {processing ? '削除中...' : '削除する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
