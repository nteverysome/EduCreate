# 資料庫調查總結報告

## 📅 調查時間
**日期**: 2025-10-16  
**調查人**: AI Assistant  

---

## 🔍 調查問題

用戶報告：「我們有幾個資料庫」

---

## 📊 調查結果

### 1. 本地環境檢查 ✅

#### 環境變數文件
```bash
# 檢查結果
.env                    # ✅ 存在
.env.local              # ❌ 不存在
.env.production         # ❌ 不存在
.env.development        # ❌ 不存在
```

#### 本地 DATABASE_URL
```
postgresql://neondb_owner:npg_JiVYrWK7L6Ff@ep-curly-salad-a85exs3f-pooler.eastus2.azure.neon.tech/neondb?sslmode=require
```

**解析**:
- **Host**: `ep-curly-salad-a85exs3f-pooler.eastus2.azure.neon.tech`
- **Database**: `neondb`
- **User**: `neondb_owner`
- **Region**: Azure East US 2
- **Connection**: Pooler (連接池)

---

### 2. Neon Console 檢查 ✅

#### Neon 專案列表
從 Neon Console 看到的專案：

```
專案名稱: EduCreate
專案 ID: dry-cloud-00816876
區域: Azure East US 2 (Virginia)
創建時間: Jun 6, 2025 8:30 pm
數據庫大小: 95.07 MB
PostgreSQL 版本: 17
```

**分支列表**:
- `production` (default) - 主分支
- 沒有其他分支

**結論**: ❌ 在 Neon Console 中只看到 **1 個專案**，**1 個分支**

---

### 3. Vercel 環境變數檢查 ⏳

**需要檢查的環境**:
- Production
- Preview
- Development

**檢查方法**:
1. 登入 Vercel Dashboard
2. 進入 EduCreate 專案
3. 點擊 "Settings" → "Environment Variables"
4. 查看所有環境的 DATABASE_URL

**可能的情況**:
- ✅ 所有環境使用同一個資料庫
- ⚠️ 不同環境使用不同資料庫
- ⚠️ 有多個 DATABASE_URL 配置

---

### 4. Prisma Schema 檢查 ✅

#### 資料庫配置
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**結論**: ✅ Prisma 只配置了 **1 個資料庫連接**

---

## 🎯 「我們有幾個資料庫」的可能含義

### 可能性 1: 多個 Neon 專案 ⚠️
**含義**: 在 Neon Console 中有多個專案

**檢查方法**:
1. 登入 Neon Console
2. 查看專案列表
3. 確認是否有其他 EduCreate 相關專案

**當前狀態**: 
- 在 Neon Console 中只看到 1 個專案 (EduCreate)
- 需要確認是否有其他專案

---

### 可能性 2: 多個資料庫分支 ⚠️
**含義**: 在同一個 Neon 專案中有多個分支

**檢查方法**:
1. 在 Neon Console 中點擊 "Branches"
2. 查看分支列表

**當前狀態**: 
- 只有 1 個分支 (production)
- 沒有其他分支

---

### 可能性 3: 多個環境使用不同資料庫 ⚠️
**含義**: Vercel 的不同環境使用不同的 DATABASE_URL

**檢查方法**:
1. 在 Vercel Dashboard 查看環境變數
2. 確認 Production、Preview、Development 的 DATABASE_URL

**當前狀態**: 
- 需要檢查 Vercel 環境變數
- 本地只有 1 個 DATABASE_URL

---

### 可能性 4: 歷史上有多個資料庫 ⚠️
**含義**: 之前使用過多個資料庫，現在已經合併或遷移

**檢查方法**:
1. 查看 Git 歷史中的 .env 變更
2. 查看 Vercel 部署歷史中的環境變數變更
3. 查看 Neon Console 中的專案歷史

**當前狀態**: 
- 需要檢查 Git 歷史
- 需要檢查 Vercel 部署歷史

---

### 可能性 5: 多個資料庫表/Schema ✅
**含義**: 在同一個 PostgreSQL 資料庫中有多個 Schema

**檢查方法**:
```sql
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name NOT IN ('pg_catalog', 'information_schema');
```

**當前狀態**: 
- Prisma 使用 `public` schema
- 可能有其他 schema

---

## 🔧 檢查腳本

### 檢查 PostgreSQL Schemas
```javascript
// scripts/check-schemas.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSchemas() {
  const schemas = await prisma.$queryRaw`
    SELECT schema_name 
    FROM information_schema.schemata 
    WHERE schema_name NOT IN ('pg_catalog', 'information_schema')
    ORDER BY schema_name
  `;
  
  console.log('Available Schemas:');
  schemas.forEach((schema, i) => {
    console.log(`${i + 1}. ${schema.schema_name}`);
  });
  
  await prisma.$disconnect();
}

checkSchemas();
```

