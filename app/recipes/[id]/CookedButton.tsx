'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function CookedButton({ recipeId }: { recipeId: string }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleCooked = async () => {
    setLoading(true)
    await supabase
      .from('recipes')
      .update({ last_cooked_at: new Date().toISOString() })
      .eq('id', recipeId)
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handleCooked}
      disabled={loading}
      className="flex-shrink-0 px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-full text-sm font-medium hover:bg-green-100 disabled:opacity-50 transition-colors"
    >
      {loading ? '更新中...' : '✓ 今日作った'}
    </button>
  )
}
