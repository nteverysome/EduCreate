# Vercel 部署故障排除指南

## 🚨 常見部署問題及解決方案

### 1. 環境變數配置

確保在 Vercel 項目設置中配置以下環境變數：

```bash
# 必需的環境變數
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-secret-key-here
NODE_ENV=production
```

### 2. Prisma 構建問題

如果遇到 Prisma 相關錯誤：

1. 確保 `package.json` 包含正確的構建腳本：
```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

2. 檢查 `prisma/schema.prisma` 中的數據庫連接：
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 3. Node.js 版本問題

確保使用正確的 Node.js 版本：
- 項目根目錄有 `.nvmrc` 文件指定版本 18.17.0
- `vercel.json` 中指定 runtime: "nodejs18.x"

### 4. 構建超時問題

如果構建超時，檢查：
1. `vercel.json` 中的 `maxDuration` 設置
2. 移除不必要的依賴項
3. 優化構建過程

### 5. 靜態文件問題

確保所有靜態文件在 `public/` 目錄中，並且路徑正確。

## 🔧 快速修復步驟

### 步驟 1: 檢查環境變數
```bash
# 在 Vercel Dashboard 中設置
DATABASE_URL=your_neondb_connection_string
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-secret-key
```

### 步驟 2: 重新部署
```bash
# 推送最新更改
git add .
git commit -m "Fix Vercel deployment configuration"
git push origin feat/neondb-integration-and-typescript-fixes
```

### 步驟 3: 檢查構建日誌
1. 訪問 Vercel Dashboard
2. 查看 "Functions" 標籤中的錯誤
3. 檢查 "Build Logs" 中的詳細錯誤信息

## 🎯 部署檢查清單

- [ ] 環境變數已在 Vercel 中配置
- [ ] NeonDB 連接字符串正確
- [ ] `package.json` 包含 Prisma 生成腳本
- [ ] `.nvmrc` 文件存在
- [ ] `vercel.json` 配置正確
- [ ] 本地構建成功 (`npm run build`)
- [ ] 所有 TypeScript 錯誤已修復

## 📞 獲取幫助

如果問題仍然存在：
1. 檢查 Vercel 構建日誌中的具體錯誤信息
2. 確認 NeonDB 連接字符串格式正確
3. 驗證所有環境變數都已設置

## 🚀 成功部署後

部署成功後，訪問以下 URL 測試功能：
- 主頁: `https://your-app.vercel.app/`
- MVP 遊戲: `https://your-app.vercel.app/mvp-games`
- 登入頁面: `https://your-app.vercel.app/login`