/**
 * CDN Game Loader - 動態載入 CDN 上的遊戲
 * 支援版本控制、錯誤處理、性能監控
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameIframeSimple from './GameIframeSimple';

export interface GameConfig {
  id: string;
  name: string;
  version: string;
  cdnUrl: string;
  entryPoint: string;
  manifest: {
    main: string;
    chunks: string[];
    assets: string[];
  };
  features: {
    geptLevels: string[];
    memoryScience: boolean;
    multiLanguage: boolean;
    offline: boolean;
  };
  performance: {
    loadTime: string;
    memoryUsage: string;
    fps: number;
  };
}

export interface CDNGameLoaderProps {
  gameId: string;
  geptLevel?: string;
  language?: string;
  onGameReady?: () => void;
  onScoreUpdate?: (score: number, health: number) => void;
  onGameStateChange?: (state: string) => void;
  onGameComplete?: (results: any) => void;
  onError?: (error: string) => void;
  onPerformanceMetrics?: (metrics: any) => void;
}

export default function CDNGameLoader({
  gameId,
  geptLevel = 'elementary',
  language = 'zh-TW',
  onGameReady,
  onScoreUpdate,
  onGameStateChange,
  onGameComplete,
  onError,
  onPerformanceMetrics
}: CDNGameLoaderProps) {
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [gameUrl, setGameUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  const performanceRef = useRef({
    startTime: 0,
    configLoadTime: 0,
    gameLoadTime: 0
  });

  /**
   * 載入遊戲配置
   */
  const loadGameConfig = useCallback(async () => {
    try {
      performanceRef.current.startTime = performance.now();
      setIsLoading(true);
      setError('');
      setLoadingProgress(10);

      // 從 CDN API 載入遊戲配置
      const configResponse = await fetch(
        `https://games.educreat.vercel.app/api/games/config?gameId=${gameId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!configResponse.ok) {
        throw new Error(`Failed to load game config: ${configResponse.status}`);
      }

      const configData = await configResponse.json();
      
      if (!configData.success) {
        throw new Error(configData.error || 'Invalid game config response');
      }

      const config = configData.data;
      setGameConfig(config);
      setLoadingProgress(30);

      performanceRef.current.configLoadTime = performance.now() - performanceRef.current.startTime;

      // 驗證遊戲功能支援
      if (!config.features.geptLevels.includes(geptLevel)) {
        console.warn(`GEPT level ${geptLevel} not supported, using elementary`);
      }

      // 構建遊戲 URL 與參數
      const gameParams = new URLSearchParams({
        geptLevel: config.features.geptLevels.includes(geptLevel) ? geptLevel : 'elementary',
        language: config.features.multiLanguage ? language : 'zh-TW',
        version: config.version,
        timestamp: Date.now().toString()
      });

      const fullGameUrl = `${config.cdnUrl}${config.entryPoint}?${gameParams.toString()}`;
      setGameUrl(fullGameUrl);
      setLoadingProgress(50);

      // 預載入關鍵資源
      await preloadGameAssets(config);
      setLoadingProgress(80);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Failed to load game config:', err);
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
      setLoadingProgress(100);
    }
  }, [gameId, geptLevel, language, onError]);

  /**
   * 預載入遊戲資源
   */
  const preloadGameAssets = async (config: GameConfig) => {
    try {
      // 預載入關鍵 JavaScript 文件
      const criticalAssets = [config.manifest.main, ...config.manifest.chunks.slice(0, 2)];
      
      const preloadPromises = criticalAssets.map(asset => {
        return new Promise((resolve, reject) => {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'script';
          link.href = `${config.cdnUrl}${asset}`;
          link.onload = resolve;
          link.onerror = reject;
          document.head.appendChild(link);
        });
      });

      await Promise.allSettled(preloadPromises);
      console.log('🚀 Game assets preloaded successfully');
    } catch (err) {
      console.warn('⚠️ Asset preloading failed:', err);
      // 不阻塞遊戲載入
    }
  };

  /**
   * 處理遊戲準備就緒
   */
  const handleGameReady = useCallback(() => {
    performanceRef.current.gameLoadTime = performance.now() - performanceRef.current.startTime;
    
    const metrics = {
      gameId,
      configLoadTime: performanceRef.current.configLoadTime,
      gameLoadTime: performanceRef.current.gameLoadTime,
      totalLoadTime: performanceRef.current.gameLoadTime,
      timestamp: Date.now()
    };

    console.log('🎮 Game performance metrics:', metrics);
    onPerformanceMetrics?.(metrics);
    onGameReady?.();
  }, [gameId, onGameReady, onPerformanceMetrics]);

  /**
   * 處理遊戲錯誤
   */
  const handleGameError = useCallback((errorMessage: string) => {
    console.error('🚨 Game error:', errorMessage);
    setError(errorMessage);
    onError?.(errorMessage);
  }, [onError]);

  // 初始載入
  useEffect(() => {
    loadGameConfig();
  }, [loadGameConfig]);

  // 載入中狀態
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 rounded-lg">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">載入遊戲中...</h3>
        <div className="w-64 bg-gray-200 rounded-full h-2 mb-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${loadingProgress}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-500">{loadingProgress}% 完成</p>
        {gameConfig && (
          <p className="text-xs text-gray-400 mt-2">
            載入 {gameConfig.name} v{gameConfig.version}
          </p>
        )}
      </div>
    );
  }

  // 錯誤狀態
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-red-50 rounded-lg border border-red-200">
        <div className="text-red-600 text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-red-700 mb-2">遊戲載入失敗</h3>
        <p className="text-sm text-red-600 mb-4 text-center max-w-md">{error}</p>
        <button
          onClick={loadGameConfig}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          重新載入
        </button>
      </div>
    );
  }

  // 遊戲載入成功
  if (!gameUrl || !gameConfig) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-gray-50 rounded-lg">
        <p className="text-gray-500">準備遊戲中...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 遊戲信息 */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-blue-800">{gameConfig.name}</h4>
            <p className="text-sm text-blue-600">
              版本 {gameConfig.version} | GEPT {geptLevel} | CDN 載入
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-blue-500">
              預期載入時間: {gameConfig.performance.loadTime}
            </div>
            <div className="text-xs text-blue-500">
              記憶體使用: {gameConfig.performance.memoryUsage}
            </div>
          </div>
        </div>
      </div>

      {/* 遊戲 iframe */}
      <GameIframeSimple
        gameUrl={gameUrl}
        title={gameConfig.name}
        onGameReady={handleGameReady}
        onScoreUpdate={onScoreUpdate}
        onGameStateChange={onGameStateChange}
        onGameComplete={onGameComplete}
        onError={handleGameError}
      />
    </div>
  );
}
