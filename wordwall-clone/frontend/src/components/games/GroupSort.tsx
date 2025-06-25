import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon,
  XCircleIcon,
  LightBulbIcon,
  ArrowPathIcon,
  EyeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui';

interface GroupSortItem {
  id: string;
  text: string;
  image?: string;
  correctGroupId: string;
  points?: number;
}

interface GroupSortGroup {
  id: string;
  name: string;
  color: string;
  description?: string;
  maxItems?: number;
}

interface GroupSortContent {
  groups: GroupSortGroup[];
  items: GroupSortItem[];
  allowEmptyGroups: boolean;
  showGroupLabels: boolean;
  autoValidate: boolean;
  shuffleItems: boolean;
  timeLimit?: number;
  instructions?: string;
}

interface GroupSortProps {
  content: GroupSortContent;
  onAnswer: (answer: {
    itemPlacements: Record<string, string>;
    timeSpent: number;
    moveCount: number;
    timestamp: number;
  }) => void;
  onComplete?: () => void;
  disabled?: boolean;
  showResult?: boolean;
  result?: {
    isCorrect: boolean;
    score: number;
    feedback: string;
    details: any;
  };
}

/**
 * Group Sort 遊戲組件
 * 
 * 功能：
 * - 拖拽分組排序
 * - 實時驗證
 * - 視覺反饋
 * - 提示系統
 * - 統計顯示
 */
