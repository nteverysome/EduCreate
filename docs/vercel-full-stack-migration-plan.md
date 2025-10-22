# Vercel 全家桶遷移實施計畫

**文檔版本**：1.0  
**創建日期**：2025-01-21  
**目標方案**：方案 B - Vercel Postgres + Vercel Blob  
**預估成本**：$45.75/月（相比舊定價 $83/月 降低 44.9%）

---

## 📋 執行摘要

本文檔提供從當前架構（Neon + 混合存儲）遷移到 Vercel 全家桶（Vercel Postgres + Vercel Blob）的完整實施計畫。

### 方案優勢

✅ **統一平台管理**：所有服務在 Vercel 控制台統一管理  
✅ **簡化部署流程**：無需配置多個服務商  
✅ **全球 CDN 整合**：Vercel Blob 自帶全球 CDN，無需額外配置  
✅ **成本優化**：2025 年新定價使成本降低 44.9%  
✅ **開發體驗**：與 Next.js 深度整合，開發效率更高

### 方案劣勢

⚠️ **失去 Neon Branching**：無法使用 Git-like 數據庫分支功能  
⚠️ **成本略高**：相比 Supabase 全家桶（$25/月）高 $20.75/月  
⚠️ **供應商鎖定**：更依賴 Vercel 生態系統

---

## 🎯 遷移目標

### 主要目標

1. **數據庫遷移**：從 Neon PostgreSQL 遷移到 Vercel Postgres
2. **存儲整合**：統一使用 Vercel Blob Storage
3. **零停機遷移**：確保服務持續可用
4. **成本優化**：利用 Vercel Blob 新定價降低成本

### 成功指標

- ✅ 所有數據完整遷移，無數據丟失
- ✅ 應用性能不降低（響應時間 < 200ms）
- ✅ 停機時間 < 5 分鐘
- ✅ 月成本控制在 $50 以內

---

## 📊 當前架構 vs 目標架構

### 當前架構（Neon + 混合存儲）

```
┌─────────────────────────────────────────┐
│         Vercel Next.js App              │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐  ┌─────────────────┐ │
│  │ Neon         │  │ Vercel Blob     │ │
│  │ PostgreSQL   │  │ (活動截圖)      │ │
│  │ (主數據庫)   │  │                 │ │
│  └──────────────┘  └─────────────────┘ │
│                                         │
│  ┌──────────────┐  ┌─────────────────┐ │
│  │ Local FS     │  │ Supabase        │ │
│  │ (用戶頭像)   │  │ (Realtime)      │ │
│  └──────────────┘  └─────────────────┘ │
└─────────────────────────────────────────┘
```

**問題**：
- ❌ 多個存儲位置，管理複雜
- ❌ 本地文件系統不適合 serverless
- ❌ 需要管理多個服務商賬號

### 目標架構（Vercel 全家桶）

