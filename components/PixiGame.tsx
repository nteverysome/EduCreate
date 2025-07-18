import { useEffect, useRef, useState, useCallback } from 'react';
import * as PIXI from 'pixi.js';

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
  onComplete?: (score: number, total: number) => void;
}

export default function PixiGame({
  width = 800,
  height = 600,
  backgroundColor = 0xf0f0f0,
  gameData = { items: [] },
  onComplete
}: PixiGameProps) {
  const pixiContainer = useRef<HTMLDivElement>(null);
  const app = useRef<PIXI.Application | null>(null);
  const gameObjects = useRef<Map<string, PIXI.Container>>(new Map());
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);

  // 動畫遊戲對象
  const animateGameObjects = useCallback(() => {
    gameObjects.current.forEach((obj) => {
      // 簡單的浮動動畫
      obj.y += Math.sin(Date.now() * 0.001 + obj.x * 0.01) * 0.5;
    });
  }, []);

  // 檢查遊戲完成
  const checkGameCompletion = useCallback(() => {
    // 模擬遊戲完成條件
    const totalItems = gameData.items?.length || 0;
    const currentScore = Math.floor(Math.random() * totalItems) + 1;
    
    setScore(currentScore);
    
    if (currentScore >= totalItems) {
      setGameCompleted(true);
      onComplete?.(currentScore, totalItems);
    }
  }, [gameData.items, onComplete]);

  // 拖動開始
  const onDragStart = useCallback((event: any) => {
    const obj = event.currentTarget;
    obj.alpha = 0.5;
    obj.data = event.data;
    obj.dragging = true;
  }, []);

  // 拖動結束
  const onDragEnd = useCallback((event: any) => {
    const obj = event.currentTarget;
    obj.alpha = 1;
    obj.dragging = false;
    obj.data = null;
    
    // 檢查遊戲完成
    checkGameCompletion();
  }, [checkGameCompletion]);

  // 拖動移動
  const onDragMove = useCallback((event: any) => {
    const obj = event.currentTarget;
    if (obj.dragging) {
      const newPosition = obj.data.getLocalPosition(obj.parent);
      obj.x = newPosition.x;
      obj.y = newPosition.y;
    }
  }, []);

  // 更新遊戲元素
  const updateGame = useCallback(() => {
    if (!app.current) return;

    // 清除現有遊戲對象
    gameObjects.current.forEach((obj) => {
      app.current?.stage.removeChild(obj);
    });
    gameObjects.current.clear();

    // 添加新的遊戲對象
    if (gameData.items && gameData.items.length > 0) {
      gameData.items.forEach((item) => {
        // 創建遊戲對象
        const container = new PIXI.Container();
        container.x = item.x || Math.random() * (width - 100);
        container.y = item.y || Math.random() * (height - 50);
        container.interactive = true;
        (container as any).buttonMode = true;

        // 創建背景
        const background = new PIXI.Graphics();
        background.beginFill(item.color || 0x3498db);
        background.drawRoundedRect(0, 0, 100, 50, 10);
        background.endFill();

        // 創建文本
        const text = new PIXI.Text(item.text, {
          fontFamily: 'Arial',
          fontSize: 16,
          fill: 0xffffff,
          align: 'center'
        });
        text.x = 50 - text.width / 2;
        text.y = 25 - text.height / 2;

        // 添加到容器
        container.addChild(background);
        container.addChild(text);

        // 添加拖動事件
        container.on('pointerdown', onDragStart)
                 .on('pointerup', onDragEnd)
                 .on('pointerupoutside', onDragEnd)
                 .on('pointermove', onDragMove);

        // 添加到舞台
        if (app.current && app.current.stage) {
          app.current.stage.addChild(container);
          gameObjects.current.set(item.id, container);
        }
      });
    }
  }, [gameData.items, width, height, onDragStart, onDragEnd, onDragMove]);

  // 初始化遊戲
  const initGame = useCallback(() => {
    if (!app.current || !app.current.stage || !app.current.ticker) return;

    // 創建遊戲容器
    const gameContainer = new PIXI.Container();
    app.current.stage.addChild(gameContainer);

    // 添加遊戲元素
    updateGame();

    // 設置遊戲循環
    app.current.ticker.add(() => {
      // 遊戲循環邏輯
      animateGameObjects();
    });
  }, [updateGame, animateGameObjects]);

  // 初始化 PixiJS 應用
  useEffect(() => {
    if (!pixiContainer.current) return;

    // 在 effect 开始时复制 ref 值
    const currentGameObjects = gameObjects.current;

    // 創建 PIXI 應用
    app.current = new PIXI.Application({
      width,
      height,
      backgroundColor,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
    });

    // 將 PIXI 應用添加到 DOM
    pixiContainer.current.appendChild(app.current.view as HTMLCanvasElement);

    // 初始化遊戲
    initGame();

    // 清理函數
    return () => {
      if (app.current) {
        app.current.destroy(true, true);
        app.current = null;
      }
      // 使用在 effect 开始时复制的值
      if (currentGameObjects) {
        currentGameObjects.clear();
      }
    };
  }, [width, height, backgroundColor, initGame]);

  // 當遊戲數據變化時更新遊戲
  useEffect(() => {
    if (app.current) {
      updateGame();
    }
  }, [gameData, updateGame]);




  return (
    <div className="pixi-game-container">
      <div ref={pixiContainer} className="pixi-canvas-container"></div>
      {gameCompleted && (
        <div className="game-completed-overlay">
          <div className="game-completed-message">
            <h2>遊戲完成！</h2>
            <p>得分: {score}/{gameData.items?.length || 0}</p>
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              onClick={() => {
                setGameCompleted(false);
                updateGame();
              }}
            >
              再玩一次
            </button>
          </div>
        </div>
      )}
      <style jsx>{`
        .pixi-game-container {
          position: relative;
          width: ${width}px;
          height: ${height}px;
          margin: 0 auto;
        }
        .pixi-canvas-container {
          width: 100%;
          height: 100%;
        }
        .game-completed-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10;
        }
        .game-completed-message {
          background-color: white;
          padding: 2rem;
          border-radius: 0.5rem;
          text-align: center;
        }
      `}</style>
    </div>
  );
}