# EduCreate 前端後端與資料庫架構完整分析

## 📅 分析時間
**日期**: 2025-10-16  
**分析人**: AI Assistant  
**目的**: 全面了解 EduCreate 的技術架構和資料庫結構  

---

## 🏗️ 整體架構概述

### 架構類型
**統一全棧架構** - Next.js 14 App Router

```
┌─────────────────────────────────────────────────────────┐
│                    EduCreate Platform                    │
│                                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   前端 UI   │  │  API 路由   │  │   資料庫    │     │
│  │  (React)    │←→│ (Next.js)   │←→│ (PostgreSQL)│     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │              遊戲引擎層 (Phaser 3)              │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 前端架構

### 技術棧
- **框架**: Next.js 14.0.1 (App Router)
- **UI 庫**: React 18
- **樣式**: Tailwind CSS
- **狀態管理**: React Hooks + Context API
- **認證**: NextAuth.js
- **遊戲引擎**: Phaser 3.80.1

### 前端頁面結構

#### 1. 核心功能頁面
```
app/
├── page.tsx                    # 主頁
├── login/page.tsx              # 登入頁面
├── dashboard/page.tsx          # 儀表板
├── my-activities/page.tsx      # 我的活動
├── my-results/page.tsx         # 我的結果
└── community/page.tsx          # 社區頁面
```

#### 2. 活動管理頁面
```
app/activities/
├── advanced-filter/            # 高級篩選
├── analytics/                  # 分析統計
├── batch-operations/           # 批量操作
├── copy-template/              # 複製模板
├── favorites-tags/             # 收藏和標籤
├── history-version/            # 歷史版本
├── import-export/              # 導入導出
├── intelligent-search/         # 智能搜索
├── multi-view/                 # 多視圖
├── templates/                  # 模板管理
└── virtualized/                # 虛擬化列表
```

#### 3. 遊戲頁面
```
app/games/
├── switcher/                   # 遊戲切換器 ⭐ 核心
├── airplane-game/              # 飛機遊戲
├── airplane-iframe/            # 飛機遊戲 (iframe)
├── airplane-cdn/               # 飛機遊戲 (CDN)
├── canyon-runner/              # 峽谷跑者
├── match/                      # 配對遊戲
├── parallax-background-demo/   # 視差背景演示
├── five-games-architecture/    # 五遊戲架構
└── game-switcher/              # 遊戲切換器 (舊版)
```

#### 4. 內容創建頁面
```
app/content/
├── ai-content-generation/      # AI 內容生成
├── autosave/                   # 自動保存
├── editor/                     # 編輯器
├── gept-templates/             # GEPT 模板
├── multimedia/                 # 多媒體
├── realtime-collaboration/     # 實時協作
├── rich-text-editor/           # 富文本編輯器
├── share-system/               # 分享系統
├── thumbnail-preview/          # 縮略圖預覽
└── voice-recording/            # 語音錄製
```

#### 5. 協作和工具頁面
```
app/collaboration/
└── folders/                    # 資料夾協作

app/tools/
├── files/                      # 文件管理
├── folder-import-export/       # 資料夾導入導出
├── folder-templates/           # 資料夾模板
└── real-time-sync/             # 實時同步
```

#### 6. 詞彙管理頁面
```
app/vocabulary/
└── page.tsx                    # 詞彙管理

app/vocabulary-manager/
└── page.tsx                    # 詞彙管理器
```

#### 7. 分享和遊玩頁面
```
app/share/
└── [activityId]/[token]/       # 社區分享頁面

