# 🚀 新 Agent 快速參考指南

## 📋 立即需要知道的信息

### 🌐 重要連結
- **生產環境**：https://edu-create.vercel.app/
- **Wordwall 模仿頁面**：https://edu-create.vercel.app/my-activities
- **Vercel 部署**：https://vercel.com/minamisums-projects/edu-create/deployments

### ✅ 系統狀態
- **刪除功能**：✅ 已修復，正常工作
- **Vercel 部署**：✅ 成功，當前版本 `71tLKBe19`
- **認證系統**：✅ 正常工作
- **Wordwall 界面**：✅ 完全模仿，功能完整

## 🔧 最近修復的問題

### DELETE API 修復（重要！）
**文件**：`app/api/activities/[id]/route.ts`
**問題**：第 69 行 Prisma 字段名錯誤
**修復**：`vocabularySetId` → `setId`
**結果**：刪除功能完全正常，不會重新出現

### 架構分析完成
**發現**：Activity + VocabularySet 雙表架構造成複雜性
**建議**：簡化為單表架構（Activity 表）
**狀態**：分析完成，等待實施決定

## ⚠️ 重要注意事項

### 數據庫字段名陷阱
```sql
-- 正確的字段名
VocabularyItem.setId  -- 不是 vocabularySetId！

-- API 中正確的用法
where: { setId: vocabularySetId }  -- 不是 vocabularySetId: vocabularySetId
```

### ID 系統混亂問題
- **前端顯示**：VocabularySet.id
- **刪除 API 需要**：Activity.id
- **解決方案**：統一使用 Activity.id（建議架構簡化）

## 🏗️ 架構快速理解

### 當前架構（複雜）
```
Activity (主表)
├── content.vocabularySetId → VocabularySet.id
└── 用戶看到的是 VocabularySet 數據

VocabularySet (詞彙集合)
├── 存儲詞彙集合信息
└── 與 Activity 一對一關係

VocabularyItem (詞彙項目)
├── setId → VocabularySet.id  // 注意字段名！
└── 存儲具體詞彙
```

### 建議架構（簡化）
```
Activity (統一主表)
├── 包含所有活動信息
├── geptLevel, totalWords (從 VocabularySet 合併)
└── 直接關聯 VocabularyItem

VocabularyItem (詞彙項目)
├── activityId → Activity.id  // 直接關聯
└── 存儲具體詞彙
```

## 🔌 關鍵 API 端點

### GET /api/activities
- **用途**：載入用戶所有活動
- **狀態**：✅ 已統一使用 Activity 表
- **返回**：包含詞彙信息的活動列表

### DELETE /api/activities/[id]
- **用途**：刪除活動
- **狀態**：✅ 已修復 Prisma 字段名問題
- **注意**：使用 Activity.id，不是 VocabularySet.id

### POST /api/activities
- **用途**：創建活動
- **流程**：創建 VocabularySet → 創建 Activity → 關聯

## 🎨 前端組件

### 核心組件
- **WordwallStyleMyActivities.tsx**：主要活動展示
- **UnifiedNavigation.tsx**：統一導航
- **LoginPrompt.tsx**：認證提示

### 數據流
```typescript
// 載入活動
loadActivities() → /api/activities → Activity + VocabularySet 信息

// 刪除活動
deleteActivity(activityId) → /api/activities/[id] → 事務刪除所有關聯數據
```

## 🚨 常見問題和解決方案

### 問題 1：刪除後重新出現
**原因**：Prisma 字段名錯誤或 API 使用錯誤 ID
**檢查**：確認使用 `setId` 字段名，使用 Activity.id

### 問題 2：404 錯誤
**原因**：前端傳遞 VocabularySet.id，API 查找 Activity.id
**解決**：統一 ID 系統或修改 API 邏輯

### 問題 3：部署失敗
**方法**：使用 Playwright 檢查 Vercel 日誌
**常見原因**：路由衝突、模組導入錯誤

## 💡 開發建議

### 新功能開發
1. **優先考慮**：是否會受雙表架構影響
2. **API 設計**：考慮 Activity 和 VocabularySet 的關聯
3. **測試**：使用 Playwright 進行 E2E 測試

### 問題排查
1. **檢查 Vercel 日誌**：使用 Playwright 自動化
2. **數據庫查詢**：注意字段名和關聯關係
3. **認證問題**：確認使用 `session.user.id`

### 架構改進
- **如果用戶要求架構修改**：參考單表架構建議
- **新功能設計**：考慮未來架構簡化的兼容性

## 📞 用戶偏好

### 溝通風格
- **技術導向**：喜歡詳細的技術分析
- **實際效果**：重視功能的實際可用性
- **問題解決**：偏好根本性解決方案

### 工作模式
- **使用 mcp-feedback-collector**：每次完成任務後收集反饋
- **詳細文檔**：提供完整的技術說明
- **Playwright 自動化**：用於問題診斷和測試

## 🎯 當前優先級

### 高優先級
1. **架構簡化決定**：是否實施單表架構
2. **測試覆蓋率**：為修復功能添加測試
3. **文檔更新**：保持技術文檔同步

### 中優先級
1. **性能優化**：減少數據庫查詢次數
2. **錯誤處理**：改善用戶體驗
3. **功能擴展**：添加新的遊戲類型

## 📚 參考文檔

- **完整狀況**：`PROJECT_STATUS_FOR_NEW_AGENT.md`
- **技術規格**：`TECHNICAL_SPECIFICATIONS.md`
- **數據庫模式**：`prisma/schema.prisma`

---

**快速開始提示**：
1. 檢查 `PROJECT_STATUS_FOR_NEW_AGENT.md` 了解完整背景
2. 查看 `TECHNICAL_SPECIFICATIONS.md` 了解技術細節
3. 測試 https://edu-create.vercel.app/my-activities 確認功能正常
4. 使用 mcp-feedback-collector 與用戶溝通

**最後更新**：2025-10-11
