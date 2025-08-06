'use client';

import { useEffect } from 'react';

/**
 * Airplane Game 靜態文件重定向頁面
 * 
 * 這個頁面的作用是將 /games/airplane-game 路由重定向到
 * 靜態構建的 Vite 遊戲文件 /games/airplane-game/index.html
 * 
 * 在生產環境中，這個重定向由 Vercel 的 rewrites 規則處理
 * 在開發環境中，我們使用這個頁面來實現相同的功能
 */
export default function AirplaneGamePage() {
  useEffect(() => {
    // 重定向到靜態遊戲文件
    const gameUrl = '/games/airplane-game/index.html';
    window.location.replace(gameUrl);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold mb-2">🛩️ 載入飛機遊戲中...</h1>
        <p className="text-blue-200">正在重定向到遊戲頁面</p>
        <p className="text-sm text-blue-300 mt-4">
          如果沒有自動跳轉，請點擊 
          <a 
            href="/games/airplane-game/index.html" 
            className="underline hover:text-white ml-1"
          >
            這裡
          </a>
        </p>
      </div>
    </div>
  );
}
