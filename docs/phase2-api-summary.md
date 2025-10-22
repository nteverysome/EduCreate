# Phase 2: 圖片上傳功能 - API 總結

## 📊 完成的 API 端點

### 原有 API（Phase 1）

1. **POST /api/images/upload** - 單張圖片上傳
2. **GET /api/images/list** - 圖片列表查詢
3. **GET /api/unsplash/search** - Unsplash 搜索
4. **POST /api/unsplash/download** - Unsplash 下載

### 新增 API（Phase 2）

5. **DELETE /api/images/delete** - 單張圖片刪除
6. **POST /api/images/batch-delete** - 批量刪除
7. **POST /api/images/batch-upload** - 批量上傳
8. **GET /api/images/stats** - 圖片統計
9. **PATCH /api/images/update** - 圖片更新

---

## 📝 API 詳細說明

### 1. DELETE /api/images/delete

**功能**: 刪除單張圖片

**參數**:
- `id` (query): 圖片 ID

**響應**:
```json
{
  "success": true,
  "message": "圖片已成功刪除",
  "deletedImage": {
    "id": "clxxx...",
    "fileName": "test.jpg",
    "source": "upload"
  }
}
```

**特性**:
- ✅ 權限檢查
- ✅ 檢查圖片是否被活動使用
- ✅ 刪除 Vercel Blob 文件
- ✅ 刪除數據庫記錄

---

### 2. POST /api/images/batch-delete

**功能**: 批量刪除圖片（最多 50 張）

**請求體**:
```json
{
  "imageIds": ["id1", "id2", "id3"]
}
```

**響應**:
```json
{
  "success": true,
  "message": "成功刪除 2 張圖片",
  "result": {
    "total": 3,
    "successCount": 2,
    "failedCount": 0,
    "skippedCount": 1,
    "details": {
      "success": ["id1", "id2"],
      "failed": [],
      "skipped": [
        {
          "id": "id3",
          "reason": "正在被 2 個活動使用"
        }
      ]
    }
  }
}
```

**特性**:
- ✅ 批量處理（最多 50 張）
- ✅ 詳細的結果統計
- ✅ 跳過正在使用的圖片

---

### 3. POST /api/images/batch-upload

**功能**: 批量上傳圖片（最多 10 張）

**請求體** (FormData):
- `file0`, `file1`, `file2`, ... : 圖片文件
- `alt` (可選): 替代文字
- `tags` (可選): 標籤（JSON 數組字符串）

**響應**:
```json
{
  "success": true,
  "message": "成功上傳 2 張圖片",
  "result": {
    "total": 3,
    "successCount": 2,
    "failedCount": 1,
    "details": {
      "success": [
        {
          "id": "clxxx...",
          "url": "https://...",
          "fileName": "image1.jpg",
          "fileSize": 123456,
          "width": 1920,
          "height": 1080
        }
      ],
      "failed": [
        {
          "fileName": "image3.jpg",
          "reason": "文件大小超過限制"
        }
      ]
    }
  }
}
```

**特性**:
- ✅ 批量上傳（最多 10 張）
- ✅ 文件驗證
- ✅ 圖片壓縮
- ✅ 詳細的結果統計

---

### 4. GET /api/images/stats

**功能**: 獲取圖片統計信息

**響應**:
```json
{
  "success": true,
  "stats": {
    "total": 25,
    "bySource": {
      "upload": 15,
      "unsplash": 10
    },
    "storage": {
      "totalBytes": 12345678,
      "totalMB": 11.77,
      "totalGB": 0.0115
    },
    "tags": {
      "education": 10,
      "nature": 5,
      "technology": 3
    },
    "usage": {
      "totalUsage": 50,
      "averageUsage": 2.0,
      "mostUsed": [
        {
          "id": "clxxx...",
          "fileName": "popular.jpg",
          "url": "https://...",
          "usageCount": 10
        }
      ]
    },
    "time": {
      "oldest": "2025-01-01T00:00:00.000Z",
      "newest": "2025-10-21T00:00:00.000Z",
      "last7Days": 5,
      "last30Days": 15
    }
  }
}
```

**特性**:
- ✅ 總數統計
- ✅ 按來源統計
- ✅ 存儲空間統計
- ✅ 標籤統計
- ✅ 使用統計
- ✅ 時間統計

---

### 5. PATCH /api/images/update

**功能**: 更新圖片的 alt 文字和標籤