```
┌─────────────────────────────────────────┐
│         Vercel Next.js App              │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐  ┌─────────────────┐ │
│  │ Vercel       │  │ Vercel Blob     │ │
│  │ Postgres     │  │ Storage         │ │
│  │ (主數據庫)   │  │ (所有圖片)      │ │
│  │              │  │ + 全球 CDN      │ │
│  └──────────────┘  └─────────────────┘ │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ Supabase Realtime (保留)           ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

**優勢**：
- ✅ 統一在 Vercel 平台管理
- ✅ 所有圖片使用 Vercel Blob + CDN
- ✅ 簡化的環境變量配置
- ✅ 更好的 Next.js 整合

---

## 🗓️ 遷移時間表

### 階段 1：準備階段（1-2 天）

**目標**：評估現有數據，準備遷移環境

#### 任務清單

- [ ] **1.1 數據庫評估**
  - 導出 Neon 數據庫 schema
  - 統計數據量（表數量、行數、大小）
  - 識別所有外鍵和索引
  - 檢查是否有 Neon 特定功能使用

- [ ] **1.2 存儲評估**
  - 統計 Vercel Blob 現有文件（活動截圖）
  - 統計本地頭像文件數量和大小
  - 列出所有需要遷移的文件路徑

- [ ] **1.3 Vercel 環境準備**
  - 創建 Vercel Postgres 數據庫
  - 配置 Vercel Blob Storage
  - 設置環境變量
  - 創建測試環境

- [ ] **1.4 成本確認**
  - 確認 Vercel Pro 計劃訂閱
  - 計算預估月成本
  - 設置成本警報

**預估時間**：1-2 天  
**負責人**：開發團隊  
**風險**：低

---

### 階段 2：數據庫遷移（2-3 天）

**目標**：將 Neon PostgreSQL 數據遷移到 Vercel Postgres

#### 任務清單

- [ ] **2.1 Schema 遷移**
  - 從 Neon 導出完整 schema
  - 在 Vercel Postgres 創建相同 schema
  - 驗證所有表、索引、約束

- [ ] **2.2 數據遷移**
  - 使用 `pg_dump` 導出 Neon 數據
  - 使用 `pg_restore` 導入到 Vercel Postgres
  - 驗證數據完整性（行數、checksum）

- [ ] **2.3 連接字符串更新**
  - 更新 `.env.local` 中的 `DATABASE_URL`
  - 更新 Prisma 配置
  - 測試數據庫連接

- [ ] **2.4 應用測試**
  - 在本地環境測試所有數據庫操作
  - 測試用戶註冊、登錄
  - 測試活動創建、編輯、刪除
  - 測試社區功能

**預估時間**：2-3 天  
**負責人**：後端開發  
**風險**：中（需要仔細驗證數據完整性）

#### 遷移腳本範例

```bash
# 1. 從 Neon 導出數據
pg_dump $NEON_DATABASE_URL > educreate_backup.sql

# 2. 導入到 Vercel Postgres
psql $VERCEL_POSTGRES_URL < educreate_backup.sql

# 3. 驗證數據
psql $VERCEL_POSTGRES_URL -c "SELECT COUNT(*) FROM users;"
psql $VERCEL_POSTGRES_URL -c "SELECT COUNT(*) FROM activities;"
```

---

### 階段 3：存儲遷移（2-3 天）

**目標**：將所有圖片遷移到 Vercel Blob Storage

#### 任務清單

- [ ] **3.1 用戶頭像遷移**
  - 編寫遷移腳本（從本地 FS 到 Vercel Blob）
  - 批量上傳頭像文件
  - 更新數據庫中的頭像 URL
  - 驗證所有頭像可訪問

- [ ] **3.2 活動截圖驗證**
  - 確認現有截圖已在 Vercel Blob
  - 驗證所有 URL 有效
  - 測試截圖生成流程

- [ ] **3.3 API 更新**
  - 更新 `/api/user/upload-avatar` 使用 Vercel Blob
  - 更新 `/api/media/upload` 實現真實上傳
  - 移除本地文件系統相關代碼

- [ ] **3.4 前端更新**
  - 更新頭像顯示組件
  - 更新圖片上傳組件
  - 測試所有圖片功能

**預估時間**：2-3 天  
**負責人**：全棧開發  
**風險**：中（需要確保 URL 正確更新）

#### 頭像遷移腳本範例

```typescript
// scripts/migrate-avatars-to-vercel-blob.ts
import { put } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

async function migrateAvatars() {
  const avatarDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
  const files = fs.readdirSync(avatarDir);

  for (const file of files) {
    const filePath = path.join(avatarDir, file);
    const fileBuffer = fs.readFileSync(filePath);
    
    // 上傳到 Vercel Blob
    const blob = await put(`avatars/${file}`, fileBuffer, {
      access: 'public',
    });

    // 更新數據庫
    const userId = file.split('-')[0]; // 假設文件名格式：userId-timestamp.jpg
    await prisma.user.update({
      where: { id: userId },
      data: { image: blob.url },
    });

    console.log(`✅ Migrated avatar for user ${userId}: ${blob.url}`);
  }
}

