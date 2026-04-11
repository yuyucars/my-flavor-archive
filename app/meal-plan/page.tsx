'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'

type Ingredient = { name: string; amount: string }
type Step = { order: number; description: string }
type RegisterRecipe = {
  title: string
  genre: string
  servings: number
  cooking_time: number
  ingredients: Ingredient[]
  steps: Step[]
}

type Message = {
  role: 'user' | 'ai'
  content: string
  registerRecipe?: RegisterRecipe
}

const SUGGESTIONS = [
  '今日は疲れてるので簡単なものがいい',
  '鶏肉を使いたい',
  '今週作っていない料理を提案して',
  '野菜たっぷりのメニューがいい',
  '30分以内で作れるものは？',
]

export default function MealPlanPage() {
  const router = useRouter()
  const supabase = createClient()

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content: 'こんにちは！今日の献立を一緒に考えましょう😊\n\n気分・使いたい食材・時間など、なんでも話しかけてください。登録済みレシピはもちろん、新しいメニューも幅広く提案します！\n\n気に入ったレシピは「登録して」と言うとMonrepeに追加できます🍳',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [savingRecipe, setSavingRecipe] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // キーボード表示時に入力欄がキーボードの上に来るよう調整（iOS対応）
  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return

    const handleViewportChange = () => {
      const el = inputAreaRef.current
      if (!el) return
      const offsetFromBottom = window.innerHeight - viewport.height - viewport.offsetTop
      el.style.bottom = `${Math.max(offsetFromBottom, 64)}px`
    }

    viewport.addEventListener('resize', handleViewportChange)
    viewport.addEventListener('scroll', handleViewportChange)

    return () => {
      viewport.removeEventListener('resize', handleViewportChange)
      viewport.removeEventListener('scroll', handleViewportChange)
    }
  }, [])

  const sendMessage = async (text?: string) => {
    const userMessage = text ?? input.trim()
    if (!userMessage || loading) return

    setInput('')
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const res = await fetch('/api/meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'エラーが発生しました')
      setMessages(prev => [...prev, {
        role: 'ai',
        content: data.suggestion,
        registerRecipe: data.registerRecipe,
      }])
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'エラーが発生しました'
      setMessages(prev => [...prev, { role: 'ai', content: `⚠️ ${msg}` }])
    } finally {
      setLoading(false)
    }
  }

  const saveRecipe = async (recipe: RegisterRecipe, messageIndex: number) => {
    setSavingRecipe(`${messageIndex}`)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('ログインが必要です')

      const { data, error } = await supabase.from('recipes').insert({
        user_id: user.id,
        title: recipe.title,
        genre: recipe.genre || null,
        servings: recipe.servings || 2,
        cooking_time: recipe.cooking_time || null,
        ingredients: recipe.ingredients || [],
        steps: recipe.steps || [],
      }).select('id').single()

      if (error) throw error

      // 保存済みに更新
      setMessages(prev => prev.map((m, i) =>
        i === messageIndex ? { ...m, registerRecipe: undefined, savedRecipeId: data.id } : m
      ) as Message[])

      // 成功メッセージ追加
      setMessages(prev => [...prev, {
        role: 'ai',
        content: `✅ 「${recipe.title}」をMonrepeに登録しました！\nレシピ一覧から確認・編集できます。`,
      }])

      router.refresh()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '保存に失敗しました'
      setMessages(prev => [...prev, { role: 'ai', content: `⚠️ 保存失敗: ${msg}` }])
    } finally {
      setSavingRecipe(null)
    }
  }

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-4 pb-40 md:pb-12 flex flex-col" style={{ minHeight: 'calc(100vh - 112px)' }}>
        <h1 className="text-xl font-light text-stone-800 mb-4">AI献立提案</h1>

        {/* チャット履歴 */}
        <div className="flex-1 space-y-4 mb-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'ai' && (
                <span className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-1">🤖</span>
              )}
              <div className="max-w-[80%] space-y-2">
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-stone-800 text-white rounded-tr-sm'
                      : 'bg-white border border-stone-100 text-stone-700 rounded-tl-sm'
                  }`}
                >
                  {msg.content.split(/(https?:\/\/[^\s]+)/g).map((part, j) =>
                    /^https?:\/\//.test(part) ? (
                      <button
                        key={j}
                        onClick={() => window.open(part, '_blank', 'noopener,noreferrer')}
                        className={`underline break-all text-left ${msg.role === 'user' ? 'text-stone-300' : 'text-blue-500'}`}
                      >
                        {part}
                      </button>
                    ) : (
                      <span key={j} className="whitespace-pre-wrap">{part}</span>
                    )
                  )}
                </div>

                {/* レシピ登録カード */}
                {msg.registerRecipe && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
                    <div>
                      <p className="text-xs text-amber-600 font-medium mb-1">📋 登録内容</p>
                      <p className="font-semibold text-stone-800">{msg.registerRecipe.title}</p>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        {msg.registerRecipe.genre && (
                          <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">{msg.registerRecipe.genre}</span>
                        )}
                        {msg.registerRecipe.servings && (
                          <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">{msg.registerRecipe.servings}人分</span>
                        )}
                        {msg.registerRecipe.cooking_time && (
                          <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">約{msg.registerRecipe.cooking_time}分</span>
                        )}
                      </div>
                    </div>
                    {msg.registerRecipe.ingredients?.length > 0 && (
                      <div>
                        <p className="text-xs text-stone-400 mb-1">材料</p>
                        <p className="text-xs text-stone-600">
                          {msg.registerRecipe.ingredients.slice(0, 5).map(ing => ing.name).join('、')}
                          {msg.registerRecipe.ingredients.length > 5 ? '…' : ''}
                        </p>
                      </div>
                    )}
                    <button
                      onClick={() => saveRecipe(msg.registerRecipe!, i)}
                      disabled={savingRecipe === `${i}`}
                      className="w-full py-2.5 bg-stone-800 text-white rounded-full text-sm font-medium hover:bg-stone-700 disabled:opacity-50 transition-colors"
                    >
                      {savingRecipe === `${i}` ? '登録中...' : '✨ Monrepeに登録する'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <span className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-sm mr-2 flex-shrink-0">🤖</span>
              <div className="bg-white border border-stone-100 rounded-2xl rounded-tl-sm px-4 py-3">
                <span className="flex gap-1">
                  <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* 定型文ボタン（最初のみ表示） */}
        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="px-3 py-1.5 bg-white border border-stone-200 rounded-full text-xs text-stone-600 hover:bg-stone-50 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* 入力欄（固定） */}
        <div ref={inputAreaRef} className="fixed bottom-16 left-0 right-0 md:relative md:bottom-auto bg-white/90 backdrop-blur-sm border-t border-stone-100 md:border-0 px-4 py-3 md:p-0">
          <div className="max-w-2xl mx-auto flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="食材・気分・時間などを入力..."
              className="flex-1 px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-full text-base text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-300"
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="px-4 py-2.5 bg-stone-800 text-white rounded-full text-sm font-medium hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              送信
            </button>
          </div>
        </div>
      </main>
    </>
  )
}
