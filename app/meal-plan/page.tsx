'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'

export default function MealPlanPage() {
  const [suggestion, setSuggestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    setSuggestion('')
    try {
      const res = await fetch('/api/meal-plan', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '生成に失敗しました')
      setSuggestion(data.suggestion)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '生成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8 pb-8 md:pb-8">
        <div className="mb-8">
          <h1 className="text-2xl font-light text-stone-800">AI献立提案</h1>
          <p className="text-stone-400 text-sm mt-1">
            しばらく作っていない料理を中心に、今週の献立を提案します
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 p-6">
          <div className="flex items-start gap-4 mb-6">
            <span className="text-3xl">🤖</span>
            <div>
              <p className="font-medium text-stone-700">AIが献立を考えます</p>
              <p className="text-sm text-stone-400 mt-1">
                登録済みのレシピと最終調理日をもとに、バランスの良い献立を提案します。
                「しばらく作っていない料理」を優先的に提案するので、毎回新鮮な献立が楽しめます。
              </p>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3 bg-stone-800 text-white rounded-full font-medium hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '献立を考えています...' : '✨ 今週の献立を提案してもらう'}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          {suggestion && (
            <div className="mt-6 pt-6 border-t border-stone-100">
              <div className="prose prose-stone prose-sm max-w-none">
                {suggestion.split('\n').map((line, i) => {
                  if (line.startsWith('## ')) {
                    return <h2 key={i} className="text-base font-medium text-stone-800 mt-4 mb-3">{line.replace('## ', '')}</h2>
                  }
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <p key={i} className="font-medium text-stone-700 mt-3">{line.replace(/\*\*/g, '')}</p>
                  }
                  if (line.startsWith('→')) {
                    return <p key={i} className="text-stone-500 text-sm ml-3">{line}</p>
                  }
                  if (line.trim() === '') return <div key={i} className="h-1" />
                  return <p key={i} className="text-stone-600 text-sm">{line}</p>
                })}
              </div>
              <button
                onClick={handleGenerate}
                className="mt-4 text-sm text-stone-400 hover:text-stone-600 transition-colors"
              >
                🔄 もう一度提案してもらう
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
