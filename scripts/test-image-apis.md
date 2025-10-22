# 圖片 API 測試指南

## 概述

本文檔提供了測試新創建的圖片 API 的詳細指南。

---

## API 端點列表

### 1. Unsplash 搜索 API
- **端點**: `GET /api/unsplash/search`
- **功能**: 搜索 Unsplash 圖片
- **需要登錄**: 是

### 2. 圖片列表 API
- **端點**: `GET /api/images/list`
- **功能**: 查詢用戶上傳的圖片
- **需要登錄**: 是

### 3. 圖片上傳 API
- **端點**: `POST /api/images/upload`
- **功能**: 上傳圖片到 Vercel Blob
- **需要登錄**: 是

### 4. Unsplash 下載 API
- **端點**: `POST /api/unsplash/download`
- **功能**: 從 Unsplash 下載圖片到用戶圖片庫
- **需要登錄**: 是

---

## 測試步驟

### 前置條件

1. **啟動開發服務器**:
   ```bash
   npm run dev
   ```

2. **確保已登錄**:
   - 訪問 http://localhost:3000
   - 登錄到你的賬號

3. **獲取 Session Token**:
   - 打開瀏覽器開發者工具
   - 查看 Cookies 中的 `next-auth.session-token`

---

### 測試 1: Unsplash 搜索 API

#### 使用 curl:
```bash
curl -X GET "http://localhost:3000/api/unsplash/search?query=education&page=1&perPage=5" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

#### 使用瀏覽器:
```
http://localhost:3000/api/unsplash/search?query=education&page=1&perPage=5
```

#### 預期響應:
```json
{
  "success": true,
  "total": 2500,
  "totalPages": 500,
  "page": 1,
  "perPage": 5,
  "photos": [
    {
      "id": "lUaaKCUANVI",
      "description": "A collection of books...",
      "urls": {
        "raw": "https://...",
        "full": "https://...",
        "regular": "https://...",
        "small": "https://...",
        "thumb": "https://..."
      },
      "width": 6016,
      "height": 4000,
      "color": "#f3f3f3",
      "likes": 3903,
      "user": {
        "id": "...",
        "username": "kimberlyfarmer",
        "name": "Kimberly Farmer",
        "profileImage": "https://...",
        "profileUrl": "https://..."
      },
      "links": {
        "html": "https://...",
        "download": "https://...",
        "downloadLocation": "https://..."
      },
      "createdAt": "2017-08-10T15:20:35Z"
    }
  ]
}
```

#### 測試參數:
- `query`: 搜索關鍵字（必需）
- `page`: 頁碼（默認 1）
- `perPage`: 每頁數量（默認 20，最大 30）
- `orientation`: 圖片方向（landscape | portrait | squarish）
- `color`: 顏色篩選（black_and_white | black | white | yellow | orange | red | purple | magenta | green | teal | blue）

---

### 測試 2: 圖片上傳 API

#### 使用 curl:
```bash
curl -X POST "http://localhost:3000/api/images/upload" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -F "file=@/path/to/your/image.jpg" \
  -F "alt=Test image" \
  -F 'tags=["test", "demo"]'
```

#### 使用 Postman:
1. 選擇 POST 方法
2. URL: `http://localhost:3000/api/images/upload`
3. Headers: 添加 Cookie
4. Body: 選擇 form-data
   - `file`: 選擇文件
   - `alt`: 文字（可選）
   - `tags`: JSON 數組字符串（可選）

#### 預期響應:
```json
{
  "success": true,
  "image": {
    "id": "clxxx...",
    "url": "https://jurcphibz1ecxhti.public.blob.vercel-storage.com/user-uploads/...",
    "fileName": "test.jpg",
    "fileSize": 123456,
    "mimeType": "image/jpeg",
    "width": 1920,
    "height": 1080,
    "alt": "Test image",
    "tags": ["test", "demo"],
    "createdAt": "2025-10-21T..."
  }
}
```

#### 限制:
- 最大文件大小: 10MB
- 支持的格式: JPEG, PNG, WebP, GIF
- 最大尺寸: 4096x4096

---

### 測試 3: 圖片列表 API

