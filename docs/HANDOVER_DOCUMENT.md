# EduCreate 專案交接文檔

## 📋 專案概述

### 專案名稱
**EduCreate** - 教育遊戲創建平台

### 專案描述
一個基於 Wordwall 風格的教育遊戲平台，支援 25+ 種遊戲類型，專注於英語詞彙學習，整合記憶科學原理和 GEPT 分級系統。

### 技術棧
- **前端框架**：Next.js 14 (App Router)
- **UI 框架**：React 18 + TypeScript
- **樣式**：Tailwind CSS
- **資料庫**：PostgreSQL + Prisma ORM
- **身份驗證**：NextAuth.js
- **部署平台**：Vercel
- **版本控制**：Git + GitHub

### 專案 URL
- **生產環境**：https://edu-create.vercel.app
- **GitHub 倉庫**：https://github.com/nteverysome/EduCreate
- **本地開發**：http://localhost:3000

---

## 🗂️ 專案結構

### 核心目錄結構
```
EduCreate/
├── app/                          # Next.js 14 App Router
│   ├── api/                      # API 路由
│   │   ├── activities/           # 活動 CRUD API
│   │   ├── assignments/          # 課業分配 API
│   │   ├── play/                 # 遊戲遊玩 API
│   │   ├── results/              # 成績記錄 API
│   │   └── leaderboard/          # 排行榜 API
│   ├── games/                    # 遊戲頁面
│   │   └── switcher/             # 遊戲切換器頁面
│   ├── my-activities/            # 我的活動頁面
│   ├── create/                   # 活動創建頁面
│   └── community/                # 社區頁面
├── components/                   # React 組件
│   ├── activities/               # 活動相關組件
│   │   ├── WordwallStyleActivityCard.tsx  # 活動卡片
│   │   └── GameThumbnailPreview.tsx       # 遊戲預覽
│   ├── games/                    # 遊戲組件
│   └── ui/                       # UI 組件
├── lib/                          # 工具函數庫
│   ├── vocabulary/               # 詞彙處理
│   │   └── loadVocabularyData.ts # 詞彙載入工具
│   ├── game-templates/           # 遊戲模板管理
│   └── wordwall/                 # Wordwall 風格管理
├── prisma/                       # Prisma ORM
│   └── schema.prisma             # 資料庫模型定義
├── public/                       # 靜態資源
│   └── games/                    # 遊戲資源
└── docs/                         # 文檔
    ├── API_DOCUMENTATION.md      # API 文檔
    └── HANDOVER_DOCUMENT.md      # 本文檔
```

---

## 🎮 核心功能模組

### 1. 活動管理系統

#### 活動卡片組件
**文件**：`components/activities/WordwallStyleActivityCard.tsx`

**功能**：
- 顯示活動信息（標題、遊戲類型、瀏覽次數）
- 動態遊戲預覽縮略圖
- 遊戲類型標籤（圖標 + 名稱）
- 操作按鈕（遊玩、編輯、複製、刪除、分享）
- 重新命名功能
- 拖拽到資料夾功能
- 課業分配功能

**重要更新**：
- 遊戲類型標籤改為 Wordwall 風格（白色半透明 + 圖標 + 名稱）
- 添加動態遊戲預覽功能（顯示實際遊戲畫面和單字）
- 瀏覽次數改為真實追蹤（每次訪問自動增加）

#### 遊戲預覽組件
**文件**：`components/activities/GameThumbnailPreview.tsx`

**功能**：
- 根據遊戲類型動態生成預覽畫面
- 顯示活動的前 3 個單字（英文 + 中文）
- 支援 7+ 種遊戲類型的專屬預覽

**支援的遊戲類型**：
- Shimozurdo Game：深色背景 + Logo + 單字列表
- Quiz 測驗：問題 + 選項佈局
- Matching 配對：左右配對網格
- Flashcards 單字卡片：堆疊卡片效果
- Hangman 猜字：字母空格預覽
- Airplane 飛機：天空背景 + 單字
- Memory Cards 記憶：卡片網格佈局

### 2. 詞彙管理系統

#### 詞彙載入工具
**文件**：`lib/vocabulary/loadVocabularyData.ts`

**功能**：
- 統一的詞彙數據載入邏輯
- 支援三種數據來源（按優先級）：
  1. `vocabularyItems`：關聯到 VocabularySet 模型（最新架構）
  2. `elements`：JSON 字段存儲（中期架構）
  3. `content.vocabularyItems`：舊版存儲（最舊架構）
- 自動標準化詞彙格式
- 長度驗證（避免空數組問題）

**核心函數**：
```typescript
loadVocabularyData(activity)           // 載入詞彙數據
normalizeVocabularyItem(item, index)   // 標準化格式
hasVocabularyData(activity)            // 檢查是否有詞彙
getSourceDisplayName(source)           // 獲取來源名稱
```

