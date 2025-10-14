# EduCreate 部署和運維指南

## 🚀 部署架構

### **當前部署配置**
- **主機平台**：Vercel
- **數據庫**：Neon PostgreSQL
- **域名**：https://edu-create.vercel.app
- **CDN**：Vercel Edge Network
- **Git 集成**：GitHub 自動部署

### **部署流程圖**
```
本地開發 → Git Push → GitHub → Vercel 自動部署 → 生產環境
    ↓           ↓         ↓            ↓            ↓
  npm run dev  master   Webhook    Build & Deploy  Live Site
```

## 🔧 環境配置

### **Vercel 環境變數**
```env
# 數據庫配置
DATABASE_URL=postgresql://neondb_owner:npg_JiVYrWK7L6Ff@ep-curly-salad-a85exs3f-pooler.eastus2.azure.neon.tech/neondb?sslmode=require

# NextAuth 配置
NEXTAUTH_URL=https://edu-create.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-here

# Google OAuth
GOOGLE_CLIENT_ID=413488883106-4cupim9raccabso21l0v3t40md134hvq.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-google-client-secret-here

# GitHub OAuth (可選)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### **本地開發環境變數**
```env
# .env 文件 (與生產環境保持一致)
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret-key"
GOOGLE_CLIENT_ID="413488883106-..."
GOOGLE_CLIENT_SECRET="GOCSPX-..."
```

## 📦 部署步驟

### **自動部署 (推薦)**
```bash
# 1. 提交代碼變更
git add .
git commit -m "feat: 新功能描述"
git push origin master

# 2. Vercel 自動觸發部署
# 3. 等待部署完成 (通常 1-2 分鐘)
# 4. 驗證部署結果
```

### **手動部署**
```bash
# 1. 安裝 Vercel CLI
npm i -g vercel

# 2. 登入 Vercel
vercel login

# 3. 部署到生產環境
vercel --prod

# 4. 確認部署狀態
vercel ls
```

### **回滾部署**
```bash
# 1. 查看部署歷史
vercel ls

# 2. 回滾到指定版本
vercel rollback [deployment-url]

# 3. 或通過 Vercel Dashboard 回滾
```

## 🗄️ 數據庫管理

### **Neon PostgreSQL 配置**
- **提供者**：Neon (https://neon.tech)
- **區域**：East US 2 (Azure)
- **連接池**：啟用
- **SSL**：必需

### **數據庫操作**
```bash
# 查看數據庫狀態
npx prisma db pull

# 推送 Schema 變更
npx prisma db push

# 生成 Prisma 客戶端
npx prisma generate

# 打開數據庫管理界面
npx prisma studio
```

### **數據庫備份**
```bash
# 導出數據庫結構
pg_dump -h ep-curly-salad-a85exs3f-pooler.eastus2.azure.neon.tech -U neondb_owner -d neondb --schema-only > schema.sql

# 導出數據
pg_dump -h ep-curly-salad-a85exs3f-pooler.eastus2.azure.neon.tech -U neondb_owner -d neondb --data-only > data.sql

# 完整備份
pg_dump -h ep-curly-salad-a85exs3f-pooler.eastus2.azure.neon.tech -U neondb_owner -d neondb > full_backup.sql
```

## 📊 監控和日誌

### **Vercel 監控**
- **部署狀態**：Vercel Dashboard → Deployments
- **函數性能**：Vercel Dashboard → Functions
- **錯誤日誌**：Vercel Dashboard → Function Logs
- **分析數據**：Vercel Dashboard → Analytics

### **數據庫監控**
- **Neon 控制台**：https://console.neon.tech
- **連接數監控**：Neon Dashboard → Monitoring
- **查詢性能**：Neon Dashboard → Queries
- **存儲使用**：Neon Dashboard → Storage

### **應用監控**
```bash
# 檢查應用健康狀態
curl https://edu-create.vercel.app/api/backend/health

# 檢查數據庫連接
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.count().then(count => {
  console.log('用戶數量:', count);
  process.exit(0);
}).catch(err => {
  console.error('數據庫連接失敗:', err);
  process.exit(1);
});
"
```

## 🚨 故障排除

### **部署失敗**
```bash
# 檢查構建日誌
vercel logs [deployment-url]

# 常見問題：
# 1. 環境變數缺失
# 2. 依賴包版本衝突
# 3. TypeScript 編譯錯誤
# 4. 數據庫連接失敗
```

### **數據庫連接問題**
```bash
# 檢查連接字串
echo $DATABASE_URL

# 測試連接
npx prisma db pull

# 重新生成客戶端
npx prisma generate
```

### **OAuth 登入問題**
```bash
# 檢查環境變數
echo $GOOGLE_CLIENT_ID
echo $NEXTAUTH_URL

# 運行診斷腳本
node scripts/debug-google-oauth.js

# 修復 OAuth 問題
node scripts/fix-google-oauth-display.js
```

## 🔒 安全配置

### **Vercel 安全設置**
```javascript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};
```

### **環境變數安全**
- 使用 Vercel 環境變數管理
- 定期更換敏感密鑰
- 不在代碼中硬編碼密鑰
- 使用不同環境的不同密鑰

### **數據庫安全**
- 啟用 SSL 連接
- 使用連接池
- 定期更新密碼
- 限制 IP 訪問 (如需要)

## 📈 性能優化

### **Vercel 優化**
```javascript
// next.config.js
const nextConfig = {
  experimental: {
    optimizeCss: true,
  },
  images: {
    domains: ['lh3.googleusercontent.com'],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
};
```

### **數據庫優化**
```sql
-- 添加索引
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_activity_user_id ON "Activity"("userId");
CREATE INDEX idx_account_user_id ON "Account"("userId");

-- 查詢優化
EXPLAIN ANALYZE SELECT * FROM "User" WHERE email = 'user@example.com';
```

### **緩存策略**
```javascript
// API 路由緩存
export async function GET(request) {
  const response = await fetch('...');
  
  return new Response(response.body, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}
```

## 🔄 CI/CD 流程

### **當前流程**
```yaml
# GitHub Actions (未來考慮)
name: Deploy to Vercel
on:
  push:
    branches: [master]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm run test
      - name: Deploy to Vercel
        run: vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

### **部署檢查清單**
- [ ] 代碼審查通過
- [ ] 測試全部通過
- [ ] 環境變數同步
- [ ] 數據庫 Schema 兼容
- [ ] 功能測試驗證

## 📞 緊急聯繫

### **生產環境問題**
1. **檢查 Vercel 狀態**：https://vercel.com/status
2. **檢查 Neon 狀態**：https://neon.tech/status
3. **查看部署日誌**：Vercel Dashboard
4. **運行健康檢查**：`curl https://edu-create.vercel.app/api/backend/health`

### **緊急回滾流程**
1. 登入 Vercel Dashboard
2. 找到最後一個穩定部署
3. 點擊 "Promote to Production"
4. 確認回滾完成
5. 通知相關人員

### **數據庫緊急操作**
```bash
# 緊急備份
pg_dump [connection-string] > emergency_backup_$(date +%Y%m%d_%H%M%S).sql

# 檢查數據庫狀態
npx prisma db pull

# 重置連接
npx prisma generate
```

---

**最後更新**：2025-10-14
**維護者**：EduCreate 運維團隊
**緊急聯繫**：請查看項目 README 或聯繫項目負責人
