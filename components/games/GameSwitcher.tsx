'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDownIcon, PlayIcon, BookOpenIcon } from '@heroicons/react/24/outline';

// 遊戲配置類型定義
interface GameConfig {
  id: string;
  name: string;
  displayName: string;
  description: string;
  url: string;
  type: 'main' | 'iframe' | 'vite' | 'component';
  memoryType: string;
  geptLevels: ('elementary' | 'intermediate' | 'advanced')[];
  status: 'completed' | 'development' | 'planned';
  icon: string;
  estimatedLoadTime: number; // ms
}

// 遊戲狀態類型
interface GameState {
  score: number;
  level: string;
  progress: number;
  timeSpent: number;
}

// 組件 Props
interface GameSwitcherProps {
  defaultGame?: string;
  geptLevel?: 'elementary' | 'intermediate' | 'advanced';
  onGameChange?: (gameId: string) => void;
  onGameStateUpdate?: (gameId: string, state: GameState) => void;
  className?: string;
  hideGeptSelector?: boolean;
  currentGeptLevel?: string;
}

// 基礎遊戲配置數據 (不包含動態 URL)
const BASE_GAMES_CONFIG: Omit<GameConfig, 'url'>[] = [
  {
    id: 'airplane-vite',
    name: 'airplane',
    displayName: '飛機遊戲 (Vite版)',
    description: 'Phaser 3 + Vite 完整版飛機碰撞遊戲，記憶科學驅動的英語詞彙學習',
    type: 'iframe',
    memoryType: '動態反應記憶',
    geptLevels: ['elementary', 'intermediate', 'advanced'],
    status: 'completed',
    icon: '⚡',
    estimatedLoadTime: 600
  },
  {
    id: 'airplane-main',
    name: 'airplane',
    displayName: '飛機碰撞遊戲',
    description: '通過飛機碰撞雲朵學習英語詞彙，基於主動回憶和視覺記憶原理',
    type: 'main',
    memoryType: '動態反應記憶',
    geptLevels: ['elementary', 'intermediate', 'advanced'],
    status: 'completed',
    icon: '✈️',
    estimatedLoadTime: 800
  },
  {
    id: 'airplane-iframe',
    name: 'airplane',
    displayName: '飛機遊戲 (iframe版)',
    description: 'Phaser 3 + Vite 完整版飛機碰撞遊戲，記憶科學驅動的英語詞彙學習',
    type: 'iframe',
    memoryType: '動態反應記憶',
    geptLevels: ['elementary', 'intermediate', 'advanced'],
    status: 'completed',
    icon: '🎮',
    estimatedLoadTime: 1000
  },
  {
    id: 'shimozurdo-game',
    name: 'shimozurdo',
    displayName: 'Shimozurdo 雲朵遊戲',
    description: 'Phaser 3 雲朵碰撞遊戲，支援全螢幕和響應式設計，記憶科學驅動的英語學習',
    type: 'iframe',
    memoryType: '動態反應記憶',
    geptLevels: ['elementary', 'intermediate', 'advanced'],
    status: 'completed',
    icon: '☁️',
    estimatedLoadTime: 800
  },
  {
    id: 'shimozurdo-responsive',
    name: 'shimozurdo',
    displayName: 'shimozurdo 響應式遊戲',
    description: 'Phaser 3 響應式遊戲，支援全螢幕和方向切換，記憶科學驅動學習',
    type: 'iframe',
    memoryType: '空間視覺記憶',
    geptLevels: ['elementary', 'intermediate', 'advanced'],
    status: 'completed',
    icon: '🎯',
    estimatedLoadTime: 800
  },
  // 未來遊戲預留位置
  {
    id: 'matching-pairs',
    name: 'matching',
    displayName: '配對遊戲',
    description: '通過配對卡片強化視覺記憶和關聯學習',
    type: 'main',
    memoryType: '空間視覺記憶',
    geptLevels: ['elementary', 'intermediate', 'advanced'],
    status: 'development',
    icon: '🃏',
    estimatedLoadTime: 700
  },
  {
    id: 'quiz-game',
    name: 'quiz',
    displayName: '問答遊戲',
    description: '基於主動回憶的快速問答學習',
    type: 'main',
    memoryType: '基礎記憶',
    geptLevels: ['elementary', 'intermediate', 'advanced'],
    status: 'development',
    icon: '❓',
    estimatedLoadTime: 500
  },
  {
    id: 'sequence-game',
    name: 'sequence',
    displayName: '序列遊戲',
    description: '通過序列記憶強化學習效果',
    type: 'main',
    memoryType: '重構邏輯記憶',
    geptLevels: ['elementary', 'intermediate', 'advanced'],
    status: 'planned',
    icon: '🔢',
    estimatedLoadTime: 600
  },
  {
    id: 'flashcard-game',
    name: 'flashcard',
    displayName: '閃卡遊戲',
    description: '經典閃卡學習，支援間隔重複算法',
    type: 'main',
    memoryType: '基礎記憶',
    geptLevels: ['elementary', 'intermediate', 'advanced'],
    status: 'planned',
    icon: '📚',
    estimatedLoadTime: 400
  }
];

