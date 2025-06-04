# Supabase 遷移指南

本指南將協助您將 EduCreate 專案從 PostgreSQL 遷移到 Supabase。

## 📋 遷移步驟

### 1. 建立 Supabase 專案

1. 前往 [Supabase Dashboard](https://supabase.com/dashboard)
2. 點擊 "New Project"
3. 選擇組織並填寫專案資訊：
   - **Project Name**: `educreate`
   - **Database Password**: 設定一個強密碼
   - **Region**: 選擇最接近的區域
4. 等待專案建立完成（約 2-3 分鐘）

### 2. 取得 Supabase 連接資訊

專案建立完成後，前往 **Settings > API**：

- **Project URL**: `https://your-project-id.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

前往 **Settings > Database**：

- **Connection String**: `postgresql://postgres:[YOUR-PASSWORD]@db.your-project-id.supabase.co:5432/postgres`

### 3. 更新環境變數

編輯 `.env` 檔案，更新以下變數：

```env
# Supabase 設定
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.your-project-id.supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# 保留現有的其他設定
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"
# ... 其他設定
```

### 4. 執行資料庫遷移

#### 方法 A: 使用 Supabase SQL Editor

1. 前往 Supabase Dashboard > **SQL Editor**
2. 建立新查詢
3. 複製並執行 `supabase-migration.sql` 的內容
4. 複製並執行 `supabase-seed.sql` 的內容（可選，用於測試資料）

#### 方法 B: 使用 Supabase CLI

```bash
# 安裝 Supabase CLI
npm install -g supabase

# 登入 Supabase
supabase login

# 連接到專案
supabase link --project-ref your-project-id

# 執行遷移
supabase db reset
```

### 5. 安裝 Supabase 客戶端

```bash
npm install @supabase/supabase-js
```

### 6. 更新 NextAuth 設定

編輯 `pages/api/auth/[...nextauth].ts`：

```typescript
import { authOptionsSupabase } from '../../../lib/auth-supabase';

export default NextAuth(authOptionsSupabase);
```

### 7. 測試遷移

1. 啟動開發伺服器：
   ```bash
   npm run dev
   ```

2. 前往 `http://localhost:3000/register` 註冊新帳號

3. 前往 `http://localhost:3000/login` 測試登入

4. 檢查 Supabase Dashboard > **Table Editor** 確認資料已正確儲存

## 🔧 已建立的檔案

- `lib/supabase.ts` - Supabase 客戶端設定
- `lib/auth-supabase.ts` - NextAuth Supabase 設定
- `pages/api/auth/register-supabase.ts` - Supabase 註冊 API
- `supabase-migration.sql` - 資料庫結構遷移腳本
- `supabase-seed.sql` - 測試資料種子腳本

## 🧪 測試帳號

遷移完成後，您可以使用以下測試帳號：

- **管理員帳號**:
  - Email: `admin@example.com`
  - Password: `password123`

- **一般用戶**:
  - Email: `user@example.com`
  - Password: `password123`

## 🔒 安全性設定

Supabase 已啟用 Row Level Security (RLS)，確保：

- 用戶只能存取自己的資料
- 管理員可以存取所有資料
- 未認證用戶無法存取敏感資料

## 📊 監控和分析

Supabase Dashboard 提供：

- **Database**: 即時資料庫監控
- **Auth**: 用戶認證統計
- **Storage**: 檔案儲存管理
- **Edge Functions**: 無伺服器函數
- **Logs**: 詳細的系統日誌

## 🚨 注意事項

1. **備份資料**: 遷移前請備份現有的 PostgreSQL 資料
2. **環境變數**: 確保所有環境變數都已正確設定
3. **API 金鑰**: 請妥善保管 Service Role Key，不要提交到版本控制
4. **RLS 政策**: 根據需求調整 Row Level Security 政策
5. **效能**: 監控查詢效能，必要時建立索引

## 🆘 疑難排解

### 連接問題
- 檢查 `DATABASE_URL` 是否正確
- 確認 Supabase 專案狀態為 "Active"
- 檢查網路連接和防火牆設定

### 認證問題
- 確認 NextAuth 設定正確
- 檢查 JWT 密鑰設定
- 驗證 Supabase API 金鑰

### 資料問題
- 檢查 RLS 政策設定
- 確認資料表結構正確
- 驗證外鍵約束

## 📞 支援

如果遇到問題，可以：

1. 查看 [Supabase 官方文件](https://supabase.com/docs)
2. 檢查 [NextAuth.js 文件](https://next-auth.js.org/)
3. 查看專案的 console 日誌
4. 檢查 Supabase Dashboard 的 Logs 頁面