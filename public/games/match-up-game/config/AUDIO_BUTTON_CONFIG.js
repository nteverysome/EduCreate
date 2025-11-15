/**
 * 🔊 聲音按鈕配置文件
 * 
 * 用途：集中管理聲音按鈕的所有可調整參數
 * 修改此文件即可調整按鈕的大小、位置、顏色等
 * 
 * 版本：v220.0
 */

const AUDIO_BUTTON_CONFIG = {
    // ========== 📏 大小配置 ==========
    size: {
        // 按鈕大小計算方式 - 支持 3、5、7、10、20 五種卡片數量
        // 🔥 [v224.0] 合理調整按鈕大小，確保不超出卡片邊界

        // 3 個卡片時的大小百分比（cardHeight ≈ 65-80px）
        percentageFor3Items: 0.10,       // 10%
        minSizeFor3Items: 5,             // 最小 5px
        maxSizeFor3Items: 12,            // 最大 12px（cardHeight × 0.18）

        // 5 個卡片時的大小百分比（cardHeight ≈ 50-65px）
        percentageFor5Items: 0.10,       // 10%
        minSizeFor5Items: 5,             // 最小 5px
        maxSizeFor5Items: 9,             // 最大 9px（cardHeight × 0.18）

        // 7 個卡片時的大小百分比（cardHeight ≈ 35-45px）
        percentageFor7Items: 0.12,       // 12%
        minSizeFor7Items: 4,             // 最小 4px
        maxSizeFor7Items: 6,             // 最大 6px（cardHeight × 0.18）

        // 10 個卡片時的大小百分比（cardHeight ≈ 28-35px）
        percentageFor10Items: 0.14,      // 14%
        minSizeFor10Items: 4,            // 最小 4px
        maxSizeFor10Items: 5,            // 最大 5px（cardHeight × 0.18）

        // 20 個卡片時的大小百分比（cardHeight ≈ 14-20px）
        percentageFor20Items: 0.16,      // 16%
        minSizeFor20Items: 3,            // 最小 3px
        maxSizeFor20Items: 3,            // 最大 3px（cardHeight × 0.18）

        // 邊界檢查：按鈕最多佔按鈕區域的百分比
        maxPercentageOfButtonArea: 0.9,  // 90%（cardHeight × 0.18）
    },

    // ========== 📍 位置配置 ==========
    position: {
        // 按鈕區域高度（相對於卡片高度）
        buttonAreaHeightRatio: 0.2,      // 20%
        
        // 按鈕在按鈕區域內的垂直位置
        // 0.5 = 居中，0 = 頂部，1 = 底部
        verticalAlignment: 0.5,          // 居中
        
        // 按鈕水平偏移（像素）
        offsetX: 0,                      // 0 = 居中
        
        // 按鈕垂直偏移（像素）
        offsetY: 0,                      // 0 = 無偏移
    },

    // ========== 🎨 顏色配置 ==========
    colors: {
        // 按鈕背景色（十六進制）
        background: 0x4CAF50,            // 綠色
        
        // 按鈕邊框色
        border: 0x2E7D32,                // 深綠色
        
        // Hover 時的背景色
        hover: 0x45a049,                 // 深綠色
        
        // 播放中的背景色
        playing: 0x1B5E20,               // 更深的綠色
    },

    // ========== 🎯 邊框配置 ==========
    border: {
        // 邊框寬度（像素）
        width: 2,                        // 2px
        
        // 邊框樣式（Phaser 支持）
        style: 'solid',                  // 實線
    },

    // ========== 🔊 圖標配置 ==========
    icon: {
        // 圖標符號
        emoji: '🔊',                     // 喇叭符號
        
        // 圖標大小（相對於按鈕大小）
        sizeRatio: 0.6,                  // 60% 的按鈕大小
        
        // 圖標字體
        fontFamily: 'Arial',
    },

    // ========== ⚙️ 交互配置 ==========
    interaction: {
        // 是否顯示手指光標
        useHandCursor: true,
        
        // 點擊時是否阻止事件冒泡
        stopPropagation: true,
        
        // Hover 效果是否啟用
        hoverEffectEnabled: true,
    },

    // ========== 🔧 調試配置 ==========
    debug: {
        // 是否打印調試日誌
        logEnabled: true,
        
        // 是否顯示按鈕邊界框（用於調試）
        showBounds: false,
    },
};

