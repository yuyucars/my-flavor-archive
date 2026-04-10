'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import ImageUpload from '@/components/ImageUpload'

type Ingredient = { name: string; amount: string }
type Step = { order: number; description: string }

export default function NewRecipePage() {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [cookingTime, setCookingTime] = useState<string>('')
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', amount: '' }])
  const [steps, setSteps] = useState<Step[]>([{ order: 1, description: '' }])
  const [loading, setLoading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState('')

  const handleExtract = async () => {
    if (!sourceUrl.trim()) return
    setExtracting(true)
    setError('')
    try {
      const res = await fetch('/api/extract-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: sourceUrl }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '抽出に失敗しました')
      if (data.title) setTitle(data.title)
      if (data.cooking_time) setCookingTime(String(data.cooking_time))
      if (data.ingredients?.length) setIngredients(data.ingredients)
      if (data.steps?.length) setSteps(data.steps)
      if (data.image_url) setImageUrl(data.image_url)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '抽出に失敗しました')
    } finally {
      setExtracting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('ログインが必要です')

      const { error: insertError } = await supabase.from('recipes').insert({
        user_id: user.id,
        title: title.trim(),
        source_url: sourceUrl.trim() || null,
        cooking_time: cookingTime ? parseInt(cookingTime) : null,
        ingredients: ingredients.filter(i => i.name.trim()),
        steps: steps.filter(s => s.description.trim()),
        image_url: imageUrl || null,
      })
      if (insertError) throw insertError
      router.push('/')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const addIngredient = () => setIngredients([...ingredients, { name: '', amount: '' }])
  const updateIngredient = (i: number, field: keyof Ingredient, value: string) => {
    const next = [...ingredients]
    next[i] = { ...next[i], [field]: value }
    setIngredients(next)
  }
  const removeIngredient = (i: number) => setIngredients(ingredients.filter((_, idx) => idx !== i))

  const addStep = () => setSteps([...steps, { order: steps.length + 1, description: '' }])
  const updateStep = (i: number, value: string) => {
    const next = [...steps]
    next[i] = { ...next[i], description: value }
    setSteps(next)
  }
  const removeStep = (i: number) => setSteps(steps.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, order: idx + 1 })))

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8 pb-32 md:pb-12">
        <h1 className="text-2xl font-light text-stone-800 mb-8">レシピを追加</h1>

        {/* URL自動抽出セクション */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-8">
          <p className="text-sm font-medium text-amber-800 mb-1">✨ URLから自動入力</p>
          <p className="text-xs text-amber-600 mb-3">レシピサイトのURLを貼り付けると、AIが材料・工程を自動で読み取ります</p>
          <div className="flex gap-2">
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://..."
              className="flex-1 px-3 py-2 bg-white border border-amber-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-amber-300 text-stone-700"
            />
            <button
              type="button"
              onClick={handleExtract}
              disabled={extracting || !sourceUrl.trim()}
              className="px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              {extracting ? '読み取り中...' : 'AI自動入力'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-6 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 画像 */}
          <ImageUpload onUpload={setImageUrl} currentUrl={imageUrl} />

          {/* タイトル */}
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">料理名 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例：鶏の唐揚げ"
              required
              className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-300"
            />
          </div>

          {/* 調理時間 */}
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">調理時間（分）</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={cookingTime}
                onChange={(e) => setCookingTime(e.target.value)}
                placeholder="例：30"
                min="1"
                className="w-32 px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-300"
              />
              <span className="text-sm text-stone-400">分</span>
            </div>
          </div>

          {/* 材料 */}
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-2">材料</label>
            <div className="space-y-2">
              {ingredients.map((ing, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={ing.name}
                    onChange={(e) => updateIngredient(i, 'name', e.target.value)}
                    placeholder="材料名"
                    className="flex-1 px-3 py-2 bg-white border border-stone-200 rounded-xl text-base text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-300"
                  />
                  <input
                    type="text"
                    value={ing.amount}
                    onChange={(e) => updateIngredient(i, 'amount', e.target.value)}
                    placeholder="分量"
                    className="w-28 px-3 py-2 bg-white border border-stone-200 rounded-xl text-base text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-300"
                  />
                  <button
                    type="button"
                    onClick={() => removeIngredient(i)}
                    className="text-stone-300 hover:text-red-400 transition-colors text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addIngredient}
              className="mt-2 text-sm text-stone-400 hover:text-stone-600 transition-colors"
            >
              + 材料を追加
            </button>
          </div>

          {/* 工程 */}
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-2">作り方</label>
            <div className="space-y-2">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-500 text-xs flex items-center justify-center mt-2.5 flex-shrink-0">
                    {i + 1}
                  </span>
                  <textarea
                    value={step.description}
                    onChange={(e) => updateStep(i, e.target.value)}
                    placeholder={`手順 ${i + 1}`}
                    rows={2}
                    className="flex-1 px-3 py-2 bg-white border border-stone-200 rounded-xl text-base text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-300 resize-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeStep(i)}
                    className="text-stone-300 hover:text-red-400 transition-colors text-lg leading-none mt-2.5"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addStep}
              className="mt-2 text-sm text-stone-400 hover:text-stone-600 transition-colors"
            >
              + 手順を追加
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-2.5 border border-stone-200 rounded-full text-stone-500 text-sm hover:bg-stone-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="flex-1 py-2.5 bg-stone-800 text-white rounded-full text-sm font-medium hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '保存中...' : '保存する'}
            </button>
          </div>
        </form>
      </main>
    </>
  )
}
