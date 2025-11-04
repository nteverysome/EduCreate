# 🎯 Augment 操作 Responsively App 的實際示例

## 📋 概述

本文檔提供了具體的操作示例，展示如何使用 Augment 工具操作 Responsively App 並獲取 iPhone 實際資訊。

---

## 🔥 實際操作示例

### 示例 1: 完整的 iPhone 14 遊戲信息收集

#### 你應該說:
```
請幫我完成以下操作：

【目標】
在 Responsively App 中獲取 iPhone 14 上遊戲的完整信息

【設備配置】
- 設備: iPhone 14
- 視口: 390×844px
- DPR: 3
- 遊戲 URL: https://edu-create.vercel.app/games/switcher?game=match-up-game&activityId=cmh93tjuh0001l404hszkdf94&layout=mixed&itemsPerPage=20

【操作步驟】
1. 啟動 Responsively App (使用 CDP 端口 9222)
2. 連接到已打開的頁面
3. 獲取頁面快照
4. 獲取所有控制台日誌
5. 執行 JavaScript 獲取遊戲狀態
6. 截圖並保存
7. 生成 JSON 報告

【期望結果】
- 頁面快照 (文本格式)
- 控制台日誌 (包含 [v20.0] 和 [v18.0])
- 遊戲狀態 JSON (包含視口、卡片、列數等)
- 截圖 (PNG 格式)
- 完整報告 (Markdown 格式)
```

#### 我會做:
1. 使用 `launch-process` 啟動 Responsively App
2. 使用 `browser_snapshot_Playwright` 獲取頁面快照
3. 使用 `browser_console_messages_Playwright` 獲取控制台日誌
4. 使用 `browser_evaluate_Playwright` 執行 JavaScript
5. 使用 `browser_take_screenshot_Playwright` 截圖
6. 使用 `save-file` 保存報告

---

### 示例 2: 獲取特定的控制台日誌

#### 你應該說:
```
請從 Responsively App 中獲取以下控制台日誌：

【目標日誌】
- [v20.0] 設備尺寸和寬高比詳細信息
- [v18.0] 動態列數計算

【操作】
1. 連接到 Responsively App 中的遊戲頁面
2. 獲取所有控制台日誌
3. 過濾出包含 [v20.0] 和 [v18.0] 的日誌
4. 提取日誌內容並解析
5. 生成摘要報告

【期望結果】
- 原始日誌文本
- 解析後的 JSON 數據
- 摘要報告 (Markdown)
```

#### 我會做:
1. 使用 `browser_console_messages_Playwright` 獲取所有日誌
2. 過濾出目標日誌
3. 解析日誌內容
4. 生成報告

---

### 示例 3: 執行自定義 JavaScript 獲取遊戲數據

#### 你應該說:
```
請在 Responsively App 中執行 JavaScript 代碼，獲取遊戲數據：

【JavaScript 代碼】
```javascript
const gameData = {
  viewport: {
    width: window.innerWidth,
    height: window.innerHeight,
    dpr: window.devicePixelRatio
  },
  cards: {
    total: document.querySelectorAll('[data-card]').length,
    firstCard: document.querySelector('[data-card]')?.getBoundingClientRect()
  },
  layout: {
    columns: document.querySelectorAll('[data-column]').length,
    rows: document.querySelectorAll('[data-row]').length
  }
};
return gameData;
```

【期望結果】
- 返回 JSON 格式的遊戲數據
- 包含視口、卡片、佈局信息
```

#### 我會做:
1. 使用 `browser_evaluate_Playwright` 執行 JavaScript
2. 返回結果

---

### 示例 4: 對比多個設備

#### 你應該說:
```
請在 Responsively App 中對比以下設備上的遊戲表現：

【設備列表】
1. iPhone 14 (390×844px, DPR=3)
2. iPhone 13 (390×844px, DPR=3)
3. iPhone SE (375×667px, DPR=2)
4. iPad (768×1024px, DPR=2)

【操作】
對於每個設備：
1. 設置設備配置
2. 加載遊戲
3. 獲取遊戲狀態
4. 截圖
5. 記錄性能指標

【期望結果】
- 對比表格 (Markdown)
- 每個設備的截圖
- 性能指標對比
- 建議和分析
```

#### 我會做:
1. 為每個設備執行相同的操作
2. 收集數據
3. 生成對比報告

---

### 示例 5: 測試用戶交互

