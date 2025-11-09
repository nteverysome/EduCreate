# 圖片搜尋失敗分析報告

## 問題描述

在 https://edu-create.vercel.app/create/vocabulary?edit=cmhjff7340001jf04htar2e5k 頁面上，點擊圖片圖標打開圖片模態框後，搜尋框自動填充了文字（例如 "food"），但搜尋執行失敗，顯示 "搜索失敗" 錯誤信息。

## 錯誤信息

**API 返回 500 錯誤：**
```
Failed to load resource: the server responded with a status of 500 () 
@ https://edu-create.vercel.app/api/unsplash/search?query=food&page=1&perPage=20
```

## 根本原因分析

### 1. 後端 API 錯誤 (500 Internal Server Error)

**位置：** `app/api/unsplash/search/route.ts`

**可能的原因：**

#### 原因 A：Unsplash API 密鑰未設置或無效 ⚠️ **最可能**
- 代碼第 38-44 行檢查 `UNSPLASH_ACCESS_KEY` 環境變數
- 如果未設置，返回 500 錯誤
- **Vercel 生產環境中可能未配置此環境變數**

```typescript
if (!process.env.UNSPLASH_ACCESS_KEY) {
  console.error('UNSPLASH_ACCESS_KEY 未設置');
  return NextResponse.json(
    { error: 'Unsplash API 配置錯誤' },
    { status: 500 }
  );
}
```

#### 原因 B：Unsplash API 調用失敗
- API 密鑰已過期或被撤銷
- Unsplash API 配額已用完
- 網絡連接問題

#### 原因 C：API 返回錯誤
- 代碼第 80-86 行檢查 API 響應
- 如果 `result.errors` 存在，返回 500 錯誤

```typescript
if (result.errors) {
  console.error('Unsplash API 錯誤:', result.errors);
  return NextResponse.json(
    { error: 'Unsplash API 調用失敗', details: result.errors },
    { status: 500 }
  );
}
```

### 2. 環境變數配置問題

**檢查清單：**

- ❌ `.env.vercel.template` - 未包含 `UNSPLASH_ACCESS_KEY`
- ❌ `.env.vercel.production` - 未包含 `UNSPLASH_ACCESS_KEY`
- ❌ `.env.production` - 未包含 `UNSPLASH_ACCESS_KEY`
- ⚠️ Vercel Dashboard - 需要驗證環境變數是否已設置

**文檔記錄：**
- `docs/environment-setup-complete.md` 中提到了密鑰值
- 但這些密鑰可能已過期或被重置

## 解決方案

### 步驟 1：驗證 Vercel 環境變數

1. 打開 Vercel Dashboard
2. 進入 EduCreate 項目設置
3. 點擊 "Environment Variables"
4. 檢查是否存在 `UNSPLASH_ACCESS_KEY`

### 步驟 2：獲取新的 Unsplash API 密鑰

1. 訪問 https://unsplash.com/oauth/applications
2. 登入或創建 Unsplash 帳戶
3. 創建新應用或編輯現有應用
4. 複製 "Access Key"

### 步驟 3：更新 Vercel 環境變數

1. 在 Vercel Dashboard 中添加或更新 `UNSPLASH_ACCESS_KEY`
2. 確保選擇 "All Environments"（生產、預覽、開發）
3. 點擊 "Save"
4. **重新部署項目**

### 步驟 4：驗證修復

1. 等待部署完成
2. 打開 https://edu-create.vercel.app/create/vocabulary?edit=cmhjff7340001jf04htar2e5k
3. 點擊圖片圖標
4. 驗證搜尋是否成功

## 技術細節

### 搜尋流程

1. **前端** (`SearchTab.tsx`)
   - 用戶輸入搜尋詞或自動填充
   - 調用 `searchPhotos()` 函數
   - 發送 GET 請求到 `/api/unsplash/search`

2. **後端** (`app/api/unsplash/search/route.ts`)
   - 驗證用戶登錄
   - 檢查 `UNSPLASH_ACCESS_KEY` 環境變數
   - 調用 Unsplash API
   - 返回格式化的圖片數據

3. **錯誤處理**
   - 如果環境變數未設置 → 500 錯誤
   - 如果 API 調用失敗 → 500 錯誤
   - 如果其他異常 → 500 錯誤

### 相關代碼

**前端搜尋邏輯：**
```typescript
const searchPhotos = async () => {
  setLoading(true);
  setError(null);

  try {
    const params = new URLSearchParams({
      query: searchQuery,
      page: String(page),
      perPage: '20',
    });

    const response = await fetch(`/api/unsplash/search?${params}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '搜索失敗');
    }

    setPhotos(data.photos);
    setTotalPages(data.totalPages);
  } catch (err) {
    setError(err instanceof Error ? err.message : '搜索失敗');
  } finally {
    setLoading(false);
  }
};
```

## 預期結果

修復後，搜尋應該：
1. ✅ 自動填充搜尋框（已實現）
2. ✅ 自動執行搜尋（已實現）
3. ✅ 顯示搜尋結果（待修復）
4. ✅ 允許用戶選擇圖片（待驗證）

## 相關文件

- `app/api/unsplash/search/route.ts` - 後端搜尋 API
- `components/image-picker/SearchTab.tsx` - 前端搜尋組件
- `docs/environment-setup-complete.md` - 環境設置文檔
- `.env.vercel.template` - Vercel 環境變數模板
- `.env.vercel.production` - Vercel 生產環境配置

## 建議

1. **立即行動**：檢查並更新 Vercel 環境變數
2. **文檔更新**：在 `.env.vercel.template` 中添加 `UNSPLASH_ACCESS_KEY`
3. **監控**：添加更詳細的錯誤日誌以便調試
4. **備份方案**：考慮實現本地圖片庫作為備份搜尋源

