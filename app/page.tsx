import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

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

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: recipes } = await supabase
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-light text-stone-800">レシピ一覧</h1>
            <p className="text-stone-400 text-sm mt-1">{recipes?.length ?? 0}件のレシピ</p>
          </div>
          <Link
            href="/recipes/new"
            className="px-5 py-2.5 bg-stone-800 text-white rounded-full text-sm font-medium hover:bg-stone-700 transition-colors"
          >
            + レシピを追加
          </Link>
        </div>

        {!recipes || recipes.length === 0 ? (
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
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(recipes as Recipe[]).map((recipe) => (
              <Link
                key={recipe.id}
                href={`/recipes/${recipe.id}`}
                className="group bg-white rounded-2xl border border-stone-100 overflow-hidden hover:shadow-md hover:border-stone-200 transition-all"
              >
                {recipe.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={recipe.image_url} alt={recipe.title} className="w-full h-36 object-cover" />
                )}
                <div className="p-5">
                  <h2 className="font-medium text-stone-800 group-hover:text-stone-600 transition-colors line-clamp-2 mb-3">
                    {recipe.title}
                  </h2>
                  <div className="flex items-center justify-between text-xs text-stone-400">
                    <span>最終調理: {daysSince(recipe.last_cooked_at)}</span>
                    {recipe.source_url && (
                      <span className="bg-stone-50 px-2 py-0.5 rounded-full">URL元</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
