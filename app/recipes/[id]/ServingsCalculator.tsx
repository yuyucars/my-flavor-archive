'use client'

import { useState } from 'react'

type Ingredient = { name: string; amount: string }

function scaleAmount(amount: string, ratio: number): string {
  if (!amount || ratio === 1) return amount

  // 計算しない単語
  if (/^(少々|適量|適宜|少量|ひとつまみ|少し|お好みで|適当)$/.test(amount.trim())) {
    return amount
  }

  // 分数 例: "1/2カップ", "1/3本"
  const fractionMatch = amount.match(/^(\d+)\/(\d+)(.*)/)
  if (fractionMatch) {
    const num = parseInt(fractionMatch[1]) / parseInt(fractionMatch[2])
    const unit = fractionMatch[3]
    return formatNum(num * ratio) + unit
  }

  // 先頭が数字 例: "200g", "2個", "100ml"
  const startNum = amount.match(/^(\d+\.?\d*)(.*)/)
  if (startNum) {
    const num = parseFloat(startNum[1])
    const unit = startNum[2]
    return formatNum(num * ratio) + unit
  }

  // 途中に数字 例: "大さじ2", "小さじ1.5", "卵2個"
  const midNum = amount.match(/^([^\d]*)(\d+\.?\d*)(.*)/)
  if (midNum) {
    const prefix = midNum[1]
    const num = parseFloat(midNum[2])
    const suffix = midNum[3]
    return prefix + formatNum(num * ratio) + suffix
  }

  return amount
}

function formatNum(n: number): string {
  // きりの良い数字に丸める
  const rounded = Math.round(n * 10) / 10
  if (rounded === Math.floor(rounded)) return String(Math.floor(rounded))
  return String(rounded)
}

export default function ServingsCalculator({
  ingredients,
  baseServings,
}: {
  ingredients: Ingredient[]
  baseServings: number
}) {
  const [selected, setSelected] = useState(baseServings)
  const ratio = selected / baseServings

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-stone-600">材料</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-400">人数：</span>
          <div className="flex items-center gap-1">
            {[1,2,3,4,5,6,7,8].map(n => (
              <button
                key={n}
                onClick={() => setSelected(n)}
                className={`w-7 h-7 rounded-full text-xs font-medium transition-colors ${
                  selected === n
                    ? 'bg-stone-800 text-white'
                    : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {selected !== baseServings && (
        <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-1.5 mb-2">
          基本 {baseServings}人分 → {selected}人分に換算中
        </p>
      )}

      <ul className="divide-y divide-stone-100">
        {ingredients.map((ing, i) => (
          <li key={i} className="flex justify-between gap-4 text-sm py-2.5">
            <span className="text-stone-700 min-w-0">{ing.name}</span>
            <span className="text-stone-400 whitespace-nowrap flex-shrink-0">
              {scaleAmount(ing.amount, ratio)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
