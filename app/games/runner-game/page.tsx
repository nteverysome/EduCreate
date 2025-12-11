'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

/**
 * Runner 遊戲頁面
 * 整合 EduCreate 平台的跑酷遊戲
 */
export default function RunnerGamePage() {
  const [gameLoaded, setGameLoaded] = useState(false);
  const [gameError, setGameError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const searchParams = useSearchParams();

  useEffect(() => {
    setGameLoaded(false);
    setGameError(null);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!gameLoaded && !gameError) {
        console.log('🎮 自動隱藏載入覆蓋層 - iframe 應該已經載入完成');
        setGameLoaded(true);
        setIsPlaying(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [iframeKey, gameLoaded, gameError]);

  const handleIframeLoad = () => {
    setGameLoaded(true);
    setIsPlaying(true);
    setGameError(null);
  };

  const handleIframeError = () => {
    setGameError('遊戲載入失敗，請檢查網絡連接');
    setGameLoaded(false);
    setIsPlaying(false);
  };

  const handleGameControl = (action: 'play' | 'pause' | 'restart') => {
    console.log(`遊戲控制: ${action}`);

    switch (action) {
      case 'play':
        setIsPlaying(true);
        break;
      case 'pause':
        setIsPlaying(false);
        break;
      case 'restart':
        setGameLoaded(false);
        setGameError(null);
        setIsPlaying(false);
        setIframeKey(prev => prev + 1);
        break;
    }
  };

  // 構建遊戲 URL，包含 activityId 和 sessionId
  const activityId = searchParams?.get('activityId');
  const sessionId = searchParams?.get('sessionId') || `runner-${Date.now()}`;
  const gameUrl = `/games/runner-game/dist/?activityId=${activityId || ''}&sessionId=${sessionId}`;

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
              <h1 className="text-3xl font-bold text-gray-900">Runner 跑酷遊戲</h1>
              <p className="text-gray-600">通過跳躍和收集金幣來挑戰高分</p>
            </div>
          </div>
        </div>

        {/* 遊戲容器 */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">遊戲畫面</h3>
            <p className="text-gray-600 text-sm">
              按空格鍵或點擊屏幕跳躍，收集金幣，避開障礙物
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
                  src={gameUrl}
                  width="100%"
                  height="600px"
                  style={{ border: 'none', borderRadius: '8px' }}
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                  title="Runner Game"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                />
                {!gameLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <div className="text-gray-600">載入 Runner 遊戲中...</div>
                      <div className="text-sm text-gray-500 mt-2">
                        使用 Phaser 3 引擎
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 遊戲說明 */}
        <div className="mt-6 bg-white rounded-lg border shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">遊戲說明</h2>
          <ul className="space-y-2 text-gray-700">
            <li>🎮 <strong>控制方式：</strong>按空格鍵或點擊屏幕跳躍</li>
            <li>💰 <strong>收集金幣：</strong>跳過障礙物並收集金幣獲得分數</li>
            <li>⚠️ <strong>避開障礙物：</strong>碰到障礙物遊戲結束</li>
            <li>📊 <strong>自動保存：</strong>遊戲結束時自動保存進度</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

