import Groq from 'groq-sdk'
import { NextResponse } from 'next/server'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

function extractImageUrl(html: string, baseUrl: string): string | null {
  // 1. og:image を優先
  const ogImage = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
    ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
  if (ogImage?.[1]) return toAbsoluteUrl(ogImage[1], baseUrl)

  // 2. twitter:image
  const twitterImage = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)
    ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i)
  if (twitterImage?.[1]) return toAbsoluteUrl(twitterImage[1], baseUrl)

  // 3. JSON-LD の Recipe スキーマから画像を取得
  const jsonLdMatches = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
  for (const match of jsonLdMatches) {
    try {
      const data = JSON.parse(match[1])
      const entries = Array.isArray(data) ? data : [data]
      for (const entry of entries) {
        const image = entry?.image ?? entry?.['@graph']?.find?.((g: {image?: string}) => g.image)?.image
        if (image) {
          const imgUrl = Array.isArray(image) ? image[0] : (typeof image === 'object' ? image.url : image)
          if (imgUrl) return toAbsoluteUrl(imgUrl, baseUrl)
        }
      }
    } catch { /* ignore */ }
  }

  // 4. ページ内の <img> タグからメインのレシピ画像を探す
  // ロゴ・アイコン・バナー等を除いた最初の大きい画像を取得
  const skipPattern = /logo|icon|banner|sprite|avatar|ad[_-]|header|footer|btn|button|arrow|star|rating/i
  const imgTags = html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)
  for (const match of imgTags) {
    const src = match[1]
    // データURIやSVGをスキップ
    if (src.startsWith('data:') || src.endsWith('.svg') || src.endsWith('.gif')) continue
    // ロゴ・アイコン系をスキップ
    if (skipPattern.test(src) || skipPattern.test(match[0])) continue
    // jpg/jpeg/png/webp のみ対象
    if (!/\.(jpg|jpeg|png|webp)/i.test(src)) continue
    return toAbsoluteUrl(src, baseUrl)
  }

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
  "servings": 2,
  "genre": "和食",
  "ingredients": [
    { "name": "材料名", "amount": "分量" }
  ],
  "steps": [
    { "order": 1, "description": "手順の説明" }
  ]
}

cooking_timeは調理時間の合計（分単位の整数）、servingsは何人分か（整数）です。不明な場合はnullにしてください。
genreは「和食」「洋食」「中華」「イタリアン」「アジア料理」「その他」のいずれかです。判断できない場合はnullにしてください。

【材料抽出の最重要ルール】
レシピには材料グループが存在する場合があります。グループ記号の種類は以下の通りです：
・記号系：「★合わせ調味料」「☆肉下味」「◎たれ」など
・アルファベット系：「(A)」「(B)」「A.」「[A]」「【A】」など
・カタカナ系：「（ア）」「（イ）」など

グループ見出しが現れた場合、そのグループに属する材料すべての名前の先頭に、そのグループの記号を付けてください。

例1：「★合わせ調味料 しょうゆ 大さじ2 みりん 大さじ1」の場合
→ { "name": "★しょうゆ", "amount": "大さじ2" }
→ { "name": "★みりん", "amount": "大さじ1" }

例2：「(A) しょうゆ 大さじ2 みりん 大さじ1」の場合
→ { "name": "(A)しょうゆ", "amount": "大さじ2" }
→ { "name": "(A)みりん", "amount": "大さじ1" }

これにより作り方で「(A)を混ぜ合わせ」「★の材料を加え」と書かれた時に、どの材料か判断できます。
JSON-LDやschema.orgの構造化データではなく、ページの本文テキストを優先して読んでください。
グループ記号は絶対に削除しないでください。`,
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
