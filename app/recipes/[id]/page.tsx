import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import CookedButton from './CookedButton'
import DeleteButton from './DeleteButton'
import EditButton from './EditButton'

type Recipe = {
  id: string
  title: string
  source_url: string | null
  last_cooked_at: string | null
  image_url: string | null
  ingredients: { name: string; amount: string }[] | null
  steps: { order: number; description: string }[] | null
  created_at: string
}

type CookingLog = {
  id: string
  created_at: string
}

export default async function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: recipe }, { data: logs }] = await Promise.all([
    supabase.from('recipes').select('*').eq('id', id).eq('user_id', user.id).single(),
    supabase.from('cooking_logs').select('id, created_at').eq('recipe_id', id).order('created_at', { ascending: false }),
  ])

  if (!recipe) notFound()

  const r = recipe as Recipe
  const cookingLogs = (logs ?? []) as CookingLog[]

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8 pb-32 md:pb-12">
        <Link href="/" className="text-stone-400 text-sm hover:text-stone-600 transition-colors mb-6 inline-block">
          ← レシピ一覧に戻る
        </Link>

        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
          {r.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={r.image_url} alt={r.title} className="w-full h-56 object-cover" />
          )}
          <div className="px-6 pt-6 pb-6 space-y-5">

            {/* タイトルとボタン */}
            <div className="space-y-3">
              <h1 className="text-2xl font-light text-stone-800 leading-snug">{r.title}</h1>
              <div className="flex items-center gap-2">
                <EditButton recipeId={r.id} />
                <DeleteButton recipeId={r.id} />
              </div>
            </div>

            {/* レシピ元 */}
            {r.source_url && (
              <a
                href={r.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600 transition-colors"
              >
                🔗 レシピ元を見る
              </a>
            )}

            {/* 材料 */}
            {r.ingredients && r.ingredients.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-stone-600 mb-2">材料</h2>
                <ul className="divide-y divide-stone-100">
                  {r.ingredients.map((ing, i) => (
                    <li key={i} className="flex justify-between gap-4 text-sm py-2.5">
                      <span className="text-stone-700 min-w-0">{ing.name}</span>
                      <span className="text-stone-400 whitespace-nowrap flex-shrink-0">{ing.amount}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 作り方 */}
            {r.steps && r.steps.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-stone-600 mb-2">作り方</h2>
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

            {/* 調理記録エリア（一番下） */}
            <div className="pt-2 border-t border-stone-100">
              <CookedButton recipeId={r.id} logs={cookingLogs} lastCookedAt={r.last_cooked_at} />
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
