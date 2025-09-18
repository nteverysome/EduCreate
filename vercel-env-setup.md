# Vercel 環境變數配置指南

## 🎉 部署狀態
✅ **部署成功！**
- **生產 URL**: https://edu-create-57xh685mp-minamisums-projects.vercel.app
- **檢查 URL**: https://vercel.com/minamisums-projects/edu-create/Fkra5mPx1Qdy8FQvRnujqUdjvF4D

## 🔧 環境變數配置

### 步驟 1: 前往 Vercel 項目設置
1. 打開：https://vercel.com/minamisums-projects/edu-create
2. 點擊 **Settings** 標籤
3. 點擊左側的 **Environment Variables**

### 步驟 2: 添加必要的環境變數

#### 🗄️ 資料庫配置
```bash
變數名: DATABASE_URL
值: postgresql://neondb_owner:npg_JiVYrWK7L6Ff@ep-curly-salad-a85exs3f-pooler.eastus2.azure.neon.tech/neondb?sslmode=require
環境: Production, Preview, Development
```

#### 🔐 NextAuth 配置
```bash
變數名: NEXTAUTH_URL
值: https://edu-create-57xh685mp-minamisums-projects.vercel.app
環境: Production

變數名: NEXTAUTH_SECRET
值: your-super-secret-key-here-make-it-long-and-random
環境: Production, Preview, Development
```

#### 📧 郵件配置 (可選)
```bash
變數名: EMAIL_SERVER_HOST
值: smtp.gmail.com
環境: Production

變數名: EMAIL_SERVER_PORT
值: 587
環境: Production

變數名: EMAIL_SERVER_USER
值: your-email@gmail.com
環境: Production

變數名: EMAIL_SERVER_PASSWORD
值: your-app-password
環境: Production

變數名: EMAIL_FROM
值: noreply@yourdomain.com
環境: Production
```

### 步驟 3: 生成 NEXTAUTH_SECRET
運行以下命令生成安全的密鑰：
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 步驟 4: 重新部署
配置完環境變數後，觸發重新部署：
1. 前往 Vercel 項目頁面
2. 點擊 **Deployments** 標籤
3. 點擊最新部署旁的 **...** 按鈕
4. 選擇 **Redeploy**

## 🧪 部署後測試

### 基本功能測試
- [ ] 主頁載入：https://edu-create-57xh685mp-minamisums-projects.vercel.app
- [ ] API 健康檢查：https://edu-create-57xh685mp-minamisums-projects.vercel.app/api/health
- [ ] 遊戲頁面：https://edu-create-57xh685mp-minamisums-projects.vercel.app/games
- [ ] Shimozurdo 遊戲：https://edu-create-57xh685mp-minamisums-projects.vercel.app/games/shimozurdo-game

### 進階功能測試
- [ ] 用戶註冊/登入
- [ ] 資料庫連接
- [ ] 遊戲功能
- [ ] 響應式設計

## 🚨 常見問題

### 如果遇到 500 錯誤
1. 檢查 Vercel 函數日誌
2. 確認環境變數設置正確
3. 檢查資料庫連接

### 如果遊戲無法載入
1. 檢查靜態資源路徑
2. 確認 CORS 設置
3. 檢查瀏覽器控制台錯誤

## 📞 支援
如有問題，請檢查：
- Vercel 部署日誌
- 瀏覽器開發者工具
- 網絡請求狀態
