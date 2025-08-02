/**
 * VitePhaserGameLoader - Vite + Phaser3 遊戲載入器
 * 專門載入本地 Vite 開發服務器上的 Phaser3 遊戲
 * 支援完整的遊戲通信和狀態管理
 */

import React, { useEffect, useRef, useState } from 'react';

interface VitePhaserGameLoaderProps {
  gameId: string;
  iframeUrl: string;
  geptLevel?: 'elementary' | 'intermediate' | 'advanced';
  onGameReady?: () => void;
  onGameStateUpdate?: (state: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

interface GameMessage {
  type: string;
  [key: string]: any;
}

const VitePhaserGameLoader: React.FC<VitePhaserGameLoaderProps> = ({
  gameId,
  iframeUrl,
  geptLevel = 'elementary',
  onGameReady,
  onGameStateUpdate,
  onError,
  className = ''
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<any>(null);

  // 處理來自 iframe 的消息
  useEffect(() => {
    const handleMessage = (event: MessageEvent<GameMessage>) => {
      // 安全檢查：確保消息來自正確的源
      if (!event.origin.includes('localhost:3004')) {
        return;
      }

      const { type, ...data } = event.data;

      switch (type) {
        case 'GAME_READY':
          console.log('🎮 Vite + Phaser3 遊戲準備完成');
          setIsLoading(false);
          setLoadError(null);
          onGameReady?.();
          break;

        case 'GAME_STATE_CHANGE':
          console.log('📊 遊戲狀態更新:', data);
          setGameState(data.state);
          onGameStateUpdate?.(data);
          break;

        case 'GAME_SCORE_UPDATE':
          console.log('🏆 分數更新:', data);
          onGameStateUpdate?.({
            type: 'score_update',
            score: data.score,
            health: data.health
          });
          break;

        case 'GAME_COMPLETE':
          console.log('🏁 遊戲完成:', data);
          onGameStateUpdate?.({
            type: 'game_complete',
            finalScore: data.score,
            finalHealth: data.health
          });
          break;

        case 'GAME_ERROR':
          console.error('❌ 遊戲錯誤:', data.error);
          setLoadError(data.error);
          onError?.(data.error);
          break;

        default:
          console.log('📨 未知消息類型:', type, data);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onGameReady, onGameStateUpdate, onError]);

  // 向 iframe 發送配置消息
  const sendGameConfig = () => {
    if (iframeRef.current?.contentWindow) {
      const config = {
        type: 'GAME_CONFIG',
        gameId,
        geptLevel,
        enableSound: true,
        enableHapticFeedback: true,
        difficulty: 'medium',
        gameMode: 'practice'
      };

      console.log('📤 發送遊戲配置:', config);
      iframeRef.current.contentWindow.postMessage(config, '*');
    }
  };

  // iframe 載入完成處理
  const handleIframeLoad = () => {
    console.log('🔗 Vite + Phaser3 iframe 載入完成');
    
    // 等待一小段時間確保遊戲初始化完成
    setTimeout(() => {
      sendGameConfig();
    }, 1000);
  };

  // iframe 載入錯誤處理
  const handleIframeError = () => {
    const errorMsg = `無法載入 Vite + Phaser3 遊戲: ${iframeUrl}`;
    console.error('❌', errorMsg);
    setLoadError(errorMsg);
    setIsLoading(false);
    onError?.(errorMsg);
  };

  // 重試載入
  const handleRetry = () => {
    setIsLoading(true);
    setLoadError(null);
    
    if (iframeRef.current) {
      iframeRef.current.src = iframeUrl;
    }
  };

  // 載入中顯示
  if (isLoading && !loadError) {
    return (
      <div className={`vite-phaser-game-loader ${className}`}>
        <div className="flex flex-col items-center justify-center h-96 bg-gray-100 rounded-lg">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            載入 Vite + Phaser3 遊戲
          </h3>
          <p className="text-gray-500 text-center">
            正在連接到本地開發服務器...<br />
            <span className="text-sm">{iframeUrl}</span>
          </p>
          <div className="mt-4 text-xs text-gray-400">
            🎮 飛機碰撞英語學習遊戲 | GEPT {geptLevel}
          </div>
        </div>
      </div>
    );
  }

  // 錯誤顯示
  if (loadError) {
    return (
      <div className={`vite-phaser-game-loader ${className}`}>
        <div className="flex flex-col items-center justify-center h-96 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">載入失敗</h3>
          <p className="text-red-600 text-center mb-4">{loadError}</p>
          
          <div className="bg-red-100 rounded p-3 mb-4 text-sm text-red-700">
            <strong>可能的解決方案：</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>確保 Vite 開發服務器正在運行 (npm run dev)</li>
              <li>檢查端口 5173 是否可用</li>
              <li>確認遊戲目錄: games/airplane-game/</li>
            </ul>
          </div>
          
          <button
            onClick={handleRetry}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            重試載入
          </button>
        </div>
      </div>
    );
  }

  // 正常顯示遊戲
  return (
    <div className={`vite-phaser-game-loader ${className}`}>
      {/* 遊戲信息欄 */}
      <div className="bg-blue-50 border border-blue-200 rounded-t-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-medium text-blue-800">
              🎮 Vite + Phaser3 飛機遊戲
            </span>
            <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
              GEPT {geptLevel}
            </span>
          </div>
          
          {gameState && (
            <div className="text-sm text-blue-600">
              狀態: {gameState.isPlaying ? '遊戲中' : gameState.isPaused ? '暫停' : '等待中'}
            </div>
          )}
        </div>
      </div>

      {/* 遊戲 iframe */}
      <iframe
        ref={iframeRef}
        src={iframeUrl}
        className="w-full h-96 border-0 rounded-b-lg"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        title={`Vite + Phaser3 遊戲: ${gameId}`}
        allow="autoplay; fullscreen"
        sandbox="allow-scripts allow-same-origin allow-forms"
      />

      {/* 開發者信息 */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        🚀 本地開發模式 | Vite 熱重載 | Phaser3 遊戲引擎
      </div>
    </div>
  );
};

export default VitePhaserGameLoader;
