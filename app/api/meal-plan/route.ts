import Groq from 'groq-sdk'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

type ConversationMessage = { role: 'user' | 'ai'; content: string }

export async function POST(request: Request) {
  try {
    const { message, history = [] }: { message: string; history: ConversationMessage[] } = await request.json()

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

    // 登録意図の検出
    const isRegisterIntent = /登録して|追加して|保存して|登録したい|追加したい/.test(message)

    // 会話履歴をGroq形式に変換
    const conversationHistory = history.map(m => ({
      role: m.role === 'user' ? 'user' as const : 'assistant' as const,
      content: m.content,
    }))

    // 通常の返答を生成
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `あなたは家庭料理の献立アドバイザーです。ユーザーの登録レシピをもとに、親しみやすい日本語で献立を提案してください。

【登録済みレシピ一覧】
${recipeList}

ルール:
- 登録済みレシピも積極的に提案するが、それ以外の一般的な料理も自由に提案してよい
- ユーザーの気分・食材・時間などの要望を最大限反映する
- 登録済みレシピを提案する場合は「📌 登録済み」とわかるよう示す
- 登録外のレシピを提案する場合は、主な材料と簡単な作り方のポイントを一緒に教える
- ユーザーが「登録して」と言った場合は、直前に提案した料理名を確認して「〇〇をMonrepeに登録します！」と返答する
- 簡潔にわかりやすく提案する
- 絵文字を適度に使って親しみやすくする
- マークダウン記法（**太字**、##見出し、*箇条書きなど）は一切使わないこと
- 通常のテキストと改行のみで返答すること`,
        },
        ...conversationHistory,
        { role: 'user', content: message },
      ],
      temperature: 0.8,
    })

    const suggestion = completion.choices[0]?.message?.content || ''

    // 登録意図がある場合、レシピデータを生成
    if (isRegisterIntent) {
      const recentContext = [...conversationHistory, { role: 'assistant' as const, content: suggestion }]
        .slice(-6)
        .map(m => `${m.role === 'user' ? 'ユーザー' : 'AI'}: ${m.content}`)
        .join('\n')

      const recipeCompletion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `以下の会話からユーザーが登録しようとしている料理を特定し、JSONで返してください。
フィールド: title(string), genre(string: 和食/洋食/中華/イタリアン/アジア料理/その他), servings(number), cooking_time(number: 分), ingredients(array of {name:string, amount:string}), steps(array of {order:number, description:string})
ingredientsとstepsは一般的なレシピをもとに5〜8件程度で生成してください。
JSONのみを返し、それ以外のテキストは含めないでください。`,
          },
          { role: 'user', content: recentContext },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      })

      try {
        const recipeData = JSON.parse(recipeCompletion.choices[0]?.message?.content || '{}')
        return NextResponse.json({ suggestion, registerRecipe: recipeData })
      } catch {
        return NextResponse.json({ suggestion })
      }
    }

    return NextResponse.json({ suggestion })
  } catch (e: unknown) {
    console.error('[meal-plan error]', e)
    const message = e instanceof Error ? e.message : '不明なエラー'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