#### 使用 curl:
```bash
curl -X GET "http://localhost:3000/api/images/list?page=1&perPage=10" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

#### 使用瀏覽器:
```
http://localhost:3000/api/images/list?page=1&perPage=10
```

#### 預期響應:
```json
{
  "success": true,
  "total": 5,
  "totalPages": 1,
  "page": 1,
  "perPage": 10,
  "images": [
    {
      "id": "clxxx...",
      "url": "https://...",
      "fileName": "test.jpg",
      "fileSize": 123456,
      "mimeType": "image/jpeg",
      "width": 1920,
      "height": 1080,
      "source": "upload",
      "sourceId": null,
      "alt": "Test image",
      "tags": ["test", "demo"],
      "usageCount": 0,
      "lastUsedAt": null,
      "createdAt": "2025-10-21T...",
      "updatedAt": "2025-10-21T..."
    }
  ]
}
```

#### 測試參數:
- `page`: 頁碼（默認 1）
- `perPage`: 每頁數量（默認 20，最大 50）
- `source`: 來源篩選（upload | unsplash）
- `tag`: 標籤篩選（可以多個，用逗號分隔）
- `search`: 搜索關鍵字
- `sortBy`: 排序方式（createdAt | usageCount | lastUsedAt）
- `sortOrder`: 排序順序（asc | desc）

---

### 測試 4: Unsplash 下載 API

#### 使用 curl:
```bash
curl -X POST "http://localhost:3000/api/unsplash/download" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "photoId": "lUaaKCUANVI",
    "downloadLocation": "https://api.unsplash.com/photos/lUaaKCUANVI/download?ixid=...",
    "alt": "Books on shelf",
    "tags": ["education", "books"]
  }'
```

#### 使用 Postman:
1. 選擇 POST 方法
2. URL: `http://localhost:3000/api/unsplash/download`
3. Headers: 
   - Cookie: next-auth.session-token=YOUR_SESSION_TOKEN
   - Content-Type: application/json
4. Body: 選擇 raw (JSON)
   ```json
   {
     "photoId": "lUaaKCUANVI",
     "downloadLocation": "https://api.unsplash.com/photos/lUaaKCUANVI/download?ixid=...",
     "alt": "Books on shelf",
     "tags": ["education", "books"]
   }
   ```

#### 預期響應:
```json
{
  "success": true,
  "image": {
    "id": "clxxx...",
    "url": "https://images.unsplash.com/photo-...",
    "fileName": "unsplash-lUaaKCUANVI.jpg",
    "fileSize": 0,
    "mimeType": "image/jpeg",
    "width": 6016,
    "height": 4000,
    "alt": "Books on shelf",
    "tags": ["education", "books"],
    "source": "unsplash",
    "sourceId": "lUaaKCUANVI",
    "usageCount": 1,
    "createdAt": "2025-10-21T...",
    "photographer": {
      "name": "Kimberly Farmer",
      "username": "kimberlyfarmer",
      "profileUrl": "https://unsplash.com/@kimberlyfarmer"
    }
  },
  "alreadyExists": false
}
```

---

## 錯誤處理測試

### 測試未登錄訪問:
```bash
curl -X GET "http://localhost:3000/api/images/list"
```

預期響應:
```json
{
  "error": "未授權訪問"
}
```
狀態碼: 401

### 測試無效參數:
```bash
curl -X GET "http://localhost:3000/api/unsplash/search"
```

預期響應:
```json
{
  "error": "缺少搜索關鍵字"
}
```
狀態碼: 400

### 測試文件過大:
上傳一個超過 10MB 的圖片

預期響應:
```json
{
  "error": "文件大小超過限制。最大: 10MB"
}
```
狀態碼: 400

---

## 驗證清單

- [ ] Unsplash 搜索 API 返回正確的圖片列表
- [ ] 圖片上傳 API 成功上傳到 Vercel Blob
- [ ] 圖片列表 API 返回用戶的圖片
- [ ] Unsplash 下載 API 保存圖片到數據庫
- [ ] 所有 API 正確處理未登錄情況
- [ ] 所有 API 正確驗證參數
- [ ] 圖片壓縮功能正常工作
- [ ] 數據庫記錄正確保存
- [ ] Unsplash download endpoint 被正確觸發

---

## 下一步

完成測試後：
1. 修復發現的任何問題
2. 開始實施前端組件（ImagePicker）
3. 整合 API 到現有的活動創建流程

