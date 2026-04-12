import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import RegisterButton from './RegisterButton'

type Recipe = {
  id: string
  title: string
  image_url: string | null
  genre: string | null
  servings: number | null
  cooking_time: number | null
  ingredients: { name: string; amount: string }[] | null
  steps: { order: number; description: string }[] | null
  source_url: string | null
  is_public: boolean
}

function formatCookingTime(minutes: number): string {
  if (minutes < 60) return `${minutes}分`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}時間${m}分` : `${h}時間`
}

export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: recipe } = await supabase
    .from('recipes')
    .select('id, title, image_url, genre, servings, cooking_time, ingredients, steps, source_url, is_public')
    .eq('id', id)
    .eq('is_public', true)
    .single()

  if (!recipe) notFound()
  const r = recipe as Recipe

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#fdfbf8' }}>
      <div className="max-w-2xl mx-auto px-4 py-8 pb-16">

        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-light tracking-wide text-stone-800">Monrepe</h1>
          <p className="text-stone-400 text-xs mt-1">レシピが共有されました</p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden mb-6">
          {r.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={r.image_url} alt={r.title} className="w-full h-56 object-cover" />
          ) : (
            <div className="w-full h-40 bg-stone-100 flex flex-col items-center justify-center gap-1">
              <span className="text-4xl opacity-40">🍽️</span>
            </div>
          )}

          <div className="px-6 py-6 space-y-5">
            <div>
              <h2 className="text-2xl font-light text-stone-800 leading-snug mb-2">{r.title}</h2>
              <div className="flex items-center gap-2 flex-wrap">
                {r.genre && (
                  <span className="px-3 py-1 bg-stone-100 text-stone-500 text-xs rounded-full">{r.genre}</span>
                )}
                {r.servings && (
                  <span className="px-3 py-1 bg-stone-100 text-stone-500 text-xs rounded-full">👤 {r.servings}人分</span>
                )}
                {r.cooking_time && (
                  <span className="px-3 py-1 bg-stone-100 text-stone-500 text-xs rounded-full">⏱ {formatCookingTime(r.cooking_time)}</span>
                )}
              </div>
            </div>

            {/* 材料 */}
            {r.ingredients && r.ingredients.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-stone-600 mb-2">材料</h3>
                <ul className="divide-y divide-stone-100">
                  {r.ingredients.map((ing, i) => (
                    <li key={i} className="flex justify-between py-2 text-sm">
                      <span className="text-stone-700">{ing.name}</span>
                      <span className="text-stone-400">{ing.amount}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 作り方 */}
            {r.steps && r.steps.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-stone-600 mb-2">作り方</h3>
                <ol className="divide-y divide-stone-100">
                  {r.steps.map((step, i) => (
                    <li key={i} className="flex gap-3 py-3">
                      <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-500 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-stone-700 leading-relaxed">{step.description}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* 登録ボタン */}
        <RegisterButton recipe={r} />

        <p className="text-center text-xs text-stone-300 mt-4">
          Monrepeはあなただけのレシピ帳アプリです
        </p>
      </div>
    </main>
  )
}
