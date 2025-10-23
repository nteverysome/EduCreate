'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameTTSPanel, type Vocabulary } from '@/components/tts/GameTTSPanel';
import { BilingualTTSManager } from '@/lib/tts/BilingualTTSManager';

// 遊戲狀態類型
interface GameState {
  score: number;
  level: string;
  progress: number;
  timeSpent: number;
}

// 組件 Props
interface ShimozurdoGameContainerProps {
  geptLevel?: 'elementary' | 'intermediate' | 'advanced';
  onGameStateUpdate?: (state: GameState) => void;
  className?: string;
}

const ShimozurdoGameContainer: React.FC<ShimozurdoGameContainerProps> = ({
  geptLevel = 'elementary',
  onGameStateUpdate,
  className = ''
}) => {
  // 狀態管理
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    level: geptLevel,
    progress: 0,
    timeSpent: 0
  });
  const [mounted, setMounted] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [showTTSPanel, setShowTTSPanel] = useState<boolean>(false);

  // Refs
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout>();
  const progressIntervalRef = useRef<NodeJS.Timeout>();
  const ttsManagerRef = useRef<BilingualTTSManager | null>(null);

  // 遊戲配置
  const gameConfig = {
    id: 'shimozurdo-game',
    name: 'shimozurdo',
    displayName: 'Shimozurdo 雲朵遊戲',
    description: 'Phaser 3 雲朵碰撞遊戲，支援全螢幕和響應式設計，記憶科學驅動的英語學習',
    url: '/games/shimozurdo-game/',
    type: 'iframe' as const,
    memoryType: '動態反應記憶',
    geptLevels: ['elementary', 'intermediate', 'advanced'] as const,
    status: 'completed' as const,
    icon: '☁️',
    estimatedLoadTime: 800
  };

  // 客戶端掛載狀態
  useEffect(() => {
    setMounted(true);

    // 檢測螢幕尺寸
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // 動態設置容器尺寸以適應不同設備
  useEffect(() => {
    const handleContainerResize = () => {
      const container = document.querySelector('.shimozurdo-game-container') as HTMLElement;
      if (container) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const isLandscapeMobile = width > height && width <= 812;
        const isPortraitMobile = width <= 375;
        const isTablet = width > 375 && width <= 1024;

        if (isLandscapeMobile) {
          // 手機橫向模式優化
          container.style.width = '100%';
          container.style.height = `${Math.min(height - 100, 375)}px`; // 留出導航空間
          container.style.maxWidth = 'none';
          container.style.aspectRatio = '16/9';
          container.style.minHeight = '300px';
          container.style.maxHeight = '375px';
          console.log('🎯 手機橫向模式容器優化');
        } else if (isPortraitMobile) {
          // 手機直向模式優化
          container.style.width = '100%';
          container.style.height = 'auto';
          container.style.aspectRatio = '4/3';
          container.style.minHeight = '280px';
          container.style.maxHeight = '400px';
          console.log('🎯 手機直向模式容器優化');
        } else if (isTablet) {
          // 平板模式優化
          container.style.width = '100%';
          container.style.height = 'auto';
          container.style.aspectRatio = '16/10';
          container.style.minHeight = '400px';
          container.style.maxHeight = '600px';
          console.log('🎯 平板模式容器優化');
        } else {
          // 桌面模式 - 恢復默認
          container.style.width = '';
          container.style.height = '';
          container.style.aspectRatio = '';
          container.style.minHeight = '';
          container.style.maxHeight = '';
          console.log('🎯 桌面模式容器優化');
        }
      }
    };

    handleContainerResize();
    window.addEventListener('resize', handleContainerResize);

    return () => window.removeEventListener('resize', handleContainerResize);
  }, []);

  // 模擬載入進度
  const simulateLoading = useCallback((estimatedTime: number) => {
    setIsLoading(true);
    setLoadingProgress(0);

    // 清除之前的計時器
    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    // 進度條動畫
    let progress = 0;
    progressIntervalRef.current = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 90) progress = 90;
      setLoadingProgress(progress);
    }, 100);

    // 載入超時處理
    loadingTimeoutRef.current = setTimeout(() => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setLoadingProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setLoadingProgress(0);
      }, 200);
    }, estimatedTime);
  }, []);

  // 初始載入
  useEffect(() => {
    if (mounted) {
      simulateLoading(gameConfig.estimatedLoadTime);
    }
  }, [mounted, simulateLoading]);

  // 處理 TTS Manager 準備就緒
  const handleTTSManagerReady = useCallback((manager: BilingualTTSManager) => {
    ttsManagerRef.current = manager;
    console.log('✅ TTS Manager 準備就緒');

    // 將 TTS Manager 注入到遊戲中
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        // 等待遊戲完全載入後再注入
        const checkGameReady = setInterval(() => {
          const gameWindow = iframeRef.current?.contentWindow as any;
          if (gameWindow && gameWindow.game) {
            gameWindow.game.bilingualManager = manager;
            console.log('✅ TTS Manager 已注入到遊戲中');
            clearInterval(checkGameReady);
          }
        }, 500);

        // 10秒後停止檢查
        setTimeout(() => clearInterval(checkGameReady), 10000);
      } catch (error) {
        console.error('❌ 注入 TTS Manager 失敗:', error);
      }
    }
  }, []);

  // iframe 載入完成處理
  const handleIframeLoad = useCallback(() => {
    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    setLoadingProgress(100);
    setTimeout(() => {
      setIsLoading(false);
      setLoadingProgress(0);
    }, 100);

    console.log(`✅ Shimozurdo 遊戲載入完成`);

    // 從遊戲中獲取詞彙列表
    setTimeout(() => {
      try {
        const gameWindow = iframeRef.current?.contentWindow as any;
        if (gameWindow && gameWindow.game && gameWindow.game.geptManager) {
          const words = gameWindow.game.geptManager.getCurrentLevelWords();
          if (words && words.length > 0) {
            setVocabulary(words.map((word: any) => ({
              id: word.id,
              english: word.english,
              chinese: word.chinese,
              geptLevel: word.geptLevel || 'ELEMENTARY'
            })));
            console.log(`✅ 獲取到 ${words.length} 個詞彙`);
          }
        }
      } catch (error) {
        console.error('❌ 獲取詞彙失敗:', error);
      }
    }, 1000);
  }, []);

  // iframe 消息處理
  const handleIframeMessage = useCallback((event: MessageEvent) => {
    try {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

      console.log('🎮 Shimozurdo 收到消息:', data);

      if (data.type === 'GAME_STATE_UPDATE') {
        const newState: GameState = {
          score: data.score || 0,
          level: data.level || geptLevel,
          progress: data.progress || 0,
          timeSpent: data.timeSpent || 0
        };

        setGameState(newState);
        onGameStateUpdate?.(newState);
      } else if (data.type === 'GAME_SCORE_UPDATE') {
        // 處理分數更新消息
        console.log('🏆 分數更新:', data.score, '生命值:', data.health);

        const updatedState: GameState = {
          score: data.score || 0,
          level: geptLevel,
          progress: 0, // 遊戲進行中
          timeSpent: 0
        };

        setGameState(updatedState);
        onGameStateUpdate?.(updatedState);
      }
    } catch (error) {
      console.warn('處理 iframe 消息時出錯:', error);
    }
  }, [geptLevel, onGameStateUpdate]);

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

  if (!mounted) {
    return <div className="w-full h-64 bg-gray-100 animate-pulse rounded-lg"></div>;
  }

  return (
    <div className={`shimozurdo-game-wrapper ${className}`}>
      {/* 遊戲標題 */}
      <div className="game-header bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="game-info flex items-center space-x-3">
              <div className="game-icon text-2xl">{gameConfig.icon}</div>
              <div>
                <h2 className="game-title text-lg font-semibold text-gray-900">
                  {gameConfig.displayName}
                </h2>
                <p className="game-description text-sm text-gray-600">
                  {gameConfig.description}
                </p>
              </div>
            </div>
            <div className="game-status flex items-center space-x-2">
              <span className="status-badge text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                ✅ 已完成
              </span>
              <span className="gept-badge text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded">
                GEPT：{geptLevel === 'elementary' ? '初級' : geptLevel === 'intermediate' ? '中級' : '高級'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 載入進度條 */}
      {isLoading && (
        <div className="loading-progress mb-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">載入中...</span>
            <span className="text-sm text-gray-500">{Math.round(loadingProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">正在載入 {gameConfig.displayName}...</div>
        </div>
      )}

      {/* 遊戲 iframe 容器 - 響應式設計 */}
      <div
        className="shimozurdo-game-container relative bg-white overflow-hidden mx-auto w-full rounded-lg shadow-sm border border-gray-200"
        style={{
          aspectRatio: (() => {
            const width = typeof window !== 'undefined' ? window.innerWidth : 800;
            const height = typeof window !== 'undefined' ? window.innerHeight : 600;
            const isLandscape = width > height;

            if (width <= 768) {
              // 手機和小平板
              return isLandscape ? '16/9' : '4/3';
            } else if (width <= 1024) {
              // 平板
              return '16/10';
            } else {
              // 桌面
              return '1274/739';
            }
          })(),
          minHeight: (() => {
            const width = typeof window !== 'undefined' ? window.innerWidth : 800;
            if (width <= 480) return '280px';
            if (width <= 768) return '320px';
            if (width <= 1024) return '400px';
            return '500px';
          })(),
          maxHeight: (() => {
            const width = typeof window !== 'undefined' ? window.innerWidth : 800;
            const height = typeof window !== 'undefined' ? window.innerHeight : 600;
            if (width <= 768) return `${Math.min(height - 200, 500)}px`;
            if (width <= 1024) return '600px';
            return '739px';
          })(),
          width: '100%',
          maxWidth: 'none',
        }}
        data-testid="shimozurdo-game-container"
      >
        {isLoading && (
          <div className="loading-overlay absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center z-10">
            <div className="loading-content text-center">
              <div className="spinner animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <div className="text-sm font-medium text-gray-700 mt-2">載入中 {Math.round(loadingProgress)}%</div>
              <div className="text-sm text-gray-500 mt-1">{gameConfig.displayName}</div>
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={gameConfig.url}
          className="w-full h-full border-0 rounded-lg"
          title={gameConfig.displayName}
          onLoad={handleIframeLoad}
          allow="fullscreen; autoplay; microphone; camera"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
        />
      </div>

      {/* 遊戲狀態顯示 */}
      {gameState.score > 0 && (
        <div className="game-status-panel mt-4 bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">遊戲狀態</h4>
          <div className="game-status-grid grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="game-status-item">
              <div className="label text-gray-500">分數</div>
              <div className="value font-semibold">{gameState.score}</div>
            </div>
            <div className="game-status-item">
              <div className="label text-gray-500">等級</div>
              <div className="value font-semibold">{gameState.level}</div>
            </div>
            <div className="game-status-item">
              <div className="label text-gray-500">進度</div>
              <div className="value font-semibold">{gameState.progress}%</div>
            </div>
            <div className="game-status-item">
              <div className="label text-gray-500">時間</div>
              <div className="value font-semibold">{gameState.timeSpent}s</div>
            </div>
          </div>
        </div>
      )}

      {/* TTS 控制面板切換按鈕 */}
      <div className="mt-4">
        <button
          onClick={() => setShowTTSPanel(!showTTSPanel)}
          className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <span>🔊</span>
          <span>{showTTSPanel ? '隱藏' : '顯示'} TTS 控制面板</span>
        </button>
      </div>

      {/* TTS 控制面板 */}
      {showTTSPanel && vocabulary.length > 0 && (
        <div className="mt-4">
          <GameTTSPanel
            gameId={gameConfig.id}
            vocabulary={vocabulary}
            onManagerReady={handleTTSManagerReady}
          />
        </div>
      )}
    </div>
  );
};

export default ShimozurdoGameContainer;
