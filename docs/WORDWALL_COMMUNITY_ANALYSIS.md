# Wordwall 社區功能分析報告

## 📋 執行摘要

本報告詳細分析了 Wordwall 的社區功能，了解他們如何保存和展示公開活動，為 EduCreate 的社區功能開發提供參考。

## 🔍 分析方法

- **工具**: Playwright 自動化瀏覽器
- **分析頁面**: 
  - https://wordwall.net/tc/community (社區首頁)
  - https://wordwall.net/tc/resource/93351763 (活動詳情頁)
- **分析時間**: 2025-10-16

## 📊 Wordwall 社區功能架構

### 1. 社區首頁 (/tc/community)

#### **頁面結構**
```
┌─────────────────────────────────────────┐
│ 導航欄                                   │
│ - 創建活動                               │
│ - 我的活動                               │
│ - 我的結果                               │
│ - 社區                                   │
├─────────────────────────────────────────┤
│ 搜尋框                                   │
│ "搜尋公共活動..."                        │
├─────────────────────────────────────────┤
│ 活動卡片網格                             │
│ ┌──────┐ ┌──────┐ ┌──────┐             │
│ │活動1 │ │活動2 │ │活動3 │             │
│ │圖片  │ │圖片  │ │圖片  │             │
│ │標題  │ │標題  │ │標題  │             │
│ │作者  │ │作者  │ │作者  │             │
│ │類型  │ │類型  │ │類型  │             │
│ │喜歡數│ │喜歡數│ │喜歡數│             │
│ └──────┘ └──────┘ └──────┘             │
└─────────────────────────────────────────┘
```

#### **活動卡片信息**
每個活動卡片包含：
- **縮圖圖片**: 活動的視覺預覽
- **活動標題**: 例如「【四上】第一課：水陸小高手（康軒版）」
- **作者信息**: "由 Teachersay"（可點擊查看作者的其他活動）
- **遊戲類型**: 測驗、開箱遊戲、飛果、打地鼠等
- **喜歡數**: 社區互動指標（例如 "23個喜歡"）

#### **URL 結構**
```
/tc/resource/{resourceId}/{category}/{title}?search={searchHash}
```

例如：
```
/tc/resource/93351763/國語/四上第一課水陸小高手康軒版?search=a494d8e06e638cae...
```

### 2. 活動詳情頁 (/tc/resource/{id})

#### **頁面結構**
```
┌─────────────────────────────────────────┐
│ 活動標題                                 │
│ 【四上】第一課：水陸小高手（康軒版）     │
├─────────────────────────────────────────┤
│ 作者和標籤                               │
│ 由 Teachersay | 4年級 | 國語 | 康軒 | 國小│
├─────────────────────────────────────────┤
│ 操作按鈕                                 │
│ [共用] [編輯內容] [書籤] [喜歡]         │
│ [列印] [嵌入] [課業分配]                │
├─────────────────────────────────────────┤
│ 遊戲預覽區域                             │
│ (iframe 嵌入遊戲)                        │
├─────────────────────────────────────────┤
│ 視覺風格選擇                             │
│ [經典] [電子遊戲] [課堂] [雲] ...       │
├─────────────────────────────────────────┤
│ 選項設定                                 │
│ - 計時器                                 │
│ - 機會                                   │
│ - 隨機                                   │
├─────────────────────────────────────────┤
│ 排行榜                                   │
│ (某些遊戲類型不支援)                     │
├─────────────────────────────────────────┤
│ 切換範本                                 │
│ [測驗] [問答遊戲] [開箱遊戲] ...        │
└─────────────────────────────────────────┘
```

### 3. 共用功能 (Share Modal)

#### **分享對話框內容**
```
┌─────────────────────────────────────────┐
│ 共享資源                                 │
├─────────────────────────────────────────┤
│ 連結                                     │
│ [https://wordwall.net/tc/resource/...] │
│ [複製]                                   │
├─────────────────────────────────────────┤
│ 分享或嵌入:                              │
│ [Pinterest] [Facebook] [Google Classroom]│
│ [更多選項...]                            │
└─────────────────────────────────────────┘
```

