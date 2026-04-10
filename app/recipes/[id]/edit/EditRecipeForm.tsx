'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ImageUpload from '@/components/ImageUpload'

type Ingredient = { name: string; amount: string }
type Step = { order: number; description: string }
type Recipe = {
  id: string
  title: string
  source_url: string | null
  image_url: string | null
  ingredients: Ingredient[] | null
  steps: Step[] | null
}

export default function EditRecipeForm({ recipe }: { recipe: Recipe }) {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState(recipe.title)
  const [sourceUrl, setSourceUrl] = useState(recipe.source_url ?? '')
  const [imageUrl, setImageUrl] = useState(recipe.image_url ?? '')
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    recipe.ingredients?.length ? recipe.ingredients : [{ name: '', amount: '' }]
  )
  const [steps, setSteps] = useState<Step[]>(
    recipe.steps?.length ? recipe.steps : [{ order: 1, description: '' }]
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    setError('')
    try {
      const { error: updateError } = await supabase
        .from('recipes')
        .update({
          title: title.trim(),
          source_url: sourceUrl.trim() || null,
          image_url: imageUrl || null,
          ingredients: ingredients.filter(i => i.name.trim()),
          steps: steps.filter(s => s.description.trim()),
        })
        .eq('id', recipe.id)

      if (updateError) throw updateError
      router.push(`/recipes/${recipe.id}`)
      router.refresh()
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
  const removeStep = (i: number) =>
    setSteps(steps.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, order: idx + 1 })))

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600">{error}</div>
      )}

      {/* 画像 */}
      <ImageUpload onUpload={setImageUrl} currentUrl={imageUrl} />

      {/* タイトル */}
      <div>
        <label className="block text-sm font-medium text-stone-600 mb-1">料理名 *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-300"
        />
      </div>

      {/* レシピ元URL */}
      <div>
        <label className="block text-sm font-medium text-stone-600 mb-1">レシピ元URL</label>
        <input
          type="url"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          placeholder="https://..."
          className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-300"
        />
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
                className="flex-1 px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-300"
              />
              <input
                type="text"
                value={ing.amount}
                onChange={(e) => updateIngredient(i, 'amount', e.target.value)}
                placeholder="分量"
                className="w-28 px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-300"
              />
              <button
                type="button"
                onClick={() => removeIngredient(i)}
                className="text-stone-300 hover:text-red-400 transition-colors text-lg leading-none"
              >×</button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addIngredient} className="mt-2 text-sm text-stone-400 hover:text-stone-600 transition-colors">
          + 材料を追加
        </button>
      </div>

      {/* 作り方 */}
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
                className="flex-1 px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-300 resize-none"
              />
              <button
                type="button"
                onClick={() => removeStep(i)}
                className="text-stone-300 hover:text-red-400 transition-colors text-lg leading-none mt-2.5"
              >×</button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addStep} className="mt-2 text-sm text-stone-400 hover:text-stone-600 transition-colors">
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
  )
}
