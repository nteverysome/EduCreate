# 🔧 EduCreate 註冊問題故障排除指南

## 🚨 緊急修復步驟

### 1. 快速診斷
```bash
# 運行診斷工具
node quick-diagnosis.js
```

### 2. 自動修復
```bash
# 運行自動修復腳本
fix-register-now.bat
```

### 3. 測試註冊功能
```bash
# 啟動開發服務器
npm run dev

# 在另一個終端測試API
node test-register.js
```

## 🔍 常見問題診斷

### 問題 1: 數據庫連接失敗
**症狀**: 註冊時出現 "Database connection failed" 錯誤

**解決方案**:
```bash
# 檢查 PostgreSQL 服務
sc query postgresql*

# 如果服務未運行，啟動服務
net start postgresql-x64-14

# 重新生成 Prisma 客戶端
npx prisma generate
npx prisma db push
```

### 問題 2: Prisma 客戶端未生成
**症狀**: "Cannot find module '@prisma/client'" 錯誤

**解決方案**:
```bash
# 生成 Prisma 客戶端
npx prisma generate

# 如果仍有問題，重新安裝
npm install @prisma/client
npx prisma generate
```

### 問題 3: 環境變量配置錯誤
**症狀**: "Environment variable not found" 錯誤

**解決方案**:
1. 檢查 `.env.local` 文件是否存在
2. 確保包含以下變量:
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/educreate"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

### 問題 4: 端口衝突
**症狀**: 服務器無法啟動或註冊請求失敗

**解決方案**:
```bash
# 檢查端口使用情況
netstat -ano | findstr :3000

# 如果端口被佔用，終止進程或使用其他端口
# 修改 package.json 中的 dev 腳本:
"dev": "next dev -p 3001"
```

## 🛠️ 手動修復步驟

### 步驟 1: 清理和重置
```bash
# 刪除緩存
rmdir /s /q .next
rmdir /s /q node_modules\.cache

# 重新安裝依賴
npm install
```

### 步驟 2: 重新配置數據庫
```bash
# 重置數據庫
npx prisma db push --force-reset

# 生成客戶端
npx prisma generate

# 運行種子數據（如果有）
npm run prisma:seed
```

### 步驟 3: 驗證配置
```bash
# 檢查 Prisma 連接
npx prisma db pull

# 檢查 Next.js 配置
npm run build
```

## 🧪 測試和驗證

### 1. API 測試
```bash
# 測試註冊 API
node test-register.js
```

### 2. 瀏覽器測試
1. 打開 http://localhost:3000/register
2. 填寫註冊表單
3. 打開瀏覽器開發者工具查看控制台
4. 檢查網絡請求和響應

### 3. 數據庫驗證
```bash
# 打開 Prisma Studio
npx prisma studio

# 檢查用戶表是否創建成功
```

## 📋 檢查清單

- [ ] PostgreSQL 服務正在運行
- [ ] `.env.local` 文件配置正確
- [ ] Prisma 客戶端已生成
- [ ] 數據庫架構已推送
- [ ] 依賴已正確安裝
- [ ] 開發服務器正在運行
- [ ] 瀏覽器控制台無錯誤
- [ ] 網絡請求成功

## 🆘 如果仍有問題

### 收集錯誤信息
1. **瀏覽器控制台錯誤**:
   - 按 F12 打開開發者工具
   - 查看 Console 和 Network 標籤
   - 截圖或複製錯誤信息

2. **服務器終端錯誤**:
   - 查看運行 `npm run dev` 的終端
   - 複製完整的錯誤堆棧

3. **數據庫連接測試**:
   ```bash
   # 測試數據庫連接
   npx prisma db pull
   ```

### 重新開始
如果所有方法都失敗，可以考慮重新設置:

```bash
# 備份重要文件
copy .env.local .env.backup

# 完全重置
rmdir /s /q node_modules
rmdir /s /q .next
rmdir /s /q prisma\migrations

# 重新安裝
npm install
npx prisma generate
npx prisma db push

# 啟動服務器
npm run dev
```

## 📞 獲取幫助

如果問題仍然存在，請提供以下信息：

1. 錯誤的完整截圖
2. 瀏覽器控制台錯誤
3. 服務器終端輸出
4. 運行 `node quick-diagnosis.js` 的結果
5. 系統環境信息（Windows 版本、Node.js 版本等）

---

**最後更新**: 2024年12月
**版本**: 1.0
**適用於**: EduCreate v1.0+