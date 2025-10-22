# Wordwall 圖片插入 UI 設計深度分析

**日期**: 2025-10-22  
**分析頁面**: https://wordwall.net/create/entercontent?templateId=3  
**分析方法**: Playwright 瀏覽器自動化深度分析

---

## 📊 整體 UI 架構

### 1. 頁面結構

```
┌─────────────────────────────────────────────┐
│ Activity Title: [輸入框]                     │
├─────────────────────────────────────────────┤
│ Keyword                  Matching definition│
│ [Swap Columns]                              │
├─────────────────────────────────────────────┤
│ 1. [🖼️ Add Image] [🎤]  [🖼️ Add Image]      │
│    [文字輸入區]          [文字輸入區]         │
├─────────────────────────────────────────────┤
│ 2. [🖼️ Add Image] [🎤]  [🖼️ Add Image]      │
│    [文字輸入區]          [文字輸入區]         │
├─────────────────────────────────────────────┤
│ 3. [🖼️ Add Image] [🎤]  [🖼️ Add Image]      │
│    [文字輸入區]          [文字輸入區]         │
├─────────────────────────────────────────────┤
│ [+ Add an item] min 3 max 30                │
└─────────────────────────────────────────────┘
```

---

## 🎨 圖片按鈕設計

### HTML 結構

```html
<div class="item-media-holder js-item-image-holder no-select" name="0">
    <span class="item-image-placeholder js-item-image-placeholder item-media-icon fa fa-image" 
          title="Add Image">
    </span>
</div>
```

### CSS 類名

- **容器**: `.item-media-holder`, `.js-item-image-holder`
- **按鈕**: `.item-image-placeholder`, `.js-item-image-placeholder`
- **圖標**: `.item-media-icon`, `.fa`, `.fa-image` (Font Awesome)

### 視覺特徵

- 📷 使用 Font Awesome 圖標 (`fa-image`)
- 🖱️ 可點擊 (`cursor: pointer`)
- 💡 有 tooltip (`title="Add Image"`)
- 🎯 JavaScript 事件綁定 (`.js-item-image-placeholder`)

---

## 🔍 圖片選擇器模態框

### 模態框結構

```html
<div class="modal-view-wrapper js-modal-view-wrapper">
    <div class="modal-view-bg js-modal-view-bg"></div>
    <div class="modal-view js-modal-view">
        <div class="modal-view-box js-modal-view-box media-modal-wrapper">
            <!-- 頭部搜索區 -->
            <form method="post" class="media-modal-header js-modal-header">
                <input type="text" 
                       id="image_search_input" 
                       placeholder="Search for images..." 
                       class="float-left">
                
                <select id="image_size_selector" class="float-left">
                    <option value="0">All</option>
                    <option value="1">Small</option>
                    <option value="2">Medium</option>
                    <option value="3">Large</option>
                </select>
                
                <button id="image_search_button" class="default-btn grey float-left">
                    <span class="glyphicon glyphicon-search"></span>
                </button>
                
                <a href="#" id="upload_image_button" class="float-right">
                    <span class="fa fa-upload"></span>
                    <span class="upload-label"> Upload</span>
                </a>
            </form>

            <!-- 圖片搜索結果區 -->
            <div class="image-search-results-wrapper js-image-search-results-wrapper">
                <!-- 圖片網格 -->
            </div>
        </div>
        
        <!-- 關閉按鈕 -->
        <span class="js-close-modal-view close-modal-view">×</span>
    </div>
</div>
```

### 關鍵 CSS 類名

| 元素 | CSS 類名 |
|------|----------|
| 模態框容器 | `.modal-view-wrapper`, `.js-modal-view-wrapper` |
| 背景遮罩 | `.modal-view-bg`, `.js-modal-view-bg` |
| 模態框內容 | `.modal-view`, `.js-modal-view` |
| 搜索輸入框 | `#image_search_input` |
| 尺寸選擇器 | `#image_size_selector` |
| 搜索按鈕 | `#image_search_button` |
| 上傳按鈕 | `#upload_image_button` |
| 結果容器 | `.image-search-results-wrapper`, `.js-image-search-results-wrapper` |
| 關閉按鈕 | `.js-close-modal-view`, `.close-modal-view` |

---

## 🖼️ 圖片搜索結果網格

### 單個圖片項目結構

```html
<div class="image-search-result js-image-search-result" 
     draggable="false" 
     style="width: 166px;">
    <div class="preview-wrapper" draggable="false">
        <img class="preview" 
             src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTS_Db0jJvWe6vYScLksI8qoM2WCeHfJnSBVw&s" 
             data-url="https://assets.clevelandclinic.org/transform/LargeFeatureImage/cd71f4bd-81d4-45d8-a450-74df78e4477a/Apples-184940975-770x533-1_jpg" 
             draggable="false" 
             data-source-size="0">
    </div>
    <span class="dimensions">770 × 533</span>
</div>
```

### 數據屬性

- **`src`**: 縮略圖 URL (Google 加密縮略圖)
- **`data-url`**: 完整圖片 URL (原始來源)
- **`data-source-size`**: 圖片來源尺寸標記
- **`draggable="false"`**: 禁用拖動

