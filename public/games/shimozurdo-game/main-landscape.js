// shimozurdo 遊戲主入口 - 橫向模式配置版本
// 專為橫向螢幕顯示優化的遊戲配置，適用於桌面和平板橫向使用

// 導入遊戲場景類別
import Handler from './scenes/handler.js'    // 場景處理器，負責場景管理和響應式調整
import Title from './scenes/title.js'        // 標題場景，遊戲的主選單畫面
import Preload from './scenes/preload.js'    // 預載場景，負責載入遊戲資源
import Hub from './scenes/hub.js'            // Hub 場景，提供 UI 控制介面

// 螢幕尺寸常數定義 - 16:9 寬高比橫向配置（為測試而修改）
const MAX_SIZE_WIDTH_SCREEN = 1920   // 最大螢幕寬度，支援 Full HD 解析度
const MAX_SIZE_HEIGHT_SCREEN = 1080  // 最大螢幕高度，支援 Full HD 解析度
const MIN_SIZE_WIDTH_SCREEN = 480    // 最小螢幕寬度，為橫向模式調整
const MIN_SIZE_HEIGHT_SCREEN = 270   // 最小螢幕高度，為橫向模式調整
const SIZE_WIDTH_SCREEN = 960        // 預設螢幕寬度，為橫向模式調整
const SIZE_HEIGHT_SCREEN = 540       // 預設螢幕高度，為橫向模式調整

// Phaser 遊戲配置物件
const config = {
    // 使用自動檢測的渲染器（WebGL 或 Canvas）
    type: Phaser.AUTO,
    // 縮放和響應式設定
    scale: {
        // 使用 RESIZE 模式，允許遊戲動態調整大小
        mode: Phaser.Scale.RESIZE,
        // 指定遊戲容器的 DOM 元素 ID
        parent: 'game',
        // 設定遊戲的預設寬度
        width: SIZE_WIDTH_SCREEN,
        // 設定遊戲的預設高度
        height: SIZE_HEIGHT_SCREEN,
        // 最小尺寸限制，防止遊戲過小而無法使用
        min: {
            width: MIN_SIZE_WIDTH_SCREEN,   // 最小寬度限制
            height: MIN_SIZE_HEIGHT_SCREEN  // 最小高度限制
        },
        // 最大尺寸限制，防止遊戲過大而影響性能
        max: {
            width: MAX_SIZE_WIDTH_SCREEN,   // 最大寬度限制
            height: MAX_SIZE_HEIGHT_SCREEN  // 最大高度限制
        }
    },
    // DOM 元素支援設定，允許在遊戲中使用 HTML 元素
    dom: {
        createContainer: true  // 創建 DOM 容器，支援 HTML 元素疊加
    },
    // 場景載入順序定義，決定場景的初始化順序
    scene: [Handler, Hub, Preload, Title]
}

// 創建 Phaser 遊戲實例，啟動遊戲引擎
const game = new Phaser.Game(config)

// 全域遊戲屬性設定
game.debugMode = true    // 啟用調試模式，顯示額外的調試信息
game.embedded = false    // 設定遊戲不是嵌入模式（非 iframe/object 嵌入）

// 遊戲基準螢幕尺寸配置，用於響應式計算
game.screenBaseSize = {
    maxWidth: MAX_SIZE_WIDTH_SCREEN,    // 最大寬度參考值
    maxHeight: MAX_SIZE_HEIGHT_SCREEN,  // 最大高度參考值
    minWidth: MIN_SIZE_WIDTH_SCREEN,    // 最小寬度參考值
    minHeight: MIN_SIZE_HEIGHT_SCREEN,  // 最小高度參考值
    width: SIZE_WIDTH_SCREEN,           // 基準寬度，用於縮放計算
    height: SIZE_HEIGHT_SCREEN          // 基準高度，用於縮放計算
}

// 設定遊戲的螢幕方向為橫向模式（為測試而修改）
game.orientation = "landscape"