app/play/
└── [activityId]/[assignmentId]/ # 學生遊戲頁面
```

---

## 🔧 後端架構 (API 路由)

### API 結構

#### 1. 活動管理 API
```
app/api/activities/
├── route.ts                    # GET, POST - 活動列表和創建
├── [id]/route.ts               # GET, PUT, DELETE - 單個活動
├── [id]/publish-to-community/  # POST - 發布到社區
└── trash/                      # 回收站相關
```

#### 2. 課業分配 API
```
app/api/assignments/
├── route.ts                    # GET, POST - 課業列表和創建
└── [assignmentId]/route.ts     # GET, PUT, DELETE - 單個課業
```

#### 3. 結果管理 API
```
app/api/results/
├── route.ts                    # GET, POST - 結果列表和創建
├── [id]/route.ts               # GET, PUT, DELETE - 單個結果
├── [resultId]/route.ts         # GET - 結果詳情
└── shared/                     # 分享結果
```

#### 4. 資料夾管理 API
```
app/api/folders/
├── route.ts                    # GET, POST - 資料夾列表和創建
├── [id]/route.ts               # GET, PUT, DELETE - 單個資料夾
├── export/                     # 導出資料夾
└── import/                     # 導入資料夾
```

#### 5. 社區功能 API
```
app/api/community/
├── activities/
│   ├── route.ts                # GET - 社區活動列表
│   ├── [id]/like/              # POST, DELETE - 點讚
│   ├── [id]/bookmark/          # POST, DELETE - 收藏
│   ├── [id]/comments/          # GET, POST - 評論
│   └── by-token/[shareToken]/  # GET - 通過 token 獲取活動
├── authors/
│   └── [authorId]/activities/  # GET - 作者的活動
└── my-bookmarks/
    └── route.ts                # GET - 我的收藏
```

#### 6. 遊戲相關 API
```
app/api/play/
└── [activityId]/[assignmentId]/
    └── route.ts                # GET - 學生遊戲數據

app/api/leaderboard/
└── [assignmentId]/route.ts     # GET - 排行榜
```

#### 7. 分享功能 API
```
app/api/share/
└── [activityId]/[token]/
    └── route.ts                # GET - 分享活動數據

app/api/qr/
└── generate/route.ts           # POST - 生成 QR Code
```

#### 8. 媒體管理 API
```
app/api/media/
├── upload/route.ts             # POST - 上傳媒體
└── [id]/route.ts               # GET, DELETE - 媒體管理
```

#### 9. 認證 API
```
app/api/auth/
└── [...nextauth]/route.ts      # NextAuth.js 認證端點
```

#### 10. 回收站 API
```
app/api/recycle-bin/
├── route.ts                    # GET - 回收站列表
├── restore/route.ts            # POST - 恢復
└── permanent-delete/route.ts   # DELETE - 永久刪除
```

#### 11. 同步和調試 API
```
app/api/sync/
└── real-time/route.ts          # WebSocket 實時同步

app/api/debug/
└── user/route.ts               # 用戶調試信息
```

---

## 🗄️ 資料庫架構

### 資料庫類型
**Neon PostgreSQL 17.5** (雲端託管)

### 連接信息
- **提供商**: Neon (https://neon.tech/)
- **專案**: EduCreate (dry-cloud-00816876)
- **區域**: Azure East US 2 (Virginia)
- **大小**: 95.07 MB
- **表數量**: 31 個表

### 資料庫表結構

#### 1. 核心用戶表
```sql
User                    # 用戶基本信息
├── id (cuid)
├── name
├── email (unique)
├── password
├── role (USER/ADMIN)
├── createdAt
└── updatedAt

Account                 # OAuth 帳號關聯
Session                 # 用戶會話
VerificationToken       # 郵件驗證
PasswordReset           # 密碼重置
```

#### 2. 活動和內容表
```sql
Activity                # 活動/遊戲內容
├── id (cuid)
├── title
├── description
├── gameType
├── vocabularyData (JSON)
├── settings (JSON)
├── userId (FK → User)
├── folderId (FK → Folder)
├── deletedAt (軟刪除)
├── createdAt
└── updatedAt

