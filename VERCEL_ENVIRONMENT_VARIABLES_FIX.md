# 🔧 Vercel 環境變數設定指南 - 修復 401 錯誤

## 🚨 問題根源

你的 EduCreate 專案出現 401 錯誤是因為 **Vercel 環境變數沒有正確設定**，特別是 NextAuth 和資料庫連接相關的變數。

## ✅ 必須設定的環境變數

### 1. 🔐 NextAuth 核心變數 (最重要！)

```bash
NEXTAUTH_URL=https://你的vercel網址.vercel.app
NEXTAUTH_SECRET=你的隨機密鑰
```

**生成 NEXTAUTH_SECRET：**
```bash
# 方法1: 使用 openssl
openssl rand -base64 32

# 方法2: 使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 方法3: 線上生成器
# https://generate-secret.vercel.app/32
```

### 2. 🗄️ Neon 資料庫連接

```bash
DATABASE_URL=postgresql://用戶名:密碼@主機:5432/資料庫名?sslmode=require
```

**從你的 Neon 控制台獲取：**
- 進入：https://console.neon.tech/app/projects/dry-cloud-00816876/branches
- 複製 Connection String
- 格式類似：`postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require`

### 3. 🔑 OAuth 提供者 (如果使用)

```bash
# Google OAuth (如果啟用)
GOOGLE_CLIENT_ID=你的Google客戶端ID
GOOGLE_CLIENT_SECRET=你的Google客戶端密鑰

# GitHub OAuth (如果啟用)
GITHUB_ID=你的GitHub應用ID
GITHUB_SECRET=你的GitHub應用密鑰
```

### 4. 📧 郵件服務 (如果使用密碼重置)

```bash
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=你的郵箱@gmail.com
EMAIL_SERVER_PASSWORD=你的應用密碼
EMAIL_SERVER_SECURE=false
EMAIL_FROM=noreply@你的網域.com
```

## 🛠️ Vercel 設定步驟

### 步驟 1: 進入 Vercel 專案設定
1. 登入 Vercel Dashboard
2. 選擇你的 EduCreate 專案
3. 點擊 **Settings** 標籤
4. 選擇 **Environment Variables**

### 步驟 2: 添加必要變數

**最低要求 (必須設定)：**
```
NEXTAUTH_URL = https://你的vercel網址.vercel.app
NEXTAUTH_SECRET = [生成的32字符隨機字串]
DATABASE_URL = [從Neon複製的完整連接字串]
```

### 步驟 3: 設定環境
- **Environment**: 選擇 `Production`, `Preview`, `Development` (全選)
- **Value**: 貼上對應的值

### 步驟 4: 重新部署
設定完成後，點擊 **Deployments** → **Redeploy** 最新版本

## 🎯 快速檢查清單

```bash
✅ NEXTAUTH_URL 設定為正確的 Vercel 網址
✅ NEXTAUTH_SECRET 是 32+ 字符的隨機字串
✅ DATABASE_URL 是有效的 Neon PostgreSQL 連接字串
✅ 所有變數都設定為 Production 環境
✅ 重新部署專案
```

## 🔍 驗證設定

設定完成後，測試這些 URL：

```bash
# 健康檢查
https://你的網址.vercel.app/api/health

# NextAuth 狀態
https://你的網址.vercel.app/api/auth/session

# 登入頁面
https://你的網址.vercel.app/login
```

## 🚨 常見錯誤

### 錯誤 1: NEXTAUTH_URL 不正確
```bash
❌ NEXTAUTH_URL=http://localhost:3000
✅ NEXTAUTH_URL=https://你的vercel網址.vercel.app
```

### 錯誤 2: NEXTAUTH_SECRET 太短或空白
```bash
❌ NEXTAUTH_SECRET=""
❌ NEXTAUTH_SECRET="123"
✅ NEXTAUTH_SECRET="Zx8K9mN2pQ7rS4tU6vW8xY1zA3bC5dE7fG9hI0jK2lM4nO6pQ8rS0tU2vW4xY6zA"
```

### 錯誤 3: DATABASE_URL 格式錯誤
```bash
❌ DATABASE_URL="postgresql://localhost:5432/educreate"
✅ DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

## 🎊 預期結果

設定正確後：
- ✅ 網站可以正常訪問 (不再 401)
- ✅ 用戶可以註冊/登入
- ✅ 資料庫連接正常
- ✅ 所有 API 端點可用

---

**🔥 重點：NEXTAUTH_URL 和 NEXTAUTH_SECRET 是解決 401 錯誤的關鍵！**