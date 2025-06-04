# EduCreate 註冊問題完整解決方案

## 🚨 問題描述

用戶反映「沒辦法註冊」，可能的原因包括：

1. **數據庫連接問題** - PostgreSQL 服務未啟動或連接配置錯誤
2. **Prisma 客戶端問題** - 數據庫 schema 未同步或 Prisma 客戶端未生成
3. **API 錯誤** - 註冊 API 端點存在問題
4. **前端錯誤** - JavaScript 錯誤或網絡請求失敗
5. **環境變量問題** - 必要的環境變量未正確設置

## 🔧 快速診斷

### 步驟 1: 運行診斷工具

```bash
# 運行註冊問題診斷
node diagnose-register-issue.js

# 或使用批處理文件
diagnose-register.bat
```

### 步驟 2: 檢查常見問題

#### 檢查 PostgreSQL 服務
```bash
# 檢查 PostgreSQL 是否運行
psql -U postgres -d educreate -c "SELECT 1;"
```

#### 檢查環境變量
確保 `.env` 文件包含：
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/educreate?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret-key"
```

## 🛠️ 解決方案

### 方案 1: 一鍵修復（推薦）

使用我們提供的一鍵啟動腳本：

```bash
# 快速啟動（推薦日常使用）
quick-start.bat

# 完整初始化
one-click-start.bat

# PowerShell 版本（最佳體驗）
one-click-start.ps1
```

### 方案 2: 手動修復

#### 2.1 修復數據庫問題

```bash
# 1. 啟動 PostgreSQL 服務
net start postgresql-x64-14

# 2. 創建數據庫（如果不存在）
psql -U postgres -c "CREATE DATABASE educreate;"

# 3. 推送 Prisma schema
npx prisma db push

# 4. 生成 Prisma 客戶端
npx prisma generate
```

#### 2.2 修復依賴問題

```bash
# 重新安裝依賴
npm install

# 檢查 bcryptjs 是否正確安裝
npm list bcryptjs
```

#### 2.3 測試數據庫連接

```bash
# 運行數據庫連接測試
node test-db-connection.js
```

### 方案 3: 重置項目

如果上述方案都無效，可以嘗試重置：

```bash
# 1. 清理 node_modules
rmdir /s node_modules
rmdir /s .next

# 2. 重新安裝依賴
npm install

# 3. 重置數據庫
npx prisma db push --force-reset
npx prisma generate

# 4. 啟動開發服務器
npm run dev
```

## 🔍 常見錯誤及解決方法

### 錯誤 1: "數據庫連接失敗"

**解決方法：**
1. 檢查 PostgreSQL 服務是否運行
2. 驗證 `.env` 文件中的 `DATABASE_URL`
3. 確保 `educreate` 數據庫存在

### 錯誤 2: "此電子郵件已被註冊"

**解決方法：**
1. 使用不同的電子郵件地址
2. 或清理測試數據：
   ```sql
   DELETE FROM "User" WHERE email = 'test@example.com';
   ```

### 錯誤 3: "密碼必須至少8個字符"

**解決方法：**
確保密碼長度至少為 8 個字符。

### 錯誤 4: "Prisma 客戶端初始化失敗"

**解決方法：**
```bash
npx prisma generate
npm run dev
```

### 錯誤 5: "500 內部服務器錯誤"

**解決方法：**
1. 檢查服務器控制台日誌
2. 確保所有依賴正確安裝
3. 重啟開發服務器

## 🧪 測試註冊功能

### 手動測試

1. 啟動開發服務器：`npm run dev`
2. 訪問：http://localhost:3000/register
3. 填寫註冊表單：
   - 姓名：Test User
   - 電子郵件：test@example.com
   - 密碼：testpassword123
   - 確認密碼：testpassword123
4. 點擊「註冊」按鈕
5. 檢查是否成功重定向到儀表板

### 自動化測試

```bash
# 運行註冊功能測試
node test-register.js
```

## 📋 檢查清單

在報告註冊問題之前，請確認以下項目：

- [ ] PostgreSQL 服務正在運行
- [ ] `.env` 文件配置正確
- [ ] `educreate` 數據庫存在
- [ ] Prisma schema 已推送到數據庫
- [ ] Prisma 客戶端已生成
- [ ] 所有 npm 依賴已安裝
- [ ] 開發服務器正在運行
- [ ] 瀏覽器控制台無 JavaScript 錯誤
- [ ] 網絡請求正常（檢查 Network 標籤）

## 🆘 獲取幫助

如果問題仍然存在，請提供以下信息：

1. **診斷報告**：運行 `diagnose-register.bat` 的輸出
2. **瀏覽器控制台錯誤**：F12 → Console 標籤的錯誤信息
3. **網絡請求詳情**：F12 → Network 標籤的失敗請求
4. **服務器日誌**：開發服務器控制台的錯誤信息
5. **環境信息**：
   - Node.js 版本：`node --version`
   - npm 版本：`npm --version`
   - PostgreSQL 版本：`psql --version`

## 📚 相關文檔

- [數據庫設置指南](DATABASE-SETUP-GUIDE.md)
- [啟動指南](START-GUIDE.md)
- [註冊修復指南](REGISTER-FIX-README.md)
- [錯誤修復指南](ERROR-FIX-README.md)