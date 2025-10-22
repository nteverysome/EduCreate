# Vercel Blob Storage 設置指南

**創建日期**：2025-01-21  
**狀態**：進行中  
**目的**：為 EduCreate 項目配置 Vercel Blob Storage

---

## 📋 設置步驟

### 1. 確認 Vercel 項目

**項目信息**：
- 項目名稱：EduCreate
- Vercel URL：https://edu-create.vercel.app
- GitHub 倉庫：https://github.com/nteverysome/EduCreate

### 2. 啟用 Vercel Blob Storage

#### 方法 A：通過 Vercel Dashboard（推薦）

1. **登錄 Vercel Dashboard**
   - 訪問：https://vercel.com/dashboard
   - 選擇 EduCreate 項目

2. **進入 Storage 設置**
   - 點擊項目 → Storage 標籤
   - 點擊 "Create Database" 或 "Connect Store"
   - 選擇 "Blob"

3. **創建 Blob Store**
   - 輸入 Store 名稱：`educreate-images`
   - 選擇區域：建議選擇與 Neon 數據庫相同的區域（East US 2）
   - 點擊 "Create"

4. **獲取 Token**
   - 創建後會自動生成 `BLOB_READ_WRITE_TOKEN`
   - 複製 Token（只顯示一次）

#### 方法 B：通過 Vercel CLI

```bash
# 安裝 Vercel CLI（如果尚未安裝）
npm i -g vercel

# 登錄 Vercel
vercel login

# 鏈接項目
vercel link

# 創建 Blob Store
vercel blob create educreate-images

# 獲取 Token
vercel env pull .env.vercel
```

### 3. 配置環境變量

#### 本地開發環境（.env.local）

添加以下環境變量到 `.env.local`：

```bash
# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_xxxxxxxxxx"
```

#### 生產環境（Vercel Dashboard）

1. 進入 Vercel Dashboard → EduCreate 項目
2. 點擊 "Settings" → "Environment Variables"
3. 添加環境變量：
   - Key: `BLOB_READ_WRITE_TOKEN`
   - Value: `vercel_blob_rw_xxxxxxxxxx`
   - Environment: Production, Preview, Development

### 4. 安裝 Vercel Blob SDK

```bash
npm install @vercel/blob
```

### 5. 創建存儲目錄結構

Vercel Blob 使用虛擬目錄結構（通過文件路徑前綴）：

```
educreate-images/
├── avatars/                    # 用戶頭像
│   └── {userId}-{timestamp}.{ext}
├── screenshots/                # 活動截圖
│   └── {activityId}-{timestamp}.{ext}
├── user-uploads/               # 用戶上傳的圖片
│   └── {userId}/
│       └── {imageId}-{timestamp}.{ext}
└── activity-images/            # 活動中使用的圖片
    └── {activityId}/
        └── {imageId}-{timestamp}.{ext}
```

### 6. 測試 Blob Storage

創建測試腳本 `scripts/test-blob-storage.ts`：

```typescript
import { put, list, del } from '@vercel/blob';

async function testBlobStorage() {
  try {
    console.log('🧪 測試 Vercel Blob Storage...\n');

    // 測試上傳
    console.log('1. 測試上傳...');
    const testContent = 'Hello, Vercel Blob!';
    const blob = await put('test/hello.txt', testContent, {
      access: 'public',
    });
    console.log('✅ 上傳成功:', blob.url);

    // 測試列表
    console.log('\n2. 測試列表...');
    const { blobs } = await list({ prefix: 'test/' });
    console.log('✅ 找到文件:', blobs.length);
    blobs.forEach((b) => console.log('  -', b.pathname));

    // 測試刪除
    console.log('\n3. 測試刪除...');
    await del(blob.url);
    console.log('✅ 刪除成功');

    console.log('\n🎉 所有測試通過！');
  } catch (error) {
    console.error('❌ 測試失敗:', error);
    process.exit(1);
  }
}

testBlobStorage();
```

運行測試：

```bash
npx tsx scripts/test-blob-storage.ts
```

### 7. 設置成本警報

#### 在 Vercel Dashboard 設置

