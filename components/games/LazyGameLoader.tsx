/**
 * LazyGameLoader - React.lazy 懶加載遊戲載入器
 * 為輕量級和中等遊戲實現動態載入，減少初始載入時間和記憶體使用
 * 支援載入狀態、錯誤處理和性能監控
 */

import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { GameConfig } from '../../lib/games/UnifiedGameManager';

// 懶加載組件快取
const lazyComponentCache = new Map<string, React.LazyExoticComponent<any>>();

// 載入狀態接口
interface LazyLoadState {
  isLoading: boolean;
  error: string | null;
  loadTime: number;
  retryCount: number;
}

// 組件 Props
interface LazyGameLoaderProps {
  gameConfig: GameConfig;
  geptLevel?: 'elementary' | 'intermediate' | 'advanced';
  onGameReady?: () => void;
  onError?: (error: string) => void;
  onLoadTimeUpdate?: (loadTime: number) => void;
  className?: string;
}

// 載入骨架屏組件
const GameLoadingSkeleton: React.FC<{ gameConfig: GameConfig }> = ({ gameConfig }) => (
  <div className="animate-pulse bg-gray-50 rounded-lg p-8">
    <div className="text-center">
      {/* 遊戲圖標骨架 */}
      <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
      
      {/* 標題骨架 */}
      <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-6"></div>
      
      {/* 載入進度 */}
      <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto mb-4">
        <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
      </div>
      
      {/* 載入信息 */}
      <div className="text-sm text-gray-500">
        載入 {gameConfig.displayName}...
      </div>
      <div className="text-xs text-gray-400 mt-1">
        預估時間: {gameConfig.estimatedLoadTime}ms
      </div>
      
      {/* 遊戲控制骨架 */}
      <div className="mt-8 space-y-3">
        <div className="h-10 bg-gray-200 rounded w-full"></div>
        <div className="flex space-x-2">
          <div className="h-8 bg-gray-200 rounded flex-1"></div>
          <div className="h-8 bg-gray-200 rounded flex-1"></div>
          <div className="h-8 bg-gray-200 rounded flex-1"></div>
        </div>
      </div>
    </div>
  </div>
);

// 錯誤邊界組件
const GameErrorBoundary: React.FC<{
  error: string;
  gameConfig: GameConfig;
  onRetry: () => void;
  retryCount: number;
}> = ({ error, gameConfig, onRetry, retryCount }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
    <div className="text-red-600 text-6xl mb-4">⚠️</div>
    <h3 className="text-lg font-semibold text-red-800 mb-2">載入失敗</h3>
    <p className="text-red-600 mb-4">{gameConfig.displayName}</p>
    <div className="text-sm text-red-500 mb-6 bg-red-100 p-3 rounded">
      錯誤詳情: {error}
    </div>
    
    <div className="space-y-3">
      <button
        onClick={onRetry}
        disabled={retryCount >= 3}
        className={`px-6 py-2 rounded-lg font-medium ${
          retryCount >= 3
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-red-600 text-white hover:bg-red-700'
        }`}
      >
        {retryCount >= 3 ? '重試次數已達上限' : `重試 (${retryCount}/3)`}
      </button>
      
      <div className="text-xs text-gray-500">
        載入策略: {gameConfig.loadStrategy} | 
        記憶體限制: {gameConfig.memoryLimit}MB |
        組件路徑: {gameConfig.componentPath}
      </div>
    </div>
  </div>
);

