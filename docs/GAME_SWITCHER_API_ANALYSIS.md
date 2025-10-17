# 遊戲頁面 API 分析報告

## 頁面 URL
`https://edu-create.vercel.app/games/switcher?game=shimozurdo-game&activityId=cmgtnaavg0001la04rz1hdr2y`

## API 種類總覽

遊戲頁面 (`app/games/switcher/page.tsx`) 使用了 **7 種不同的 API 端點**，根據不同的使用場景和用戶角色調用不同的 API。

---

## 1. 活動信息 API

### GET /api/activities/{activityId}
**用途**: 載入活動的基本信息和元數據

**調用時機**: 
- 頁面載入時
- 有 `activityId` 參數時

**返回數據**:
```typescript
{
  id: string;
  title: string;
  description?: string;
  templateType?: string;
  author?: {
    id: string;
    name: string;
    avatar?: string;
  };
  tags?: string[];
  category?: string;
  geptLevel?: string;
  createdAt: string;
  participantCount?: number;
  deadline?: string;
}
```

**使用場景**:
- 顯示活動標題
- 顯示活動元數據（作者、標籤、分類、GEPT 等級）
- EnhancedActivityInfoBox 組件

**代碼位置**: `app/games/switcher/page.tsx` 第 294 行

---

## 2. 活動詞彙 API（教師模式）

### GET /api/activities/{activityId}/vocabulary
**用途**: 載入活動的詞彙數據（需要身份驗證）

**調用時機**:
- 教師訪問自己的活動
- 沒有 `shareToken` 或 `assignmentId` 參數

**返回數據**:
```typescript
{
  vocabularyItems: Array<{
    id?: string;
    english: string;
    chinese: string;
    phonetic?: string;
  }>
}
```

**使用場景**:
- 教師預覽自己的活動
- 教師測試遊戲
- 編輯模式

**權限要求**: 需要登入，且活動屬於當前用戶

**代碼位置**: `app/games/switcher/page.tsx` 第 412 行

---

## 3. 分享遊戲 API（社區模式）

### GET /api/share/{activityId}/{shareToken}
**用途**: 載入公開分享的活動詞彙（無需身份驗證）

**調用時機**:
- URL 包含 `isShared=true` 和 `shareToken` 參數
- 社區分享的活動

**返回數據**:
```typescript
{
  activity: {
    id: string;
    title: string;
    vocabularyItems: Array<{
      english: string;
      chinese: string;
      phonetic?: string;
    }>
  }
}
```

**使用場景**:
- 社區用戶訪問分享的活動
- 公開遊戲連結
- 無需登入即可遊戲

**權限要求**: 無需登入，但需要有效的 `shareToken`

**代碼位置**: `app/games/switcher/page.tsx` 第 432 行

---

## 4. 學生遊戲 API（課業模式）

### GET /api/play/{activityId}/{assignmentId}
**用途**: 載入課業分配的活動詞彙（無需身份驗證）

**調用時機**:
- URL 包含 `assignmentId` 參數
- 學生訪問課業分配

**返回數據**:
```typescript
{
  success: boolean;
  activity: {
    id: string;
    title: string;
    description?: string;
    type: string;
    vocabularyItems: Array<{
      english: string;
      chinese: string;
      phonetic?: string;
    }>;
    totalWords: number;
    geptLevel?: string;
  };
  assignment: {
    id: string;
    activityId: string;
    title: string;
    registrationType: 'name' | 'anonymous' | 'google-classroom';
    deadline?: string;
    status: string;
  }
}
```

**使用場景**:
- 學生訪問課業分配
- 匿名模式遊戲
- 姓名模式遊戲

**權限要求**: 無需登入，但需要有效的 `assignmentId`

**代碼位置**: `app/games/switcher/page.tsx` 第 452 行

---

## 5. 排行榜 API

### GET /api/leaderboard/{assignmentId}
**用途**: 載入課業分配的排行榜數據

**調用時機**:
- 學生遊戲模式（有 `assignmentId`）
- 頁面載入時自動調用

**返回數據**:
```typescript
{
  success: boolean;
  leaderboard: Array<{
    id: string;
    studentName: string;
    score: number;
    completedAt: string;
    rank: number;
  }>
}
```

**使用場景**:
- 顯示學生排行榜
- 學生查看自己的排名
- 教師查看學生成績

**權限要求**: 無需登入

**代碼位置**: `app/games/switcher/page.tsx` 第 337 行

---

## 6. 創建課業分配 API

### POST /api/assignments
**用途**: 創建新的課業分配

**調用時機**:
- 教師點擊「課業分配」按鈕
- 在 AssignmentModal 中設定參數後

