# EduCreate 錯誤修復實施計劃

## 概述

根據代碼分析，我們發現了EduCreate項目中的幾個關鍵問題，包括API路徑不一致、H5P組件路徑引用問題、支付API路徑不匹配以及搜索頁面狀態管理問題。本文檔提供了一個詳細的實施計劃，指導如何有效地修復這些問題。

## 修復優先順序

我們將按照以下優先順序修復問題：

1. **搜索頁面狀態管理問題** - 直接影響用戶體驗
2. **H5P組件路徑引用問題** - 影響核心功能的可用性
3. **支付API路徑不匹配問題** - 影響支付流程
4. **搜索API路徑不一致問題** - 影響搜索功能的完整性

## 詳細實施步驟

### 第一階段：修復搜索頁面狀態管理

**目標**：確保搜索頁面在條件變更時有適當的加載狀態管理。

**步驟**：

1. 修改 `pages/search.tsx` 中的 `useEffect` 和 `fetchActivities` 函數：
   - 確保在發起新搜索前設置 `setIsLoading(true)`
   - 添加適當的錯誤處理
   - 在 `finally` 塊中重置加載狀態

**測試方法**：
- 在瀏覽器中打開搜索頁面
- 嘗試不同的搜索條件組合
- 確認每次搜索時都顯示加載指示器
- 驗證錯誤情況下有適當的用戶反饋

### 第二階段：修復H5P組件路徑引用問題

**目標**：使H5P資源路徑在不同環境中都能正確加載。

**步驟**：

1. 在 `.env.example` 和 `.env.prod.example` 中添加 `NEXT_PUBLIC_H5P_BASE_PATH` 變量
2. 修改 `components/H5P/H5PEmbed.jsx`：
   - 添加基礎路徑配置
   - 在初始化H5P內容時使用這個基礎路徑

**測試方法**：
- 在本地環境設置 `NEXT_PUBLIC_H5P_BASE_PATH=""`
- 確認H5P內容能正確加載
- 模擬生產環境路徑，確認路徑構建正確

### 第三階段：修復支付API路徑不匹配問題

**目標**：確保支付相關的API路徑一致。

**步驟**：

1. 創建 `pages/api/payments/index.ts` 作為支付API的入口點
2. 確認 `StripeSubscription.jsx` 中的API路徑與後端一致
3. 檢查其他支付相關API的路徑命名是否一致

**測試方法**：
- 訪問 `/api/payments` 確認API入口點正常工作
- 測試訂閱流程，確認API請求成功
- 檢查網絡請求，確保沒有404錯誤

### 第四階段：修復搜索API路徑不一致問題

**目標**：確保前端和後端的搜索API路徑一致。

**步驟**：

1. 檢查 `pages/api/search/advanced.ts` 中的標籤處理邏輯
2. 確保它與 `search.tsx` 中發送的參數格式匹配
3. 完善高級搜索API的實現，特別是標籤過濾功能

**測試方法**：
- 在搜索頁面選擇不同的標籤組合
- 檢查網絡請求，確認參數格式正確
- 驗證搜索結果是否符合預期

## 測試計劃

### 單元測試

1. 為修改的組件添加或更新單元測試：
   - `H5PEmbed.jsx`
   - `search.tsx`
   - 支付相關API

### 集成測試

1. 測試搜索功能的完整流程
2. 測試H5P內容的加載和顯示
3. 測試支付訂閱流程

### 端到端測試

1. 使用Cypress添加或更新端到端測試：
   - 搜索功能測試
   - H5P內容交互測試
   - 支付流程測試

## 部署計劃

1. 在開發環境中實施修復
2. 進行全面測試
3. 在測試環境中驗證修復
4. 準備生產環境部署

## 文檔更新

1. 更新API文檔，反映正確的API路徑
2. 更新開發者指南，說明H5P資源路徑配置
3. 更新`task.md`，將相關任務標記為已完成

## 結論

通過實施這個計劃，我們將解決EduCreate項目中的關鍵問題，提高系統的穩定性和用戶體驗。每個修復步驟都包含了明確的目標、實施步驟和測試方法，確保修復的有效性和完整性。