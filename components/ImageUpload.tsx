'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  onUpload: (url: string) => void
  currentUrl?: string
}

export default function ImageUpload({ onUpload, currentUrl }: Props) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string>(currentUrl || '')
  const inputRef = useRef<HTMLInputElement>(null)

  // URL自動抽出などで外部からcurrentUrlが変わったときにプレビューを更新
  useEffect(() => {
    if (currentUrl) setPreview(currentUrl)
  }, [currentUrl])
  const supabase = createClient()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // プレビュー表示
    setPreview(URL.createObjectURL(file))
    setUploading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('未ログイン')

      const ext = file.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`

      const { error } = await supabase.storage
        .from('recipe-images')
        .upload(path, file, { upsert: true })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('recipe-images')
        .getPublicUrl(path)

      onUpload(publicUrl)
    } catch (err) {
      console.error(err)
      setPreview(currentUrl || '')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-stone-600 mb-2">料理の写真</label>
      <div
        onClick={() => inputRef.current?.click()}
        className="relative w-full h-48 border-2 border-dashed border-stone-200 rounded-2xl overflow-hidden cursor-pointer hover:border-stone-300 transition-colors flex items-center justify-center bg-stone-50"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="プレビュー" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center space-y-2">
            <p className="text-3xl">📷</p>
            <p className="text-sm text-stone-400">クリックして写真を選択</p>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <p className="text-sm text-stone-500">アップロード中...</p>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
