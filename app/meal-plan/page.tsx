'use client'

import { useState, useRef, useEffect } from 'react'
import Navbar from '@/components/Navbar'

type Message = {
  role: 'user' | 'ai'
  content: string
}

const SUGGESTIONS = [
  '今日は疲れてるので簡単なものがいい',
  '鶏肉を使いたい',
  '今週作っていない料理を提案して',
  '野菜たっぷりのメニューがいい',
  '30分以内で作れるものは？',
]

export default function MealPlanPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content: 'こんにちは！今日の献立を一緒に考えましょう😊\n\n気分・使いたい食材・時間など、なんでも話しかけてください。登録済みのレシピをもとにおすすめを提案します！',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text?: string) => {
    const userMessage = text ?? input.trim()
    if (!userMessage || loading) return

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const res = await fetch('/api/meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'エラーが発生しました')
      setMessages((prev) => [...prev, { role: 'ai', content: data.suggestion }])
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'エラーが発生しました'
      setMessages((prev) => [...prev, { role: 'ai', content: `⚠️ ${msg}` }])
    } finally {
      setLoading(false)
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
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-stone-800 text-white rounded-tr-sm'
                    : 'bg-white border border-stone-100 text-stone-700 rounded-tl-sm'
                }`}
              >
                {msg.content}
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
        <div className="fixed bottom-16 left-0 right-0 md:relative md:bottom-auto bg-white/90 backdrop-blur-sm border-t border-stone-100 md:border-0 px-4 py-3 md:p-0">
          <div className="max-w-2xl mx-auto flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="食材・気分・時間などを入力..."
              className="flex-1 px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-full text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-300"
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
