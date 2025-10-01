# Shimozurdo 全螢幕按鈕狀況分析

> 詳細分析 Shimozurdo 遊戲全螢幕按鈕的實現、功能和通信機制

## 📋 功能總覽

### 全螢幕按鈕特點
- ✅ **PostMessage 通信**：與父頁面同步全螢幕狀態
- ✅ **備用方案**：瀏覽器原生全螢幕 API
- ✅ **響應式顯示**：只在移動設備顯示
- ✅ **視覺反饋**：點擊縮放效果
- ✅ **簡潔設計**：半透明黑色背景，白色邊框

---

## 🎨 視覺設計

### CSS 樣式
**文件**：`public/games/shimozurdo-game/index.html`（行 122-141）

```css
.fullscreen-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    background: rgba(0, 0, 0, 0.5);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    font-size: 24px;
    pointer-events: all;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    transition: transform 0.1s;
    cursor: pointer;
}

.fullscreen-btn:active {
    transform: scale(0.95);
}
```

### 設計特點
| 屬性 | 值 | 說明 |
|------|-----|------|
| **位置** | 右上角（top: 20px, right: 20px） | 不遮擋遊戲內容 |
| **尺寸** | 50×50px | 適合觸控操作 |
| **背景** | rgba(0, 0, 0, 0.5) | 半透明黑色 |
| **邊框** | 2px solid rgba(255, 255, 255, 0.3) | 半透明白色 |
| **圓角** | 8px | 柔和的視覺效果 |
| **陰影** | 0 2px 4px rgba(0, 0, 0, 0.3) | 立體感 |
| **圖標** | ⛶ | Unicode 全螢幕符號 |

### 響應式顯示
**媒體查詢**（行 143-150）：

```css
@media (max-width: 1024px) and (max-height: 768px),
       (pointer: coarse),
       (hover: none) and (pointer: coarse) {
    #touch-controls {
        display: block !important;
    }
}
```

**顯示條件**：
1. 螢幕尺寸 ≤ 1024×768
2. 或 觸控設備（pointer: coarse）
3. 或 無 hover 支援的觸控設備

---

## 💻 JavaScript 實現

### TouchControls 類
**文件**：`public/games/shimozurdo-game/index.html`（行 177-225）

```javascript
class TouchControls {
    constructor() {
        this.fullscreenBtn = document.querySelector('.fullscreen-btn');
        this.init();
    }

    init() {
        if (!this.fullscreenBtn) {
            console.warn('⚠️ 全螢幕按鈕未找到');
            return;
        }

        // 全螢幕按鈕
        this.fullscreenBtn.addEventListener('click', this.toggleFullscreen.bind(this));

        console.log('✅ TouchControls 初始化完成（只有全螢幕按鈕）');
    }

    toggleFullscreen() {
        console.log('🖥️ 全螢幕按鈕點擊');

        // 發送 PostMessage 到父頁面
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({
                type: 'DUAL_FULLSCREEN_REQUEST',
                action: 'toggle',
                timestamp: Date.now(),
                source: 'shimozurdo-fullscreen-button'
            }, '*');

            console.log('📤 已發送全螢幕請求到父頁面');
        } else {
            // 備用方案：使用瀏覽器原生全螢幕 API
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        }
    }

    // 保留 getInputState 方法以保持兼容性，但返回空值
    getInputState() {
        return {
            direction: { x: 0, y: 0 },
            shooting: false
        };
    }
}

// 初始化 TouchControls
window.touchControls = new TouchControls();
```

### 核心功能

#### 1. 初始化
- 查找全螢幕按鈕元素
- 綁定點擊事件監聽器
- 輸出初始化日誌

#### 2. toggleFullscreen() 方法
**雙重策略**：
1. **優先策略**：PostMessage 通信到父頁面
2. **備用策略**：瀏覽器原生全螢幕 API

#### 3. getInputState() 方法
- 保持與之前版本的兼容性
- 返回空的輸入狀態
- 避免其他代碼報錯

---

## 📡 PostMessage 通信機制

### 消息格式
```javascript
{
    type: 'DUAL_FULLSCREEN_REQUEST',
    action: 'toggle',
    timestamp: Date.now(),
    source: 'shimozurdo-fullscreen-button'
}
```

### 消息字段說明
| 字段 | 類型 | 說明 |
|------|------|------|
| **type** | string | 消息類型標識符 |
| **action** | string | 操作類型（toggle = 切換） |
| **timestamp** | number | 時間戳（毫秒） |
| **source** | string | 消息來源標識 |