migrateAvatars();
```

---

### 階段 4：測試與驗證（1-2 天）

**目標**：全面測試遷移後的系統

#### 任務清單

- [ ] **4.1 功能測試**
  - 用戶註冊、登錄、登出
  - 頭像上傳、更新、顯示
  - 活動創建、編輯、刪除
  - 活動截圖生成
  - 社區功能（點贊、評論、分享）

- [ ] **4.2 性能測試**
  - 數據庫查詢響應時間
  - 圖片加載速度
  - CDN 緩存效果
  - 並發用戶測試

- [ ] **4.3 數據完整性驗證**
  - 對比遷移前後的數據量
  - 檢查所有外鍵關係
  - 驗證所有圖片 URL 有效

- [ ] **4.4 回滾測試**
  - 準備回滾腳本
  - 測試回滾流程
  - 確保可以快速恢復到 Neon

**預估時間**：1-2 天  
**負責人**：QA + 開發團隊  
**風險**：低

---

### 階段 5：生產部署（1 天）

**目標**：將遷移後的系統部署到生產環境

#### 任務清單

- [ ] **5.1 部署前準備**
  - 通知用戶計劃維護時間
  - 備份當前生產數據
  - 準備回滾計劃

- [ ] **5.2 生產環境遷移**
  - 設置維護模式
  - 執行數據庫遷移
  - 執行存儲遷移
  - 更新環境變量
  - 部署新代碼

- [ ] **5.3 部署後驗證**
  - 測試關鍵功能
  - 監控錯誤日誌
  - 檢查性能指標
  - 確認成本符合預期

- [ ] **5.4 清理工作**
  - 移除舊的環境變量
  - 清理本地頭像文件
  - 更新文檔
  - 關閉 Neon 數據庫（保留備份）

**預估時間**：1 天  
**負責人**：DevOps + 開發團隊  
**風險**：中（生產部署風險）

---

## 💰 成本分析

### 遷移前成本（Neon + 混合存儲）

```
Neon PostgreSQL Launch: $19/月
Vercel Blob (舊定價): $63/月
Supabase Realtime: $0/月（免費額度）
─────────────────────────────
總計: $82/月
```

### 遷移後成本（Vercel 全家桶）

```
Vercel Pro 計劃: $20/月
├─ Vercel Postgres: 包含在 Pro 計劃
└─ Vercel Blob: 包含 5GB 存儲 + 100GB 傳輸

額外成本（基於 10,000 用戶場景）:
├─ 額外存儲: (20GB - 5GB) × $0.023 = $0.345/月
├─ 額外帶寬: (200GB - 100GB) × $0.05 = $5/月
└─ 操作費用: ~$0.40/月

Vercel Blob 總成本: $25.745/月
Supabase Realtime: $0/月（保留）
─────────────────────────────
總計: $45.745/月

節省: $82 - $45.745 = $36.255/月 (44.2%)
```

### 成本優化建議

1. **利用免費額度**
   - Vercel Pro 包含 5GB 存儲 + 100GB 傳輸
   - 優化圖片大小，減少存儲和帶寬使用

2. **CDN 緩存優化**
   - 設置合理的緩存策略
   - 減少重複請求

3. **監控成本**
   - 設置 Vercel 成本警報
   - 定期檢查使用量報告

---

## 🔧 技術實施細節

### 環境變量配置

#### 遷移前（`.env.local`）

```bash
# Neon Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Vercel Blob (活動截圖)
BLOB_READ_WRITE_TOKEN="vercel_blob_..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."
```

#### 遷移後（`.env.local`）

```bash
# Vercel Postgres
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."

# Vercel Blob (所有圖片)
BLOB_READ_WRITE_TOKEN="vercel_blob_..."

