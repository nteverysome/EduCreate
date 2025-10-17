# EduCreate API 完整文檔

## 概述

本文檔詳細說明 EduCreate 平台的 8 種主要 API 端點，包括用途、權限要求、使用場景和請求/響應格式。

---

## API 列表

| # | API 端點 | 用途 | 需要登入 | 使用場景 |
|---|---------|------|---------|---------|
| 1 | GET /api/activities/{activityId} | 載入活動信息和元數據 | ❌ 否 | 所有模式 |
| 2 | GET /api/activities/{activityId}/vocabulary | 載入活動詞彙（教師模式） | ✅ 是 | 教師預覽和測試 |
| 3 | GET /api/share/{activityId}/{shareToken} | 載入公開分享的活動詞彙 | ❌ 否 | 社區分享模式 |
| 4 | **GET /api/play/{activityId}/{assignmentId}** | **載入課業分配的活動詞彙** | ❌ 否 | **學生遊戲模式** |
| 5 | GET /api/leaderboard/{assignmentId} | 載入排行榜數據 | ❌ 否 | 學生遊戲模式 |
| 6 | POST /api/assignments | 創建課業分配 | ✅ 是 | 教師創建課業 |
| 7 | DELETE /api/activities/{activityId} | 刪除活動 | ✅ 是 | 教師刪除活動 |
| 8 | **POST /api/results** | **學生提交遊戲結果** | ❌ 否 | **學生遊戲模式** |

---

## 1. GET /api/activities/{activityId}

### 用途
載入活動的基本信息和元數據（不包含詞彙數據）。

### 權限
- ❌ **無需登入**
- 任何人都可以訪問

### 使用場景
- 所有模式都使用此 API 載入活動基本信息
- 教師預覽活動
- 學生查看活動詳情
- 社區分享頁面

### 請求格式
```http
GET /api/activities/{activityId}
```

### 響應格式
```json
{
  "id": "cmgtnaavg0001la04rz1hdr2y",
  "title": "測試",
  "description": "使用 shimozurdo-game 遊戲學習詞彙",
  "gameType": "shimozurdo-game",
  "category": "教育",
  "geptLevel": "ELEMENTARY",
  "tags": ["shimozurdo-game", "vocabulary", "learning"],
  "createdAt": "2025-10-17T00:00:00.000Z",
  "updatedAt": "2025-10-17T00:00:00.000Z",
  "userId": "user123",
  "isPublic": false,
  "shareToken": null
}
```

### 代碼位置
- **文件**: `app/api/activities/[activityId]/route.ts`
- **方法**: GET

---

## 2. GET /api/activities/{activityId}/vocabulary

### 用途
載入活動的詞彙數據（教師模式）。

### 權限
- ✅ **需要登入**
- 只有活動的創建者（教師）可以訪問

### 使用場景
- 教師預覽自己創建的活動
- 教師測試遊戲
- 教師編輯活動時載入詞彙

### 請求格式
```http
GET /api/activities/{activityId}/vocabulary
Authorization: Bearer {session_token}
```

### 響應格式
```json
{
  "success": true,
  "vocabularyItems": [
    {
      "id": "vocab1",
      "english": "apple",
      "chinese": "蘋果",
      "phonetic": "ˈæp.əl"
    },
    {
      "id": "vocab2",
      "english": "banana",
      "chinese": "香蕉",
      "phonetic": "bəˈnæn.ə"
    }
  ]
}
```

### 錯誤響應
```json
{
  "error": "未授權",
  "message": "您沒有權限訪問此活動"
}
```

### 代碼位置
- **文件**: `app/api/activities/[activityId]/vocabulary/route.ts`
- **方法**: GET

---

## 3. GET /api/share/{activityId}/{shareToken}

### 用途
載入公開分享的活動詞彙（無需登入）。

### 權限
- ❌ **無需登入**
- 需要有效的 `shareToken`

### 使用場景
- 社區分享模式
- 教師分享活動給其他教師
- 公開遊戲連結

### 請求格式
```http
GET /api/share/{activityId}/{shareToken}
```