// ========== 📋 快速調整預設 ==========
const AUDIO_BUTTON_PRESETS = {
    // 超小按鈕（當前預設）
    tiny: {
        size: {
            percentageFor3Items: 0.10,    // 10%
            percentageFor5Items: 0.10,    // 10%
            percentageFor7Items: 0.12,    // 12%
            percentageFor10Items: 0.14,   // 14%
            percentageFor20Items: 0.16,   // 16%
            minSizeFor3Items: 5,
            minSizeFor5Items: 5,
            minSizeFor7Items: 4,
            minSizeFor10Items: 4,
            minSizeFor20Items: 3,
            maxSizeFor3Items: 12,
            maxSizeFor5Items: 9,
            maxSizeFor7Items: 6,
            maxSizeFor10Items: 5,
            maxSizeFor20Items: 3,
        }
    },

    // 小按鈕
    small: {
        size: {
            percentageFor3Items: 0.12,    // 12%
            percentageFor5Items: 0.12,    // 12%
            percentageFor7Items: 0.14,    // 14%
            percentageFor10Items: 0.16,   // 16%
            percentageFor20Items: 0.18,   // 18%
            minSizeFor3Items: 6,
            minSizeFor5Items: 6,
            minSizeFor7Items: 5,
            minSizeFor10Items: 5,
            minSizeFor20Items: 4,
            maxSizeFor3Items: 12,
            maxSizeFor5Items: 9,
            maxSizeFor7Items: 6,
            maxSizeFor10Items: 5,
            maxSizeFor20Items: 3,
        }
    },

    // 中等按鈕
    medium: {
        size: {
            percentageFor3Items: 0.14,    // 14%
            percentageFor5Items: 0.14,    // 14%
            percentageFor7Items: 0.16,    // 16%
            percentageFor10Items: 0.18,   // 18%
            percentageFor20Items: 0.18,   // 18%
            minSizeFor3Items: 7,
            minSizeFor5Items: 7,
            minSizeFor7Items: 6,
            minSizeFor10Items: 6,
            minSizeFor20Items: 5,
            maxSizeFor3Items: 12,
            maxSizeFor5Items: 9,
            maxSizeFor7Items: 6,
            maxSizeFor10Items: 5,
            maxSizeFor20Items: 3,
        }
    },

    // 大按鈕
    large: {
        size: {
            percentageFor3Items: 0.16,    // 16%
            percentageFor5Items: 0.16,    // 16%
            percentageFor7Items: 0.18,    // 18%
            percentageFor10Items: 0.18,   // 18%
            percentageFor20Items: 0.18,   // 18%
            minSizeFor3Items: 8,
            minSizeFor5Items: 8,
            minSizeFor7Items: 7,
            minSizeFor10Items: 7,
            minSizeFor20Items: 6,
            maxSizeFor3Items: 12,
            maxSizeFor5Items: 9,
            maxSizeFor7Items: 6,
            maxSizeFor10Items: 5,
            maxSizeFor20Items: 3,
        }
    },

    // 超大按鈕
    xlarge: {
        size: {
            percentageFor3Items: 0.18,    // 18%
            percentageFor5Items: 0.18,    // 18%
            percentageFor7Items: 0.18,    // 18%
            percentageFor10Items: 0.18,   // 18%
            percentageFor20Items: 0.18,   // 18%
            minSizeFor3Items: 10,
            minSizeFor5Items: 10,
            minSizeFor7Items: 8,
            minSizeFor10Items: 8,
            minSizeFor20Items: 7,
            maxSizeFor3Items: 12,
            maxSizeFor5Items: 9,
            maxSizeFor7Items: 6,
            maxSizeFor10Items: 5,
            maxSizeFor20Items: 3,
        }
    },
};

// ========== 🎨 顏色預設 ==========
const AUDIO_BUTTON_COLOR_PRESETS = {
    // 綠色（默認）
    green: {
        background: 0x4CAF50,
        border: 0x2E7D32,
        hover: 0x45a049,
        playing: 0x1B5E20,
    },

    // 藍色
    blue: {
        background: 0x2196F3,
        border: 0x1565C0,
        hover: 0x1976D2,
        playing: 0x0D47A1,
    },

    // 紅色
    red: {
        background: 0xF44336,
        border: 0xC62828,
        hover: 0xE53935,
        playing: 0xB71C1C,
    },

    // 橙色
    orange: {
        background: 0xFF9800,
        border: 0xE65100,
        hover: 0xFB8C00,
        playing: 0xBF360C,
    },

    // 紫色
    purple: {
        background: 0x9C27B0,
        border: 0x6A1B9A,
        hover: 0xAB47BC,
        playing: 0x4A148C,
    },
};

// 導出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AUDIO_BUTTON_CONFIG,
        AUDIO_BUTTON_PRESETS,
        AUDIO_BUTTON_COLOR_PRESETS,
    };
}

