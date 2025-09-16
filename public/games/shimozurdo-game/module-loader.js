// ES6 模組載入器 - 解決 shimozurdo 遊戲的模組依賴問題
// 這個載入器確保所有模組按正確順序載入

console.log('🔧 模組載入器啟動');

// 模組載入狀態追蹤
const moduleLoadStatus = {
  handler: false,
  preload: false,
  title: false,
  hub: false,
  main: false
};

// 載入進度追蹤
let loadedModules = 0;
const totalModules = 5;

// 更新載入進度
function updateLoadProgress(moduleName) {
  moduleLoadStatus[moduleName] = true;
  loadedModules++;
  console.log(`✅ 模組載入完成: ${moduleName} (${loadedModules}/${totalModules})`);
  
  if (loadedModules === totalModules) {
    console.log('🎉 所有模組載入完成，啟動遊戲');
    initializeGame();
  }
}

// 錯誤處理
function handleModuleError(moduleName, error) {
  console.error(`❌ 模組載入失敗: ${moduleName}`, error);
  
  // 嘗試重新載入
  setTimeout(() => {
    console.log(`🔄 重試載入模組: ${moduleName}`);
    loadModule(moduleName);
  }, 1000);
}

// 解析靜態資源的絕對路徑（避免相對路徑在重寫下解析錯誤）
function resolveGamePath(rel) {
  const base = '/games/shimozurdo-game/';
  if (rel.startsWith('/')) return rel; // 已是絕對
  return base + rel.replace(/^\.\//, '');
}

// 動態載入模組
async function loadModule(moduleName) {
  try {
    console.log(`🔄 載入模組: ${moduleName}`);

    switch (moduleName) {
      case 'handler': {
        const url = resolveGamePath('scenes/handler.js');
        console.log('📦 import', url);
        window.HandlerScene = (await import(url)).default;
        updateLoadProgress('handler');
        break;
      }
      case 'preload': {
        const url = resolveGamePath('scenes/preload.js');
        console.log('📦 import', url);
        window.PreloadScene = (await import(url)).default;
        updateLoadProgress('preload');
        break;
      }
      case 'title': {
        const url = resolveGamePath('scenes/title.js');
        console.log('📦 import', url);
        window.TitleScene = (await import(url)).default;
        updateLoadProgress('title');
        break;
      }
      case 'hub': {
        const url = resolveGamePath('scenes/hub.js');
        console.log('📦 import', url);
        window.HubScene = (await import(url)).default;
        updateLoadProgress('hub');
        break;
      }
      case 'main': {
        // 載入主遊戲邏輯
        const url = resolveGamePath('main-module.js');
        console.log('📦 import', url);
        const mainModule = await import(url);
        window.GameConfig = mainModule.gameConfig;
        window.initGame = mainModule.initGame;
        updateLoadProgress('main');
        break;
      }
      default:
        console.warn(`⚠️ 未知模組: ${moduleName}`);
    }

  } catch (error) {
    handleModuleError(moduleName, error);
  }
}

// 初始化遊戲
function initializeGame() {
  try {
    console.log('🎮 初始化 Phaser 遊戲');
    
    // 確保 Phaser 已載入
    if (typeof Phaser === 'undefined') {
      console.error('❌ Phaser 未載入');
      return;
    }
    
    // 確保所有場景類別已載入
    if (!window.HandlerScene || !window.PreloadScene || !window.TitleScene || !window.HubScene) {
      console.error('❌ 場景類別未完全載入');
      return;
    }
    
    // 創建遊戲配置
    const config = {
      type: Phaser.AUTO,
      scale: {
        mode: Phaser.Scale.RESIZE,
        parent: 'game',
        width: 960,
        height: 540,
        min: {
          width: 480,
          height: 270
        },
        max: {
          width: 1920,
          height: 1080
        },
        fullscreenTarget: 'game',
        expandParent: true,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      dom: {
        createContainer: true
      },
      scene: [
        window.HandlerScene,
        window.PreloadScene,
        window.TitleScene,
        window.HubScene
      ],
      callbacks: {
        postBoot: function (game) {
          console.log('🎉 Phaser 遊戲啟動成功');
          
          // 設置遊戲屬性
          game.screenBaseSize = {
            maxWidth: 1920,
            maxHeight: 1080,
            minWidth: 480,
            minHeight: 270,
            width: 960,
            height: 540
          };
          
          // 全域遊戲實例
          window.game = game;
          
          console.log('✅ shimozurdo 遊戲完全載入完成');
        }
      }
    };
    
    // 創建遊戲實例
    const game = new Phaser.Game(config);
    
  } catch (error) {
    console.error('❌ 遊戲初始化失敗:', error);
  }
}

// 開始載入所有模組
async function startModuleLoading() {
  console.log('🚀 開始載入 shimozurdo 遊戲模組');
  
  // 檢查 Phaser 是否已載入
  if (typeof Phaser === 'undefined') {
    console.log('⏳ 等待 Phaser 載入...');
    
    // 等待 Phaser 載入
    const checkPhaser = setInterval(() => {
      if (typeof Phaser !== 'undefined') {
        clearInterval(checkPhaser);
        console.log('✅ Phaser 載入完成，開始載入遊戲模組');
        loadAllModules();
      }
    }, 100);
    
    // 超時處理
    setTimeout(() => {
      if (typeof Phaser === 'undefined') {
        clearInterval(checkPhaser);
        console.error('❌ Phaser 載入超時');
      }
    }, 10000);
    
  } else {
    console.log('✅ Phaser 已載入，開始載入遊戲模組');
    loadAllModules();
  }
}

// 載入所有模組
async function loadAllModules() {
  const modules = ['handler', 'preload', 'title', 'hub', 'main'];
  
  // 並行載入所有模組
  const loadPromises = modules.map(module => loadModule(module));
  
  try {
    await Promise.allSettled(loadPromises);
  } catch (error) {
    console.error('❌ 模組載入過程中發生錯誤:', error);
  }
}

// 當 DOM 載入完成時開始
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startModuleLoading);
} else {
  startModuleLoading();
}

// 全域錯誤處理
window.addEventListener('error', (event) => {
  console.error('❌ 全域錯誤:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ 未處理的 Promise 拒絕:', event.reason);
});

console.log('🔧 模組載入器配置完成');
