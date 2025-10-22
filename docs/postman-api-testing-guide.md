# Postman API 測試指南

## 📋 目錄
1. [準備工作](#準備工作)
2. [獲取 Session Token](#獲取-session-token)
3. [測試 API 端點](#測試-api-端點)
4. [常見問題](#常見問題)

---

## 準備工作

### 1. 確保開發服務器運行
```bash
npm run dev
```

服務器應該運行在 `http://localhost:3000`

### 2. 安裝 Postman
- 下載：https://www.postman.com/downloads/
- 或使用 Web 版本：https://web.postman.com/

### 3. 準備測試圖片
- 準備一張測試圖片（JPEG/PNG/WebP/GIF）
- 文件大小 < 10MB
- 尺寸 < 4096x4096

---

## 獲取 Session Token

### 步驟 1: 在瀏覽器中登錄

1. 打開瀏覽器訪問：`http://localhost:3000/login`
2. 使用你的帳號登錄（或使用 Google 登錄）
3. 登錄成功後，你應該看到用戶界面

### 步驟 2: 獲取 Session Token

#### Chrome / Edge:
1. 按 `F12` 打開開發者工具
2. 切換到 **Application** 標籤
3. 左側選擇 **Cookies** → `http://localhost:3000`
4. 找到 `next-auth.session-token` 或 `__Secure-next-auth.session-token`
5. 複製 **Value** 欄位的值

#### Firefox:
1. 按 `F12` 打開開發者工具
2. 切換到 **Storage** 標籤
3. 左側選擇 **Cookies** → `http://localhost:3000`
4. 找到 `next-auth.session-token`
5. 複製值

### 步驟 3: 記錄 Token

將 token 保存到記事本，格式如下：
```
next-auth.session-token=YOUR_TOKEN_HERE
```

例如：
```
next-auth.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..abcd1234...
```

---

## 測試 API 端點

### API 1: Unsplash 搜索

#### 請求設置

**方法**: `GET`

**URL**: 
```
http://localhost:3000/api/unsplash/search?query=education&page=1&perPage=5
```

**Headers**:
```
Cookie: next-auth.session-token=YOUR_TOKEN_HERE
```

#### Postman 設置步驟

1. 創建新請求
2. 選擇 **GET** 方法
3. 輸入 URL（包含查詢參數）
4. 切換到 **Headers** 標籤
5. 添加 Header:
   - Key: `Cookie`
   - Value: `next-auth.session-token=YOUR_TOKEN_HERE`
6. 點擊 **Send**

#### 預期響應 (200 OK)

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

#### 測試不同參數

修改 URL 中的查詢參數：
- `query`: 搜索關鍵字（必需）
- `page`: 頁碼（默認 1）
- `perPage`: 每頁數量（默認 20，最大 30）
- `orientation`: 圖片方向（landscape | portrait | squarish）
- `color`: 顏色篩選（black_and_white | black | white | yellow | orange | red | purple | magenta | green | teal | blue）

例如：
```
http://localhost:3000/api/unsplash/search?query=nature&page=1&perPage=10&orientation=landscape&color=green
```

---

### API 2: 圖片列表

#### 請求設置

**方法**: `GET`

**URL**: 
```
http://localhost:3000/api/images/list?page=1&perPage=10
```

**Headers**:
```
Cookie: next-auth.session-token=YOUR_TOKEN_HERE
```

#### Postman 設置步驟

1. 創建新請求
2. 選擇 **GET** 方法
3. 輸入 URL
4. 添加 Cookie Header
5. 點擊 **Send**

#### 預期響應 (200 OK)

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

#### 測試不同參數

- `page`: 頁碼（默認 1）
- `perPage`: 每頁數量（默認 20，最大 50）
- `source`: 來源篩選（upload | unsplash）
- `tag`: 標籤篩選（可以多個，用逗號分隔）
- `search`: 搜索關鍵字
- `sortBy`: 排序方式（createdAt | usageCount | lastUsedAt）
- `sortOrder`: 排序順序（asc | desc）

例如：
```
http://localhost:3000/api/images/list?page=1&perPage=10&source=upload&sortBy=createdAt&sortOrder=desc
```

---

### API 3: 圖片上傳

#### 請求設置

**方法**: `POST`

**URL**: 
```
http://localhost:3000/api/images/upload
```

**Headers**:
```
Cookie: next-auth.session-token=YOUR_TOKEN_HERE
```

**Body**: `form-data`

#### Postman 設置步驟

1. 創建新請求
2. 選擇 **POST** 方法
3. 輸入 URL
4. 添加 Cookie Header
5. 切換到 **Body** 標籤
6. 選擇 **form-data**
7. 添加字段：
   - Key: `file` (類型: File)
     - 點擊 "Select Files" 選擇圖片
   - Key: `alt` (類型: Text)
     - Value: `Test image description`
   - Key: `tags` (類型: Text)
     - Value: `["test", "demo", "education"]`
8. 點擊 **Send**

#### 預期響應 (200 OK)

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
    "alt": "Test image description",
    "tags": ["test", "demo", "education"],
    "createdAt": "2025-10-21T..."
  }
}
```

#### 驗證上傳

1. 複製響應中的 `url`
2. 在瀏覽器中打開該 URL
3. 應該能看到上傳的圖片
4. 再次調用 API 2（圖片列表），應該能看到新上傳的圖片

---

### API 4: Unsplash 下載

#### 請求設置

**方法**: `POST`

**URL**: 
```
http://localhost:3000/api/unsplash/download
```

**Headers**:
```
Cookie: next-auth.session-token=YOUR_TOKEN_HERE
Content-Type: application/json
```

**Body**: `raw (JSON)`

#### Postman 設置步驟

1. 創建新請求
2. 選擇 **POST** 方法
3. 輸入 URL
4. 添加 Headers:
   - `Cookie: next-auth.session-token=YOUR_TOKEN_HERE`
   - `Content-Type: application/json`
5. 切換到 **Body** 標籤
6. 選擇 **raw** 和 **JSON**
7. 輸入 JSON 數據（需要先從 API 1 獲取）

#### 獲取 photoId 和 downloadLocation

先調用 API 1（Unsplash 搜索），從響應中獲取：
- `photos[0].id` → photoId
- `photos[0].links.downloadLocation` → downloadLocation

#### Body 示例

```json
{
  "photoId": "lUaaKCUANVI",
  "downloadLocation": "https://api.unsplash.com/photos/lUaaKCUANVI/download?ixid=M3w4MTk1MDh8MHwxfHNlYXJjaHwxfHxlZHVjYXRpb258ZW58MHx8fHwxNzI5NTI4MDAwfDA",
  "alt": "Books on shelf",
  "tags": ["education", "books", "learning"]
}
```

#### 預期響應 (200 OK)

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
    "tags": ["education", "books", "learning"],
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

#### 驗證保存

1. 再次調用 API 2（圖片列表）
2. 應該能看到新保存的 Unsplash 圖片
3. 注意 `source` 字段應該是 `"unsplash"`

---

## 常見問題

### Q1: 401 Unauthorized 錯誤

**原因**: Session token 無效或過期

**解決方案**:
1. 重新登錄
2. 獲取新的 session token
3. 更新 Postman 中的 Cookie Header

### Q2: 400 Bad Request 錯誤

**原因**: 請求參數錯誤

**解決方案**:
1. 檢查 URL 參數是否正確
2. 檢查 Body 格式是否正確（JSON 格式）
3. 查看響應中的錯誤消息

### Q3: 圖片上傳失敗

**原因**: 文件太大或格式不支持

**解決方案**:
1. 確保文件 < 10MB
2. 確保格式是 JPEG/PNG/WebP/GIF
3. 確保尺寸 < 4096x4096

### Q4: Unsplash 搜索返回空結果

**原因**: 搜索關鍵字沒有匹配的圖片

**解決方案**:
1. 嘗試更通用的關鍵字（如 "nature", "education", "technology"）
2. 檢查拼寫是否正確

### Q5: 無法連接到服務器

**原因**: 開發服務器未運行

**解決方案**:
```bash
npm run dev
```

---

## 測試清單

完成以下測試以驗證所有 API 正常工作：

- [ ] API 1: Unsplash 搜索
  - [ ] 基本搜索（query=education）
  - [ ] 分頁測試（page=2）
  - [ ] 方向篩選（orientation=landscape）
  - [ ] 顏色篩選（color=blue）

- [ ] API 2: 圖片列表
  - [ ] 基本列表查詢
  - [ ] 來源篩選（source=upload）
  - [ ] 標籤篩選（tag=test）
  - [ ] 排序測試（sortBy=createdAt&sortOrder=desc）

- [ ] API 3: 圖片上傳
  - [ ] 上傳 JPEG 圖片
  - [ ] 上傳 PNG 圖片
  - [ ] 帶標籤上傳
  - [ ] 驗證圖片壓縮

- [ ] API 4: Unsplash 下載
  - [ ] 保存 Unsplash 圖片
  - [ ] 驗證不重複保存
  - [ ] 驗證攝影師信息

---

## 下一步

完成測試後：
1. 記錄測試結果
2. 報告任何發現的問題
3. 繼續 Phase 2 或 Phase 4 的開發

