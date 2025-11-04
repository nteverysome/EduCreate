# v7.0 實施檢查清單

## 📋 實施前準備

- [ ] 備份原始代碼
  ```bash
  git add .
  git commit -m "backup: before v7.0 optimization"
  ```

- [ ] 創建新分支
  ```bash
  git checkout -b feature/v7-text-spacing-optimization
  ```

- [ ] 閱讀相關文檔
  - [ ] IMPROVED_MIXED_MODE_LAYOUT_CALCULATION.md（第 663-815 行）
  - [ ] V7_OPTIMIZATION_SUMMARY.md

---

## 🔧 實施步驟

### 步驟 1：實現 `calculateSmartTextHeight()` 函數

**位置**：`public/games/match-up-game/scenes/game.js` - Scene 類中

**代碼**：參考 IMPROVED_MIXED_MODE_LAYOUT_CALCULATION.md 第 819-904 行

**驗收標準**：
- [ ] 函數能正確計算文字高度
- [ ] 文字不超出容器邊界
- [ ] 字體大小在 12-48px 之間
- [ ] 輸出日誌信息

### 步驟 2：修改 `createMixedLayout()` 方法 - 第 6 步

**位置**：`public/games/match-up-game/scenes/game.js` - `createMixedLayout()` 方法

**原代碼**（第 667 行）：
```javascript
const chineseTextHeight = finalCardHeight * 0.4;
```

**新代碼**：參考 IMPROVED_MIXED_MODE_LAYOUT_CALCULATION.md 第 663-693 行

**驗收標準**：
- [ ] 計算出所有文字高度
- [ ] 找出最大值
- [ ] 輸出統計信息

### 步驟 3：修改 `createMixedLayout()` 方法 - 第 7 步

**位置**：`public/games/match-up-game/scenes/game.js` - `createMixedLayout()` 方法

**新代碼**：參考 IMPROVED_MIXED_MODE_LAYOUT_CALCULATION.md 第 695-713 行

**驗收標準**：
- [ ] 使用最大文字高度
- [ ] 計算正確的 totalUnitHeight
- [ ] 輸出計算信息

### 步驟 4：添加 `createMixedLayout()` 方法 - 第 8 步

**位置**：`public/games/match-up-game/scenes/game.js` - `createMixedLayout()` 方法

**新代碼**：參考 IMPROVED_MIXED_MODE_LAYOUT_CALCULATION.md 第 715-765 行

**驗收標準**：
- [ ] 計算最大行數
- [ ] 檢測是否需要分頁
- [ ] 計算最小間距
- [ ] 輸出驗證信息

### 步驟 5：修改 `createMixedLayout()` 方法 - 第 9 步

**位置**：`public/games/match-up-game/scenes/game.js` - `createMixedLayout()` 方法

**新代碼**：參考 IMPROVED_MIXED_MODE_LAYOUT_CALCULATION.md 第 767-815 行

**驗收標準**：
- [ ] 使用最大文字高度計算位置
- [ ] 所有卡片對齊
- [ ] 輸出位置信息

---

## 🧪 測試場景

### 場景 1：短文字
- [ ] 文字："AI"
- [ ] 預期：正常顯示，不超出邊界

### 場景 2：長文字
- [ ] 文字："機器人學習系統"
- [ ] 預期：正常顯示，不超出邊界

### 場景 3：混合文字
- [ ] 文字：["AI", "機器人學習系統", "深度學習"]
- [ ] 預期：所有文字高度統一，都不超出邊界

### 場景 4：超多卡片
- [ ] 卡片數：20+
- [ ] 預期：自動分頁，每頁卡片數正確

### 場景 5：不同設備
- [ ] 設備：iPhone, iPad, Desktop
- [ ] 預期：所有設備都能正常顯示

---

## ✅ 驗收標準

修正完成後應滿足：

- [ ] 所有卡片的文字高度統一
- [ ] 間距根據可用空間動態調整
- [ ] 卡片永遠不會被切割
- [ ] 文字永遠不會超出邊界
- [ ] 自動分頁（如果需要）
- [ ] 視覺效果統一整齊
- [ ] 所有設備類型都能正常顯示
- [ ] 所有文字長度都能正常顯示

---

## 📊 預期效果

### 修正前
```
❌ 卡片可能被切割
❌ 文字可能超出邊界
❌ 無法自動分頁
❌ 視覺效果不統一
```

### 修正後
```
✅ 卡片永遠不會被切割
✅ 文字永遠不會超出邊界
✅ 自動分頁
✅ 視覺效果統一
```

---

## 🚀 提交和部署

### 提交代碼
```bash
# 查看修改
git status

# 添加修改
git add public/games/match-up-game/scenes/game.js

# 提交
git commit -m "feat: implement v7.0 text spacing optimization

- Add calculateSmartTextHeight() function
- Calculate maximum text height for all cards
- Implement reverse validation and minimum spacing
- Add automatic pagination support
- Ensure visual consistency across all cards"

# 推送
git push origin feature/v7-text-spacing-optimization
```

### 創建 PR
- [ ] 在 GitHub 上創建 PR
- [ ] 等待代碼審查
- [ ] 修復審查意見
- [ ] 合併到主分支

### 部署
- [ ] 部署到測試環境
- [ ] 驗證效果
- [ ] 部署到生產環境

---

## 📝 日誌記錄

### 實施日期
- 開始日期：___________
- 完成日期：___________

### 實施人員
- 開發者：___________
- 審查者：___________

### 備註
```
_________________________________________________________________

_________________________________________________________________

_________________________________________________________________
```

---

## 📞 常見問題

### Q1：如何測試文字高度計算？
**A**：在瀏覽器控制台查看日誌輸出，檢查 `📝 文字高度統計` 信息。

### Q2：如何驗證分頁是否正確？
**A**：在瀏覽器控制台查看日誌輸出，檢查 `📄 分頁信息` 信息。

### Q3：如果修改後出現問題怎麼辦？
**A**：使用 `git revert` 回滾到上一個版本，然後檢查日誌找出問題。

### Q4：需要修改多少代碼？
**A**：主要修改 `createMixedLayout()` 方法，約 50-100 行代碼。

### Q5：預計需要多長時間？
**A**：核心實施 2-3 小時，完整測試 3-4 小時。

---

**最後更新**：2025-11-02
**版本**：v1.0 - 實施檢查清單
**狀態**：準備開始

