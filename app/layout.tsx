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

        {/* スプラッシュ画面（サーバーレンダリング：JS読み込み前から即表示） */}
        <div
          id="monrepe-splash"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            backgroundColor: '#fdfbf8',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            transition: 'opacity 0.4s ease-out',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 300, letterSpacing: '0.05em', color: '#292524', margin: 0 }}>
              Monrepe
            </h1>
            <p style={{ color: '#a8a29e', fontSize: '0.875rem', marginTop: '8px' }}>
              ようこそ、Monrepeへ
            </p>
          </div>
          <div style={{ width: '64px', height: '1px', backgroundColor: '#e7e5e4' }} />
          <div style={{ display: 'flex', gap: '8px' }}>
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#d6d3d1',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: `bounce 1s ${delay}ms infinite`,
                }}
              />
            ))}
          </div>
          <p style={{ color: '#d6d3d1', fontSize: '0.75rem' }}>準備中...</p>
        </div>

        {/* アニメーション定義 + スプラッシュ制御スクリプト（同期実行） */}
        <style>{`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }
        `}</style>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var el = document.getElementById('monrepe-splash');
                if (!el) return;
                if (sessionStorage.getItem('monrepe-splash-shown')) {
                  el.style.display = 'none';
                  return;
                }
                var startTime = Date.now();
                function hide() {
                  var elapsed = Date.now() - startTime;
                  var wait = Math.max(0, 800 - elapsed);
                  setTimeout(function() {
                    el.style.opacity = '0';
                    setTimeout(function() {
                      el.style.display = 'none';
                      sessionStorage.setItem('monrepe-splash-shown', '1');
                    }, 400);
                  }, wait);
                }
                if (document.readyState === 'complete') {
                  hide();
                } else {
                  window.addEventListener('load', hide, { once: true });
                }
              })();
            `,
          }}
        />

        {children}
      </body>
    </html>
  )
}