**請求數據**:
```typescript
{
  activityId: string;
  title: string;
  registrationType: 'NAME' | 'ANONYMOUS' | 'GOOGLE';
  deadline?: string;
  gameEndSettings: {
    showAnswers: boolean;
    showLeaderboard: boolean;
    allowRestart: boolean;
  }
}
```

**返回數據**:
```typescript
{
  success: boolean;
  assignment: {
    id: string;
    activityId: string;
    title: string;
    registrationType: string;
    deadline?: string;
    status: string;
    createdAt: string;
  };
  result: {
    id: string;
    resultNumber: number;
    status: string;
  }
}
```

**使用場景**:
- 教師創建課業分配
- 生成學生分享連結
- 設定課業參數

**權限要求**: 需要登入，且活動屬於當前用戶

**代碼位置**: `app/games/switcher/page.tsx` 第 255 行

---

## 7. 刪除活動 API

### DELETE /api/activities/{activityId}
**用途**: 刪除活動

**調用時機**:
- 教師點擊刪除按鈕
- 確認刪除後

**返回數據**:
```typescript
{
  success: boolean;
  message: string;
}
```

**使用場景**:
- 教師刪除自己的活動
- 活動管理

**權限要求**: 需要登入，且活動屬於當前用戶

**代碼位置**: `app/games/switcher/page.tsx` 第 189 行

---

## API 調用流程圖

```
頁面載入
  ↓
檢查 URL 參數
  ↓
┌─────────────────────────────────────────┐
│ 1. 載入活動信息                          │
│    GET /api/activities/{activityId}     │
└─────────────────────────────────────────┘
  ↓
判斷模式
  ↓
┌──────────────┬──────────────┬──────────────┐
│ 學生模式      │ 社區模式      │ 教師模式      │
│ (assignmentId)│ (shareToken) │ (正常)       │
└──────────────┴──────────────┴──────────────┘
  ↓              ↓              ↓
┌──────────────┐┌──────────────┐┌──────────────┐
│ 2. 載入詞彙   ││ 3. 載入詞彙   ││ 4. 載入詞彙   │
│ GET /api/play││ GET /api/    ││ GET /api/    │
│ /{id}/{aid}  ││ share/{id}/  ││ activities/  │
│              ││ {token}      ││ {id}/vocab   │
└──────────────┘└──────────────┘└──────────────┘
  ↓
  ↓ (如果是學生模式)
┌──────────────┐
│ 5. 載入排行榜 │
│ GET /api/    │
│ leaderboard/ │
│ {aid}        │
└──────────────┘
```

---

## API 使用統計

| API 端點 | 調用頻率 | 權限要求 | 主要用途 |
|---------|---------|---------|---------|
| GET /api/activities/{id} | 每次頁面載入 | 無 | 載入活動信息 |
| GET /api/activities/{id}/vocabulary | 教師模式 | 需要登入 | 載入詞彙（教師） |
| GET /api/share/{id}/{token} | 社區模式 | 無 | 載入詞彙（社區） |
| GET /api/play/{id}/{aid} | 學生模式 | 無 | 載入詞彙（學生） |
| GET /api/leaderboard/{aid} | 學生模式 | 無 | 載入排行榜 |
| POST /api/assignments | 創建課業時 | 需要登入 | 創建課業分配 |
| DELETE /api/activities/{id} | 刪除活動時 | 需要登入 | 刪除活動 |

---

## 模式判斷邏輯

```typescript
// 1. 學生遊戲模式（優先級最高）
if (assignmentId) {
  loadStudentVocabulary(activityId, assignmentId);
  loadLeaderboard(assignmentId);
}
// 2. 社區分享模式
else if (isShared === 'true' && shareToken) {
  loadSharedVocabulary(activityId, shareToken);
}
// 3. 正常模式（教師模式）
else {
  loadCustomVocabulary(activityId);
}
```

---

## 總結

遊戲頁面使用了 **7 種不同的 API**，根據不同的使用場景和用戶角色調用不同的 API：

1. **活動信息 API** - 所有模式都使用
2. **活動詞彙 API** - 教師模式專用
3. **分享遊戲 API** - 社區模式專用
4. **學生遊戲 API** - 課業模式專用
5. **排行榜 API** - 課業模式專用
6. **創建課業分配 API** - 教師創建課業時使用
7. **刪除活動 API** - 教師刪除活動時使用

這種設計確保了：
- ✅ 不同用戶角色有不同的權限
- ✅ 學生無需登入即可遊戲
- ✅ 教師可以管理自己的活動
- ✅ 社區用戶可以訪問公開分享的活動
- ✅ 數據安全和隱私保護

