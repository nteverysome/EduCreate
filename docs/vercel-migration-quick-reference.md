# Vercel 全家桶遷移 - 快速參考卡片

**版本**：1.0  
**日期**：2025-01-21  
**總時間**：7-11 天  
**預估成本**：$45.75/月

---

## 🚀 5 階段遷移流程

```
準備階段 → 數據庫遷移 → 存儲遷移 → 測試驗證 → 生產部署
(1-2天)    (2-3天)      (2-3天)    (1-2天)    (1天)
```

---

## ✅ 每日檢查清單

### 第 1-2 天：準備階段

```
□ 導出 Neon schema 和數據統計
□ 統計本地頭像文件（數量、大小）
□ 創建 Vercel Postgres 數據庫
□ 配置 Vercel Blob Storage
□ 設置測試環境
□ 確認 Vercel Pro 訂閱
□ 設置成本警報
```

### 第 3-5 天：數據庫遷移

```
□ 導出 Neon schema
□ 在 Vercel Postgres 創建 schema
□ 使用 pg_dump 導出數據
□ 使用 pg_restore 導入數據
□ 驗證數據完整性（行數、checksum）
□ 更新 .env.local 連接字符串
□ 更新 Prisma 配置
□ 測試所有數據庫操作
```

### 第 6-8 天：存儲遷移

```
□ 編寫頭像遷移腳本
□ 批量上傳頭像到 Vercel Blob
□ 更新數據庫中的頭像 URL
□ 驗證所有頭像可訪問
□ 更新 /api/user/upload-avatar
□ 更新 /api/media/upload
□ 移除本地文件系統代碼
□ 測試所有圖片功能
```

### 第 9-10 天：測試驗證

```
□ 功能測試（註冊、登錄、頭像、活動）
□ 性能測試（響應時間、加載速度）
□ 數據完整性驗證
□ 準備回滾腳本
□ 測試回滾流程
```

### 第 11 天：生產部署

```
□ 通知用戶維護時間
□ 備份生產數據
□ 設置維護模式
□ 執行數據庫遷移
□ 執行存儲遷移
□ 更新環境變量
□ 部署新代碼
□ 測試關鍵功能
□ 監控錯誤日誌
□ 清理舊資源
```

---

## 🔧 關鍵命令速查

### 數據庫遷移

```bash
# 1. 導出 Neon 數據
pg_dump $NEON_DATABASE_URL > educreate_backup.sql

# 2. 導入到 Vercel Postgres
psql $VERCEL_POSTGRES_URL < educreate_backup.sql

# 3. 驗證數據
psql $VERCEL_POSTGRES_URL -c "SELECT COUNT(*) FROM users;"
psql $VERCEL_POSTGRES_URL -c "SELECT COUNT(*) FROM activities;"
```

### 環境變量更新

```bash
# 更新 .env.local
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."
BLOB_READ_WRITE_TOKEN="vercel_blob_..."
```

### Prisma 遷移

```bash
# 生成 Prisma Client
npx prisma generate

# 推送 schema 到數據庫
npx prisma db push

# 運行遷移
npx prisma migrate deploy
```

---

## 💰 成本速查

### 當前成本（Neon + 混合）

```
Neon PostgreSQL: $19/月
Vercel Blob (舊): $63/月
─────────────────────
總計: $82/月
```

### 遷移後成本（Vercel 全家桶）

```
Vercel Pro: $20/月
Vercel Blob 額外: $5.745/月
─────────────────────
總計: $45.745/月

節省: $36.255/月 (44.2%)
```

---

## ⚠️ 風險與回滾

### 主要風險

| 風險 | 緩解措施 |
|------|----------|
| 數據遷移失敗 | 完整備份 + 測試環境驗證 |
| 停機時間過長 | 分階段遷移 + 維護窗口 |
| URL 更新錯誤 | 批量驗證 + 回滾計劃 |

### 快速回滾

```bash
# 1. 恢復 Neon 連接
DATABASE_URL="postgresql://neon..."

# 2. 回滾代碼
git revert <migration-commit>
vercel --prod

# 3. 驗證服務
curl https://educreate.com/api/health
```

---

## 📊 驗收標準

### 功能驗收

- ✅ 用戶登錄正常
- ✅ 頭像上傳/顯示正常
- ✅ 活動 CRUD 正常
- ✅ 截圖生成正常
- ✅ 社區功能正常

### 性能驗收

- ✅ 數據庫查詢 < 100ms
- ✅ 圖片加載 < 500ms
- ✅ 首頁加載 < 2s
- ✅ CDN 緩存命中率 > 80%

### 成本驗收

- ✅ 月成本 < $50
- ✅ 成本警報設置完成

---

## 🔗 快速鏈接

- [完整遷移計畫](./vercel-full-stack-migration-plan.md)
- [Vercel Postgres 文檔](https://vercel.com/docs/storage/vercel-postgres)
- [Vercel Blob 文檔](https://vercel.com/docs/storage/vercel-blob)
- [成本分析文檔](./educreate-image-storage-analysis.md)

---

## 📞 緊急聯繫

- **Vercel 支持**：support@vercel.com
- **團隊 Slack**：#educreate-migration

---

**準備好開始了嗎？**

1. 閱讀完整遷移計畫
2. 確認團隊資源
3. 選擇維護窗口
4. 開始階段 1！

**祝遷移順利！** 🎉

