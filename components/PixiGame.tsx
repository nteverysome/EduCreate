import { useEffect, useRef, useState } from 'react';
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

  // 初始化 PixiJS 應用
  useEffect(() => {
    if (!pixiContainer.current) return;

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
      gameObjects.current.clear();
    };
  }, []);

  // 當遊戲數據變化時更新遊戲
  useEffect(() => {
    if (app.current) {
      updateGame();
    }
  }, [gameData]);

  // 初始化遊戲
  const initGame = () => {
    if (!app.current) return;

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
  };

  // 更新遊戲元素
  const updateGame = () => {
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
        container.y = item.y || Math.random() * (height - 100);
        container.interactive = true;
        container.buttonMode = true;

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
          align: 'center',
        });
        text.anchor.set(0.5);
        text.x = 50;
        text.y = 25;

        // 將背景和文本添加到容器
        container.addChild(background);
        container.addChild(text);

        // 添加拖動功能
        container
          .on('pointerdown', onDragStart)
          .on('pointerup', onDragEnd)
          .on('pointerupoutside', onDragEnd)
          .on('pointermove', onDragMove);

        // 將容器添加到舞台
        app.current?.stage.addChild(container);

        // 存儲遊戲對象引用
        gameObjects.current.set(item.id, container);
      });
    }
  };

  // 動畫遊戲對象
  const animateGameObjects = () => {
    // 在這裡添加動畫邏輯
    gameObjects.current.forEach((obj) => {
      // 簡單的動畫效果，例如輕微浮動
      obj.rotation += 0.001;
    });
  };

  // 拖動開始
  const onDragStart = (event: PIXI.FederatedPointerEvent) => {
    const obj = event.currentTarget as PIXI.Container;
    obj.alpha = 0.8;
    obj.data = event;
    obj.dragging = true;
  };

  // 拖動結束
  const onDragEnd = (event: PIXI.FederatedPointerEvent) => {
    const obj = event.currentTarget as PIXI.Container;
    obj.alpha = 1;
    obj.dragging = false;
    obj.data = null;

    // 檢查遊戲是否完成
    checkGameCompletion();
  };

  // 拖動移動
  const onDragMove = (event: PIXI.FederatedPointerEvent) => {
    const obj = event.currentTarget as PIXI.Container;
    if (obj.dragging) {
      const newPosition = obj.data.getLocalPosition(obj.parent);
      obj.x = newPosition.x - 50;
      obj.y = newPosition.y - 25;
    }
  };

  // 檢查遊戲是否完成
  const checkGameCompletion = () => {
    // 這裡實現遊戲完成的邏輯
    // 例如，檢查所有項目是否都放在正確的位置
    const totalItems = gameData.items?.length || 0;
    const newScore = Math.floor(Math.random() * (totalItems + 1)); // 模擬得分

    setScore(newScore);

    // 如果所有項目都放在正確的位置，遊戲完成
    if (Math.random() > 0.7) { // 模擬遊戲完成條件
      setGameCompleted(true);
      if (onComplete) {
        onComplete(newScore, totalItems);
      }
    }
  };

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