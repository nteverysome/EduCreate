# EduCreate 數據庫架構文檔

本文檔說明 EduCreate 專案的數據庫架構、分支策略和數據管理最佳實踐。

---

## 目錄

1. [架構概覽](#架構概覽)
2. [數據庫技術棧](#數據庫技術棧)
3. [分支策略](#分支策略)
4. [數據模型](#數據模型)
5. [連接管理](#連接管理)
6. [遷移策略](#遷移策略)
7. [備份和恢復](#備份和恢復)
8. [性能優化](#性能優化)

---

## 架構概覽

### 三層環境架構

```
┌─────────────────────────────────────────────────────────────┐
│                     應用層 (Vercel)                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Production App                                              │
│  ├─ Next.js 14.0.1                                          │
│  ├─ Prisma Client                                           │
│  └─ Connection Pool                                         │
│                                                              │
│  Preview App                                                 │
│  ├─ Next.js 14.0.1                                          │
│  ├─ Prisma Client                                           │
│  └─ Connection Pool                                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   數據庫層 (Neon)                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Production Branch                                           │
│  ├─ PostgreSQL 17                                           │
│  ├─ Compute: 1 ↔ 2 CU (Autoscaling)                        │
│  ├─ Storage: 50.03 MB                                       │
│  └─ Pooler: ep-curly-salad-a85exs3f-pooler                 │
│                                                              │
│  Preview Branch                                              │
│  ├─ PostgreSQL 17                                           │
│  ├─ Compute: 1 ↔ 2 CU (Autoscaling)                        │
│  ├─ Storage: 50.09 MB                                       │
│  └─ Pooler: ep-soft-resonance-a8hnscfv-pooler              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 數據庫技術棧

### 核心技術

| 技術 | 版本 | 用途 |
|------|------|------|
| **PostgreSQL** | 17 | 關係型數據庫 |
| **Neon** | Cloud | 數據庫託管平台 |
| **Prisma** | 6.9.0 | ORM 和數據庫工具 |
| **Next.js** | 14.0.1 | 應用框架 |

### Neon 特性

- **Serverless PostgreSQL**: 按需自動擴展
- **Database Branching**: Git-like 數據庫分支
- **Connection Pooling**: 高效連接管理
- **Point-in-Time Recovery**: 24 小時數據恢復
- **Autoscaling**: 1 ↔ 2 CU 自動擴展

---

## 分支策略

### 分支類型

#### 1. Production Branch (主分支)
- **名稱**: `production` (default)
- **分支 ID**: `br-rough-field-a80z6kz8`
- **Compute ID**: `ep-curly-salad-a85exs3f`
- **用途**: 生產環境數據
- **數據**: 真實用戶數據
- **備份**: 自動備份，24 小時 PITR
- **訪問**: 僅 Production 應用

#### 2. Preview Branch (預覽分支)
- **名稱**: `preview`
- **分支 ID**: `br-winter-smoke-a8fhvngp`
- **Compute ID**: `ep-soft-resonance-a8hnscfv`
- **父分支**: `production`
- **用途**: 預覽和測試環境
- **數據**: 從 Production 複製的測試數據
- **備份**: 自動備份，24 小時 PITR
- **訪問**: Preview 應用

#### 3. Development Branch (開發分支)
- **名稱**: `dev-[developer-name]`
- **父分支**: `production` 或 `preview`
- **用途**: 個人開發環境
- **數據**: 測試數據
- **備份**: 可選
- **訪問**: 本地開發環境

### 分支生命週期

```
Production Branch (永久)
    │
    ├─ Preview Branch (長期)
    │   ├─ 從 Production 複製
    │   ├─ 定期重置（可選）
    │   └─ 用於 PR 測試
    │
    └─ Dev Branches (臨時)
        ├─ 從 Production/Preview 複製
        ├─ 開發完成後刪除
        └─ 用於本地開發
```

### 分支管理最佳實踐

1. **Production Branch**:
   - 永不直接修改
   - 只通過遷移更新 schema
   - 定期備份和監控

2. **Preview Branch**:
   - 每週從 Production 重置一次（可選）
   - 用於測試新功能和遷移
   - 可以自由修改數據

3. **Dev Branches**:
   - 開發完成後立即刪除
   - 不要長期保留
   - 定期從 Production 同步

---

## 數據模型

### 核心資料表

EduCreate 使用 31 個資料表來管理用戶、活動、遊戲和學習數據：

#### 用戶和認證 (5 tables)
- `User` - 用戶基本信息
- `Account` - OAuth 帳號連結
- `Session` - 用戶會話
- `VerificationToken` - 郵件驗證令牌
- `PasswordReset` - 密碼重置令牌

#### 活動和內容 (8 tables)
- `Activity` - 學習活動
- `ActivityVersion` - 活動版本控制
- `ActivityVersionLog` - 版本變更日誌
- `Template` - 活動模板
- `GameTemplate` - 遊戲模板
- `GameSettings` - 遊戲設定
- `H5PContent` - H5P 互動內容
- `AIPrompt` - AI 生成提示

#### 社區功能 (4 tables)
- `ActivityLike` - 活動點讚
- `ActivityComment` - 活動評論
- `ActivityBookmark` - 活動收藏
- `CommunityReport` - 社區舉報

#### 課業管理 (3 tables)
- `Assignment` - 課業分配
- `AssignmentResult` - 課業結果
- `GameParticipant` - 遊戲參與者

#### 學習數據 (3 tables)
- `vocabulary_sets` - 詞彙集
- `vocabulary_items` - 詞彙項目
- `learning_progress` - 學習進度

#### 組織和管理 (5 tables)
- `Folder` - 資料夾組織
- `Plan` - 訂閱計畫
- `Subscription` - 用戶訂閱
- `Invoice` - 發票記錄
- `VisualTheme` - 視覺主題

#### 系統和通知 (3 tables)
- `NotificationSettings` - 通知設定
- `NotificationLog` - 通知日誌
- `_prisma_migrations` - Prisma 遷移記錄

### 數據關係

```
User
├─ Activities (1:N)
├─ Assignments (1:N)
├─ AssignmentResults (1:N)
├─ Folders (1:N)
├─ Subscription (1:1)
└─ NotificationSettings (1:1)

Activity
├─ ActivityVersions (1:N)
├─ Assignments (1:N)
├─ ActivityLikes (1:N)
├─ ActivityComments (1:N)
└─ ActivityBookmarks (1:N)

Assignment
├─ AssignmentResults (1:N)
└─ GameParticipants (1:N)
```

---

## 連接管理

### 連接類型

#### 1. Pooled Connection (應用使用)
```
postgresql://neondb_owner:npg_JiVYrWK7L6Ff@ep-curly-salad-a85exs3f-pooler.eastus2.azure.neon.tech/neondb?sslmode=require
```
- **用途**: Next.js 應用連接
- **特點**: 連接池管理，高並發支援
- **最大連接數**: 根據 Compute 配置自動調整

#### 2. Direct Connection (遷移使用)
```
postgresql://neondb_owner:npg_JiVYrWK7L6Ff@ep-curly-salad-a85exs3f.eastus2.azure.neon.tech/neondb?sslmode=require
```
- **用途**: Prisma 遷移
- **特點**: 直接連接，無連接池
- **使用場景**: 數據庫 schema 變更

### Prisma 連接配置

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

### 連接池設置

```javascript
// prisma/client.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

---

## 遷移策略

### 開發流程

```bash
# 1. 修改 Prisma schema
vim prisma/schema.prisma

# 2. 創建遷移（本地/Dev 環境）
npm run db:migrate:dev

# 3. 測試遷移
npm run test

# 4. 在 Preview 環境測試
git push origin feature/new-migration

# 5. 確認無誤後，在 Production 執行
npm run db:migrate:deploy
```

### 遷移最佳實踐

1. **向後兼容**: 遷移應該向後兼容，避免破壞性變更
2. **分步執行**: 大型變更分多個小遷移執行
3. **測試優先**: 在 Preview 環境充分測試
4. **備份確認**: Production 遷移前確認備份
5. **回滾計畫**: 準備回滾方案

### 遷移腳本

```json
{
  "scripts": {
    "db:migrate:dev": "prisma migrate dev",
    "db:migrate:deploy": "prisma migrate deploy",
    "db:migrate:reset": "prisma migrate reset",
    "db:push": "prisma db push",
    "db:seed": "prisma db seed"
  }
}
```

---

## 備份和恢復

### 自動備份

Neon 提供自動備份功能：
- **頻率**: 持續備份
- **保留期**: 24 小時 (Free Plan)
- **恢復點**: Point-in-Time Recovery (PITR)

### 手動備份

```bash
# 使用 pg_dump 備份
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 恢復備份
psql $DATABASE_URL < backup_20250116_120000.sql
```

### 分支恢復

```bash
# 使用 Neon CLI 從備份創建新分支
neon branches create --name recovery-branch --parent production --timestamp "2025-01-16 12:00:00"
```

---

## 性能優化

### 索引策略

```sql
-- 用戶查詢優化
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_created_at ON "User"("createdAt");

-- 活動查詢優化
CREATE INDEX idx_activity_user_id ON "Activity"("userId");
CREATE INDEX idx_activity_created_at ON "Activity"("createdAt");

-- 課業查詢優化
CREATE INDEX idx_assignment_activity_id ON "Assignment"("activityId");
CREATE INDEX idx_assignment_result_assignment_id ON "AssignmentResult"("assignmentId");
```

### 查詢優化

1. **使用 Prisma 的 select**: 只查詢需要的欄位
2. **使用 include 謹慎**: 避免過度關聯查詢
3. **分頁查詢**: 使用 `take` 和 `skip` 限制結果數量
4. **使用 cursor-based pagination**: 大數據集分頁

### 監控指標

- **Compute Hours**: 計算資源使用時間
- **Storage**: 數據庫存儲大小
- **Connections**: 活躍連接數
- **Query Performance**: 查詢執行時間

---

## 相關文檔

- [環境設置指南](./ENVIRONMENT_SETUP.md)
- [環境隔離實施計畫](./ENVIRONMENT_ISOLATION_IMPLEMENTATION_PLAN.md)
- [Prisma Schema](../prisma/schema.prisma)

---

**最後更新**: 2025-10-16  
**維護者**: EduCreate 開發團隊