1. 進入 Vercel Dashboard → Settings → Billing
2. 點擊 "Usage Alerts"
3. 設置警報：
   - Alert at: $100/month
   - Email: nteverysome@gmail.com

#### 監控使用量

定期檢查使用量：
- Dashboard → Storage → Blob → Usage

---

## 📊 當前配置狀態

### ✅ 已完成
- [x] 數據庫 Schema 更新（UserImage、ActivityImage、ImageTag）
- [x] Prisma 遷移完成

### 🔄 進行中
- [ ] 確認 Vercel Blob Token
- [ ] 配置環境變量
- [ ] 安裝 @vercel/blob SDK
- [ ] 測試 Blob Storage
- [ ] 設置成本警報

### ⏳ 待完成
- [ ] Unsplash API 整合
- [ ] 基礎 API 路由

---

## 🔑 環境變量清單

### 必需的環境變量

```bash
# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_xxxxxxxxxx"

# Unsplash API（下一步）
UNSPLASH_ACCESS_KEY="your_unsplash_access_key"
UNSPLASH_SECRET_KEY="your_unsplash_secret_key"
```

### 可選的環境變量

```bash
# Blob Storage 配置
BLOB_STORE_NAME="educreate-images"
BLOB_REGION="eastus2"
```

---

## 📝 存儲目錄命名規範

### 用戶頭像
```
avatars/{userId}-{timestamp}.{ext}
例如：avatars/clx123abc-1705824000000.jpg
```

### 活動截圖
```
screenshots/{activityId}-{timestamp}.{ext}
例如：screenshots/clx456def-1705824000000.png
```

### 用戶上傳的圖片
```
user-uploads/{userId}/{imageId}-{timestamp}.{ext}
例如：user-uploads/clx123abc/clx789ghi-1705824000000.jpg
```

### 活動圖片
```
activity-images/{activityId}/{imageId}-{timestamp}.{ext}
例如：activity-images/clx456def/clx789ghi-1705824000000.jpg
```

---

## 💰 成本估算

### Vercel Blob 2025 定價
- 存儲：$0.023/GB/月
- 帶寬：$0.05/GB
- 操作：$0.40 per 1M simple operations

### Vercel Pro 計劃包含
- 5GB 存儲（免費）
- 100GB 帶寬（免費）

### 預估成本（10,000 用戶）
- 存儲：60GB - 5GB 免費 = 55GB × $0.023 = $1.27/月
- 帶寬：900GB - 100GB 免費 = 800GB × $0.05 = $40/月
- 操作：3M 次 × $0.40 / 1M = $1.20/月
- **總計**：$42.47/月

---

## 🚨 重要提醒

1. **Token 安全**
   - 不要將 `BLOB_READ_WRITE_TOKEN` 提交到 Git
   - 確保 `.env.local` 在 `.gitignore` 中

2. **成本控制**
   - 設置成本警報（$100/月）
   - 定期檢查使用量
   - 實施圖片壓縮和優化

3. **備份策略**
   - Vercel Blob 不提供自動備份
   - 考慮定期備份重要圖片到其他存儲

4. **CDN 優化**
   - Vercel Blob 自動使用 CDN
   - 設置適當的 Cache-Control headers

---

## 📚 參考資源

- [Vercel Blob 官方文檔](https://vercel.com/docs/storage/vercel-blob)
- [Vercel Blob SDK](https://www.npmjs.com/package/@vercel/blob)
- [Vercel Blob 定價](https://vercel.com/docs/storage/vercel-blob/usage-and-pricing)

---

## 🔄 下一步

1. **立即執行**：
   - 登錄 Vercel Dashboard
   - 創建 Blob Store
   - 獲取並配置 Token

2. **驗證配置**：
   - 運行測試腳本
   - 確認上傳、列表、刪除功能正常

3. **繼續下一個任務**：
   - 1.3 Unsplash API 整合
   - 1.4 基礎 API 路由

---

**準備好繼續了嗎？**

請確認以下步驟：
- [ ] 已登錄 Vercel Dashboard
- [ ] 已創建 Blob Store
- [ ] 已獲取 BLOB_READ_WRITE_TOKEN
- [ ] 已配置環境變量
- [ ] 已安裝 @vercel/blob SDK
- [ ] 已運行測試腳本

