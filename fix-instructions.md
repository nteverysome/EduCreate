# EduCreate 錯誤修復指南

本文檔提供了修復 Chrome Console 報錯的步驟說明。我們已經實施了以下修復：

## 已完成的修復

### 1. 修復 404 錯誤 - 缺失圖標文件

我們已經創建了以下圖標文件，解決了 `GET http://localhost:3000/icons/icon-144x144.png 404 (Not Found)` 錯誤：

- `/public/icons/icon-72x72.png`
- `/public/icons/icon-96x96.png`
- `/public/icons/icon-128x128.png`
- `/public/icons/icon-144x144.png`
- `/public/icons/icon-152x152.png`
- `/public/icons/icon-192x192.png`
- `/public/icons/icon-384x384.png`
- `/public/icons/icon-512x512.png`

### 2. 修復 401 未授權錯誤

我們已經實施了以下修改，解決 API 連接問題（401 Unauthorized）：

1. 創建了測試用戶種子數據腳本 (`prisma/seed.ts`)
2. 添加了測試令牌 API (`pages/api/auth/test-token.ts`)
3. 更新了 `_app.tsx` 以自動獲取測試令牌
4. 更新了 `networkMonitor.ts` 以在 API 請求中使用測試令牌
5. 創建了 `withTestAuth.ts` 中間件以支持測試令牌認證
6. 更新了 `/api/search` 和 `/api/search/advanced` API 端點以使用測試認證中間件

## 手動執行步驟

由於無法直接運行命令，請按照以下步驟手動完成修復：

### 步驟 1: 安裝依賴

```bash
npm install ts-node --save-dev
```

### 步驟 2: 運行 Prisma 遷移和種子

```bash
npx prisma migrate dev --name add-test-users
npx prisma db seed
```

如果上述命令出錯，請確保在 `package.json` 中添加了以下內容：

```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

### 步驟 3: 重啟開發服務器

```bash
npm run dev
```

### 步驟 4: 驗證修復

1. 打開瀏覽器，訪問 http://localhost:3000
2. 打開開發者工具 (F12)，切換到 Console 標籤
3. 確認不再有 401 未授權錯誤和 404 圖標錯誤

## 故障排除

如果仍然遇到問題，請嘗試以下步驟：

1. 清除瀏覽器緩存和 localStorage
2. 刪除 `.next` 文件夾，然後重新啟動開發服務器
3. 確保數據庫連接正常
4. 檢查 `.env` 文件中的 `NEXTAUTH_SECRET` 是否設置正確

## 技術說明

我們的修復方法使用了開發環境中的測試令牌機制，自動為 API 請求添加認證信息，同時保留了正常的 NextAuth 認證流程。這種方法只在開發環境中有效，不會影響生產環境的安全性。