#### 你應該說:
```
請在 Responsively App 中測試以下用戶交互：

【交互步驟】
1. 加載遊戲
2. 點擊第一張卡片
3. 記錄卡片信息
4. 點擊第二張卡片
5. 記錄匹配結果
6. 截圖

【期望結果】
- 每個交互步驟的截圖
- 卡片信息 (JSON)
- 匹配結果
- 交互日誌
```

#### 我會做:
1. 使用 `browser_click_Playwright` 點擊卡片
2. 使用 `browser_evaluate_Playwright` 獲取卡片信息
3. 使用 `browser_take_screenshot_Playwright` 截圖
4. 記錄所有交互

---

## 📝 溝通模板速查表

### 模板 A: 簡單信息獲取
```
請在 Responsively App 中獲取 [設備名稱] 上的 [信息類型]：
- 設備: [設備規格]
- 遊戲 URL: [URL]
- 需要的信息: [具體信息]
- 期望格式: [JSON/Markdown/CSV]
```

### 模板 B: 操作序列
```
請在 Responsively App 中執行以下操作：
1. [操作 1]
2. [操作 2]
3. [操作 3]
...
期望結果: [期望結果]
```

### 模板 C: 數據對比
```
請對比以下設備上的 [對比項目]：
- 設備 1: [規格]
- 設備 2: [規格]
- 設備 3: [規格]
...
期望結果: [對比表格/報告]
```

### 模板 D: 自定義代碼執行
```
請在 Responsively App 中執行以下代碼：
[代碼]
期望結果: [期望結果]
```

---

## 🎯 常見需求和對應操作

| 需求 | 操作 | 工具 |
|------|------|------|
| 獲取頁面結構 | 獲取快照 | `browser_snapshot_Playwright` |
| 獲取控制台日誌 | 讀取日誌 | `browser_console_messages_Playwright` |
| 獲取遊戲數據 | 執行 JavaScript | `browser_evaluate_Playwright` |
| 保存遊戲畫面 | 截圖 | `browser_take_screenshot_Playwright` |
| 點擊卡片 | 點擊操作 | `browser_click_Playwright` |
| 輸入文本 | 輸入操作 | `browser_type_Playwright` |
| 啟動應用 | 進程管理 | `launch-process` |
| 保存報告 | 文件操作 | `save-file` |

---

## 💡 提示和技巧

### ✅ 提高效率的方法

1. **一次性提供所有信息**
   ```
   ✅ "請獲取 iPhone 14 上的遊戲信息，包括視口、卡片、列數、
      控制台日誌 [v20.0] 和 [v18.0]，並生成 JSON 報告"
   ```

2. **明確指定輸出格式**
   ```
   ✅ "返回 JSON 格式，包含以下字段: viewport, cards, columns, logs"
   ```

3. **提供上下文信息**
   ```
   ✅ "這是為了調試 iPhone 14 上的列數計算問題"
   ```

4. **列出具體步驟**
   ```
   ✅ "1. 啟動 2. 設置 3. 加載 4. 獲取 5. 保存"
   ```

### ❌ 避免的做法

1. **太模糊**
   ```
   ❌ "幫我看看遊戲"
   ```

2. **沒有具體目標**
   ```
   ❌ "獲取所有信息"
   ```

3. **沒有期望結果**
   ```
   ❌ "執行一些操作"
   ```

4. **混亂的表述**
   ```
   ❌ "我想要... 也許... 可能... 試試..."
   ```

---

## 🚀 快速開始

### 最簡單的操作

```
請幫我在 Responsively App 中獲取 iPhone 14 上遊戲的截圖
```

### 中等複雜度的操作

```
請在 Responsively App 中：
1. 設置 iPhone 14 設備
2. 加載遊戲
3. 獲取控制台日誌
4. 返回 JSON 格式的報告
```

### 複雜的操作

```
請在 Responsively App 中對比 iPhone 14 和 iPad 上的遊戲表現，
包括視口、卡片、列數、性能指標，
並生成詳細的對比報告
```

---

## 📞 需要幫助？

如果你不確定如何表達，可以：

1. **從簡單開始**
   - 先要求一個簡單的操作
   - 逐步增加複雜度

2. **提供例子**
   - "類似於之前的 [v20.0] 日誌獲取"

3. **描述目標**
   - "我想要調試 iPhone 14 上的列數問題"

4. **詢問建議**
   - "你建議如何獲取 iPhone 14 的遊戲信息？"

---

**記住**: 清晰、具體、有步驟 = 快速、準確的結果！

祝你使用愉快！ 🚀

