# Unsplash 圖片搜尋問題總結

## 問題報告

**URL**: https://edu-create.vercel.app/create/vocabulary?edit=cmhjff7340001jf04htar2e5k

**症狀**:
- 圖片模態框打開時，搜尋框自動填充文字 ✅
- 但搜尋執行失敗，顯示 "搜索失敗" 錯誤 ❌
- 瀏覽器控制台顯示 500 錯誤

**API 錯誤**:
```
Failed to load resource: the server responded with a status of 500 () 
@ https://edu-create.vercel.app/api/unsplash/search?query=food&page=1&perPage=20
```

## 根本原因

**Vercel 生產環境中未配置 Unsplash API 密鑰**

後端 API (`app/api/unsplash/search/route.ts`) 檢查環境變數：
```typescript
if (!process.env.UNSPLASH_ACCESS_KEY) {
  return NextResponse.json(
    { error: 'Unsplash API 配置錯誤' },
    { status: 500 }
  );
}
```

## 已採取的行動

### 1. 問題分析 ✅
- 檢查了前端搜尋邏輯
- 檢查了後端 API 實現
- 確認了環境變數配置缺失

### 2. 文檔更新 ✅
- 更新 `.env.vercel.production` - 添加 Unsplash 密鑰配置
- 更新 `.env.vercel.template` - 添加 Unsplash 密鑰配置說明
- 創建 `SEARCH_FAILURE_ANALYSIS.md` - 詳細分析報告
- 創建 `FIX_UNSPLASH_SEARCH_GUIDE.md` - 修復指南

### 3. 代碼提交 ✅
- 提交 ID: `8ed1094`
- 已推送到 GitHub

## 修復步驟

### 必需操作

1. **獲取 Unsplash API 密鑰**
   - 訪問 https://unsplash.com/oauth/applications
   - 創建新應用或使用現有應用
   - 複製 Access Key 和 Secret Key

2. **配置 Vercel 環境變數**
   - 打開 Vercel Dashboard
   - 進入 EduCreate 項目設置
   - 添加 `UNSPLASH_ACCESS_KEY` 環境變數
   - 添加 `UNSPLASH_SECRET_KEY` 環境變數
   - 選擇 "All Environments"
   - 點擊 Save

3. **重新部署項目**
   - 在 Vercel Dashboard 中重新部署
   - 等待部署完成（2-5 分鐘）

4. **驗證修復**
   - 打開頁面
   - 點擊圖片圖標
   - 驗證搜尋是否成功

## 相關文件

| 文件 | 說明 |
|------|------|
| `SEARCH_FAILURE_ANALYSIS.md` | 詳細的問題分析報告 |
| `FIX_UNSPLASH_SEARCH_GUIDE.md` | 完整的修復指南 |
| `.env.vercel.production` | Vercel 生產環境配置 |
| `.env.vercel.template` | Vercel 環境變數模板 |
| `app/api/unsplash/search/route.ts` | 後端搜尋 API |
| `components/image-picker/SearchTab.tsx` | 前端搜尋組件 |

## 功能狀態

### 已實現 ✅
- 搜尋框自動填充
- 搜尋自動執行
- 前端搜尋邏輯完整
- 後端 API 實現完整

### 待修復 ⏳
- Vercel 環境變數配置（需要手動操作）
- 項目重新部署（需要手動操作）

### 預期結果 🎯
修復後，圖片搜尋功能應該完全正常：
- ✅ 自動填充搜尋框
- ✅ 自動執行搜尋
- ✅ 顯示搜尋結果
- ✅ 允許用戶選擇圖片

## 技術細節

### 搜尋流程

```
用戶輸入或自動填充
    ↓
SearchTab 組件調用 searchPhotos()
    ↓
發送 GET 請求到 /api/unsplash/search
    ↓
後端驗證環境變數 ← ❌ 失敗點
    ↓
調用 Unsplash API
    ↓
返回格式化的圖片數據
    ↓
前端顯示搜尋結果
```

### 環境變數檢查

```typescript
// 後端檢查
if (!process.env.UNSPLASH_ACCESS_KEY) {
  // 返回 500 錯誤
}

// 前端捕獲
if (!response.ok) {
  setError('搜索失敗');
}
```

## 下一步

1. **立即行動**
   - 按照 `FIX_UNSPLASH_SEARCH_GUIDE.md` 中的步驟配置環境變數
   - 重新部署項目

2. **驗證**
   - 測試搜尋功能
   - 確認沒有 500 錯誤

3. **監控**
   - 監控 Vercel 部署日誌
   - 監控 API 錯誤率

## 相關資源

- Unsplash API 文檔: https://unsplash.com/documentation
- Vercel 環境變數: https://vercel.com/docs/concepts/projects/environment-variables
- 項目 GitHub: https://github.com/nteverysome/EduCreate

## 總結

✅ **問題已識別**: Unsplash API 密鑰未配置
✅ **解決方案已提供**: 詳細的修復指南
✅ **文檔已更新**: 環境變數配置文件已更新
⏳ **待執行**: 在 Vercel Dashboard 中配置環境變數並重新部署

