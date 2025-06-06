# Vercel 部署指南

## 🎉 專案狀態
✅ **構建成功** - 所有 TypeScript 錯誤已修復
✅ **資料庫連接** - 已配置 NeonDB PostgreSQL
✅ **MVP 遊戲** - 5個互動遊戲可立即遊玩
✅ **代碼推送** - 最新代碼已推送到 GitHub

## 🚀 部署步驟

### 1. 登入 Vercel
前往 https://vercel.com/minamisums-projects

### 2. 導入專案
- 點擊 "New Project"
- 選擇 GitHub 倉庫：`nteverysome/EduCreate`
- 點擊 "Import"

### 3. 配置環境變數
在 Vercel 專案設定中添加以下環境變數：

```bash
DATABASE_URL=postgresql://neondb_owner:npg_JiVYrWK7L6Ff@ep-curly-salad-a85exs3f-pooler.eastus2.azure.neon.tech/neondb?sslmode=require
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
NEXTAUTH_SECRET=your-production-secret-key
```

### 4. 部署設定
- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### 5. 部署
點擊 "Deploy" 按鈕開始部署

## 🎮 可用功能

### MVP 遊戲 (`/mvp-games`)
1. **📝 測驗問答** - 數學問題測試
2. **🔗 配對遊戲** - 中英文詞彙配對
3. **📚 單字卡片** - 英語學習卡片
4. **🔨 打地鼠** - 快速反應遊戲
5. **🎯 隨機轉盤** - 隨機選擇工具

### 其他頁面
- `/` - 主頁
- `/dashboard` - 儀表板
- `/create` - 創建活動
- `/templates` - 模板庫

## 🔧 技術規格

- **框架**: Next.js 14.0.1
- **資料庫**: NeonDB (PostgreSQL)
- **ORM**: Prisma
- **樣式**: Tailwind CSS
- **認證**: NextAuth.js
- **部署**: Vercel

## 📝 注意事項

1. 確保 NeonDB 資料庫允許外部連接
2. 生產環境請使用強密碼作為 NEXTAUTH_SECRET
3. 首次部署後可能需要運行 `npx prisma db push` 來同步資料庫結構

## 🎯 部署後測試

部署完成後，訪問以下 URL 測試功能：
- `https://your-domain.vercel.app/mvp-games` - MVP 遊戲頁面
- `https://your-domain.vercel.app/api/health` - API 健康檢查

## 🐛 故障排除

如果遇到問題：
1. 檢查 Vercel 部署日誌
2. 確認環境變數設定正確
3. 檢查 NeonDB 連接狀態
4. 查看瀏覽器控制台錯誤

---

**專案已準備就緒，可以立即部署到 Vercel！** 🚀