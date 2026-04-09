import Groq from 'groq-sdk'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request: Request) {
  try {
    const { message } = await request.json()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: '未認証' }, { status: 401 })

    const { data: recipes } = await supabase
      .from('recipes')
      .select('id, title, last_cooked_at, ingredients')
      .order('last_cooked_at', { ascending: true, nullsFirst: true })

    const recipeList = recipes && recipes.length > 0
      ? recipes.map((r) => {
          const daysAgo = r.last_cooked_at
            ? Math.floor((Date.now() - new Date(r.last_cooked_at).getTime()) / (1000 * 60 * 60 * 24))
            : null
          const ingredientNames = Array.isArray(r.ingredients)
            ? r.ingredients.map((i: { name: string }) => i.name).join('、')
            : ''
          return `- ${r.title}（最終調理: ${daysAgo !== null ? `${daysAgo}日前` : '未調理'}${ingredientNames ? `、材料: ${ingredientNames}` : ''}）`
        }).join('\n')
      : 'レシピが登録されていません'

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `あなたは家庭料理の献立アドバイザーです。ユーザーの登録レシピをもとに、親しみやすい日本語で献立を提案してください。

【登録済みレシピ一覧】
${recipeList}

ルール:
- 登録済みレシピから提案を優先する
- ユーザーの気分・食材・時間などの要望を最大限反映する
- 簡潔にわかりやすく提案する
- 絵文字を適度に使って親しみやすくする`,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: 0.8,
    })

    const suggestion = completion.choices[0]?.message?.content || ''
    return NextResponse.json({ suggestion })
  } catch (e: unknown) {
    console.error('[meal-plan error]', e)
    const message = e instanceof Error ? e.message : '不明なエラー'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
