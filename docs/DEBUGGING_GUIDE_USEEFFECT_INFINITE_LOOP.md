# useEffect 無限循環除錯指南

## 📋 概述

本文檔說明如何診斷和修復由 **useEffect 依賴項中包含函數** 導致的無限循環問題。

這個問題在本地環境可能無法重現，但在生產環境會出現，導致組件不斷重新渲染和重新初始化。

---

## 🎯 問題特徵

### 症狀
- ✅ 本地環境（`next dev`）正常運行
- ❌ 生產環境（Vercel）出現問題
- ❌ 組件不斷重新初始化
- ❌ 顯示加載狀態
- ❌ 用戶狀態丟失（如遊戲進度、卡片順序等）
- ❌ 縮小到工作列或換分頁時問題加劇

### 根本原因
useEffect 的依賴項中包含了一個函數，該函數本身也有依賴項。當這些依賴項改變時：

1. 函數被重新創建
2. useEffect 的依賴項改變
3. useEffect 被觸發
4. 函數被調用
5. 導致狀態改變
6. 回到第 1 步（無限循環）

---

## 🔍 診斷步驟

### 步驟 1：識別問題 useEffect

在 React 組件中搜索所有 useEffect：

```javascript
useEffect(() => {
  // ...
}, [dep1, dep2, functionName]);  // ⚠️ 如果 functionName 是函數，可能有問題
```

### 步驟 2：檢查函數的依賴項

找到該函數的定義，檢查它的依賴項：

```javascript
const functionName = useCallback(async (param) => {
  // ...
}, [session, user, ...]);  // 這些依賴項改變時，函數會被重新創建
```

### 步驟 3：追蹤依賴項的改變

檢查這些依賴項在什麼情況下會改變：

```javascript
const { data: session } = useSession();  // session 可能在初始化時改變
```

### 步驟 4：在瀏覽器 Console 中驗證

在生產環境的瀏覽器 Console 中運行：

```javascript
// 查看是否有重複的日誌
console.log('🔄 useEffect 被觸發');

// 查看函數是否被重複創建
console.log('📝 函數被創建');

// 查看依賴項是否改變
console.log('📊 依賴項:', [dep1, dep2]);
```

---

## ✅ 修復方案

### 方案 1：移除函數從依賴項（推薦）

**問題代碼**：
```javascript
useEffect(() => {
  if (condition) {
    loadData(id);
  }
}, [id, loadData]);  // ❌ loadData 是函數
```

**修復代碼**：
```javascript
useEffect(() => {
  if (condition) {
    loadData(id);
  }
}, [id]);  // ✅ 移除 loadData
```

**原理**：
- useEffect 會通過閉包訪問最新的 `loadData` 引用
- 不需要在依賴項中包含 `loadData`
- 這樣 useEffect 只在 `id` 改變時觸發，而不是在 `loadData` 改變時觸發

### 方案 2：使用 useCallback 優化函數

如果必須在依賴項中包含函數，使用 `useCallback` 優化：

```javascript
const loadData = useCallback(async (id) => {
  // ...
}, []);  // 空依賴項 = 函數不會被重新創建

useEffect(() => {
  if (condition) {
    loadData(id);
  }
}, [id, loadData]);  // ✅ 現在 loadData 不會改變
```

### 方案 3：將邏輯移到函數內部

```javascript
const loadData = useCallback(async (id) => {
  // 在函數內部檢查條件
  if (condition) {
    // ...
  }
}, []);

useEffect(() => {
  loadData(id);
}, [id, loadData]);
```

---

## 📝 實際案例：Match-Up Game v102.5

### 問題代碼

**第 744 行**：
```javascript
useEffect(() => {
  if (isValidActivityId) {
    setActivityId(activityIdParam);
    loadActivityInfo(activityIdParam);  // 調用函數
    // ... 其他邏輯
  }
}, [searchParams, loadActivityInfo]);  // ❌ 包含 loadActivityInfo
```

