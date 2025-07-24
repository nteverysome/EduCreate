'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

// 使用原本的完整版組件
const AirplaneCollisionGame = dynamic(
  () => import('../../../components/games/AirplaneCollisionGame/AirplaneCollisionGame'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">載入完整版 Airplane 遊戲中...</p>
        </div>
      </div>
    )
  }
);

/**
 * Airplane Collision Game 頁面
 *
 * 實際可運行的飛機碰撞遊戲
 */
export default function AirplaneGamePage() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameStats, setGameStats] = useState({
    score: 0,
    wordsLearned: 0,
    accuracy: 0
  });

  const handleGameStart = () => {
    setGameStarted(true);
  };

  const handleScoreUpdate = (score: number) => {
    setGameStats(prev => ({ ...prev, score }));
  };

  const handleWordLearned = (word: string, isCorrect: boolean) => {
    setGameStats(prev => ({
      ...prev,
      wordsLearned: prev.wordsLearned + 1,
      accuracy: isCorrect ? prev.accuracy + 1 : prev.accuracy
    }));
  };

  const handleGameEnd = (finalStats: any) => {
    console.log('遊戲結束統計:', finalStats);
    setGameStarted(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 頁面標題 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="text-3xl mr-3">🛩️</span>
                Airplane Collision Game
              </h1>
              <p className="text-gray-600 mt-1">記憶科學驅動的英語詞彙學習遊戲</p>
            </div>

            {/* 遊戲統計 */}
            <div className="flex space-x-6 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{gameStats.score}</div>
                <div className="text-gray-500">分數</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{gameStats.wordsLearned}</div>
                <div className="text-gray-500">學習詞彙</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {gameStats.wordsLearned > 0 ? Math.round((gameStats.accuracy / gameStats.wordsLearned) * 100) : 0}%
                </div>
                <div className="text-gray-500">準確率</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 遊戲區域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* 遊戲控制面板 */}
          <div className="bg-gray-50 px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span className="text-sm text-gray-600">遊戲狀態: {gameStarted ? '進行中' : '待開始'}</span>
                </div>
                <div className="text-sm text-gray-600">
                  GEPT 等級: <span className="font-semibold text-blue-600">Elementary</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleGameStart}
                  disabled={gameStarted}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {gameStarted ? '遊戲進行中' : '開始遊戲'}
                </button>
              </div>
            </div>
          </div>

          {/* 遊戲畫面 - 使用原本的完整版組件 */}
          <div className="p-6">
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <AirplaneCollisionGame
                config={{
                  geptLevel: 'elementary',
                  enableSound: true,
                  enableHapticFeedback: true,
                  difficulty: 'medium',
                  gameMode: 'practice'
                }}
                onGameStart={handleGameStart}
                onScoreUpdate={handleScoreUpdate}
                onWordLearned={handleWordLearned}
                onGameEnd={handleGameEnd}
              />
            </div>
          </div>

          {/* 遊戲說明 */}
          <div className="bg-blue-50 px-6 py-4 border-t">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">🎮 遊戲說明</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
              <div>
                <strong>控制方式:</strong> 使用方向鍵或 WASD 控制飛機移動
              </div>
              <div>
                <strong>遊戲目標:</strong> 碰撞正確的英語詞彙雲朵，避免錯誤答案
              </div>
              <div>
                <strong>學習原理:</strong> 主動回憶 + 視覺記憶 + 即時反饋
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
