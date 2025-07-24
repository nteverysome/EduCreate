'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * 增強版 Airplane 遊戲組件
 * 基於簡化版本，添加更好的視覺效果和 GEPT 詞彙整合
 */
export interface EnhancedAirplaneGameProps {
  onGameStart?: () => void;
  onScoreUpdate?: (score: number) => void;
  onWordLearned?: (word: string, isCorrect: boolean) => void;
  onGameEnd?: (results: any) => void;
  geptLevel?: 'elementary' | 'intermediate' | 'highIntermediate';
  className?: string;
  'data-testid'?: string;
}

interface GameState {
  isLoading: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  error: string | null;
  score: number;
  health: number;
  currentTargetWord: string;
  currentTargetChinese: string;
  wordsLearned: number;
  correctAnswers: number;
}

export default function EnhancedAirplaneGame({
  onGameStart,
  onScoreUpdate,
  onWordLearned,
  onGameEnd,
  geptLevel = 'elementary',
  className = '',
  'data-testid': testId = 'enhanced-airplane-game'
}: EnhancedAirplaneGameProps) {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<any>(null);
  const gameSceneRef = useRef<any>(null);
  
  const [gameState, setGameState] = useState<GameState>({
    isLoading: true,
    isPlaying: false,
    isPaused: false,
    error: null,
    score: 0,
    health: 100,
    currentTargetWord: '',
    currentTargetChinese: '',
    wordsLearned: 0,
    correctAnswers: 0
  });

  // GEPT 詞彙數據
  const geptWords = {
    elementary: [
      { word: 'apple', chinese: '蘋果' },
      { word: 'book', chinese: '書' },
      { word: 'cat', chinese: '貓' },
      { word: 'dog', chinese: '狗' },
      { word: 'fish', chinese: '魚' },
      { word: 'house', chinese: '房子' },
      { word: 'tree', chinese: '樹' },
      { word: 'water', chinese: '水' },
      { word: 'sun', chinese: '太陽' },
      { word: 'moon', chinese: '月亮' }
    ],
    intermediate: [
      { word: 'beautiful', chinese: '美麗的' },
      { word: 'important', chinese: '重要的' },
      { word: 'different', chinese: '不同的' },
      { word: 'possible', chinese: '可能的' },
      { word: 'necessary', chinese: '必要的' }
    ],
    highIntermediate: [
      { word: 'sophisticated', chinese: '複雜的' },
      { word: 'magnificent', chinese: '壯麗的' },
      { word: 'extraordinary', chinese: '非凡的' },
      { word: 'comprehensive', chinese: '全面的' },
      { word: 'fundamental', chinese: '基本的' }
    ]
  };

  const currentWords = geptWords[geptLevel];

  useEffect(() => {
    initializeGame();
    
    return () => {
      destroyGame();
    };
  }, [geptLevel]);

  const initializeGame = async () => {
    try {
      setGameState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // 動態載入 Phaser
      const Phaser = await import('phaser');
      
      if (!gameRef.current) {
        throw new Error('遊戲容器未找到');
      }

      // 選擇第一個目標詞彙
      const firstTarget = currentWords[0];
      setGameState(prev => ({
        ...prev,
        currentTargetWord: firstTarget.word,
        currentTargetChinese: firstTarget.chinese
      }));

      // 創建增強的 Phaser 配置
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 800,
        height: 500,
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
      console.log('🎮 增強版 Airplane 遊戲初始化完成');
      
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
    // 創建飛機紋理（藍色三角形）
    this.add.graphics()
      .fillStyle(0x0066ff)
      .fillTriangle(0, 16, 32, 0, 32, 32)
      .generateTexture('player-plane', 32, 32);
      
    // 創建雲朵紋理（白色橢圓）
    this.add.graphics()
      .fillStyle(0xffffff)
      .fillEllipse(32, 16, 64, 32)
      .lineStyle(2, 0xcccccc)
      .strokeEllipse(32, 16, 64, 32)
      .generateTexture('word-cloud', 64, 32);

    // 創建背景雲朵
    this.add.graphics()
      .fillStyle(0xf0f8ff)
      .fillEllipse(40, 20, 80, 40)
      .generateTexture('bg-cloud', 80, 40);
  }

  function create(this: Phaser.Scene) {
    const scene = this;
    gameSceneRef.current = scene;

    // 創建背景雲朵裝飾
    for (let i = 0; i < 5; i++) {
      const bgCloud = scene.add.image(
        Phaser.Math.Between(100, 700),
        Phaser.Math.Between(50, 150),
        'bg-cloud'
      );
      bgCloud.setAlpha(0.3);
      bgCloud.setScale(Phaser.Math.FloatBetween(0.5, 1.2));
    }

    // 創建玩家飛機
    const player = scene.physics.add.image(100, 250, 'player-plane');
    player.setCollideWorldBounds(true);
    player.setScale(1.5);
    
    // 創建雲朵群組
    const clouds = scene.physics.add.group();
    
    // 創建 UI 文字
    const scoreText = scene.add.text(16, 16, '分數: 0', {
      fontSize: '24px',
      color: '#000000',
      fontFamily: 'Arial',
      backgroundColor: '#ffffff',
      padding: { x: 8, y: 4 }
    });
    
    const healthText = scene.add.text(16, 50, '生命值: 100', {
      fontSize: '20px',
      color: '#000000',
      fontFamily: 'Arial',
      backgroundColor: '#ffffff',
      padding: { x: 8, y: 4 }
    });
    
    const targetText = scene.add.text(16, 84, `目標: ${gameState.currentTargetChinese}`, {
      fontSize: '20px',
      color: '#ff0000',
      fontFamily: 'Arial',
      backgroundColor: '#ffff00',
      padding: { x: 8, y: 4 }
    });

    // 鍵盤控制
    const cursors = scene.input.keyboard?.createCursorKeys();
    const wasd = scene.input.keyboard?.addKeys('W,S,A,D');
    
    // 生成雲朵計時器
    const cloudTimer = scene.time.addEvent({
      delay: 3000,
      callback: () => {
        spawnWordCloud();
      },
      loop: true
    });

    function spawnWordCloud() {
      // 70% 機率生成目標詞彙，30% 生成干擾詞彙
      const isTarget = Math.random() < 0.7;
      let selectedWord;
      
      if (isTarget && gameState.currentTargetWord) {
        selectedWord = currentWords.find(w => w.word === gameState.currentTargetWord);
      } else {
        selectedWord = currentWords[Math.floor(Math.random() * currentWords.length)];
      }
      
      if (!selectedWord) return;

      const cloud = clouds.create(820, Phaser.Math.Between(80, 420), 'word-cloud');
      cloud.setVelocityX(Phaser.Math.Between(-120, -80));
      cloud.setData('word', selectedWord.word);
      cloud.setData('chinese', selectedWord.chinese);
      cloud.setData('isTarget', isTarget);
      
      // 添加英文單字文字
      const wordText = scene.add.text(cloud.x - 30, cloud.y - 8, selectedWord.word, {
        fontSize: '16px',
        color: '#000000',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      });
      cloud.setData('wordText', wordText);
      
      // 如果是目標詞彙，添加特殊效果
      if (isTarget) {
        cloud.setTint(0xffff00); // 黃色高亮
        const glow = scene.add.circle(cloud.x, cloud.y, 40, 0xffff00, 0.2);
        cloud.setData('glow', glow);
      }
    }

    // 碰撞檢測
    scene.physics.add.overlap(player, clouds, (player, cloud: any) => {
      handleCollision(cloud);
    });

    function handleCollision(cloud: any) {
      const word = cloud.getData('word');
      const chinese = cloud.getData('chinese');
      const isTarget = cloud.getData('isTarget');
      const wordText = cloud.getData('wordText');
      const glow = cloud.getData('glow');
      
      // 清理物件
      if (wordText) wordText.destroy();
      if (glow) glow.destroy();
      cloud.destroy();
      
      // 判斷是否正確
      const isCorrect = word === gameState.currentTargetWord;
      
      // 更新遊戲狀態
      setGameState(prev => {
        const newState = {
          ...prev,
          wordsLearned: prev.wordsLearned + 1,
          correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
          score: isCorrect ? prev.score + 10 : Math.max(0, prev.score - 2),
          health: isCorrect ? prev.health : Math.max(0, prev.health - 10)
        };
        
        // 如果答對了，選擇新的目標詞彙
        if (isCorrect) {
          const nextTarget = currentWords[Math.floor(Math.random() * currentWords.length)];
          newState.currentTargetWord = nextTarget.word;
          newState.currentTargetChinese = nextTarget.chinese;
          
          // 更新目標顯示
          targetText.setText(`目標: ${nextTarget.chinese}`);
        }
        
        // 更新 UI
        scoreText.setText(`分數: ${newState.score}`);
        healthText.setText(`生命值: ${newState.health}`);
        
        return newState;
      });
      
      // 觸發回調
      onWordLearned?.(word, isCorrect);
      onScoreUpdate?.(gameState.score + (isCorrect ? 10 : -2));
      
      // 創建反饋效果
      const feedbackColor = isCorrect ? 0x00ff00 : 0xff0000;
      const feedbackText = scene.add.text(cloud.x, cloud.y, isCorrect ? '+10' : '-2', {
        fontSize: '20px',
        color: isCorrect ? '#00ff00' : '#ff0000',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      });
      
      scene.tweens.add({
        targets: feedbackText,
        y: feedbackText.y - 50,
        alpha: 0,
        duration: 1000,
        onComplete: () => feedbackText.destroy()
      });
      
      console.log(`碰撞詞彙: ${word} (${chinese}) - ${isCorrect ? '正確' : '錯誤'}`);
    }

    // 存儲場景物件
    (scene as any).gameObjects = { 
      player, clouds, cursors, wasd, scoreText, healthText, targetText, cloudTimer 
    };
  }

  function update(this: Phaser.Scene) {
    const gameObjects = (this as any).gameObjects;
    if (!gameObjects || !gameState.isPlaying) return;

    const { player, clouds, cursors, wasd } = gameObjects;
    
    // 玩家移動控制
    const speed = 250;
    
    if (cursors?.left.isDown || wasd?.A.isDown) {
      player.setVelocityX(-speed);
    } else if (cursors?.right.isDown || wasd?.D.isDown) {
      player.setVelocityX(speed);
    } else {
      player.setVelocityX(0);
    }

    if (cursors?.up.isDown || wasd?.W.isDown) {
      player.setVelocityY(-speed);
    } else if (cursors?.down.isDown || wasd?.S.isDown) {
      player.setVelocityY(speed);
    } else {
      player.setVelocityY(0);
    }

    // 清理超出邊界的雲朵
    clouds.children.entries.forEach((cloud: any) => {
      if (cloud.x < -100) {
        const wordText = cloud.getData('wordText');
        const glow = cloud.getData('glow');
        if (wordText) wordText.destroy();
        if (glow) glow.destroy();
        cloud.destroy();
      } else {
        // 更新附加物件位置
        const wordText = cloud.getData('wordText');
        const glow = cloud.getData('glow');
        if (wordText) {
          wordText.x = cloud.x - 30;
          wordText.y = cloud.y - 8;
        }
        if (glow) {
          glow.x = cloud.x;
          glow.y = cloud.y;
        }
      }
    });

    // 檢查遊戲結束條件
    if (gameState.health <= 0) {
      gameObjects.cloudTimer.destroy();
      onGameEnd?.({
        score: gameState.score,
        wordsLearned: gameState.wordsLearned,
        correctAnswers: gameState.correctAnswers,
        accuracy: gameState.wordsLearned > 0 ? (gameState.correctAnswers / gameState.wordsLearned) * 100 : 0
      });
      setGameState(prev => ({ ...prev, isPlaying: false }));
    }
  }

  const destroyGame = () => {
    if (phaserGameRef.current) {
      phaserGameRef.current.destroy(true);
      phaserGameRef.current = null;
      gameSceneRef.current = null;
    }
  };

  const startGame = () => {
    setGameState(prev => ({ ...prev, isPlaying: true }));
    onGameStart?.();
  };

  const pauseGame = () => {
    if (gameSceneRef.current && gameState.isPlaying) {
      gameSceneRef.current.scene.pause();
      setGameState(prev => ({ ...prev, isPaused: true }));
    }
  };

  const resumeGame = () => {
    if (gameSceneRef.current && gameState.isPaused) {
      gameSceneRef.current.scene.resume();
      setGameState(prev => ({ ...prev, isPaused: false }));
    }
  };

  const { isLoading, error, isPlaying, isPaused, score, health, currentTargetChinese, wordsLearned, correctAnswers } = gameState;
  const accuracy = wordsLearned > 0 ? Math.round((correctAnswers / wordsLearned) * 100) : 0;

  return (
    <div className={`enhanced-airplane-game ${className}`} data-testid={testId}>
      {/* 遊戲容器 */}
      <div 
        ref={gameRef} 
        className="game-container border-2 border-blue-300 rounded-lg shadow-lg"
        style={{ width: '800px', height: '500px', margin: '0 auto' }}
      />
      
      {/* 載入狀態 */}
      {isLoading && (
        <div className="text-center mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">載入增強版 Phaser 遊戲中...</p>
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
      
      {/* 遊戲控制和統計 */}
      {!isLoading && !error && (
        <div className="mt-4">
          {/* 遊戲統計 */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{score}</div>
              <div className="text-sm text-gray-600">分數</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{health}</div>
              <div className="text-sm text-gray-600">生命值</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">{wordsLearned}</div>
              <div className="text-sm text-gray-600">學習詞彙</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">{accuracy}%</div>
              <div className="text-sm text-gray-600">準確率</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-red-600">{currentTargetChinese}</div>
              <div className="text-sm text-gray-600">當前目標</div>
            </div>
          </div>
          
          {/* 控制按鈕 */}
          <div className="flex justify-center space-x-4">
            {!isPlaying && (
              <button
                onClick={startGame}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                開始遊戲
              </button>
            )}
            
            {isPlaying && !isPaused && (
              <button
                onClick={pauseGame}
                className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                暫停
              </button>
            )}
            
            {isPaused && (
              <button
                onClick={resumeGame}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                繼續
              </button>
            )}
          </div>
          
          {/* 遊戲說明 */}
          <div className="mt-4 text-sm text-gray-600 text-center">
            <p className="mb-1">🎮 使用方向鍵或 WASD 控制藍色飛機</p>
            <p className="mb-1">🎯 碰撞黃色高亮的目標詞彙雲朵獲得分數</p>
            <p>📚 當前 GEPT 等級: <span className="font-semibold text-blue-600">{geptLevel}</span></p>
          </div>
        </div>
      )}
    </div>
  );
}
