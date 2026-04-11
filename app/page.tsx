import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import RecipeList from './RecipeList'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 pt-4 pb-8 md:pb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-light text-stone-800">レシピ一覧</h1>
          <Link
            href="/recipes/new"
            className="px-5 py-2.5 bg-stone-800 text-white rounded-full text-sm font-medium hover:bg-stone-700 transition-colors"
          >
            + レシピを追加
          </Link>
        </div>
        <RecipeList />
      </main>
    </>
  )
}