ActivityVersion         # 活動版本控制
ActivityVersionLog      # 版本日誌
Template                # 活動模板
GameTemplate            # 遊戲模板
H5PContent              # H5P 內容
```

#### 3. 資料夾管理表
```sql
Folder                  # 資料夾
├── id (cuid)
├── name
├── type (ACTIVITIES/RESULTS)
├── userId (FK → User)
├── deletedAt (軟刪除)
├── createdAt
└── updatedAt
```

#### 4. 課業和結果表
```sql
Assignment              # 課業分配
├── id (cuid)
├── activityId (FK → Activity)
├── teacherId (FK → User)
├── title
├── dueDate
├── createdAt
└── updatedAt

AssignmentResult        # 課業結果
├── id (cuid)
├── assignmentId (FK → Assignment)
├── studentName
├── score
├── completedAt
├── data (JSON)
└── createdAt

GameParticipant         # 遊戲參與者
├── id (cuid)
├── activityId (FK → Activity)
├── studentName
├── score
├── completedAt
└── createdAt
```

#### 5. 詞彙管理表
```sql
VocabularySet           # 詞彙集
├── id (cuid)
├── name
├── description
├── userId (FK → User)
├── createdAt
└── updatedAt

vocabulary_items        # 詞彙項目
├── id
├── vocabulary_set_id (FK → VocabularySet)
├── word
├── translation
├── pronunciation
├── example
├── gept_level
└── created_at

LearningProgress        # 學習進度
├── id (cuid)
├── userId (FK → User)
├── vocabularyItemId
├── lastReviewed
├── nextReview
├── repetitions
├── easeFactor
└── interval
```

#### 6. 社區功能表
```sql
ActivityLike            # 活動點讚
├── id (cuid)
├── activityId (FK → Activity)
├── userId (FK → User)
└── createdAt

ActivityBookmark        # 活動收藏
├── id (cuid)
├── activityId (FK → Activity)
├── userId (FK → User)
└── createdAt

ActivityComment         # 活動評論
├── id (cuid)
├── activityId (FK → Activity)
├── userId (FK → User)
├── content
├── createdAt
└── updatedAt

CommunityReport         # 社區舉報
├── id (cuid)
├── activityId (FK → Activity)
├── reporterId (FK → User)
├── reason
├── status
└── createdAt
```

#### 7. 訂閱和支付表
```sql
Plan                    # 訂閱計畫
├── id (cuid)
├── name
├── price
├── features (JSON)
└── createdAt

Subscription            # 用戶訂閱
├── id (cuid)
├── userId (FK → User)
├── planId (FK → Plan)
├── status
├── startDate
├── endDate
└── createdAt

Invoice                 # 發票記錄
├── id (cuid)
├── userId (FK → User)
├── amount
├── status
├── paidAt
└── createdAt
```

#### 8. 系統設置表
```sql
GameSettings            # 遊戲設置
NotificationSettings    # 通知設置
NotificationLog         # 通知日誌
VisualTheme             # 視覺主題
AIPrompt                # AI 提示詞
```

#### 9. 系統表
```sql
_prisma_migrations      # Prisma 遷移記錄
```

---

## 🔗 資料庫關聯關係

### 核心關聯圖
```
User (用戶)
├── 1:N → Activity (活動)
├── 1:N → Folder (資料夾)
├── 1:N → VocabularySet (詞彙集)
├── 1:N → Assignment (課業) [as teacher]
├── 1:N → ActivityLike (點讚)
├── 1:N → ActivityBookmark (收藏)
├── 1:N → ActivityComment (評論)
└── 1:1 → Subscription (訂閱)

Activity (活動)
├── N:1 → User (創建者)
├── N:1 → Folder (所屬資料夾)
├── 1:N → Assignment (課業分配)
├── 1:N → GameParticipant (遊戲參與者)
├── 1:N → ActivityLike (點讚)
├── 1:N → ActivityBookmark (收藏)
└── 1:N → ActivityComment (評論)

Assignment (課業)
├── N:1 → Activity (活動)
├── N:1 → User (教師)
└── 1:N → AssignmentResult (結果)

Folder (資料夾)
├── N:1 → User (擁有者)
└── 1:N → Activity (活動)

