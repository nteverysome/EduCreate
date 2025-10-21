# 圖片版本管理系統

## 📋 概述

EduCreate 的圖片版本管理系統提供完整的版本追蹤和自動清理功能，確保系統性能和存儲效率。

**創建日期**：2025-10-22  
**版本**：v1.0

---

## 🎯 核心功能

### 1. 版本記錄創建

所有圖片編輯操作都會自動創建版本記錄：

#### ImageEditor 組件
- **操作類型**：旋轉、裁剪、濾鏡
- **記錄內容**：
  - 版本號（自動遞增）
  - 圖片 URL 和 Blob 路徑
  - 變更類型和描述
  - 創建時間和用戶
  - 原始圖片 ID

#### ContentItemWithImage 組件
- **操作類型**：文字疊加
- **記錄內容**：
  - 版本號（自動遞增）
  - 圖片 URL 和 Blob 路徑
  - 文字內容和位置
  - 文字樣式（大小、顏色、背景）
  - 創建時間和用戶
  - 原始圖片 ID

### 2. 版本查詢

**API**: `GET /api/images/[id]/versions`

**功能**：
- 查詢指定圖片的所有版本
- 按版本號降序排列（最新版本在前）
- 包含用戶信息和變更詳情

**返回數據**：
```json
{
  "success": true,
  "versions": [
    {
      "id": "version-id",
      "version": 3,
      "url": "https://...",
      "blobPath": "...",
      "changes": {
        "type": "text-overlay",
        "description": "添加文字疊加",
        "textContent": "Hello World",
        "textPosition": { "x": 50, "y": 50 },
        "fontSize": "medium",
        "textColor": "white",
        "showBackground": true,
        "originalImageId": "original-image-id"
      },
      "createdAt": "2025-10-22T00:00:00.000Z",
      "user": {
        "id": "user-id",
        "name": "User Name",
        "email": "user@example.com"
      }
    }
  ],
  "total": 3
}
```

### 3. 自動版本清理

**目的**：防止版本數量過多導致存儲浪費和性能下降

#### 清理策略

**默認保留策略**：
- 保留最近 **10 個版本**
- 自動刪除更舊的版本
- 同時刪除數據庫記錄和 Blob 存儲文件

**觸發時機**：
- 每次創建新版本時自動檢查
- 如果版本數量超過限制，觸發後台清理
- 清理過程不阻塞版本創建（異步執行）

#### 清理 API

**API**: `DELETE /api/images/[id]/versions/cleanup`

**參數**：
- `maxVersions`（可選）：保留的最大版本數，默認 10
- `dryRun`（可選）：設為 `true` 時只返回將要刪除的版本，不實際刪除

**示例**：
```bash
# 實際清理（保留最近 10 個版本）
DELETE /api/images/abc123/versions/cleanup?maxVersions=10

# 預覽清理（不實際刪除）
DELETE /api/images/abc123/versions/cleanup?maxVersions=10&dryRun=true
```

**返回數據**：
```json
{
  "success": true,
  "message": "Cleaned up 5 old versions",
  "totalVersions": 15,
  "maxVersions": 10,
  "versionsKept": 10,
  "versionsDeleted": 5,
  "deletedVersions": [
    {
      "id": "version-id-1",
      "version": 1,
      "url": "https://..."
    }
  ]
}
```

#### 清理狀態查詢

**API**: `GET /api/images/[id]/versions/cleanup`

**功能**：
- 檢查版本數量
- 判斷是否需要清理
- 查看最舊和最新版本信息

**返回數據**：
```json
{
  "success": true,
  "imageId": "abc123",
  "totalVersions": 15,
  "maxVersions": 10,
  "needsCleanup": true,
  "versionsToDelete": 5,
  "oldestVersion": {
    "version": 1,
    "createdAt": "2025-10-01T00:00:00.000Z"
  },
  "newestVersion": {
    "version": 15,
    "createdAt": "2025-10-22T00:00:00.000Z"
  }
}
```

---

## 🔧 技術實現

### 數據庫 Schema

```prisma
model ImageVersion {
  id        String   @id @default(cuid())
  imageId   String
  image     UserImage @relation(fields: [imageId], references: [id], onDelete: Cascade)

  // Version information
  version   Int      // Version number (starting from 1)
  url       String   // Version image URL
  blobPath  String   // Blob storage path

  // Change record
  changes   Json     // Record changes (crop, rotate, filter, text-overlay, etc.)

  // Creation information
  createdAt DateTime @default(now())
  createdBy String
  user      User     @relation("ImageVersions", fields: [createdBy], references: [id], onDelete: Cascade)

  @@unique([imageId, version])
  @@index([imageId])
  @@index([createdBy])
}
```

### 版本創建流程

```
1. 用戶編輯圖片（ImageEditor 或 ContentItemWithImage）
   ↓
2. 上傳編輯後的圖片到 Vercel Blob
   ↓
3. 獲取新圖片的 ID、URL、blobPath
   ↓
4. 創建版本記錄
   - 查詢當前最大版本號
   - 新版本號 = 最大版本號 + 1
   - 保存版本記錄到數據庫
   ↓
5. 檢查版本數量
   - 如果 > 10 個版本
   - 觸發後台清理（異步）
   ↓
6. 返回成功響應
   - 包含版本號
   - 包含是否觸發清理的標記
```

### 自動清理流程

