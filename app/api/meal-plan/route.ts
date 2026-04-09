import Groq from 'groq-sdk'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: '未認証' }, { status: 401 })

    const { data: recipes } = await supabase
      .from('recipes')
      .select('id, title, last_cooked_at')
      .order('last_cooked_at', { ascending: true, nullsFirst: true })

    if (!recipes || recipes.length === 0) {
      return NextResponse.json({ error: 'レシピが登録されていません' }, { status: 400 })
    }

    const recipeList = recipes.map((r) => {
      const daysAgo = r.last_cooked_at
        ? Math.floor((Date.now() - new Date(r.last_cooked_at).getTime()) / (1000 * 60 * 60 * 24))
        : null
      return `- ${r.title}（最終調理: ${daysAgo !== null ? `${daysAgo}日前` : '未調理'}）`
    }).join('\n')

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'あなたは家庭料理の献立アドバイザーです。親しみやすい日本語で回答してください。',
        },
        {
          role: 'user',
          content: `以下はユーザーが登録しているレシピ一覧と最終調理日です。
しばらく作っていない料理を中心に、今週の献立（3〜5日分）を提案してください。
理由も一緒に教えてください。

レシピ一覧:
${recipeList}

提案フォーマット:
## 今週のおすすめ献立

**月曜日**: [料理名]
→ [理由]

（以降同様に）

最後に一言コメントをお願いします。`,
        },
      ],
      temperature: 0.7,
    })

    const suggestion = completion.choices[0]?.message?.content || ''
    return NextResponse.json({ suggestion })
  } catch (e: unknown) {
    console.error('[meal-plan error]', e)
    const message = e instanceof Error ? e.message : '不明なエラー'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
