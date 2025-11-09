# 每頁匹配數遊戲完成模態框統一 [v95.0]

## 問題描述

在"每頁匹配數"遊戲中，需要實現以下流程：
1. 每頁完成後自動進入下一頁（不顯示模態框）
2. 只有到最後一頁完成時才顯示統計得分的模態框

## 解決方案

修改 `showMatchSummary()` 方法的邏輯：
- 檢查是否是最後一頁
- 如果不是最後一頁，自動進入下一頁（延遲 1 秒）
- 如果是最後一頁，顯示統計得分的模態框

## 修改內容

### 1. 修改 `showMatchSummary()` 方法 [v95.0]

**文件**: `public/games/match-up-game/scenes/game.js`

**變更**:
- 添加 `isLastPage` 檢查邏輯
- 如果不是最後一頁，自動進入下一頁（延遲 1 秒）
- 如果是最後一頁，顯示統計得分的模態框
- 最後一頁模態框提供四個按鈕：
  - **Show answers** - 顯示當前頁的答案
  - **Show all answers** - 顯示所有卡片的正確名稱
  - **Start again** - 重新開始遊戲
  - **Leaderboard** - 進入排行榜

### 2. 移除舊的 `showRetryButton()` 方法

**原因**: 已經使用統一的模態框樣式，不再需要單獨的重試按鈕

### 3. 初始化 `pageCompleteModal` 變數

**位置**: `create()` 方法

**代碼**:
```javascript
this.pageCompleteModal = null;  // 🔥 [v94.0] 頁面完成模態框
```

### 4. 在 `restartGame()` 方法中關閉 `pageCompleteModal`

**代碼**:
```javascript
// 🔥 [v94.0] 關閉頁面完成模態框
if (this.pageCompleteModal) {
    this.pageCompleteModal.overlay.destroy();
    this.pageCompleteModal.modal.destroy();
    this.pageCompleteModal = null;
}
```

## 模態框結構

### 頁面完成模態框 (PAGE COMPLETE)

```
┌─────────────────────────────────┐
│      PAGE COMPLETE              │
│                                 │
│  Page        Score              │
│  1/5         5/5                │
│                                 │
│  PAGE COMPLETE!                 │
│                                 │
│  ┌─────────────────────────┐   │
│  │   Show answers          │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │  Show all answers       │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │   Next page             │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │   Retry                 │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

## 功能流程

### 非最後一頁
1. 用戶完成當前頁的所有配對
2. 系統調用 `showMatchSummary()` 方法
3. 檢查 `isLastPage` 為 false
4. 延遲 1 秒後自動調用 `goToNextPage()`
5. 進入下一頁

### 最後一頁
1. 用戶完成最後一頁的所有配對
2. 系統調用 `showMatchSummary()` 方法
3. 檢查 `isLastPage` 為 true
4. 顯示遊戲完成模態框，包含：
   - 最後一頁的頁碼和分數
   - 四個操作按鈕
5. 用戶可以選擇：
   - 查看答案
   - 重新開始遊戲
   - 進入排行榜

## 技術細節

### 模態框樣式

- **背景色**: `0x2c2c2c` (深灰色)
- **邊框**: 4px 黑色邊框
- **標題色**: 白色 (#ffffff)
- **標籤色**: 藍色 (#4a9eff)
- **提示色**: 綠色 (#4caf50)

### 按鈕樣式

- **背景色**: `0x3c3c3c` (深灰色)
- **邊框**: 2px 黑色邊框
- **文字色**: 白色 (#ffffff)
- **字體大小**: 22px

### 響應式設計

- 模態框寬度: `Math.min(500, width * 0.8)`
- 模態框高度: `Math.min(420, height * 0.7)`
- 按鈕間距: 42px

## 測試方法

1. 打開"每頁匹配數"遊戲
2. 配置多頁設置（例如：每頁 5 個配對，總共 3 頁）
3. 完成第一頁的所有配對
4. 驗證頁面完成模態框正確顯示
5. 驗證頁碼和分數正確
6. 測試各個按鈕功能

## 相關文件

- `public/games/match-up-game/scenes/game.js` - 主遊戲場景
- `docs/IMAGE_PICKER_AUTO_SEARCH_FEATURE.md` - 圖片模態框自動搜尋功能

## 版本信息

- **版本**: v95.0
- **修改日期**: 2025-11-09
- **修改者**: AI Assistant

## 更新日誌

### v95.0 (2025-11-09)
- 添加自動進入下一頁的邏輯
- 只有最後一頁才顯示統計得分的模態框
- 修改最後一頁的按鈕為 "Start again" 和 "Leaderboard"

### v94.0 (2025-11-09)
- 初始版本：統一每頁完成模態框樣式

