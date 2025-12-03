# 🎯 活卡片實現細節深度分析

## 1. 遊戲配置卡片系統

### 基礎配置結構

```typescript
interface GameConfig {
  id: string;                    // 遊戲唯一ID
  name: string;                  // 遊戲名稱
  displayName: string;           // 顯示名稱
  description: string;           // 描述
  url: string;                   // 遊戲URL
  type: 'main' | 'iframe' | 'vite' | 'component';
  memoryType: string;            // 記憶類型
  geptLevels: string[];          // 支持的GEPT等級
  status: 'completed' | 'development' | 'planned';
  icon: string;                  // 表情符號圖標
  estimatedLoadTime: number;     // 預估載入時間(ms)
  hidden?: boolean;              // 是否隱藏
}
```

### 配置生成流程

```
BASE_GAMES_CONFIG (靜態配置)
    ↓
getGamesConfig() (動態生成)
    ├─ 添加完整 URL
    ├─ 注入 activityId
    ├─ 添加自定義詞彙參數
    ├─ 添加遊戲選項
    └─ 添加視覺風格
    ↓
gamesConfig (完整配置)
    ↓
availableGames (已完成且未隱藏)
developmentGames (開發中)
```

---

## 2. 活卡片的三種形態

### 形態 1️⃣：遊戲選擇卡片

**位置：** 下拉選單中
**內容：**
- 遊戲圖標 (emoji)
- 遊戲名稱
- 記憶類型
- 載入時間
- 當前選中指示

**響應式設計：**
```
桌面版: 固定下拉選單 (寬度 320px)
手機版: 底部彈出選單 (全寬)
```

### 形態 2️⃣：遊戲狀態卡片

**位置：** iframe 下方
**內容：**
- 分數 (score)
- 等級 (level)
- 進度 (progress %)
- 遊戲時間 (timeSpent)

**更新機制：**
```
實時監聽 iframe 消息
    ↓
解析 GAME_STATE_UPDATE
    ↓
更新 gameStates[gameId]
    ↓
觸發 React 重新渲染
    ↓
UI 顯示最新狀態
```

### 形態 3️⃣：GEPT 等級卡片

**位置：** 頂部選擇器
**內容：**
- 初級 (elementary)
- 中級 (intermediate)
- 高級 (advanced)

**特點：**
- 只在桌面版顯示
- 單選按鈕組
- 影響遊戲詞彙難度

---

## 3. 消息系統詳解

### 消息類型

```typescript
// 1. 遊戲狀態更新
{
  type: 'GAME_STATE_UPDATE',
  score: number,
  level: string,
  progress: number,
  timeSpent: number
}

// 2. 遊戲完成
{
  type: 'GAME_COMPLETE',
  score: number,
  health: number
}

// 3. 分數更新
{
  type: 'GAME_SCORE_UPDATE',
  score: number,
  health: number
}

// 4. 狀態變化
{
  type: 'GAME_STATE_CHANGE',
  state: any
}
```

### 消息處理流程

```typescript
const handleIframeMessage = useCallback((event: MessageEvent) => {
  const data = JSON.parse(event.data);
  
  switch(data.type) {
    case 'GAME_STATE_UPDATE':
      setGameStates(prev => ({
        ...prev,
        [currentGameId]: {
          score: data.score,
          level: currentGeptLevel,
          progress: data.progress,
          timeSpent: data.timeSpent
        }
      }));
      onGameStateUpdate?.(currentGameId, newState);
      break;
      
    case 'GAME_COMPLETE':
      // 標記遊戲完成
      setGameStates(prev => ({
        ...prev,
        [currentGameId]: { ...prev[currentGameId], progress: 100 }
      }));
      break;
  }
}, [currentGameId, currentGeptLevel, onGameStateUpdate]);
```

---

## 4. 全局遊戲訪問對象

### 暴露的 API

```typescript
window.EduCreateGameAccess = {
  // 獲取遊戲對象
  getGame: () => iframeWindow.matchUpGame,
  
  // 獲取遊戲場景
  getGameScene: () => gameScene,
  
  // 顯示所有答案
  showAllAnswers: () => {
    gameScene.showAllCorrectAnswers();
  },
  
  // 獲取當前頁信息
  getCurrentPageInfo: () => ({
    currentPage: gameScene.currentPage + 1,
    totalPages: gameScene.totalPages,
    leftCardsPairIds: gameScene.leftCards.map(c => c.getData('pairId')),
    rightEmptyBoxesPairIds: gameScene.rightEmptyBoxes.map(b => b.getData('pairId')),
    isShowingAllAnswers: gameScene.isShowingAllAnswers
  }),
  
  // 導航
  goToNextPage: () => gameScene.goToNextPage(),
  goToPreviousPage: () => gameScene.goToPreviousPage()
};
```

---

## 5. 性能監控指標

| 指標 | 目標 | 監控方式 |
|------|------|---------|
| 首次載入 | < 2s | loadingProgress |
| 消息延遲 | < 100ms | postMessage 時間戳 |
| 狀態更新 | < 50ms | React DevTools |
| 內存占用 | < 50MB | Chrome DevTools |

---

## 6. 常見問題排查

### 問題 1：狀態不同步
```
症狀：遊戲內分數改變，但卡片不更新
原因：iframe 消息未發送或被攔截
解決：檢查 sandbox 屬性和 CORS 設置
```

### 問題 2：卡片閃爍
```
症狀：遊戲狀態卡片頻繁閃爍
原因：過度重新渲染
解決：使用 useMemo 或 useCallback 優化
```

### 問題 3：手機版卡片錯位
```
症狀：手機上卡片位置不正確
原因：響應式設計未正確應用
解決：檢查 isMobile 判斷和 CSS 媒體查詢
```

---

**深度分析完成 ✅**