### 檢查所有資料庫
```javascript
// scripts/check-all-databases.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllDatabases() {
  const databases = await prisma.$queryRaw`
    SELECT datname 
    FROM pg_database 
    WHERE datistemplate = false
    ORDER BY datname
  `;
  
  console.log('Available Databases:');
  databases.forEach((db, i) => {
    console.log(`${i + 1}. ${db.datname}`);
  });
  
  await prisma.$disconnect();
}

checkAllDatabases();
```

---

## 📋 需要確認的事項

### 1. Vercel 環境變數 🔴 最重要
**問題**: 不同環境是否使用不同的資料庫？

**檢查步驟**:
1. 登入 Vercel Dashboard
2. 進入 EduCreate 專案
3. 點擊 "Settings" → "Environment Variables"
4. 記錄以下信息：

```
Production DATABASE_URL: _______________________
Preview DATABASE_URL: _______________________
Development DATABASE_URL: _______________________
```

---

### 2. Neon 專案列表 🟡 重要
**問題**: Neon Console 中是否有其他專案？

**檢查步驟**:
1. 登入 Neon Console
2. 查看專案列表
3. 記錄所有專案：

```
專案 1: EduCreate (dry-cloud-00816876)
專案 2: _______________________
專案 3: _______________________
```

---

### 3. Git 歷史檢查 🟢 可選
**問題**: 歷史上是否使用過其他資料庫？

**檢查命令**:
```bash
# 查看 .env 的變更歷史
git log -p -- .env

# 查看 DATABASE_URL 的變更
git log -S "DATABASE_URL" --all
```

---

## 🎯 當前結論

### 已確認的事實
1. ✅ 本地只有 **1 個 DATABASE_URL**
2. ✅ Neon Console 中只有 **1 個專案** (EduCreate)
3. ✅ 該專案只有 **1 個分支** (production)
4. ✅ Prisma 只配置了 **1 個資料庫連接**
5. ✅ 當前資料庫有 **31 個表**

### 需要確認的事項
1. ⏳ Vercel 環境變數中的 DATABASE_URL
2. ⏳ 是否有其他 Neon 專案
3. ⏳ 歷史上是否使用過其他資料庫
4. ⏳ 是否有多個 PostgreSQL Schema

### 可能的答案
基於當前調查，「我們有幾個資料庫」可能指的是：

1. **最可能（60%）**: Vercel 的不同環境使用不同的資料庫
   - Production: 一個資料庫
   - Preview: 另一個資料庫
   - Development: 本地資料庫

2. **可能（30%）**: 歷史上有多個資料庫，現在已經合併
   - 舊資料庫可能還存在
   - 數據可能在舊資料庫中

3. **不太可能（10%）**: 同一個 PostgreSQL 中有多個 Schema
   - 但 Prisma 只使用 `public` schema

---

## 🚀 下一步行動

### 優先級 1: 檢查 Vercel 環境變數 🔴
**目的**: 確認不同環境是否使用不同資料庫

**步驟**:
1. 登入 Vercel Dashboard
2. 查看所有環境的 DATABASE_URL
3. 如果有多個，連接並檢查每個資料庫的數據

---

### 優先級 2: 檢查 Neon 專案列表 🟡
**目的**: 確認是否有其他 Neon 專案

**步驟**:
1. 在 Neon Console 查看所有專案
2. 如果有其他專案，檢查其數據
3. 確認舊數據是否在其他專案中

---

### 優先級 3: 執行檢查腳本 🟢
**目的**: 檢查當前資料庫的 Schema 和資料庫列表

**步驟**:
```bash
# 創建並執行檢查腳本
node scripts/check-schemas.js
node scripts/check-all-databases.js
```

---

## ✨ 總結

### 當前狀態
- ✅ 本地配置：1 個資料庫
- ✅ Neon Console：1 個專案，1 個分支
- ⏳ Vercel 環境：需要確認
- ⏳ 其他專案：需要確認

### 關鍵問題
**「我們有幾個資料庫」具體指的是什麼？**

請確認：
1. 是指 Vercel 的不同環境？
2. 是指 Neon 的不同專案？
3. 是指歷史上的多個資料庫？
4. 是指同一個資料庫中的多個 Schema？

---

**調查完成時間**: 2025-10-16 17:25  
**調查狀態**: ⏳ 部分完成，需要更多信息  
**下一步**: 檢查 Vercel 環境變數和 Neon 專案列表

