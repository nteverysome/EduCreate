# EduCreate 401 認證錯誤修復指南

## 問題描述

在使用 EduCreate 平台時，您可能遇到以下 401 認證錯誤：

- `GET http://localhost:3000/api/search 401 (Unauthorized)`
- `GET http://localhost:3000/api/search/advanced 401 (Unauthorized)`
- API 請求返回「未授權」錯誤

## 錯誤原因分析

### 1. 認證中間件配置問題
- `withTestAuth` 中間件使用了錯誤的函數簽名
- 搜索 API 使用了不正確的中間件調用方式
- 測試令牌驗證邏輯存在問題

### 2. 環境配置問題
- 缺少必要的環境變量（`NEXTAUTH_SECRET`、`NEXTAUTH_URL`）
- 數據庫連接配置不正確
- 測試用戶數據未正確初始化

### 3. API 端點配置問題
- 測試令牌 API 路徑配置錯誤
- 前端請求頭設置不正確

## 自動修復方案

### 快速修復（推薦）

1. **運行批處理腳本**（Windows）：
   ```bash
   fix-auth-401-errors.bat
   ```

2. **運行 PowerShell 腳本**：
   ```powershell
   .\fix-auth-401-errors.ps1
   ```

3. **運行 Node.js 腳本**：
   ```bash
   node fix-auth-401-errors.js
   ```

### 修復腳本功能

✅ **環境變量檢查和修復**
- 自動創建 `.env` 文件（如果不存在）
- 生成安全的 `NEXTAUTH_SECRET`
- 設置正確的 `NEXTAUTH_URL`

✅ **數據庫設置**
- 生成 Prisma 客戶端
- 推送數據庫架構
- 運行種子數據創建測試用戶

✅ **認證配置檢查**
- 驗證所有必要的認證文件存在
- 檢查中間件配置

✅ **緩存清理**
- 清理 `.next` 構建緩存
- 清理 Node.js 模塊緩存

## 手動修復方案

如果自動修復失敗，可以按照以下步驟手動修復：

### 1. 修復認證中間件

**文件：`middleware/withTestAuth.ts`**

確保中間件使用正確的函數簽名：

```typescript
export function withTestAuth(handler: NextApiHandler): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // 認證邏輯
  };
}
```

### 2. 修復搜索 API

**文件：`pages/api/search/index.ts`**

```typescript
// 使用正確的中間件包裝
export default withTestAuth(searchHandler);
```

**文件：`pages/api/search/advanced.ts`**

```typescript
// 使用正確的中間件包裝
export default withTestAuth(advancedSearchHandler);
```

### 3. 配置環境變量

**文件：`.env`**

```env
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL="file:./dev.db"
```

### 4. 初始化數據庫

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 5. 修復前端令牌處理

**文件：`pages/_app.tsx`**

確保在開發環境中正確獲取和使用測試令牌。

## 驗證修復結果

### 1. 啟動開發服務器

```bash
npm run dev
```

### 2. 測試 API 端點

在瀏覽器中訪問以下 URL：

- http://localhost:3000/api/auth/test-token
- http://localhost:3000/api/search
- http://localhost:3000/api/search/advanced

### 3. 檢查瀏覽器控制台

確保沒有 401 錯誤，並且可以看到：
- "開發環境：已獲取測試令牌"
- 成功的 API 響應

## 常見問題解答

### Q: 修復後仍然出現 401 錯誤

**A:** 請檢查：
1. 環境變量是否正確設置
2. 數據庫是否包含測試用戶
3. 瀏覽器是否已清除緩存
4. 開發服務器是否已重新啟動

### Q: 測試令牌 API 返回 404

**A:** 確保：
1. 文件 `pages/api/auth/test-token.ts` 存在
2. 當前環境為開發環境（`NODE_ENV !== 'production'`）

### Q: 數據庫連接失敗

**A:** 檢查：
1. `DATABASE_URL` 環境變量是否正確
2. 數據庫文件權限是否正確
3. 運行 `npx prisma db push` 重新初始化

### Q: Prisma 相關錯誤

**A:** 嘗試：
```bash
npx prisma generate
npx prisma db push --force-reset
npx prisma db seed
```

## 技術細節

### 認證流程

1. **開發環境**：
   - 自動獲取測試令牌
   - 在 API 請求中包含 `Authorization` 頭
   - 支持會話和令牌雙重認證

2. **生產環境**：
   - 僅使用 NextAuth 會話認證
   - 測試令牌 API 不可用

### 中間件架構

- `withAuth`: 基本會話認證
- `withTestAuth`: 開發環境測試認證
- `withPermission`: 權限檢查
- `withOwnership`: 資源所有權檢查

## 相關文檔

- [ERROR-FIX-README.md](./ERROR-FIX-README.md) - 通用錯誤修復指南
- [REGISTER-FIX-README.md](./REGISTER-FIX-README.md) - 註冊相關錯誤修復
- [SERVER-FIX-README.md](./SERVER-FIX-README.md) - 服務器啟動問題

## 支持

如果問題仍然存在，請：

1. 檢查控制台錯誤信息
2. 查看服務器日誌
3. 確認所有依賴已正確安裝
4. 重新運行完整的修復流程

---

**最後更新**: 2024年5月26日  
**版本**: 1.0.0  
**適用於**: EduCreate v1.0.0+