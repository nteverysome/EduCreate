# 🎮 切換遊戲中的活卡片（Live Cards）深度分析

## 📋 目錄
1. [核心概念](#核心概念)
2. [架構設計](#架構設計)
3. [數據流向](#數據流向)
4. [關鍵實現](#關鍵實現)
5. [性能優化](#性能優化)
6. [問題診斷](#問題診斷)

---

## 核心概念

### 什麼是活卡片？
在 GameSwitcher 中，**活卡片** 指的是：
- **實時更新的遊戲狀態顯示**（分數、進度、等級、時間）
- **動態的遊戲配置卡片**（遊戲選擇下拉選單中的卡片）
- **響應式的 UI 元素**（根據設備類型動態調整）

### 三層活卡片系統

```
┌─────────────────────────────────────┐
│  UI 層：遊戲狀態面板 (Live Display)  │  ← 實時顯示分數、進度
├─────────────────────────────────────┤
│  通信層：iframe 消息系統             │  ← 接收遊戲內部狀態
├─────────────────────────────────────┤
│  狀態層：gameStates 字典             │  ← 存儲所有遊戲狀態
└─────────────────────────────────────┘
```

---

## 架構設計

### 1️⃣ 狀態管理層

```typescript
// 核心狀態
const [gameStates, setGameStates] = useState<Record<string, GameState>>({});
const [currentGameId, setCurrentGameId] = useState<string>(defaultGame);
const [isLoading, setIsLoading] = useState<boolean>(false);
const [loadingProgress, setLoadingProgress] = useState<number>(0);
const [isMobile, setIsMobile] = useState<boolean>(false);

// GameState 結構
interface GameState {
  score: number;      // 遊戲分數
  level: string;      // GEPT 等級
  progress: number;   // 完成進度 (0-100%)
  timeSpent: number;  // 遊戲時間 (毫秒)
}
```

**特點：**
- ✅ 字典式存儲：支持多遊戲狀態同時保存
- ✅ 獨立更新：每個遊戲狀態獨立管理
- ✅ 持久化：切換遊戲時保留之前的狀態

---

## 數據流向

### 消息流程圖

```
iframe (遊戲內部)
    ↓
    │ postMessage({type: 'GAME_STATE_UPDATE', ...})
    ↓
handleIframeMessage (接收器)
    ↓
    │ 解析消息類型
    ├─ GAME_STATE_UPDATE → 更新 gameStates
    ├─ GAME_COMPLETE → 標記完成
    ├─ GAME_SCORE_UPDATE → 更新分數
    └─ GAME_STATE_CHANGE → 狀態變化
    ↓
setGameStates (狀態更新)
    ↓
UI 重新渲染 (遊戲狀態面板)
```

---

## 關鍵實現

### 1. iframe 消息監聽

```typescript
useEffect(() => {
  window.addEventListener('message', handleIframeMessage);
  return () => window.removeEventListener('message', handleIframeMessage);
}, [handleIframeMessage]);
```

### 2. 全局遊戲訪問對象

```typescript
window.EduCreateGameAccess = {
  getGame: () => iframeWindow.matchUpGame,
  getGameScene: () => gameScene,
  showAllAnswers: () => gameScene.showAllCorrectAnswers(),
  getCurrentPageInfo: () => ({...}),
  goToNextPage: () => gameScene.goToNextPage(),
  goToPreviousPage: () => gameScene.goToPreviousPage()
};
```

### 3. 遊戲狀態面板渲染

```typescript
{gameStates[currentGameId] && (
  <div className="game-status-panel">
    <div>分數: {gameStates[currentGameId].score}</div>
    <div>進度: {gameStates[currentGameId].progress}%</div>
    <div>時間: {gameStates[currentGameId].timeSpent}s</div>
  </div>
)}
```

---

## 性能優化

### 優化策略

| 策略 | 實現 | 效果 |
|------|------|------|
| 狀態隔離 | 字典式存儲 | 避免全局重渲染 |
| 條件渲染 | `gameStates[currentGameId] &&` | 只渲染必要元素 |
| 防抖更新 | useCallback 依賴 | 減少不必要更新 |
| 響應式設計 | isMobile 判斷 | 適配不同設備 |

---

## 問題診斷

### 常見問題

1. **狀態不更新**
   - 檢查 iframe 是否正確發送消息
   - 驗證 handleIframeMessage 是否被觸發

2. **卡片顯示延遲**
   - 檢查 iframe 載入時間
   - 優化消息發送頻率

3. **手機版顯示異常**
   - 檢查 isMobile 判斷邏輯
   - 驗證響應式 CSS

---

## 📊 完整數據流示例

```
用戶玩遊戲 → iframe 內部狀態改變
    ↓
遊戲發送: postMessage({
  type: 'GAME_STATE_UPDATE',
  score: 150,
  progress: 50,
  level: 'elementary'
})
    ↓
GameSwitcher 接收並更新:
setGameStates(prev => ({
  ...prev,
  'match-up-game': {
    score: 150,
    progress: 50,
    level: 'elementary',
    timeSpent: 30000
  }
}))
    ↓
UI 重新渲染遊戲狀態面板
    ↓
用戶看到實時更新的分數和進度
```

---

## 🔧 調試技巧

```javascript
// 在瀏覽器控制台查看當前狀態
window.EduCreateGameAccess.getCurrentPageInfo()

// 手動觸發顯示所有答案
window.EduCreateGameAccess.showAllAnswers()

// 導航到下一頁
window.EduCreateGameAccess.goToNextPage()
```

---

**最後更新：2025-12-03**

