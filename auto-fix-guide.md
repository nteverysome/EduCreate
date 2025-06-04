# EduCreate 自動修復指南

本文檔提供了自動修復 Chrome Console 報錯的詳細步驟，包括 401 未授權錯誤和 404 圖標錯誤。

## 1. 修復 401 未授權錯誤

### 問題描述

在訪問 `/api/search` 和 `/api/search/advanced` 等 API 端點時出現 401 Unauthorized 錯誤。

### 自動修復步驟

1. **確保測試用戶存在**

   運行以下命令創建測試用戶：

   ```bash
   npx prisma db seed
   ```

   這將創建以下測試用戶：
   - 管理員：admin@example.com / password123
   - 普通用戶：user@example.com / password123
   - 高級用戶：premium@example.com / password123

2. **確保測試令牌獲取正常工作**

   檢查 `_app.tsx` 中的測試令牌獲取邏輯是否正確：

   ```typescript
   // 在開發環境中獲取測試令牌
   if (process.env.NODE_ENV !== 'production') {
     try {
       const testTokenResponse = await fetch('/api/auth/test-token');
       if (testTokenResponse.ok) {
         const tokenData = await testTokenResponse.json();
         localStorage.setItem('eduCreateTestToken', tokenData.token);
       }
     } catch (tokenError) {
       console.warn('獲取測試令牌失敗:', tokenError);
     }
   }
   ```

3. **確保 API 端點使用測試認證中間件**

   檢查 `/api/search/index.ts` 和 `/api/search/advanced.ts` 是否正確使用了 `withTestAuth` 中間件：

   ```typescript
   // 使用測試認證中間件
   await new Promise<void>((resolve) => {
     withTestAuth(req, res, resolve);
   }).catch(() => {
     return res.status(401).json({ error: '未授權' });
   });
   ```

4. **手動清除瀏覽器緩存和 localStorage**

   在瀏覽器中：
   - 打開開發者工具 (F12)
   - 切換到「應用程序」或「Application」標籤
   - 選擇「存儲」或「Storage」下的「本地存儲」或「Local Storage」
   - 右鍵點擊並選擇「清除」或「Clear」
   - 刷新頁面

## 2. 修復 404 圖標錯誤

### 問題描述

訪問網站時出現 `GET http://localhost:3000/icons/icon-144x144.png 404 (Not Found)` 錯誤。

### 自動修復步驟

1. **確認圖標文件存在**

   確認以下圖標文件存在於 `/public/icons/` 目錄中：
   - icon-72x72.png
   - icon-96x96.png
   - icon-128x128.png
   - icon-144x144.png
   - icon-152x152.png
   - icon-192x192.png
   - icon-384x384.png
   - icon-512x512.png

2. **確認 manifest.json 配置正確**

   檢查 `/public/manifest.json` 文件中的圖標配置是否正確：

   ```json
   "icons": [
     {
       "src": "/icons/icon-72x72.png",
       "sizes": "72x72",
       "type": "image/png",
       "purpose": "any maskable"
     },
     // ... 其他圖標
     {
       "src": "/icons/icon-144x144.png",
       "sizes": "144x144",
       "type": "image/png",
       "purpose": "any maskable"
     },
     // ... 其他圖標
   ]
   ```

## 3. 自動化 Dashboard 頁面和 CRUD 功能

### 現有功能

目前 Dashboard 頁面 (`/pages/dashboard.tsx`) 已經實現了以下功能：

- 活動列表顯示
- 搜索、過濾和排序功能
- 統計數據顯示
- 創建新活動的入口

### 增強建議

1. **添加批量操作功能**

   在 Dashboard 頁面添加批量選擇和操作功能，如批量刪除、批量發布等。

2. **添加快速編輯功能**

   實現活動卡片上的快速編輯功能，無需跳轉到編輯頁面即可修改基本信息。

3. **添加拖放排序功能**

   使用 @dnd-kit/sortable 實現活動卡片的拖放排序功能。

4. **添加數據導出功能**

   實現活動數據的導出功能，支持 CSV、Excel 等格式。

## 4. 自動重啟和驗證

由於無法直接運行命令，請手動執行以下步驟：

1. **重啟開發服務器**

   ```bash
   npm run dev
   ```

2. **驗證修復效果**

   - 打開瀏覽器，訪問 http://localhost:3000
   - 打開開發者工具 (F12)，切換到 Console 標籤
   - 確認不再有 401 未授權錯誤和 404 圖標錯誤

## 5. 故障排除

如果仍然遇到問題，請嘗試以下步驟：

1. **檢查數據庫連接**

   確保 `.env` 文件中的 `DATABASE_URL` 配置正確，並且數據庫服務正在運行。

2. **檢查 NextAuth 配置**

   確保 `.env` 文件中的 `NEXTAUTH_URL` 和 `NEXTAUTH_SECRET` 配置正確。

3. **重建項目**

   ```bash
   npm run build
   npm start
   ```

4. **清理緩存**

   ```bash
   rm -rf .next
   npm run dev
   ```

## 結論

通過以上步驟，應該能夠解決 401 未授權錯誤和 404 圖標錯誤，並提升 Dashboard 頁面的功能。如果問題仍然存在，請檢查服務器日誌和瀏覽器控制台以獲取更多信息。