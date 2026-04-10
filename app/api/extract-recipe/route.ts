import Groq from 'groq-sdk'
import { NextResponse } from 'next/server'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

function extractImageUrl(html: string, baseUrl: string): string | null {
  // og:image を優先
  const ogImage = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
    ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
  if (ogImage?.[1]) return toAbsoluteUrl(ogImage[1], baseUrl)

  // twitter:image
  const twitterImage = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)
    ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i)
  if (twitterImage?.[1]) return toAbsoluteUrl(twitterImage[1], baseUrl)

  return null
}

function toAbsoluteUrl(url: string, base: string): string {
  if (url.startsWith('http')) return url
  if (url.startsWith('//')) return 'https:' + url
  try {
    return new URL(url, base).href
  } catch {
    return url
  }
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json()
    if (!url) return NextResponse.json({ error: 'URLが必要です' }, { status: 400 })

    const pageRes = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RecipeBot/1.0)' },
    })
    if (!pageRes.ok) throw new Error('URLの取得に失敗しました')
    const html = await pageRes.text()

    // 画像URLを抽出
    const imageUrl = extractImageUrl(html, url)

    // テキスト抽出
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .slice(0, 8000)

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'あなたはレシピ情報を抽出するアシスタントです。必ずJSON形式のみで返答してください。',
        },
        {
          role: 'user',
          content: `以下はレシピページのテキストです。JSON形式でレシピ情報を抽出してください。

テキスト:
${text}

必ず以下のJSON形式のみで返答してください（\`\`\`json などのコードブロックは不要）:
{
  "title": "料理名",
  "cooking_time": 30,
  "ingredients": [
    { "name": "材料名", "amount": "分量" }
  ],
  "steps": [
    { "order": 1, "description": "手順の説明" }
  ]
}

cooking_timeは調理時間の合計（分単位の整数）です。不明な場合はnullにしてください。`,
        },
      ],
      temperature: 0.1,
    })

    const responseText = completion.choices[0]?.message?.content || ''
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('AIからの応答を解析できませんでした')

    const parsed = JSON.parse(jsonMatch[0])

    // 画像URLをレスポンスに追加
    if (imageUrl) parsed.image_url = imageUrl

    return NextResponse.json(parsed)
  } catch (e: unknown) {
    console.error('[extract-recipe error]', e)
    const message = e instanceof Error ? e.message : '不明なエラー'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