**重要修復**：
- 修復了 JavaScript 空數組陷阱（空數組是 truthy 值）
- 所有檢查都添加了 `&& arr.length > 0` 驗證

### 3. 遊戲系統

#### 遊戲切換器頁面
**文件**：`app/games/switcher/page.tsx`

**功能**：
- 支援匿名模式和姓名模式
- 從 URL 參數載入活動和遊戲類型
- 自動追蹤瀏覽次數
- 顯示活動信息框
- 嵌入遊戲 iframe

**URL 參數**：
```
/games/switcher?game=vocabulary&activityId=xxx&assignmentId=xxx&studentName=xxx
```

**模式判斷**：
- 有 `assignmentId` + `studentName`：姓名模式（記錄成績）
- 只有 `activityId`：匿名模式（不記錄成績）

#### 瀏覽次數追蹤
**API**：`app/api/activities/[id]/view/route.ts`

**功能**：
- POST 請求增加活動的 `playCount` 字段
- 不需要身份驗證（任何人訪問都計數）
- 異步執行，不阻塞頁面載入

**調用位置**：
- `app/games/switcher/page.tsx` 的 `loadActivityInfo` 函數

### 4. API 系統

#### 活動 API
**文件**：`app/api/activities/[id]/route.ts`

**支援的方法**：
- `GET`：獲取活動詳情（包含 elements 和 vocabularyItems）
- `PUT`：完整更新活動（用於拖拽到資料夾）
- `PATCH`：部分更新活動（用於重新命名）
- `DELETE`：刪除活動

**重要更新**：
- GET 方法添加了 `elements` 和 `vocabularyItems` 字段
- 添加了 PATCH 方法支援重新命名功能

#### 課業分配 API
**文件**：`app/api/assignments/route.ts`

**功能**：
- 創建課業分配
- 生成唯一的分配 ID
- 設定截止日期和其他參數

---

## 🐛 已知問題和解決方案

### 1. 詞彙數據消失問題（已修復）

**問題描述**：
- 複製活動後，詞彙數據消失
- 編輯頁面無法載入詞彙
- 活動卡片彈出框顯示空白

**根本原因**：
- JavaScript 空數組陷阱：`vocabularyItems: []` 是 truthy 值
- 代碼檢查 `if (activity.vocabularyItems && Array.isArray(activity.vocabularyItems))` 會匹配空數組

**解決方案**：
- 所有檢查都添加 `&& arr.length > 0` 驗證
- 創建統一的詞彙載入工具（`lib/vocabulary/loadVocabularyData.ts`）

**相關提交**：
- d18ef4d：修復編輯頁面
- 5923e07：修復活動卡片
- e9315dd：創建統一工具函數

### 2. 重新命名功能失敗（已修復）

**問題描述**：
- 點擊重新命名按鈕後顯示「重新命名失敗，請稍後再試」

**根本原因**：
- RenameActivityModal 使用 PATCH 方法
- API 路由只有 GET、PUT、DELETE 方法，缺少 PATCH 處理器

**解決方案**：
- 添加 PATCH 方法處理器到 `app/api/activities/[id]/route.ts`
- PATCH 用於部分更新（如重新命名）
- PUT 保留用於完整更新（如拖拽到資料夾）

**相關提交**：
- 619588a：添加 PATCH 方法

### 3. 瀏覽次數顯示靜態數據（已修復）

**問題描述**：
- 「我的活動」頁面顯示的瀏覽次數不是真實數據

**解決方案**：
- 創建瀏覽次數追蹤 API（`app/api/activities/[id]/view/route.ts`）
- 在遊戲頁面自動調用追蹤 API
- 更新 `playCount` 字段

**相關提交**：
- 73f0c02：添加瀏覽次數追蹤功能

---

## 📝 重要代碼模式

### 1. 詞彙數據載入模式

**正確做法**：
```typescript
import { loadVocabularyData } from '@/lib/vocabulary/loadVocabularyData';

// 載入詞彙數據
const vocabularyData = await loadVocabularyData(activity);

if (vocabularyData.length > 0) {
  // 使用詞彙數據
  console.log('載入了', vocabularyData.length, '個詞彙');
}
```

**錯誤做法**（會遇到空數組問題）：
```typescript
// ❌ 不要這樣做
if (activity.vocabularyItems && Array.isArray(activity.vocabularyItems)) {
  // 這會匹配空數組！
}

// ✅ 應該這樣做
if (activity.vocabularyItems && activity.vocabularyItems.length > 0) {
  // 正確檢查
}
```

### 2. API 調用模式

**GET 請求**：
```typescript
const response = await fetch(`/api/activities/${activityId}`);
const data = await response.json();
```

**POST 請求**：
```typescript
const response = await fetch(`/api/activities/${activityId}/view`, {
  method: 'POST',
});
```

