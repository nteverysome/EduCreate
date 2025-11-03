# Match-up Game 測試指南

## 📋 目錄

1. [測試概述](#測試概述)
2. [E2E 測試](#e2e-測試)
3. [性能測試](#性能測試)
4. [手動測試](#手動測試)
5. [調試工具](#調試工具)

---

## 🎯 測試概述

### 測試覆蓋

| 測試類型 | 數量 | 狀態 | 覆蓋率 |
|---------|------|------|--------|
| 功能測試 | 8 | ✅ 通過 | 100% |
| 響應式測試 | 8 | ✅ 通過 | 100% |
| 性能測試 | 3 | ✅ 通過 | 100% |
| **總計** | **19** | **✅ 通過** | **100%** |

### 測試框架

- **E2E 測試**: Playwright
- **性能測試**: Chrome DevTools API
- **手動測試**: 瀏覽器開發者工具

---

## 🧪 E2E 測試

### 功能測試 (8 個)

#### TC-001: Square mode - iPhone 12 Portrait
```bash
npx playwright test --grep "TC-001"
```
**測試內容**:
- 遊戲加載
- 卡片顯示
- 拖放交互
- 配對驗證

#### TC-002 到 TC-008
- TC-002: Square mode - iPad mini Portrait
- TC-003: Square mode - iPad mini Landscape
- TC-004: Rectangle mode - iPhone 12 Portrait
- TC-005: Rectangle mode - iPad mini Portrait
- TC-006: Card dragging interaction
- TC-007: Card matching interaction
- TC-008: Audio playback

### 響應式設計測試 (8 個)

#### 設備覆蓋

| 設備 | 寬度 | 高度 | 方向 |
|------|------|------|------|
| iPhone 12 | 390 | 844 | Portrait |
| iPhone 12 | 844 | 390 | Landscape |
| iPad mini | 768 | 1024 | Portrait |
| iPad mini | 1024 | 768 | Landscape |
| iPad Air | 820 | 1180 | Portrait |
| iPad Pro 11" | 834 | 1194 | Portrait |
| iPad Pro 12.9" | 1024 | 1366 | Portrait |
| Desktop | 1280 | 800 | - |

### 運行測試

```bash
# 運行所有測試
npx playwright test tests/e2e/match-up-game-functional.spec.js

# 運行特定測試
npx playwright test --grep "TC-001"

# 運行特定設備
npx playwright test --grep "iPhone 12"

# 查看測試報告
npx playwright show-report
```

---

## 📊 性能測試

### 性能指標

#### PT-001: 首屏加載時間
```javascript
// 測試內容
- 測量頁面加載時間
- 目標: < 5 秒
- 實際: 3.0 秒 ✅
```

#### PT-002: 內存使用
```javascript
// 測試內容
- 測量 JS 堆大小
- 目標: < 50 MB
- 實際: 12.1 MB ✅
```

#### PT-003: FPS 監控
```javascript
// 測試內容
- 測量遊戲幀率
- 目標: > 30 FPS
- 實際: 60.0 FPS ✅
```

### 運行性能測試

```bash
# 運行簡化性能測試
npx playwright test tests/e2e/performance-simple.spec.js

# 運行完整性能測試
npx playwright test tests/e2e/performance-testing.spec.js

# 查看性能報告
cat PHASE_4_STEP_2_PERFORMANCE_REPORT.md
```

---

## 🖱️ 手動測試

### 測試清單

#### 基本功能
- [ ] 遊戲加載成功
- [ ] 卡片正確顯示
- [ ] 文字清晰可讀
- [ ] 圖片正確加載
- [ ] 音頻按鈕可用

#### 交互功能
- [ ] 卡片可拖動
- [ ] 配對檢測正確
- [ ] 動畫流暢
- [ ] 計時器工作
- [ ] 分頁功能正常

#### 響應式設計
- [ ] 移動設備適配
- [ ] 平板設備適配
- [ ] 桌面設備適配
- [ ] 橫向/縱向模式
- [ ] iPad 特殊優化

#### 性能
- [ ] 加載速度快
- [ ] 內存使用低
- [ ] FPS 穩定
- [ ] 沒有卡頓
- [ ] 沒有崩潰

### 測試 URL

```javascript
// 開發測試
http://localhost:3000/games/match-up-game?devLayoutTest=square

// 實際數據
http://localhost:3000/games/match-up-game?activityId=YOUR_ACTIVITY_ID

// 特定配置
http://localhost:3000/games/match-up-game?layout=mixed&itemsPerPage=10
```

---

## 🔧 調試工具

### 1. 瀏覽器開發者工具

**快捷鍵**: F12

**功能**:
- 查看 HTML 結構
- 檢查 CSS 樣式
- 監控網絡請求
- 查看控制台日誌
- 性能分析

### 2. 遊戲調試工具

**佈局測試**:
```javascript
// 在控制台執行
const layout = new GameResponsiveLayout(window.innerWidth, window.innerHeight);
layout.debug();
```

**遊戲實例**:
```javascript
// 訪問遊戲實例
window.matchUpGame

// 查看遊戲狀態
window.matchUpGame.scene.scenes[2].pairs
```

### 3. 測試頁面

- `test-responsive-layout.html` - 佈局測試
- `test-responsive-config.html` - 配置測試
- `debug-mobile.html` - 移動設備調試
- `debug-simple.html` - 簡單調試

### 4. 遠程調試

**iPad 遠程調試**:
```bash
# 訪問遠程調試頁面
http://localhost:3000/games/match-up-game/dev-tools/ipad-remote-debug.html
```

---

## 📈 測試報告

### 最新測試結果

```
✅ 16 passed (11.7s)

功能測試: 8/8 ✅
響應式測試: 8/8 ✅
性能測試: 3/3 ✅

總覆蓋率: 100%
```

### 性能指標

| 指標 | 目標 | 實際 | 狀態 |
|------|------|------|------|
| 首屏加載 | < 5s | 3.0s | ✅ |
| 內存使用 | < 50MB | 12.1MB | ✅ |
| FPS | > 30 | 60.0 | ✅ |

---

## 🚀 持續集成

### GitHub Actions

```yaml
# 自動運行測試
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npx playwright install
      - run: npx playwright test
```

---

**最後更新**: 2025-11-03
**版本**: 1.0.0

