/**
 * Flip Tiles Game Component
 * 基於翻轉記憶機制的瓷磚翻轉遊戲
 * 根據WordWall Flip Tiles模板分析設計
 */
import React, { useState, useEffect } from 'react';
interface TileItem {
  id: string;
  frontContent: string;
  backContent: string;
  isCorrect: boolean;
  isFlipped: boolean;
  isMatched: boolean;
  position: number;
}
interface FlipTilesGameProps {
  question: string;
  correctPairs: Array<{ front: string; back: string }>;
  incorrectItems?: string[];
  gridSize?: { rows: number; cols: number };
  timeLimit?: number;
  onComplete?: (score: number, timeUsed: number) => void;
  onScoreUpdate?: (score: number) => void;
}
export default function FlipTilesGame({
  question,
  correctPairs,
  incorrectItems = [],
  gridSize = { rows: 4, cols: 4 },
  timeLimit = 120,
  onComplete,
  onScoreUpdate
}: FlipTilesGameProps) {
  const [tiles, setTiles] = useState<TileItem[]>([]);
  const [flippedTiles, setFlippedTiles] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [canFlip, setCanFlip] = useState(true);
  const totalTiles = gridSize.rows * gridSize.cols;
  // 初始化瓷磚
  useEffect(() => {
    generateTiles();
  }, [correctPairs, incorrectItems, gridSize]);
  // 計時器
  useEffect(() => {
    if (gameStarted && timeLimit > 0 && timeLeft > 0 && !gameCompleted) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && timeLimit > 0) {
      handleGameComplete();
    }
  }, [gameStarted, timeLeft, gameCompleted, timeLimit]);
  // 檢查配對
  useEffect(() => {
    if (flippedTiles.length === 2) {
      setCanFlip(false);
      setTimeout(() => {
        checkMatch();
      }, 1000);
    }
  }, [flippedTiles]);
  const generateTiles = () => {
    const newTiles: TileItem[] = [];
    let tileId = 0;
    // 添加正確配對
    correctPairs.forEach((pair, pairIndex) => {
      // 前面內容
      newTiles.push({
        id: `tile-${tileId++}`,
        frontContent: pair.front,
        backContent: pair.back,
        isCorrect: true,
        isFlipped: false,
        isMatched: false,
        position: 0
      });
      // 後面內容
      newTiles.push({
        id: `tile-${tileId++}`,
        frontContent: pair.back,
        backContent: pair.front,
        isCorrect: true,
        isFlipped: false,
        isMatched: false,
        position: 0
      });
    });
    // 添加干擾項
    const remainingSlots = totalTiles - newTiles.length;
    const shuffledIncorrect = [...incorrectItems].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(remainingSlots, shuffledIncorrect.length); i++) {
      newTiles.push({
        id: `tile-${tileId++}`,
        frontContent: shuffledIncorrect[i],
        backContent: '❌',
        isCorrect: false,
        isFlipped: false,
        isMatched: false,
        position: 0
      });
    }
    // 打亂位置
    const shuffledTiles = newTiles.sort(() => Math.random() - 0.5);
    shuffledTiles.forEach((tile, index) => {
      tile.position = index;
    });
    setTiles(shuffledTiles);
  };
  const startGame = () => {
    setGameStarted(true);
    setStartTime(Date.now());
    setTimeLeft(timeLimit);
  };
  const handleTileClick = (tileId: string) => {
    if (!canFlip || !gameStarted || gameCompleted) return;
    const tile = tiles.find(t => t.id === tileId);
    if (!tile || tile.isFlipped || tile.isMatched) return;
    if (flippedTiles.length < 2) {
      setFlippedTiles(prev => [...prev, tileId]);
      setTiles(prev => prev.map(t => 
        t.id === tileId ? { ...t, isFlipped: true } : t
      ));
    }
  };
  const checkMatch = () => {
    setAttempts(prev => prev + 1);
    const [firstId, secondId] = flippedTiles;
    const firstTile = tiles.find(t => t.id === firstId);
    const secondTile = tiles.find(t => t.id === secondId);
    if (!firstTile || !secondTile) {
      resetFlippedTiles();
      return;
    }
    // 檢查是否配對成功
    const isMatch = (
      firstTile.frontContent === secondTile.backContent &&
      firstTile.backContent === secondTile.frontContent &&
      firstTile.isCorrect && secondTile.isCorrect
    );
    if (isMatch) {
      // 配對成功
      const points = 20;
      setScore(prev => {
        const newScore = prev + points;
        onScoreUpdate?.(newScore);
        return newScore;
      });
      setMatchedPairs(prev => new Set([...prev, firstId, secondId]));
      setTiles(prev => prev.map(t => 
        (t.id === firstId || t.id === secondId) ? { ...t, isMatched: true } : t
      ));
      setFeedbackMessage(`配對成功！+${points} 分`);
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 1500);
      // 檢查是否完成所有配對
      if (matchedPairs.size + 2 >= correctPairs.length * 2) {
        setTimeout(() => {
          handleGameComplete();
        }, 2000);
      }
    } else {
      // 配對失敗
      setFeedbackMessage('配對失敗！');
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 1000);
    }
    // 重置翻轉狀態
    setTimeout(() => {
      resetFlippedTiles();
    }, isMatch ? 500 : 1500);
  };
  const resetFlippedTiles = () => {
    setTiles(prev => prev.map(t => 
      flippedTiles.includes(t.id) && !t.isMatched ? { ...t, isFlipped: false } : t
    ));
    setFlippedTiles([]);
    setCanFlip(true);
  };
  const handleGameComplete = () => {
    setGameCompleted(true);
    const timeUsed = startTime ? (Date.now() - startTime) / 1000 : 0;
    // 完成獎勵
    const completionBonus = matchedPairs.size === correctPairs.length * 2 ? 100 : 0;
    const timeBonus = Math.max(0, Math.floor(timeLeft / 5));
    const efficiencyBonus = attempts > 0 ? Math.max(0, 50 - attempts * 2) : 0;
    const finalScore = score + completionBonus + timeBonus + efficiencyBonus;
    setScore(finalScore);
    onScoreUpdate?.(finalScore);
    onComplete?.(finalScore, timeUsed);
  };
  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">翻轉瓷磚</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          翻轉瓷磚找到正確的配對。基於翻轉記憶機制，提高您的記憶力和配對能力。
        </p>
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">遊戲目標：</h3>
          <p className="text-blue-800 text-lg font-medium">{question}</p>
        </div>
        <div className="mb-6 p-4 bg-purple-50 rounded-lg">
          <h3 className="font-semibold text-purple-900 mb-2">遊戲設置：</h3>
          <div className="text-purple-800 text-sm space-y-1">
            <p>網格大小: {gridSize.rows} × {gridSize.cols}</p>
            <p>配對數量: {correctPairs.length} 對</p>
            <p>干擾項: {incorrectItems.length} 個</p>
            {timeLimit > 0 && <p>時間限制: {timeLimit} 秒</p>}
          </div>
        </div>
        <button
          onClick={startGame}
          className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-lg font-semibold"
        >
          開始翻轉
        </button>
      </div>
    );
  }
  if (gameCompleted) {
    const accuracy = correctPairs.length > 0 ? (matchedPairs.size / (correctPairs.length * 2)) * 100 : 0;
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <h2 className="text-3xl font-bold text-green-600 mb-4">翻轉完成！</h2>
        <div className="text-center">
          <p className="text-xl mb-2">最終得分: <span className="font-bold text-blue-600">{score}</span></p>
          <p className="text-gray-600">成功配對: {matchedPairs.size / 2}/{correctPairs.length}</p>
          <p className="text-gray-600">嘗試次數: {attempts}</p>
          <p className="text-gray-600">完成率: {accuracy.toFixed(1)}%</p>
          {matchedPairs.size === correctPairs.length * 2 && (
            <p className="text-green-600 font-semibold mt-2">🎉 完美配對！</p>
          )}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          再玩一次
        </button>
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 遊戲狀態欄 */}
      <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <span className="text-lg font-semibold">得分: {score}</span>
          <span className="text-sm text-green-600">
            配對: {matchedPairs.size / 2}/{correctPairs.length}
          </span>
          <span className="text-sm text-gray-600">嘗試: {attempts}</span>
        </div>
        {timeLimit > 0 && (
          <div className={`text-lg font-semibold ${timeLeft < 30 ? 'text-red-600 animate-pulse' : 'text-gray-700'}`}>
            時間: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
        )}
      </div>
      {/* 問題顯示 */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg text-center">
        <h3 className="text-xl font-bold text-blue-900">{question}</h3>
        <p className="text-blue-700 text-sm mt-2">點擊瓷磚翻轉，找到正確的配對！</p>
      </div>
      {/* 反饋消息 */}
      {showFeedback && (
        <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-6 py-3 rounded-lg text-white font-semibold z-50 ${
          feedbackMessage.includes('成功') ? 'bg-green-500' : 'bg-orange-500'
        }`}>
          {feedbackMessage}
        </div>
      )}
      {/* 瓷磚網格 */}
      <div className="mb-6">
        <div 
          className="grid gap-3 mx-auto"
          style={{ 
            gridTemplateColumns: `repeat(${gridSize.cols}, 1fr)`,
            maxWidth: `${gridSize.cols * 120}px`
          }}
        >
          {tiles.map((tile) => (
            <div
              key={tile.id}
              onClick={() => handleTileClick(tile.id)}
              className={`relative w-24 h-24 cursor-pointer transition-all duration-500 transform-style-preserve-3d ${
                tile.isFlipped ? 'rotate-y-180' : ''
              } ${
                tile.isMatched ? 'scale-105 opacity-75' : 'hover:scale-105'
              } ${
                !canFlip && !tile.isFlipped ? 'cursor-not-allowed' : ''
              }`}
              style={{ perspective: '1000px' }}
            >
              {/* 瓷磚背面（未翻轉時顯示） */}
              <div className={`absolute inset-0 w-full h-full rounded-lg shadow-lg flex items-center justify-center text-white font-bold text-lg backface-hidden ${
                tile.isMatched ? 'bg-green-500' : 'bg-gradient-to-br from-purple-500 to-blue-500'
              }`}>
                {tile.isMatched ? '✓' : '?'}
              </div>
              {/* 瓷磚正面（翻轉時顯示） */}
              <div className={`absolute inset-0 w-full h-full rounded-lg shadow-lg flex items-center justify-center text-gray-800 font-bold text-sm p-2 text-center backface-hidden rotate-y-180 ${
                tile.isCorrect ? 'bg-white border-2 border-blue-300' : 'bg-red-100 border-2 border-red-300'
              }`}>
                {tile.frontContent}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* 進度指示器 */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>配對進度</span>
          <span>{matchedPairs.size / 2}/{correctPairs.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-purple-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${(matchedPairs.size / (correctPairs.length * 2)) * 100}%` }}
          />
        </div>
      </div>
      {/* 操作說明 */}
      <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
        <p className="font-semibold mb-2">操作說明：</p>
        <ul className="space-y-1">
          <li>• 點擊瓷磚翻轉查看內容</li>
          <li>• 每次可以翻轉兩個瓷磚</li>
          <li>• 找到正確的配對可獲得分數</li>
          <li>• 配對成功的瓷磚會保持翻轉狀態</li>
          <li>• 配對失敗的瓷磚會重新翻回</li>
          <li>• 完成所有配對即可獲勝</li>
        </ul>
      </div>
      <style jsx>{`
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
