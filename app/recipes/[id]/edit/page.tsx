import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import EditRecipeForm from './EditRecipeForm'

export default async function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
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

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8 pb-32 md:pb-12">
        <h1 className="text-2xl font-light text-stone-800 mb-8">レシピを編集</h1>
        <EditRecipeForm recipe={recipe} />
      </main>
    </>
  )
}
