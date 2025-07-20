'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

/**
 * CanyonRunner 遊戲頁面
 * 整合 EduCreate 平台的詞彙學習飛行遊戲
 */
export default function CanyonRunnerPage() {
  const [gameLoaded, setGameLoaded] = useState(false);
  const [gameError, setGameError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [iframeKey, setIframeKey] = useState(0); // 用於強制重新載入 iframe

  useEffect(() => {
    // 初始化遊戲載入狀態
    setGameLoaded(false);
    setGameError(null);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    // 添加超時機制，自動隱藏載入覆蓋層
    const timer = setTimeout(() => {
      if (!gameLoaded && !gameError) {
        console.log('🎮 自動隱藏載入覆蓋層 - iframe 應該已經載入完成');
        setGameLoaded(true);
        setIsPlaying(true);
      }
    }, 5000); // 5秒後自動隱藏載入覆蓋層

    return () => clearTimeout(timer);
  }, [iframeKey, gameLoaded, gameError]);

  const handleIframeLoad = () => {
    setGameLoaded(true);
    setIsPlaying(true);
    setGameError(null);
  };

  const handleIframeError = () => {
    setGameError('遊戲載入失敗，請確保 EduCreate-CanyonRunner-Integration 服務器正在運行');
    setGameLoaded(false);
    setIsPlaying(false);
  };

  const handleGameControl = (action: 'play' | 'pause' | 'restart') => {
    // 這裡可以添加遊戲控制邏輯
    console.log(`遊戲控制: ${action}`);

    switch (action) {
      case 'play':
        setIsPlaying(true);
        break;
      case 'pause':
        setIsPlaying(false);
        break;
      case 'restart':
        // 重新載入遊戲 - 使用 key 強制重新載入 iframe
        setGameLoaded(false);
        setGameError(null);
        setIsPlaying(false);
        setIframeKey(prev => prev + 1);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 頁面標題和導航 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/games">
              <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2">
                ← 返回遊戲列表
              </button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">CanyonRunner</h1>
              <p className="text-gray-600">記憶科學驅動的詞彙學習飛行遊戲</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">GEPT 詞彙</span>
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">記憶科學</span>
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">飛行遊戲</span>
          </div>
        </div>

        {/* 遊戲控制面板 */}
        <div className="bg-white rounded-lg border shadow-sm mb-6">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              ⚙️ 遊戲控制
            </h3>
            <p className="text-gray-600 text-sm">
              控制遊戲播放和設置
            </p>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleGameControl(isPlaying ? 'pause' : 'play')}
                className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                  isPlaying
                    ? 'bg-gray-100 text-gray-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } ${!gameLoaded ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!gameLoaded}
              >
                {isPlaying ? '⏸️ 暫停' : '▶️ 開始'}
              </button>

              <button
                onClick={() => handleGameControl('restart')}
                className={`px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2 ${
                  !gameLoaded ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={!gameLoaded}
              >
                🔄 重新開始
              </button>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className={`w-2 h-2 rounded-full ${gameLoaded ? 'bg-green-500' : 'bg-yellow-500'}`} />
                {gameLoaded ? '遊戲已載入' : '載入中...'}
              </div>
            </div>
          </div>
        </div>

        {/* 遊戲容器 */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">遊戲畫面</h3>
            <p className="text-gray-600 text-sm">
              使用方向鍵控制飛機，收集詞彙雲朵，避開障礙物
            </p>
          </div>
          <div className="p-4">
            {gameError ? (
              <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-lg">
                <div className="text-red-500 text-lg font-medium mb-2">遊戲載入失敗</div>
                <div className="text-gray-600 mb-4">{gameError}</div>
                <button
                  onClick={() => handleGameControl('restart')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  重新嘗試載入
                </button>
              </div>
            ) : (
              <div className="w-full min-h-[600px] bg-gray-100 rounded-lg relative">
                <iframe
                  key={iframeKey}
                  src="http://localhost:8081/"
                  width="100%"
                  height="600px"
                  style={{ border: 'none', borderRadius: '8px' }}
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                  title="CanyonRunner Game"
                />
                {!gameLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <div className="text-gray-600">載入 CanyonRunner 遊戲中...</div>
                      <div className="text-sm text-gray-500 mt-2">
                        使用 EduCreate-CanyonRunner-Integration (Phaser 3.90.0 + TypeScript)
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 遊戲說明 */}
        <div className="bg-white rounded-lg border shadow-sm mt-6">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">遊戲說明</h3>
          </div>
          <div className="p-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">🎮 遊戲操作</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• 使用方向鍵控制飛機移動</li>
                  <li>• 收集白色詞彙雲朵獲得分數</li>
                  <li>• 避開岩石和障礙物</li>
                  <li>• 盡可能長時間生存</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🧠 學習特色</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• GEPT 分級詞彙系統</li>
                  <li>• 記憶科學算法優化</li>
                  <li>• 間隔重複學習機制</li>
                  <li>• 視覺化詞彙記憶</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
