# Phase 4 性能測試指南

**日期**：2025-11-03
**狀態**：📋 **計劃中**

---

## 🎯 性能測試目標

1. **驗證性能改進** - 確認 Phase 3 的改進帶來了性能提升
2. **建立性能基準** - 為未來的優化提供參考
3. **識別性能瓶頸** - 找出還有改進空間的地方
4. **優化用戶體驗** - 確保遊戲流暢運行

---

## 📊 性能指標

### 核心指標

| 指標 | 目標 | 測試方法 | 優先級 |
|------|------|---------|--------|
| **首屏加載時間** | < 2s | Chrome DevTools | 🔴 高 |
| **渲染時間** | < 16ms | Chrome DevTools | 🔴 高 |
| **內存使用** | < 50MB | Chrome DevTools | 🟡 中 |
| **FPS** | > 60 | Chrome DevTools | 🔴 高 |
| **計算時間** | < 100ms | Console 計時 | 🟡 中 |

### 次要指標

| 指標 | 目標 | 測試方法 |
|------|------|---------|
| **首次內容繪製 (FCP)** | < 1.5s | Chrome DevTools |
| **最大內容繪製 (LCP)** | < 2.5s | Chrome DevTools |
| **累積佈局偏移 (CLS)** | < 0.1 | Chrome DevTools |
| **互動到繪製 (INP)** | < 200ms | Chrome DevTools |

---

## 🛠️ 測試工具

### 1. Chrome DevTools

#### 打開 DevTools
```
Windows/Linux: F12 或 Ctrl+Shift+I
Mac: Cmd+Option+I
```

#### Performance 標籤

**用途**：測試渲染性能、FPS、計算時間

**步驟**：
1. 打開 Chrome DevTools
2. 進入 Performance 標籤
3. 點擊 Record（紅色圓點）
4. 執行測試操作
5. 停止 Record
6. 分析結果

**關鍵指標**：
- Main Thread 時間
- Rendering 時間
- Painting 時間
- FPS

#### Memory 標籤

**用途**：測試內存使用

**步驟**：
1. 打開 Chrome DevTools
2. 進入 Memory 標籤
3. 點擊 Take heap snapshot
4. 記錄內存使用
5. 執行操作
6. 再次 Take heap snapshot
7. 比較內存使用

**關鍵指標**：
- Heap Size
- Detached DOM nodes
- Event listeners

#### Network 標籤

**用途**：測試加載時間

**步驟**：
1. 打開 Chrome DevTools
2. 進入 Network 標籤
3. 刷新頁面
4. 記錄加載時間

**關鍵指標**：
- Total Size
- Total Time
- DOMContentLoaded
- Load

### 2. Lighthouse

**用途**：綜合性能評估

**步驟**：
1. 打開 Chrome DevTools
2. 進入 Lighthouse 標籤
3. 選擇 Performance
4. 點擊 Analyze page load
5. 等待分析完成
6. 查看報告

**關鍵指標**：
- Performance Score
- First Contentful Paint
- Largest Contentful Paint
- Cumulative Layout Shift

### 3. Console 計時

**用途**：測試特定代碼的執行時間

**代碼示例**：
```javascript
console.time('layout-calculation');
// 執行計算
const config = layout.getLayoutConfig();
console.timeEnd('layout-calculation');
```

---

## 📈 測試場景

### 場景 1：首屏加載

**目標**：測試遊戲首次加載的性能

**步驟**：
1. 打開 Chrome DevTools
2. 進入 Performance 標籤
3. 點擊 Record
4. 打開遊戲頁面
5. 等待卡片加載完成
6. 停止 Record
7. 分析結果

**預期結果**：
- 首屏加載時間 < 2s
- FCP < 1.5s
- LCP < 2.5s

### 場景 2：窗口調整

**目標**：測試響應式佈局的性能

**步驟**：
1. 打開遊戲
2. 打開 Chrome DevTools
3. 進入 Performance 標籤
4. 點擊 Record
5. 調整窗口大小（多次）
6. 停止 Record
7. 分析結果

**預期結果**：
- 渲染時間 < 16ms
- FPS > 60
- 沒有長任務

### 場景 3：卡片交互

**目標**：測試卡片拖曳和匹配的性能

**步驟**：
1. 打開遊戲
2. 打開 Chrome DevTools
3. 進入 Performance 標籤
4. 點擊 Record
5. 拖曳卡片（多次）
6. 匹配卡片（多次）
7. 停止 Record
8. 分析結果

**預期結果**：
- 渲染時間 < 16ms
- FPS > 60
- 沒有卡頓

### 場景 4：內存使用

**目標**：測試遊戲的內存使用情況

**步驟**：
1. 打開遊戲
2. 打開 Chrome DevTools
3. 進入 Memory 標籤
4. Take heap snapshot（記錄初始值）
5. 執行遊戲操作（5 分鐘）
6. Take heap snapshot（記錄最終值）
7. 分析內存增長

**預期結果**：
- 初始內存 < 30MB
- 最終內存 < 50MB
- 內存增長 < 20MB

---

## 📝 性能測試報告模板

### 報告標題

```markdown
# 性能測試報告

**日期**：2025-11-03
**設備**：Desktop
**瀏覽器**：Chrome 120
**解析度**：1280×800
```

### 測試結果

```markdown
## 測試結果

### 首屏加載
- 首屏加載時間：1.2s ✅
- FCP：0.8s ✅
- LCP：1.5s ✅

### 渲染性能
- 平均渲染時間：12ms ✅
- 最大渲染時間：18ms ⚠️
- 平均 FPS：58 ✅
- 最低 FPS：45 ⚠️

### 內存使用
- 初始內存：28MB ✅
- 最終內存：42MB ✅
- 內存增長：14MB ✅

### 計算時間
- 佈局計算：85ms ✅
- 卡片渲染：120ms ✅
```

### 性能改進

```markdown
## 性能改進

### 與 Phase 2 的對比

| 指標 | Phase 2 | Phase 3 | 改進 |
|------|---------|---------|------|
| 計算時間 | 150ms | 85ms | -43% |
| 內存使用 | 60MB | 42MB | -30% |
| 渲染時間 | 18ms | 12ms | -33% |
| FPS | 50 | 58 | +16% |
```

### 建議

```markdown
## 建議

1. **優化點 1**：...
2. **優化點 2**：...
3. **優化點 3**：...
```

---

## 🎯 成功標準

### 性能指標

- ✅ 首屏加載時間 < 2s
- ✅ 渲染時間 < 16ms
- ✅ 內存使用 < 50MB
- ✅ FPS > 60
- ✅ 計算時間 < 100ms

### 性能改進

- ✅ 計算時間減少 > 30%
- ✅ 內存使用減少 > 20%
- ✅ 渲染時間減少 > 20%
- ✅ FPS 提高 > 10%

---

## 📋 測試檢查清單

### 準備工作
- [ ] 安裝 Chrome 最新版本
- [ ] 清除瀏覽器緩存
- [ ] 關閉其他應用
- [ ] 準備測試設備

### 測試執行
- [ ] 執行首屏加載測試
- [ ] 執行窗口調整測試
- [ ] 執行卡片交互測試
- [ ] 執行內存使用測試

### 結果分析
- [ ] 分析測試結果
- [ ] 識別性能瓶頸
- [ ] 記錄性能改進
- [ ] 生成測試報告

### 後續行動
- [ ] 提交測試報告
- [ ] 優化性能瓶頸
- [ ] 更新文檔
- [ ] 發布版本

---

**準備好執行性能測試了嗎？** 🚀

