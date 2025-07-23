import Phaser from 'phaser';
import { phaserConfig, GAME_CONFIG } from './game/config/gameConfig';

// 更新狀態顯示
function updateStatus(message: string, isError: boolean = false) {
  const statusElement = document.getElementById('game-status');
  if (statusElement) {
    statusElement.innerHTML = message;
    statusElement.style.borderColor = isError ? '#e74c3c' : '#3498db';
    statusElement.style.background = isError ? 
      'rgba(231, 76, 60, 0.2)' : 'rgba(52, 73, 94, 0.8)';
  }
}

// 隱藏載入畫面
function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 500);
  }
}

// 主應用程式類
class GameApplication {
  private game: Phaser.Game | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.init();
  }

  private async init() {
    try {
      updateStatus('🔧 初始化遊戲配置...');
      
      // 檢查 Phaser 是否載入
      if (typeof Phaser === 'undefined') {
        throw new Error('Phaser 3 未能正確載入');
      }

      updateStatus(`✅ Phaser ${Phaser.VERSION} 載入成功！`);
      
      // 等待 DOM 完全載入
      if (document.readyState !== 'complete') {
        await new Promise(resolve => {
          window.addEventListener('load', resolve);
        });
      }

      updateStatus('🎮 創建遊戲實例...');
      
      // 創建 Phaser 遊戲實例
      this.createGame();
      
    } catch (error) {
      console.error('遊戲初始化失敗:', error);
      updateStatus(`❌ 初始化失敗: ${error instanceof Error ? error.message : '未知錯誤'}`, true);
    }
  }

  private createGame() {
    try {
      // 確保遊戲容器存在
      const gameContainer = document.getElementById('game-container');
      if (!gameContainer) {
        throw new Error('找不到遊戲容器元素');
      }

      // 創建遊戲配置
      const config: Phaser.Types.Core.GameConfig = {
        ...phaserConfig,
        parent: gameContainer,
        callbacks: {
          preBoot: (_game) => {
            console.log('🚀 Phaser 遊戲預啟動');
            updateStatus('🚀 遊戲引擎啟動中...');
          },
          postBoot: (_game) => {
            console.log('✅ Phaser 遊戲啟動完成');
            updateStatus('🎯 遊戲準備就緒！點擊開始遊戲');
            hideLoadingScreen();
            this.isInitialized = true;
          }
        }
      };

      // 創建遊戲實例
      this.game = new Phaser.Game(config);

      // 設置遊戲事件監聽
      this.setupGameEvents();

    } catch (error) {
      console.error('創建遊戲失敗:', error);
      updateStatus(`❌ 遊戲創建失敗: ${error instanceof Error ? error.message : '未知錯誤'}`, true);
    }
  }

  private setupGameEvents() {
    if (!this.game) return;

    // 監聽遊戲事件
    this.game.events.on('ready', () => {
      console.log('🎮 遊戲系統準備完成');
    });

    this.game.events.on('destroy', () => {
      console.log('🔄 遊戲實例已銷毀');
      this.isInitialized = false;
    });

    // 監聽窗口大小變化
    window.addEventListener('resize', () => {
      if (this.game && this.isInitialized) {
        this.game.scale.refresh();
      }
    });

    // 監聽頁面可見性變化
    document.addEventListener('visibilitychange', () => {
      if (this.game && this.isInitialized) {
        if (document.hidden) {
          // 頁面隱藏時暫停遊戲
          // this.game.scene.pause();
        } else {
          // 頁面顯示時恢復遊戲
          // this.game.scene.resume();
        }
      }
    });
  }

  // 公共方法：獲取遊戲實例
  public getGame(): Phaser.Game | null {
    return this.game;
  }

  // 公共方法：檢查是否已初始化
  public isReady(): boolean {
    return this.isInitialized;
  }

  // 公共方法：銷毀遊戲
  public destroy() {
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
      this.isInitialized = false;
    }
  }
}

// 全域變數，供調試使用
declare global {
  interface Window {
    gameApp: GameApplication;
    Phaser: typeof Phaser;
  }
}

// 啟動應用程式
console.log('🎯 開始初始化 Phaser 3 飛機選擇器');
console.log(`📊 遊戲配置: ${GAME_CONFIG.SCREEN.WIDTH}x${GAME_CONFIG.SCREEN.HEIGHT}`);

const gameApp = new GameApplication();

// 將實例掛載到全域，供調試使用
window.gameApp = gameApp;
window.Phaser = Phaser;

// 開發模式下的額外功能
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 開發模式已啟用');

  // 熱重載支援 (在 Vite 環境中)
  if (typeof window !== 'undefined' && (window as any).import?.meta?.hot) {
    (window as any).import.meta.hot.accept(() => {
      console.log('🔄 熱重載觸發，重新載入遊戲');
      gameApp.destroy();
      location.reload();
    });
  }

  // 開發提示
  console.log('🎮 開發快捷鍵:');
  console.log('  F12: 切換調試面板');
  console.log('  Ctrl+R: 重新載入場景');
  console.log('  Ctrl+D: 切換物理調試');
  console.log('  Ctrl+G: 切換網格顯示');
  console.log('  Ctrl+P: 暫停/恢復遊戲');
}

export default gameApp;