### 響應格式
```json
{
  "success": true,
  "activity": {
    "id": "cmgtnaavg0001la04rz1hdr2y",
    "title": "測試",
    "description": "使用 shimozurdo-game 遊戲學習詞彙",
    "gameType": "shimozurdo-game"
  },
  "vocabularyItems": [
    {
      "english": "apple",
      "chinese": "蘋果",
      "phonetic": "ˈæp.əl"
    }
  ]
}
```

### 錯誤響應
```json
{
  "error": "無效的分享連結",
  "message": "此活動不存在或分享連結已過期"
}
```

### 代碼位置
- **文件**: `app/api/share/[activityId]/[shareToken]/route.ts`
- **方法**: GET

---

## 4. GET /api/play/{activityId}/{assignmentId}

### 用途
載入課業分配的活動詞彙（學生遊戲模式）。

### 權限
- ❌ **無需登入**
- 需要有效的 `assignmentId`

### 使用場景
- **學生遊戲模式**（最重要的 API）
- 匿名模式：學生無需輸入姓名
- 姓名模式：學生需要輸入姓名

### 請求格式
```http
GET /api/play/{activityId}/{assignmentId}
```

### 響應格式
```json
{
  "success": true,
  "activity": {
    "id": "cmgtnaavg0001la04rz1hdr2y",
    "title": "測試",
    "description": "使用 shimozurdo-game 遊戲學習詞彙",
    "gameType": "shimozurdo-game"
  },
  "assignment": {
    "id": "cmgup37120001jo04f3qkarm8",
    "title": "第一週作業",
    "registrationType": "name",
    "deadline": "2025-10-24T23:59:59.000Z",
    "status": "active"
  },
  "vocabularyItems": [
    {
      "english": "apple",
      "chinese": "蘋果",
      "phonetic": "ˈæp.əl"
    }
  ]
}
```

### 註冊類型說明

#### registrationType: "name"（姓名模式）
- 學生必須輸入姓名才能開始遊戲
- 遊戲結束後，成績會被記錄到數據庫
- 教師可以在 `/my-results` 查看學生成績

#### registrationType: "anonymous"（匿名模式）
- 學生無需輸入姓名，直接開始遊戲
- 遊戲結束後，成績**不會**被記錄
- 教師無法查看個人成績

### 錯誤響應
```json
{
  "error": "課業分配不存在",
  "message": "此課業分配已過期或不存在"
}
```

### 代碼位置
- **文件**: `app/api/play/[activityId]/[assignmentId]/route.ts`
- **方法**: GET

---

## 5. GET /api/leaderboard/{assignmentId}

### 用途
載入課業分配的排行榜數據。

### 權限
- ❌ **無需登入**
- 需要有效的 `assignmentId`

### 使用場景
- 學生遊戲模式
- 顯示其他學生的成績排名
- 激勵學生競爭

### 請求格式
```http
GET /api/leaderboard/{assignmentId}
```

### 響應格式
```json
{
  "success": true,
  "assignmentId": "cmgup37120001jo04f3qkarm8",
  "totalParticipants": 15,
  "topScore": 95,
  "leaderboard": [
    {
      "rank": 1,
      "studentName": "張三",
      "score": 95,
      "timeSpent": 120,
      "correctAnswers": 9,
      "totalQuestions": 10,
      "completedAt": "2025-10-17T10:30:00.000Z"
    },
    {
      "rank": 2,
      "studentName": "李四",
      "score": 90,
      "timeSpent": 135,
      "correctAnswers": 9,
      "totalQuestions": 10,
      "completedAt": "2025-10-17T11:00:00.000Z"
    }
  ]
}
```

### 代碼位置
- **文件**: `app/api/leaderboard/[assignmentId]/route.ts`
- **方法**: GET

---

## 6. POST /api/assignments

### 用途
創建新的課業分配。

### 權限
- ✅ **需要登入**
- 只有教師可以創建課業分配

### 使用場景
- 教師創建課業分配
- 設定註冊類型（姓名/匿名）
- 設定截止日期
- 自定義結果標題

