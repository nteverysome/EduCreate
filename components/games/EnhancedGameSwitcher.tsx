/**
 * EnhancedGameSwitcher - 增強版遊戲切換器
 * 整合 UnifiedGameManager 和 CDNGameLoader，支援混合載入策略
 * 解決多遊戲干擾問題，提供統一的遊戲管理體驗
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UnifiedGameManager, GameInstance } from '../../lib/games/UnifiedGameManager';
import { ALL_GAME_CONFIGS, getGameConfig } from '../../lib/games/GameClassificationConfig';
import CDNGameLoader from './CDNGameLoader';
import VitePhaserGameLoader from './VitePhaserGameLoader';
import { PlayIcon, ChevronDownIcon, BookOpenIcon } from '@heroicons/react/24/outline';

// 組件 Props 接口
export interface EnhancedGameSwitcherProps {
  defaultGame?: string;
  geptLevel?: 'elementary' | 'intermediate' | 'advanced';
  onGameChange?: (gameId: string) => void;
  onGameStateUpdate?: (gameId: string, state: any) => void;
  className?: string;
}

// 遊戲載入狀態
interface GameLoadState {
  isLoading: boolean;
  loadingProgress: number;
  error: string | null;
  currentGameId: string | null;
}

const EnhancedGameSwitcher: React.FC<EnhancedGameSwitcherProps> = ({
  defaultGame = 'quiz',
  geptLevel = 'elementary',
  onGameChange,
  onGameStateUpdate,
  className = ''
}) => {
  // 狀態管理
  const [currentGameId, setCurrentGameId] = useState<string>(defaultGame);
  const [currentGeptLevel, setCurrentGeptLevel] = useState(geptLevel);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [loadState, setLoadState] = useState<GameLoadState>({
    isLoading: false,
    loadingProgress: 0,
    error: null,
    currentGameId: null
  });
  const [gameStatus, setGameStatus] = useState<any>(null);

  // Refs
  const gameManagerRef = useRef<UnifiedGameManager | null>(null);
  const currentGameInstanceRef = useRef<GameInstance | null>(null);

  // 初始化遊戲管理器
  useEffect(() => {
    gameManagerRef.current = new UnifiedGameManager({
      maxActiveGames: 3,
      memoryLimit: 500,
      enablePerformanceMonitoring: true,
      enableAutoSave: true
    });

    // 載入預設遊戲
    switchGame(defaultGame);

    // 清理函數
    return () => {
      if (gameManagerRef.current) {
        gameManagerRef.current.destroy();
      }
    };
  }, []);

  // 定期更新遊戲狀態
  useEffect(() => {
    const statusInterval = setInterval(() => {
      if (gameManagerRef.current) {
        const status = gameManagerRef.current.getGameStatus();
        setGameStatus(status);
      }
    }, 2000);

    return () => clearInterval(statusInterval);
  }, []);

  // 切換遊戲
  const switchGame = useCallback(async (gameId: string) => {
    if (!gameManagerRef.current || gameId === currentGameId) return;

    const config = getGameConfig(gameId);
    if (!config) {
      console.error(`找不到遊戲配置: ${gameId}`);
      return;
    }

    setLoadState({
      isLoading: true,
      loadingProgress: 0,
      error: null,
      currentGameId: gameId
    });

    try {
      // 使用統一遊戲管理器切換遊戲
      const instance = await gameManagerRef.current.switchGame(gameId);
      
      if (instance) {
        currentGameInstanceRef.current = instance;
        setCurrentGameId(gameId);
        setIsDropdownOpen(false);
        
        // 通知父組件
        onGameChange?.(gameId);
        
        console.log(`✅ 遊戲切換成功: ${config.displayName}`);
      } else {
        throw new Error('遊戲載入失敗');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知錯誤';
      setLoadState(prev => ({
        ...prev,
        error: errorMessage
      }));
      console.error('遊戲切換失敗:', error);
    } finally {
      setLoadState(prev => ({
        ...prev,
        isLoading: false,
        loadingProgress: 100
      }));
    }
  }, [currentGameId, onGameChange]);

  // 暫停遊戲
  const pauseGame = useCallback((gameId: string) => {
    if (gameManagerRef.current) {
      gameManagerRef.current.pauseGame(gameId);
    }
  }, []);

  // 恢復遊戲
  const resumeGame = useCallback((gameId: string) => {
    if (gameManagerRef.current) {
      gameManagerRef.current.resumeGame(gameId);
    }
  }, []);

  // 獲取當前遊戲配置
  const currentGame = getGameConfig(currentGameId);
  if (!currentGame) {
    return <div className="text-red-500">找不到遊戲配置: {currentGameId}</div>;
  }

  // 獲取可用遊戲（已完成的遊戲）
  const availableGames = ALL_GAME_CONFIGS.filter(game => 
    // 這裡可以添加遊戲可用性檢查邏輯
    true
  );

  // 按類型分組遊戲
  const gamesByType = {
    lightweight: availableGames.filter(game => game.type === 'lightweight'),
    medium: availableGames.filter(game => game.type === 'medium'),
    heavyweight: availableGames.filter(game => game.type === 'heavyweight')
  };

  // 渲染遊戲內容
  const renderGameContent = () => {
    if (loadState.isLoading) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <div className="mt-4 text-gray-600">載入中...</div>
            <div className="text-sm text-gray-500 mt-1">{currentGame.displayName}</div>
            <div className="w-64 bg-gray-200 rounded-full h-2 mt-3">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${loadState.loadingProgress}%` }}
              />
            </div>
          </div>
        </div>
      );
    }

    if (loadState.error) {
      return (
        <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg">
          <div className="text-center">
            <div className="text-red-600 text-lg font-medium">載入失敗</div>
            <div className="text-red-500 text-sm mt-2">{loadState.error}</div>
            <button
              onClick={() => switchGame(currentGameId)}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              重試
            </button>
          </div>
        </div>
      );
    }

    // 根據載入策略渲染不同的遊戲內容
    switch (currentGame.loadStrategy) {
      case 'cdn':
        return (
          <CDNGameLoader
            gameId={currentGameId}
            geptLevel={currentGeptLevel}
            language="zh-TW"
            onGameReady={() => console.log('CDN 遊戲準備完成')}
            onError={(error) => setLoadState(prev => ({ ...prev, error }))}
          />
        );

      case 'iframe':
        return (
          <VitePhaserGameLoader
            gameId={currentGameId}
            iframeUrl={currentGame.iframeUrl || 'http://localhost:3004/games/airplane-game/'}
            geptLevel={currentGeptLevel}
            onGameReady={() => {
              console.log('🎮 Vite + Phaser3 遊戲準備完成');
              setLoadState(prev => ({ ...prev, isLoading: false, error: null }));
            }}
            onGameStateUpdate={(state) => {
              console.log('📊 Vite + Phaser3 遊戲狀態更新:', state);
              onGameStateUpdate?.(currentGameId, state);
            }}
            onError={(error) => {
              console.error('❌ Vite + Phaser3 遊戲錯誤:', error);
              setLoadState(prev => ({ ...prev, error, isLoading: false }));
            }}
            className="w-full"
          />
        );

      case 'lazy':
        return (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <div className="text-2xl mb-4">{currentGame.displayName}</div>
            <div className="text-gray-600">懶載入遊戲組件</div>
            <div className="text-sm text-gray-500 mt-2">
              載入策略: {currentGame.loadStrategy} |
              記憶體限制: {currentGame.memoryLimit}MB |
              預估載入時間: {currentGame.estimatedLoadTime}ms
            </div>
          </div>
        );

      case 'direct':
        return (
          <div className="bg-blue-50 rounded-lg p-8 text-center">
            <div className="text-2xl mb-4">{currentGame.displayName}</div>
            <div className="text-blue-600">直接載入遊戲組件</div>
            <div className="text-sm text-blue-500 mt-2">
              載入策略: {currentGame.loadStrategy} |
              記憶體限制: {currentGame.memoryLimit}MB |
              預估載入時間: {currentGame.estimatedLoadTime}ms
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <div className="text-red-600">不支援的載入策略: {currentGame.loadStrategy}</div>
          </div>
        );
    }
  };

  return (
    <div className={`enhanced-game-switcher ${className}`}>
      {/* 遊戲選擇器標頭 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
        <div className="p-4">
          <div className="flex items-center justify-between">
            {/* 當前遊戲信息 */}
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🎮</div>
              <div>
                <h3 className="font-semibold text-gray-900">{currentGame.displayName}</h3>
                <p className="text-sm text-gray-600">
                  {currentGame.type} | {currentGame.loadStrategy} | {currentGame.memoryLimit}MB
                </p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                currentGame.type === 'lightweight' ? 'bg-green-100 text-green-800' :
                currentGame.type === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {currentGame.type}
              </div>
            </div>

            {/* 遊戲選擇下拉選單 */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={loadState.isLoading}
              >
                <PlayIcon className="w-4 h-4" />
                <span>切換遊戲</span>
                <ChevronDownIcon className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* 下拉選單 */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                  <div className="p-2">
                    {/* 輕量級遊戲 */}
                    <div className="text-sm font-medium text-gray-700 px-3 py-2">輕量級遊戲</div>
                    {gamesByType.lightweight.map((game) => (
                      <button
                        key={game.id}
                        onClick={() => switchGame(game.id)}
                        className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 transition-colors ${
                          game.id === currentGameId ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">🟢</span>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{game.displayName}</div>
                            <div className="text-xs text-gray-500">
                              {game.memoryLimit}MB | {game.estimatedLoadTime}ms | {game.loadStrategy}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}

                    {/* 中等遊戲 */}
                    <div className="text-sm font-medium text-gray-700 px-3 py-2 mt-4 border-t">中等遊戲</div>
                    {gamesByType.medium.map((game) => (
                      <button
                        key={game.id}
                        onClick={() => switchGame(game.id)}
                        className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 transition-colors ${
                          game.id === currentGameId ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">🟡</span>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{game.displayName}</div>
                            <div className="text-xs text-gray-500">
                              {game.memoryLimit}MB | {game.estimatedLoadTime}ms | {game.loadStrategy}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}

                    {/* 重型遊戲 */}
                    <div className="text-sm font-medium text-gray-700 px-3 py-2 mt-4 border-t">重型遊戲</div>
                    {gamesByType.heavyweight.map((game) => (
                      <button
                        key={game.id}
                        onClick={() => switchGame(game.id)}
                        className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 transition-colors ${
                          game.id === currentGameId ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">🔴</span>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{game.displayName}</div>
                            <div className="text-xs text-gray-500">
                              {game.memoryLimit}MB | {game.estimatedLoadTime}ms | {game.loadStrategy}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* GEPT 等級選擇器 */}
          <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <BookOpenIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">GEPT 等級:</span>
            </div>
            <div className="flex space-x-2">
              {['elementary', 'intermediate', 'advanced'].map((level) => (
                <button
                  key={level}
                  onClick={() => setCurrentGeptLevel(level as any)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    currentGeptLevel === level
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {level === 'elementary' ? '初級' : level === 'intermediate' ? '中級' : '高級'}
                </button>
              ))}
            </div>
          </div>

          {/* 遊戲狀態顯示 */}
          {gameStatus && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="text-sm font-medium text-gray-700 mb-2">系統狀態</div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">活躍遊戲</div>
                  <div className="font-semibold">{gameStatus.activeGames}/3</div>
                </div>
                <div>
                  <div className="text-gray-500">記憶體使用</div>
                  <div className="font-semibold">{gameStatus.totalMemoryUsage}/500 MB</div>
                </div>
                <div>
                  <div className="text-gray-500">載入時間</div>
                  <div className="font-semibold">
                    {currentGameInstanceRef.current?.loadTime ? 
                      `${Math.round(currentGameInstanceRef.current.loadTime)}ms` : 
                      'N/A'
                    }
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 遊戲內容區域 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {renderGameContent()}
      </div>
    </div>
  );
};

export default EnhancedGameSwitcher;
