# 佈局計算改進方案 - 實施進度追蹤

**開始日期**：2025-11-01  
**當前分支**：`feat/layout-calculation-improvements`  
**子分支**：`fix/p0-step-order-horizontalspacing`

---

## 📊 進度概覽

| 階段 | 狀態 | 進度 | 預計完成 |
|------|------|------|---------|
| **第一階段（P0）** | 🔄 進行中 | 0/3 | 今天 |
| **第二階段（P1）** | ⏳ 待開始 | 0/4 | 本週 |
| **第三階段（P2）** | ⏳ 待開始 | 0/4 | 下週 |
| **測試階段** | ⏳ 待開始 | 0/12 | 完成後 |

---

## 🔴 第一階段：P0 嚴重問題

### P0-1: 調整步驟順序（horizontalSpacing 問題）

**狀態**：🔄 進行中  
**分支**：`fix/p0-step-order-horizontalspacing`  
**文件**：`public/games/match-up-game/scenes/game.js`

#### 分析結果

經過代碼檢查，發現：

✅ **好消息**：當前代碼中步驟順序已經正確！
- 第三步（1824-1825）：計算寬高比
- 第四步（1827-1828）：計算水平間距
- 第六步（1837-1840）：計算垂直間距

❌ **但發現問題**：
- 第三步計算的 `aspectRatio` 在第四步沒有使用
- 應該在第四步使用 `aspectRatio` 來動態調整 `horizontalSpacing`

#### 修復計劃

**修改位置**：第 1824-1828 行

**修改前**：
```javascript
// 第三步：計算螢幕寬高比
const aspectRatio = width / height;

// 第四步：智能計算水平間距（根據螢幕寬度）
const horizontalSpacing = Math.max(15, Math.min(30, width * 0.015));
```

**修改後**：
```javascript
// 第三步：計算螢幕寬高比和間距
const aspectRatio = width / height;

// 根據寬高比動態調整水平間距
let horizontalSpacingBase;
if (aspectRatio > 2.0) {
    horizontalSpacingBase = width * 0.02;  // 超寬螢幕：2%
} else if (aspectRatio > 1.5) {
    horizontalSpacingBase = width * 0.015; // 寬螢幕：1.5%
} else {
    horizontalSpacingBase = width * 0.01;  // 標準/直向：1%
}

// 第四步：計算水平間距
const horizontalSpacing = Math.max(15, Math.min(30, horizontalSpacingBase));

// 第五步：計算垂直間距（基於螢幕高度）
const verticalSpacing = Math.max(40, Math.min(80, height * 0.04));
```

#### 驗證方法

1. 修改代碼
2. 運行遊戲，檢查 console 輸出
3. 驗證不同寬高比下的間距計算
4. 確認沒有 ReferenceError

#### 預計時間

- 代碼修改：15 分鐘
- 測試驗證：15 分鐘
- 提交 PR：10 分鐘

**總計**：40 分鐘

---

### P0-2: 統一設備檢測邏輯

**狀態**：⏳ 待開始  
**分支**：`fix/p0-device-detection`（待創建）  
**文件**：`public/games/match-up-game/scenes/game.js`

**預計時間**：30 分鐘

---

### P0-3: 修正中文文字高度計算公式

**狀態**：⏳ 待開始  
**分支**：`fix/p0-chinese-text-height`（待創建）  
**文件**：`public/games/match-up-game/scenes/game.js`

**預計時間**：30 分鐘

---

## 🟠 第二階段：P1 較高問題

### P1-1: 提高最小卡片尺寸

**狀態**：⏳ 待開始  
**預計時間**：15 分鐘

---

### P1-2: 補充中文文字位置計算

**狀態**：⏳ 待開始  
**預計時間**：30 分鐘

---

### P1-3: 修正長方形模式高度計算

**狀態**：⏳ 待開始  
**預計時間**：15 分鐘

---

### P1-4: 修正事件監聽器管理

**狀態**：⏳ 待開始  
**預計時間**：30 分鐘

---

## 🟡 第三階段：P2 中等問題

### P2-1: 調整手機直向按鈕區域

**狀態**：⏳ 待開始  
**預計時間**：10 分鐘

---

### P2-2: 簡化列數計算邏輯

**狀態**：⏳ 待開始  
**預計時間**：20 分鐘

---

### P2-3: 統一全螢幕按鈕調整原則

**狀態**：⏳ 待開始  
**預計時間**：15 分鐘

---

### P2-4: 修正設備類型表格

**狀態**：⏳ 待開始  
**預計時間**：10 分鐘

---

## 🧪 測試階段

### 測試組合 1-6：手機直向

**狀態**：⏳ 待開始  
**預計時間**：30 分鐘

---

### 測試組合 7-12：手機橫向

**狀態**：⏳ 待開始  
**預計時間**：30 分鐘

---

### 測試組合 13-18：平板直向

**狀態**：⏳ 待開始  
**預計時間**：30 分鐘

---

### 測試組合 19-24：平板橫向和桌面

**狀態**：⏳ 待開始  
**預計時間**：30 分鐘

---

### 驗證項目

#### 驗證 1：確認沒有運行時錯誤

**狀態**：⏳ 待開始  
**預計時間**：30 分鐘

---

#### 驗證 2：計算結果準確性

**狀態**：⏳ 待開始  
**預計時間**：30 分鐘

---

#### 驗證 3：用戶體驗改善

**狀態**：⏳ 待開始  
**預計時間**：30 分鐘

---

#### 生成測試報告

**狀態**：⏳ 待開始  
**預計時間**：30 分鐘

---

## 📝 分支管理

### 主分支

```
feat/layout-calculation-improvements
├── fix/p0-step-order-horizontalspacing (當前)
├── fix/p0-device-detection (待創建)
├── fix/p0-chinese-text-height (待創建)
├── fix/p1-mincard-size (待創建)
├── fix/p1-chinese-text-position (待創建)
├── fix/p1-rectangle-height (待創建)
├── fix/p1-event-listeners (待創建)
├── fix/p2-button-area (待創建)
├── fix/p2-column-logic (待創建)
├── fix/p2-fullscreen-principle (待創建)
└── fix/p2-device-table (待創建)
```

### 提交策略

- 每個任務完成後立即提交
- 提交信息格式：`fix: P0-1 - 調整步驟順序（horizontalSpacing 問題）`
- 完成所有 P0 任務後合併到 `feat/layout-calculation-improvements`
- 完成所有任務後合併到 `master`

---

## 🔗 相關文檔

- **LAYOUT_CALCULATION_IMPLEMENTATION_TASKLIST.md**：詳細任務清單
- **IMPROVED_MIXED_MODE_LAYOUT_CALCULATION.md v4.0**：改進方案
- **IMPROVED_LAYOUT_DESIGN_ISSUES_ANALYSIS.md**：深度分析報告

---

**最後更新**：2025-11-01  
**下一步**：開始 P0-1 代碼修改