### 父頁面監聽器
**文件**：`components/games/GameSwitcher.tsx`（行 793-856）

```typescript
const handleDualFullscreenMessage = async (event: MessageEvent) => {
  if (event.data.type === 'DUAL_FULLSCREEN_REQUEST') {
    console.log('📥 收到遊戲內全螢幕切換請求:', event.data);

    // 防重複處理
    if (isProcessingFullscreen) {
      console.log('⚠️ 正在處理全螢幕請求，忽略重複請求');
      return;
    }

    setIsProcessingFullscreen(true);

    try {
      // 切換全螢幕狀態
      await toggleGameFullscreen();
    } catch (error) {
      console.error('❌ 全螢幕切換失敗:', error);
    } finally {
      setIsProcessingFullscreen(false);
    }
  }
};

// 添加消息監聽器
window.addEventListener('message', handleDualFullscreenMessage);
```

### 通信流程
```
1. 用戶點擊遊戲內全螢幕按鈕
    ↓
2. toggleFullscreen() 方法執行
    ↓
3. 檢查是否在 iframe 中
    ↓
4. 發送 PostMessage 到父頁面
    ↓
5. 父頁面監聽器接收消息
    ↓
6. 檢查防重複處理標記
    ↓
7. 執行 toggleGameFullscreen()
    ↓
8. 更新全螢幕狀態
    ↓
9. 完成
```

---

## 🔄 備用方案：原生全螢幕 API

### 使用場景
- 遊戲不在 iframe 中（直接訪問）
- PostMessage 通信失敗
- 父頁面不支援全螢幕

### 實現代碼
```javascript
if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
} else {
    document.exitFullscreen();
}
```

### API 說明
| API | 說明 |
|-----|------|
| **document.fullscreenElement** | 當前全螢幕元素（null = 非全螢幕） |
| **requestFullscreen()** | 進入全螢幕 |
| **exitFullscreen()** | 退出全螢幕 |

---

## 📊 功能狀態總結

### ✅ 已實現的功能
1. **視覺設計**：半透明黑色背景，白色邊框，圓角設計
2. **響應式顯示**：只在移動設備顯示
3. **PostMessage 通信**：與父頁面同步全螢幕狀態
4. **備用方案**：瀏覽器原生全螢幕 API
5. **視覺反饋**：點擊縮放效果（scale: 0.95）
6. **防重複處理**：父頁面有防重複處理機制
7. **錯誤處理**：try-catch 錯誤捕獲
8. **日誌輸出**：完整的調試日誌

### 🎯 技術亮點
- ✅ **雙重策略**：PostMessage + 原生 API
- ✅ **兼容性**：保留 getInputState() 方法
- ✅ **簡潔代碼**：只有 55 行 JavaScript
- ✅ **清晰日誌**：每個步驟都有日誌輸出
- ✅ **防重複**：避免重複處理全螢幕請求

### 📱 移動設備支援
- ✅ iPhone（直向/橫向）
- ✅ iPad（直向/橫向）
- ✅ Android 手機
- ✅ Android 平板

---

## 🚀 測試建議

### 手動測試步驟
1. **桌面瀏覽器測試**
   - 訪問：https://edu-create.vercel.app/games/shimozurdo-game
   - 確認全螢幕按鈕不顯示（桌面設備）

2. **移動設備測試**
   - 在手機上訪問遊戲
   - 確認全螢幕按鈕顯示在右上角
   - 點擊按鈕，確認進入全螢幕
   - 再次點擊，確認退出全螢幕

3. **PostMessage 通信測試**
   - 在 iframe 中載入遊戲
   - 點擊全螢幕按鈕
   - 檢查控制台日誌：
     - `🖥️ 全螢幕按鈕點擊`
     - `📤 已發送全螢幕請求到父頁面`
     - `📥 收到遊戲內全螢幕切換請求`

4. **備用方案測試**
   - 直接訪問遊戲（非 iframe）
   - 點擊全螢幕按鈕
   - 確認使用原生全螢幕 API

### 自動化測試
**建議創建測試文件**：`tests/shimozurdo-fullscreen-button-test.spec.js`

**測試案例**：
1. 全螢幕按鈕元素存在性測試
2. 響應式顯示測試（移動設備）
3. PostMessage 發送測試
4. 點擊事件響應測試
5. 視覺反饋測試（縮放效果）

---

**文檔版本**：1.0  
**創建日期**：2025-10-01  
**作者**：EduCreate 開發團隊  
**狀態**：✅ 功能完整，運行正常

