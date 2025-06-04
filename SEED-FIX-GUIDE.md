# Prisma Seed 修復指南

## 🎯 問題描述
執行 `npx prisma db seed` 時遇到 TypeScript 編譯錯誤：
```
TSError: ⨯ Unable to compile TypeScript:
prisma/seed.ts:2:20 - error TS7016: Could not find a declaration file for module 'bcryptjs'
```

## ✅ 解決方案

### 方案 1: 使用 JavaScript Seed 檔案 (推薦)
我已經建立了 `prisma/seed.js` 檔案並更新了 `package.json` 配置。

**執行步驟**:
```bash
# 直接執行 JavaScript seed
node prisma/seed.js

# 或使用 Prisma 命令
npx prisma db seed
```

### 方案 2: 使用批次檔自動修復
```bash
# 執行自動修復腳本
.\run-seed.bat
```

### 方案 3: 手動修復 TypeScript 問題
如果您偏好使用 TypeScript seed 檔案：

1. **安裝類型定義** (已在 package.json 中):
   ```bash
   npm install --save-dev @types/bcryptjs
   ```

2. **確保正確的導入**:
   ```typescript
   import { PrismaClient, Role } from '@prisma/client';
   import bcrypt from 'bcryptjs';
   ```

3. **更新 tsconfig.json** (如果需要):
   ```json
   {
     "compilerOptions": {
       "moduleResolution": "node",
       "esModuleInterop": true,
       "allowSyntheticDefaultImports": true
     }
   }
   ```

## 🔧 檔案變更摘要

### 新建檔案
- `prisma/seed.js` - JavaScript 版本的 seed 檔案
- `run-seed.bat` - 自動執行 seed 的批次檔

### 修改檔案
- `package.json` - 更新 seed 命令使用 JavaScript 檔案

## 🧪 測試帳號
執行 seed 後將建立以下測試帳號：

| 角色 | Email | 密碼 | 用途 |
|------|-------|------|------|
| 管理員 | admin@example.com | password123 | 完整權限測試 |
| 普通用戶 | user@example.com | password123 | 基本功能測試 |
| 高級用戶 | premium@example.com | password123 | 付費功能測試 |

## 🚀 完整執行流程

1. **確保資料庫運行**:
   ```bash
   # 檢查 PostgreSQL 狀態
   # Windows: 服務管理器中查看 PostgreSQL 服務
   ```

2. **推送資料庫 schema**:
   ```bash
   npx prisma db push
   ```

3. **生成 Prisma Client**:
   ```bash
   npx prisma generate
   ```

4. **執行 seed**:
   ```bash
   npx prisma db seed
   ```

5. **驗證數據**:
   ```bash
   # 執行診斷腳本
   node quick-auth-diagnosis.js
   ```

## 🐛 常見錯誤處理

### 錯誤 1: 資料庫連接失敗
```
Error: P1000 or P1001
```
**解決方案**:
- 確認 PostgreSQL 服務運行
- 檢查 `.env` 中的 `DATABASE_URL`
- 執行 `npx prisma db push`

### 錯誤 2: 用戶已存在
```
Error: P2002 Unique constraint failed
```
**解決方案**:
- Seed 檔案會自動清理現有數據
- 如果仍有問題，手動清理：
  ```sql
  DELETE FROM "User";
  DELETE FROM "Template";
  ```

### 錯誤 3: TypeScript 編譯錯誤
```
TSError: Unable to compile TypeScript
```
**解決方案**:
- 使用 JavaScript seed 檔案 (已配置)
- 或安裝缺少的類型定義

## 📊 執行結果驗證

成功執行後應該看到：
```
🎉 Seed 執行完成！

📊 創建的數據:
- 3 個測試用戶
- 3 個活動模板

🔑 測試帳號:
管理員: admin@example.com (密碼: password123)
普通用戶: user@example.com (密碼: password123)
高級用戶: premium@example.com (密碼: password123)
```

## 🔄 下一步

1. **啟動開發服務器**:
   ```bash
   npm run dev
   ```

2. **測試登入功能**:
   - 訪問 `http://localhost:3000/login`
   - 使用測試帳號登入
   - 檢查瀏覽器控制台和服務器日誌

3. **執行完整診斷**:
   ```bash
   node quick-auth-diagnosis.js
   ```

---

**最後更新**: 2024年12月
**狀態**: Seed 問題已修復，提供多種解決方案