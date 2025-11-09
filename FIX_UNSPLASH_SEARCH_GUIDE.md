# 修復 Unsplash 圖片搜尋功能指南

## 問題概述

圖片模態框搜尋功能返回 **500 錯誤**，原因是 **Vercel 生產環境中未配置 Unsplash API 密鑰**。

## 快速修復步驟

### 步驟 1：獲取 Unsplash API 密鑰

1. 訪問 https://unsplash.com/oauth/applications
2. 使用 Unsplash 帳戶登入（如果沒有，先註冊）
3. 點擊 "New Application"
4. 填寫應用信息：
   - **Application name**: EduCreate
   - **Description**: Educational vocabulary game platform with image search
   - **Intended use**: Educational platform for learning vocabulary with image support
5. 同意條款並點擊 "Create application"
6. 在應用詳情頁面，複製以下信息：
   - **Access Key** (用於 `UNSPLASH_ACCESS_KEY`)
   - **Secret Key** (用於 `UNSPLASH_SECRET_KEY`)

### 步驟 2：在 Vercel 中配置環境變數

1. 打開 Vercel Dashboard: https://vercel.com/dashboard
2. 選擇 "EduCreate" 項目
3. 點擊 "Settings" 標籤
4. 在左側菜單選擇 "Environment Variables"
5. 添加新環境變數：
   - **Name**: `UNSPLASH_ACCESS_KEY`
   - **Value**: 粘貼從 Unsplash 複製的 Access Key
   - **Environments**: 選擇 "All Environments" (Production, Preview, Development)
   - 點擊 "Save"

6. 再次點擊 "Add New" 添加第二個環境變數：
   - **Name**: `UNSPLASH_SECRET_KEY`
   - **Value**: 粘貼從 Unsplash 複製的 Secret Key
   - **Environments**: 選擇 "All Environments"
   - 點擊 "Save"

### 步驟 3：重新部署項目

1. 在 Vercel Dashboard 中，點擊 "Deployments" 標籤
2. 找到最新的部署
3. 點擊部署右側的三點菜單 (...)
4. 選擇 "Redeploy"
5. 確認重新部署
6. 等待部署完成（通常 2-5 分鐘）

### 步驟 4：驗證修復

1. 打開 https://edu-create.vercel.app/create/vocabulary?edit=cmhjff7340001jf04htar2e5k
2. 在英文輸入框輸入單字（例如："apple"）
3. 點擊圖片圖標 (🖼️)
4. 驗證：
   - ✅ 搜尋框自動填充為 "apple"
   - ✅ 圖片結果自動加載
   - ✅ 沒有 "搜索失敗" 錯誤信息

## 詳細說明

### 為什麼會出現 500 錯誤？

後端 API (`app/api/unsplash/search/route.ts`) 檢查 `UNSPLASH_ACCESS_KEY` 環境變數：

```typescript
if (!process.env.UNSPLASH_ACCESS_KEY) {
  console.error('UNSPLASH_ACCESS_KEY 未設置');
  return NextResponse.json(
    { error: 'Unsplash API 配置錯誤' },
    { status: 500 }
  );
}
```

如果環境變數未設置，API 返回 500 錯誤。

### 環境變數配置

已更新的配置文件：
- ✅ `.env.vercel.production` - 添加了 Unsplash 密鑰配置
- ✅ `.env.vercel.template` - 添加了 Unsplash 密鑰配置

### 搜尋流程

1. **前端** - 用戶輸入或自動填充搜尋詞
2. **API 調用** - 發送 GET 請求到 `/api/unsplash/search`
3. **後端驗證** - 檢查環境變數和用戶登錄
4. **Unsplash API** - 調用 Unsplash API 搜尋圖片
5. **返回結果** - 格式化並返回圖片數據
6. **前端顯示** - 顯示搜尋結果

## 故障排除

### 問題：重新部署後仍然出現 500 錯誤

**解決方案：**
1. 檢查環境變數是否正確設置
2. 確認 Unsplash API 密鑰是否有效
3. 檢查 Vercel 部署日誌中的錯誤信息
4. 嘗試清除瀏覽器緩存並重新加載頁面

### 問題：Unsplash API 密鑰無效

**解決方案：**
1. 訪問 https://unsplash.com/oauth/applications
2. 檢查應用是否仍然存在
3. 重新生成 Access Key 和 Secret Key
4. 更新 Vercel 環境變數

### 問題：搜尋結果為空

**解決方案：**
1. 檢查搜尋詞是否有效
2. 確認 Unsplash API 配額未用完
3. 嘗試使用不同的搜尋詞
4. 檢查網絡連接

## 相關文件

- `app/api/unsplash/search/route.ts` - 後端搜尋 API
- `components/image-picker/SearchTab.tsx` - 前端搜尋組件
- `.env.vercel.production` - Vercel 生產環境配置
- `.env.vercel.template` - Vercel 環境變數模板
- `SEARCH_FAILURE_ANALYSIS.md` - 詳細分析報告

## 預期結果

修復後，圖片搜尋功能應該：
- ✅ 自動填充搜尋框
- ✅ 自動執行搜尋
- ✅ 顯示搜尋結果
- ✅ 允許用戶選擇圖片
- ✅ 保存圖片到用戶圖片庫

## 支持

如有問題，請檢查：
1. Vercel 部署日誌
2. 瀏覽器控制台錯誤信息
3. Unsplash API 文檔：https://unsplash.com/documentation

