import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Monrepe',
  description: 'あなただけの、とっておきレシピ帳',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Monrepe',
    statusBarStyle: 'default',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body style={{ backgroundColor: '#fdfbf8', minHeight: '100vh' }}>

{children}
      </body>
    </html>
  )
}
