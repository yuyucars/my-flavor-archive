'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError('メール送信に失敗しました。もう一度お試しください。')
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#fdfbf8' }}>
      <div className="w-full max-w-sm space-y-8">

        {/* タイトル */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-light tracking-wide text-stone-800">モンレピ</h1>
          <p className="text-stone-500">あなただけの、とっておきレシピ帳</p>
        </div>

        <div className="w-16 h-px bg-stone-200 mx-auto" />

        {sent ? (
          /* メール送信完了 */
          <div className="text-center space-y-4 bg-white border border-stone-100 rounded-2xl p-8">
            <p className="text-4xl">📬</p>
            <p className="font-medium text-stone-800">メールを送信しました</p>
            <p className="text-sm text-stone-500">
              <span className="font-medium text-stone-700">{email}</span> に<br />
              ログイン用のリンクを送りました。<br />
              メールを確認してリンクをタップしてください。
            </p>
            <button
              onClick={() => { setSent(false); setEmail('') }}
              className="text-sm text-stone-400 hover:text-stone-600 underline"
            >
              メールアドレスを変更する
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* マジックリンク */}
            <form onSubmit={handleMagicLink} className="bg-white border border-stone-100 rounded-2xl p-6 space-y-3">
              <p className="text-sm font-medium text-stone-600">メールアドレスでログイン</p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-300 text-base"
              />
              {error && <p className="text-xs text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full py-2.5 bg-stone-800 text-white rounded-full text-sm font-medium hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '送信中...' : 'ログインリンクを送る'}
              </button>
              <p className="text-xs text-stone-400 text-center">パスワード不要・メールのリンクをタップするだけ</p>
            </form>

            {/* 区切り */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-stone-200" />
              <span className="text-xs text-stone-400">または</span>
              <div className="flex-1 h-px bg-stone-200" />
            </div>

            {/* Google */}
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border border-stone-200 rounded-full shadow-sm hover:shadow-md transition-all text-stone-700 font-medium"
            >
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Googleでログイン
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
