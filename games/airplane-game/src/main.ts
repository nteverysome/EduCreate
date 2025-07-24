/**
 * Airplane Collision Game - Vite + Phaser 3 入口點
 * 基於記憶科學的英語詞彙學習遊戲
 */

import Phaser from 'phaser';
import { GameConfig } from './types/game';

// 動態導入場景（避免循環依賴）
const loadGameScene = async () => {
  const { default: GameScene } = await import('./scenes/GameScene');
  return GameScene;
};

/**
 * 初始化 Phaser 遊戲
 */
async function initGame() {
  console.log('🎮 初始化 Airplane Collision Game - Vite 版本');
  
  try {
    // 隱藏載入畫面
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
    
    // 載入遊戲場景
    const GameScene = await loadGameScene();
    
    // 默認遊戲配置
    const defaultConfig: GameConfig = {
      geptLevel: 'elementary',
      enableSound: true,
      enableHapticFeedback: true,
      difficulty: 'medium',
      gameMode: 'practice'
    };
    
    // Phaser 遊戲配置
    const phaserConfig: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: 'game-container',
      backgroundColor: '#000033',
      
      // 物理引擎配置
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      
      // 場景配置
      scene: GameScene,
      
      // 縮放配置
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600
      },
      
      // 音頻配置
      audio: {
        disableWebAudio: false
      },
      
      // 渲染配置
      render: {
        antialias: true,
        pixelArt: false
      }
    };
    
    // 創建 Phaser 遊戲實例
    const game = new Phaser.Game(phaserConfig);
    
    // 將配置傳遞給場景
    game.registry.set('gameConfig', defaultConfig);
    
    // 設置全局錯誤處理
    game.events.on('error', (error: Error) => {
      console.error('❌ Phaser 遊戲錯誤:', error);
    });
    
    // 遊戲就緒回調
    game.events.once('ready', () => {
      console.log('✅ Airplane Collision Game 初始化完成');
      
      // 向父頁面發送就緒消息
      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'GAME_READY',
          timestamp: Date.now()
        }, '*');
      }
    });
    
    // 將遊戲實例暴露到全局（用於調試）
    if (typeof window !== 'undefined') {
      (window as any).phaserGame = game;
    }
    
    return game;
    
  } catch (error) {
    console.error('❌ 遊戲初始化失敗:', error);
    
    // 顯示錯誤信息
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      gameContainer.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100%;
          color: white;
          text-align: center;
          padding: 20px;
        ">
          <h2 style="color: #ff6b6b; margin-bottom: 16px;">⚠️ 遊戲載入失敗</h2>
          <p style="margin-bottom: 16px;">無法初始化 Phaser 遊戲引擎</p>
          <p style="font-size: 14px; opacity: 0.7;">${error instanceof Error ? error.message : '未知錯誤'}</p>
          <button 
            onclick="location.reload()" 
            style="
              margin-top: 20px;
              padding: 10px 20px;
              background: #4CAF50;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
            "
          >
            重新載入
          </button>
        </div>
      `;
    }
    
    throw error;
  }
}

// 等待 DOM 載入完成後初始化遊戲
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}

// 導出初始化函數（用於測試）
export { initGame };
