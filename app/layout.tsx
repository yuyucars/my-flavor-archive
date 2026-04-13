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

        {/* スプラッシュ画面 */}
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
            gap: '20px',
            transition: 'opacity 0.4s ease-out',
          }}
        >
          {/* 料理アニメーション */}
          <div style={{ position: 'relative', width: '120px', height: '120px' }}>
            {/* 飛び込む食材たち */}
            <span style={{ position: 'absolute', top: 0, left: '10px',  fontSize: '1.6rem', animation: 'fall1 2.2s ease-in infinite' }}>🥕</span>
            <span style={{ position: 'absolute', top: 0, left: '50px',  fontSize: '1.6rem', animation: 'fall2 2.2s ease-in infinite 0.4s' }}>🧅</span>
            <span style={{ position: 'absolute', top: 0, left: '85px',  fontSize: '1.6rem', animation: 'fall3 2.2s ease-in infinite 0.8s' }}>🍅</span>
            {/* フライパン */}
            <span style={{ position: 'absolute', bottom: '4px', left: '50%', transform: 'translateX(-50%)', fontSize: '3.5rem', animation: 'panWiggle 0.6s ease-in-out infinite alternate' }}>🍳</span>
            {/* 湯気 */}
            <span style={{ position: 'absolute', bottom: '70px', left: '38px', fontSize: '1rem', animation: 'steam 1.4s ease-out infinite 0.2s', opacity: 0 }}>〜</span>
            <span style={{ position: 'absolute', bottom: '70px', left: '62px', fontSize: '1rem', animation: 'steam 1.4s ease-out infinite 0.7s', opacity: 0 }}>〜</span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 300, letterSpacing: '0.05em', color: '#292524', margin: 0 }}>
              Monrepe
            </h1>
            <p style={{ color: '#a8a29e', fontSize: '0.875rem', marginTop: '8px' }}>
              ようこそ、Monrepeへ
            </p>
          </div>

          <p style={{ color: '#d6d3d1', fontSize: '0.75rem' }}>準備中...</p>
        </div>

        <style>{`
          @keyframes fall1 {
            0%   { transform: translateY(0px) rotate(0deg);    opacity: 0; }
            5%   { opacity: 1; }
            65%  { transform: translateY(75px) rotate(200deg); opacity: 1; }
            75%  { transform: translateY(75px) rotate(200deg); opacity: 0; }
            100% { transform: translateY(0px) rotate(0deg);    opacity: 0; }
          }
          @keyframes fall2 {
            0%   { transform: translateY(0px) rotate(0deg);     opacity: 0; }
            5%   { opacity: 1; }
            65%  { transform: translateY(75px) rotate(-200deg); opacity: 1; }
            75%  { transform: translateY(75px) rotate(-200deg); opacity: 0; }
            100% { transform: translateY(0px) rotate(0deg);     opacity: 0; }
          }
          @keyframes fall3 {
            0%   { transform: translateY(0px) rotate(0deg);    opacity: 0; }
            5%   { opacity: 1; }
            65%  { transform: translateY(75px) rotate(200deg); opacity: 1; }
            75%  { transform: translateY(75px) rotate(200deg); opacity: 0; }
            100% { transform: translateY(0px) rotate(0deg);    opacity: 0; }
          }
          @keyframes panWiggle {
            0%   { transform: translateX(-50%) rotate(-5deg) scale(1); }
            50%  { transform: translateX(-50%) rotate(0deg)  scale(1.08); }
            100% { transform: translateX(-50%) rotate(5deg)  scale(1); }
          }
          @keyframes steam {
            0%   { transform: translateY(0px);   opacity: 0; }
            20%  { opacity: 0.7; }
            100% { transform: translateY(-28px); opacity: 0; }
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
                var MIN_MS = 2500;
                var loadDone = false;
                var timerDone = false;

                function doHide() {
                  el.style.opacity = '0';
                  setTimeout(function() {
                    el.style.display = 'none';
                    sessionStorage.setItem('monrepe-splash-shown', '1');
                  }, 400);
                }

                function tryHide() {
                  if (loadDone && timerDone) doHide();
                }

                // 最低表示時間タイマー
                setTimeout(function() {
                  timerDone = true;
                  tryHide();
                }, MIN_MS);

                // ページ読み込み完了待ち
                function onLoad() {
                  loadDone = true;
                  tryHide();
                }
                if (document.readyState === 'complete') {
                  onLoad();
                } else {
                  window.addEventListener('load', onLoad, { once: true });
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
