# 🏗️ EduCreate 架構簡化執行計劃

## 📋 **執行概述**

**目標**：將 Activity + VocabularySet 雙表架構簡化為單表架構
**預期效果**：消除數據重複、統一 ID 系統、簡化查詢邏輯
**風險等級**：中等（需要數據遷移）
**預估時間**：2-3 小時

## 🎯 **Phase 1: 準備和分析階段**

### 1.1 當前架構分析
```sql
-- 當前問題架構
Activity {
  id, title, description, userId
  content: { vocabularySetId: "xxx" }  -- JSON 關聯
}

VocabularySet {
  id, title, description, userId       -- 重複字段
  geptLevel, totalWords
}

VocabularyItem {
  setId -> VocabularySet.id            -- 間接關聯
}
```

### 1.2 目標架構設計
```sql
-- 簡化後架構
Activity {
  id, title, description, userId
  geptLevel, totalWords               -- 從 VocabularySet 合併
  -- 移除 content.vocabularySetId
}

VocabularyItem {
  activityId -> Activity.id           -- 直接關聯
  -- 移除 setId
}

-- 完全移除 VocabularySet 表
```

### 1.3 數據備份策略
```bash
# 1. 創建數據庫備份
pg_dump $DATABASE_URL > backup_before_migration_$(date +%Y%m%d_%H%M%S).sql

# 2. 導出關鍵數據
SELECT * FROM activities INTO OUTFILE 'activities_backup.csv';
SELECT * FROM vocabulary_sets INTO OUTFILE 'vocabulary_sets_backup.csv';
SELECT * FROM vocabulary_items INTO OUTFILE 'vocabulary_items_backup.csv';
```

## 🔧 **Phase 2: 數據庫架構修改**

### 2.1 添加新字段到 Activity 表
```sql
-- 添加 VocabularySet 的字段到 Activity
ALTER TABLE activities 
ADD COLUMN gept_level VARCHAR(20) DEFAULT 'ELEMENTARY',
ADD COLUMN total_words INTEGER DEFAULT 0;
```

### 2.2 添加新字段到 VocabularyItem 表
```sql
-- 添加直接關聯到 Activity 的字段
ALTER TABLE vocabulary_items 
ADD COLUMN activity_id VARCHAR(255);

-- 創建索引提升查詢性能
CREATE INDEX idx_vocabulary_items_activity_id ON vocabulary_items(activity_id);
```

### 2.3 更新 Prisma Schema
```prisma
model Activity {
  id             String               @id @default(cuid())
  title          String
  description    String?
  content        Json?
  elements       Json                 @default("[]")
  type           String
  templateType   String?
  
  // 新增：從 VocabularySet 合併的字段
  geptLevel      GEPTLevel           @default(ELEMENTARY)
  totalWords     Int                 @default(0)
  
  // 現有字段...
  published      Boolean              @default(false)
  isPublic       Boolean              @default(false)
  userId         String
  createdAt      DateTime             @default(now())
  updatedAt      DateTime             @updatedAt
  
  // 關聯
  user           User                 @relation(fields: [userId], references: [id], onDelete: Cascade)
  vocabularyItems VocabularyItem[]    // 新增：直接關聯詞彙項目
  versions       ActivityVersion[]
  versionLogs    ActivityVersionLog[]
  gameSettings   GameSettings?
}

model VocabularyItem {
  id               String             @id @default(cuid())
  activityId       String             // 新增：直接關聯 Activity
  english          String
  chinese          String
  phonetic         String?
  partOfSpeech     PartOfSpeech?
  difficultyLevel  Int                @default(1)
  exampleSentence  String?
  notes            String?
  imageUrl         String?
  audioUrl         String?
  createdAt        DateTime           @default(now())
  updatedAt        DateTime           @updatedAt
  
  // 關聯
  activity         Activity           @relation(fields: [activityId], references: [id], onDelete: Cascade)
  learningProgress LearningProgress[]

  @@map("vocabulary_items")
}

// 移除 VocabularySet model
```

## 📊 **Phase 3: 數據遷移腳本**

### 3.1 遷移 VocabularySet 數據到 Activity
```sql
-- 更新 Activity 表，合併 VocabularySet 數據
UPDATE activities 
SET 
  gept_level = vs.gept_level,
  total_words = vs.total_words
FROM vocabulary_sets vs
WHERE activities.content->>'vocabularySetId' = vs.id;
```

### 3.2 更新 VocabularyItem 關聯
```sql
-- 更新 VocabularyItem，建立與 Activity 的直接關聯
UPDATE vocabulary_items 
SET activity_id = (
  SELECT a.id 
  FROM activities a 
  WHERE a.content->>'vocabularySetId' = vocabulary_items.set_id
);
```

