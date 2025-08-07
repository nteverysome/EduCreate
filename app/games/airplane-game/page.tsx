/**
 * 🛩️ Airplane Collision Game - 記憶科學驅動的英語學習遊戲
 *
 * 這個頁面直接嵌入 Vite 構建的 Phaser 3 遊戲
 * 避免重定向問題，確保在所有環境中都能正常載入
 */

export default function AirplaneGamePage() {
  return (
    <div className="min-h-screen bg-black">
      {/* 直接嵌入遊戲 iframe */}
      <iframe
        src="/games/airplane-game/index.html"
        className="w-full h-screen border-0"
        title="🛩️ Airplane Collision Game - 記憶科學英語學習遊戲"
        allow="fullscreen"
        loading="eager"
        style={{
          width: '100vw',
          height: '100vh',
          border: 'none',
          margin: 0,
          padding: 0,
          overflow: 'hidden'
        }}
      />

      {/* 備用載入提示 */}
      <noscript>
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
          <div className="text-center text-white p-8">
            <h1 className="text-3xl font-bold mb-4">🛩️ Airplane Collision Game</h1>
            <p className="text-xl mb-4">記憶科學驅動的英語學習遊戲</p>
            <p className="text-blue-200 mb-6">請啟用 JavaScript 來體驗遊戲</p>
            <a
              href="/games/airplane-game/index.html"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              直接進入遊戲
            </a>
          </div>
        </div>
      </noscript>
    </div>
  );
}
