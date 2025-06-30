/**
 * 遊戲渲染器組件
 * 動態渲染任何遊戲模板
 */

import React, { useState, useEffect } from 'react';
import { gameTemplateManager, GameTemplateInfo } from '../../lib/game-templates/GameTemplateManager';

interface GameRendererProps {
  templateId: string;
  gameData?: any;
  onGameComplete?: (score: number, timeUsed: number, stats: any) => void;
  onScoreUpdate?: (score: number) => void;
  onGameStart?: () => void;
  onGamePause?: () => void;
  onGameResume?: () => void;
  className?: string;
}

interface GameSession {
  id: string;
  templateId: string;
  startTime: number;
  currentScore: number;
  gameState: 'loading' | 'ready' | 'playing' | 'paused' | 'completed' | 'error';
  stats: {
    attempts: number;
    correctAnswers: number;
    wrongAnswers: number;
    hintsUsed: number;
    timeSpent: number;
  };
}

export default function GameRenderer({
  templateId,
  gameData,
  onGameComplete,
  onScoreUpdate,
  onGameStart,
  onGamePause,
  onGameResume,
  className = ''
}: GameRendererProps) {
  const [template, setTemplate] = useState<GameTemplateInfo | null>(null);
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化遊戲模板
  useEffect(() => {
    const loadTemplate = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const templateInfo = gameTemplateManager.getTemplate(templateId);
        if (!templateInfo) {
          throw new Error(`Template "${templateId}" not found`);
        }

        if (!templateInfo.isImplemented) {
          throw new Error(`Template "${templateId}" is not yet implemented`);
        }

        setTemplate(templateInfo);
        
        // 初始化遊戲會話
        const session: GameSession = {
          id: `session-${Date.now()}`,
          templateId,
          startTime: 0,
          currentScore: 0,
          gameState: 'ready',
          stats: {
            attempts: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            hintsUsed: 0,
            timeSpent: 0
          }
        };
        
        setGameSession(session);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setIsLoading(false);
      }
    };

    loadTemplate();
  }, [templateId]);

  // 處理遊戲開始
  const handleGameStart = () => {
    if (gameSession) {
      setGameSession(prev => prev ? {
        ...prev,
        startTime: Date.now(),
        gameState: 'playing'
      } : null);
      onGameStart?.();
    }
  };

  // 處理分數更新
  const handleScoreUpdate = (score: number) => {
    if (gameSession) {
      setGameSession(prev => prev ? {
        ...prev,
        currentScore: score
      } : null);
      onScoreUpdate?.(score);
    }
  };

  // 處理遊戲完成
  const handleGameComplete = (score: number, timeUsed: number) => {
    if (gameSession) {
      const finalStats = {
        ...gameSession.stats,
        timeSpent: timeUsed
      };

      setGameSession(prev => prev ? {
        ...prev,
        currentScore: score,
        gameState: 'completed',
        stats: finalStats
      } : null);

      onGameComplete?.(score, timeUsed, finalStats);
    }
  };

  // 處理遊戲暫停
  const handleGamePause = () => {
    if (gameSession && gameSession.gameState === 'playing') {
      setGameSession(prev => prev ? {
        ...prev,
        gameState: 'paused'
      } : null);
      onGamePause?.();
    }
  };

  // 處理遊戲恢復
  const handleGameResume = () => {
    if (gameSession && gameSession.gameState === 'paused') {
      setGameSession(prev => prev ? {
        ...prev,
        gameState: 'playing'
      } : null);
      onGameResume?.();
    }
  };

  // 重新開始遊戲
  const handleGameRestart = () => {
    if (gameSession) {
      setGameSession(prev => prev ? {
        ...prev,
        startTime: 0,
        currentScore: 0,
        gameState: 'ready',
        stats: {
          attempts: 0,
          correctAnswers: 0,
          wrongAnswers: 0,
          hintsUsed: 0,
          timeSpent: 0
        }
      } : null);
    }
  };

  // 渲染加載狀態
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加載遊戲...</p>
        </div>
      </div>
    );
  }

  // 渲染錯誤狀態
  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
        <div className="text-center p-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">遊戲加載失敗</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            重新加載
          </button>
        </div>
      </div>
    );
  }

  // 渲染模板不存在
  if (!template || !gameSession) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
        <div className="text-center p-8">
          <div className="text-gray-400 text-6xl mb-4">🎮</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">遊戲不可用</h3>
          <p className="text-gray-600">請選擇其他遊戲模板</p>
        </div>
      </div>
    );
  }

  // 準備遊戲屬性
  const gameProps = {
    ...template.defaultProps,
    ...gameData,
    onComplete: handleGameComplete,
    onScoreUpdate: handleScoreUpdate,
    onStart: handleGameStart,
    onPause: handleGamePause,
    onResume: handleGameResume
  };

  // 動態渲染遊戲組件
  const GameComponent = template.component;

  return (
    <div className={`game-renderer ${className}`}>
      {/* 遊戲信息欄 */}
      <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-gray-800">{template.displayName}</h2>
            <span className={`px-2 py-1 text-xs rounded-full ${
              template.cognitiveLoad === 'low' ? 'bg-green-100 text-green-800' :
              template.cognitiveLoad === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {template.cognitiveLoad === 'low' ? '低負荷' :
               template.cognitiveLoad === 'medium' ? '中負荷' : '高負荷'}
            </span>
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
              難度 {template.difficultyLevel}/5
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {gameSession.gameState === 'playing' && (
              <button
                onClick={handleGamePause}
                className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
              >
                暫停
              </button>
            )}
            {gameSession.gameState === 'paused' && (
              <button
                onClick={handleGameResume}
                className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                繼續
              </button>
            )}
            {(gameSession.gameState === 'completed' || gameSession.gameState === 'paused') && (
              <button
                onClick={handleGameRestart}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                重新開始
              </button>
            )}
          </div>
        </div>
        
        {/* 遊戲描述 */}
        <p className="text-sm text-gray-600 mt-2">{template.description}</p>
        
        {/* 遊戲特性標籤 */}
        <div className="flex flex-wrap gap-2 mt-3">
          {template.features.map((feature, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>

      {/* 遊戲狀態指示器 */}
      {gameSession.gameState === 'paused' && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-yellow-600 mr-2">⏸️</span>
            <span className="text-yellow-800 font-medium">遊戲已暫停</span>
          </div>
        </div>
      )}

      {/* 遊戲組件 */}
      <div className="game-component">
        <GameComponent {...gameProps} />
      </div>

      {/* 遊戲統計（僅在遊戲進行中或完成後顯示） */}
      {(gameSession.gameState === 'playing' || gameSession.gameState === 'completed') && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">遊戲統計</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-blue-600">{gameSession.currentScore}</div>
              <div className="text-gray-600">當前分數</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-600">{gameSession.stats.correctAnswers}</div>
              <div className="text-gray-600">正確答案</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-red-600">{gameSession.stats.wrongAnswers}</div>
              <div className="text-gray-600">錯誤答案</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-purple-600">{gameSession.stats.hintsUsed}</div>
              <div className="text-gray-600">使用提示</div>
            </div>
          </div>
        </div>
      )}

      {/* 記憶增強提示 */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h5 className="text-sm font-semibold text-blue-800 mb-1">🧠 記憶增強提示</h5>
        <p className="text-xs text-blue-700">
          此遊戲基於 <strong>{template.memoryType}</strong> 記憶機制設計，
          有助於提升您的 {template.cognitiveLoad === 'low' ? '基礎認知' : 
                      template.cognitiveLoad === 'medium' ? '中級思維' : '高級分析'} 能力。
        </p>
      </div>
    </div>
  );
}
