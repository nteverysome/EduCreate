/**
 * MatchGame - Match配對遊戲組件
 * 基於記憶科學原理的配對遊戲，支持多種配對模式和智能適配
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  MatchGameManager, 
  MatchGameConfig, 
  MatchGameState, 
  MatchGameResult,
  MatchPair,
  MatchItem,
  MatchMode,
  DifficultyLevel,
  GEPTLevel
} from '../../lib/games/MatchGameManager';

export interface MatchGameProps {
  config: MatchGameConfig;
  pairs: MatchPair[];
  onGameComplete?: (result: MatchGameResult) => void;
  onGameStateChange?: (state: MatchGameState) => void;
  className?: string;
  'data-testid'?: string;
}

export default function MatchGame({
  config,
  pairs,
  onGameComplete,
  onGameStateChange,
  className = '',
  'data-testid': testId = 'match-game'
}: MatchGameProps) {
  const [gameManager] = useState(() => new MatchGameManager());
  const [gameState, setGameState] = useState<MatchGameState | null>(null);
  const [gameResult, setGameResult] = useState<MatchGameResult | null>(null);
  const [showHint, setShowHint] = useState<string | null>(null);
  const [animatingItems, setAnimatingItems] = useState<Set<string>>(new Set());
  const [gameStarted, setGameStarted] = useState(false);
  
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const hintTimeoutRef = useRef<NodeJS.Timeout>();

  // 初始化遊戲
  useEffect(() => {
    const handleGameStateChange = (state: MatchGameState) => {
      console.log('遊戲狀態更新:', state);
      setGameState(state);
      onGameStateChange?.(state);
    };

    const handleGameComplete = (result: MatchGameResult) => {
      setGameResult(result);
      onGameComplete?.(result);
    };

    const handleMatch = (pair: MatchPair, isCorrect: boolean) => {
      // 添加動畫效果
      const itemIds = [pair.leftItem.id, pair.rightItem.id];
      setAnimatingItems(new Set(itemIds));
      
      setTimeout(() => {
        setAnimatingItems(new Set());
      }, 1000);
    };

    gameManager.addGameStateListener(handleGameStateChange);
    gameManager.addGameCompleteListener(handleGameComplete);
    gameManager.addMatchListener(handleMatch);

    return () => {
      gameManager.removeGameStateListener(handleGameStateChange);
      gameManager.removeGameCompleteListener(handleGameComplete);
      gameManager.removeMatchListener(handleMatch);
      gameManager.destroy();
    };
  }, [gameManager, onGameStateChange, onGameComplete]);

  // 開始遊戲
  const startGame = useCallback(() => {
    try {
      console.log('開始遊戲，配置:', config);
      console.log('配對數據:', pairs);
      const gameId = gameManager.startGame(config, pairs);
      setGameStarted(true);
      setGameResult(null);
      setShowHint(null);
      console.log('遊戲開始成功，遊戲ID:', gameId);

      // 手動檢查遊戲狀態
      setTimeout(() => {
        const currentState = gameManager.getCurrentState();
        console.log('當前遊戲狀態:', currentState);
      }, 100);
    } catch (error) {
      console.error('開始遊戲失敗:', error);
    }
  }, [gameManager, config, pairs]);

  // 自動開始遊戲（當組件掛載時）
  useEffect(() => {
    if (!gameStarted && !gameResult) {
      console.log('自動開始遊戲...');
      startGame();
    }
  }, [startGame, gameStarted, gameResult]);

  // 選擇項目
  const handleItemClick = useCallback((itemId: string) => {
    if (!gameState || gameState.isCompleted || gameState.isPaused) return;
    
    gameManager.selectItem(itemId);
  }, [gameManager, gameState]);

  // 使用提示
  const handleUseHint = useCallback(() => {
    const hint = gameManager.useHint();
    if (hint) {
      setShowHint(hint);
      
      // 3秒後隱藏提示
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current);
      }
      hintTimeoutRef.current = setTimeout(() => {
        setShowHint(null);
      }, 3000);
    }
  }, [gameManager]);

  // 暫停/恢復遊戲
  const handlePauseResume = useCallback(() => {
    if (!gameState) return;
    
    if (gameState.isPaused) {
      gameManager.resumeGame();
    } else {
      gameManager.pauseGame();
    }
  }, [gameManager, gameState]);

  // 結束遊戲
  const handleEndGame = useCallback(() => {
    gameManager.endGame();
  }, [gameManager]);

  // 重新開始遊戲
  const handleRestartGame = useCallback(() => {
    startGame();
  }, [startGame]);

  // 獲取項目樣式
  const getItemStyle = (item: MatchItem): string => {
    const baseStyle = 'p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 min-h-[80px] flex items-center justify-center text-center';
    
    if (!gameState) return `${baseStyle} border-gray-300 bg-white hover:bg-gray-50`;
    
    const isSelected = gameState.selectedItems.includes(item.id);
    const isMatched = gameState.pairs.some(pair => 
      gameState.matchedPairs.includes(pair.id) && 
      (pair.leftItem.id === item.id || pair.rightItem.id === item.id)
    );
    const isAnimating = animatingItems.has(item.id);
    
    if (isMatched) {
      return `${baseStyle} border-green-500 bg-green-100 text-green-800 cursor-default`;
    }
    
    if (isSelected) {
      return `${baseStyle} border-blue-500 bg-blue-100 text-blue-800 scale-105`;
    }
    
    if (isAnimating) {
      return `${baseStyle} border-yellow-500 bg-yellow-100 animate-pulse`;
    }
    
    return `${baseStyle} border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400`;
  };

  // 渲染項目內容
  const renderItemContent = (item: MatchItem) => {
    switch (item.type) {
      case 'text':
        return (
          <span className="text-lg font-medium">
            {item.content}
          </span>
        );
      
      case 'image':
        return (
          <div className="flex flex-col items-center space-y-2">
            <img 
              src={item.content} 
              alt={item.displayText || '圖片'}
              className="max-w-full max-h-12 object-contain"
            />
            {item.displayText && (
              <span className="text-sm text-gray-600">{item.displayText}</span>
            )}
          </div>
        );
      
      case 'audio':
        return (
          <div className="flex flex-col items-center space-y-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const audio = new Audio(item.content);
                audio.play();
              }}
              className="text-2xl hover:text-blue-600 transition-colors"
              title="播放音頻"
            >
              🔊
            </button>
            {item.displayText && (
              <span className="text-sm text-gray-600">{item.displayText}</span>
            )}
          </div>
        );
      
      default:
        return <span>{item.content}</span>;
    }
  };

  // 格式化時間
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 如果遊戲還沒開始，顯示開始界面
  if (!gameStarted) {
    return (
      <div className={`match-game-start bg-white rounded-lg shadow-sm p-8 ${className}`} data-testid={testId}>
        <div className="text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Match配對遊戲</h2>
          <p className="text-gray-600 mb-6">
            找出相關的配對項目，挑戰你的記憶力和反應速度！
          </p>
          
          {/* 遊戲配置顯示 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">遊戲設置</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">模式:</span>
                <span className="ml-2 font-medium">
                  {config.mode === 'text-text' ? '文字配對' :
                   config.mode === 'text-image' ? '文字圖片' :
                   config.mode === 'image-image' ? '圖片配對' :
                   config.mode === 'audio-text' ? '音頻文字' : '混合模式'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">難度:</span>
                <span className="ml-2 font-medium">
                  {config.difficulty === 'easy' ? '簡單' :
                   config.difficulty === 'medium' ? '中等' :
                   config.difficulty === 'hard' ? '困難' : '專家'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">配對數:</span>
                <span className="ml-2 font-medium">{config.pairCount}</span>
              </div>
              <div>
                <span className="text-gray-600">時間限制:</span>
                <span className="ml-2 font-medium">
                  {config.timeLimit ? `${config.timeLimit}秒` : '無限制'}
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={startGame}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
            data-testid="start-game-btn"
          >
            🚀 開始遊戲
          </button>
        </div>
      </div>
    );
  }

  // 如果遊戲完成，顯示結果
  if (gameResult) {
    return (
      <div className={`match-game-result bg-white rounded-lg shadow-sm p-8 ${className}`} data-testid="game-result">
        <div className="text-center">
          <div className="text-6xl mb-4">
            {gameResult.accuracy >= 80 ? '🏆' : gameResult.accuracy >= 60 ? '🎉' : '💪'}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">遊戲完成！</h2>
          
          {/* 結果統計 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{gameResult.score}</div>
              <div className="text-sm text-blue-800">總分</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{gameResult.accuracy.toFixed(1)}%</div>
              <div className="text-sm text-green-800">準確率</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{gameResult.completionTime.toFixed(1)}s</div>
              <div className="text-sm text-purple-800">完成時間</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{gameResult.correctMatches}</div>
              <div className="text-sm text-orange-800">正確配對</div>
            </div>
          </div>

          {/* 學習建議 */}
          {gameResult.recommendations.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-yellow-900 mb-2">學習建議</h3>
              <ul className="space-y-1">
                {gameResult.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-yellow-800">• {rec}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-center space-x-4">
            <button
              onClick={handleRestartGame}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              data-testid="restart-game-btn"
            >
              🔄 再玩一次
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 遊戲進行中界面
  return (
    <div className={`match-game bg-white rounded-lg shadow-sm ${className}`} data-testid={testId} ref={gameContainerRef}>
      {/* 遊戲頭部 */}
      <div className="game-header bg-gray-50 p-4 border-b">
        <div className="flex items-center justify-between">
          {/* 左側：分數和進度 */}
          <div className="flex items-center space-x-6">
            <div className="score">
              <span className="text-sm text-gray-600">分數:</span>
              <span className="ml-2 text-lg font-bold text-blue-600" data-testid="current-score">
                {gameState?.score || 0}
              </span>
            </div>

            <div className="progress">
              <span className="text-sm text-gray-600">進度:</span>
              <span className="ml-2 text-lg font-bold text-green-600" data-testid="game-progress">
                {gameState?.matchedPairs.length || 0}/{gameState?.pairs.length || 0}
              </span>
            </div>

            {gameState && gameState.currentStreak > 1 && (
              <div className="streak">
                <span className="text-sm text-gray-600">連續:</span>
                <span className="ml-2 text-lg font-bold text-purple-600" data-testid="current-streak">
                  {gameState.currentStreak}
                </span>
              </div>
            )}
          </div>

          {/* 右側：時間和控制 */}
          <div className="flex items-center space-x-4">
            {gameState && gameState.timeRemaining !== undefined && (
              <div className="timer">
                <span className="text-sm text-gray-600">時間:</span>
                <span className={`ml-2 text-lg font-bold ${
                  gameState.timeRemaining < 30 ? 'text-red-600' : 'text-gray-900'
                }`} data-testid="time-remaining">
                  {formatTime(gameState.timeRemaining)}
                </span>
              </div>
            )}

            <div className="controls flex space-x-2">
              {config.allowHints && (
                <button
                  onClick={handleUseHint}
                  className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                  data-testid="hint-btn"
                >
                  💡 提示
                </button>
              )}

              <button
                onClick={handlePauseResume}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                data-testid="pause-resume-btn"
              >
                {gameState?.isPaused ? '▶️ 繼續' : '⏸️ 暫停'}
              </button>
              
              <button
                onClick={handleEndGame}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                data-testid="end-game-btn"
              >
                🏁 結束
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 提示顯示 */}
      {showHint && (
        <div className="hint-display bg-yellow-50 border border-yellow-200 p-3 m-4 rounded-lg" data-testid="hint-display">
          <div className="flex items-start space-x-2">
            <span className="text-yellow-600 text-lg">💡</span>
            <span className="text-yellow-800">{showHint}</span>
          </div>
        </div>
      )}

      {/* 暫停覆蓋層 */}
      {gameState?.isPaused && (
        <div className="pause-overlay absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white p-8 rounded-lg text-center">
            <div className="text-4xl mb-4">⏸️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">遊戲已暫停</h3>
            <button
              onClick={handlePauseResume}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              繼續遊戲
            </button>
          </div>
        </div>
      )}

      {/* 遊戲區域 */}
      <div className="game-area p-6">
        {gameState ? (
          <div className="grid grid-cols-2 gap-6">
            {/* 左側項目 */}
            <div className="left-items space-y-3" data-testid="left-items">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">選擇項目</h3>
              {gameState.pairs.map((pair) => (
                <div
                  key={pair.leftItem.id}
                  className={getItemStyle(pair.leftItem)}
                  onClick={() => handleItemClick(pair.leftItem.id)}
                  data-testid={`item-${pair.leftItem.id}`}
                >
                  {renderItemContent(pair.leftItem)}
                </div>
              ))}
          </div>

          {/* 右側項目 */}
          <div className="right-items space-y-3" data-testid="right-items">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">配對項目</h3>
            {gameState.pairs.map((pair) => (
              <div
                key={pair.rightItem.id}
                className={getItemStyle(pair.rightItem)}
                onClick={() => handleItemClick(pair.rightItem.id)}
                data-testid={`item-${pair.rightItem.id}`}
              >
                {renderItemContent(pair.rightItem)}
              </div>
            ))}
          </div>
        </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-600">遊戲正在加載中...</p>
          </div>
        )}
      </div>

      {/* 遊戲統計 */}
      {gameState && (
        <div className="game-stats bg-gray-50 p-4 border-t">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span data-testid="attempts-count">嘗試次數: {gameState.attempts}</span>
            <span data-testid="hints-used">使用提示: {gameState.hintsUsed}</span>
            <span data-testid="best-streak">最佳連續: {gameState.bestStreak}</span>
          </div>
        </div>
      )}
    </div>
  );
}
