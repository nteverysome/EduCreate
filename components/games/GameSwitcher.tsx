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
      return '/games/airplane';
    case 'airplane-iframe':
      return isLocalhost ? 'http://localhost:3002/' : '/games/airplane-game/';
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
  defaultGame = 'airplane-vite',
  geptLevel = 'elementary',
  onGameChange,
  onGameStateUpdate,
  className = ''
}) => {
  // 狀態管理
  const [currentGameId, setCurrentGameId] = useState<string>(defaultGame);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [gameStates, setGameStates] = useState<Record<string, GameState>>({});
  const [currentGeptLevel, setCurrentGeptLevel] = useState(geptLevel);
  const [mounted, setMounted] = useState<boolean>(false);

  // Refs
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout>();
  const progressIntervalRef = useRef<NodeJS.Timeout>();

  // 客戶端掛載狀態
  useEffect(() => {
    setMounted(true);
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
    if (gameId === currentGameId || isLoading) return;

    const game = gamesConfig.find(g => g.id === gameId);
    if (!game || game.status !== 'completed') return;

    // 清理之前的計時器
    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    // 開始載入新遊戲
    simulateLoading(game.estimatedLoadTime);
    
    setCurrentGameId(gameId);
    setIsDropdownOpen(false);
    
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
    <div className={`game-switcher ${className} w-full`}>
      {/* 簡化的遊戲控制器 - 響應式佈局 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-1">
        <div className="p-2 md:p-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
            {/* 遊戲詳細信息 */}
            <div className="flex items-center space-x-2 md:space-x-4 flex-1 min-w-0">
              <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
                <div className="text-xl md:text-2xl">{currentGame.icon}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">{currentGame.displayName}</h3>
                  <div className="flex items-center space-x-1 md:space-x-2">
                    <p className="text-xs md:text-sm text-gray-600 truncate">{currentGame.memoryType}</p>
                    <div className={`px-1 md:px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentGame.status)}`}>
                      {getStatusText(currentGame.status)}
                    </div>
                  </div>
                </div>
              </div>

              {/* 載入時間顯示 - 桌面版顯示 */}
              <div className="hidden md:block text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                載入: ~{currentGame.estimatedLoadTime}ms
              </div>
            </div>

            {/* 遊戲控制按鈕組 + GEPT 等級選擇器 */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
              {/* GEPT 等級選擇器 */}
              <div className="flex items-center space-x-2">
                <BookOpenIcon className="w-4 h-4 text-gray-500" />
                <span className="text-xs md:text-sm font-medium text-gray-700">GEPT:</span>
                <div className="flex space-x-1 flex-1 md:flex-none">
                  {['elementary', 'intermediate', 'advanced'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setCurrentGeptLevel(level as any)}
                      className={`px-1 md:px-2 py-1 rounded-full text-xs font-medium transition-colors flex-1 md:flex-none ${
                        currentGeptLevel === level
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                      }`}
                    >
                      {level === 'elementary' ? '初級' : level === 'intermediate' ? '中級' : '高級'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 切換遊戲下拉選單 */}
              <div className="relative w-full md:w-auto">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-center space-x-2 px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full md:w-auto text-sm"
                  disabled={isLoading}
                >
                  <PlayIcon className="w-4 h-4" />
                  <span>切換遊戲</span>
                  <ChevronDownIcon className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

              {/* 下拉選單 */}
              {isDropdownOpen && (
                <div className="absolute right-0 md:right-0 left-0 md:left-auto mt-2 w-full md:w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-2">
                    <div className="text-sm font-medium text-gray-700 px-3 py-2">可用遊戲</div>
                    {availableGames.map((game) => (
                      <button
                        key={game.id}
                        onClick={() => switchGame(game.id)}
                        className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 transition-colors ${
                          game.id === currentGameId ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{game.icon}</span>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{game.displayName}</div>
                            <div className="text-xs text-gray-500">{game.description}</div>
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
                            className="w-full text-left px-3 py-2 rounded-md opacity-60 cursor-not-allowed"
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-lg">{game.icon}</span>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{game.displayName}</div>
                                <div className="text-xs text-gray-500">{game.description}</div>
                                <div className="text-xs text-yellow-600 mt-1">🚧 開發中...</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>

          {/* GEPT 等級選擇器已移到按鈕區域 */}
        </div>

        {/* 載入進度條 */}
        {isLoading && (
          <div className="px-4 pb-4">
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
        )}
      </div>

      {/* 遊戲 iframe 容器 - 響應式設計 */}
      <div
        className="relative bg-white overflow-hidden mx-auto w-full max-w-[1274px]"
        style={{
          aspectRatio: '1274/739',
          minHeight: '400px',
          maxHeight: '739px'
        }}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <div className="mt-4 text-gray-600">載入中...</div>
              <div className="text-sm text-gray-500 mt-1">{currentGame.displayName}</div>
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

      {/* 遊戲狀態顯示 */}
      {gameStates[currentGameId] && (
        <div className="mt-4 bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">遊戲狀態</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-500">分數</div>
              <div className="font-semibold">{gameStates[currentGameId].score}</div>
            </div>
            <div>
              <div className="text-gray-500">等級</div>
              <div className="font-semibold">{gameStates[currentGameId].level}</div>
            </div>
            <div>
              <div className="text-gray-500">進度</div>
              <div className="font-semibold">{gameStates[currentGameId].progress}%</div>
            </div>
            <div>
              <div className="text-gray-500">遊戲時間</div>
              <div className="font-semibold">{Math.round(gameStates[currentGameId].timeSpent / 1000)}s</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameSwitcher;
