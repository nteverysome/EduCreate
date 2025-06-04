# NextAuth.js 驗證系統除錯指南

## 🎯 目標
確保 NextAuth.js 驗證系統正常運作，解決登入相關問題。

## 📋 檢查清單

### 1. 環境設定檢查
- [ ] `.env` 檔案存在且包含必要變數
- [ ] PostgreSQL 服務正在運行
- [ ] 資料庫連接正常
- [ ] 測試用戶已建立

### 2. 依賴檢查
- [ ] `next-auth` 已安裝
- [ ] `@next-auth/prisma-adapter` 已安裝
- [ ] `@prisma/client` 已安裝
- [ ] `bcryptjs` 已安裝

### 3. 檔案結構檢查
- [ ] `pages/api/auth/[...nextauth].ts` 存在
- [ ] `lib/auth.ts` 存在且配置正確
- [ ] `pages/login.tsx` 存在
- [ ] `prisma/schema.prisma` 包含 User 模型

## 🚀 快速設定步驟

### 方法 1: 使用批次檔 (推薦)
```bash
# 執行自動設定腳本
.\setup-auth-debug.bat
```

### 方法 2: 使用 PowerShell
```powershell
# 執行 PowerShell 腳本
.\setup-auth-debug.ps1
```

### 方法 3: 手動執行
```bash
# 1. 安裝依賴
npm install

# 2. 生成 Prisma Client
npx prisma generate

# 3. 推送資料庫 schema
npx prisma db push

# 4. 建立測試用戶
npx prisma db seed

# 5. 執行診斷
node quick-auth-diagnosis.js

# 6. 啟動開發服務器
npm run dev
```

## 🔍 診斷工具

### 快速診斷腳本
執行 `quick-auth-diagnosis.js` 來檢查：
- 資料庫連接狀態
- 用戶數據
- 密碼加密驗證
- 環境變數設定

### 日誌追蹤
已在以下檔案加入詳細日誌：
- `lib/auth.ts` - NextAuth 驗證流程
- `pages/login.tsx` - 前端登入流程

## 🧪 測試帳號

| 角色 | Email | 密碼 | 用途 |
|------|-------|------|------|
| 管理員 | admin@example.com | password123 | 完整權限測試 |
| 普通用戶 | user@example.com | password123 | 基本功能測試 |
| 高級用戶 | premium@example.com | password123 | 付費功能測試 |

## 🐛 常見問題排查

### 問題 1: 401 Unauthorized
**症狀**: API 請求返回 401 錯誤

**可能原因**:
- NextAuth 配置錯誤
- 資料庫連接失敗
- 用戶不存在或密碼錯誤

**解決方案**:
1. 檢查瀏覽器控制台日誌
2. 檢查服務器終端日誌
3. 確認測試用戶存在
4. 驗證密碼加密正確

### 問題 2: 資料庫連接失敗
**症狀**: Prisma 連接錯誤

**解決方案**:
1. 確認 PostgreSQL 服務運行
2. 檢查 `.env` 中的 `DATABASE_URL`
3. 執行 `npx prisma db push`

### 問題 3: 用戶不存在
**症狀**: 登入時提示用戶不存在

**解決方案**:
1. 執行 `npx prisma db seed`
2. 使用診斷腳本檢查用戶數據

## 📊 日誌解讀

### NextAuth 日誌標識
- 🔐 `NextAuth authorize 被調用` - 開始驗證
- 🔍 `查找用戶` - 查詢資料庫
- 🔑 `驗證密碼` - 密碼比對
- ✅ `用戶驗證成功` - 驗證通過
- ❌ `錯誤訊息` - 驗證失敗

### 前端日誌標識
- 🚀 `開始登入流程` - 表單提交
- 📤 `NextAuth signIn 調用` - 呼叫 NextAuth
- ✅ `登入成功` - 驗證成功
- 🔄 `重定向到` - 頁面跳轉

## 🔧 環境變數設定

確保 `.env` 檔案包含：

```env
# 資料庫
DATABASE_URL="postgresql://postgres:z089336161@localhost:5432/educreate?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OAuth (可選)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_ID="your-github-id"
GITHUB_SECRET="your-github-secret"
```

## 🎯 驗證流程

1. **前端提交** → `pages/login.tsx`
2. **NextAuth 處理** → `pages/api/auth/[...nextauth].ts`
3. **驗證邏輯** → `lib/auth.ts`
4. **資料庫查詢** → Prisma + PostgreSQL
5. **密碼驗證** → bcrypt
6. **會話建立** → NextAuth Session
7. **重定向** → `/dashboard`

## 📞 支援

如果問題持續存在：
1. 檢查所有日誌輸出
2. 確認資料庫服務狀態
3. 驗證環境變數設定
4. 重新執行設定腳本

---

**最後更新**: 2024年12月
**狀態**: NextAuth.js 驗證系統已完整實現並加入詳細除錯功能