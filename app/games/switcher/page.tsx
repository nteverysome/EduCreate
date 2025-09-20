'use client';

import React, { useState, useCallback, useEffect } from 'react';
import GameSwitcher from '@/components/games/GameSwitcher';
import ShimozurdoGameContainer from '@/components/games/ShimozurdoGameContainer';
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
  const [currentGameId, setCurrentGameId] = useState<string>('shimozurdo-game');
  const [showStats, setShowStats] = useState<boolean>(false);
  const [currentGeptLevel, setCurrentGeptLevel] = useState<string>('elementary');
  const [showMobileGeptMenu, setShowMobileGeptMenu] = useState<boolean>(false);
  const [hasUserScrolled, setHasUserScrolled] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
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

  // 檢測螢幕尺寸和智能自動滾動
  useEffect(() => {
    const handleScroll = () => {
      setHasUserScrolled(true);
    };

    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // 監聽來自 iframe 的全螢幕請求
    const handleFullscreenMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'REQUEST_FULLSCREEN' && event.data.source === 'shimozurdo-game') {
        console.log('📨 收到來自遊戲的全螢幕請求');

        // 嘗試對整個文檔進行全螢幕
        const requestFullscreen = () => {
          const element = document.documentElement;

          // 發送全螢幕結果給 iframe
          const sendFullscreenResult = (success: boolean, message: string) => {
            const iframe = document.querySelector('iframe[title="Shimozurdo 雲朵遊戲"]') as HTMLIFrameElement;
            if (iframe && iframe.contentWindow) {
              iframe.contentWindow.postMessage({
                type: success ? 'FULLSCREEN_SUCCESS' : 'FULLSCREEN_FAILED',
                source: 'parent-page',
                message: message
              }, '*');
              console.log(`📤 發送全螢幕結果給遊戲: ${success ? '成功' : '失敗'} - ${message}`);
            }
          };

          if (element.requestFullscreen) {
            element.requestFullscreen().then(() => {
              console.log('✅ 父頁面全螢幕成功 (requestFullscreen)');
              applyParentFullscreenStyles();
              sendFullscreenResult(true, '父頁面全螢幕成功');
            }).catch(err => {
              console.warn('⚠️ 父頁面全螢幕失敗:', err);
              sendFullscreenResult(false, '父頁面全螢幕失敗: ' + err.message);
            });
          } else if ((element as any).webkitRequestFullscreen) {
            try {
              (element as any).webkitRequestFullscreen();
              console.log('✅ 父頁面全螢幕成功 (webkit)');
              applyParentFullscreenStyles();
              sendFullscreenResult(true, '父頁面全螢幕成功 (webkit)');
            } catch (err: any) {
              console.warn('⚠️ 父頁面全螢幕失敗 (webkit):', err);
              sendFullscreenResult(false, '父頁面全螢幕失敗 (webkit): ' + err.message);
            }
          } else if ((element as any).mozRequestFullScreen) {
            try {
              (element as any).mozRequestFullScreen();
              console.log('✅ 父頁面全螢幕成功 (moz)');
              applyParentFullscreenStyles();
              sendFullscreenResult(true, '父頁面全螢幕成功 (moz)');
            } catch (err: any) {
              console.warn('⚠️ 父頁面全螢幕失敗 (moz):', err);
              sendFullscreenResult(false, '父頁面全螢幕失敗 (moz): ' + err.message);
            }
          } else if ((element as any).msRequestFullscreen) {
            try {
              (element as any).msRequestFullscreen();
              console.log('✅ 父頁面全螢幕成功 (ms)');
              applyParentFullscreenStyles();
              sendFullscreenResult(true, '父頁面全螢幕成功 (ms)');
            } catch (err: any) {
              console.warn('⚠️ 父頁面全螢幕失敗 (ms):', err);
              sendFullscreenResult(false, '父頁面全螢幕失敗 (ms): ' + err.message);
            }
          } else {
            console.warn('⚠️ 父頁面不支援全螢幕 API');
            sendFullscreenResult(false, '父頁面不支援全螢幕 API');
          }
        };

        requestFullscreen();
      }
    };

    // 應用父頁面全螢幕樣式
    const applyParentFullscreenStyles = () => {
      try {
        console.log('🎨 應用父頁面全螢幕樣式');

        // 添加全螢幕樣式類
        document.body.classList.add('parent-fullscreen-game');

        // 創建或更新全螢幕樣式
        let fullscreenStyle = document.getElementById('parent-fullscreen-style');
        if (!fullscreenStyle) {
          fullscreenStyle = document.createElement('style');
          fullscreenStyle.id = 'parent-fullscreen-style';
          document.head.appendChild(fullscreenStyle);
        }

        fullscreenStyle.textContent = `
          /* 父頁面全螢幕樣式 */
          body.parent-fullscreen-game {
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            background: black !important;
          }

          /* 僅固定並鋪滿遊戲容器，不隱藏其他元素，避免誤傷主層 */
          /* 確保遊戲容器填滿整個螢幕 */
          body.parent-fullscreen-game [data-testid="game-container"] {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 999999 !important;
            background: black !important;
          }

          /* 確保 iframe 容器填滿整個螢幕 */
          body.parent-fullscreen-game .game-iframe-container {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 999999 !important;
          }

          /* 確保 iframe 填滿整個螢幕 */
          body.parent-fullscreen-game .game-iframe-container iframe {
            width: 100% !important;
            height: 100% !important;
            border: none !important;
          }
        `;

        console.log('✅ 父頁面全螢幕樣式已應用');
      } catch (error) {
        console.warn('⚠️ 應用父頁面全螢幕樣式失敗:', error);
      }
    };

    const autoScrollToGame = () => {
      // 檢查用戶是否偏好減少動畫
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // 對所有設備都執行自動滾動，不只是手機
      if (!hasUserScrolled && !prefersReducedMotion) {
        // 優先尋找 iframe 容器，如果找不到則使用遊戲容器
        const iframeContainer = document.querySelector('.game-iframe-container');
        const gameContainer = document.querySelector('[data-testid="game-container"]');
        const targetElement = iframeContainer || gameContainer;

        if (targetElement) {
          // 縮短延遲時間，更快滾動到遊戲容器
          setTimeout(() => {
            // 計算滾動位置，讓遊戲容器頂部對齊視窗頂部
            const elementRect = targetElement.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const targetScrollPosition = scrollTop + elementRect.top;

            // 平滑滾動到目標位置
            window.scrollTo({
              top: targetScrollPosition,
              behavior: 'smooth'
            });

            console.log('🎯 自動滾動到遊戲容器頂部 (隱藏標題區域)');
          }, 500);
        }
      }
    };

    // 初始檢查螢幕尺寸
    checkScreenSize();

    // 監聽滾動事件、尺寸變化和全螢幕消息
    // 監聽全螢幕狀態變化
    const handleFullscreenChange = () => {
      const isFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      if (!isFullscreen) {
        // 退出全螢幕時清理樣式
        console.log('🚪 退出全螢幕，清理父頁面樣式');
        document.body.classList.remove('parent-fullscreen-game');
        const fullscreenStyle = document.getElementById('parent-fullscreen-style');
        if (fullscreenStyle) {
          fullscreenStyle.remove();
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', checkScreenSize);
    window.addEventListener('message', handleFullscreenMessage);

    // 監聽全螢幕狀態變化
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    (document as any).addEventListener('MSFullscreenChange', handleFullscreenChange);

    // 執行自動滾動 - 多次嘗試確保成功
    autoScrollToGame();

    // 額外的滾動嘗試，確保在所有內容載入後也能滾動
    setTimeout(autoScrollToGame, 1500);
    setTimeout(autoScrollToGame, 3000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkScreenSize);
      window.removeEventListener('message', handleFullscreenMessage);

      // 清理全螢幕監聽器
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      (document as any).removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [hasUserScrolled]);

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
      'shimozurdo-game': 'Shimozurdo 雲朵遊戲',
      'shimozurdo-responsive': 'shimozurdo 響應式遊戲',
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
    <div
      className="bg-gray-50"
      style={{
        minHeight: isMobile ? `${window.innerHeight}px` : '100vh',
        height: isMobile ? `${window.innerHeight}px` : 'auto'
      }}
    >
      {/* 手機版 GEPT 選擇器彈出選單 */}
      {showMobileGeptMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden" onClick={() => setShowMobileGeptMenu(false)}>
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">選擇 GEPT 等級</h3>
              <button
                onClick={() => setShowMobileGeptMenu(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                ✕
              </button>
            </div>

            {/* 手機版 GEPT 選擇器 - 保持測試兼容性 */}
            <div className="gept-selector" data-testid="gept-selector">
              <div className="flex items-center space-x-2 mb-4">
                <BookOpenIcon className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">GEPT 等級：</span>
              </div>

              <div className="gept-buttons space-y-3">
                {['elementary', 'intermediate', 'advanced'].map((level) => (
                  <button
                    key={level}
                    onClick={() => {
                      setCurrentGeptLevel(level);
                      setShowMobileGeptMenu(false);
                    }}
                    className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors border ${
                      currentGeptLevel === level
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-300'
                    }`}
                    style={{ minHeight: '44px' }}
                  >
                    {level === 'elementary' ? '初級 (Elementary)' : level === 'intermediate' ? '中級 (Intermediate)' : '高級 (Advanced)'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 緊湊合併標頭 - 手機優化佈局 */}
      <div className="unified-game-header bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1 md:py-2">
          {/* 手機模式：極簡單行佈局 */}
          <div className="md:hidden flex items-center justify-between gap-2 min-h-12">
            {/* 左側：緊湊標題 */}
            <div className="flex-shrink-0">
              <h1 className="text-sm font-bold text-gray-900">記憶科學遊戲</h1>
            </div>

            {/* 右側：控制按鈕組 */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* 手機版更多選項按鈕 */}
              <button
                onClick={() => setShowMobileGeptMenu(true)}
                className="px-2 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                style={{ minHeight: '44px', minWidth: '44px' }}
                title="更多選項"
              >
                ⚙️
              </button>

              <button
                onClick={() => setShowStats(!showStats)}
                className="px-2 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                style={{ minHeight: '44px' }}
              >
                📊
              </button>

              <button
                onClick={() => window.open('http://localhost:3001/games/airplane-game/', '_blank')}
                className="px-2 py-2 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                style={{ minHeight: '44px' }}
              >
                🚀
              </button>
            </div>
          </div>

          {/* 桌面模式：完整佈局 */}
          <div className="hidden md:flex items-center justify-between gap-4 min-h-16">
            {/* 左側：標題 + GEPT 選擇器 */}
            <div className="flex items-center gap-4 flex-1 min-w-0 overflow-hidden">
              {/* 標題區域 */}
              <div className="flex-shrink-0">
                <h1 className="text-base lg:text-lg font-bold text-gray-900">記憶科學遊戲中心</h1>
                <p className="text-xs text-gray-600">25 種記憶科學遊戲</p>
              </div>

              {/* 桌面版 GEPT 選擇器 */}
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
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium text-blue-900">🎮 {getGameName(currentGameId)}</span>
                <span className="px-1 py-0.5 text-xs bg-green-100 text-green-800 rounded">✅</span>
              </div>

              {/* 控制按鈕組 */}
              <button
                onClick={() => setShowStats(!showStats)}
                className="px-2 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                style={{ minHeight: '44px' }}
              >
                <span className="hidden lg:inline">{showStats ? '隱藏統計' : '顯示統計'}</span>
                <span className="lg:hidden">📊</span>
              </button>

              <button
                onClick={() => window.open('http://localhost:3001/games/airplane-game/', '_blank')}
                className="px-2 py-2 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                style={{ minHeight: '44px' }}
              >
                <span className="hidden lg:inline">🚀 出遊戲</span>
                <span className="lg:hidden">🚀</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要內容 - 手機優化佈局 */}
      <div className="max-w-none mx-auto px-4 sm:px-6 lg:px-8 py-1 sm:py-2">

        {/* 遊戲切換器 - 主要區域，手機模式減少間距 */}
        <div className="mb-1 sm:mb-2" data-testid="game-container">
          <GameSwitcher
            defaultGame="shimozurdo-game"
            geptLevel={currentGeptLevel as 'elementary' | 'intermediate' | 'advanced'}
            onGameChange={handleGameChange}
            onGameStateUpdate={handleGameStateUpdate}
            className="w-full"
            hideGeptSelector={true}
            currentGeptLevel={currentGeptLevel}
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
