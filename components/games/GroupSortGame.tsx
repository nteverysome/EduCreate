/**
 * Group Sort Game Component
 * 基於分類記憶機制的分組排序遊戲
 * 根據WordWall Group Sort模板分析設計
 */
import React, { useState, useEffect } from 'react';
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// 临时类型定义
interface DragDropContextProps {
  onDragEnd: (result: any) => void;
  children: React.ReactNode;
}
const DragDropContext: React.FC<DragDropContextProps> = ({ children }) => <>{children}</>;

interface DroppableProps {
  droppableId: string;
  children: (provided: any) => React.ReactNode;
}
const Droppable: React.FC<DroppableProps> = ({ children }) => children({ droppableRef: () => {}, placeholder: null });

interface DraggableProps {
  draggableId: string;
  index: number;
  children: (provided: any) => React.ReactNode;
}
const Draggable: React.FC<DraggableProps> = ({ children }) => children({
  draggableProps: {},
  dragHandleProps: {},
  innerRef: () => {}
});
interface SortItem {
  id: string;
  content: string;
  correctGroup: string;
  description?: string;
  image?: string;
}
interface SortGroup {
  id: string;
  name: string;
  color: string;
  description?: string;
  items: SortItem[];
}
interface GroupSortGameProps {
  items: SortItem[];
  groups: { id: string; name: string; color: string; description?: string }[];
  allowMultiple?: boolean;
  timeLimit?: number;
  onComplete?: (score: number, timeUsed: number) => void;
  onScoreUpdate?: (score: number) => void;
}
export default function GroupSortGame({
  items,
  groups,
  allowMultiple = false,
  timeLimit = 0,
  onComplete,
  onScoreUpdate
}: GroupSortGameProps) {
  const [sortGroups, setSortGroups] = useState<SortGroup[]>([]);
  const [unassignedItems, setUnassignedItems] = useState<SortItem[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [attempts, setAttempts] = useState(0);
  // 初始化分組和項目
  useEffect(() => {
    const initialGroups: SortGroup[] = groups.map(group => ({
      ...group,
      items: []
    }));
    setSortGroups(initialGroups);
    // 打亂項目順序
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    setUnassignedItems(shuffled);
  }, [items, groups]);
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
    const { source, destination, draggableId } = result;
    // 從未分組區域拖到分組
    if (source.droppableId === 'unassigned' && destination.droppableId.startsWith('group-')) {
      const groupId = destination.droppableId.replace('group-', '');
      const item = unassignedItems.find(item => item.id === draggableId);
      if (item) {
        // 移除項目從未分組區域
        setUnassignedItems(prev => prev.filter(i => i.id !== draggableId));
        // 添加項目到目標分組
        setSortGroups(prev => prev.map(group => 
          group.id === groupId 
            ? { ...group, items: [...group.items, item] }
            : group
        ));
      }
    }
    // 從分組拖回未分組區域
    else if (source.droppableId.startsWith('group-') && destination.droppableId === 'unassigned') {
      const sourceGroupId = source.droppableId.replace('group-', '');
      const sourceGroup = sortGroups.find(g => g.id === sourceGroupId);
      if (sourceGroup) {
        const item = sourceGroup.items[source.index];
        // 從源分組移除項目
        setSortGroups(prev => prev.map(group => 
          group.id === sourceGroupId
            ? { ...group, items: group.items.filter((_, index) => index !== source.index) }
            : group
        ));
        // 添加項目到未分組區域
        setUnassignedItems(prev => [...prev, item]);
      }
    }
    // 在分組之間移動
    else if (source.droppableId.startsWith('group-') && destination.droppableId.startsWith('group-')) {
      const sourceGroupId = source.droppableId.replace('group-', '');
      const destGroupId = destination.droppableId.replace('group-', '');
      if (sourceGroupId !== destGroupId) {
        const sourceGroup = sortGroups.find(g => g.id === sourceGroupId);
        if (sourceGroup) {
          const item = sourceGroup.items[source.index];
          // 從源分組移除
          setSortGroups(prev => prev.map(group => 
            group.id === sourceGroupId
              ? { ...group, items: group.items.filter((_, index) => index !== source.index) }
              : group.id === destGroupId
                ? { ...group, items: [...group.items, item] }
                : group
          ));
        }
      } else {
        // 同一分組內重新排序
        const group = sortGroups.find(g => g.id === sourceGroupId);
        if (group) {
          const newItems = [...group.items];
          const [reorderedItem] = newItems.splice(source.index, 1);
          newItems.splice(destination.index, 0, reorderedItem);
          setSortGroups(prev => prev.map(g => 
            g.id === sourceGroupId ? { ...g, items: newItems } : g
          ));
        }
      }
    }
  };
  const checkSorting = () => {
    setAttempts(prev => prev + 1);
    let correctItems = 0;
    let totalAssigned = 0;
    sortGroups.forEach(group => {
      group.items.forEach(item => {
        totalAssigned++;
        if (item.correctGroup === group.id) {
          correctItems++;
        }
      });
    });
    const accuracy = totalAssigned > 0 ? (correctItems / totalAssigned) * 100 : 0;
    const allItemsAssigned = unassignedItems.length === 0;
    const perfectScore = correctItems === items.length && allItemsAssigned;
    if (perfectScore) {
      const baseScore = 100;
      const attemptBonus = Math.max(0, 50 - (attempts - 1) * 10);
      const timeBonus = timeLimit > 0 ? Math.max(0, Math.floor(timeLeft / 5)) : 0;
      const totalScore = baseScore + attemptBonus + timeBonus;
      setScore(prev => {
        const newScore = prev + totalScore;
        onScoreUpdate?.(newScore);
        return newScore;
      });
      setFeedbackMessage(`完美分類！+${totalScore} 分`);
      setShowFeedback(true);
      setTimeout(() => {
        setShowFeedback(false);
        handleGameComplete();
      }, 2000);
    } else {
      const partialScore = Math.floor((correctItems / items.length) * 60);
      if (partialScore > 0) {
        setScore(prev => {
          const newScore = prev + partialScore;
          onScoreUpdate?.(newScore);
          return newScore;
        });
      }
      setFeedbackMessage(
        allItemsAssigned 
          ? `${correctItems}/${items.length} 正確分類！+${partialScore} 分`
          : `還有 ${unassignedItems.length} 個項目未分類`
      );
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 2000);
      if (attempts >= 3) {
        setTimeout(() => handleGameComplete(), 2000);
      }
    }
  };
  const handleGameComplete = () => {
    setGameCompleted(true);
    const timeUsed = startTime ? (Date.now() - startTime) / 1000 : 0;
    onComplete?.(score, timeUsed);
  };
  const resetSorting = () => {
    // 將所有項目返回到未分組區域
    const allItems: SortItem[] = [];
    sortGroups.forEach(group => {
      allItems.push(...group.items);
    });
    allItems.push(...unassignedItems);
    setUnassignedItems(allItems.sort(() => Math.random() - 0.5));
    setSortGroups(prev => prev.map(group => ({ ...group, items: [] })));
  };
  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">分組排序</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          將項目拖拽到正確的分組中。基於分類記憶機制，提高您的分類思維能力。
        </p>
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">遊戲設置：</h3>
          <div className="text-blue-800 text-sm space-y-1">
            <p>項目數量: {items.length}</p>
            <p>分組數量: {groups.length}</p>
            <p>允許多重分類: {allowMultiple ? '是' : '否'}</p>
            {timeLimit > 0 && <p>時間限制: {timeLimit} 秒</p>}
          </div>
        </div>
        <button
          onClick={startGame}
          className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-lg font-semibold"
        >
          開始分類
        </button>
      </div>
    );
  }
  if (gameCompleted) {
    const finalAccuracy = items.length > 0 ? (score / (items.length * 10)) * 100 : 0;
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <h2 className="text-3xl font-bold text-green-600 mb-4">分類完成！</h2>
        <div className="text-center">
          <p className="text-xl mb-2">最終得分: <span className="font-bold text-blue-600">{score}</span></p>
          <p className="text-gray-600">嘗試次數: {attempts}</p>
          <p className="text-gray-600">分類準確率: {finalAccuracy.toFixed(1)}%</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          再玩一次
        </button>
      </div>
    );
  }
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="max-w-6xl mx-auto p-6">
        {/* 遊戲狀態欄 */}
        <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-lg shadow">
          <div className="flex items-center space-x-4">
            <span className="text-lg font-semibold">得分: {score}</span>
            <span className="text-sm text-gray-600">
              未分類: {unassignedItems.length}/{items.length}
            </span>
            <span className="text-sm text-gray-600">嘗試: {attempts}</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={resetSorting}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              重置分類
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 未分組項目區域 */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4">待分類項目</h3>
            <Droppable droppableId="unassigned">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`min-h-[400px] p-4 border-2 border-dashed rounded-lg transition-all ${
                    snapshot.isDraggingOver 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  {unassignedItems.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      所有項目已分類
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {unassignedItems.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-3 bg-white rounded-lg border cursor-move select-none transition-all ${
                                snapshot.isDragging 
                                  ? 'shadow-lg scale-105 border-blue-300' 
                                  : 'hover:shadow-md border-gray-200'
                              }`}
                            >
                              <div className="font-medium text-gray-900">{item.content}</div>
                              {item.description && (
                                <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </div>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
          {/* 分組區域 */}
          <div className="lg:col-span-3">
            <h3 className="text-lg font-semibold mb-4">分組區域</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortGroups.map((group) => (
                <div key={group.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center mb-3">
                    <div 
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: group.color }}
                    />
                    <h4 className="font-semibold text-gray-900">{group.name}</h4>
                  </div>
                  {group.description && (
                    <p className="text-sm text-gray-600 mb-3">{group.description}</p>
                  )}
                  <Droppable droppableId={`group-${group.id}`}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[200px] p-3 border-2 border-dashed rounded-lg transition-all ${
                          snapshot.isDraggingOver 
                            ? `border-blue-500 bg-blue-50` 
                            : 'border-gray-300'
                        }`}
                        style={{ 
                          backgroundColor: snapshot.isDraggingOver 
                            ? `${group.color}20` 
                            : 'transparent' 
                        }}
                      >
                        {group.items.length === 0 ? (
                          <p className="text-gray-500 text-center py-8 text-sm">
                            拖拽項目到這裡
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {group.items.map((item, index) => (
                              <Draggable key={item.id} draggableId={item.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`p-2 rounded border cursor-move select-none transition-all ${
                                      item.correctGroup === group.id
                                        ? 'bg-green-100 border-green-300 text-green-800'
                                        : 'bg-red-100 border-red-300 text-red-800'
                                    } ${
                                      snapshot.isDragging ? 'shadow-lg scale-105' : 'hover:shadow-md'
                                    }`}
                                  >
                                    <div className="font-medium">{item.content}</div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                          </div>
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                  <div className="mt-2 text-xs text-gray-500 text-center">
                    {group.items.length} 個項目
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* 檢查按鈕 */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={checkSorting}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
          >
            檢查分類
          </button>
        </div>
        {/* 操作說明 */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
          <p className="font-semibold mb-2">操作說明：</p>
          <ul className="space-y-1">
            <li>• 從左側拖拽項目到對應的分組中</li>
            <li>• 綠色背景表示分類正確，紅色表示錯誤</li>
            <li>• 可以在分組之間重新移動項目</li>
            <li>• 點擊"檢查分類"驗證答案</li>
            <li>• 使用"重置分類"重新開始</li>
          </ul>
        </div>
      </div>
    </DragDropContext>
  );
}
