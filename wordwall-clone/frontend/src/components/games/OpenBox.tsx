import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BoxItem {
  id: string;
  content: string;
  type: 'text' | 'image' | 'question';
  points?: number;
  category?: string;
  isSpecial?: boolean;
}

interface OpenBoxProps {
  items: BoxItem[];
  gridSize?: number;
  timeLimit?: number;
  maxOpens?: number;
  showProgress?: boolean;
  specialBoxes?: boolean;
  onComplete: (result: OpenBoxResult) => void;
  onBoxOpen?: (item: BoxItem, boxIndex: number) => void;
}

interface OpenBoxResult {
  totalPoints: number;
  boxesOpened: number;
  totalBoxes: number;
  percentage: number;
  timeSpent: number;
  openedItems: Array<{
    item: BoxItem;
    boxIndex: number;
    timeOpened: number;
  }>;
}

interface GameBox {
  id: string;
  item: BoxItem | null;
  isOpened: boolean;
  isSpecial: boolean;
  animation?: string;
}

const OpenBox: React.FC<OpenBoxProps> = ({
  items,
  gridSize = 16,
  timeLimit = 0,
  maxOpens = 0,
  showProgress = true,
  specialBoxes = true,
  onComplete,
  onBoxOpen
}) => {
  const [boxes, setBoxes] = useState<GameBox[]>([]);
  const [openedBoxes, setOpenedBoxes] = useState<Set<number>>(new Set());
  const [totalPoints, setTotalPoints] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [gameStartTime] = useState(Date.now());
  const [showResult, setShowResult] = useState(false);
  const [openedItems, setOpenedItems] = useState<OpenBoxResult['openedItems']>([]);
  const [selectedBox, setSelectedBox] = useState<number | null>(null);

  // 初始化遊戲盒子
  useEffect(() => {
    const totalBoxes = gridSize;
    const shuffledItems = shuffleArray([...items]);
    
    // 創建盒子數組
    const gameBoxes: GameBox[] = Array.from({ length: totalBoxes }, (_, index) => {
      const hasItem = index < shuffledItems.length;
      const item = hasItem ? shuffledItems[index] : null;
      
      // 特殊盒子邏輯
      const isSpecial = specialBoxes && item?.isSpecial === true;
      
      return {
        id: `box-${index}`,
        item,
        isOpened: false,
        isSpecial
      };
    });

    setBoxes(gameBoxes);
  }, [items, gridSize, specialBoxes]);

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

  // 檢查最大開啟次數
  useEffect(() => {
    if (maxOpens > 0 && openedBoxes.size >= maxOpens) {
      finishGame();
    }
  }, [openedBoxes.size, maxOpens]);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handleBoxClick = (boxIndex: number) => {
    if (openedBoxes.has(boxIndex) || showResult) return;
    
    const box = boxes[boxIndex];
    if (!box) return;

    // 設置選中的盒子
    setSelectedBox(boxIndex);
    
    // 延遲開啟動畫
    setTimeout(() => {
      openBox(boxIndex);
    }, 500);
  };

  const openBox = (boxIndex: number) => {
    const box = boxes[boxIndex];
    if (!box || openedBoxes.has(boxIndex)) return;

    // 更新盒子狀態
    setBoxes(prev => prev.map((b, index) => 
      index === boxIndex ? { ...b, isOpened: true } : b
    ));
    
    setOpenedBoxes(prev => new Set(prev).add(boxIndex));

    // 如果盒子有內容
    if (box.item) {
      const points = box.item.points || 10;
      setTotalPoints(prev => prev + points);
      
      const openedItem = {
        item: box.item!,
        boxIndex,
        timeOpened: Date.now() - gameStartTime
      };
      
      setOpenedItems(prev => [...prev, openedItem]);
      onBoxOpen?.(box.item!, boxIndex);
    }

    setSelectedBox(null);
  };

  const finishGame = () => {
    const totalTimeSpent = Date.now() - gameStartTime;
    const result: OpenBoxResult = {
      totalPoints,
      boxesOpened: openedBoxes.size,
      totalBoxes: boxes.length,
      percentage: Math.round((openedBoxes.size / boxes.length) * 100),
      timeSpent: totalTimeSpent,
      openedItems
    };
    
    setShowResult(true);
    onComplete(result);
  };

  const getBoxStyle = (box: GameBox, index: number) => {
    if (box.isOpened) {
      if (box.item) {
        if (box.isSpecial) {
          return 'bg-gradient-to-br from-yellow-200 to-yellow-400 border-yellow-500 shadow-lg';
        }
        return 'bg-gradient-to-br from-green-200 to-green-400 border-green-500';
      }
      return 'bg-gray-200 border-gray-400';
    }
    
    if (selectedBox === index) {
      return 'bg-blue-200 border-blue-500 animate-pulse';
    }
    
    if (box.isSpecial) {
      return 'bg-gradient-to-br from-purple-300 to-purple-500 border-purple-600 shadow-md hover:shadow-lg';
    }
    
    return 'bg-gradient-to-br from-blue-300 to-blue-500 border-blue-600 hover:from-blue-400 hover:to-blue-600 cursor-pointer';
  };

  const getGridCols = () => {
    if (gridSize <= 9) return 'grid-cols-3';
    if (gridSize <= 16) return 'grid-cols-4';
    if (gridSize <= 25) return 'grid-cols-5';
    return 'grid-cols-6';
  };

  if (showResult) {
    const itemsFound = openedItems.length;
    const percentage = Math.round((openedBoxes.size / boxes.length) * 100);
    const averagePoints = itemsFound > 0 ? Math.round(totalPoints / itemsFound) : 0;
    
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
            {totalPoints >= items.length * 15 ? '🎉' : totalPoints >= items.length * 10 ? '🎁' : '📦'}
          </motion.div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">開箱完成！</h2>
          
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600">{totalPoints}</div>
              <div className="text-sm text-gray-600">總分數</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{openedBoxes.size}</div>
              <div className="text-sm text-gray-600">開啟盒子</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{itemsFound}</div>
              <div className="text-sm text-gray-600">找到物品</div>
            </div>
          </div>
          
          <div className="text-gray-600 mb-6">
            開啟了 {openedBoxes.size} / {boxes.length} 個盒子
            <br />
            找到 {itemsFound} 個物品，平均每個物品 {averagePoints} 分
            {timeLimit > 0 && (
              <div className="mt-2">
                用時：{Math.round((Date.now() - gameStartTime) / 1000)} 秒
              </div>
            )}
          </div>
          
          {/* 找到的物品列表 */}
          {openedItems.length > 0 && (
            <div className="mt-6 max-h-40 overflow-y-auto">
              <h4 className="font-semibold mb-2">發現的寶藏：</h4>
              <div className="space-y-2">
                {openedItems.map((opened, index) => (
                  <div key={opened.item.id} className="flex justify-between items-center text-sm">
                    <span className={opened.item.isSpecial ? 'text-yellow-600 font-bold' : 'text-gray-700'}>
                      {opened.item.isSpecial ? '⭐ ' : '📦 '}
                      {opened.item.content}
                    </span>
                    <span className="text-blue-600">+{opened.item.points || 10}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* 評價 */}
          <div className="mt-6 space-y-2">
            {totalPoints >= items.length * 15 && (
              <p className="text-yellow-600 font-semibold">🏆 太棒了！您是真正的尋寶專家！</p>
            )}
            {totalPoints >= items.length * 10 && totalPoints < items.length * 15 && (
              <p className="text-green-600 font-semibold">🎁 很好！您找到了很多寶藏！</p>
            )}
            {totalPoints >= items.length * 5 && totalPoints < items.length * 10 && (
              <p className="text-blue-600 font-semibold">📦 不錯！繼續探索會有更多發現！</p>
            )}
            {totalPoints < items.length * 5 && (
              <p className="text-gray-600 font-semibold">🔍 多嘗試幾次，運氣會更好的！</p>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 進度條和統計 */}
      {showProgress && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-600">
              已開啟：{openedBoxes.size} / {boxes.length}
            </span>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-yellow-600">
                總分：{totalPoints}
              </span>
              {maxOpens > 0 && (
                <span className="text-sm font-medium text-gray-600">
                  剩餘次數：{maxOpens - openedBoxes.size}
                </span>
              )}
              {timeLimit > 0 && (
                <span className={`text-sm font-medium ${timeRemaining <= 10 ? 'text-red-600' : 'text-gray-600'}`}>
                  剩餘時間：{timeRemaining}s
                </span>
              )}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(openedBoxes.size / boxes.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* 遊戲說明 */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">神秘開箱遊戲</h2>
        <p className="text-gray-600">
          點擊盒子開啟，看看裡面有什麼驚喜！
          {specialBoxes && <span className="text-purple-600"> 紫色盒子可能有特殊獎勵！</span>}
        </p>
      </div>

      {/* 盒子網格 */}
      <div className={`grid ${getGridCols()} gap-3 max-w-2xl mx-auto`}>
        <AnimatePresence>
          {boxes.map((box, index) => (
            <motion.div
              key={box.id}
              initial={{ opacity: 0, scale: 0, rotateY: 0 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                rotateY: box.isOpened ? 180 : 0
              }}
              transition={{ 
                delay: index * 0.02,
                rotateY: { duration: 0.6 }
              }}
              onClick={() => handleBoxClick(index)}
              className={`aspect-square rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${getBoxStyle(box, index)}`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="w-full h-full flex items-center justify-center">
                {box.isOpened ? (
                  <div className="text-center" style={{ transform: 'rotateY(180deg)' }}>
                    {box.item ? (
                      <div>
                        {box.item.type === 'image' ? (
                          <img 
                            src={box.item.content} 
                            alt="Box content" 
                            className="w-8 h-8 mx-auto mb-1 rounded"
                          />
                        ) : (
                          <div className="text-xs font-medium break-words">
                            {box.item.content}
                          </div>
                        )}
                        {box.item.points && (
                          <div className="text-xs text-yellow-600 font-bold">
                            +{box.item.points}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-500 text-xs">空</div>
                    )}
                  </div>
                ) : (
                  <div className="text-white text-xl">
                    {box.isSpecial ? '⭐' : '📦'}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 提示信息 */}
      <div className="mt-8 text-center text-gray-600">
        <p>點擊盒子開啟，每個盒子只能開啟一次</p>
        {maxOpens > 0 && (
          <p className="mt-2 text-orange-600">
            注意：您只能開啟 {maxOpens} 個盒子，請謹慎選擇！
          </p>
        )}
      </div>
    </div>
  );
};

export default OpenBox;