// 動態生成完整的遊戲配置
const getGamesConfig = (): GameConfig[] => {
  const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';

  return BASE_GAMES_CONFIG.map(game => ({
    ...game,
    url: getGameUrl(game.id, isLocalhost)
  }));
};

// 獲取遊戲 URL 的輔助函數
const getGameUrl = (gameId: string, isLocalhost: boolean): string => {
  switch (gameId) {
    case 'airplane-vite':
      return isLocalhost ? 'http://localhost:3002/' : '/games/airplane-game/';
    case 'airplane-main':
      return isLocalhost ? 'http://localhost:3002/' : '/games/airplane-game/';
    case 'airplane-iframe':
      return isLocalhost ? 'http://localhost:3002/' : '/games/airplane-game/';
    case 'shimozurdo-game':
      return '/games/shimozurdo-game/';
    case 'shimozurdo-responsive':
      return '/games/shimozurdo-game/';
    case 'matching-pairs':
      return '/games/matching-pairs';
    case 'quiz-game':
      return '/games/quiz';
    case 'sequence-game':
      return '/games/sequence';
    case 'flashcard-game':
      return '/games/flashcard';
    default:
      return '/games/default';
  }
};

const GameSwitcher: React.FC<GameSwitcherProps> = ({
  defaultGame = 'shimozurdo-game',
  geptLevel = 'elementary',
  onGameChange,
  onGameStateUpdate,
  className = '',
  hideGeptSelector = false,
  currentGeptLevel: propGeptLevel = 'elementary'
}) => {
  // 狀態管理
  const [currentGameId, setCurrentGameId] = useState<string>(defaultGame);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [gameStates, setGameStates] = useState<Record<string, GameState>>({});
  const [currentGeptLevel, setCurrentGeptLevel] = useState(geptLevel);
  const [mounted, setMounted] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Refs
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout>();
  const progressIntervalRef = useRef<NodeJS.Timeout>();

  // 客戶端掛載狀態
  useEffect(() => {
    setMounted(true);

    // 檢測螢幕尺寸
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // 動態設置容器尺寸以適應手機橫向模式
  useEffect(() => {
    const handleContainerResize = () => {
      const container = document.querySelector('.game-iframe-container') as HTMLElement;
      if (container) {
        const isLandscapeMobile = window.innerWidth === 812 && window.innerHeight === 375;

        if (isLandscapeMobile) {
          // 強制設置手機橫向模式樣式，覆蓋所有 CSS
          container.style.width = '100%';
          container.style.height = '375px';
          container.style.maxWidth = 'none';
          container.style.aspectRatio = '812/375';
          container.style.minHeight = '375px';
          container.style.maxHeight = '375px';

          console.log('🎯 強制設置手機橫向模式容器樣式:', {
            width: container.style.width,
            height: container.style.height,
            maxWidth: container.style.maxWidth,
            aspectRatio: container.style.aspectRatio,
            actualSize: `${container.offsetWidth}x${container.offsetHeight}`
          });
        }
      }
    };

    // 初始檢查
    handleContainerResize();

    // 監聽視窗尺寸變化
    window.addEventListener('resize', handleContainerResize);

    // 延遲執行以確保 DOM 已載入
    const timer = setTimeout(handleContainerResize, 100);
    const timer2 = setTimeout(handleContainerResize, 500);

    return () => {
      window.removeEventListener('resize', handleContainerResize);
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, []);

  // 獲取遊戲配置（只在客戶端執行）
  const gamesConfig = mounted ? getGamesConfig() : BASE_GAMES_CONFIG.map(game => ({ ...game, url: '' }));

  // 獲取當前遊戲配置
  const currentGame = gamesConfig.find(game => game.id === currentGameId);

  // 獲取可用遊戲（已完成的遊戲）
  const availableGames = gamesConfig.filter(game => game.status === 'completed');

  // 獲取開發中遊戲
  const developmentGames = gamesConfig.filter(game => game.status === 'development');

  // 載入進度模擬
  const simulateLoading = useCallback((estimatedTime: number) => {
    setIsLoading(true);
    setLoadingProgress(0);
    
    const progressStep = 100 / (estimatedTime / 50); // 每50ms更新一次
    
    progressIntervalRef.current = setInterval(() => {
      setLoadingProgress(prev => {
        const next = prev + progressStep + Math.random() * 5; // 添加隨機性
        return Math.min(next, 95); // 最多到95%，等待實際載入完成
      });
    }, 50);

    loadingTimeoutRef.current = setTimeout(() => {
      setLoadingProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setLoadingProgress(0);
      }, 200);
    }, estimatedTime);
  }, []);

  // 切換遊戲
  const switchGame = useCallback((gameId: string) => {
    console.log(`[GameSwitcher] 嘗試切換遊戲: ${gameId}, 當前: ${currentGameId}`);
    if (gameId === currentGameId || isLoading) {
      console.log(`[GameSwitcher] 切換被阻止: 相同遊戲或正在載入`);
      return;
    }

    const game = gamesConfig.find(g => g.id === gameId);
    if (!game || game.status !== 'completed') {
      console.log(`[GameSwitcher] 遊戲不可用: ${gameId}, 找到: ${!!game}, 狀態: ${game?.status}`);
      return;
    }

    console.log(`[GameSwitcher] 開始切換到: ${game.displayName} (${game.url})`);

    // 清理之前的計時器
    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    // 開始載入新遊戲
    simulateLoading(game.estimatedLoadTime);

    setCurrentGameId(gameId);
    setIsDropdownOpen(false);

    console.log(`[GameSwitcher] 狀態已更新: currentGameId -> ${gameId}`);
    
    // 通知父組件
    onGameChange?.(gameId);
    
    console.log(`🎮 切換到遊戲: ${game.displayName} (${game.type})`);
  }, [currentGameId, isLoading, simulateLoading, onGameChange]);

  // iframe 載入完成處理
  const handleIframeLoad = useCallback(() => {
    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    
    setLoadingProgress(100);
    setTimeout(() => {
      setIsLoading(false);
      setLoadingProgress(0);
    }, 100);
    
    console.log(`✅ 遊戲載入完成: ${currentGame?.displayName}`);
  }, [currentGame]);

  // iframe 消息處理
  const handleIframeMessage = useCallback((event: MessageEvent) => {
    if (!currentGame) return;

    try {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

      console.log('🎮 GameSwitcher 收到消息:', data);

      if (data.type === 'GAME_STATE_UPDATE') {
        const newState: GameState = {
          score: data.score || 0,
          level: data.level || currentGeptLevel,
          progress: data.progress || 0,
          timeSpent: data.timeSpent || 0
        };

        setGameStates(prev => ({
          ...prev,
          [currentGameId]: newState
        }));

        onGameStateUpdate?.(currentGameId, newState);
      } else if (data.type === 'GAME_COMPLETE') {
        // 🔧 修復白色閃爍：正確處理遊戲完成消息，防止意外重載
        console.log('🏁 遊戲完成，分數:', data.score, '生命值:', data.health);

        const finalState: GameState = {
          score: data.score || 0,
          level: currentGeptLevel,
          progress: 100, // 遊戲完成，進度100%
          timeSpent: 0 // 可以從遊戲數據中獲取
        };

        setGameStates(prev => ({
          ...prev,
          [currentGameId]: finalState
        }));

        onGameStateUpdate?.(currentGameId, finalState);

        // 不重載 iframe，保持遊戲狀態
        console.log('✅ 遊戲完成處理完畢，不重載 iframe');
      } else if (data.type === 'GAME_SCORE_UPDATE') {
        // 處理分數更新消息
        console.log('🏆 分數更新:', data.score, '生命值:', data.health);

        const updatedState: GameState = {
          score: data.score || 0,
          level: currentGeptLevel,
          progress: 0, // 遊戲進行中
          timeSpent: 0
        };

        setGameStates(prev => ({
          ...prev,
          [currentGameId]: updatedState
        }));

        onGameStateUpdate?.(currentGameId, updatedState);
      } else if (data.type === 'GAME_STATE_CHANGE') {
        // 處理遊戲狀態變化消息
        console.log('📊 遊戲狀態變化:', data.state);
      }
    } catch (error) {
      console.warn('處理 iframe 消息時出錯:', error);
    }
  }, [currentGame, currentGameId, currentGeptLevel, onGameStateUpdate]);

  // 設置消息監聽
  useEffect(() => {
    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, [handleIframeMessage]);

  // 清理計時器
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  // 獲取狀態指示器顏色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'development': return 'text-yellow-600';
      case 'planned': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  // 獲取狀態文字
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '已完成';
      case 'development': return '開發中';
      case 'planned': return '計劃中';
      default: return '未知';
    }
  };

  if (!currentGame) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="text-gray-500 text-lg">找不到指定的遊戲</div>
          <div className="text-gray-400 text-sm mt-2">遊戲 ID: {currentGameId}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`game-switcher-container ${className} w-full`} data-testid="game-switcher">
      {/* 緊湊標頭設計 - 手機優化，使用 JavaScript 控制顯示 */}
      {isMobile && (
        <div className="game-header bg-white rounded-lg shadow-sm border border-gray-200 mb-1" data-testid="game-header">
          <div className="flex justify-between items-center p-2 flex-wrap gap-2">
            {/* 左側資訊 */}
            <div className="left-info flex items-center gap-2 flex-1 min-w-0">
              <span className="text-lg flex-shrink-0">{currentGame.icon}</span>
              <strong className="font-semibold text-gray-900 text-sm truncate">{currentGame.displayName}</strong>
              <span className="status px-2 py-1 text-xs bg-green-100 text-green-800 rounded flex-shrink-0">✅ 已完成</span>
            </div>

            {/* 右側控制 */}
            <div className="right-controls flex items-center gap-2 flex-shrink-0">
              <span className="gept text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded">
                GEPT：{propGeptLevel === 'elementary' ? '初級' : propGeptLevel === 'intermediate' ? '中級' : '高級'}
              </span>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="switch-button px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                disabled={isLoading}
                style={{ minHeight: '36px' }}
              >
                切換遊戲
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 原始設計 - 桌面版，使用 JavaScript 控制顯示 */}
      {!isMobile && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-1">
          <div className="p-2 md:p-3">
            <div className="flex flex-col space-y-3 md:space-y-2">
              {/* 遊戲詳細信息 - 響應式佈局 */}
              <div className="flex items-center space-x-2 md:space-x-4 w-full">
                <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
                  <div className="text-xl md:text-2xl flex-shrink-0">{currentGame.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">{currentGame.displayName}</h3>
                    <div className="flex items-center space-x-1 md:space-x-2 flex-wrap">
                      <p className="text-xs md:text-sm text-gray-600 truncate">{currentGame.memoryType}</p>
                      <div className={`px-1 md:px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentGame.status)}`}>
                        {getStatusText(currentGame.status)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 載入時間顯示 - 桌面版顯示 */}
                <div className="hidden lg:block text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded flex-shrink-0">
                  載入: ~{currentGame.estimatedLoadTime}ms
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GEPT 等級選擇器 - 響應式設計 (條件渲染) - 只在桌面版顯示 */}
      {!hideGeptSelector && !isMobile && (
        <div className="gept-selector flex items-center space-x-2 w-full bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-1" data-testid="gept-selector">
          <BookOpenIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <span className="text-xs md:text-sm font-medium text-gray-700 flex-shrink-0">GEPT:</span>
          <div className="gept-buttons flex space-x-1 flex-1">
            {['elementary', 'intermediate', 'advanced'].map((level) => (
              <button
                key={level}
                onClick={() => setCurrentGeptLevel(level as any)}
                className={`px-2 py-2 rounded-full text-xs font-medium transition-colors flex-1 sm:flex-none sm:px-3 ${
                  currentGeptLevel === level
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                }`}
                style={{ minHeight: '44px' }}
              >
                {level === 'elementary' ? '初級' : level === 'intermediate' ? '中級' : '高級'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 手機版下拉選單 */}
      {isMobile && isDropdownOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setIsDropdownOpen(false)}>
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-lg max-h-96 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">選擇遊戲</h3>
                <button
                  onClick={() => setIsDropdownOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  style={{ minHeight: '44px', minWidth: '44px' }}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700 px-2 py-1">
                  可用遊戲 ({availableGames.length})
                </div>
                {availableGames.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => switchGame(game.id)}
                    className={`w-full text-left px-3 py-4 rounded-lg transition-colors ${
                      game.id === currentGameId ? 'bg-blue-50 border-2 border-blue-500' : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                    style={{ minHeight: '60px' }}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl flex-shrink-0">{game.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900">{game.displayName}</div>
                        <div className="text-sm text-gray-500 mt-1">{game.memoryType}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          載入時間: ~{game.estimatedLoadTime}ms
                        </div>
                      </div>
                      {game.id === currentGameId && (
                        <div className="text-blue-600 flex-shrink-0">✓</div>
                      )}
                    </div>
                  </button>
                ))}

                {developmentGames.length > 0 && (
                  <>
                    <div className="text-sm font-medium text-gray-700 px-2 py-1 mt-4 border-t pt-4">開發中遊戲</div>
                    {developmentGames.map((game) => (
                      <div
                        key={game.id}
                        className="w-full text-left px-3 py-4 rounded-lg opacity-60 cursor-not-allowed bg-gray-50"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl flex-shrink-0">{game.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900">{game.displayName}</div>
                            <div className="text-sm text-gray-500 mt-1">{game.memoryType}</div>
                            <div className="text-xs text-yellow-600 mt-1">🚧 開發中...</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 切換遊戲下拉選單 - 響應式設計 - 只在桌面版顯示 */}
      {!isMobile && (
        <div className="game-switcher-dropdown relative w-full bg-white rounded-lg shadow-sm border border-gray-200 mb-1">
          <div className="p-3">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full text-sm font-medium"
              disabled={isLoading}
              style={{ minHeight: '44px' }}
            >
              <div className="flex items-center space-x-2">
                <PlayIcon className="w-4 h-4" />
                <span>切換遊戲</span>
              </div>
              <ChevronDownIcon className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* 下拉選單 - 直接在按鈕容器內 */}
          {isDropdownOpen && (
            <>
              {/* 手機版遮罩 */}
              <div
                className="fixed inset-0 bg-black bg-opacity-50 sm:hidden z-40"
                onClick={() => setIsDropdownOpen(false)}
              />

              <div className="dropdown-menu absolute top-full left-0 right-0 sm:left-auto sm:right-0 mt-2 w-full sm:w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
            <div className="p-2">
              <div className="text-sm font-medium text-gray-700 px-3 py-2 border-b border-gray-100">
                可用遊戲 ({availableGames.length})
              </div>
              {availableGames.map((game) => (
                <button
                  key={game.id}
                  onClick={() => switchGame(game.id)}
                  className={`dropdown-item w-full text-left px-3 py-3 rounded-md hover:bg-gray-50 transition-colors ${
                    game.id === currentGameId ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                  style={{ minHeight: '44px' }}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg flex-shrink-0">{game.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{game.displayName}</div>
                      <div className="text-xs text-gray-500 truncate">{game.description}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        載入時間: ~{game.estimatedLoadTime}ms | {game.type}
                      </div>
                    </div>
                  </div>
                </button>
              ))}

              {developmentGames.length > 0 && (
                <>
                  <div className="text-sm font-medium text-gray-700 px-3 py-2 mt-4 border-t">開發中遊戲</div>
                  {developmentGames.map((game) => (
                    <div
                      key={game.id}
                      className="w-full text-left px-3 py-3 rounded-md opacity-60 cursor-not-allowed"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg flex-shrink-0">{game.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{game.displayName}</div>
                          <div className="text-xs text-gray-500 truncate">{game.description}</div>
                          <div className="text-xs text-yellow-600 mt-1">🚧 開發中...</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </>
      )}
        </div>
      )}

      {/* 載入進度條 - 在所有模式顯示 */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-1">
          <div className="px-4 py-4">
            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <div className="text-sm text-gray-600">{Math.round(loadingProgress)}%</div>
            </div>
            <div className="text-xs text-gray-500 mt-1">正在載入 {currentGame.displayName}...</div>
          </div>
        </div>
      )}

      {/* 遊戲 iframe 容器 - 響應式設計 */}
      <div
        className="game-iframe-container relative bg-white overflow-hidden mx-auto w-full"
        style={{
          aspectRatio: isMobile ? '812/375' : '1274/739',
          minHeight: '300px',
          maxHeight: isMobile ? '375px' : '739px',
          width: '100%',
          height: isMobile ? '375px' : 'auto',
          // 強制覆蓋CSS限制
          maxWidth: 'none !important' as any,
        }}
        data-testid="game-container"
      >
        {isLoading && (
          <div className="loading-overlay absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center z-10">
            <div className="loading-content text-center">
              <div className="spinner animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <div className="loading-text mt-4 text-gray-600">載入中...</div>
              <div className="text-sm text-gray-500 mt-1">{currentGame?.displayName || '遊戲'}</div>
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={currentGame.url}
          className="w-full h-full border-0"
          title={currentGame.displayName}
          onLoad={handleIframeLoad}
          allow="fullscreen; autoplay; microphone; camera"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
        />
      </div>

      {/* 遊戲狀態顯示 - 響應式設計 */}
      {gameStates[currentGameId] && (
        <div className="game-status-panel mt-4 bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">遊戲狀態</h4>
          <div className="game-status-grid grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="game-status-item">
              <div className="label text-gray-500">分數</div>
              <div className="value font-semibold">{gameStates[currentGameId].score}</div>
            </div>
            <div className="game-status-item">
              <div className="label text-gray-500">等級</div>
              <div className="value font-semibold">{gameStates[currentGameId].level}</div>
            </div>
            <div className="game-status-item">
              <div className="label text-gray-500">進度</div>
              <div className="value font-semibold">{gameStates[currentGameId].progress}%</div>
            </div>
            <div className="game-status-item">
              <div className="label text-gray-500">遊戲時間</div>
              <div className="value font-semibold">{Math.round(gameStates[currentGameId].timeSpent / 1000)}s</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameSwitcher;
