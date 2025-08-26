/**
 * GameIframe 組件 - 用於嵌入 Vite 遊戲到 Next.js 平台
 * 支援響應式設計、載入狀態、錯誤處理和父子頁面通信
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RefreshCw, Maximize2, Minimize2, Loader2, AlertCircle } from 'lucide-react';

export interface GameMessage {
  type: 'GAME_READY' | 'GAME_SCORE_UPDATE' | 'GAME_STATE_CHANGE' | 'GAME_COMPLETE';
  score?: number;
  health?: number;
  state?: string;
  results?: any;
  timestamp?: number;
}

export interface GameIframeProps {
  gameUrl: string;
  title: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  onGameReady?: () => void;
  onScoreUpdate?: (score: number, health: number) => void;
  onGameStateChange?: (state: string) => void;
  onGameComplete?: (results: any) => void;
  onError?: (error: string) => void;
}

export default function GameIframe({
  gameUrl,
  title,
  width = '100%',
  height = '600px',
  className = '',
  onGameReady,
  onScoreUpdate,
  onGameStateChange,
  onGameComplete,
  onError
}: GameIframeProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gameStats, setGameStats] = useState({ score: 0, health: 100 });
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * 處理來自遊戲的消息
   */
  const handleGameMessage = useCallback((event: MessageEvent) => {
    // 改進的安全檢查：支援多種 origin 格式
    const isValidOrigin = 
      event.origin === window.location.origin ||                    // 同源
      gameUrl.includes(event.origin) ||                            // gameUrl 包含 origin
      event.origin.includes('localhost:3002') ||                   // 遊戲服務器
      (event.origin.includes('localhost') && gameUrl.includes('localhost')); // 本地開發

    if (!isValidOrigin) {
      console.log('🔒 消息被安全檢查攔截:', event.origin, 'gameUrl:', gameUrl);
      return;
    }

    const message: GameMessage = event.data;
    
    console.log('🎮 收到遊戲消息:', message, 'from:', event.origin);

    switch (message.type) {
      case 'GAME_READY':
        setIsLoading(false);
        setHasError(false);
        onGameReady?.();
        console.log('✅ 遊戲準備就緒');
        break;

      case 'GAME_SCORE_UPDATE':
        if (message.score !== undefined && message.health !== undefined) {
          setGameStats({ score: message.score, health: message.health });
          onScoreUpdate?.(message.score, message.health);
        }
        break;

      case 'GAME_STATE_CHANGE':
        if (message.state) {
          onGameStateChange?.(message.state);
        }
        break;

      case 'GAME_COMPLETE':
        if (message.results) {
          onGameComplete?.(message.results);
        }
        break;

      default:
        console.log('🔍 未知遊戲消息類型:', message.type);
    }
  }, [gameUrl, onGameReady, onScoreUpdate, onGameStateChange, onGameComplete]);

  /**
   * 處理 iframe 載入完成
   */
  const handleIframeLoad = useCallback(() => {
    console.log('📱 iframe 載入完成');
    
    // 設置載入超時 (增加到 30 秒，因為 Phaser 遊戲需要較長載入時間)
    const loadTimeout = setTimeout(() => {
      if (isLoading) {
        setHasError(true);
        setErrorMessage('遊戲載入超時，請檢查網絡連接或嘗試重新載入');
        setIsLoading(false);
        onError?.('遊戲載入超時');
      }
    }, 30000); // 30秒超時

    // 清理超時
    return () => clearTimeout(loadTimeout);
  }, [isLoading, onError]);

  /**
   * 處理 iframe 載入錯誤
   */
  const handleIframeError = useCallback(() => {
    console.error('❌ iframe 載入錯誤');
    setIsLoading(false);
    setHasError(true);
    setErrorMessage('遊戲載入失敗，請重試');
    onError?.('iframe 載入錯誤');
  }, [onError]);

  /**
   * 重新載入遊戲
   */
  const reloadGame = useCallback(() => {
    console.log('🔄 重新載入遊戲');
    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');
    
    if (iframeRef.current) {
      iframeRef.current.src = gameUrl;
    }
  }, [gameUrl]);

  /**
   * 切換真正的全螢幕模式
   */
  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      // 進入全螢幕
      try {
        const container = document.querySelector('.game-iframe-container') || iframeRef.current?.parentElement;
        if (container && container.requestFullscreen) {
          await container.requestFullscreen();
        } else if (container && (container as any).webkitRequestFullscreen) {
          await (container as any).webkitRequestFullscreen();
        } else if (container && (container as any).msRequestFullscreen) {
          await (container as any).msRequestFullscreen();
        }
        setIsFullscreen(true);
        console.log('🎮 進入真正的全螢幕模式');
      } catch (error) {
        console.error('進入全螢幕失敗:', error);
        // 降級到 CSS 全螢幕
        setIsFullscreen(!isFullscreen);
      }
    } else {
      // 退出全螢幕
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
        setIsFullscreen(false);
        console.log('🎮 退出全螢幕模式');
      } catch (error) {
        console.error('退出全螢幕失敗:', error);
        setIsFullscreen(false);
      }
    }
  }, [isFullscreen]);

  // 設置消息監聽器
  useEffect(() => {
    window.addEventListener('message', handleGameMessage);
    
    return () => {
      window.removeEventListener('message', handleGameMessage);
    };
  }, [handleGameMessage]);

  // 監聽全螢幕狀態變化和鍵盤事件
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
      console.log('🎮 全螢幕狀態變化:', isCurrentlyFullscreen ? '進入' : '退出');
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      // F11 鍵切換全螢幕
      if (event.key === 'F11') {
        event.preventDefault();
        toggleFullscreen();
      }
      // ESC 鍵退出全螢幕（雖然瀏覽器預設也會處理）
      if (event.key === 'Escape' && isFullscreen) {
        event.preventDefault();
        toggleFullscreen();
      }
    };

    // 監聽各種瀏覽器的全螢幕事件
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    // 監聽鍵盤事件
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen, toggleFullscreen]);

  // 組件樣式
  const containerStyle: React.CSSProperties = {
    width: isFullscreen ? '100vw' : width,
    height: isFullscreen ? '100vh' : height,
    position: isFullscreen ? 'fixed' : 'relative',
    top: isFullscreen ? 0 : 'auto',
    left: isFullscreen ? 0 : 'auto',
    zIndex: isFullscreen ? 9999 : 'auto',
    backgroundColor: isFullscreen ? '#000' : '#000033',
    borderRadius: isFullscreen ? 0 : '8px',
    overflow: 'hidden',
    border: isFullscreen ? 'none' : '2px solid #333',
    margin: isFullscreen ? 0 : 'auto'
  };

  return (
    <div 
      ref={containerRef}
      className={`game-iframe-container ${className}`}
      style={containerStyle}
    >


      {/* 載入狀態 */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #000033 0%, #000066 100%)',
          color: 'white',
          zIndex: 5
        }}>
          <Loader2 className="animate-spin mb-4" size={48} />
          <h3 style={{ marginBottom: '8px' }}>🛩️ 載入飛機碰撞遊戲</h3>
          <p style={{ opacity: 0.7 }}>記憶科學 × 英語學習</p>
        </div>
      )}

      {/* 錯誤狀態 */}
      {hasError && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #330000 0%, #660000 100%)',
          color: 'white',
          zIndex: 5
        }}>
          <AlertCircle size={48} className="mb-4 text-red-400" />
          <h3 style={{ marginBottom: '8px' }}>⚠️ 遊戲載入失敗</h3>
          <p style={{ marginBottom: '16px', opacity: 0.7 }}>{errorMessage}</p>
          <button
            onClick={reloadGame}
            style={{
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <RefreshCw size={16} />
            重新載入
          </button>
        </div>
      )}

      {/* 遊戲 iframe */}
      <iframe
        ref={iframeRef}
        src={gameUrl}
        title={title}
        width="100%"
        height="100%"
        frameBorder="0"
        allowFullScreen
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        style={{
          display: hasError ? 'none' : 'block',
          border: 'none'
        }}
        sandbox="allow-scripts allow-same-origin allow-forms allow-top-navigation allow-popups allow-modals"
      />
    </div>
  );
}
