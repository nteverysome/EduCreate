import React, { useState, useEffect } from 'react';
export interface WheelSegment {
  id: string;
  text: string;
  color: string;
  points?: number;
  action?: 'question' | 'bonus' | 'penalty' | 'normal';
}
interface SimpleSpinWheelGameProps {
  segments: WheelSegment[];
  onComplete?: (results: any) => void;
  maxSpins?: number;
}
export default function SimpleSpinWheelGame({
  segments,
  onComplete,
  maxSpins = 5
}: SimpleSpinWheelGameProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<WheelSegment | null>(null);
  const [score, setScore] = useState(0);
  const [spinsLeft, setSpinsLeft] = useState(maxSpins);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [spinHistory, setSpinHistory] = useState<WheelSegment[]>([]);
  const [showResult, setShowResult] = useState(false);
  // 開始遊戲
  const startGame = () => {
    setGameStarted(true);
    setGameCompleted(false);
    setScore(0);
    setSpinsLeft(maxSpins);
    setSpinHistory([]);
    setSelectedSegment(null);
    setShowResult(false);
  };
  // 轉動輪盤
  const spinWheel = () => {
    if (isSpinning || spinsLeft <= 0 || gameCompleted) return;
    setIsSpinning(true);
    setShowResult(false);
    setSelectedSegment(null);
    // 隨機選擇一個扇形
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * segments.length);
      const selectedSeg = segments[randomIndex];
      setSelectedSegment(selectedSeg);
      setSpinHistory(prev => [...prev, selectedSeg]);
      setSpinsLeft(prev => prev - 1);
      setIsSpinning(false);
      setShowResult(true);
      // 處理得分
      if (selectedSeg.points) {
        setScore(prev => prev + selectedSeg.points!);
      }
      // 檢查遊戲是否結束
      if (spinsLeft <= 1) {
        setTimeout(() => {
          setGameCompleted(true);
        }, 2000);
      }
    }, 2000); // 轉動動畫時間
  };
  // 遊戲完成處理
  useEffect(() => {
    if (gameCompleted) {
      const totalSpins = maxSpins;
      const averageScore = Math.round(score / totalSpins);
      const results = {
        score,
        totalSpins,
        averageScore,
        spinHistory,
        bestSpin: spinHistory.reduce((best, current) => 
          (current.points || 0) > (best.points || 0) ? current : best, 
          spinHistory[0]
        )
      };
      onComplete?.(results);
    }
  }, [gameCompleted, score, maxSpins, spinHistory, onComplete]);
  if (!gameStarted) {
    return (
      <div className="text-center p-8">
        <div className="text-8xl mb-6">🎡</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">轉輪遊戲</h2>
        <p className="text-gray-600 mb-6">
          轉動幸運輪盤，看看你能得到什麼！共 {maxSpins} 次機會。
        </p>
        <div className="mb-6">
          <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
            {segments.map((segment, index) => (
              <div
                key={segment.id}
                className="p-3 rounded-lg text-white text-center"
                style={{ backgroundColor: segment.color }}
              >
                <div className="font-bold">{segment.text}</div>
                {segment.points && (
                  <div className="text-sm">{segment.points}分</div>
                )}
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={startGame}
          className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl font-bold rounded-lg hover:scale-105 transition-transform"
        >
          開始遊戲
        </button>
      </div>
    );
  }
  if (gameCompleted) {
    const averageScore = Math.round(score / maxSpins);
    const bestSpin = spinHistory.reduce((best, current) => 
      (current.points || 0) > (best.points || 0) ? current : best, 
      spinHistory[0]
    );
    return (
      <div className="text-center p-8">
        <div className="text-6xl mb-4">🎊</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">遊戲完成！</h2>
        <div className="bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-lg p-6 max-w-md mx-auto mb-6">
          <div className="text-3xl font-bold mb-2">{score} 分</div>
          <div className="text-lg">總得分</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">轉動次數:</span>
              <span className="font-bold text-blue-600">{maxSpins}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">平均得分:</span>
              <span className="font-bold text-purple-600">{averageScore} 分</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">最佳轉動:</span>
              <span className="font-bold text-orange-600">{bestSpin?.text} ({bestSpin?.points || 0}分)</span>
            </div>
          </div>
        </div>
        <button
          onClick={startGame}
          className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:scale-105 transition-transform"
        >
          重新開始
        </button>
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto">
      {/* 遊戲狀態 */}
      <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">{spinsLeft}</div>
          <div className="text-sm text-gray-600">剩餘次數</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">{score}</div>
          <div className="text-sm text-gray-600">得分</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600">{maxSpins - spinsLeft}</div>
          <div className="text-sm text-gray-600">已轉動</div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 輪盤區域 */}
        <div className="flex flex-col items-center">
          <div className="relative mb-6">
            {/* 簡化的輪盤顯示 */}
            <div className="w-64 h-64 rounded-full border-8 border-gray-800 bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="text-6xl mb-2">🎡</div>
                <div className="text-lg font-bold">
                  {isSpinning ? '轉動中...' : '幸運輪盤'}
                </div>
              </div>
            </div>
            {/* 指針 */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
              <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-red-600"></div>
            </div>
          </div>
          <button
            onClick={spinWheel}
            disabled={isSpinning || spinsLeft <= 0}
            className={`px-8 py-4 text-white text-xl font-bold rounded-lg transition-all ${
              isSpinning || spinsLeft <= 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 transform'
            }`}
          >
            {isSpinning ? '轉動中...' : spinsLeft > 0 ? '轉動輪盤！' : '遊戲結束'}
          </button>
        </div>
        {/* 結果和歷史 */}
        <div className="space-y-6">
          {/* 當前結果 */}
          {showResult && selectedSegment && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">轉動結果</h3>
              <div 
                className="p-4 rounded-lg text-white text-center"
                style={{ backgroundColor: selectedSegment.color }}
              >
                <div className="text-2xl font-bold mb-2">{selectedSegment.text}</div>
                {selectedSegment.points && (
                  <div className="text-lg">+{selectedSegment.points} 分</div>
                )}
              </div>
            </div>
          )}
          {/* 可用選項 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">輪盤選項</h3>
            <div className="grid grid-cols-2 gap-2">
              {segments.map((segment) => (
                <div
                  key={segment.id}
                  className="p-2 rounded text-white text-center text-sm"
                  style={{ backgroundColor: segment.color }}
                >
                  <div className="font-bold">{segment.text}</div>
                  {segment.points && (
                    <div>{segment.points}分</div>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* 轉動歷史 */}
          {spinHistory.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">轉動歷史</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {spinHistory.map((spin, index) => (
                  <div 
                    key={index}
                    className="flex justify-between items-center p-2 rounded"
                    style={{ backgroundColor: `${spin.color}20` }}
                  >
                    <span className="font-medium">第 {index + 1} 次</span>
                    <span>{spin.text}</span>
                    <span className="font-bold">
                      {spin.points ? `+${spin.points}` : '0'} 分
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
