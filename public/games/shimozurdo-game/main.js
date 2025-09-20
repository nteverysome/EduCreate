// shimozurdo 遊戲主入口檔案 - 標準配置版本
// 提供完整的遊戲配置，包含物理引擎和進階縮放選項

// 導入所有必要的遊戲場景類別
import Handler from './scenes/handler.js'   // 場景處理器，管理場景切換和響應式調整
import Preload from './scenes/preload.js'   // 預載場景，負責載入所有遊戲資源
import Title from './scenes/title.js'       // 標題場景，遊戲的主選單和開始畫面
import Hub from './scenes/hub.js'           // Hub 場景，提供遊戲的 UI 控制介面

// 螢幕尺寸常數定義 - 響應式配置，優化手機適配
const MAX_SIZE_WIDTH_SCREEN = 1920  // 最大螢幕寬度，支援到 Full HD 解析度
const MAX_SIZE_HEIGHT_SCREEN = 1080 // 最大螢幕高度，支援到 Full HD 解析度
const MIN_SIZE_WIDTH_SCREEN = 480   // 最小螢幕寬度，支援小螢幕
const MIN_SIZE_HEIGHT_SCREEN = 270  // 最小螢幕高度，支援小螢幕
const SIZE_WIDTH_SCREEN = 960       // 預設螢幕寬度，基於桌面常見尺寸
const SIZE_HEIGHT_SCREEN = 540      // 預設螢幕高度，基於桌面常見尺寸

// Phaser 遊戲引擎配置物件
const config = {
    // 渲染器類型，AUTO 會自動選擇最佳的渲染方式（WebGL 或 Canvas）
    type: Phaser.AUTO,
    // 縮放和響應式配置 - 優化手機適配
    scale: {
        // 使用 RESIZE 模式，支援動態尺寸調整
        mode: Phaser.Scale.RESIZE,
        // 指定遊戲掛載的 DOM 元素 ID
        parent: 'game',
        // 遊戲的初始寬度
        width: SIZE_WIDTH_SCREEN,
        // 遊戲的初始高度
        height: SIZE_HEIGHT_SCREEN,
        // 最小尺寸限制，防止遊戲縮得太小而無法操作
        min: {
            width: MIN_SIZE_WIDTH_SCREEN,   // 最小寬度限制
            height: MIN_SIZE_HEIGHT_SCREEN  // 最小高度限制
        },
        // 最大尺寸限制，防止遊戲放得太大而影響性能
        max: {
            width: MAX_SIZE_WIDTH_SCREEN,   // 最大寬度限制
            height: MAX_SIZE_HEIGHT_SCREEN  // 最大高度限制
        },
        // 全螢幕模式的目標元素，指定為 'game' 容器
        fullscreenTarget: 'game',
        // 允許遊戲擴展父容器的大小
        expandParent: true,
        // 自動居中對齊，在容器中水平和垂直居中
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    // DOM 元素支援配置，允許在遊戲中使用 HTML 元素
    dom: {
        createContainer: true  // 創建 DOM 容器，支援 HTML 元素與遊戲內容混合
    },
    // 場景載入順序，定義遊戲中各場景的初始化順序
    scene: [
        Handler,  // 首先載入場景處理器
        Preload,  // 然後載入預載場景
        Title,    // 接著載入標題場景
        Hub       // 最後載入 Hub 場景
    ],
    // 物理引擎配置，為遊戲提供物理模擬功能
    physics: {
        // 使用 Arcade 物理引擎作為預設物理系統
        default: 'arcade',
        // Arcade 物理引擎的具體配置
        arcade: {
            // 重力設定，y 軸重力為 0（無重力環境）
            gravity: { y: 0 },
            // 關閉物理調試模式，不顯示碰撞框等調試信息
            debug: false
        }
    }
}

// 創建 Phaser 遊戲實例，使用上述配置啟動遊戲引擎
const game = new Phaser.Game(config)

// 設定遊戲的基準螢幕尺寸，用於響應式縮放計算
game.screenBaseSize = {
    maxWidth: MAX_SIZE_WIDTH_SCREEN,    // 最大寬度參考值
    maxHeight: MAX_SIZE_HEIGHT_SCREEN,  // 最大高度參考值
    minWidth: MIN_SIZE_WIDTH_SCREEN,    // 最小寬度參考值
    minHeight: MIN_SIZE_HEIGHT_SCREEN,  // 最小高度參考值
    width: SIZE_WIDTH_SCREEN,           // 基準寬度，用於縮放比例計算
    height: SIZE_HEIGHT_SCREEN          // 基準高度，用於縮放比例計算
}

// 設定遊戲的螢幕方向偏好為橫向模式
game.orientation = "landscape"
// 關閉調試模式，在正式版本中不顯示調試信息
game.debugMode = false