### 請求格式
```http
POST /api/assignments
Authorization: Bearer {session_token}
Content-Type: application/json

{
  "activityId": "cmgtnaavg0001la04rz1hdr2y",
  "title": "第一週作業",
  "registrationType": "name",
  "deadline": "2025-10-24T23:59:59.000Z",
  "customTitle": "第一週英文單字測驗"
}
```

### 請求參數說明

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| activityId | string | ✅ | 活動 ID |
| title | string | ✅ | 課業分配標題 |
| registrationType | string | ✅ | 註冊類型：`"name"` 或 `"anonymous"` |
| deadline | string | ❌ | 截止日期（ISO 8601 格式） |
| customTitle | string | ❌ | 自定義結果標題 |

### 響應格式
```json
{
  "success": true,
  "assignment": {
    "id": "cmgup37120001jo04f3qkarm8",
    "activityId": "cmgtnaavg0001la04rz1hdr2y",
    "title": "第一週作業",
    "registrationType": "name",
    "deadline": "2025-10-24T23:59:59.000Z",
    "status": "active",
    "createdAt": "2025-10-17T00:00:00.000Z"
  },
  "result": {
    "id": "cmgup372k0003jo04qjh035cl",
    "assignmentId": "cmgup37120001jo04f3qkarm8",
    "customTitle": "第一週英文單字測驗",
    "createdAt": "2025-10-17T00:00:00.000Z"
  },
  "playUrl": "https://edu-create.vercel.app/play/cmgtnaavg0001la04rz1hdr2y/cmgup37120001jo04f3qkarm8"
}
```

### 錯誤響應
```json
{
  "error": "未授權",
  "message": "您必須登入才能創建課業分配"
}
```

### 代碼位置
- **文件**: `app/api/assignments/route.ts`
- **方法**: POST

---

## 7. DELETE /api/activities/{activityId}

### 用途
刪除活動及其相關數據。

### 權限
- ✅ **需要登入**
- 只有活動的創建者（教師）可以刪除

### 使用場景
- 教師刪除自己創建的活動
- 清理不需要的活動

### 請求格式
```http
DELETE /api/activities/{activityId}
Authorization: Bearer {session_token}
```

### 響應格式
```json
{
  "success": true,
  "message": "活動已成功刪除"
}
```

### 錯誤響應
```json
{
  "error": "未授權",
  "message": "您沒有權限刪除此活動"
}
```

### 代碼位置
- **文件**: `app/api/activities/[activityId]/route.ts`
- **方法**: DELETE

---

## 8. POST /api/results

### 用途
學生提交遊戲結果（最重要的 API 之一）。

### 權限
- ❌ **無需登入**
- 只需要有效的 `assignmentId` 和 `activityId`

### 使用場景
- 學生完成遊戲後自動提交成績
- 姓名模式：記錄學生成績
- 匿名模式：不調用此 API

### 請求格式
```http
POST /api/results
Content-Type: application/json

{
  "assignmentId": "cmgup37120001jo04f3qkarm8",
  "activityId": "cmgtnaavg0001la04rz1hdr2y",
  "studentName": "張三",
  "score": 85,
  "timeSpent": 120,
  "correctAnswers": 8,
  "totalQuestions": 10,
  "gameData": {
    "level": 1,
    "lives": 3,
    "timestamp": 1760699614679
  }
}
```

### 請求參數說明

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| assignmentId | string | ✅ | 課業分配 ID |
| activityId | string | ✅ | 活動 ID |
| studentName | string | ✅ | 學生姓名 |
| score | number | ✅ | 分數 |
| timeSpent | number | ✅ | 遊戲時間（秒） |
| correctAnswers | number | ✅ | 正確答案數 |
| totalQuestions | number | ✅ | 總題目數 |
| gameData | object | ❌ | 遊戲詳細數據 |

### 響應格式
```json
{
  "success": true,
  "resultId": "cmgup372k0003jo04qjh035cl",
  "participantId": "cmgur3t2o0001jm049wg317ty",
  "message": "結果記錄成功"
}
```

### 錯誤響應
```json
{
  "error": "缺少必要參數",
  "message": "assignmentId, activityId, studentName 為必填項"
}
```

