'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * 簡化版 Airplane 遊戲組件
 * 用於測試 Phaser 載入和基本功能
 */
export interface SimpleAirplaneGameProps {
  onGameStart?: () => void;
  onScoreUpdate?: (score: number) => void;
  onWordLearned?: (word: string, isCorrect: boolean) => void;
  onGameEnd?: (results: any) => void;
  className?: string;
  'data-testid'?: string;
}

interface GameState {
  isLoading: boolean;
  isPlaying: boolean;
  error: string | null;
  score: number;
  health: number;
  currentWord: string;
}

export default function SimpleAirplaneGame({
  onGameStart,
  onScoreUpdate,
  onWordLearned,
  onGameEnd,
  className = '',
  'data-testid': testId = 'simple-airplane-game'
}: SimpleAirplaneGameProps) {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<any>(null);
  
  const [gameState, setGameState] = useState<GameState>({
    isLoading: true,
    isPlaying: false,
    error: null,
    score: 0,
    health: 100,
    currentWord: ''
  });

  // 模擬詞彙數據
  const sampleWords = [
    { word: 'apple', chinese: '蘋果' },
    { word: 'book', chinese: '書' },
    { word: 'cat', chinese: '貓' },
    { word: 'dog', chinese: '狗' },
    { word: 'fish', chinese: '魚' }
  ];

  useEffect(() => {
    initializeGame();
    
    return () => {
      destroyGame();
    };
  }, []);

  const initializeGame = async () => {
    try {
      setGameState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // 動態載入 Phaser
      const Phaser = await import('phaser');
      
      if (!gameRef.current) {
        throw new Error('遊戲容器未找到');
      }

      // 創建簡化的 Phaser 配置
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 800,
        height: 400,
        parent: gameRef.current,
        backgroundColor: '#87CEEB', // 天空藍
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 0 },
            debug: false
          }
        },
        scene: {
          preload: preload,
          create: create,
          update: update
        },
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH
        }
      };

      // 創建遊戲實例
      phaserGameRef.current = new Phaser.Game(config);
      
      setGameState(prev => ({ ...prev, isLoading: false }));
      console.log('🎮 簡化版 Airplane 遊戲初始化完成');
      
    } catch (error) {
      console.error('❌ 遊戲初始化失敗:', error);
      setGameState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : '遊戲初始化失敗',
        isLoading: false 
      }));
    }
  };

  // Phaser 場景函數
  function preload(this: Phaser.Scene) {
    // 創建簡單的彩色矩形作為遊戲物件
    this.add.graphics()
      .fillStyle(0x0000ff)
      .fillRect(0, 0, 32, 32)
      .generateTexture('player', 32, 32);
      
    this.add.graphics()
      .fillStyle(0xffffff)
      .fillRect(0, 0, 64, 32)
      .generateTexture('cloud', 64, 32);
  }

  function create(this: Phaser.Scene) {
    // 創建玩家飛機
    const player = this.physics.add.image(100, 200, 'player');
    player.setCollideWorldBounds(true);
    
    // 創建雲朵群組
    const clouds = this.physics.add.group();
    
    // 添加文字顯示
    const scoreText = this.add.text(16, 16, '分數: 0', {
      fontSize: '24px',
      color: '#000000'
    });
    
    const targetText = this.add.text(16, 50, '目標: apple (蘋果)', {
      fontSize: '20px',
      color: '#000000'
    });

    // 鍵盤控制
    const cursors = this.input.keyboard?.createCursorKeys();
    
    // 生成雲朵計時器
    this.time.addEvent({
      delay: 2000,
      callback: () => {
        const randomWord = sampleWords[Math.floor(Math.random() * sampleWords.length)];
        const cloud = clouds.create(800, Phaser.Math.Between(50, 350), 'cloud');
        cloud.setVelocityX(-100);
        cloud.setData('word', randomWord.word);
        cloud.setData('chinese', randomWord.chinese);
        
        // 添加文字到雲朵
        const wordText = this.add.text(cloud.x - 20, cloud.y - 10, randomWord.word, {
          fontSize: '16px',
          color: '#000000'
        });
        cloud.setData('wordText', wordText);
      },
      loop: true
    });

    // 碰撞檢測
    this.physics.add.overlap(player, clouds, (player, cloud: any) => {
      const word = cloud.getData('word');
      const wordText = cloud.getData('wordText');
      
      if (wordText) wordText.destroy();
      cloud.destroy();
      
      // 模擬學習事件
      const isCorrect = word === 'apple'; // 簡化邏輯
      onWordLearned?.(word, isCorrect);
      
      if (isCorrect) {
        setGameState(prev => ({ ...prev, score: prev.score + 10 }));
        onScoreUpdate?.(gameState.score + 10);
      }
      
      console.log(`碰撞詞彙: ${word} - ${isCorrect ? '正確' : '錯誤'}`);
    });

    // 存儲場景引用
    (this as any).gameObjects = { player, clouds, scoreText, targetText, cursors };
  }

  function update(this: Phaser.Scene) {
    const gameObjects = (this as any).gameObjects;
    if (!gameObjects) return;

    const { player, clouds, cursors } = gameObjects;
    
    // 玩家移動
    if (cursors?.left.isDown) {
      player.setVelocityX(-200);
    } else if (cursors?.right.isDown) {
      player.setVelocityX(200);
    } else {
      player.setVelocityX(0);
    }

    if (cursors?.up.isDown) {
      player.setVelocityY(-200);
    } else if (cursors?.down.isDown) {
      player.setVelocityY(200);
    } else {
      player.setVelocityY(0);
    }

    // 清理超出邊界的雲朵
    clouds.children.entries.forEach((cloud: any) => {
      if (cloud.x < -100) {
        const wordText = cloud.getData('wordText');
        if (wordText) wordText.destroy();
        cloud.destroy();
      }
    });
  }

  const destroyGame = () => {
    if (phaserGameRef.current) {
      phaserGameRef.current.destroy(true);
      phaserGameRef.current = null;
    }
  };

  const startGame = () => {
    setGameState(prev => ({ ...prev, isPlaying: true }));
    onGameStart?.();
  };

  const { isLoading, error, isPlaying, score, health } = gameState;

  return (
    <div className={`simple-airplane-game ${className}`} data-testid={testId}>
      {/* 遊戲容器 */}
      <div 
        ref={gameRef} 
        className="game-container border-2 border-gray-300 rounded-lg"
        style={{ width: '800px', height: '400px', margin: '0 auto' }}
      />
      
      {/* 載入狀態 */}
      {isLoading && (
        <div className="text-center mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">載入 Phaser 遊戲中...</p>
        </div>
      )}
      
      {/* 錯誤狀態 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
          <div className="text-red-800">錯誤: {error}</div>
          <button 
            onClick={initializeGame}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            重試
          </button>
        </div>
      )}
      
      {/* 遊戲控制 */}
      {!isLoading && !error && (
        <div className="mt-4 text-center">
          <div className="mb-4">
            <span className="mr-4">分數: {score}</span>
            <span className="mr-4">生命值: {health}</span>
            <span>狀態: {isPlaying ? '進行中' : '待開始'}</span>
          </div>
          
          {!isPlaying && (
            <button
              onClick={startGame}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              開始遊戲
            </button>
          )}
          
          <div className="mt-4 text-sm text-gray-600">
            <p>使用方向鍵控制藍色方塊（飛機），碰撞白色方塊（雲朵）上的英文單字</p>
            <p>目標：碰撞 "apple" 獲得分數</p>
          </div>
        </div>
      )}
    </div>
  );
}
