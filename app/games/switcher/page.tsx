'use client';

import React, { useState, useCallback, useEffect } from 'react';
import GameSwitcher from '@/components/games/GameSwitcher';
import { BookOpenIcon } from '@heroicons/react/24/outline';
import '@/styles/responsive-game-switcher.css';

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
  progress: number;
  level: string;
}

const GameSwitcherPage: React.FC = () => {
  const [currentGameId, setCurrentGameId] = useState<string>('airplane-vite');
  const [showStats, setShowStats] = useState<boolean>(false);
  const [currentGeptLevel, setCurrentGeptLevel] = useState<string>('elementary');
  
  // 遊戲統計狀態
  const [gameStats, setGameStats] = useState<GameStats>({
    totalGamesPlayed: 0,
    totalTimeSpent: 0,
    averageScore: 0,
    favoriteGame: 'airplane-vite',
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

  // 處理遊戲切換
  const handleGameChange = useCallback((gameId: string) => {
    console.log('🎮 遊戲切換:', gameId);
    setCurrentGameId(gameId);
    
    // 記錄遊戲切換歷史
    setGameHistory(prev => [...prev, {
      gameId,
      timestamp: Date.now(),
      state: { score: 0, progress: 0, level: 'elementary' }
    }]);
  }, []);

  // 處理遊戲狀態更新
  const handleGameStateUpdate = useCallback((gameId: string, state: GameState) => {
    console.log('📊 遊戲狀態更新:', gameId, state);
    
    // 更新統計數據
    setGameStats(prev => ({
      ...prev,
      totalGamesPlayed: prev.totalGamesPlayed + 1,
      totalTimeSpent: prev.totalTimeSpent + 30000, // 假設每次遊戲30秒
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
      'airplane-vite': '飛機遊戲 (Vite版)',
      'airplane-main': '飛機碰撞遊戲',
      'airplane-iframe': '飛機遊戲 (iframe)',
      'matching-pairs': '配對遊戲',
      'quiz-game': '問答遊戲',
      'sequence-game': '序列遊戲',
      'flashcard-game': '閃卡遊戲'
    };
    return gameNames[gameId] || gameId;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 緊湊合併標頭 - 單行整合設計 */}
      <div className="unified-game-header bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          {/* 單行整合佈局 - 修復重疊問題 */}
          <div className="flex items-center justify-between gap-4 min-h-16">
            {/* 左側：標題 + GEPT 選擇器 */}
            <div className="flex items-center gap-4 flex-1 min-w-0 overflow-hidden">
              {/* 標題區域 */}
              <div className="flex-shrink-0">
                <h1 className="text-base sm:text-lg font-bold text-gray-900">記憶科學遊戲中心</h1>
                <p className="text-xs text-gray-600 hidden sm:block">25 種記憶科學遊戲</p>
              </div>

              {/* GEPT 選擇器 */}
              <div className="gept-selector flex items-center gap-2 flex-1 max-w-xs" data-testid="gept-selector">
                <BookOpenIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="text-xs font-medium text-gray-700 flex-shrink-0">GEPT:</span>
                <div className="gept-buttons flex gap-1 flex-1">
                  {['elementary', 'intermediate', 'advanced'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setCurrentGeptLevel(level)}
                      className={`px-2 py-2 rounded text-xs font-medium transition-colors flex-1 ${
                        currentGeptLevel === level
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                      }`}
                      style={{ minHeight: '44px', minWidth: '44px' }}
                    >
                      {level === 'elementary' ? '初級' : level === 'intermediate' ? '中級' : '高級'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 右側：遊戲狀態 + 控制按鈕 */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* 當前遊戲狀態 */}
              <div className="hidden md:flex items-center space-x-1">
                <span className="text-sm font-medium text-blue-900">🎮 {getGameName(currentGameId)}</span>
                <span className="px-1 py-0.5 text-xs bg-green-100 text-green-800 rounded">✅</span>
              </div>

              {/* 控制按鈕組 */}
              <button
                onClick={() => setShowStats(!showStats)}
                className="px-2 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                style={{ minHeight: '44px' }}
              >
                <span className="hidden sm:inline">{showStats ? '隱藏統計' : '顯示統計'}</span>
                <span className="sm:hidden">📊</span>
              </button>

              <button
                onClick={() => window.open('http://localhost:3001/games/airplane-game/', '_blank')}
                className="px-2 py-2 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                style={{ minHeight: '44px' }}
              >
                <span className="hidden sm:inline">🚀 出遊戲</span>
                <span className="sm:hidden">🚀</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要內容 - 手機優化佈局 */}
      <div className="max-w-none mx-auto px-4 sm:px-6 lg:px-8 py-1 sm:py-2">
        {/* 遊戲切換器 - 主要區域，手機模式減少間距 */}
        <div className="mb-1 sm:mb-2">
          <GameSwitcher
            defaultGame="airplane-vite"
            geptLevel={currentGeptLevel}
            onGameChange={handleGameChange}
            onGameStateUpdate={handleGameStateUpdate}
            className="w-full"
            hideGeptSelector={true}
          />
        </div>

        {/* 統計和歷史 - 響應式網格佈局 */}
        <div className="stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {/* 學習統計 */}
          <div className="stats-card bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            <h3 className="font-semibold text-gray-900 mb-3 md:mb-4">學習統計</h3>
            <div className="space-y-3 md:space-y-4">
              <div>
                <div className="text-sm text-gray-500">總遊戲次數</div>
                <div className="text-xl md:text-2xl font-bold text-blue-600">{gameStats.totalGamesPlayed}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">總學習時間</div>
                <div className="text-base md:text-lg font-semibold text-gray-900">
                  {formatTime(gameStats.totalTimeSpent)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">平均分數</div>
                <div className="text-base md:text-lg font-semibold text-gray-900">
                  {Math.round(gameStats.averageScore)}
                </div>
              </div>
            </div>
          </div>

          {/* GEPT 進度 */}
          <div className="stats-card bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            <h3 className="font-semibold text-gray-900 mb-3 md:mb-4">GEPT 學習進度</h3>
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
            <div className="stats-card bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 md:col-span-2 lg:col-span-1">
              <h3 className="font-semibold text-gray-900 mb-3 md:mb-4">最近遊戲</h3>
              <div className="space-y-3">
                {gameHistory.slice(-5).reverse().map((entry, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {getGameName(entry.gameId)}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="font-semibold text-blue-600">
                        {entry.state.score}分
                      </div>
                      <div className="text-gray-500 text-xs">
                        {entry.state.progress}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
