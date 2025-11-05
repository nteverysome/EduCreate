# v73.0 英文圖片 vs 中文圖片上傳對比分析

## 🔍 問題描述

用戶報告：
- **中文圖片上傳失敗**：選擇中文圖片時顯示"上傳失敗"
- **英文圖片正常**：英文圖片可以正常上傳

## 📊 上傳流程對比

### 英文圖片上傳流程

```
1. 用戶點擊"編輯圖片"或"添加圖片"
   ↓
2. 打開 ImagePicker 組件
   ↓
3. 選擇圖片（Unsplash 或上傳）
   ↓
4. 調用 handleImageSelect()
   ↓
5. 更新 item.imageUrl
   ↓
6. 如果編輯圖片：
   - 調用 handleImageEdit()
   - 檢查 enableEnglishTextOverlay
   - 如果 false：直接上傳到 /api/images/upload-test
   - 如果 true：調用 generateImageWithText()
```

### 中文圖片上傳流程

```
1. 用戶點擊"添加圖片"
   ↓
2. 打開 ImagePicker 組件
   ↓
3. 選擇圖片（Unsplash 或上傳）
   ↓
4. 調用 handleChineseImageSelect()
   ↓
5. 更新 item.chineseImageUrl
   ↓
6. 如果編輯圖片：
   - 調用 handleChineseImageEdit()
   - 檢查 enableChineseTextOverlay
   - 如果 false：直接上傳到 /api/images/upload-test
   - 如果 true：調用 generateChineseImageWithText()
```

## 🔴 根本原因

### 問題 1：文字疊加功能的 CORS 問題

當 `enableChineseTextOverlay = true` 時：

1. 調用 `generateChineseImageWithText()`
2. 調用 `overlayTextOnImage()` 來生成帶文字的圖片
3. `overlayTextOnImage()` 嘗試載入圖片到 Canvas
4. **如果圖片來自 Unsplash（跨域），可能出現 CORS 錯誤**

**代碼位置**：`lib/image-text-overlay.ts` 第 34-51 行

```typescript
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    // 只對跨域圖片設置 crossOrigin
    if (!url.startsWith('blob:') && !url.startsWith(window.location.origin)) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => resolve(img);
    img.onerror = (error) => {
      console.error('圖片載入失敗:', url, error);
      reject(new Error(`Failed to load image: ${url}`));
    };
    img.src = url;
  });
}
```

### 問題 2：英文圖片為什麼能成功

英文圖片能成功的原因：
1. **用戶沒有勾選"疊加文字"選項**（enableEnglishTextOverlay = false）
2. 直接上傳到 `/api/images/upload-test`，不經過 Canvas 處理
3. 避免了 CORS 問題

## ✅ 解決方案

### 方案 1：改進 CORS 處理（推薦）

在 `overlayTextOnImage()` 中添加更好的錯誤處理和 CORS 支持：

```typescript
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    // 對所有跨域圖片設置 crossOrigin
    img.crossOrigin = 'anonymous';

    img.onload = () => resolve(img);
    img.onerror = (error) => {
      console.error('圖片載入失敗:', url, error);
      // 提供更詳細的錯誤信息
      reject(new Error(`Failed to load image: ${url}. 可能是 CORS 問題或圖片不存在`));
    };
    img.src = url;
  });
}
```

### 方案 2：禁用中文圖片的文字疊加

在編輯中文圖片時，默認禁用"疊加文字"選項：

```typescript
// 在 vocabulary-item-with-image/index.tsx 中
const [enableChineseTextOverlay, setEnableChineseTextOverlay] = useState(false);
// 保持 false，不允許用戶勾選
```

### 方案 3：使用 Proxy 服務器

為跨域圖片創建一個代理端點，避免 CORS 問題：

```typescript
// 新增 API 端點：/api/images/proxy
// 用於代理跨域圖片請求
```

## 📋 建議

**立即實施**：
1. 改進 `overlayTextOnImage()` 的 CORS 處理
2. 添加更詳細的錯誤提示
3. 在 UI 中禁用中文圖片的文字疊加選項

**長期改進**：
1. 實現圖片代理服務
2. 支持本地圖片上傳後再進行文字疊加
3. 提供更好的錯誤恢復機制

## 🎯 預期結果

修復後：
- ✅ 中文圖片上傳成功
- ✅ 英文圖片繼續正常工作
- ✅ 用戶獲得更清晰的錯誤提示
- ✅ 避免 CORS 相關的上傳失敗