VocabularySet (詞彙集)
├── N:1 → User (創建者)
└── 1:N → vocabulary_items (詞彙項目)
```

---

## 📊 當前資料庫狀態

### 數據統計 (2025-10-16 17:10)
```
用戶數: 2
├── 演示用戶 (demo@educreate.com) - 2025-10-16 15:29:54
└── 南志宗 (nteverysome@gmail.com) - 2025-10-16 16:03:56

活動數: 1 (0 活躍, 1 已刪除)
└── 無標題活動 (已刪除) - 2025-10-16 16:17:04

資料夾數: 4 (2 活躍, 2 已刪除)
├── 演示用戶的資料夾 (2 個活躍)
└── 南志宗的資料夾 (2 個已刪除)

課業分配數: 0
課業結果數: 0
遊戲參與者數: 0
```

### 最早記錄
- **最早用戶**: 演示用戶 (2025-10-16 07:29:54 UTC / 15:29:54 台北時間)
- **最早活動**: 無標題活動 (2025-10-16 08:17:04 UTC / 16:17:04 台北時間)

---

## 🎮 遊戲引擎架構

### Phaser 3 整合
```
public/games/
├── airplane-collision-game/    # 飛機碰撞遊戲
│   ├── index.html
│   ├── game.js
│   └── assets/
├── shimozurdo-game/            # Shimozurdo 遊戲
│   ├── index.html
│   ├── game.js
│   └── managers/
│       └── GEPTManager.js
└── starshake/                  # Starshake 遊戲
    ├── index.html
    ├── game.js
    └── assets/
```

### 遊戲載入模式
1. **Main 版本**: 直接在 Next.js 頁面中載入
2. **Iframe 版本**: 通過 iframe 嵌入
3. **Vite 版本**: 使用 Vite 構建的獨立版本

---

## 🔐 認證和授權

### NextAuth.js 配置
- **提供商**: Google OAuth
- **會話策略**: JWT
- **會話時長**: 30 天
- **角色**: USER, ADMIN

### 權限控制
- **公開頁面**: 主頁、登入、社區分享
- **需要登入**: 我的活動、我的結果、創建活動
- **管理員**: 用戶管理、系統設置

---

## 📦 部署架構

### Vercel 部署
- **平台**: Vercel
- **環境**: Production, Preview, Development
- **自動部署**: Git push 觸發
- **環境變數**: DATABASE_URL, NEXTAUTH_SECRET, etc.

### 資料庫連接
- **生產環境**: Neon PostgreSQL (雲端)
- **開發環境**: 本地 PostgreSQL 或 Neon
- **連接池**: Prisma 管理 (33 個連接)

---

## ✨ 總結

### 架構特點
1. ✅ **統一全棧**: Next.js 14 App Router 統一前後端
2. ✅ **模組化設計**: 清晰的功能模組劃分
3. ✅ **RESTful API**: 標準化的 API 設計
4. ✅ **關聯式資料庫**: PostgreSQL + Prisma ORM
5. ✅ **軟刪除機制**: 支援數據恢復
6. ✅ **社區功能**: 完整的社交互動功能
7. ✅ **遊戲引擎**: Phaser 3 整合
8. ✅ **雲端部署**: Vercel + Neon 無伺服器架構

### 技術優勢
- 🚀 **高性能**: 60fps 遊戲運行
- 📱 **響應式**: 支援桌面和移動設備
- 🔒 **安全**: NextAuth.js 認證
- 📊 **可擴展**: 模組化架構易於擴展
- 🎮 **遊戲化**: 25 種遊戲類型支援
- 🌐 **國際化**: 多語言支援準備

### 當前狀態
- ✅ 核心功能完成
- ✅ 遊戲引擎整合完成
- ✅ 社區功能完成
- ⚠️ 資料庫數據較少（可能剛重置）
- ⚠️ 需要增加備份機制

---

**分析完成時間**: 2025-10-16 17:20  
**分析狀態**: ✅ 完成  
**結論**: EduCreate 是一個架構完整、功能豐富的教育遊戲 SaaS 平台

