import React, { useState, useEffect, useCallback, useRef } from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui';
import { MatchPair, MatchItem, GameProgress, PlayerAnswer } from '@/types';

interface MatchUpGameProps {
  pairs: MatchPair[];
  layout?: 'grid' | 'list' | 'scattered';
  timeLimit?: number;
  showHints?: boolean;
  autoCheck?: boolean;
  onComplete: (results: PlayerAnswer[]) => void;
  onProgress?: (progress: GameProgress) => void;
}

/**
 * Match Up 拖拽配對遊戲組件
 * 
 * @example
 * ```tsx
 * <MatchUpGame
 *   pairs={matchPairs}
 *   layout="grid"
 *   timeLimit={180}
 *   showHints={true}
 *   onComplete={handleGameComplete}
 *   onProgress={handleProgress}
 * />
 * ```
 */
export const MatchUpGame: React.FC<MatchUpGameProps> = ({
  pairs,
  layout = 'grid',
  timeLimit,
  showHints = false,
  autoCheck = true,
  onComplete,
  onProgress,
}) => {
  const [leftItems, setLeftItems] = useState<MatchItem[]>([]);
  const [rightItems, setRightItems] = useState<MatchItem[]>([]);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [draggedItem, setDraggedItem] = useState<MatchItem | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [completedPairs, setCompletedPairs] = useState<Set<string>>(new Set());
  const [incorrectAttempts, setIncorrectAttempts] = useState<Set<string>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [gameStartTime] = useState(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const gameAreaRef = useRef<HTMLDivElement>(null);

  // 初始化遊戲項目
  useEffect(() => {
    const left = pairs.map(pair => pair.left);
    const right = [...pairs.map(pair => pair.right)].sort(() => Math.random() - 0.5); // 隨機排序右側項目
    
    setLeftItems(left);
    setRightItems(right);
  }, [pairs]);

  // 計時器
  useEffect(() => {
    if (!timeLimit || isCompleted) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev && prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev ? prev - 1 : 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLimit, isCompleted]);

  // 進度回調
  useEffect(() => {
    if (onProgress) {
      const progress: GameProgress = {
        currentStep: completedPairs.size,
        totalSteps: pairs.length,
        score: completedPairs.size,
        maxScore: pairs.length,
        timeElapsed: Math.floor((Date.now() - gameStartTime) / 1000),
        timeRemaining,
        completed: isCompleted,
        answers: Object.fromEntries(
          Object.entries(matches).map(([leftId, rightId]) => [
            leftId,
            { leftId, rightId, isCorrect: isCorrectMatch(leftId, rightId) }
          ])
        ),
      };
      onProgress(progress);
    }
  }, [completedPairs, matches, timeRemaining, isCompleted, onProgress]);

  const handleTimeUp = useCallback(() => {
    if (!isCompleted) {
      setIsCompleted(true);
      setShowResults(true);
      handleGameComplete();
    }
  }, [isCompleted]);

  const isCorrectMatch = (leftId: string, rightId: string): boolean => {
    return pairs.some(pair => pair.left.id === leftId && pair.right.id === rightId);
  };

  const handleDragStart = (item: MatchItem) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDropTarget(targetId);
  };

  const handleDragLeave = () => {
    setDropTarget(null);
  };

  const handleDrop = (e: React.DragEvent, targetItem: MatchItem) => {
    e.preventDefault();
    setDropTarget(null);

    if (!draggedItem) return;

    // 檢查是否是有效的配對
    const isCorrect = isCorrectMatch(draggedItem.id, targetItem.id);
    
    if (isCorrect) {
      // 正確配對
      setMatches(prev => ({ ...prev, [draggedItem.id]: targetItem.id }));
      setCompletedPairs(prev => new Set([...prev, draggedItem.id]));
      
      // 移除錯誤嘗試記錄
      setIncorrectAttempts(prev => {
        const newSet = new Set(prev);
        newSet.delete(`${draggedItem.id}-${targetItem.id}`);
        return newSet;
      });
    } else {
      // 錯誤配對
      if (autoCheck) {
        setIncorrectAttempts(prev => new Set([...prev, `${draggedItem.id}-${targetItem.id}`]));
        
        // 2秒後清除錯誤標記
        setTimeout(() => {
          setIncorrectAttempts(prev => {
            const newSet = new Set(prev);
            newSet.delete(`${draggedItem.id}-${targetItem.id}`);
            return newSet;
          });
        }, 2000);
      }
    }

    setDraggedItem(null);

    // 檢查是否完成所有配對
    if (completedPairs.size + (isCorrect ? 1 : 0) === pairs.length) {
      setTimeout(() => {
        setIsCompleted(true);
        setShowResults(true);
        handleGameComplete();
      }, 500);
    }
  };

  const handleGameComplete = () => {
    const results: PlayerAnswer[] = Object.entries(matches).map(([leftId, rightId]) => ({
      questionId: leftId,
      answer: rightId,
      isCorrect: isCorrectMatch(leftId, rightId),
      timeSpent: Math.floor((Date.now() - gameStartTime) / 1000),
      attempts: 1,
      timestamp: new Date().toISOString(),
    }));

    onComplete(results);
  };

  const handleRestart = () => {
    setMatches({});
    setCompletedPairs(new Set());
    setIncorrectAttempts(new Set());
    setTimeRemaining(timeLimit);
    setIsCompleted(false);
    setShowResults(false);
    
    // 重新隨機排序右側項目
    const right = [...pairs.map(pair => pair.right)].sort(() => Math.random() - 0.5);
    setRightItems(right);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getItemClass = (item: MatchItem, side: 'left' | 'right') => {
    const baseClass = 'match-item p-4 rounded-lg border-2 cursor-pointer transition-all duration-200';
    
    if (side === 'left') {
      if (completedPairs.has(item.id)) {
        return clsx(baseClass, 'bg-green-100 border-green-500 text-green-800');
      }
      if (draggedItem?.id === item.id) {
        return clsx(baseClass, 'bg-blue-100 border-blue-500 opacity-50');
      }
      return clsx(baseClass, 'bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50');
    } else {
      const matchedLeftId = Object.keys(matches).find(leftId => matches[leftId] === item.id);
      if (matchedLeftId) {
        return clsx(baseClass, 'bg-green-100 border-green-500 text-green-800');
      }
      if (dropTarget === item.id) {
        return clsx(baseClass, 'bg-blue-100 border-blue-500');
      }
      
      // 檢查是否有錯誤嘗試
      const hasError = Array.from(incorrectAttempts).some(attempt => 
        attempt.endsWith(`-${item.id}`)
      );
      if (hasError) {
        return clsx(baseClass, 'bg-red-100 border-red-500 animate-shake');
      }
      
      return clsx(baseClass, 'bg-white border-gray-300 hover:border-green-400 hover:bg-green-50');
    }
  };

  const renderItem = (item: MatchItem, side: 'left' | 'right') => (
    <motion.div
      key={item.id}
      className={getItemClass(item, side)}
      draggable={side === 'left' && !completedPairs.has(item.id)}
      onDragStart={() => side === 'left' && handleDragStart(item)}
      onDragOver={(e) => side === 'right' && handleDragOver(e, item.id)}
      onDragLeave={() => side === 'right' && handleDragLeave()}
      onDrop={(e) => side === 'right' && handleDrop(e, item)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {item.type === 'text' && (
            <span className="text-sm font-medium">{item.content}</span>
          )}
          {item.type === 'image' && (
            <img
              src={item.content}
              alt="Match item"
              className="max-w-full h-16 object-cover rounded"
            />
          )}
        </div>
        
        {side === 'left' && completedPairs.has(item.id) && (
          <CheckCircleIcon className="h-5 w-5 text-green-600 ml-2" />
        )}
        
        {side === 'right' && Object.values(matches).includes(item.id) && (
          <CheckCircleIcon className="h-5 w-5 text-green-600 ml-2" />
        )}
      </div>
    </motion.div>
  );

  if (showResults) {
    const score = completedPairs.size;
    const accuracy = Math.round((score / pairs.length) * 100);

    return (
      <div className="game-container flex items-center justify-center p-4">
        <div className="game-board max-w-md w-full text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">
              {accuracy >= 80 ? '🎉' : accuracy >= 60 ? '👍' : '💪'}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              配對完成！
            </h2>
            <p className="text-gray-600">
              您完成了 {score} / {pairs.length} 個配對
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="text-3xl font-bold text-primary-600 mb-1">
              {accuracy}%
            </div>
            <div className="text-sm text-gray-600">準確率</div>
          </div>

          <div className="space-y-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={handleRestart}
            >
              重新開始
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={() => window.history.back()}
            >
              返回
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container p-4">
      <div className="max-w-6xl mx-auto">
        {/* 遊戲頭部 */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                已配對 {completedPairs.size} / {pairs.length}
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="progress-fill h-2 rounded-full bg-green-500"
                  style={{
                    width: `${(completedPairs.size / pairs.length) * 100}%`
                  }}
                />
              </div>
            </div>
            
            {timeRemaining !== undefined && (
              <div className="flex items-center space-x-2 text-sm">
                <ClockIcon className="h-4 w-4 text-gray-500" />
                <span className={clsx(
                  'font-mono',
                  timeRemaining < 30 ? 'text-error-600' : 'text-gray-600'
                )}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 遊戲區域 */}
        <div ref={gameAreaRef} className="game-board">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              拖拽左側項目到右側進行配對
            </h2>
            <p className="text-gray-600">
              將相關的項目配對在一起
            </p>
          </div>

          <div className={clsx(
            'grid gap-6',
            layout === 'grid' ? 'grid-cols-2' : 'grid-cols-1'
          )}>
            {/* 左側項目 */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                拖拽項目
              </h3>
              <AnimatePresence>
                {leftItems.map(item => renderItem(item, 'left'))}
              </AnimatePresence>
            </div>

            {/* 右側項目 */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                配對目標
              </h3>
              <AnimatePresence>
                {rightItems.map(item => renderItem(item, 'right'))}
              </AnimatePresence>
            </div>
          </div>

          {/* 提示 */}
          {showHints && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800 text-sm">
                💡 提示：拖拽左側的項目到右側對應的項目上進行配對
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchUpGame;
