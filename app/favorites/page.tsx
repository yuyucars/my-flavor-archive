import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import RecipeList from '../RecipeList'

export default async function FavoritesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 pt-4 pb-8 md:pb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-light text-stone-800">お気に入り</h1>
        </div>
        <RecipeList favoritesOnly />
      </main>
    </>
  )
}
