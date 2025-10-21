# 圖片功能部署指南

## 📋 概述

本指南介紹如何將圖片管理功能部署到生產環境。

---

## 🔧 部署前準備

### 1. 環境變數配置

**Vercel Blob Storage**:
1. 登入 Vercel Dashboard
2. 進入 Storage 標籤
3. 創建 Blob Store（如果還沒有）
4. 複製 `BLOB_READ_WRITE_TOKEN`

**Unsplash API**:
1. 登入 Unsplash Developers (https://unsplash.com/developers)
2. 創建新應用
3. 複製 `Access Key` 和 `Secret Key`

**配置環境變數**:

在 Vercel 項目設置中添加：
```env
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
UNSPLASH_ACCESS_KEY="..."
UNSPLASH_SECRET_KEY="..."
```

在本地 `.env.local` 中添加：
```env
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
UNSPLASH_ACCESS_KEY="..."
UNSPLASH_SECRET_KEY="..."
```

---

### 2. 數據庫遷移

**本地環境**:
```bash
npx prisma db push
```

**生產環境**:
```bash
# 使用生產數據庫 URL
DATABASE_URL="postgresql://..." npx prisma db push
```

**驗證遷移**:
```bash
npx prisma studio
```

---

### 3. 依賴安裝

```bash
npm install @vercel/blob sharp unsplash-js react-easy-crop
```

**驗證安裝**:
```bash
npm list @vercel/blob sharp unsplash-js react-easy-crop
```

---

## 🚀 部署步驟

### 步驟 1: 提交代碼

```bash
git add .
git commit -m "feat: add image management functionality"
git push origin main
```

### 步驟 2: Vercel 自動部署

Vercel 會自動檢測到新的提交並開始部署。

**檢查部署狀態**:
1. 登入 Vercel Dashboard
2. 查看 Deployments 標籤
3. 等待部署完成

### 步驟 3: 驗證部署

**檢查清單**:
- [ ] 網站可以訪問
- [ ] 圖片上傳功能正常
- [ ] Unsplash 搜索功能正常
- [ ] 圖片編輯功能正常
- [ ] 版本控制功能正常

---

## 🧪 部署後測試

### 1. 圖片上傳測試

```bash
# 使用 curl 測試上傳 API
curl -X POST https://your-domain.vercel.app/api/images/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test-image.jpg" \
  -H "Cookie: next-auth.session-token=..."
```

### 2. Unsplash 搜索測試

```bash
# 測試 Unsplash 搜索 API
curl https://your-domain.vercel.app/api/unsplash/search?query=cat&page=1&perPage=20
```

### 3. 圖片列表測試

```bash
# 測試圖片列表 API
curl https://your-domain.vercel.app/api/images/list?page=1&perPage=20 \
  -H "Cookie: next-auth.session-token=..."
```

---

## 📊 監控設置

### 1. Vercel Blob 成本監控

**設置成本警報**:
1. 登入 Vercel Dashboard
2. 進入 Storage → Blob
3. 點擊 Settings
4. 設置成本警報（例如：$10/月）

**監控指標**:
- 存儲使用量（GB）
- 帶寬使用量（GB）
- 每月成本

### 2. Unsplash API 使用量監控

**檢查使用量**:
```bash
# 運行監控腳本
npx tsx scripts/check-unsplash-usage.ts
```

**監控指標**:
- 每小時請求數
- 每日請求數
- 剩餘配額

### 3. 應用性能監控

**使用 Vercel Analytics**:
1. 啟用 Vercel Analytics
2. 監控頁面加載時間
3. 監控 API 響應時間

**關鍵指標**:
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- API 響應時間

---

## 🔒 安全檢查

### 1. 環境變數安全

- [ ] 環境變數已加密存儲
- [ ] 不在代碼中硬編碼密鑰
- [ ] 定期輪換 API 密鑰

### 2. 文件上傳安全

- [ ] 文件類型驗證
- [ ] 文件大小限制
- [ ] 文件名清理
- [ ] 病毒掃描（可選）

### 3. API 安全

- [ ] 身份驗證檢查
- [ ] 權限檢查
- [ ] 速率限制
- [ ] CORS 配置

---

## 🐛 常見問題

### Q1: 圖片上傳失敗

**可能原因**:
- Blob token 無效
- 文件太大
- 網絡問題

**解決方案**:
1. 檢查環境變數
2. 檢查文件大小限制
3. 檢查網絡連接

### Q2: Unsplash 搜索失敗

**可能原因**:
- API 密鑰無效
- 超過速率限制
- 網絡問題

**解決方案**:
1. 檢查 API 密鑰
2. 檢查使用量
3. 等待速率限制重置

### Q3: 圖片編輯失敗

**可能原因**:
- 圖片太大
- 瀏覽器不支持
- 內存不足

**解決方案**:
1. 壓縮圖片
2. 使用現代瀏覽器
3. 關閉其他標籤頁

---

## 📈 性能優化

### 1. 圖片優化

**自動壓縮**:
```typescript
// 在上傳時自動壓縮
const compressed = await sharp(buffer)
  .jpeg({ quality: 85 })
  .toBuffer();
```

**CDN 緩存**:
```typescript
// 設置 Cache-Control headers
headers: {
  'Cache-Control': 'public, max-age=31536000, immutable',
}
```

### 2. 代碼分割

**動態導入**:
```typescript
const ImageEditor = dynamic(() => import('@/components/image-editor'), {
  ssr: false,
});
```

### 3. 懶加載

**圖片懶加載**:
```typescript
<img src={url} alt={alt} loading="lazy" />
```

---

## 🔄 回滾計劃

### 如果部署失敗

**步驟 1**: 在 Vercel Dashboard 中回滾到上一個版本

**步驟 2**: 檢查錯誤日誌
```bash
vercel logs
```

**步驟 3**: 修復問題並重新部署

---

## 📝 部署檢查清單

### 部署前
- [ ] 代碼已測試
- [ ] 環境變數已配置
- [ ] 數據庫已遷移
- [ ] 依賴已安裝
- [ ] 文檔已更新

### 部署中
- [ ] 代碼已提交
- [ ] Vercel 部署成功
- [ ] 構建日誌無錯誤

### 部署後
- [ ] 網站可訪問
- [ ] 功能測試通過
- [ ] 性能指標正常
- [ ] 監控已設置
- [ ] 團隊已通知

---

## 🎯 下一步

1. **監控系統運行**
   - 檢查錯誤日誌
   - 監控性能指標
   - 監控成本

2. **收集用戶反饋**
   - 功能是否好用
   - 是否有 bug
   - 是否需要改進

3. **持續優化**
   - 性能優化
   - 功能改進
   - 用戶體驗優化

---

## 📞 支持

如果遇到問題，請：
1. 查看文檔
2. 檢查錯誤日誌
3. 聯繫技術支持

---

**文檔版本**: 1.0  
**最後更新**: 2025-10-21  
**維護者**: EduCreate Team

