'use client';

import React, { useState, useCallback } from 'react';
import { ArrowLeftIcon, CogIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import GameSwitcher from '@/components/games/GameSwitcher';

// 遊戲統計類型
interface GameStats {
  totalGamesPlayed: number;
  totalTimeSpent: number;
  averageScore: number;
  favoriteGame: string;
  geptProgress: {
    elementary: number;
    intermediate: number;
    advanced: number;
  };
}

// 遊戲狀態類型
interface GameState {
  score: number;
  level: string;
  progress: number;
  timeSpent: number;
}

const GameSwitcherPage: React.FC = () => {
  // 狀態管理
  const [currentGameId, setCurrentGameId] = useState<string>('airplane-main');
  const [gameStats, setGameStats] = useState<GameStats>({
    totalGamesPlayed: 0,
    totalTimeSpent: 0,
    averageScore: 0,
    favoriteGame: 'airplane-main',
    geptProgress: {
      elementary: 0,
      intermediate: 0,
      advanced: 0
    }
  });
  const [gameHistory, setGameHistory] = useState<Array<{
    gameId: string;
    timestamp: number;
    state: GameState;
  }>>([]);
  const [showStats, setShowStats] = useState<boolean>(false);

  // 處理遊戲切換
  const handleGameChange = useCallback((gameId: string) => {
    console.log(`🎮 遊戲切換到: ${gameId}`);
    setCurrentGameId(gameId);
    
    // 記錄遊戲切換歷史
    setGameHistory(prev => [
      ...prev,
      {
        gameId,
        timestamp: Date.now(),
        state: {
          score: 0,
          level: 'elementary',
          progress: 0,
          timeSpent: 0
        }
      }
    ].slice(-10)); // 只保留最近10次記錄
  }, []);

  // 處理遊戲狀態更新
  const handleGameStateUpdate = useCallback((gameId: string, state: GameState) => {
    console.log(`📊 遊戲狀態更新 [${gameId}]:`, state);
    
    // 更新統計數據
    setGameStats(prev => ({
      ...prev,
      totalGamesPlayed: prev.totalGamesPlayed + (state.progress === 100 ? 1 : 0),
      totalTimeSpent: prev.totalTimeSpent + state.timeSpent,
      averageScore: (prev.averageScore + state.score) / 2,
      geptProgress: {
        ...prev.geptProgress,
        [state.level as keyof typeof prev.geptProgress]: Math.max(
          prev.geptProgress[state.level as keyof typeof prev.geptProgress],
          state.progress
        )
      }
    }));

    // 更新遊戲歷史
    setGameHistory(prev => {
      const updated = [...prev];
      const lastEntry = updated[updated.length - 1];
      if (lastEntry && lastEntry.gameId === gameId) {
        lastEntry.state = state;
      }
      return updated;
    });
  }, []);

  // 格式化時間
  const formatTime = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  // 獲取遊戲名稱
  const getGameName = (gameId: string): string => {
    const gameNames: Record<string, string> = {
      'airplane-main': '飛機碰撞遊戲',
      'airplane-iframe': '飛機遊戲 (iframe)',
      'airplane-vite': '飛機遊戲 (Vite)',
      'matching-pairs': '配對遊戲',
      'quiz-game': '問答遊戲',
      'sequence-game': '序列遊戲',
      'flashcard-game': '閃卡遊戲'
    };
    return gameNames[gameId] || gameId;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頁面標頭 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* 返回按鈕和標題 */}
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span>返回主頁</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">記憶科學遊戲中心</h1>
                <p className="text-sm text-gray-600">動態切換不同的學習遊戲</p>
              </div>
            </div>

            {/* 統計和設定按鈕 */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowStats(!showStats)}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChartBarIcon className="w-5 h-5" />
                <span>統計</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <CogIcon className="w-5 h-5" />
                <span>設定</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要內容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 遊戲切換器 - 主要區域 */}
          <div className="lg:col-span-3">
            <GameSwitcher
              defaultGame="airplane-main"
              geptLevel="elementary"
              onGameChange={handleGameChange}
              onGameStateUpdate={handleGameStateUpdate}
              className="w-full"
            />
          </div>

          {/* 側邊欄 - 統計和歷史 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 快速統計 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">學習統計</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500">總遊戲次數</div>
                  <div className="text-2xl font-bold text-blue-600">{gameStats.totalGamesPlayed}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">總學習時間</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatTime(gameStats.totalTimeSpent)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">平均分數</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {Math.round(gameStats.averageScore)}
                  </div>
                </div>
              </div>
            </div>

            {/* GEPT 進度 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">GEPT 學習進度</h3>
              <div className="space-y-3">
                {Object.entries(gameStats.geptProgress).map(([level, progress]) => (
                  <div key={level}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">
                        {level === 'elementary' ? '初級' : level === 'intermediate' ? '中級' : '高級'}
                      </span>
                      <span className="text-gray-900 font-medium">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          level === 'elementary' ? 'bg-green-500' :
                          level === 'intermediate' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 遊戲歷史 */}
            {gameHistory.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">最近遊戲</h3>
                <div className="space-y-3">
                  {gameHistory.slice(-5).reverse().map((entry, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div>
                        <div className="font-medium text-gray-900">
                          {getGameName(entry.gameId)}
                        </div>
                        <div className="text-gray-500">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-blue-600">
                          {entry.state.score}分
                        </div>
                        <div className="text-gray-500">
                          {entry.state.progress}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 詳細統計 (可展開) */}
            {showStats && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">詳細統計</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">當前遊戲</span>
                    <span className="font-medium">{getGameName(currentGameId)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">最愛遊戲</span>
                    <span className="font-medium">{getGameName(gameStats.favoriteGame)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">遊戲切換次數</span>
                    <span className="font-medium">{gameHistory.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">平均遊戲時長</span>
                    <span className="font-medium">
                      {gameStats.totalGamesPlayed > 0 
                        ? formatTime(gameStats.totalTimeSpent / gameStats.totalGamesPlayed)
                        : '0s'
                      }
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 頁腳信息 */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>EduCreate 記憶科學遊戲平台 - 讓學習變得更科學、更有趣、更有效</p>
            <p className="mt-1">支援 25 種記憶科學遊戲類型，基於主動回憶和間隔重複原理</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameSwitcherPage;
