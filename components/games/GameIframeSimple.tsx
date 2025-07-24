/**
 * GameIframe 組件 (簡化版本) - 用於嵌入 Vite 遊戲到 Next.js 平台
 * 支援響應式設計、載入狀態、錯誤處理和父子頁面通信
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

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

export default function GameIframeSimple({
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
    // 安全檢查：確保消息來自正確的源
    if (!gameUrl.includes(event.origin) && event.origin !== window.location.origin) {
      return;
    }

    const message: GameMessage = event.data;
    
    console.log('🎮 收到遊戲消息:', message);

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
    
    // 設置載入超時
    const loadTimeout = setTimeout(() => {
      if (isLoading) {
        setHasError(true);
        setErrorMessage('遊戲載入超時，請檢查網絡連接');
        setIsLoading(false);
        onError?.('遊戲載入超時');
      }
    }, 10000); // 10秒超時

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
   * 切換全螢幕模式
   */
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // 設置消息監聽器
  useEffect(() => {
    window.addEventListener('message', handleGameMessage);
    
    return () => {
      window.removeEventListener('message', handleGameMessage);
    };
  }, [handleGameMessage]);

  // 組件樣式
  const containerStyle: React.CSSProperties = {
    width: isFullscreen ? '100vw' : width,
    height: isFullscreen ? '100vh' : height,
    position: isFullscreen ? 'fixed' : 'relative',
    top: isFullscreen ? 0 : 'auto',
    left: isFullscreen ? 0 : 'auto',
    zIndex: isFullscreen ? 9999 : 'auto',
    backgroundColor: '#000033',
    borderRadius: isFullscreen ? 0 : '8px',
    overflow: 'hidden',
    border: '2px solid #333'
  };

  return (
    <div 
      ref={containerRef}
      className={`game-iframe-container ${className}`}
      style={containerStyle}
    >
      {/* 遊戲控制欄 */}
      <div className="game-controls" style={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        zIndex: 10,
        display: 'flex',
        gap: '8px'
      }}>
        {/* 遊戲統計 */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          分數: {gameStats.score} | 生命: {gameStats.health}
        </div>

        {/* 重新載入按鈕 */}
        <button
          onClick={reloadGame}
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
          title="重新載入遊戲"
        >
          🔄
        </button>

        {/* 全螢幕按鈕 */}
        <button
          onClick={toggleFullscreen}
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
          title={isFullscreen ? '退出全螢幕' : '全螢幕模式'}
        >
          {isFullscreen ? '🗗' : '🗖'}
        </button>
      </div>

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
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #333',
            borderTop: '4px solid #fff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '16px'
          }} />
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
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h3 style={{ marginBottom: '8px' }}>遊戲載入失敗</h3>
          <p style={{ marginBottom: '16px', opacity: 0.7 }}>{errorMessage}</p>
          <button
            onClick={reloadGame}
            style={{
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🔄 重新載入
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
        sandbox="allow-scripts allow-same-origin allow-forms"
      />

      {/* CSS 動畫 */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
