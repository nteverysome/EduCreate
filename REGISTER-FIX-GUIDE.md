# EduCreate 註冊功能修復指南

## 🆕 最新修復狀態 (2024年12月)

✅ **已完成的最新修復**：
- 優化了 `pages/api/auth/register.ts` 的 Prisma 實例管理
- 統一使用 `lib/prisma.ts` 中的 Prisma 實例，避免重複連接
- 增強了錯誤處理和調試日誌，提供詳細的錯誤診斷信息
- 添加了數據庫連接測試步驟，在註冊前驗證數據庫可用性
- 創建了新的診斷工具：`test-register-fix.js` 和 `fix-register-issue.bat`
- 改進了錯誤分類，包括連接錯誤、Prisma 初始化錯誤等

🔧 **新增的修復工具**：
- `test-register-fix.js` - 測試數據庫連接和註冊 API
- `fix-register-issue.bat` - 自動化修復腳本

---

## 🔍 問題診斷

### 常見註冊問題
1. **數據庫連接失敗** - PostgreSQL服務未運行
2. **API錯誤** - 註冊API配置問題
3. **前端錯誤** - 表單驗證或請求處理問題
4. **依賴問題** - Prisma客戶端未生成

## 🚀 自動修復方案

### 方案1: 運行批處理腳本（推薦）
```bash
# 在EduCreate目錄下運行
fix-register-issues.bat
```

### 方案2: 運行Node.js腳本
```bash
# 在EduCreate目錄下運行
node fix-register-issues.js
```

### 方案3: 數據庫初始化
```bash
# 如果數據庫問題嚴重，運行此腳本
node init-database.js
```

## 🔧 手動修復步驟

### 步驟1: 檢查PostgreSQL服務
```bash
# 檢查PostgreSQL是否運行
sc query postgresql*

# 或檢查端口5432是否被占用
netstat -an | findstr :5432
```

### 步驟2: 配置環境變量
確保 `.env.local` 文件包含正確的數據庫連接字符串：
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/educreate?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="this-is-a-secret-key-please-change-in-production"
NODE_ENV="development"
```

### 步驟3: 生成Prisma客戶端
```bash
npx prisma generate
```

### 步驟4: 推送數據庫架構
```bash
npx prisma db push
```

### 步驟5: 清理和重新安裝
```bash
# 清理緩存
rmdir /s .next
rmdir /s node_modules

# 重新安裝依賴
npm install
```

## 🧪 測試註冊功能

### 1. 啟動開發服務器
```bash
npm run dev
```

### 2. 訪問註冊頁面
打開瀏覽器訪問: http://localhost:3000/register

### 3. 測試註冊
使用以下測試數據：
- 姓名: Test User
- 郵箱: test@example.com
- 密碼: testpassword123
- 確認密碼: testpassword123

## 🐛 常見錯誤及解決方案

### 錯誤1: "數據庫連接失敗"
**原因**: PostgreSQL服務未運行
**解決方案**:
1. 啟動PostgreSQL服務
2. 檢查數據庫連接字符串
3. 確認數據庫用戶權限

### 錯誤2: "Prisma客戶端未生成"
**原因**: Prisma客戶端未正確生成
**解決方案**:
```bash
npx prisma generate
npm run dev
```

### 錯誤3: "此電子郵件已被註冊"
**原因**: 嘗試註冊已存在的郵箱
**解決方案**:
1. 使用不同的郵箱地址
2. 或清理測試數據

### 錯誤4: "密碼必須至少8個字符"
**原因**: 密碼長度不足
**解決方案**: 使用至少8個字符的密碼

### 錯誤5: "密碼不匹配"
**原因**: 密碼和確認密碼不一致
**解決方案**: 確保兩次輸入的密碼相同

## 📊 驗證修復結果

### 1. 檢查瀏覽器控制台
- 打開開發者工具 (F12)
- 查看Console標籤是否有錯誤
- 查看Network標籤檢查API請求

### 2. 檢查服務器日誌
- 查看終端中的錯誤信息
- 檢查數據庫連接狀態

### 3. 測試完整流程
1. 註冊新用戶
2. 檢查是否自動登入
3. 驗證重定向到儀表板

## 🔗 相關資源

- [Next.js 文檔](https://nextjs.org/docs)
- [Prisma 文檔](https://www.prisma.io/docs)
- [NextAuth.js 文檔](https://next-auth.js.org/)
- [PostgreSQL 下載](https://www.postgresql.org/download/)

## 📞 獲取幫助

如果問題仍然存在：
1. 檢查所有錯誤信息
2. 確認所有依賴已正確安裝
3. 驗證數據庫服務正常運行
4. 查看瀏覽器和服務器日誌

---

**注意**: 此指南適用於開發環境。生產環境部署需要額外的安全配置。