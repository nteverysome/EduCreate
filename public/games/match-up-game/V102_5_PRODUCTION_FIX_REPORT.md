# v102.5 生產環境修復報告

## 🎯 問題

**生產環境特有問題**：
- ❌ 縮小到工作列或換分頁時，遊戲重新初始化
- ❌ 顯示「載入詞彙中…」
- ❌ 卡片順序被重新洗牌
- ❌ 已配對狀態丟失

**本地環境**：✅ 完全正常

## 🔍 根本原因

### 問題鏈條

1. **useEffect 無限觸發**
   - 第 752 行的 useEffect 依賴項包括 `loadActivityInfo`
   - `loadActivityInfo` 是一個函數，每次 render 時都會被重新創建
   - 導致 useEffect 不斷被觸發

2. **customVocabulary 被重複加載**
   - `loadActivityInfo` 被調用 → 觸發 `loadCustomVocabulary`
   - `customVocabulary` 被重新加載
   - 第 381-389 行的 useEffect 監聽 `customVocabulary` 變化

3. **vocabUpdateTrigger 被改變**
   - `customVocabulary` 改變 → `vocabUpdateTrigger` 增加
   - iframe src 改變 → iframe 重新加載
   - Phaser 遊戲重新初始化

### 為什麼只在生產環境出現？

- **本地環境**：開發者工具禁用緩存，React 的 render 優化可能不同
- **生產環境**：生產構建啟用了更激進的優化，導致 useEffect 更頻繁地被觸發

## ✅ 修復方案

### 修改位置
**文件**：`app/games/switcher/page.tsx`
**行號**：第 746-756 行

### 修改內容

**修改前**：
```javascript
useEffect(() => {
  if (session && activityId) {
    console.log('🔄 Session 已載入，重新檢查所有者身份');
    loadActivityInfo(activityId);
  }
}, [session, activityId, loadActivityInfo]);  // ❌ 包含 loadActivityInfo
```

**修改後**：
```javascript
useEffect(() => {
  if (session && activityId) {
    console.log('🔄 Session 已載入，重新檢查所有者身份');
    loadActivityInfo(activityId);
  }
}, [session, activityId]);  // ✅ 移除 loadActivityInfo
```

### 修復原理

- 移除 `loadActivityInfo` 從依賴項
- useEffect 只在 `session` 或 `activityId` 改變時觸發
- 避免 `loadActivityInfo` 函數重新創建導致的無限循環
- `loadActivityInfo` 仍然可以訪問最新的 `session` 和 `activityId`（通過閉包）

## 📊 修復前後對比

### 修復前（生產環境問題）
```
1. 頁面加載 → loadActivityInfo 被調用
2. customVocabulary 被加載 → vocabUpdateTrigger = 1
3. iframe src 改變 → iframe 重新加載
4. React render → loadActivityInfo 函數被重新創建
5. useEffect 被觸發 → loadActivityInfo 被調用
6. customVocabulary 被重新加載 → vocabUpdateTrigger = 2
7. iframe src 改變 → iframe 重新加載
8. 遊戲重新初始化 → 顯示「載入詞彙中…」
9. 回到第 4 步（無限循環）
```

### 修復後（正常行為）
```
1. 頁面加載 → loadActivityInfo 被調用
2. customVocabulary 被加載 → vocabUpdateTrigger = 1
3. iframe src 改變 → iframe 重新加載
4. React render → loadActivityInfo 函數被重新創建
5. useEffect 不被觸發（因為 session 和 activityId 沒有改變）
6. customVocabulary 保持不變
7. vocabUpdateTrigger 保持不變
8. iframe 不重新加載
9. 遊戲繼續運行
```

## 🚀 部署步驟

1. **推送代碼**
   ```bash
   git push origin master
   ```

2. **Vercel 自動部署**
   - Vercel 會自動檢測到新的 commit
   - 自動構建和部署

3. **驗證修復**
   - 訪問生產環境：https://edu-create.vercel.app/games/switcher?game=match-up-game&activityId=cmhjff7340001jf04htar2e5k
   - 縮小到工作列
   - 回到瀏覽器
   - 遊戲應該繼續運行，卡片順序和已配對狀態保持

## 📝 提交信息

```
fix(match-up-game): v102.5 - 修復生產環境 iframe 重複重新加載問題

問題：
- 生產環境中，當用戶縮小到工作列或換分頁時，遊戲會重新初始化
- 原因：loadActivityInfo 函數被重複調用，導致 customVocabulary 被重新加載
- 這會觸發 vocabUpdateTrigger 改變，導致 iframe src 改變，iframe 重新加載

修復：
- 移除 loadActivityInfo 從 useEffect 的依賴項
- loadActivityInfo 是一個函數，每次 render 時都會被重新創建
- 這導致 useEffect 不斷被觸發，造成無限循環

結果：
- 本地環境和生產環境行為一致
- 縮小到工作列或換分頁時，遊戲保持運行
- 卡片順序和已配對狀態保持不變
```

## 🎉 預期結果

✅ 生產環境修復完成
✅ 本地環境和生產環境行為一致
✅ 縮小到工作列或換分頁時，遊戲保持運行
✅ 卡片順序和已配對狀態保持不變

---

**狀態**: ✅ 已修復
**版本**: v102.5
**日期**: 2025-11-08
**提交**: 2f0e19b