**PATCH 請求**（部分更新）：
```typescript
const response = await fetch(`/api/activities/${activityId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: newTitle }),
});
```

### 3. 遊戲類型映射模式

**文件**：`components/activities/WordwallStyleActivityCard.tsx`

```typescript
const getGameTypeInfo = (gameType: string): { icon: string; name: string } => {
  const gameTypeMap: { [key: string]: { icon: string; name: string } } = {
    'quiz': { icon: '❓', name: '測驗' },
    'matching': { icon: '🔗', name: '配對遊戲' },
    // ... 更多遊戲類型
  };
  
  return gameTypeMap[gameType] || { icon: '🎮', name: gameType || '遊戲' };
};
```

---

## 🔧 開發環境設置

### 1. 克隆專案
```bash
git clone https://github.com/nteverysome/EduCreate.git
cd EduCreate
```

### 2. 安裝依賴
```bash
npm install
```

### 3. 環境變數設置
創建 `.env.local` 文件：
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
```

### 4. 資料庫設置
```bash
npx prisma generate
npx prisma db push
```

### 5. 啟動開發服務器
```bash
npm run dev
```

---

## 📚 重要文檔

### 專案文檔
- `README.md`：專案說明和快速開始
- `docs/API_DOCUMENTATION.md`：API 文檔
- `docs/VOCABULARY_LOADING_BUG_ANALYSIS.md`：詞彙載入問題分析
- `docs/GAME_SWITCHER_API_ANALYSIS.md`：遊戲頁面 API 分析

### 規則文檔（`.augment/rules/`）
- `#強制檢查規則-最高優先級.md`：每次任務完成後的強制檢查
- `#防止功能孤立的完整工作流程.md`：確保功能整合到主頁面
- `@代碼開發與驗證規範.md`：代碼開發標準
- `@專案記憶與上下文管理.md`：避免重複開發
- `@統一架構提醒.md`：25 種遊戲統一架構要求
- `@GEPT分級自動檢查.md`：GEPT 詞彙分級檢查
- `@記憶科學遊戲設計.md`：記憶科學原理

---

## 🚀 最近的重要更新

### 最新提交（按時間倒序）

1. **af332dd** - feat: 添加動態遊戲預覽縮略圖功能
   - 創建 GameThumbnailPreview 組件
   - 支援 7+ 種遊戲類型的專屬預覽
   - Shimozurdo Game 深色風格預覽

2. **901e375** - feat: 改進活動卡片遊戲類型標籤 - Wordwall 風格
   - 遊戲標籤改為白色半透明背景
   - 顯示圖標 + 名稱組合
   - 支援 25+ 種遊戲類型映射

3. **73f0c02** - feat: 添加活動瀏覽次數追蹤功能
   - 創建瀏覽次數追蹤 API
   - 遊戲頁面自動追蹤
   - 真實數據顯示

4. **619588a** - fix: 添加 PATCH 方法支援活動重新命名功能
   - 修復重新命名失敗問題
   - 添加 PATCH 方法處理器

5. **e9315dd** - feat: 創建統一的詞彙載入工具函數庫
   - 避免代碼重複
   - 統一處理三種數據來源
   - 修復空數組問題

---

## ⚠️ 注意事項

### 1. 詞彙數據處理
- **永遠使用** `lib/vocabulary/loadVocabularyData.ts` 工具函數
- **不要直接訪問** `activity.vocabularyItems` 或 `activity.elements`
- **必須檢查** 數組長度（`arr.length > 0`）

### 2. API 方法選擇
- **PATCH**：部分更新（如重新命名）
- **PUT**：完整更新（如拖拽到資料夾）
- **POST**：創建或修改狀態（如增加瀏覽次數）

### 3. 遊戲類型
- 使用統一的遊戲類型映射（`getGameTypeInfo`）
- 支援英文和中文名稱
- 每種遊戲都有專屬圖標

### 4. 測試流程
- 每次修改後必須測試完整的用戶流程
- 從主頁開始測試（避免功能孤立）
- 使用 Playwright 進行 E2E 測試

---

## 📞 聯絡信息

### GitHub
- **倉庫**：https://github.com/nteverysome/EduCreate
- **用戶**：nteverysome

### 部署
- **平台**：Vercel
- **URL**：https://edu-create.vercel.app

---

## 🎯 下一步建議

### 短期任務
1. 完善遊戲預覽功能（添加更多遊戲類型）
2. 優化詞彙載入性能
3. 添加更多測試覆蓋

### 中期任務
1. 實現 25 種遊戲類型的完整支援
2. 添加主題系統（風格切換）
3. 完善社區分享功能

### 長期任務
1. 實現跨遊戲學習數據同步
2. 添加 AI 圖片生成功能
3. 開發移動應用版本

---

**文檔版本**：1.0  
**最後更新**：2025-01-18  
**維護者**：EduCreate Team

