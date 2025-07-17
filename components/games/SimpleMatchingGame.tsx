import { useState, useEffect } from 'react';

interface MatchingPair {
  id: number;
  left: string;
  right: string;
}

interface SimpleMatchingGameProps {
  pairs: MatchingPair[];
  onComplete?: (results: any) => void;
}

const SimpleMatchingGame = ({ pairs, onComplete }: SimpleMatchingGameProps) {
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [selectedRight, setSelectedRight] = useState<number | null>(null);
  const [matches, setMatches] = useState<Set<number>>(new Set());
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  const [gameComplete, setGameComplete] = useState(false);

  // 隨機排列右側選項
  const [shuffledRightItems] = useState(() => {
    const rightItems = pairs.map(pair => ({ id: pair.id, text: pair.right }));
    return rightItems.sort(() => Math.random() - 0.5);
  });

  const handleLeftClick = (id: number) => {
    if (matches.has(id)) return;
    setSelectedLeft(id);
    setSelectedRight(null);
  };

  const handleRightClick = (id: number) => {
    if (matches.has(id)) return;
    if (selectedLeft === null) return;
    
    setSelectedRight(id);
    setAttempts(prev => prev + 1);

    // 檢查是否配對正確
    if (selectedLeft === id) {
      // 正確配對
      setTimeout(() => {
        setMatches(prev => new Set([...prev, id]));
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 500);
    } else {
      // 錯誤配對
      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 1000);
    }
  };

  // 檢查遊戲是否完成
  useEffect(() => {
    if (matches.size === pairs.length && !gameComplete) {
      setGameComplete(true);
      const endTime = Date.now();
      const timeSpent = Math.round((endTime - startTime) / 1000);
      
      const results = {
        totalPairs: pairs.length,
        correctMatches: matches.size,
        attempts,
        timeSpent,
        accuracy: Math.round((matches.size / attempts) * 100),
        score: Math.max(0, 100 - (attempts - pairs.length) * 10)
      };
      
      onComplete?.(results);
    }
  }, [matches.size, pairs.length, gameComplete, attempts, startTime, onComplete]);

  const getLeftItemStyle = (id: number) => {
    if (matches.has(id)) return 'bg-green-100 border-green-300 text-green-800';
    if (selectedLeft === id) return 'bg-blue-100 border-blue-300 text-blue-800';
    return 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50';
  };

  const getRightItemStyle = (id: number) => {
    if (matches.has(id)) return 'bg-green-100 border-green-300 text-green-800';
    if (selectedRight === id && selectedLeft === id) return 'bg-green-100 border-green-300';
    if (selectedRight === id && selectedLeft !== id) return 'bg-red-100 border-red-300';
    if (selectedLeft !== null) return 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50';
    return 'bg-gray-50 border-gray-200';
  };

  if (gameComplete) {
    const accuracy = Math.round((matches.size / attempts) * 100);
    const score = Math.max(0, 100 - (attempts - pairs.length) * 10);
    
    return (
      <div className="text-center p-8">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">配對完成！</h2>
        
        <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">配對數量:</span>
              <span className="font-bold text-green-600">{matches.size}/{pairs.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">嘗試次數:</span>
              <span className="font-bold text-blue-600">{attempts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">準確率:</span>
              <span className="font-bold text-purple-600">{accuracy}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">得分:</span>
              <span className="font-bold text-orange-600">{score} 分</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          重新開始
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 text-center">
        <h3 className="text-lg font-bold text-gray-800 mb-2">
          點擊左側項目，然後點擊對應的右側項目進行配對
        </h3>
        <div className="flex justify-center space-x-6 text-sm text-gray-600">
          <span>已配對: {matches.size}/{pairs.length}</span>
          <span>嘗試次數: {attempts}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 左側項目 */}
        <div>
          <h4 className="text-md font-bold text-gray-700 mb-4 text-center">概念</h4>
          <div className="space-y-3">
            {pairs.map(pair => (
              <button
                key={`left-${pair.id}`}
                onClick={() => handleLeftClick(pair.id)}
                disabled={matches.has(pair.id)}
                className={`w-full p-4 text-left border-2 rounded-lg transition-all duration-200 ${getLeftItemStyle(pair.id)} ${
                  matches.has(pair.id) ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{pair.left}</span>
                  {matches.has(pair.id) && <span className="text-green-600">✓</span>}
                  {selectedLeft === pair.id && !matches.has(pair.id) && <span className="text-blue-600">👆</span>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 右側項目 */}
        <div>
          <h4 className="text-md font-bold text-gray-700 mb-4 text-center">定義</h4>
          <div className="space-y-3">
            {shuffledRightItems.map(item => (
              <button
                key={`right-${item.id}`}
                onClick={() => handleRightClick(item.id)}
                disabled={matches.has(item.id) || selectedLeft === null}
                className={`w-full p-4 text-left border-2 rounded-lg transition-all duration-200 ${getRightItemStyle(item.id)} ${
                  matches.has(item.id) || selectedLeft === null ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{item.text}</span>
                  {matches.has(item.id) && <span className="text-green-600">✓</span>}
                  {selectedRight === item.id && selectedLeft === item.id && <span className="text-green-600">✓</span>}
                  {selectedRight === item.id && selectedLeft !== item.id && <span className="text-red-600">✗</span>}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 提示信息 */}
      <div className="mt-6 text-center">
        {selectedLeft === null && (
          <p className="text-gray-500">請先選擇左側的一個概念</p>
        )}
        {selectedLeft !== null && (
          <p className="text-blue-600">
            已選擇「{pairs.find(p => p.id === selectedLeft)?.left}」，請選擇對應的定義
          </p>
        )}
      </div>
    </div>
  );
}
export default SimpleMatchingGame;
