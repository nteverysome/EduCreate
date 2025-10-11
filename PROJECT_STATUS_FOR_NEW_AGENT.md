# EduCreate 專案狀況說明 - 給新 Agent 的完整指南

## 🎯 專案概述

**專案名稱**：EduCreate - 記憶科學驅動的智能教育遊戲平台
**主要功能**：模仿 Wordwall 的教育遊戲創建平台
**技術棧**：Next.js 14, Prisma, PostgreSQL, NextAuth.js, Vercel 部署

## 🌐 重要連結

- **生產環境**：https://edu-create.vercel.app/
- **Wordwall 模仿頁面**：https://edu-create.vercel.app/my-activities
- **Vercel 部署**：https://vercel.com/minamisums-projects/edu-create/deployments
- **GitHub 倉庫**：https://github.com/nteverysome/EduCreate.git

## ✅ 最近完成的重要修復

### 1. DELETE API 修復（已完成）
**問題**：刪除活動後重新整理會重新出現
**根本原因**：Prisma 字段名錯誤 (`vocabularySetId` 應為 `setId`)
**解決方案**：修復 `app/api/activities/[id]/route.ts` 第 69 行
**狀態**：✅ 完全修復，刪除功能正常工作

### 2. Vercel 部署問題修復（已完成）
**問題**：部署失敗，多個構建錯誤
**解決方案**：使用 Playwright 分析 Vercel 日誌並修復所有錯誤
**狀態**：✅ 部署成功，當前版本：`71tLKBe19`

### 3. 雙表架構問題分析（已完成）
**發現**：Activity 和 VocabularySet 雙表架構造成複雜性
**建議**：簡化為單表架構（Activity 表）
**狀態**：✅ 分析完成，等待實施決定

## 🏗️ 當前架構狀況

### 數據庫架構
```
Activity (主表)
├── id (主鍵)
├── title, description, userId
├── content (JSON) -> { vocabularySetId: "xxx" }
└── 關聯到 VocabularySet

VocabularySet (詞彙集合)
├── id (主鍵)
├── title, description, userId
└── 關聯到 VocabularyItem[]

VocabularyItem (詞彙項目)
├── id (主鍵)
├── setId (外鍵 -> VocabularySet.id)
└── english, chinese, phonetic...
```

### 已知架構問題
1. **數據重複**：Activity 和 VocabularySet 存儲重複信息
2. **ID 混亂**：前端顯示 VocabularySet ID，API 需要 Activity ID
3. **關聯複雜**：通過 JSON 字段關聯，不是標準外鍵
4. **事務複雜**：刪除需要處理多個表

## 🔧 關鍵技術細節

### API 端點
- **GET /api/activities**：載入用戶活動（已統一使用 Activity 表）
- **DELETE /api/activities/[id]**：刪除活動（已修復 Prisma 字段名問題）
- **POST /api/activities**：創建活動（創建 Activity + VocabularySet）

### 認證系統
- **NextAuth.js**：使用 JWT 策略
- **Session 結構**：`session.user.id`, `session.user.email`, `session.user.role`
- **API 認證**：使用 `getServerSession(authOptions)`

### 前端組件
- **WordwallStyleMyActivities.tsx**：主要活動展示組件
- **統一導航**：UnifiedNavigation.tsx
- **認證提示**：LoginPrompt.tsx

## 🚨 當前待解決問題

### 1. 架構簡化建議（優先級：高）
**問題**：雙表架構造成維護複雜性
**建議方案**：
- 合併 VocabularySet 到 Activity 表
- VocabularyItem 直接關聯 Activity.id
- 簡化所有 API 操作

**實施步驟**：
1. 數據庫模式修改
2. 數據遷移腳本
3. API 端點更新
4. 前端組件修改
5. 清理舊代碼

### 2. 測試覆蓋率提升
**需要**：為修復的功能添加 E2E 測試
**工具**：Playwright（已配置）

## 📁 重要文件位置

### 後端 API
- `app/api/activities/route.ts` - 活動 CRUD
- `app/api/activities/[id]/route.ts` - 單個活動操作（已修復）
- `lib/auth.ts` - NextAuth 配置
- `prisma/schema.prisma` - 數據庫模式

### 前端組件
- `app/my-activities/page.tsx` - 我的活動頁面
- `components/activities/WordwallStyleMyActivities.tsx` - 主要組件
- `components/navigation/UnifiedNavigation.tsx` - 導航組件

### 配置文件
- `next.config.js` - Next.js 配置
- `vercel.json` - Vercel 部署配置
- `.env.local` - 環境變數

## 🎮 功能狀況

### ✅ 正常工作的功能
- 用戶註冊/登入
- 活動創建和展示
- Wordwall 風格界面
- 活動刪除（已修復）
- 雲端存儲和同步
- 搜尋和篩選

### ⚠️ 需要注意的功能
- 活動編輯（可能受架構影響）
- 詞彙管理（雙表架構複雜性）
- 批量操作（需要跨表處理）

## 🔄 開發工作流程

### Git 工作流程
- **主分支**：master
- **提交格式**：使用表情符號前綴（🔧 修復、✨ 新功能、📝 文檔）
- **部署**：推送到 master 自動觸發 Vercel 部署

### 測試流程
1. 本地開發測試
2. Playwright E2E 測試
3. Vercel 預覽部署
4. 生產部署驗證

## 💡 給新 Agent 的建議

### 1. 優先處理事項
- 如果用戶要求架構修改，參考上述單表架構建議
- 任何 API 修改都要考慮雙表關聯的複雜性
- 新功能開發前先確認是否會受架構問題影響

### 2. 問題排查指南
- **刪除問題**：檢查 Prisma 字段名是否正確
- **ID 混亂**：確認前端和後端使用的是同一個 ID 系統
- **部署失敗**：使用 Playwright 檢查 Vercel 日誌

### 3. 代碼修改注意事項
- 修改 API 時要同時更新前端組件
- 數據庫操作優先使用事務
- 新增功能要考慮向後兼容性

## 📞 聯繫和協作

- **用戶偏好**：喜歡詳細的技術分析和解決方案
- **溝通風格**：直接、技術導向、重視實際效果
- **工作模式**：使用 mcp-feedback-collector 收集反饋

---

**最後更新**：2025-10-11
**文檔版本**：v1.0
**狀態**：所有已知問題已修復，系統運行正常