# Supabase (僅 Realtime)
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
```

### Prisma 配置更新

```prisma
// prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL") // 使用連接池
  directUrl = env("POSTGRES_URL_NON_POOLING") // 用於遷移
}
```

### API 路由更新範例

#### 更新前：`app/api/user/upload-avatar/route.ts`

```typescript
// ❌ 舊代碼：使用本地文件系統
const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars');
await writeFile(filePath, buffer);
const fileUrl = `/uploads/avatars/${fileName}`;
```

#### 更新後：`app/api/user/upload-avatar/route.ts`

```typescript
// ✅ 新代碼：使用 Vercel Blob
import { put } from '@vercel/blob';

const blob = await put(`avatars/${fileName}`, buffer, {
  access: 'public',
  addRandomSuffix: false,
});

const fileUrl = blob.url; // https://xxx.public.blob.vercel-storage.com/avatars/...
```

---

## ⚠️ 風險管理

### 主要風險

| 風險 | 影響 | 概率 | 緩解措施 |
|------|------|------|----------|
| 數據遷移失敗 | 高 | 低 | 完整備份 + 測試環境驗證 |
| 停機時間過長 | 中 | 中 | 分階段遷移 + 維護窗口 |
| URL 更新錯誤 | 中 | 中 | 批量驗證 + 回滾計劃 |
| 成本超支 | 低 | 低 | 成本監控 + 警報設置 |
| 性能下降 | 中 | 低 | 性能測試 + CDN 優化 |

### 回滾計劃

如果遷移失敗，執行以下步驟：

1. **立即回滾數據庫連接**
   ```bash
   # 恢復 Neon 連接字符串
   DATABASE_URL="postgresql://neon..."
   ```

2. **恢復舊代碼**
   ```bash
   git revert <migration-commit>
   vercel --prod
   ```

3. **驗證服務恢復**
   - 測試關鍵功能
   - 檢查錯誤日誌

4. **分析失敗原因**
   - 檢查遷移日誌
   - 識別問題根源
   - 制定修復計劃

---

## ✅ 驗收標準

### 功能驗收

- [ ] 所有用戶可以正常登錄
- [ ] 頭像上傳和顯示正常
- [ ] 活動創建、編輯、刪除正常
- [ ] 活動截圖生成正常
- [ ] 社區功能（點贊、評論）正常
- [ ] 所有圖片通過 CDN 加載

### 性能驗收

- [ ] 數據庫查詢響應時間 < 100ms
- [ ] 圖片加載時間 < 500ms
- [ ] 首頁加載時間 < 2s
- [ ] CDN 緩存命中率 > 80%

### 數據驗收

- [ ] 用戶數量一致
- [ ] 活動數量一致
- [ ] 所有圖片 URL 有效
- [ ] 無數據丟失

### 成本驗收

- [ ] 月成本 < $50
- [ ] 成本警報設置完成
- [ ] 使用量監控正常

---

## 📚 參考資源

### Vercel 官方文檔

- [Vercel Postgres 文檔](https://vercel.com/docs/storage/vercel-postgres)
- [Vercel Blob 文檔](https://vercel.com/docs/storage/vercel-blob)
- [Vercel 定價](https://vercel.com/pricing)

### 遷移工具

- [pg_dump 文檔](https://www.postgresql.org/docs/current/app-pgdump.html)
- [Prisma 遷移指南](https://www.prisma.io/docs/guides/migrate)

### 成本計算器

- [Vercel 成本計算器](https://vercel.com/pricing)

---

## 📞 支持與聯繫

### 遷移團隊

- **項目負責人**：[待定]
- **後端開發**：[待定]
- **前端開發**：[待定]
- **DevOps**：[待定]

### 緊急聯繫

- **Vercel 支持**：support@vercel.com
- **技術問題**：[團隊 Slack 頻道]

---

## 📝 附錄

### A. 數據庫 Schema 對比

（待補充：Neon vs Vercel Postgres schema 差異）

### B. 性能基準測試結果

（待補充：遷移前後性能對比）

### C. 成本監控儀表板

（待補充：Vercel 成本監控截圖）

---

**文檔結束**

*下一步：開始階段 1 - 準備階段*