export const GroupSort: React.FC<GroupSortProps> = ({
  content,
  onAnswer,
  onComplete,
  disabled = false,
  showResult = false,
  result,
}) => {
  const [itemPlacements, setItemPlacements] = useState<Record<string, string>>({});
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [moveCount, setMoveCount] = useState(0);
  const [startTime] = useState(Date.now());
  const [showHint, setShowHint] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  const dragRef = useRef<HTMLDivElement>(null);

  // 獲取未分組的項目
  const unplacedItems = content.items.filter(item => !itemPlacements[item.id]);

  // 獲取組別中的項目
  const getItemsInGroup = (groupId: string) => {
    return content.items.filter(item => itemPlacements[item.id] === groupId);
  };

  // 處理拖拽開始
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    if (disabled) return;
    
    setDraggedItem(itemId);
    e.dataTransfer.setData('text/plain', itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  // 處理拖拽結束
  const handleDragEnd = () => {
    setDraggedItem(null);
    setDropTarget(null);
  };

  // 處理拖拽進入
  const handleDragEnter = (e: React.DragEvent, groupId: string) => {
    e.preventDefault();
    setDropTarget(groupId);
  };

  // 處理拖拽離開
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // 只有當離開整個組別區域時才清除目標
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDropTarget(null);
    }
  };

  // 處理拖拽懸停
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // 處理放置
  const handleDrop = (e: React.DragEvent, groupId: string) => {
    e.preventDefault();
    
    const itemId = e.dataTransfer.getData('text/plain');
    if (!itemId || disabled) return;

    // 檢查組別容量限制
    const group = content.groups.find(g => g.id === groupId);
    if (group?.maxItems) {
      const currentItemsInGroup = getItemsInGroup(groupId).length;
      if (currentItemsInGroup >= group.maxItems) {
        setValidationErrors([`組別 "${group.name}" 已達到最大容量 ${group.maxItems}`]);
        setDropTarget(null);
        return;
      }
    }

    // 更新項目位置
    setItemPlacements(prev => ({
      ...prev,
      [itemId]: groupId,
    }));

    setMoveCount(prev => prev + 1);
    setDropTarget(null);
    setValidationErrors([]);

    // 自動驗證
    if (content.autoValidate) {
      validateCurrentState();
    }
  };

  // 處理從組別中移除項目
  const handleRemoveFromGroup = (itemId: string) => {
    if (disabled) return;
    
    setItemPlacements(prev => {
      const newPlacements = { ...prev };
      delete newPlacements[itemId];
      return newPlacements;
    });
    
    setMoveCount(prev => prev + 1);
  };

  // 驗證當前狀態
  const validateCurrentState = () => {
    const errors: string[] = [];

    // 檢查組別容量
    content.groups.forEach(group => {
      if (group.maxItems) {
        const itemsInGroup = getItemsInGroup(group.id).length;
        if (itemsInGroup > group.maxItems) {
          errors.push(`組別 "${group.name}" 超出最大容量`);
        }
      }
    });

    // 檢查空組別
    if (!content.allowEmptyGroups) {
      const usedGroups = new Set(Object.values(itemPlacements));
      const emptyGroups = content.groups.filter(group => !usedGroups.has(group.id));
      if (emptyGroups.length > 0) {
        errors.push(`還有 ${emptyGroups.length} 個組別為空`);
      }
    }

    setValidationErrors(errors);
  };

  // 提交答案
  const submitAnswer = () => {
    const timeSpent = (Date.now() - startTime) / 1000;
    
    onAnswer({
      itemPlacements,
      timeSpent,
      moveCount,
      timestamp: Date.now(),
    });

    onComplete?.();
  };

  // 重置遊戲
  const resetGame = () => {
    setItemPlacements({});
    setMoveCount(0);
    setValidationErrors([]);
    setShowHint(false);
  };

  // 生成提示
  const generateHint = () => {
    const incorrectItem = content.items.find(item => {
      const currentGroup = itemPlacements[item.id];
      return currentGroup && currentGroup !== item.correctGroupId;
    });

    if (incorrectItem) {
      const correctGroup = content.groups.find(g => g.id === incorrectItem.correctGroupId);
      return `"${incorrectItem.text}" 應該放在 "${correctGroup?.name}" 組別中`;
    }

    const unplacedItem = content.items.find(item => !itemPlacements[item.id]);
    if (unplacedItem) {
      const correctGroup = content.groups.find(g => g.id === unplacedItem.correctGroupId);
      return `試試將 "${unplacedItem.text}" 放入 "${correctGroup?.name}" 組別`;
    }

    return '所有項目都已正確分組！';
  };

  // 檢查是否完成
  const isComplete = unplacedItems.length === 0;
  const canSubmit = isComplete && validationErrors.length === 0;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* 說明 */}
      {content.instructions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800">{content.instructions}</p>
        </div>
      )}

      {/* 統計信息 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>移動次數: {moveCount}</span>
          <span>剩餘項目: {unplacedItems.length}</span>
          {content.timeLimit && (
            <span className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-1" />
              時間限制: {content.timeLimit}s
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHint(!showHint)}
          >
            <LightBulbIcon className="h-4 w-4 mr-2" />
            提示
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={resetGame}
            disabled={disabled}
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            重置
          </Button>
        </div>
      </div>

      {/* 提示顯示 */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4"
          >
            <p className="text-yellow-800 text-sm">
              💡 {generateHint()}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 驗證錯誤 */}
      <AnimatePresence>
        {validationErrors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4"
          >
            {validationErrors.map((error, index) => (
              <p key={index} className="text-red-800 text-sm flex items-center">
                <XCircleIcon className="h-4 w-4 mr-2" />
                {error}
              </p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 未分組項目區域 */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">待分組項目</h3>
            <div className="space-y-2">
              {unplacedItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  draggable={!disabled}
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  onDragEnd={handleDragEnd}
                  className={`
                    bg-white rounded-lg p-3 border-2 border-gray-200 cursor-move
                    transition-all duration-200 hover:shadow-md
                    ${draggedItem === item.id ? 'opacity-50 scale-95' : ''}
                    ${disabled ? 'cursor-not-allowed opacity-50' : ''}
                  `}
                >
                  <div className="flex items-center">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.text}
                        className="w-8 h-8 rounded mr-2 object-cover"
                      />
                    )}
                    <span className="text-sm font-medium text-gray-900">
                      {item.text}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* 分組區域 */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {content.groups.map((group) => {
              const itemsInGroup = getItemsInGroup(group.id);
              const isDropTarget = dropTarget === group.id;
              const isOverCapacity = group.maxItems && itemsInGroup.length >= group.maxItems;

              return (
                <div
                  key={group.id}
                  onDragEnter={(e) => handleDragEnter(e, group.id)}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, group.id)}
                  className={`
                    min-h-48 rounded-lg border-2 border-dashed p-4 transition-all duration-200
                    ${isDropTarget ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
                    ${isOverCapacity ? 'border-red-400 bg-red-50' : ''}
                  `}
                  style={{ borderColor: isDropTarget ? group.color : undefined }}
                >
                  {/* 組別標題 */}
                  {content.showGroupLabels && (
                    <div className="mb-3">
                      <h4 
                        className="font-semibold text-lg"
                        style={{ color: group.color }}
                      >
                        {group.name}
                      </h4>
                      {group.description && (
                        <p className="text-sm text-gray-600">{group.description}</p>
                      )}
                      {group.maxItems && (
                        <p className="text-xs text-gray-500">
                          最多 {group.maxItems} 個項目 ({itemsInGroup.length}/{group.maxItems})
                        </p>
                      )}
                    </div>
                  )}

                  {/* 組別中的項目 */}
                  <div className="space-y-2">
                    <AnimatePresence>
                      {itemsInGroup.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.text}
                                  className="w-6 h-6 rounded mr-2 object-cover"
                                />
                              )}
                              <span className="text-sm font-medium text-gray-900">
                                {item.text}
                              </span>
                            </div>
                            
                            {!disabled && (
                              <button
                                onClick={() => handleRemoveFromGroup(item.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <XCircleIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* 空組別提示 */}
                  {itemsInGroup.length === 0 && (
                    <div className="flex items-center justify-center h-24 text-gray-400">
                      <p className="text-sm">拖拽項目到這裡</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 提交按鈕 */}
      <div className="mt-6 flex justify-center">
        <Button
          onClick={submitAnswer}
          disabled={!canSubmit || disabled}
          size="lg"
          className="px-8"
        >
          {canSubmit ? (
            <>
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              提交答案
            </>
          ) : (
            <>
              <EyeIcon className="h-5 w-5 mr-2" />
              {unplacedItems.length > 0 ? '請完成所有分組' : '請修正錯誤'}
            </>
          )}
        </Button>
      </div>

      {/* 結果顯示 */}
      <AnimatePresence>
        {showResult && result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6 bg-white rounded-xl shadow-lg p-6"
          >
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                {result.isCorrect ? (
                  <CheckCircleIcon className="h-12 w-12 text-green-500" />
                ) : (
                  <XCircleIcon className="h-12 w-12 text-red-500" />
                )}
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {result.feedback}
              </h3>
              
              <div className="text-3xl font-bold text-primary-600 mb-4">
                {result.score} 分
              </div>

              {result.details && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div>
                    <div className="font-semibold">準確率</div>
                    <div>{result.details.accuracy}%</div>
                  </div>
                  <div>
                    <div className="font-semibold">移動次數</div>
                    <div>{result.details.moveCount}</div>
                  </div>
                  <div>
                    <div className="font-semibold">正確項目</div>
                    <div>{result.details.correctCount}/{result.details.totalItems}</div>
                  </div>
                  <div>
                    <div className="font-semibold">效率</div>
                    <div>{Math.round((result.details.totalItems / result.details.moveCount) * 100)}%</div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GroupSort;