### 3.3 數據完整性驗證
```sql
-- 驗證遷移完整性
SELECT 
  COUNT(*) as total_activities,
  COUNT(CASE WHEN gept_level IS NOT NULL THEN 1 END) as activities_with_gept_level,
  COUNT(CASE WHEN total_words > 0 THEN 1 END) as activities_with_total_words
FROM activities;

SELECT 
  COUNT(*) as total_vocabulary_items,
  COUNT(CASE WHEN activity_id IS NOT NULL THEN 1 END) as items_with_activity_id
FROM vocabulary_items;
```

## 🔌 **Phase 4: API 更新**

### 4.1 更新 GET /api/activities
```typescript
// 簡化查詢 - 不再需要 JOIN VocabularySet
const activities = await prisma.activity.findMany({
  where: { userId: user.id },
  include: {
    vocabularyItems: true  // 直接包含詞彙項目
  },
  orderBy: { createdAt: 'desc' }
});

// 簡化響應格式
return activities.map(activity => ({
  id: activity.id,
  title: activity.title,
  description: activity.description,
  type: activity.type,
  createdAt: activity.createdAt,
  vocabularyInfo: {
    totalWords: activity.totalWords,
    geptLevel: activity.geptLevel
  }
}));
```

### 4.2 更新 DELETE /api/activities/[id]
```typescript
// 簡化刪除邏輯 - 只需要刪除 Activity（級聯刪除 VocabularyItem）
const deletedActivity = await prisma.activity.delete({
  where: { 
    id: activityId,
    userId: user.id 
  }
});
```

### 4.3 更新 POST /api/activities
```typescript
// 簡化創建邏輯 - 一次事務創建 Activity 和 VocabularyItem
const activity = await prisma.activity.create({
  data: {
    userId: user.id,
    title: title,
    description: description,
    type: type,
    templateType: templateType,
    geptLevel: 'ELEMENTARY',
    totalWords: vocabularyItems.length,
    vocabularyItems: {
      create: vocabularyItems.map(item => ({
        english: item.english,
        chinese: item.chinese,
        phonetic: item.phonetic,
        difficultyLevel: item.difficultyLevel || 1
      }))
    }
  },
  include: {
    vocabularyItems: true
  }
});
```

## 🎨 **Phase 5: 前端組件更新**

### 5.1 更新 WordwallStyleMyActivities.tsx
```typescript
// 統一使用 Activity.id
const handleDeleteActivity = async (activityId: string) => {
  const response = await fetch(`/api/activities/${activityId}`, {
    method: 'DELETE'
  });
  // 不再需要處理 VocabularySet ID 混亂問題
};
```

### 5.2 更新詞彙管理組件
```typescript
// 直接從 Activity 獲取詞彙信息
const loadActivityVocabulary = async (activityId: string) => {
  const response = await fetch(`/api/activities/${activityId}`);
  const activity = await response.json();
  return {
    geptLevel: activity.geptLevel,
    totalWords: activity.totalWords,
    items: activity.vocabularyItems
  };
};
```

## 🧪 **Phase 6: 測試和驗證**

### 6.1 功能測試清單
```bash
# 測試所有核心功能
□ 創建活動功能
□ 載入活動列表
□ 刪除活動功能
□ 編輯活動功能
□ 詞彙管理功能
□ 遊戲播放功能
```

### 6.2 性能測試
```sql
-- 查詢性能對比
EXPLAIN ANALYZE SELECT * FROM activities WHERE user_id = 'xxx';
EXPLAIN ANALYZE SELECT * FROM activities a JOIN vocabulary_items vi ON a.id = vi.activity_id WHERE a.user_id = 'xxx';
```

## 🚨 **風險控制和回滾計劃**

### 回滾策略
```sql
-- 如果遷移失敗，可以回滾到備份
psql $DATABASE_URL < backup_before_migration_YYYYMMDD_HHMMSS.sql
```

### 監控指標
- 數據完整性：確保所有 Activity 都有對應的詞彙數據
- 功能完整性：確保所有 API 端點正常工作
- 性能指標：查詢時間不應該增加

## ✅ **執行檢查清單**

### Phase 1 準備階段
□ 數據庫備份完成
□ 當前架構分析完成
□ 目標架構設計確認

### Phase 2 架構修改
□ Activity 表新字段添加
□ VocabularyItem 表新字段添加
□ Prisma Schema 更新

### Phase 3 數據遷移
□ VocabularySet 數據遷移到 Activity
□ VocabularyItem 關聯更新
□ 數據完整性驗證通過

### Phase 4 API 更新
□ GET /api/activities 更新
□ DELETE /api/activities/[id] 更新
□ POST /api/activities 更新

### Phase 5 前端更新
□ 活動列表組件更新
□ 詞彙管理組件更新
□ ID 系統統一

### Phase 6 測試驗證
□ 所有功能測試通過
□ 性能測試通過
□ E2E 測試通過

---

**準備開始執行？請確認是否開始 Phase 1！**
