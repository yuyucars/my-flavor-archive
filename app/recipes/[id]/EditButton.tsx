import Link from 'next/link'

export default function EditButton({ recipeId }: { recipeId: string }) {
  return (
    <Link
      href={`/recipes/${recipeId}/edit`}
      className="px-4 py-2 bg-stone-500 text-white rounded-full text-sm hover:bg-stone-600 transition-colors"
    >
      編集
    </Link>
  )
}