### 代碼位置
- **文件**: `app/api/results/route.ts`
- **方法**: POST

---

## 使用流程圖

### 教師創建課業分配流程
```
1. 教師登入
   ↓
2. 訪問 /my-activities
   ↓
3. 點擊「課業分配」按鈕
   ↓
4. 設定課業參數（註冊類型、截止日期、自定義標題）
   ↓
5. POST /api/assignments
   ↓
6. 獲得課業分配連結
   ↓
7. 分享連結給學生
```

### 學生遊戲流程（姓名模式）
```
1. 學生訪問課業分配連結
   /play/{activityId}/{assignmentId}
   ↓
2. GET /api/play/{activityId}/{assignmentId}
   載入活動和課業數據
   ↓
3. 輸入學生姓名
   ↓
4. 跳轉到遊戲頁面
   /games/switcher?game=...&assignmentId=...&studentName=...
   ↓
5. GET /api/leaderboard/{assignmentId}
   載入排行榜
   ↓
6. 開始遊戲
   ↓
7. 完成遊戲
   ↓
8. POST /api/results
   提交成績
   ↓
9. 顯示遊戲結束畫面
```

### 學生遊戲流程（匿名模式）
```
1. 學生訪問課業分配連結
   /play/{activityId}/{assignmentId}
   ↓
2. GET /api/play/{activityId}/{assignmentId}
   載入活動和課業數據
   ↓
3. 直接跳轉到遊戲頁面（無需輸入姓名）
   /games/switcher?game=...&assignmentId=...&anonymous=true
   ↓
4. GET /api/leaderboard/{assignmentId}
   載入排行榜
   ↓
5. 開始遊戲
   ↓
6. 完成遊戲
   ↓
7. ❌ 不提交成績（匿名模式）
   ↓
8. 顯示遊戲結束畫面
```

---

## 權限總結

### 無需登入的 API（學生可用）
- ✅ GET /api/activities/{activityId}
- ✅ GET /api/share/{activityId}/{shareToken}
- ✅ GET /api/play/{activityId}/{assignmentId}
- ✅ GET /api/leaderboard/{assignmentId}
- ✅ POST /api/results

### 需要登入的 API（教師專用）
- 🔒 GET /api/activities/{activityId}/vocabulary
- 🔒 POST /api/assignments
- 🔒 DELETE /api/activities/{activityId}

---

## 常見問題

### Q1: 為什麼學生不需要登入就能提交成績？
**A**: 這是設計決策，目的是降低學生的使用門檻。學生只需要有課業分配連結就能玩遊戲和提交成績，無需註冊帳號。

### Q2: 匿名模式和姓名模式的主要區別是什麼？
**A**: 
- **匿名模式**: 不記錄個人成績，適合練習和試玩
- **姓名模式**: 記錄個人成績，適合正式考試和學習追蹤

### Q3: 教師如何查看學生的成績？
**A**: 教師登入後訪問 `/my-results/{resultId}` 頁面，可以看到所有學生的成績列表。

### Q4: 如果學生沒有完成遊戲，成績會被記錄嗎？
**A**: 不會。只有當學生完成遊戲並且遊戲調用 `submitGameResult()` 方法時，成績才會被提交到 `POST /api/results`。

### Q5: 課業分配的截止日期過期後，學生還能玩遊戲嗎？
**A**: 這取決於後端的實現。目前的設計允許學生在截止日期後繼續玩遊戲，但教師可以在結果頁面看到提交時間，判斷是否遲交。

---

## 更新日誌

### 2025-10-17
- ✅ 創建完整的 API 文檔
- ✅ 添加 POST /api/results 說明
- ✅ 詳細說明匿名模式和姓名模式的區別
- ✅ 添加使用流程圖
- ✅ 添加常見問題解答

---

## 相關文檔

- [遊戲頁面 API 分析報告](./GAME_SWITCHER_API_ANALYSIS.md)
- [增強版活動信息框實現報告](./ENHANCED_ACTIVITY_INFO_BOX_IMPLEMENTATION_REPORT.md)

---

**文檔維護者**: AI Assistant  
**最後更新**: 2025-10-17

