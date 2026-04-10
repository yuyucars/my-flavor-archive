import Link from 'next/link'

export default function EditButton({ recipeId }: { recipeId: string }) {
  return (
    <Link
      href={`/recipes/${recipeId}/edit`}
      className="px-4 py-2 text-stone-500 border border-stone-200 rounded-full text-sm hover:bg-stone-50 transition-colors"
    >
      編集
    </Link>
  )
}
