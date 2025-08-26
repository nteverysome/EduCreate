/**
 * Airplane Collision Game - Vite + Phaser 3 入口點
 * 基於記憶科學的英語詞彙學習遊戲
 */

import Phaser from 'phaser';
import { GameConfig } from './types/game';
import { ResponsivePhaserConfig } from './config/ResponsivePhaserConfig';

// 直接導入場景（簡化調試）
import GameScene from './scenes/GameScene';

const loadGameScene = async () => {
  console.log('✅ GameScene 直接導入成功');
  return GameScene;
};

/**
 * 初始化 Phaser 遊戲
 */
async function initGame() {
  console.log('🎮 初始化 Airplane Collision Game - Vite 版本');
  
  try {
    console.log('🔧 開始初始化流程...');

    // 隱藏載入畫面
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.style.display = 'none';
      console.log('✅ 載入畫面已隱藏');
    }

    // 載入遊戲場景
    console.log('📦 載入遊戲場景...');
    const GameScene = await loadGameScene();
    console.log('✅ 遊戲場景載入完成:', GameScene.name);

    // 默認遊戲配置
    console.log('⚙️ 設置遊戲配置...');
    const defaultConfig: GameConfig = {
      geptLevel: 'elementary',
      enableSound: true,
      enableHapticFeedback: true,
      difficulty: 'medium',
      gameMode: 'practice'
    };
    console.log('✅ 遊戲配置設置完成');

    // 🚀 使用優化後的響應式 Phaser 配置
    console.log('🎯 獲取響應式 Phaser 配置...');
    const phaserConfig = ResponsivePhaserConfig.getAdaptiveConfig();
    console.log('✅ 響應式配置獲取完成');

    // 設置場景
    console.log('🎬 設置場景到配置...');
    phaserConfig.scene = GameScene;
    console.log('✅ 場景設置完成');

    // 顯示配置比較信息
    console.log('📊 顯示配置比較...');
    ResponsivePhaserConfig.compareConfigs();
    console.log('✅ 配置比較完成');
    
    // 創建 Phaser 遊戲實例
    console.log('🎮 創建 Phaser 遊戲實例...');
    const game = new Phaser.Game(phaserConfig);
    console.log('✅ Phaser 遊戲實例創建完成');

    // 將配置傳遞給場景
    console.log('📋 傳遞配置給場景...');
    game.registry.set('gameConfig', defaultConfig);
    console.log('✅ 配置傳遞完成');
    
    // 設置全局錯誤處理
    game.events.on('error', (error: Error) => {
      console.error('❌ Phaser 遊戲錯誤:', error);
    });
    
    // 防止重複發送的標記
    let gameReadySent = false;
    
    // 增強的遊戲就緒檢測
    const sendGameReadyMessage = () => {
      if (gameReadySent) {
        console.log('⚠️ GAME_READY 已發送，跳過重複發送');
        return;
      }
      
      gameReadySent = true;
      console.log('📤 發送 GAME_READY 消息 (首次)');
      
      const message = {
        type: 'GAME_READY',
        timestamp: Date.now()
      };
      
      // 向父頁面發送就緒消息
      if (window.parent !== window) {
        console.log('📤 向父頁面發送消息:', message);
        window.parent.postMessage(message, '*');
      } else {
        console.log('⚠️ 未檢測到父頁面，可能是直接訪問');
      }
    };
    
    // 主要的遊戲就緒回調
    game.events.once('ready', () => {
      console.log('✅ Airplane Collision Game 初始化完成 (Phaser ready event)');
      sendGameReadyMessage();
    });
    
    // 備用的載入完成檢測 (防止 ready 事件失效)
    setTimeout(() => {
      if (game && game.scene && !gameReadySent) {
        console.log('⏰ 備用載入檢測觸發 (3秒後)');
        sendGameReadyMessage();
      }
    }, 3000);
    
    // 第三重保障：監聽場景載入完成
    let stepListener = () => {
      if (game.scene.getScenes().length > 0 && game.scene.getScenes()[0].scene.isActive() && !gameReadySent) {
        console.log('🎬 檢測到場景已激活');
        game.events.off('step', stepListener); // 移除監聽器
        sendGameReadyMessage();
      }
    };
    game.events.on('step', stepListener);
    
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
