/**
 * Labelled Diagram Game Component
 * 基於標籤空間記憶機制的圖表標註遊戲
 */

import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface LabelItem {
  id: string;
  text: string;
  x: number; // 正確位置的 x 坐標 (百分比)
  y: number; // 正確位置的 y 坐標 (百分比)
  tolerance: number; // 容錯範圍 (像素)
}

interface PlacedLabel {
  id: string;
  text: string;
  x: number;
  y: number;
  isCorrect?: boolean;
}

interface LabelledDiagramGameProps {
  image: string;
  labels: LabelItem[];
  zoomEnabled?: boolean;
  showGrid?: boolean;
  timeLimit?: number;
  onComplete?: (score: number, timeUsed: number) => void;
  onScoreUpdate?: (score: number) => void;
}

export default function LabelledDiagramGame({
  image,
  labels,
  zoomEnabled = true,
  showGrid = false,
  timeLimit = 0,
  onComplete,
  onScoreUpdate
}: LabelledDiagramGameProps) {
  const [availableLabels, setAvailableLabels] = useState<LabelItem[]>(labels);
  const [placedLabels, setPlacedLabels] = useState<PlacedLabel[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [draggedLabel, setDraggedLabel] = useState<LabelItem | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
    // 打亂標籤順序
    setAvailableLabels([...labels].sort(() => Math.random() - 0.5));
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleDragStart = (labelId: string) => {
    const label = availableLabels.find(l => l.id === labelId);
    setDraggedLabel(label || null);
  };

  const handleDragEnd = () => {
    setDraggedLabel(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (!draggedLabel || !imageRef.current || !containerRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    
    // 計算相對於圖片的位置
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // 檢查是否在正確位置
    const isCorrect = checkLabelPosition(draggedLabel, x, y);
    
    // 放置標籤
    const newPlacedLabel: PlacedLabel = {
      id: draggedLabel.id,
      text: draggedLabel.text,
      x,
      y,
      isCorrect
    };

    setPlacedLabels(prev => [...prev, newPlacedLabel]);
    setAvailableLabels(prev => prev.filter(l => l.id !== draggedLabel.id));

    // 更新分數和反饋
    if (isCorrect) {
      const points = 10;
      setScore(prev => {
        const newScore = prev + points;
        onScoreUpdate?.(newScore);
        return newScore;
      });
      
      setFeedbackMessage('正確位置！');
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 1000);
    } else {
      setFeedbackMessage('位置不正確，再試試看！');
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 1500);
    }

    // 檢查是否完成
    if (availableLabels.length === 1) { // 因為當前標籤還沒從數組中移除
      setTimeout(() => {
        handleGameComplete();
      }, 1000);
    }

    setDraggedLabel(null);
  };

  const checkLabelPosition = (label: LabelItem, x: number, y: number): boolean => {
    if (!imageRef.current) return false;

    const rect = imageRef.current.getBoundingClientRect();
    const tolerance = label.tolerance;
    
    // 將百分比轉換為像素
    const targetX = (label.x / 100) * rect.width;
    const targetY = (label.y / 100) * rect.height;
    const actualX = (x / 100) * rect.width;
    const actualY = (y / 100) * rect.height;
    
    // 計算距離
    const distance = Math.sqrt(
      Math.pow(actualX - targetX, 2) + Math.pow(actualY - targetY, 2)
    );
    
    return distance <= tolerance;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };

  const resetZoom = () => {
    setZoomLevel(1);
  };

  const removePlacedLabel = (labelId: string) => {
    const placedLabel = placedLabels.find(l => l.id === labelId);
    if (placedLabel) {
      const originalLabel = labels.find(l => l.id === labelId);
      if (originalLabel) {
        setAvailableLabels(prev => [...prev, originalLabel]);
        setPlacedLabels(prev => prev.filter(l => l.id !== labelId));
        
        // 如果移除的是正確標籤，扣分
        if (placedLabel.isCorrect) {
          setScore(prev => Math.max(0, prev - 10));
        }
      }
    }
  };

  const handleGameComplete = () => {
    setGameCompleted(true);
    const timeUsed = startTime ? (Date.now() - startTime) / 1000 : 0;
    onComplete?.(score, timeUsed);
  };

  const showHint = () => {
    // 顯示所有正確位置的提示
    const hints = labels.map(label => ({
      ...label,
      x: label.x,
      y: label.y
    }));
    
    // 臨時顯示提示點
    setShowFeedback(true);
    setFeedbackMessage('查看圖片上的提示點！');
    
    setTimeout(() => {
      setShowFeedback(false);
    }, 3000);
  };

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">標籤圖表</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          將標籤拖拽到圖片上的正確位置。基於標籤空間記憶機制，提高您的空間認知能力。
        </p>
        <div className="mb-6 text-center">
          <p className="text-sm text-gray-500">標籤數量: {labels.length}</p>
          {zoomEnabled && <p className="text-sm text-gray-500">支持縮放功能</p>}
          {timeLimit > 0 && <p className="text-sm text-gray-500">時間限制: {timeLimit} 秒</p>}
        </div>
        <button
          onClick={startGame}
          className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-lg font-semibold"
        >
          開始標註
        </button>
      </div>
    );
  }

  if (gameCompleted) {
    const correctLabels = placedLabels.filter(l => l.isCorrect).length;
    const accuracy = (correctLabels / labels.length) * 100;
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <h2 className="text-3xl font-bold text-green-600 mb-4">標註完成！</h2>
        <div className="text-center">
          <p className="text-xl mb-2">最終得分: <span className="font-bold text-blue-600">{score}</span></p>
          <p className="text-gray-600">正確標籤: {correctLabels}/{labels.length}</p>
          <p className="text-gray-600">準確率: {accuracy.toFixed(1)}%</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          再玩一次
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* 遊戲狀態欄 */}
      <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <span className="text-lg font-semibold">得分: {score}</span>
          <span className="text-sm text-gray-600">
            剩餘標籤: {availableLabels.length}/{labels.length}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          {zoomEnabled && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleZoomOut}
                className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                -
              </button>
              <span className="text-sm text-gray-600">{Math.round(zoomLevel * 100)}%</span>
              <button
                onClick={handleZoomIn}
                className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                +
              </button>
              <button
                onClick={resetZoom}
                className="px-2 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                重置
              </button>
            </div>
          )}
          <button
            onClick={showHint}
            className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
          >
            顯示提示
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
          feedbackMessage.includes('正確') ? 'bg-green-500' : 'bg-orange-500'
        }`}>
          {feedbackMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 圖片區域 */}
        <div className="lg:col-span-3">
          <div 
            ref={containerRef}
            className="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-white"
            style={{ minHeight: '400px' }}
          >
            <div 
              className="relative overflow-auto"
              style={{ 
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'top left',
                width: `${100 / zoomLevel}%`,
                height: `${100 / zoomLevel}%`
              }}
            >
              <img
                ref={imageRef}
                src={image}
                alt="Diagram to label"
                className="w-full h-auto"
                onLoad={handleImageLoad}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                style={{ 
                  cursor: draggedLabel ? 'crosshair' : 'default',
                  userSelect: 'none'
                }}
              />
              
              {/* 網格 */}
              {showGrid && imageLoaded && (
                <div className="absolute inset-0 pointer-events-none">
                  <svg className="w-full h-full">
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>
              )}
              
              {/* 已放置的標籤 */}
              {placedLabels.map((label) => (
                <div
                  key={label.id}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 px-2 py-1 text-xs rounded shadow-lg cursor-pointer ${
                    label.isCorrect 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}
                  style={{
                    left: `${label.x}%`,
                    top: `${label.y}%`,
                    zIndex: 10
                  }}
                  onClick={() => removePlacedLabel(label.id)}
                  title={label.isCorrect ? '正確位置 - 點擊移除' : '錯誤位置 - 點擊移除'}
                >
                  {label.text}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-current"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 標籤區域 */}
        <div className="lg:col-span-1">
          <h4 className="text-lg font-semibold mb-4">可用標籤</h4>
          <div className="space-y-2">
            {availableLabels.map((label) => (
              <div
                key={label.id}
                draggable
                onDragStart={() => handleDragStart(label.id)}
                onDragEnd={handleDragEnd}
                className="p-3 bg-blue-100 text-blue-800 rounded-lg cursor-move hover:bg-blue-200 transition-colors select-none border-2 border-blue-200"
              >
                {label.text}
              </div>
            ))}
          </div>
          
          {availableLabels.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              所有標籤已使用
            </p>
          )}
          
          <div className="mt-6 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
            <p className="font-semibold mb-2">操作說明：</p>
            <ul className="space-y-1">
              <li>• 拖拽標籤到圖片上的正確位置</li>
              <li>• 點擊已放置的標籤可以移除</li>
              <li>• 綠色標籤表示正確位置</li>
              <li>• 紅色標籤表示錯誤位置</li>
              {zoomEnabled && <li>• 使用縮放功能查看細節</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
