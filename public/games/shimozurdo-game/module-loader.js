// ES6 動態模組載入器 - shimozurdo 遊戲的模組依賴管理系統
// 解決複雜的模組依賴問題，確保所有場景和工具模組按正確順序載入
// 提供錯誤處理、重試機制和載入進度追蹤功能

// 記錄模組載入器啟動
console.log('🔧 模組載入器啟動');

// 模組載入狀態追蹤物件 - 記錄每個模組的載入狀態
const moduleLoadStatus = {
  handler: false,  // Handler 場景載入狀態
  preload: false,  // Preload 場景載入狀態
  title: false,    // Title 場景載入狀態
  hub: false,      // Hub 場景載入狀態
  main: false      // 主模組載入狀態
};

// 載入進度計數器
let loadedModules = 0;        // 已載入的模組數量
const totalModules = 5;       // 總模組數量

/**
 * 更新載入進度函數 - 當單個模組載入完成時調用
 * @param {string} moduleName - 已載入完成的模組名稱
 */
function updateLoadProgress(moduleName) {
  // 標記指定模組為已載入狀態
  moduleLoadStatus[moduleName] = true;
  // 增加已載入模組計數
  loadedModules++;
  // 記錄載入進度
  console.log(`✅ 模組載入完成: ${moduleName} (${loadedModules}/${totalModules})`);

  // 檢查是否所有模組都已載入完成
  if (loadedModules === totalModules) {
    // 所有模組載入完成，開始初始化遊戲
    console.log('🎉 所有模組載入完成，啟動遊戲');
    initializeGame();
  }
}

/**
 * 模組載入錯誤處理函數 - 處理模組載入失敗的情況
 * @param {string} moduleName - 載入失敗的模組名稱
 * @param {Error} error - 錯誤物件
 */
function handleModuleError(moduleName, error) {
  // 記錄模組載入失敗的詳細錯誤信息
  console.error(`❌ 模組載入失敗: ${moduleName}`, error);

  // 延遲 1 秒後嘗試重新載入失敗的模組
  setTimeout(() => {
    // 記錄重試載入操作
    console.log(`🔄 重試載入模組: ${moduleName}`);
    // 重新調用載入函數
    loadModule(moduleName);
  }, 1000);
}

/**
 * 靜態資源路徑解析函數 - 將相對路徑轉換為絕對路徑
 * 避免在 URL 重寫環境下相對路徑解析錯誤的問題
 * @param {string} rel - 相對路徑字串
 * @returns {string} - 解析後的絕對路徑
 */