**請求體**:
```json
{
  "imageId": "clxxx...",
  "alt": "New description",
  "tags": ["new", "tags"]
}
```

**響應**:
```json
{
  "success": true,
  "message": "圖片已更新",
  "image": {
    "id": "clxxx...",
    "alt": "New description",
    "tags": ["new", "tags"],
    "updatedAt": "2025-10-21T..."
  }
}
```

**特性**:
- ✅ 權限檢查
- ✅ 更新 alt 文字
- ✅ 更新標籤

---

## 🎯 API 功能矩陣

| API 端點 | 方法 | 功能 | 認證 | 批量 | 狀態 |
|---------|------|------|------|------|------|
| `/api/images/upload` | POST | 單張上傳 | ✅ | ❌ | ✅ |
| `/api/images/batch-upload` | POST | 批量上傳 | ✅ | ✅ (10) | ✅ |
| `/api/images/list` | GET | 圖片列表 | ✅ | ❌ | ✅ |
| `/api/images/stats` | GET | 圖片統計 | ✅ | ❌ | ✅ |
| `/api/images/delete` | DELETE | 單張刪除 | ✅ | ❌ | ✅ |
| `/api/images/batch-delete` | POST | 批量刪除 | ✅ | ✅ (50) | ✅ |
| `/api/images/update` | PATCH | 更新信息 | ✅ | ❌ | ✅ |
| `/api/unsplash/search` | GET | Unsplash 搜索 | ✅ | ❌ | ✅ |
| `/api/unsplash/download` | POST | Unsplash 下載 | ✅ | ❌ | ✅ |

**總計**: 9 個 API 端點

---

## 🔒 安全特性

### 認證和授權
- ✅ 所有 API 需要用戶登錄
- ✅ 權限檢查（只能操作自己的圖片）
- ✅ 使用檢查（防止刪除正在使用的圖片）

### 文件驗證
- ✅ 文件類型驗證（JPEG, PNG, WebP, GIF）
- ✅ 文件大小限制（10MB）
- ✅ 圖片尺寸限制（4096x4096）

### 批量操作限制
- ✅ 批量上傳限制（10 張）
- ✅ 批量刪除限制（50 張）

---

## 📊 性能優化

### 圖片壓縮
- ✅ JPEG: quality 85, progressive
- ✅ PNG: compressionLevel 9
- ✅ WebP: quality 85

### 數據庫優化
- ✅ 分頁查詢
- ✅ 索引優化
- ✅ 選擇性字段查詢

### 存儲優化
- ✅ Unsplash 圖片使用 URL（不下載）
- ✅ 上傳圖片壓縮後存儲

---

## 🧪 測試建議

### 單元測試
- [ ] 測試文件驗證邏輯
- [ ] 測試權限檢查邏輯
- [ ] 測試圖片壓縮功能
- [ ] 測試統計計算邏輯

### 集成測試
- [ ] 測試完整的上傳流程
- [ ] 測試完整的刪除流程
- [ ] 測試批量操作流程
- [ ] 測試 Unsplash 整合

### E2E 測試
- [ ] 測試用戶上傳圖片
- [ ] 測試用戶刪除圖片
- [ ] 測試用戶搜索圖片
- [ ] 測試用戶更新圖片信息

---

## 📖 使用示例

### 示例 1: 批量上傳圖片

```javascript
const formData = new FormData();
formData.append('file0', file1);
formData.append('file1', file2);
formData.append('file2', file3);
formData.append('tags', JSON.stringify(['education', 'demo']));

const response = await fetch('/api/images/batch-upload', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
console.log(`成功上傳 ${result.result.successCount} 張圖片`);
```

### 示例 2: 批量刪除圖片

```javascript
const response = await fetch('/api/images/batch-delete', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    imageIds: ['id1', 'id2', 'id3'],
  }),
});

const result = await response.json();
console.log(result.message);
```

### 示例 3: 獲取圖片統計

```javascript
const response = await fetch('/api/images/stats');
const data = await response.json();

console.log(`總圖片數: ${data.stats.total}`);
console.log(`存儲空間: ${data.stats.storage.totalMB} MB`);
console.log(`最常用圖片:`, data.stats.usage.mostUsed);
```

---

## 🚀 下一步

Phase 2 已完成！可以繼續：

- **Phase 3**: Unsplash 整合（已部分完成）
- **Phase 4**: 前端組件開發
- **Phase 5**: 高級功能
- **Phase 6**: 測試和優化

