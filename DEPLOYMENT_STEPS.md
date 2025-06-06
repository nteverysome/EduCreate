# 🚀 EduCreate Vercel 部署步驟

## 📋 部署前檢查清單

✅ **已完成的修復**：
- [x] 修復所有 TypeScript 錯誤
- [x] 配置 NeonDB 數據庫連接
- [x] 更新 package.json 構建腳本
- [x] 添加 Prisma 生成到構建過程
- [x] 指定 Node.js 版本 (18.17.0)
- [x] 優化 vercel.json 配置
- [x] 本地構建測試成功

## 🔧 Vercel 部署步驟

### 步驟 1: 準備 Vercel 項目

1. **登入 Vercel Dashboard**
   - 訪問 https://vercel.com/dashboard
   - 使用 GitHub 帳號登入

2. **導入 GitHub 倉庫**
   - 點擊 "New Project"
   - 選擇 `nteverysome/EduCreate` 倉庫
   - 選擇分支: `feat/neondb-integration-and-typescript-fixes`

### 步驟 2: 配置環境變數

在 Vercel 項目設置中添加以下環境變數：

```bash
# 數據庫連接 (必需)
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# NextAuth 配置 (必需)
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-super-secret-key-here

# 生產環境標識
NODE_ENV=production

# Google OAuth (可選)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth (可選)
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret
```

### 步驟 3: 部署配置

確保以下文件配置正確：

**package.json** (已更新):
```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

**vercel.json** (已更新):
```json
{
  "functions": {
    "pages/api/**/*.js": {
      "maxDuration": 30,
      "runtime": "nodejs18.x"
    }
  }
}
```

**.nvmrc** (已創建):
```
18.17.0
```

### 步驟 4: 執行部署

1. **自動部署**
   - Vercel 會自動檢測到 GitHub 推送
   - 監控構建過程在 Vercel Dashboard

2. **手動觸發** (如需要)
   ```bash
   # 在本地推送更改
   git push origin feat/neondb-integration-and-typescript-fixes
   ```

### 步驟 5: 驗證部署

部署完成後，測試以下功能：

1. **主頁訪問**
   - URL: `https://your-app.vercel.app/`
   - 檢查頁面正常載入

2. **MVP 遊戲頁面**
   - URL: `https://your-app.vercel.app/mvp-games`
   - 測試所有 5 個遊戲功能

3. **API 端點**
   - 測試登入功能
   - 檢查數據庫連接

## 🐛 故障排除

### 常見錯誤及解決方案

**1. Prisma 生成錯誤**
```
Error: Cannot find module '.prisma/client'
```
**解決方案**: 確保 `postinstall` 腳本包含 `prisma generate`

**2. 數據庫連接錯誤**
```
Error: Can't reach database server
```
**解決方案**: 檢查 `DATABASE_URL` 環境變數格式

**3. NextAuth 配置錯誤**
```
Error: NEXTAUTH_URL is not set
```
**解決方案**: 在 Vercel 環境變數中設置正確的 URL

**4. 構建超時**
```
Error: Build exceeded maximum duration
```
**解決方案**: 檢查 `vercel.json` 中的 `maxDuration` 設置

### 檢查構建日誌

1. 訪問 Vercel Dashboard
2. 選擇你的項目
3. 點擊 "Functions" 標籤
4. 查看詳細錯誤信息

## 🎯 部署成功確認

部署成功後，你應該能夠：

- ✅ 訪問主頁並看到完整的 UI
- ✅ 進入 `/mvp-games` 並玩所有 5 個遊戲
- ✅ 使用登入/註冊功能
- ✅ API 端點正常響應
- ✅ 數據庫操作正常

## 📞 獲取支援

如果遇到問題：

1. **檢查 Vercel 構建日誌**
2. **參考 VERCEL_TROUBLESHOOTING.md**
3. **確認所有環境變數已正確設置**
4. **驗證 NeonDB 連接字符串**

## 🚀 下一步

部署成功後：
1. 設置自定義域名 (可選)
2. 配置 Analytics
3. 設置監控和警報
4. 準備生產數據

---

**🎉 恭喜！你的 EduCreate 平台現在已經準備好為用戶提供互動式教育遊戲體驗！**