const LazyGameLoader: React.FC<LazyGameLoaderProps> = ({
  gameConfig,
  geptLevel = 'elementary',
  onGameReady,
  onError,
  onLoadTimeUpdate,
  className = ''
}) => {
  const [loadState, setLoadState] = useState<LazyLoadState>({
    isLoading: true,
    error: null,
    loadTime: 0,
    retryCount: 0
  });

  // 創建懶加載組件
  const createLazyComponent = useCallback((config: GameConfig) => {
    // 檢查快取
    if (lazyComponentCache.has(config.id)) {
      return lazyComponentCache.get(config.id)!;
    }

    // 創建新的懶加載組件
    const LazyComponent = React.lazy(async () => {
      const startTime = performance.now();
      
      try {
        console.log(`⏳ 開始懶加載: ${config.displayName}`);
        
        // 根據組件路徑動態導入
        let module;
        switch (config.id) {
          case 'quiz':
            module = await import('./QuizGame');
            break;
          case 'flashcard':
            module = await import('./FlashcardGame');
            break;
          case 'true-false':
            module = await import('./TrueFalseGame');
            break;
          case 'type-answer':
            module = await import('./TypeAnswerGame');
            break;
          case 'crossword':
            module = await import('./CrosswordGame');
            break;
          case 'wordsearch':
            module = await import('./WordsearchGame');
            break;
          case 'hangman':
            module = await import('./HangmanGame');
            break;
          case 'anagram':
            module = await import('./AnagramGame');
            break;
          case 'group-sort':
            module = await import('./GroupSortGame');
            break;
          case 'word-scramble':
            module = await import('./WordScrambleGame');
            break;
          case 'gameshow-quiz':
            module = await import('./GameshowQuizGame');
            break;
          case 'flip-tiles':
            module = await import('./FlipTilesGame');
            break;
          case 'image-quiz':
            module = await import('./ImageQuizGame');
            break;
          case 'labelled-diagram':
            module = await import('./LabelledDiagramGame');
            break;
          case 'balloon-pop':
            module = await import('./BalloonPopGame');
            break;
          case 'spin-wheel':
            module = await import('./SpinWheelGame');
            break;
          case 'simple-match':
            module = await import('./SimpleMatchGame');
            break;
          case 'memory-card':
            module = await import('./MemoryCardGame');
            break;
          case 'speaking-cards':
            module = await import('./SpeakingCardsGame');
            break;
          case 'complete-sentence':
            module = await import('./CompleteSentenceGame');
            break;
          default:
            throw new Error(`不支援的遊戲組件: ${config.id}`);
        }

        const loadTime = performance.now() - startTime;
        console.log(`✅ 懶加載完成: ${config.displayName} (${Math.round(loadTime)}ms)`);
        
        // 更新載入時間
        setLoadState(prev => ({ ...prev, loadTime }));
        onLoadTimeUpdate?.(loadTime);
        
        return module;
      } catch (error) {
        const loadTime = performance.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : '未知載入錯誤';
        
        console.error(`❌ 懶加載失敗: ${config.displayName}`, error);
        
        setLoadState(prev => ({
          ...prev,
          error: errorMessage,
          loadTime,
          isLoading: false
        }));
        
        onError?.(errorMessage);
        
        // 返回錯誤組件
        return {
          default: () => (
            <div className="text-red-600 p-4 text-center">
              載入失敗: {config.displayName}
            </div>
          )
        };
      }
    });

    // 快取組件
    lazyComponentCache.set(config.id, LazyComponent);
    return LazyComponent;
  }, [onError, onLoadTimeUpdate]);

  // 重試載入
  const handleRetry = useCallback(() => {
    if (loadState.retryCount >= 3) return;

    setLoadState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      retryCount: prev.retryCount + 1
    }));

    // 清除快取，強制重新載入
    lazyComponentCache.delete(gameConfig.id);
  }, [gameConfig.id, loadState.retryCount]);

  // 處理組件載入完成
  const handleComponentReady = useCallback(() => {
    setLoadState(prev => ({
      ...prev,
      isLoading: false,
      error: null
    }));
    
    onGameReady?.();
    console.log(`🎮 遊戲準備完成: ${gameConfig.displayName}`);
  }, [gameConfig.displayName, onGameReady]);

  // 創建懶加載組件
  const LazyGameComponent = createLazyComponent(gameConfig);

  // 如果有錯誤，顯示錯誤界面
  if (loadState.error) {
    return (
      <div className={className}>
        <GameErrorBoundary
          error={loadState.error}
          gameConfig={gameConfig}
          onRetry={handleRetry}
          retryCount={loadState.retryCount}
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <Suspense fallback={<GameLoadingSkeleton gameConfig={gameConfig} />}>
        <LazyGameComponent
          geptLevel={geptLevel}
          onGameReady={handleComponentReady}
          config={{
            geptLevel,
            enableSound: true,
            enableHapticFeedback: true,
            difficulty: 'medium',
            gameMode: 'practice'
          }}
        />
      </Suspense>
      
      {/* 載入性能信息 */}
      {loadState.loadTime > 0 && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          載入時間: {Math.round(loadState.loadTime)}ms | 
          記憶體限制: {gameConfig.memoryLimit}MB |
          策略: {gameConfig.loadStrategy}
        </div>
      )}
    </div>
  );
};

// 預載入函數
export const preloadGameComponent = async (gameId: string): Promise<void> => {
  try {
    console.log(`🚀 預載入遊戲組件: ${gameId}`);
    
    // 這裡可以添加預載入邏輯
    // 例如預載入關鍵資源、字體、圖片等
    
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log(`✅ 預載入完成: ${gameId}`);
  } catch (error) {
    console.warn(`⚠️ 預載入失敗: ${gameId}`, error);
  }
};

// 清理快取函數
export const clearLazyComponentCache = (): void => {
  lazyComponentCache.clear();
  console.log('🧹 懶加載組件快取已清理');
};

// 獲取快取統計
export const getLazyComponentCacheStats = () => {
  return {
    cacheSize: lazyComponentCache.size,
    cachedComponents: Array.from(lazyComponentCache.keys())
  };
};

export default LazyGameLoader;