function resolveGamePath(rel) {
  // 設定遊戲資源的基礎路徑
  const base = '/games/shimozurdo-game/';
  // 如果已經是絕對路徑，直接返回
  if (rel.startsWith('/')) return rel;
  // 將相對路徑轉換為絕對路徑，移除開頭的 './'
  return base + rel.replace(/^\.\//, '');
}

/**
 * 動態模組載入函數 - 根據模組名稱動態載入對應的 ES6 模組
 * @param {string} moduleName - 要載入的模組名稱
 */
async function loadModule(moduleName) {
  try {
    // 記錄開始載入的模組名稱
    console.log(`🔄 載入模組: ${moduleName}`);

    // 根據模組名稱執行對應的載入邏輯
    switch (moduleName) {
      case 'handler': {
        // 解析 Handler 場景的檔案路徑
        const url = resolveGamePath('scenes/handler.js');
        // 記錄即將載入的模組 URL
        console.log('📦 import', url);
        // 動態載入 Handler 場景類別並存儲到全域變數
        window.HandlerScene = (await import(url)).default;
        // 更新載入進度
        updateLoadProgress('handler');
        break;
      }
      case 'preload': {
        // 解析 Preload 場景的檔案路徑
        const url = resolveGamePath('scenes/preload.js');
        // 記錄即將載入的模組 URL
        console.log('📦 import', url);
        // 動態載入 Preload 場景類別並存儲到全域變數
        window.PreloadScene = (await import(url)).default;
        // 更新載入進度
        updateLoadProgress('preload');
        break;
      }
      case 'title': {
        // 解析 Title 場景的檔案路徑
        const url = resolveGamePath('scenes/title.js');
        // 記錄即將載入的模組 URL
        console.log('📦 import', url);
        // 動態載入 Title 場景類別並存儲到全域變數
        window.TitleScene = (await import(url)).default;
        // 更新載入進度
        updateLoadProgress('title');
        break;
      }
      case 'hub': {
        // 解析 Hub 場景的檔案路徑
        const url = resolveGamePath('scenes/hub.js');
        // 記錄即將載入的模組 URL
        console.log('📦 import', url);
        // 動態載入 Hub 場景類別並存儲到全域變數
        window.HubScene = (await import(url)).default;
        // 更新載入進度
        updateLoadProgress('hub');
        break;
      }
      case 'main': {
        // 載入主遊戲邏輯模組
        // 解析主模組的檔案路徑
        const url = resolveGamePath('main-module.js');
        // 記錄即將載入的模組 URL
        console.log('📦 import', url);
        // 動態載入主模組
        const mainModule = await import(url);
        // 將遊戲配置存儲到全域變數
        window.GameConfig = mainModule.gameConfig;
        // 將遊戲初始化函數存儲到全域變數
        window.initGame = mainModule.initGame;
        // 更新載入進度
        updateLoadProgress('main');
        break;
      }
      default:
        // 處理未知的模組名稱
        console.warn(`⚠️ 未知模組: ${moduleName}`);
    }

  } catch (error) {
    // 載入過程中發生錯誤時，調用錯誤處理函數
    handleModuleError(moduleName, error);
  }
}

/**
 * 遊戲初始化函數 - 在所有模組載入完成後創建 Phaser 遊戲實例
 * 負責驗證依賴、創建遊戲配置和啟動遊戲引擎
 */
function initializeGame() {
  try {
    // 記錄遊戲初始化開始
    console.log('🎮 初始化 Phaser 遊戲');

    // 驗證 Phaser 引擎是否已正確載入
    if (typeof Phaser === 'undefined') {
      console.error('❌ Phaser 未載入');
      return;
    }

    // 驗證所有必要的場景類別是否已載入到全域變數
    if (!window.HandlerScene || !window.PreloadScene || !window.TitleScene || !window.HubScene) {
      console.error('❌ 場景類別未完全載入');
      return;
    }

    // 創建完整的 Phaser 遊戲配置物件 - 使用手機優先配置
    const config = {
      // 渲染器類型，自動選擇最佳渲染方式
      type: Phaser.AUTO,
      // 縮放和響應式配置 - 手機優先設計
      scale: {
        // 使用 FIT 模式確保遊戲完整顯示在螢幕內
        mode: Phaser.Scale.FIT,
        // 指定遊戲掛載的 DOM 容器
        parent: 'game',
        // 遊戲的預設寬度 - 手機優先 (iPhone 標準尺寸)
        width: 375,
        // 遊戲的預設高度 - 手機優先 (iPhone 標準尺寸)
        height: 667,
        // 最小尺寸限制 - 支援小手機螢幕
        min: {
          width: 320,   // 最小寬度 (iPhone SE)
          height: 568   // 最小高度 (iPhone SE)
        },
        // 最大尺寸限制
        max: {
          width: 1920,  // 最大寬度
          height: 1080  // 最大高度
        },
        // 全螢幕模式目標元素
        fullscreenTarget: 'game',
        // 允許擴展父容器
        expandParent: true,
        // 自動居中對齊
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      // DOM 元素支援配置
      dom: {
        // 創建 DOM 容器支援
        createContainer: true
      },
      // 場景載入順序，使用動態載入的場景類別
      scene: [
        window.HandlerScene,  // Handler 場景 - 場景管理器
        window.PreloadScene,  // Preload 場景 - 資源載入器
        window.TitleScene,    // Title 場景 - 標題畫面
        window.HubScene       // Hub 場景 - UI 控制介面
      ],
      // 遊戲生命週期回調函數
      callbacks: {
        // postBoot 回調 - 在遊戲引擎完全啟動後執行
        postBoot: function (game) {
          // 記錄 Phaser 引擎啟動成功
          console.log('🎉 Phaser 遊戲啟動成功');

          // 設置遊戲實例的基準螢幕尺寸屬性 - 手機優先配置
          game.screenBaseSize = {
            maxWidth: 1920,   // 最大寬度參考值
            maxHeight: 1080,  // 最大高度參考值
            minWidth: 320,    // 最小寬度參考值 (iPhone SE)
            minHeight: 568,   // 最小高度參考值 (iPhone SE)
            width: 375,       // 基準寬度 (iPhone 標準尺寸)
            height: 667       // 基準高度 (iPhone 標準尺寸)
          };

          // 將遊戲實例設為全域變數，供其他模組存取
          window.game = game;

          // 記錄遊戲完全載入完成
          console.log('✅ shimozurdo 遊戲完全載入完成');
        }
      }
    };

    // 使用配置創建 Phaser 遊戲實例並啟動遊戲
    new Phaser.Game(config);

  } catch (error) {
    // 捕獲並記錄遊戲初始化過程中的任何錯誤
    console.error('❌ 遊戲初始化失敗:', error);
  }
}

/**
 * 模組載入啟動函數 - 開始整個模組載入流程
 * 檢查 Phaser 引擎狀態並啟動模組載入程序
 */
async function startModuleLoading() {
  // 記錄模組載入流程開始
  console.log('🚀 開始載入 shimozurdo 遊戲模組');

  // 檢查 Phaser 引擎是否已經載入
  if (typeof Phaser === 'undefined') {
    // Phaser 尚未載入，需要等待
    console.log('⏳ 等待 Phaser 載入...');

    // 設定定時器定期檢查 Phaser 載入狀態
    const checkPhaser = setInterval(() => {
      // 檢查 Phaser 是否已載入
      if (typeof Phaser !== 'undefined') {
        // Phaser 已載入，清除定時器
        clearInterval(checkPhaser);
        // 記錄 Phaser 載入完成
        console.log('✅ Phaser 載入完成，開始載入遊戲模組');
        // 開始載入所有遊戲模組
        loadAllModules();
      }
    }, 100); // 每 100ms 檢查一次

    // 設定超時處理，防止無限等待
    setTimeout(() => {
      // 10 秒後如果 Phaser 仍未載入，則報錯
      if (typeof Phaser === 'undefined') {
        // 清除檢查定時器
        clearInterval(checkPhaser);
        // 記錄載入超時錯誤
        console.error('❌ Phaser 載入超時');
      }
    }, 10000); // 10 秒超時

  } else {
    // Phaser 已經載入，直接開始載入遊戲模組
    console.log('✅ Phaser 已載入，開始載入遊戲模組');
    loadAllModules();
  }
}

/**
 * 載入所有模組函數 - 並行載入所有必要的遊戲模組
 * 使用 Promise.allSettled 確保即使部分模組載入失敗也能繼續
 */
async function loadAllModules() {
  // 定義需要載入的模組列表
  const modules = ['handler', 'preload', 'title', 'hub', 'main'];

  // 為每個模組創建載入 Promise，實現並行載入
  const loadPromises = modules.map(module => loadModule(module));

  try {
    // 使用 allSettled 等待所有模組載入完成（無論成功或失敗）
    await Promise.allSettled(loadPromises);
  } catch (error) {
    // 記錄模組載入過程中的錯誤
    console.error('❌ 模組載入過程中發生錯誤:', error);
  }
}

// DOM 載入狀態檢查和模組載入啟動
// 檢查 DOM 是否已經載入完成
if (document.readyState === 'loading') {
  // DOM 仍在載入中，等待 DOMContentLoaded 事件
  document.addEventListener('DOMContentLoaded', startModuleLoading);
} else {
  // DOM 已載入完成，立即開始模組載入
  startModuleLoading();
}

// 全域錯誤處理設定 - 捕獲所有未處理的錯誤
// 監聽一般的 JavaScript 錯誤事件
window.addEventListener('error', (event) => {
  // 記錄全域錯誤，包含錯誤物件的詳細信息
  console.error('❌ 全域錯誤:', event.error);
});

// 監聽未處理的 Promise 拒絕事件
window.addEventListener('unhandledrejection', (event) => {
  // 記錄未處理的 Promise 拒絕，包含拒絕原因
  console.error('❌ 未處理的 Promise 拒絕:', event.reason);
});

// 記錄模組載入器配置完成
console.log('🔧 模組載入器配置完成');