#### **分享選項**
1. **直接連結**: 可複製的公開 URL
2. **社交媒體**: Pinterest, Facebook
3. **教育平台**: Google Classroom
4. **嵌入代碼**: 可嵌入到其他網站
5. **其他選項**: 更多分享方式

## 🗄️ 數據存儲推測

### 活動數據結構
基於 URL 和頁面內容，推測 Wordwall 的數據結構：

```typescript
interface CommunityActivity {
  // 基本信息
  id: string;                    // 例如: "93351763"
  title: string;                 // 活動標題
  description?: string;          // 活動描述
  
  // 作者信息
  authorId: string;              // 作者 ID
  authorName: string;            // 例如: "Teachersay"
  authorProfileUrl: string;      // 作者個人頁面
  
  // 分類和標籤
  category: string;              // 例如: "國語"
  tags: string[];                // 例如: ["4年級", "康軒", "國小"]
  gameType: string;              // 例如: "測驗", "開箱遊戲"
  
  // 內容
  thumbnailUrl: string;          // 縮圖 URL
  gameData: any;                 // 遊戲內容數據
  vocabularyItems: any[];        // 詞彙列表
  
  // 設定
  visualTheme: string;           // 視覺風格
  gameOptions: {
    timer: 'none' | 'count' | 'countdown';
    chances: number;
    randomizeQuestions: boolean;
    randomizeAnswers: boolean;
    autoAdvance: boolean;
    showAnswers: boolean;
  };
  
  // 社區互動
  likes: number;                 // 喜歡數
  bookmarks: number;             // 書籤數
  views: number;                 // 瀏覽數
  plays: number;                 // 遊玩次數
  
  // 分享設定
  isPublic: boolean;             // 是否公開
  shareUrl: string;              // 分享連結
  embedCode: string;             // 嵌入代碼
  
  // 時間戳記
  createdAt: Date;               // 創建時間
  updatedAt: Date;               // 更新時間
  publishedAt: Date;             // 發布到社區的時間
}
```

### 社區索引結構
```typescript
interface CommunityIndex {
  // 分類索引
  categories: {
    [category: string]: string[];  // category -> activityIds
  };
  
  // 標籤索引
  tags: {
    [tag: string]: string[];       // tag -> activityIds
  };
  
  // 作者索引
  authors: {
    [authorId: string]: string[];  // authorId -> activityIds
  };
  
  // 遊戲類型索引
  gameTypes: {
    [gameType: string]: string[];  // gameType -> activityIds
  };
  
  // 熱門活動
  trending: {
    daily: string[];               // 每日熱門
    weekly: string[];              // 每週熱門
    allTime: string[];             // 歷史熱門
  };
  
  // 搜尋索引
  searchIndex: {
    [keyword: string]: string[];   // keyword -> activityIds
  };
}
```

## 🔑 關鍵功能特點

### 1. 公開分享機制
- **一鍵分享**: 點擊「共用」按鈕即可獲得分享連結
- **無需登入**: 任何人都可以通過連結訪問公開活動
- **多平台支援**: 支援多種社交媒體和教育平台
- **嵌入功能**: 可以嵌入到其他網站

### 2. 社區發現機制
- **搜尋功能**: 可以搜尋公共活動
- **分類瀏覽**: 按年級、科目、出版商等分類
- **作者頁面**: 可以查看特定作者的所有公開活動
- **標籤系統**: 多標籤分類，方便發現相關內容

### 3. 社交互動功能
- **喜歡**: 用戶可以對活動按讚
- **書籤**: 可以收藏喜歡的活動
- **瀏覽統計**: 顯示活動的受歡迎程度
- **作者關注**: 可以查看作者的其他作品

### 4. 內容管理
- **編輯內容**: 作者可以編輯自己的公開活動
- **視覺風格**: 提供 30+ 種視覺主題
- **遊戲選項**: 可自定義計時器、機會、隨機等設定
- **範本切換**: 可以將活動轉換為不同的遊戲類型

## 📈 EduCreate 實現建議

### 階段 1: 基礎社區功能 (優先級: 高)

