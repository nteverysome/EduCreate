# 🧠 SRS (SuperMemo SM-2) 實施指南

## 📋 目錄
1. [概述](#概述)
2. [系統架構](#系統架構)
3. [資料庫設計](#資料庫設計)
4. [後端 API 實施](#後端-api-實施)
5. [前端整合](#前端整合)
6. [Phaser 3 遊戲整合](#phaser-3-遊戲整合)
7. [測試計畫](#測試計畫)
8. [部署流程](#部署流程)

---

## 概述

### 目標
實施 SuperMemo SM-2 間隔重複算法,提供科學化的單字學習系統。

### 核心功能
- ✅ 追蹤每個單字的學習記錄
- ✅ 根據遺忘曲線安排複習
- ✅ 智能選擇學習單字
- ✅ 提供詳細的學習統計
- ✅ 完全不影響教師自定義活動

### 技術棧
- **後端**: Next.js API Routes, Prisma ORM
- **前端**: React, TypeScript
- **遊戲**: Phaser 3
- **資料庫**: PostgreSQL
- **算法**: SuperMemo SM-2

---

## 系統架構

### 整體架構圖
```
┌─────────────────────────────────────────────────────────┐
│                    用戶界面層                            │
├─────────────────────────────────────────────────────────┤
│  學習模式選擇  │  學習會話  │  統計頁面  │  遊戲頁面   │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    業務邏輯層                            │
├─────────────────────────────────────────────────────────┤
│  SRS Manager  │  SM-2 Algorithm  │  Word Selector      │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    API 層                                │
├─────────────────────────────────────────────────────────┤
│  /api/srs/words-to-review                               │
│  /api/srs/update-progress                               │
│  /api/srs/sessions                                      │
│  /api/srs/statistics                                    │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    資料庫層                              │
├─────────────────────────────────────────────────────────┤
│  UserWordProgress  │  LearningSession  │  WordReview    │
└─────────────────────────────────────────────────────────┘
```

### 數據流向

#### 學習流程
```
1. 用戶選擇 GEPT 等級
   ↓
2. 系統創建學習會話
   ↓
3. SRS 算法選擇 15 個單字 (5 新 + 10 複習)
   ↓
4. 用戶玩遊戲學習
   ↓
5. 記錄答題結果和反應時間
   ↓
6. SM-2 算法更新記憶強度
   ↓
7. 保存到資料庫
   ↓
8. 顯示學習統計
```

#### 複習流程
```
1. 系統查詢需要複習的單字
   ↓
2. 按優先級排序:
   - 過期時間長
   - 記憶強度低
   - 最近答錯
   ↓
3. 選擇前 10 個單字
   ↓
4. 混合 5 個新單字
   ↓
5. 呈現給用戶
```

---

## 資料庫設計

### 1. UserWordProgress 表

#### 用途
追蹤每個用戶對每個單字的學習進度。

#### Schema
```prisma
model UserWordProgress {
  id        String   @id @default(cuid())
  userId    String
  wordId    String
  
  // ===== SRS 核心參數 =====
  memoryStrength  Int      @default(0)    // 記憶強度 (0-100)
  easeFactor      Float    @default(2.5)  // 難度係數 (1.3-2.5)
  interval        Int      @default(1)    // 複習間隔 (天數)
  repetitions     Int      @default(0)    // 連續正確次數
  
  // ===== 時間戳 =====
  firstLearnedAt  DateTime @default(now())
  lastReviewedAt  DateTime @default(now())
  nextReviewAt    DateTime @default(now())
  
  // ===== 統計數據 =====
  totalReviews     Int     @default(0)
  correctReviews   Int     @default(0)
  incorrectReviews Int     @default(0)
  
  // ===== 學習狀態 =====
  status          String   @default("NEW")  // NEW, LEARNING, REVIEWING, MASTERED
  
  // ===== 關聯 =====
  user            User     @relation(fields: [userId], references: [id])
  word            VocabularyItem @relation(fields: [wordId], references: [id])
  
  @@unique([userId, wordId])
  @@index([userId, nextReviewAt])
  @@index([userId, status])
}
```

#### 字段說明

**memoryStrength** (記憶強度)
- 範圍: 0-100
- 0 = 完全忘記
- 100 = 完全記住
- 每次答對 +10
- 每次答錯 -20

**easeFactor** (難度係數)
- 範圍: 1.3-2.5
- 預設: 2.5
- 越高 = 越容易記住
- 每次答對 +0.1
- 每次答錯 -0.2

**interval** (複習間隔)
- 單位: 天數
- 預設: 1
- 第 1 次答對: 1 天
- 第 2 次答對: 6 天
- 第 3+ 次答對: interval × easeFactor

**repetitions** (連續正確次數)
- 範圍: 0-∞
- 答對 +1
- 答錯重置為 0
- ≥ 5 且 memoryStrength ≥ 80 = MASTERED

**status** (學習狀態)
- NEW: 從未學過
- LEARNING: 正在學習 (repetitions = 0)
- REVIEWING: 正在複習 (repetitions > 0)
- MASTERED: 已掌握 (repetitions ≥ 5, memoryStrength ≥ 80)

---

### 2. LearningSession 表

#### 用途
記錄每次學習會話的統計數據。

#### Schema
```prisma
model LearningSession {
  id              String   @id @default(cuid())
  userId          String
  geptLevel       String   // elementary, intermediate, high-intermediate
  
  // ===== 會話數據 =====
  startedAt       DateTime @default(now())
  completedAt     DateTime?
  duration        Int?     // 秒數
  
  // ===== 單字統計 =====
  newWordsCount   Int      @default(0)
  reviewWordsCount Int     @default(0)
  totalWords      Int      @default(0)
  
  // ===== 正確率 =====
  correctAnswers  Int      @default(0)
  totalAnswers    Int      @default(0)
  accuracy        Float?   // 正確率 (0-100)
  
  // ===== 關聯 =====
  user            User     @relation(fields: [userId], references: [id])
  wordReviews     WordReview[]
  
  @@index([userId, startedAt])
}
```

---

### 3. WordReview 表

#### 用途
記錄每個單字的每次複習詳情。

#### Schema
```prisma
model WordReview {
  id              String   @id @default(cuid())
  sessionId       String
  wordId          String
  
  // ===== 複習數據 =====
  isCorrect       Boolean
  responseTime    Int      // 毫秒
  reviewedAt      DateTime @default(now())
  
  // ===== SRS 更新前後 =====
  memoryStrengthBefore  Int
  memoryStrengthAfter   Int
  intervalBefore        Int
  intervalAfter         Int
  
  // ===== 關聯 =====
  session         LearningSession @relation(fields: [sessionId], references: [id])
  word            VocabularyItem  @relation(fields: [wordId], references: [id])
  
  @@index([sessionId])
  @@index([wordId])
}
```

---

## 後端 API 實施

### API 端點列表

| 端點 | 方法 | 用途 |
|------|------|------|
| `/api/srs/words-to-review` | GET | 獲取需要複習的單字 |
| `/api/srs/update-progress` | POST | 更新學習進度 |
| `/api/srs/sessions` | POST | 創建學習會話 |
| `/api/srs/sessions/[id]` | PATCH | 完成學習會話 |
| `/api/srs/statistics` | GET | 獲取學習統計 |

---

### 1. GET /api/srs/words-to-review

#### 用途
獲取需要學習的單字 (新單字 + 複習單字)。

#### 請求參數
```typescript
interface WordsToReviewRequest {
  userId: string;
  geptLevel: 'elementary' | 'intermediate' | 'high-intermediate';
  count?: number;  // 預設 15
}
```

#### 響應格式
```typescript
interface WordsToReviewResponse {
  newWords: VocabularyItem[];      // 新單字 (5 個)
  reviewWords: VocabularyItem[];   // 複習單字 (10 個)
  statistics: {
    totalWords: number;
    learnedWords: number;
    masteredWords: number;
    dueForReview: number;
  };
}
```

#### 實現邏輯
```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const geptLevel = searchParams.get('geptLevel');
  const count = parseInt(searchParams.get('count') || '15');
  
  // 1. 獲取該等級的所有單字
  const allWords = await prisma.vocabularyItem.findMany({
    where: { geptLevel }
  });
  
  // 2. 獲取用戶的學習記錄
  const userProgress = await prisma.userWordProgress.findMany({
    where: { userId }
  });
  
  // 3. 分類單字
  const learnedWordIds = new Set(userProgress.map(p => p.wordId));
  const newWords = allWords.filter(w => !learnedWordIds.has(w.id));
  
  // 4. 選擇需要複習的單字
  const now = new Date();
  const dueWords = userProgress.filter(p => 
    p.nextReviewAt <= now && p.status !== 'MASTERED'
  );
  
  // 5. 按優先級排序
  const sortedDueWords = dueWords.sort((a, b) => {
    return calculatePriority(b) - calculatePriority(a);
  });
  
  // 6. 選擇單字
  const selectedNewWords = newWords.slice(0, 5);
  const selectedReviewWords = sortedDueWords.slice(0, 10);
  
  return NextResponse.json({
    newWords: selectedNewWords,
    reviewWords: selectedReviewWords,
    statistics: {
      totalWords: allWords.length,
      learnedWords: learnedWordIds.size,
      masteredWords: userProgress.filter(p => p.status === 'MASTERED').length,
      dueForReview: dueWords.length
    }
  });
}

function calculatePriority(progress: UserWordProgress): number {
  const now = Date.now();
  const overdueDays = (now - progress.nextReviewAt.getTime()) / (1000 * 60 * 60 * 24);
  const memoryScore = 100 - progress.memoryStrength;
  const errorRate = progress.incorrectReviews / (progress.totalReviews || 1);
  
  return (
    overdueDays * 10 +      // 過期時間權重
    memoryScore * 5 +       // 記憶強度權重
    errorRate * 100         // 錯誤率權重
  );
}
```

---

### 2. POST /api/srs/update-progress

#### 用途
更新單字的學習進度 (使用 SM-2 算法)。

#### 請求格式
```typescript
interface UpdateProgressRequest {
  userId: string;
  wordId: string;
  isCorrect: boolean;
  responseTime: number;  // 毫秒
  sessionId?: string;
}
```

#### 響應格式
```typescript
interface UpdateProgressResponse {
  success: boolean;
  progress: UserWordProgress;
  nextReviewAt: Date;
}
```

#### 實現邏輯
```typescript
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, wordId, isCorrect, responseTime, sessionId } = body;
  
  // 1. 獲取或創建學習記錄
  let progress = await prisma.userWordProgress.findUnique({
    where: { userId_wordId: { userId, wordId } }
  });
  
  if (!progress) {
    progress = await prisma.userWordProgress.create({
      data: {
        userId,
        wordId,
        status: 'NEW'
      }
    });
  }
  
  // 2. 保存更新前的數據
  const before = {
    memoryStrength: progress.memoryStrength,
    interval: progress.interval
  };
  
  // 3. 使用 SuperMemo SM-2 算法更新
  const updated = updateWithSM2(progress, isCorrect);
  
  // 4. 保存到資料庫
  const savedProgress = await prisma.userWordProgress.update({
    where: { id: progress.id },
    data: updated
  });
  
  // 5. 記錄複習歷史
  if (sessionId) {
    await prisma.wordReview.create({
      data: {
        sessionId,
        wordId,
        isCorrect,
        responseTime,
        memoryStrengthBefore: before.memoryStrength,
        memoryStrengthAfter: updated.memoryStrength,
        intervalBefore: before.interval,
        intervalAfter: updated.interval
      }
    });
  }
  
  return NextResponse.json({
    success: true,
    progress: savedProgress,
    nextReviewAt: savedProgress.nextReviewAt
  });
}
```

---

## 前端整合

### 1. 學習模式選擇頁面

#### 文件位置
`app/learn/page.tsx`

#### 功能
- 顯示學習統計
- 選擇 GEPT 等級
- 開始學習會話

#### 實現
```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LearnPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchStatistics();
  }, []);
  
  async function fetchStatistics() {
    try {
      const response = await fetch('/api/srs/statistics');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('獲取統計失敗:', error);
    } finally {
      setLoading(false);
    }
  }
  
  function startLearning(geptLevel: string) {
    router.push(`/learn/session?geptLevel=${geptLevel}`);
  }
  
  if (loading) return <div>載入中...</div>;
  
  return (
    <div className="learn-page">
      <h1>開始學習</h1>
      
      {/* 統計卡片 */}
      <div className="statistics-cards">
        <StatCard
          title="已學單字"
          value={stats.overview.learnedWords}
          total={stats.overview.totalWords}
          icon="📚"
        />
        <StatCard
          title="今日複習"
          value={stats.overview.dueForReview}
          icon="🔄"
        />
        <StatCard
          title="連續天數"
          value={stats.streakDays}
          icon="🔥"
        />
      </div>
      
      {/* GEPT 等級選擇 */}
      <div className="level-selection">
        <LevelCard
          level="elementary"
          title="GEPT 初級"
          description="基礎 1000 字"
          progress={stats.progress.find(p => p.level === 'elementary')?.percentage}
          onClick={() => startLearning('elementary')}
        />
        <LevelCard
          level="intermediate"
          title="GEPT 中級"
          description="進階 2000 字"
          progress={stats.progress.find(p => p.level === 'intermediate')?.percentage}
          onClick={() => startLearning('intermediate')}
        />
        <LevelCard
          level="high-intermediate"
          title="GEPT 中高級"
          description="高級 3000 字"
          progress={stats.progress.find(p => p.level === 'high-intermediate')?.percentage}
          onClick={() => startLearning('high-intermediate')}
        />
      </div>
    </div>
  );
}
```

---

## Phaser 3 遊戲整合

### 文件結構
```
public/games/shimozurdo-game/
├── utils/
│   └── sm2.js (新增)
├── managers/
│   ├── SRSManager.js (新增)
│   └── GEPTManager.js (修改)
└── scenes/
    ├── preload.js (修改)
    └── title.js (修改)
```

### 實施步驟

#### Step 1: 創建 SM-2 工具類
創建 `public/games/shimozurdo-game/utils/sm2.js`
詳見 `docs/PHASER3_SRS_INTEGRATION_GUIDE.md`

#### Step 2: 創建 SRS 管理器
創建 `public/games/shimozurdo-game/managers/SRSManager.js`
詳見 `docs/PHASER3_SRS_INTEGRATION_GUIDE.md`

#### Step 3: 修改 Preload Scene
修改 `public/games/shimozurdo-game/scenes/preload.js`
詳見 `docs/PHASER3_SRS_INTEGRATION_GUIDE.md`

#### Step 4: 修改遊戲場景
修改 `public/games/shimozurdo-game/scenes/title.js`
詳見 `docs/PHASER3_SRS_INTEGRATION_GUIDE.md`

---

## 測試計畫

### 單元測試
- SM-2 算法測試
- 單字選擇邏輯測試
- 優先級計算測試

### 整合測試
- API 端點測試
- 資料庫操作測試
- 遊戲整合測試

### E2E 測試
- 完整學習流程測試
- 複習流程測試
- 統計顯示測試

---

## 部署流程

### Phase 1: 資料庫 Migration
```bash
npx prisma migrate dev --name add_srs_tables
```

### Phase 2: 部署後端 API
```bash
git add .
git commit -m "feat: Add SRS system"
git push origin master
```

### Phase 3: 驗證部署
- 測試 API 端點
- 測試遊戲整合
- 測試統計頁面

---

## 時間估算

| 階段 | 任務 | 時間 |
|------|------|------|
| Phase 1 | 資料庫設計和 Migration | 1-2 天 |
| Phase 2 | 後端 API 開發 | 2-3 天 |
| Phase 3 | SM-2 算法實現 | 1-2 天 |
| Phase 4 | 前端頁面開發 | 2-3 天 |
| Phase 5 | Phaser 3 整合 | 2-3 天 |
| Phase 6 | 測試和優化 | 2-3 天 |
| **總計** | | **10-16 天** |

---

## 下一步

1. ✅ 審查此文檔
2. ✅ 確認技術方案
3. ✅ 開始 Phase 1 實施
4. ✅ 定期檢查進度
5. ✅ 測試和部署

