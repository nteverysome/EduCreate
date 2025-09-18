import { useEffect, useRef, useState, useCallback } from 'react';

interface PixiGameProps {
  width?: number;
  height?: number;
  backgroundColor?: number;
  gameData?: {
    items?: Array<{
      id: string;
      text: string;
      x?: number;
      y?: number;
      color?: number;
    }>;
  };
  onComplete?: (score?: number, total?: number) => void;
}

export default function PixiGame({
  width = 800,
  height = 600,
  backgroundColor = 0xf0f0f0,
  gameData = { items: [] },
  onComplete
}: PixiGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);

  // 簡化的遊戲邏輯
  const updateGame = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // 清除畫布
      ctx.clearRect(0, 0, width, height);
      
      // 繪製背景
      ctx.fillStyle = `#${backgroundColor.toString(16).padStart(6, '0')}`;
      ctx.fillRect(0, 0, width, height);
      
      // 繪製遊戲元素
      if (gameData.items && gameData.items.length > 0) {
        gameData.items.forEach((item, index) => {
          const x = item.x || (index * 120 + 60);
          const y = item.y || (height / 2);
          
          // 繪製圓形
          ctx.fillStyle = item.color ? `#${item.color.toString(16).padStart(6, '0')}` : '#3498db';
          ctx.beginPath();
          ctx.arc(x, y, 30, 0, 2 * Math.PI);
          ctx.fill();
          
          // 繪製文字
          ctx.fillStyle = '#ffffff';
          ctx.font = '16px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(item.text || `Item ${index + 1}`, x, y + 5);
        });
      } else {
        // 默認顯示
        ctx.fillStyle = '#3498db';
        ctx.fillRect(50, 50, 100, 100);
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Canvas Game', 100, 105);
        ctx.fillText('(PIXI.js removed)', 100, 125);
      }
    }
  }, [width, height, backgroundColor, gameData.items]);

  // 處理點擊事件
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // 簡單的點擊檢測
    if (gameData.items && gameData.items.length > 0) {
      gameData.items.forEach((item, index) => {
        const itemX = item.x || (index * 120 + 60);
        const itemY = item.y || (height / 2);
        
        const distance = Math.sqrt((x - itemX) ** 2 + (y - itemY) ** 2);
        if (distance <= 30) {
          setScore(prev => prev + 1);
          
          // 檢查遊戲完成
          if (score + 1 >= gameData.items!.length) {
            setGameCompleted(true);
            onComplete?.(score + 1, gameData.items!.length);
          }
        }
      });
    }
  }, [gameData.items, height, score, onComplete]);

  // 重新開始遊戲
  const handleRestart = useCallback(() => {
    setScore(0);
    setGameCompleted(false);
    updateGame();
  }, [updateGame]);

  // 初始化 Canvas
  useEffect(() => {
    updateGame();
  }, [updateGame]);

  return (
    <div className="canvas-game-container">
      <canvas 
        ref={canvasRef}
        width={width}
        height={height}
        className="border border-gray-300 rounded cursor-pointer"
        style={{ backgroundColor: `#${backgroundColor.toString(16).padStart(6, '0')}` }}
        onClick={handleCanvasClick}
      />
      <div className="mt-4 text-center">
        <p>得分: {score}/{gameData.items?.length || 0}</p>
        <p className="text-gray-600">Canvas 遊戲 (PIXI.js 已移除)</p>
        <button 
          className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          onClick={handleRestart}
        >
          重新開始
        </button>
      </div>
      {gameCompleted && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">遊戲完成！</h2>
            <p className="mb-4">得分: {score}/{gameData.items?.length || 0}</p>
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              onClick={handleRestart}
            >
              再玩一次
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
