'use client';

import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { isMobile } from 'react-device-detect';

// 遊戲數據類型
interface MatchPair {
  id: string;
  word: string;
  definition: string;
  matched: boolean;
}

// 示例數據 - 國小三年級英文
const gameData: MatchPair[] = [
  { id: '1', word: 'apple', definition: '蘋果', matched: false },
  { id: '2', word: 'book', definition: '書本', matched: false },
  { id: '3', word: 'cat', definition: '貓', matched: false },
  { id: '4', word: 'dog', definition: '狗', matched: false },
  { id: '5', word: 'egg', definition: '蛋', matched: false },
  { id: '6', word: 'fish', definition: '魚', matched: false },
];

// 可拖拽的詞彙卡片
const DraggableWord: React.FC<{
  word: string;
  id: string;
  matched: boolean;
}> = ({ word, id, matched }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'word',
    item: { id, word },
    canDrag: !matched,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className={`
        p-4 m-2 rounded-lg border-2 cursor-move transition-all duration-200
        ${matched 
          ? 'bg-green-100 border-green-400 text-green-800 cursor-not-allowed opacity-60' 
          : 'bg-blue-100 border-blue-400 text-blue-800 hover:bg-blue-200 hover:shadow-md'
        }
        ${isDragging ? 'opacity-50 rotate-3 scale-105' : ''}
      `}
    >
      <span className="font-semibold text-lg">{word}</span>
    </div>
  );
};

// 可放置的定義區域
const DropZone: React.FC<{
  definition: string;
  id: string;
  matched: boolean;
  matchedWord?: string;
  onDrop: (wordId: string, definitionId: string) => void;
}> = ({ definition, id, matched, matchedWord, onDrop }) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'word',
    canDrop: () => !matched,
    drop: (item: { id: string; word: string }) => {
      onDrop(item.id, id);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`
        p-4 m-2 rounded-lg border-2 min-h-[80px] flex items-center justify-center transition-all duration-200
        ${matched 
          ? 'bg-green-100 border-green-400 text-green-800' 
          : 'bg-gray-50 border-gray-300 text-gray-700'
        }
        ${isOver && canDrop ? 'bg-yellow-100 border-yellow-400 scale-105' : ''}
        ${canDrop && !matched ? 'border-dashed hover:bg-gray-100' : ''}
      `}
    >
      <div className="text-center">
        <div className="text-lg font-medium">{definition}</div>
        {matched && matchedWord && (
          <div className="text-sm text-green-600 mt-1">✓ {matchedWord}</div>
        )}
      </div>
    </div>
  );
};

// 主遊戲組件
const MatchGame: React.FC = () => {
  const [pairs, setPairs] = useState<MatchPair[]>(gameData);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  // 處理拖放匹配
  const handleDrop = (wordId: string, definitionId: string) => {
    if (wordId === definitionId) {
      // 正確匹配
      setPairs(prev => prev.map(pair => 
        pair.id === wordId ? { ...pair, matched: true } : pair
      ));
      setScore(prev => prev + 10);
      
      // 播放成功音效（可選）
      // playSuccessSound();
    } else {
      // 錯誤匹配 - 可以添加錯誤提示
      console.log('錯誤匹配');
      // playErrorSound();
    }
  };

  // 檢查遊戲是否完成
  useEffect(() => {
    const allMatched = pairs.every(pair => pair.matched);
    if (allMatched && pairs.length > 0) {
      setGameComplete(true);
    }
  }, [pairs]);

  // 重置遊戲
  const resetGame = () => {
    setPairs(gameData.map(pair => ({ ...pair, matched: false })));
    setScore(0);
    setGameComplete(false);
  };

  // 打亂數組
  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const shuffledWords = shuffleArray(pairs);
  const shuffledDefinitions = shuffleArray(pairs);

  return (
    <DndProvider backend={isMobile ? TouchBackend : HTML5Backend}>
      <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        {/* 遊戲標題和分數 */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            國小南一三年級英文第10課
          </h1>
          <p className="text-gray-600 mb-4">將每個英文單字拖放到對應的中文意思旁邊</p>
          <div className="flex justify-center items-center gap-4">
            <div className="bg-blue-100 px-4 py-2 rounded-lg">
              <span className="text-blue-800 font-semibold">分數: {score}</span>
            </div>
            <div className="bg-purple-100 px-4 py-2 rounded-lg">
              <span className="text-purple-800 font-semibold">
                進度: {pairs.filter(p => p.matched).length}/{pairs.length}
              </span>
            </div>
          </div>
        </div>

        {/* 遊戲完成提示 */}
        {gameComplete && (
          <div className="text-center mb-6 p-4 bg-green-100 border border-green-400 rounded-lg">
            <h2 className="text-2xl font-bold text-green-800 mb-2">🎉 恭喜完成！</h2>
            <p className="text-green-700 mb-3">你的總分是: {score} 分</p>
            <button
              onClick={resetGame}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              再玩一次
            </button>
          </div>
        )}

        {/* 遊戲區域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 左側：英文單字 */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-xl font-semibold text-blue-800 mb-4 text-center">
              英文單字
            </h3>
            <div className="space-y-2">
              {shuffledWords.map((pair) => (
                <DraggableWord
                  key={pair.id}
                  id={pair.id}
                  word={pair.word}
                  matched={pair.matched}
                />
              ))}
            </div>
          </div>

          {/* 右側：中文定義 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              中文意思
            </h3>
            <div className="space-y-2">
              {shuffledDefinitions.map((pair) => (
                <DropZone
                  key={pair.id}
                  id={pair.id}
                  definition={pair.definition}
                  matched={pair.matched}
                  matchedWord={pair.matched ? pair.word : undefined}
                  onDrop={handleDrop}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 遊戲說明 */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">遊戲說明：</h4>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>• 將左側的英文單字拖拽到右側對應的中文意思</li>
            <li>• 正確匹配會獲得 10 分</li>
            <li>• 完成所有匹配即可過關</li>
            <li>• 支援觸控操作，適合平板和手機使用</li>
          </ul>
        </div>
      </div>
    </DndProvider>
  );
};

export default MatchGame;
