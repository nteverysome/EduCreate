/**
 * SimpleVitePhaserLoader - 簡化版 Vite + Phaser3 遊戲載入器
 * 專門用於測試和展示本地 Vite + Phaser3 飛機遊戲
 */

'use client';

import React, { useState } from 'react';

interface SimpleVitePhaserLoaderProps {
  className?: string;
}

const SimpleVitePhaserLoader: React.FC<SimpleVitePhaserLoaderProps> = ({
  className = ''
}) => {
  const [showGame, setShowGame] = useState(false);
  const [gameError, setGameError] = useState<string | null>(null);

  const handleLoadGame = () => {
    setShowGame(true);
    setGameError(null);
  };

  const handleGameError = () => {
    setGameError('無法載入 Vite + Phaser3 遊戲。請確保開發服務器正在運行。');
  };

  return (
    <div className={`simple-vite-phaser-loader ${className}`}>
      {/* 遊戲控制面板 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-800">
              🎮 Vite + Phaser3 飛機遊戲
            </h3>
            <p className="text-blue-600 text-sm">
              本地開發版本 - 記憶科學驅動的英語學習遊戲
            </p>
          </div>
          
          <div className="space-x-2">
            {!showGame ? (
              <button
                onClick={handleLoadGame}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                🚀 載入遊戲
              </button>
            ) : (
              <button
                onClick={() => setShowGame(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                ❌ 關閉遊戲
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 遊戲載入區域 */}
      {showGame && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* 遊戲信息欄 */}
          <div className="bg-green-50 border-b border-green-200 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium text-green-800">
                  🎮 Vite + Phaser3 遊戲運行中
                </span>
                <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                  本地開發模式
                </span>
              </div>
              
              <div className="text-sm text-green-600">
                端口: 3001 | 狀態: 活躍
              </div>
            </div>
          </div>

          {/* 遊戲 iframe */}
          <div className="relative">
            <iframe
              src="http://localhost:3001/games/airplane-game/"
              className="w-full h-96 border-0"
              title="Vite + Phaser3 飛機遊戲"
              onError={handleGameError}
              allow="autoplay; fullscreen"
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
            
            {/* 載入覆蓋層 */}
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  載入 Vite + Phaser3 遊戲
                </h3>
                <p className="text-gray-500">
                  正在連接到本地開發服務器...
                </p>
                <div className="mt-2 text-xs text-gray-400">
                  http://localhost:3001/games/airplane-game/
                </div>
              </div>
            </div>
          </div>

          {/* 遊戲特色說明 */}
          <div className="bg-gray-50 p-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl mb-2">⚡</div>
                <div className="font-medium text-gray-800">Vite 熱重載</div>
                <div className="text-gray-600">即時代碼更新</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🎮</div>
                <div className="font-medium text-gray-800">Phaser3 引擎</div>
                <div className="text-gray-600">高性能遊戲渲染</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🧠</div>
                <div className="font-medium text-gray-800">記憶科學</div>
                <div className="text-gray-600">智能學習算法</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 錯誤顯示 */}
      {gameError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
          <div className="flex items-center">
            <div className="text-red-600 text-2xl mr-3">⚠️</div>
            <div>
              <h4 className="font-medium text-red-800">載入錯誤</h4>
              <p className="text-red-600 text-sm">{gameError}</p>
            </div>
          </div>
          
          <div className="mt-3 text-sm text-red-700 bg-red-100 p-3 rounded">
            <strong>解決方案：</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>確保 Vite 開發服務器正在運行: <code>cd games/airplane-game && npm run dev</code></li>
              <li>檢查端口 3004 是否可用</li>
              <li>確認遊戲目錄存在: <code>games/airplane-game/</code></li>
            </ul>
          </div>
        </div>
      )}

      {/* 開發者信息 */}
      <div className="mt-4 text-center text-xs text-gray-500">
        🚀 本地開發模式 | Vite 5.0+ | Phaser 3.70+ | TypeScript 5.0+
      </div>
    </div>
  );
};

export default SimpleVitePhaserLoader;
