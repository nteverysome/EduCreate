import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MatchPair {
  id: string;
  left: string;
  right: string;
  category?: string;
}

interface MatchUpProps {
  pairs: MatchPair[];
  timeLimit?: number;
  showProgress?: boolean;
  shuffleItems?: boolean;
  onComplete: (result: MatchUpResult) => void;
  onMatch?: (pairId: string, isCorrect: boolean, attempts: number) => void;
}

interface MatchUpResult {
  score: number;
  totalPairs: number;
  percentage: number;
  timeSpent: number;
  attempts: number;
  matches: Array<{
    pairId: string;
    isCorrect: boolean;
    attempts: number;
    timeSpent: number;
  }>;
}

interface DragItem {
  id: string;
  text: string;
  pairId: string;
  isMatched: boolean;
}

const MatchUp: React.FC<MatchUpProps> = ({
  pairs,
  timeLimit = 0,
  showProgress = true,
  shuffleItems = true,
  onComplete,
  onMatch
}) => {
  const [leftItems, setLeftItems] = useState<DragItem[]>([]);
  const [rightItems, setRightItems] = useState<DragItem[]>([]);
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [attempts, setAttempts] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [gameStartTime] = useState(Date.now());
  const [showResult, setShowResult] = useState(false);
  const [matchHistory, setMatchHistory] = useState<MatchUpResult['matches']>([]);
  const [pairAttempts, setPairAttempts] = useState<Map<string, number>>(new Map());

  // 初始化遊戲項目
  useEffect(() => {
    const left = pairs.map(pair => ({
      id: `left-${pair.id}`,
      text: pair.left,
      pairId: pair.id,
      isMatched: false
    }));

    const right = pairs.map(pair => ({
      id: `right-${pair.id}`,
      text: pair.right,
      pairId: pair.id,
      isMatched: false
    }));

    setLeftItems(shuffleItems ? shuffleArray(left) : left);
    setRightItems(shuffleItems ? shuffleArray(right) : right);
  }, [pairs, shuffleItems]);

  // 計時器
  useEffect(() => {
    if (timeLimit > 0 && timeRemaining > 0 && !showResult) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && timeLimit > 0) {
      finishGame();
    }
  }, [timeRemaining, timeLimit, showResult]);

  // 檢查遊戲是否完成
  useEffect(() => {
    if (matchedPairs.size === pairs.length && pairs.length > 0) {
      setTimeout(() => finishGame(), 1000);
    }
  }, [matchedPairs.size, pairs.length]);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handleDragStart = (e: React.DragEvent, item: DragItem) => {
    if (item.isMatched) return;
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetItem: DragItem) => {
    e.preventDefault();
    
    if (!draggedItem || targetItem.isMatched || draggedItem.isMatched) return;
    
    // 不能拖拽到同一側
    if (
      (draggedItem.id.startsWith('left-') && targetItem.id.startsWith('left-')) ||
      (draggedItem.id.startsWith('right-') && targetItem.id.startsWith('right-'))
    ) {
      return;
    }

    const isCorrectMatch = draggedItem.pairId === targetItem.pairId;
    setAttempts(prev => prev + 1);
    
    // 更新該配對的嘗試次數
    const currentAttempts = pairAttempts.get(draggedItem.pairId) || 0;
    const newAttempts = currentAttempts + 1;
    setPairAttempts(prev => new Map(prev).set(draggedItem.pairId, newAttempts));

    if (isCorrectMatch) {
      // 正確配對
      setMatchedPairs(prev => new Set(prev).add(draggedItem.pairId));
      
      // 更新項目狀態
      setLeftItems(prev => prev.map(item => 
        item.pairId === draggedItem.pairId ? { ...item, isMatched: true } : item
      ));
      setRightItems(prev => prev.map(item => 
        item.pairId === draggedItem.pairId ? { ...item, isMatched: true } : item
      ));

      // 記錄配對歷史
      const matchRecord = {
        pairId: draggedItem.pairId,
        isCorrect: true,
        attempts: newAttempts,
        timeSpent: Date.now() - gameStartTime
      };
      setMatchHistory(prev => [...prev, matchRecord]);
      
      onMatch?.(draggedItem.pairId, true, newAttempts);
    } else {
      // 錯誤配對 - 顯示錯誤動畫
      const draggedElement = document.getElementById(draggedItem.id);
      const targetElement = document.getElementById(targetItem.id);
      
      if (draggedElement && targetElement) {
        draggedElement.style.animation = 'shake 0.5s ease-in-out';
        targetElement.style.animation = 'shake 0.5s ease-in-out';
        
        setTimeout(() => {
          draggedElement.style.animation = '';
          targetElement.style.animation = '';
        }, 500);
      }
      
      onMatch?.(draggedItem.pairId, false, newAttempts);
    }
    
    setDraggedItem(null);
  };

  const finishGame = () => {
    const totalTimeSpent = Date.now() - gameStartTime;
    const result: MatchUpResult = {
      score: matchedPairs.size,
      totalPairs: pairs.length,
      percentage: Math.round((matchedPairs.size / pairs.length) * 100),
      timeSpent: totalTimeSpent,
      attempts,
      matches: matchHistory
    };
    
    setShowResult(true);
    onComplete(result);
  };

  const getItemStyle = (item: DragItem) => {
    if (item.isMatched) {
      return 'bg-green-100 border-green-300 text-green-800 cursor-default';
    }
    if (draggedItem?.id === item.id) {
      return 'bg-blue-100 border-blue-300 text-blue-800 opacity-50';
    }
    return 'bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-grab';
  };

  if (showResult) {
    const percentage = Math.round((matchedPairs.size / pairs.length) * 100);
    const efficiency = attempts > 0 ? Math.round((pairs.length / attempts) * 100) : 0;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto p-8 bg-white rounded-xl shadow-lg"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="text-6xl mb-4"
          >
            {percentage === 100 ? '🎉' : percentage >= 80 ? '👍' : '💪'}
          </motion.div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">配對完成！</h2>
          
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{matchedPairs.size}</div>
              <div className="text-sm text-gray-600">正確配對</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{percentage}%</div>
              <div className="text-sm text-gray-600">完成率</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">{efficiency}%</div>
              <div className="text-sm text-gray-600">效率</div>
            </div>
          </div>
          
          <div className="text-gray-600 mb-6">
            總共 {pairs.length} 對，成功配對 {matchedPairs.size} 對
            <br />
            嘗試次數：{attempts} 次
            {timeLimit > 0 && (
              <div className="mt-2">
                用時：{Math.round((Date.now() - gameStartTime) / 1000)} 秒
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* 進度條和統計 */}
      {showProgress && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-600">
              已配對：{matchedPairs.size} / {pairs.length}
            </span>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-600">
                嘗試次數：{attempts}
              </span>
              {timeLimit > 0 && (
                <span className={`text-sm font-medium ${timeRemaining <= 10 ? 'text-red-600' : 'text-gray-600'}`}>
                  剩餘時間：{timeRemaining}s
                </span>
              )}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-green-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(matchedPairs.size / pairs.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* 配對區域 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 左側項目 */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-center bg-blue-100 py-2 rounded-lg">
            拖拽項目
          </h3>
          <AnimatePresence>
            {leftItems.map((item, index) => (
              <motion.div
                key={item.id}
                id={item.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                draggable={!item.isMatched}
                onDragStart={(e) => handleDragStart(e, item)}
                className={`p-4 rounded-lg border-2 text-center font-medium transition-all duration-200 ${getItemStyle(item)}`}
              >
                {item.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* 右側項目 */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-center bg-green-100 py-2 rounded-lg">
            放置目標
          </h3>
          <AnimatePresence>
            {rightItems.map((item, index) => (
              <motion.div
                key={item.id}
                id={item.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, item)}
                className={`p-4 rounded-lg border-2 text-center font-medium transition-all duration-200 min-h-[60px] flex items-center justify-center ${getItemStyle(item)}`}
              >
                {item.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* 提示 */}
      <div className="mt-8 text-center text-gray-600">
        <p>將左側的項目拖拽到右側對應的位置進行配對</p>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
};

export default MatchUp;
