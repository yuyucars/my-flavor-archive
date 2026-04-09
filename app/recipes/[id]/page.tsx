import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import CookedButton from './CookedButton'
import DeleteButton from './DeleteButton'

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

export default async function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: recipe } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!recipe) notFound()

  const r = recipe as Recipe

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8 pb-8 md:pb-8">
        <Link href="/" className="text-stone-400 text-sm hover:text-stone-600 transition-colors mb-6 inline-block">
          ← レシピ一覧に戻る
        </Link>

        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden space-y-6">
          {r.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={r.image_url} alt={r.title} className="w-full h-56 object-cover" />
          )}
          <div className="px-6 pb-6 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-light text-stone-800 leading-snug">{r.title}</h1>
            <div className="flex items-center gap-2 flex-shrink-0">
            <CookedButton recipeId={r.id} />
            <DeleteButton recipeId={r.id} />
          </div>
          </div>

          {r.last_cooked_at && (
            <p className="text-xs text-stone-400">
              最終調理: {new Date(r.last_cooked_at).toLocaleDateString('ja-JP')}
            </p>
          )}

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

          {r.ingredients && r.ingredients.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-stone-600 mb-3">材料</h2>
              <ul className="space-y-1.5">
                {r.ingredients.map((ing, i) => (
                  <li key={i} className="flex justify-between text-sm">
                    <span className="text-stone-700">{ing.name}</span>
                    <span className="text-stone-400">{ing.amount}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {r.steps && r.steps.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-stone-600 mb-3">作り方</h2>
              <ol className="space-y-3">
                {r.steps.map((step, i) => (
                  <li key={i} className="flex gap-3">
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
      </main>
    </>
  )
}
