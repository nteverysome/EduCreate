# EduCreate 資料庫設置完整指南

## 📋 概述

本指南將幫助您完成 EduCreate 平台的資料庫設置，包括 PostgreSQL 安裝、資料庫創建、Prisma 配置和資料表初始化。

## 🚀 快速開始

### 方法一：使用自動化腳本（推薦）

```bash
# Windows 批處理版本
setup-database.bat

# 或 PowerShell 版本
PowerShell -ExecutionPolicy Bypass -File setup-database.ps1
```

### 方法二：手動步驟

按照下面的詳細步驟進行設置。

## 📝 詳細設置步驟

### ✅ 步驟 1：PostgreSQL 安裝和配置

1. **確認 PostgreSQL 已安裝並運行**
   ```bash
   # 檢查服務狀態
   sc query postgresql-x64-17
   
   # 如果未運行，啟動服務
   net start postgresql-x64-17
   ```

2. **測試 PostgreSQL 連接**
   ```bash
   psql -U postgres -c "SELECT version();"
   ```

### ✅ 步驟 2：創建 educreate 資料庫

#### 方法 A：使用 pgAdmin（圖形界面）

1. 打開 pgAdmin
2. 連接到 PostgreSQL 17 服務器
3. 右鍵點擊 "Databases" → "Create" → "Database..."
4. 在 "Database name" 輸入：`educreate`
5. 點擊 "Save"

#### 方法 B：使用命令行

```bash
# 設置密碼環境變量（避免重複輸入）
set PGPASSWORD=z089336161

# 創建資料庫
psql -U postgres -c "CREATE DATABASE educreate;"

# 驗證資料庫已創建
psql -U postgres -l
```

### ✅ 步驟 3：配置環境變量

1. **檢查 .env 文件**
   ```bash
   # 如果不存在，創建 .env 文件
   echo DATABASE_URL="postgresql://postgres:z089336161@localhost:5432/educreate?schema=public" > .env
   ```

2. **驗證配置**
   ```bash
   type .env
   ```

### ✅ 步驟 4：Prisma 資料庫初始化

1. **推送 schema 到資料庫**
   ```bash
   npx prisma db push
   ```

2. **生成 Prisma Client**
   ```bash
   npx prisma generate
   ```

3. **驗證資料表創建**
   ```bash
   node test-db-connection.js
   ```

## 🔍 驗證和測試

### 資料庫連接測試

```bash
# 執行連接測試
node test-db-connection.js
```

預期輸出：
```
🔍 EduCreate 資料庫連接測試
================================
📋 測試資料庫連接...
✅ 資料庫連接成功
📋 測試基本查詢...
✅ 查詢測試成功: [ { test: 1 } ]
📋 檢查資料表結構...
✅ User 資料表存在，目前有 0 筆記錄
✅ Activity 資料表存在，目前有 0 筆記錄
✅ Template 資料表存在，目前有 0 筆記錄
✅ Subscription 資料表存在，目前有 0 筆記錄
✅ H5PContent 資料表存在，目前有 0 筆記錄

🎯 資料庫連接測試完成！
================================
✅ 所有核心功能正常
💡 可以開始使用 EduCreate 平台了
```

### 啟動開發服務器

```bash
npm run dev
```

然後訪問：http://localhost:3000

## 📊 資料庫結構概覽

### 核心資料表

| 資料表 | 說明 | 主要欄位 |
|--------|------|----------|
| `User` | 用戶資料 | id, name, email, password, role |
| `Activity` | 活動/遊戲 | id, title, description, content, type |
| `Template` | 模板 | id, name, type, config |
| `Subscription` | 訂閱 | id, userId, planId, status |
| `H5PContent` | H5P 內容 | id, title, contentType, contentPath |

### 支援資料表

- `Plan` - 訂閱方案
- `Invoice` - 發票記錄
- `ActivityVersion` - 活動版本控制
- `ActivityVersionLog` - 版本操作日誌
- `PasswordReset` - 密碼重置
- `NotificationSettings` - 通知設定
- `NotificationLog` - 通知日誌

## 🛠️ 故障排除

### 常見問題

#### 1. PostgreSQL 連接失敗

**錯誤訊息：**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**解決方案：**
```bash
# 檢查 PostgreSQL 服務
sc query postgresql-x64-17

# 啟動服務
net start postgresql-x64-17
```

#### 2. 資料庫不存在

**錯誤訊息：**
```
database "educreate" does not exist
```

**解決方案：**
```bash
# 創建資料庫
psql -U postgres -c "CREATE DATABASE educreate;"
```

#### 3. 認證失敗

**錯誤訊息：**
```
password authentication failed for user "postgres"
```

**解決方案：**
- 確認密碼正確：`z089336161`
- 檢查 .env 文件中的 DATABASE_URL
- 重新設置 PostgreSQL 密碼

#### 4. Prisma Client 未生成

**錯誤訊息：**
```
Cannot find module '@prisma/client'
```

**解決方案：**
```bash
npx prisma generate
npm install @prisma/client
```

### 重置資料庫

如果需要完全重置資料庫：

```bash
# 刪除資料庫
psql -U postgres -c "DROP DATABASE IF EXISTS educreate;"

# 重新創建
psql -U postgres -c "CREATE DATABASE educreate;"

# 重新推送 schema
npx prisma db push

# 重新生成 client
npx prisma generate
```

## 📚 相關文檔

- [PostgreSQL 官方文檔](https://www.postgresql.org/docs/)
- [Prisma 官方文檔](https://www.prisma.io/docs/)
- [Next.js 官方文檔](https://nextjs.org/docs)

## 🆘 獲取幫助

如果遇到問題：

1. 檢查本指南的故障排除部分
2. 執行 `test-db-connection.js` 獲取詳細錯誤信息
3. 查看 PostgreSQL 日誌
4. 檢查 Next.js 開發服務器日誌

---

**設置完成後，您就可以開始使用 EduCreate 平台的所有功能了！** 🎉