```
1. 版本創建後檢測到版本數量 > 10
   ↓
2. 發送後台清理請求（不等待響應）
   ↓
3. 清理 API 執行：
   a. 查詢所有版本（按版本號降序）
   b. 保留最近 10 個版本
   c. 刪除更舊的版本：
      - 從 Vercel Blob 刪除文件
      - 從數據庫刪除記錄
   ↓
4. 返回清理結果
   - 刪除的版本數量
   - 失敗的刪除（如果有）
```

---

## 📊 版本管理策略

### 保留策略

| 場景 | 保留版本數 | 說明 |
|------|-----------|------|
| 默認 | 10 | 適合大多數用戶 |
| 高頻編輯 | 15-20 | 可配置更多版本 |
| 存儲受限 | 5 | 減少存儲使用 |

### 清理時機

| 時機 | 觸發條件 | 執行方式 |
|------|---------|---------|
| 自動清理 | 版本數量 > 10 | 後台異步執行 |
| 手動清理 | 用戶主動調用 API | 立即執行 |
| 定期清理 | 每日凌晨（未來功能） | 批量清理所有圖片 |

### 性能考量

1. **異步清理**：
   - 版本創建不等待清理完成
   - 確保用戶體驗流暢

2. **批量刪除**：
   - 一次清理多個版本
   - 減少 API 調用次數

3. **錯誤處理**：
   - 清理失敗不影響版本創建
   - 記錄失敗的刪除操作

---

## 🚀 使用示例

### 前端代碼示例

#### 創建版本（ImageEditor）

```typescript
const handleImageEditorSave = async (editedImage: { blob: Blob; url: string }) => {
  // 1. Upload edited image
  const formData = new FormData();
  formData.append('file', editedImage.blob, 'edited-image.png');
  
  const uploadResponse = await fetch('/api/images/upload', {
    method: 'POST',
    body: formData,
  });
  
  const uploadData = await uploadResponse.json();
  
  // 2. Create version record
  const versionResponse = await fetch(`/api/images/${uploadData.image.id}/versions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: uploadData.image.url,
      blobPath: uploadData.image.blobPath,
      changes: {
        type: 'edit',
        timestamp: new Date().toISOString(),
        description: '圖片編輯',
        originalImageId: imageToEdit.id,
      },
    }),
  });
  
  const versionData = await versionResponse.json();
  
  // 3. Show success message with version number
  alert(`圖片已保存！版本號：${versionData.version.version}`);
  
  // 4. Auto-cleanup is triggered in the background if needed
  if (versionData.autoCleanupTriggered) {
    console.log('Auto-cleanup triggered for old versions');
  }
};
```

#### 創建版本（ContentItemWithImage）

```typescript
const handleGenerateImage = async () => {
  // 1. Generate image with text overlay
  const blob = await overlayTextOnImage(imageUrl, overlayOptions);
  
  // 2. Upload generated image
  const formData = new FormData();
  formData.append('file', blob, 'content-image-with-text.png');
  
  const uploadResponse = await fetch('/api/images/upload', {
    method: 'POST',
    body: formData,
  });
  
  const uploadData = await uploadResponse.json();
  
  // 3. Create version record
  const versionResponse = await fetch(`/api/images/${uploadData.image.id}/versions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: uploadData.image.url,
      blobPath: uploadData.image.blobPath,
      changes: {
        type: 'text-overlay',
        timestamp: new Date().toISOString(),
        description: '添加文字疊加',
        textContent: text,
        textPosition: position,
        fontSize: fontSize,
        textColor: textColor,
        showBackground: showBg,
        originalImageId: originalImageId,
      },
    }),
  });
  
  const versionData = await versionResponse.json();
  
  // 4. Show success message
  alert(`✅ 圖片已生成並保存！版本號：${versionData.version.version}`);
};
```

---

## 🔮 未來改進

### 短期改進（1-2 週）

1. **版本預覽**：
   - 在 VersionHistory 中顯示版本縮略圖
   - 支持版本對比（並排顯示）

2. **版本恢復**：
   - 實現 `/api/images/[id]/restore` API
   - 允許用戶恢復到歷史版本

3. **版本標籤**：
   - 允許用戶為重要版本添加標籤
   - 標籤版本不會被自動清理

### 中期改進（1-2 個月）

1. **智能清理策略**：
   - 基於版本重要性的清理
   - 保留標籤版本和里程碑版本
   - 根據用戶活躍度調整保留數量

2. **版本分析**：
   - 統計版本創建頻率
   - 分析存儲使用情況
   - 提供優化建議

3. **批量版本管理**：
   - 支持批量刪除版本
   - 支持批量恢復版本
   - 支持版本導出

### 長期改進（3-6 個月）

1. **版本分支**：
   - 支持從任意版本創建新分支
   - 版本樹狀結構顯示
   - 分支合併功能

2. **協作版本管理**：
   - 多用戶協作編輯
   - 版本衝突解決
   - 版本評論和討論

3. **版本備份**：
   - 自動備份重要版本
   - 支持版本導出到外部存儲
   - 版本恢復和回滾

---

## 📝 總結

EduCreate 的圖片版本管理系統提供：

✅ **完整的版本追蹤**：記錄所有圖片編輯操作  
✅ **自動版本清理**：防止版本過多導致存儲浪費  
✅ **靈活的保留策略**：可配置保留版本數量  
✅ **高性能設計**：異步清理不影響用戶體驗  
✅ **詳細的變更記錄**：追蹤所有編輯細節  

這個系統確保了圖片編輯的可追溯性，同時保持了系統的性能和存儲效率。

---

**文檔版本**：v1.0  
**最後更新**：2025-10-22  
**維護者**：EduCreate 開發團隊

