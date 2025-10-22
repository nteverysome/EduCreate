# Postman 快速開始指南

## 🚀 5 分鐘快速測試

### 步驟 1: 登錄並獲取 Token（2 分鐘）

1. **打開瀏覽器**，訪問：http://localhost:3000/login
2. **登錄**到你的帳號
3. **按 F12** 打開開發者工具
4. **切換到 Application 標籤**（Chrome/Edge）或 Storage 標籤（Firefox）
5. **找到 Cookies** → `http://localhost:3000`
6. **複製** `next-auth.session-token` 的值

### 步驟 2: 在 Postman 中測試（3 分鐘）

#### 測試 1: Unsplash 搜索（最簡單）

1. 打開 Postman
2. 創建新請求：
   - 方法：**GET**
   - URL：`http://localhost:3000/api/unsplash/search?query=education&page=1&perPage=5`
3. 添加 Header：
   - Key: `Cookie`
   - Value: `next-auth.session-token=YOUR_TOKEN_HERE`
4. 點擊 **Send**
5. ✅ 應該看到 5 張教育相關的圖片

#### 測試 2: 圖片列表

1. 創建新請求：
   - 方法：**GET**
   - URL：`http://localhost:3000/api/images/list?page=1&perPage=10`
2. 添加 Cookie Header（同上）
3. 點擊 **Send**
4. ✅ 應該看到你的圖片列表（可能是空的）

#### 測試 3: 圖片上傳

1. 創建新請求：
   - 方法：**POST**
   - URL：`http://localhost:3000/api/images/upload`
2. 添加 Cookie Header
3. 切換到 **Body** → **form-data**
4. 添加字段：
   - `file`: 選擇一張圖片
   - `alt`: `Test image`
   - `tags`: `["test"]`
5. 點擊 **Send**
6. ✅ 應該看到上傳成功的響應

#### 測試 4: Unsplash 下載

1. 先從測試 1 的響應中複製：
   - `photos[0].id`
   - `photos[0].links.downloadLocation`
2. 創建新請求：
   - 方法：**POST**
   - URL：`http://localhost:3000/api/unsplash/download`
3. 添加 Headers：
   - `Cookie: next-auth.session-token=YOUR_TOKEN_HERE`
   - `Content-Type: application/json`
4. 切換到 **Body** → **raw** → **JSON**
5. 輸入：
   ```json
   {
     "photoId": "從測試1複製的ID",
     "downloadLocation": "從測試1複製的URL",
     "alt": "Education image",
     "tags": ["education"]
   }
   ```
6. 點擊 **Send**
7. ✅ 應該看到圖片保存成功

---

## 📝 完整測試示例

### 示例 1: Unsplash 搜索

**請求**:
```
GET http://localhost:3000/api/unsplash/search?query=education&page=1&perPage=5
Cookie: next-auth.session-token=YOUR_TOKEN_HERE
```

**響應**:
```json
{
  "success": true,
  "total": 2500,
  "photos": [...]
}
```

### 示例 2: 圖片上傳

**請求**:
```
POST http://localhost:3000/api/images/upload
Cookie: next-auth.session-token=YOUR_TOKEN_HERE
Content-Type: multipart/form-data

file: [選擇的圖片文件]
alt: "Test image"
tags: ["test", "demo"]
```

**響應**:
```json
{
  "success": true,
  "image": {
    "id": "clxxx...",
    "url": "https://jurcphibz1ecxhti.public.blob.vercel-storage.com/...",
    "fileName": "test.jpg",
    ...
  }
}
```

---

## ⚠️ 常見錯誤

### 錯誤 1: 401 Unauthorized
```json
{
  "error": "未授權訪問"
}
```
**解決**: 檢查 Cookie Header 是否正確

### 錯誤 2: 400 Bad Request
```json
{
  "error": "缺少搜索關鍵字"
}
```
**解決**: 檢查 URL 參數是否完整

### 錯誤 3: 文件太大
```json
{
  "error": "文件大小超過限制。最大: 10MB"
}
```
**解決**: 選擇更小的圖片文件

---

## 📚 詳細文檔

查看完整的測試指南：
- **docs/postman-api-testing-guide.md** - 詳細的 Postman 測試指南
- **scripts/test-image-apis.md** - API 測試文檔

---

## ✅ 測試清單

完成以下測試：

- [ ] Unsplash 搜索 API
- [ ] 圖片列表 API
- [ ] 圖片上傳 API
- [ ] Unsplash 下載 API

---

## 🎯 下一步

測試完成後：
1. 記錄測試結果
2. 報告任何問題
3. 繼續開發 Phase 2 或 Phase 4

