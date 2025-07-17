import React, { useState, useEffect, useCallback } from 'react';
interface SimpleWhackGameProps {
  gameTime?: number;
  onComplete?: (results: any) => void;
}
interface Mole {
  id: number;
  position: number;
  isVisible: boolean;
  timeLeft: number;
}
export default function SimpleWhackGame({ 
  gameTime = 30, 
  onComplete 
}: SimpleWhackGameProps) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(gameTime);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [moles, setMoles] = useState<Mole[]>([]);
  const [nextMoleId, setNextMoleId] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  // 創建地鼠
  const createMole = useCallback(() => {
    if (gameEnded || !gameStarted) return;
    const position = Math.floor(Math.random() * 9); // 9個洞
    const newMole: Mole = {
      id: nextMoleId,
      position,
      isVisible: true,
      timeLeft: 2000 // 2秒後消失
    };
    setMoles(prev => [...prev.filter(m => m.position !== position), newMole]);
    setNextMoleId(prev => prev + 1);
    // 2秒後自動移除地鼠
    setTimeout(() => {
      setMoles(prev => prev.filter(m => m.id !== newMole.id));
    }, 2000);
  }, [gameEnded, gameStarted, nextMoleId]);
  // 打地鼠
  const whackMole = (position: number) => {
    const mole = moles.find(m => m.position === position && m.isVisible);
    if (mole) {
      setScore(prev => prev + 10);
      setHits(prev => prev + 1);
      setMoles(prev => prev.filter(m => m.id !== mole.id));
    } else {
      setMisses(prev => prev + 1);
    }
  };
  // 開始遊戲
  const startGame = () => {
    setGameStarted(true);
    setGameEnded(false);
    setScore(0);
    setHits(0);
    setMisses(0);
    setTimeLeft(gameTime);
    setMoles([]);
    setNextMoleId(0);
  };
  // 遊戲計時器
  useEffect(() => {
    if (!gameStarted || gameEnded) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameEnded(true);
          setGameStarted(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameStarted, gameEnded]);
  // 地鼠生成器
  useEffect(() => {
    if (!gameStarted || gameEnded) return;
    const moleGenerator = setInterval(() => {
      createMole();
    }, 1500); // 每1.5秒生成一個地鼠
    return () => clearInterval(moleGenerator);
  }, [gameStarted, gameEnded, createMole]);
  // 遊戲結束處理
  useEffect(() => {
    if (gameEnded) {
      const accuracy = hits + misses > 0 ? Math.round((hits / (hits + misses)) * 100) : 0;
      const results = {
        score,
        hits,
        misses,
        accuracy,
        timeSpent: gameTime - timeLeft,
        totalClicks: hits + misses
      };
      onComplete?.(results);
    }
  }, [gameEnded, score, hits, misses, gameTime, timeLeft, onComplete]);
  if (!gameStarted && !gameEnded) {
    return (
      <div className="text-center p-8">
        <div className="text-8xl mb-6">🔨</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">打地鼠遊戲</h2>
        <p className="text-gray-600 mb-6">
          點擊出現的地鼠來得分！每隻地鼠只會出現2秒鐘。
        </p>
        <button
          onClick={startGame}
          className="px-8 py-4 bg-green-500 text-white text-xl font-bold rounded-lg hover:bg-green-600 transition-colors"
        >
          開始遊戲
        </button>
      </div>
    );
  }
  if (gameEnded) {
    const accuracy = hits + misses > 0 ? Math.round((hits / (hits + misses)) * 100) : 0;
    return (
      <div className="text-center p-8">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">遊戲結束！</h2>
        <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">最終得分:</span>
              <span className="font-bold text-green-600">{score} 分</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">成功擊中:</span>
              <span className="font-bold text-blue-600">{hits} 次</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">錯過次數:</span>
              <span className="font-bold text-red-600">{misses} 次</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">準確率:</span>
              <span className="font-bold text-purple-600">{accuracy}%</span>
            </div>
          </div>
        </div>
        <button
          onClick={startGame}
          className="mt-6 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          重新開始
        </button>
      </div>
    );
  }
  return (
    <div className="max-w-2xl mx-auto">
      {/* 遊戲狀態 */}
      <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{score}</div>
          <div className="text-sm text-gray-600">得分</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{timeLeft}</div>
          <div className="text-sm text-gray-600">剩餘時間</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{hits}</div>
          <div className="text-sm text-gray-600">擊中</div>
        </div>
      </div>
      {/* 遊戲區域 */}
      <div className="grid grid-cols-3 gap-4 p-6 bg-green-100 rounded-lg">
        {Array.from({ length: 9 }, (_, index) => {
          const mole = moles.find(m => m.position === index);
          return (
            <div
              key={index}
              onClick={() => whackMole(index)}
              className="relative w-20 h-20 bg-brown-600 rounded-full border-4 border-brown-800 cursor-pointer hover:bg-brown-700 transition-colors flex items-center justify-center"
              style={{ backgroundColor: '#8B4513', borderColor: '#654321' }}
            >
              {/* 洞 */}
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                {mole && mole.isVisible && (
                  <div className="text-2xl animate-bounce">🐹</div>
                )}
              </div>
              {/* 擊中效果 */}
              {mole && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-yellow-400 text-xl animate-ping">⭐</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* 遊戲說明 */}
      <div className="mt-4 text-center text-gray-600">
        <p>點擊出現的地鼠來得分！動作要快，地鼠只會出現2秒鐘！</p>
      </div>
    </div>
  );
}