**第 756 行**：
```javascript
useEffect(() => {
  if (session && activityId) {
    loadActivityInfo(activityId);  // 調用函數
  }
}, [session, activityId, loadActivityInfo]);  // ❌ 包含 loadActivityInfo
```

### 函數定義

```javascript
const loadActivityInfo = useCallback(async (activityId: string) => {
  const response = await fetch(`/api/activities/${activityId}`);
  // ...
}, [session]);  // 依賴於 session
```

### 無限循環鏈條

```
1. 頁面加載
2. session 初始化（null → 已登錄）
3. loadActivityInfo 被重新創建（因為依賴項 [session] 改變）
4. 第 744 行的 useEffect 被觸發（因為依賴項包含 loadActivityInfo）
5. loadActivityInfo 被調用
6. customVocabulary 被加載
7. vocabUpdateTrigger 改變
8. iframe 重新加載
9. 遊戲重新初始化
10. 回到第 2 步
```

### 修復代碼

**第 744 行**：
```javascript
}, [searchParams]);  // ✅ 移除 loadActivityInfo
```

**第 756 行**：
```javascript
}, [session, activityId]);  // ✅ 移除 loadActivityInfo
```

---

## 🛠️ 檢查清單

在修復 useEffect 無限循環時，使用以下清單：

- [ ] 識別所有 useEffect
- [ ] 檢查依賴項中是否有函數
- [ ] 檢查這些函數的依賴項
- [ ] 確認這些依賴項是否會改變
- [ ] 在本地環境測試（可能無法重現）
- [ ] 在生產環境測試（問題會出現）
- [ ] 檢查瀏覽器 Console 中的日誌
- [ ] 驗證修復後本地和生產環境都正常
- [ ] 檢查是否有其他 useEffect 也有相同問題

---

## 📊 本地 vs 生產環境差異

### 為什麼本地環境無法重現？

| 環節 | 本地環境 | 生產環境 |
|------|---------|---------|
| 構建方式 | `next dev`（開發模式） | `next build` + Vercel（生產模式） |
| Session 初始化 | 用戶已登錄，session 不改變 | session 從 null 變為已登錄 |
| React 優化 | 較少優化 | 更激進的優化 |
| 瀏覽器緩存 | 禁用 | 啟用 |
| 結果 | 無限循環不出現 | 無限循環出現 |

### 如何在本地環境重現？

1. 清除所有 cookies 和 localStorage
2. 在隱私模式下打開頁面
3. 刷新頁面
4. 觀察 Console 中的日誌

---

## 🚀 最佳實踐

### 1. 避免在依賴項中包含函數

```javascript
// ❌ 不好
useEffect(() => {
  loadData();
}, [loadData]);

// ✅ 好
useEffect(() => {
  loadData();
}, []);
```

### 2. 使用 useCallback 優化函數

```javascript
const loadData = useCallback(async () => {
  // ...
}, []);  // 空依賴項 = 函數不會改變
```

### 3. 在 useEffect 內部定義函數

```javascript
useEffect(() => {
  const loadData = async () => {
    // ...
  };
  loadData();
}, []);  // 依賴項不包含函數
```

### 4. 使用 ESLint 規則

安裝 `eslint-plugin-react-hooks`：

```bash
npm install --save-dev eslint-plugin-react-hooks
```

配置 `.eslintrc.json`：

```json
{
  "plugins": ["react-hooks"],
  "rules": {
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

---

## 📚 相關資源

- [React useEffect 文檔](https://react.dev/reference/react/useEffect)
- [React useCallback 文檔](https://react.dev/reference/react/useCallback)
- [React Hooks 規則](https://react.dev/warnings/invalid-hook-call-warning)
- [ESLint React Hooks 插件](https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks)

---

## 📞 需要幫助？

如果遇到類似問題：

1. 按照診斷步驟逐一檢查
2. 在瀏覽器 Console 中查看日誌
3. 參考本文檔的實際案例
4. 使用檢查清單驗證修復

---

**最後更新**: 2025-11-08
**相關版本**: v102.5 (Match-Up Game)
**狀態**: ✅ 已驗證和測試

