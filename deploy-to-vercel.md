# 🚀 EduCreate Vercel 部署指南

## 📋 部署前檢查清單

✅ **代碼狀態**
- TypeScript 編譯：通過 ✅
- 構建測試：通過 ✅  
- Neon 數據庫：已配置 ✅
- MVP 遊戲：已測試 ✅

## 🔧 Vercel 環境變量設置

請在 Vercel 項目設置中添加以下環境變量：

### 必需的環境變量

```bash
# 數據庫配置
DATABASE_URL=postgresql://neondb_owner:npg_JiVYrWK7L6Ff@ep-curly-salad-a85exs3f-pooler.eastus2.azure.neon.tech/neondb?sslmode=require

# NextAuth 配置
NEXTAUTH_URL=https://edu-create-minamisums-projects.vercel.app
NEXTAUTH_SECRET=your-production-secret-key-here

# H5P 配置
NEXT_PUBLIC_H5P_BASE_PATH=
```

### 可選的環境變量（如需要）

```bash
# 郵件服務器配置
EMAIL_SERVER_HOST=smtp.example.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@example.com
EMAIL_SERVER_PASSWORD=your-email-password
EMAIL_FROM=noreply@educreate.com

# Stripe 配置
STRIPE_SECRET_KEY=sk_test_example
STRIPE_WEBHOOK_SECRET=whsec_example
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_example
```

## 🚀 部署步驟

### 方法 1：通過 Vercel Dashboard

1. 訪問：https://vercel.com/minamisums-projects/edu-create
2. 點擊 "Settings" → "Environment Variables"
3. 添加上述環境變量
4. 點擊 "Deployments" → "Redeploy"
5. 選擇最新的 commit 進行部署

### 方法 2：通過 Git 自動部署

1. 合併 PR #2 到 master 分支
2. Vercel 會自動檢測到更改並開始部署
3. 等待部署完成

## 🎮 測試部署

部署完成後，訪問以下 URL 測試功能：

- **主頁**：https://edu-create-minamisums-projects.vercel.app
- **MVP 遊戲**：https://edu-create-minamisums-projects.vercel.app/mvp-games
- **登錄頁面**：https://edu-create-minamisums-projects.vercel.app/login

## 🔍 故障排除

如果部署失敗，檢查：

1. **構建日誌**：在 Vercel Dashboard 查看詳細錯誤
2. **環境變量**：確保所有必需變量已設置
3. **數據庫連接**：確認 Neon 數據庫可訪問

## 📞 支持

如需幫助，請檢查：
- Vercel 部署日誌
- GitHub PR #2 的詳細信息
- `DEPLOYMENT.md` 完整部署指南

---

**🎉 準備就緒！您的 EduCreate MVP 已準備好部署到生產環境！**