#### 1.1 公開分享 API
```typescript
// POST /api/activities/{activityId}/publish
// 將活動發布到社區
{
  isPublic: true,
  category: "英文",
  tags: ["國小", "三年級", "南一"],
  description: "國小南一三年級英文第2課"
}

// GET /api/community/activities
// 獲取社區活動列表
{
  page: 1,
  limit: 30,
  category?: string,
  tags?: string[],
  gameType?: string,
  sortBy: 'latest' | 'popular' | 'trending'
}
```

#### 1.2 社區頁面 UI
- 創建 `/community` 頁面
- 活動卡片網格佈局
- 搜尋和篩選功能
- 分頁載入

#### 1.3 活動詳情頁增強
- 添加「發布到社區」按鈕
- 顯示社區統計（瀏覽數、喜歡數）
- 公開分享連結生成

### 階段 2: 社交互動功能 (優先級: 中)

#### 2.1 喜歡和書籤
```typescript
// POST /api/activities/{activityId}/like
// 喜歡活動

// POST /api/activities/{activityId}/bookmark
// 收藏活動

// GET /api/users/me/bookmarks
// 獲取我的收藏
```

#### 2.2 作者頁面
- `/community/author/{authorId}` 頁面
- 顯示作者的所有公開活動
- 作者統計信息

### 階段 3: 進階功能 (優先級: 低)

#### 3.1 評論和評分
- 活動評論功能
- 星級評分系統
- 評論管理

#### 3.2 推薦系統
- 基於用戶興趣的推薦
- 相似活動推薦
- 熱門活動排行

#### 3.3 內容審核
- 社區內容審核機制
- 舉報不當內容
- 管理員審核工具

## 🗃️ 數據庫 Schema 建議

### Community Activity Table
```prisma
model CommunityActivity {
  id              String   @id @default(cuid())
  activityId      String   @unique
  userId          String
  
  // 公開設定
  isPublic        Boolean  @default(false)
  publishedAt     DateTime?
  
  // 分類和標籤
  category        String?
  tags            String[]
  
  // 社交互動
  likes           Int      @default(0)
  bookmarks       Int      @default(0)
  views           Int      @default(0)
  plays           Int      @default(0)
  
  // 關聯
  activity        Activity @relation(fields: [activityId], references: [id], onDelete: Cascade)
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // 索引
  @@index([category])
  @@index([publishedAt])
  @@index([likes])
  @@index([views])
}

model ActivityLike {
  id              String   @id @default(cuid())
  activityId      String
  userId          String
  createdAt       DateTime @default(now())
  
  activity        Activity @relation(fields: [activityId], references: [id], onDelete: Cascade)
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([activityId, userId])
}

model ActivityBookmark {
  id              String   @id @default(cuid())
  activityId      String
  userId          String
  createdAt       DateTime @default(now())
  
  activity        Activity @relation(fields: [activityId], references: [id], onDelete: Cascade)
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([activityId, userId])
}
```

## 🎯 實現優先級

### 立即實現 (本週)
1. ✅ **排行榜功能** - 已完成
2. 🔄 **公開分享 API** - 進行中
3. 🔄 **社區頁面基礎 UI** - 規劃中

### 短期實現 (本月)
1. 社區活動列表頁面
2. 活動搜尋和篩選
3. 發布到社區功能
4. 社區統計顯示

### 中期實現 (下個月)
1. 喜歡和書籤功能
2. 作者頁面
3. 活動評論
4. 推薦系統

### 長期實現 (未來)
1. 內容審核機制
2. 社區管理工具
3. 進階分析功能
4. API 開放給第三方

## 📝 總結

Wordwall 的社區功能核心在於：

1. **簡單的分享機制**: 一鍵發布到社區
2. **強大的發現功能**: 搜尋、分類、標籤
3. **社交互動**: 喜歡、書籤、評論
4. **內容管理**: 編輯、視覺風格、選項設定

EduCreate 可以參考這些設計，逐步實現社區功能，從基礎的公開分享開始，逐步添加社交互動和推薦功能。

## 🔗 相關文檔

- [Wordwall vs EduCreate 課業分配功能對比](./WORDWALL_VS_EDUCREATE_ASSIGNMENT_COMPARISON.md)
- [遊戲詞彙載入完整指南](./VOCABULARY_LOADING_GUIDE.md)
- [EduCreate 測試影片管理規範](../EduCreate-Test-Videos/README.md)

