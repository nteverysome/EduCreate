# 🚨 Vercel 部署修復指南

## 🎯 當前問題分析

根據部署失敗的情況，主要問題是缺少必需的環境變數配置。

## 🔧 立即修復步驟

### 步驟 1: 配置環境變數

**訪問 Vercel Dashboard**:
👉 https://vercel.com/minamisums-projects/edu-create/settings/environment-variables

**添加以下環境變數** (點擊 "Add" 按鈕):

#### 1. NEXTAUTH_URL
```
Name: NEXTAUTH_URL
Value: https://edu-create.vercel.app
Environments: ✅ Production ✅ Preview ✅ Development
```

#### 2. NEXTAUTH_SECRET
```
Name: NEXTAUTH_SECRET
Value: 602be0cd8063b79b5ac949fae32f61f1e6db40b0e5ac32b15b03341e0d0b3b45
Environments: ✅ Production ✅ Preview ✅ Development
```

#### 3. NODE_ENV
```
Name: NODE_ENV
Value: production
Environments: ✅ Production ✅ Preview ✅ Development
```

#### 4. DATABASE_URL (從 NeonDB 獲取)
```
Name: DATABASE_URL
Value: [從 NeonDB 控制台複製完整連接字符串]
Environments: ✅ Production ✅ Preview ✅ Development
```

**獲取 NeonDB 連接字符串**:
1. 訪問: https://console.neon.tech/app/projects/dry-cloud-00816876
2. 點擊 "Connection string"
3. 複製 "Pooled connection" 字符串
4. 格式應該類似: `postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require`

### 步驟 2: 重新部署

1. **保存環境變數** 後，訪問部署頁面:
   👉 https://vercel.com/minamisums-projects/edu-create

2. **點擊最新的部署**

3. **點擊 "Redeploy" 按鈕**

4. **等待構建完成** (約 2-3 分鐘)

### 步驟 3: 驗證部署

部署成功後，測試以下 URL:

1. **主頁**: https://edu-create.vercel.app/
2. **MVP 遊戲**: https://edu-create.vercel.app/mvp-games
3. **登入頁面**: https://edu-create.vercel.app/login

## 🐛 常見錯誤及解決方案

### 錯誤 1: "NEXTAUTH_URL is not defined"
**解決方案**: 確保 `NEXTAUTH_URL` 環境變數已正確設置

### 錯誤 2: "Cannot connect to database"
**解決方案**: 檢查 `DATABASE_URL` 格式是否正確，確保包含 `?sslmode=require`

### 錯誤 3: "Prisma Client not found"
**解決方案**: 我們已經在 `package.json` 中添加了 `postinstall` 腳本，這應該自動解決

### 錯誤 4: "Build timeout"
**解決方案**: 檢查 `vercel.json` 中的 `maxDuration` 設置

## 📋 環境變數檢查清單

- [ ] `NEXTAUTH_URL` = `https://edu-create.vercel.app`
- [ ] `NEXTAUTH_SECRET` = `[32字符隨機字符串]`
- [ ] `NODE_ENV` = `production`
- [ ] `DATABASE_URL` = `[NeonDB 連接字符串]`

## 🚀 部署成功確認

部署成功後，你應該能夠:

✅ 訪問主頁並看到完整的 EduCreate 界面
✅ 進入 `/mvp-games` 並玩所有 5 個遊戲:
   - 📝 Quiz Game (測驗遊戲)
   - 🎯 Matching Game (配對遊戲)
   - 📚 Flashcard Game (單字卡遊戲)
   - 🔨 Whack-a-Mole (打地鼠遊戲)
   - 🎡 Spin Wheel (轉盤遊戲)
✅ 登入/註冊功能正常
✅ 所有 API 端點響應正常

## 🆘 如果仍然失敗

1. **檢查構建日誌**:
   - 在 Vercel Dashboard 中點擊失敗的部署
   - 查看 "Build Logs" 中的詳細錯誤信息

2. **驗證環境變數**:
   - 確保所有環境變數都已正確設置
   - 檢查 NeonDB 連接字符串格式

3. **重新觸發部署**:
   - 推送一個小的更改到 GitHub
   - 或在 Vercel 中手動點擊 "Redeploy"

## 📞 獲取幫助

如果問題持續存在，請檢查:
- Vercel 構建日誌中的具體錯誤信息
- NeonDB 數據庫連接狀態
- GitHub Actions 是否正常運行

---

**🎉 按照以上步驟，你的 EduCreate 平台應該能夠成功部署並運行！**