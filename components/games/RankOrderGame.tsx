/**
 * Rank Order Game Component
 * 基於排序邏輯記憶機制的排序遊戲
 * 根據WordWall Rank Order模板分析設計
 */
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
interface RankItem {
  id: string;
  content: string;
  correctPosition: number; // 1-based正確位置
  description?: string;
  image?: string;
}
interface RankOrderGameProps {
  items: RankItem[];
  criteria: string; // 排序標準說明
  allowPartialCredit?: boolean;
  showPositionNumbers?: boolean;
  timeLimit?: number;
  onComplete?: (score: number, timeUsed: number) => void;
  onScoreUpdate?: (score: number) => void;
}
export default function RankOrderGame({
  items,
  criteria,
  allowPartialCredit = true,
  showPositionNumbers = true,
  timeLimit = 0,
  onComplete,
  onScoreUpdate
}: RankOrderGameProps) {
  const [currentOrder, setCurrentOrder] = useState<RankItem[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  // 初始化：打亂項目順序
  useEffect(() => {
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    setCurrentOrder(shuffled);
  }, [items]);
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
  const startGame = () => {
    setGameStarted(true);
    setStartTime(Date.now());
    setTimeLeft(timeLimit);
  };
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const newOrder = Array.from(currentOrder);
    const [reorderedItem] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, reorderedItem);
    setCurrentOrder(newOrder);
  };
  const checkOrder = () => {
    setAttempts(prev => prev + 1);
    let correctPositions = 0;
    let totalScore = 0;
    // 檢查每個項目的位置
    currentOrder.forEach((item, index) => {
      const currentPosition = index + 1; // 1-based
      if (currentPosition === item.correctPosition) {
        correctPositions++;
      }
    });
    if (correctPositions === items.length) {
      // 完全正確
      const baseScore = 100;
      const attemptBonus = Math.max(0, 50 - (attempts - 1) * 10);
      const timeBonus = timeLimit > 0 ? Math.max(0, Math.floor(timeLeft / 5)) : 0;
      totalScore = baseScore + attemptBonus + timeBonus;
      setFeedbackMessage(`完美排序！+${totalScore} 分`);
      setShowFeedback(true);
      setTimeout(() => {
        setShowFeedback(false);
        handleGameComplete();
      }, 2000);
    } else if (allowPartialCredit && correctPositions > 0) {
      // 部分正確
      const partialScore = Math.floor((correctPositions / items.length) * 60);
      totalScore = partialScore;
      setFeedbackMessage(`${correctPositions}/${items.length} 位置正確！+${partialScore} 分`);
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 2000);
    } else {
      // 完全錯誤
      setFeedbackMessage('排序不正確，請再試試！');
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 1500);
    }
    if (totalScore > 0) {
      setScore(prev => {
        const newScore = prev + totalScore;
        onScoreUpdate?.(newScore);
        return newScore;
      });
    }
    // 如果不是完全正確且允許多次嘗試，繼續遊戲
    if (correctPositions < items.length && attempts < 3) {
      // 給出位置提示
      showPositionHints();
    } else if (correctPositions < items.length) {
      // 達到最大嘗試次數
      setTimeout(() => {
        handleGameComplete();
      }, 2000);
    }
  };
  const showPositionHints = () => {
    setShowHint(true);
    setTimeout(() => setShowHint(false), 3000);
  };
  const handleGameComplete = () => {
    setGameCompleted(true);
    const timeUsed = startTime ? (Date.now() - startTime) / 1000 : 0;
    onComplete?.(score, timeUsed);
  };
  const resetOrder = () => {
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    setCurrentOrder(shuffled);
  };
  const renderItem = (item: RankItem, index: number) => {
    const isCorrectPosition = showHint && (index + 1) === item.correctPosition;
    return (
      <div className={`p-4 bg-white rounded-lg shadow border-2 transition-all ${
        isCorrectPosition 
          ? 'border-green-500 bg-green-50' 
          : 'border-gray-200 hover:border-blue-300'
      }`}>
        <div className="flex items-center space-x-3">
          {showPositionNumbers && (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              isCorrectPosition 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}>
              {index + 1}
            </div>
          )}
          {item.image && (
            <img 
              src={item.image} 
              alt={item.content}
              className="w-12 h-12 object-cover rounded"
            />
          )}
          <div className="flex-1">
            <div className="font-medium text-gray-900">{item.content}</div>
            {item.description && (
              <div className="text-sm text-gray-600 mt-1">{item.description}</div>
            )}
          </div>
          <div className="text-gray-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6L6 10l4 4 4-4-4-4z"/>
            </svg>
          </div>
        </div>
        {isCorrectPosition && (
          <div className="mt-2 text-xs text-green-700 font-medium">
            ✓ 正確位置
          </div>
        )}
      </div>
    );
  };
  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">排序遊戲</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          根據給定的標準將項目按正確順序排列。基於排序邏輯記憶機制，提高您的邏輯思維能力。
        </p>
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">排序標準：</h3>
          <p className="text-blue-800">{criteria}</p>
        </div>
        <div className="mb-6 text-center space-y-2">
          <p className="text-sm text-gray-500">項目數量: {items.length}</p>
          <p className="text-sm text-gray-500">允許部分得分: {allowPartialCredit ? '是' : '否'}</p>
          {timeLimit > 0 && <p className="text-sm text-gray-500">時間限制: {timeLimit} 秒</p>}
        </div>
        <button
          onClick={startGame}
          className="px-8 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-lg font-semibold"
        >
          開始排序
        </button>
      </div>
    );
  }
  if (gameCompleted) {
    const correctPositions = currentOrder.filter((item, index) => 
      (index + 1) === item.correctPosition
    ).length;
    const accuracy = (correctPositions / items.length) * 100;
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <h2 className="text-3xl font-bold text-green-600 mb-4">排序完成！</h2>
        <div className="text-center">
          <p className="text-xl mb-2">最終得分: <span className="font-bold text-blue-600">{score}</span></p>
          <p className="text-gray-600">正確位置: {correctPositions}/{items.length}</p>
          <p className="text-gray-600">準確率: {accuracy.toFixed(1)}%</p>
          <p className="text-gray-600">嘗試次數: {attempts}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
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
          <span className="text-sm text-gray-600">嘗試: {attempts}/3</span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={resetOrder}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            重新打亂
          </button>
          {timeLimit > 0 && (
            <div className={`text-lg font-semibold ${timeLeft < 30 ? 'text-red-600' : 'text-gray-700'}`}>
              時間: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>
      </div>
      {/* 反饋消息 */}
      {showFeedback && (
        <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-6 py-3 rounded-lg text-white font-semibold z-50 ${
          feedbackMessage.includes('完美') || feedbackMessage.includes('正確') ? 'bg-green-500' : 'bg-orange-500'
        }`}>
          {feedbackMessage}
        </div>
      )}
      {/* 排序標準 */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">排序標準：</h3>
        <p className="text-blue-800">{criteria}</p>
      </div>
      {/* 拖拽排序區域 */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="rank-order">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`space-y-3 p-4 rounded-lg border-2 border-dashed min-h-[400px] ${
                snapshot.isDraggingOver 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 bg-gray-50'
              }`}
            >
              <h3 className="text-lg font-semibold text-center text-gray-700 mb-4">
                拖拽項目到正確位置
              </h3>
              {currentOrder.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`transition-all ${
                        snapshot.isDragging 
                          ? 'scale-105 rotate-2 shadow-lg' 
                          : 'hover:shadow-md'
                      }`}
                    >
                      {renderItem(item, index)}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      {/* 操作按鈕 */}
      <div className="mt-6 flex justify-center space-x-4">
        <button
          onClick={checkOrder}
          className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold"
        >
          檢查順序
        </button>
        <button
          onClick={showPositionHints}
          className="px-4 py-3 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
        >
          顯示提示
        </button>
      </div>
      {/* 操作說明 */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
        <p className="font-semibold mb-2">操作說明：</p>
        <ul className="space-y-1">
          <li>• 拖拽項目到正確的位置</li>
          <li>• 根據給定的排序標準進行排列</li>
          <li>• 位置編號顯示當前順序</li>
          <li>• 點擊"檢查順序"驗證答案</li>
          <li>• 可以使用"顯示提示"獲得幫助</li>
        </ul>
      </div>
    </div>
  );
}