### 視覺設計

- 📐 固定寬度: `166px`
- 🎨 網格佈局 (自動換行)
- 📏 顯示圖片尺寸 (`770 × 533`)
- 🖱️ 可點擊選擇

---

## ✅ 圖片選中後的顯示

### 選中後的 HTML 結構

```html
<div class="item-media-holder js-item-image-holder no-select has-image" name="0">
    <!-- 原始的 Add Image 按鈕被隱藏 -->
    <span class="item-image-placeholder js-item-image-placeholder item-media-icon fa fa-image hidden" 
          title="Add Image">
    </span>
    
    <!-- 顯示選中的圖片 -->
    <img class="item-image js-item-image no-select" 
         source-width="770" 
         source-height="533" 
         src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/...">
</div>
```

### 狀態變化

| 狀態 | 類名變化 | 顯示內容 |
|------|----------|----------|
| **未選擇** | `.item-media-holder` | 顯示 `.item-image-placeholder` (Add Image 按鈕) |
| **已選擇** | `.item-media-holder.has-image` | 隱藏 `.item-image-placeholder.hidden`<br>顯示 `.item-image` (圖片) |

### 圖片數據

- **`source-width`**: 原始圖片寬度
- **`source-height`**: 原始圖片高度
- **`src`**: Base64 編碼的圖片數據

---

## 🎯 交互流程

### 1. 點擊 "Add Image" 按鈕

```javascript
// 觸發事件
document.querySelector('.js-item-image-placeholder').click();

// 結果
// 1. 模態框顯示 (.modal-view-wrapper 移除 .hidden 類)
// 2. 搜索框自動聚焦
```

### 2. 搜索圖片

```javascript
// 輸入搜索關鍵字
document.querySelector('#image_search_input').value = 'apple';

// 點擊搜索按鈕
document.querySelector('#image_search_button').click();

// 結果
// 1. 顯示 loading 動畫
// 2. 載入圖片搜索結果
// 3. 顯示圖片網格 (.js-image-search-results-wrapper)
```

### 3. 選擇圖片

```javascript
// 點擊圖片
document.querySelector('.js-image-search-result').click();

// 結果
// 1. 模態框關閉
// 2. 圖片顯示在原始位置
// 3. Add Image 按鈕隱藏
// 4. 容器添加 .has-image 類
```

---

## 💡 設計亮點

### 1. **簡潔的圖標按鈕**
- ✅ 使用 Font Awesome 圖標
- ✅ 清晰的視覺提示
- ✅ Tooltip 說明

### 2. **強大的搜索功能**
- ✅ 關鍵字搜索
- ✅ 尺寸篩選 (All, Small, Medium, Large)
- ✅ 即時搜索結果

### 3. **靈活的圖片來源**
- ✅ 在線搜索 (Google Images)
- ✅ 本地上傳 (Upload 按鈕)

### 4. **優雅的圖片網格**
- ✅ 固定寬度，自動換行
- ✅ 顯示圖片尺寸
- ✅ 縮略圖預覽

### 5. **清晰的狀態管理**
- ✅ 未選擇：顯示 Add Image 按鈕
- ✅ 已選擇：顯示圖片，隱藏按鈕
- ✅ 使用 `.has-image` 類標記狀態

---

## 🔧 技術實現要點

### 1. 模態框管理

```javascript
// 顯示模態框
modalWrapper.classList.remove('hidden');

// 隱藏模態框
modalWrapper.classList.add('hidden');
```

### 2. 圖片數據處理

```javascript
// 從搜索結果獲取圖片 URL
const thumbnailUrl = img.src;  // 縮略圖
const fullImageUrl = img.getAttribute('data-url');  // 完整圖片

// 轉換為 Base64 (用於顯示)
const base64Image = await convertToBase64(fullImageUrl);
```

### 3. 狀態切換

```javascript
// 添加圖片
holder.classList.add('has-image');
placeholder.classList.add('hidden');
imageElement.src = base64Image;

// 移除圖片
holder.classList.remove('has-image');
placeholder.classList.remove('hidden');
imageElement.remove();
```

---

## 📸 截圖記錄

已保存以下截圖：

1. **wordwall-image-ui-overview.png** - 整體頁面結構
2. **wordwall-after-click-add-image.png** - 點擊 Add Image 後
3. **wordwall-image-picker-modal.png** - 圖片選擇器模態框
4. **wordwall-image-search-results.png** - 圖片搜索結果
5. **wordwall-after-select-image.png** - 選擇圖片後

---

## 🎨 UI 設計總結

### 優點

1. **簡潔直觀** - 圖標按鈕清晰易懂
2. **功能完整** - 搜索 + 上傳雙重選擇
3. **響應迅速** - 即時搜索和顯示
4. **狀態清晰** - 明確的視覺反饋

### 可借鑑的設計

1. **圖標按鈕** - 使用 Font Awesome 圖標
2. **模態框** - 全屏遮罩 + 居中內容
3. **圖片網格** - 固定寬度 + 自動換行
4. **狀態管理** - 使用 CSS 類切換狀態

---

**文檔版本**: v1.0  
**創建時間**: 2025-10-22  
**分析工具**: Playwright Browser Automation

