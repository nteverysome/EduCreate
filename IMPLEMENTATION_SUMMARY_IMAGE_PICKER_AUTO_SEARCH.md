# 圖片模態框自動搜尋功能實現總結

## 需求

在詞彙編輯頁面（https://edu-create.vercel.app/create/vocabulary?edit=...）中，當用戶在輸入框輸入英文或中文單字後，點擊圖片圖標打開圖片模態框，搜尋框應該自動填充為輸入框上的文字。

## 實現方案

### 修改的文件

#### 1. `components/image-picker/index.tsx`
- **修改內容**：
  - 添加 `initialSearchQuery?: string` prop 到 `ImagePickerProps` 接口
  - 在組件參數中添加 `initialSearchQuery = ''` 默認值
  - 將 `initialSearchQuery` 傳遞給 `SearchTab` 組件

- **代碼變更**：
```typescript
// 添加到 ImagePickerProps
initialSearchQuery?: string;

// 添加到組件參數
initialSearchQuery = '',

// 傳遞給 SearchTab
<SearchTab
  onSelect={handleImageSelect}
  isSelected={isImageSelected}
  initialSearchQuery={initialSearchQuery}
/>
```

#### 2. `components/image-picker/SearchTab.tsx`
- **修改內容**：
  - 添加 `initialSearchQuery?: string` prop 到 `SearchTabProps` 接口
  - 初始化搜尋詞時使用 `initialSearchQuery || 'education'`
  - 添加 useEffect 監聽 `initialSearchQuery` 變化
  - 更新搜尋 useEffect 依賴項，包含 `searchQuery`

- **代碼變更**：
```typescript
// 添加到 SearchTabProps
initialSearchQuery?: string;

// 初始化搜尋詞
const [searchQuery, setSearchQuery] = useState(initialSearchQuery || 'education');

// 監聽初始搜尋詞變化
useEffect(() => {
  if (initialSearchQuery && initialSearchQuery !== searchQuery) {
    setSearchQuery(initialSearchQuery);
    setPage(1);
  }
}, [initialSearchQuery]);

// 更新搜尋依賴項
useEffect(() => {
  if (searchQuery) {
    searchPhotos();
  }
}, [page, orientation, color, searchQuery]);
```

#### 3. `components/vocabulary-item-with-image/index.tsx`
- **修改內容**：
  - 英文圖片模態框傳遞 `initialSearchQuery={item.english}`
  - 中文圖片模態框傳遞 `initialSearchQuery={item.chinese}`

- **代碼變更**：
```typescript
// 英文圖片模態框
{showImagePicker && (
  <ImagePicker
    onSelect={handleImageSelect}
    onClose={() => setShowImagePicker(false)}
    multiple={false}
    initialSearchQuery={item.english}
  />
)}

// 中文圖片模態框
{showChineseImagePicker && (
  <ImagePicker
    onSelect={handleChineseImageSelect}
    onClose={() => setShowChineseImagePicker(false)}
    multiple={false}
    initialSearchQuery={item.chinese}
  />
)}
```

#### 4. `components/content-item-with-image/index.tsx`
- **修改內容**：
  - 圖片模態框傳遞 `initialSearchQuery={localValue.text}`

- **代碼變更**：
```typescript
{showImagePicker && (
  <ImagePicker
    onSelect={handleImageSelect}
    onClose={() => setShowImagePicker(false)}
    multiple={false}
    initialSearchQuery={localValue.text}
  />
)}
```

## 功能流程

1. 用戶在輸入框輸入文字（例如："apple"）
2. 用戶點擊圖片圖標
3. ImagePicker 組件打開，接收 `initialSearchQuery="apple"`
4. SearchTab 組件初始化時，搜尋詞設置為 "apple"
5. useEffect 監聽到 `initialSearchQuery` 改變，更新搜尋詞
6. 搜尋詞改變時，自動執行 `searchPhotos()` 函數
7. 搜尋結果自動加載並顯示

## 技術特點

- ✅ **向後兼容**：不傳遞 `initialSearchQuery` 時使用默認值 "education"
- ✅ **自動搜尋**：打開模態框時自動執行搜尋，無需用戶手動點擊搜尋按鈕
- ✅ **動態更新**：當輸入框文字改變時，重新打開模態框會使用新的搜尋詞
- ✅ **支持多語言**：支持英文、中文等任何文字作為搜尋詞
- ✅ **無副作用**：修改不影響其他功能

## 測試覆蓋

已創建測試文件 `tests/image-picker-auto-search.spec.ts`，包含以下測試用例：

1. 英文單字自動搜尋
2. 中文單字自動搜尋
3. 空搜尋詞使用默認值
4. 更新搜尋詞後重新搜尋

## 驗證方法

1. 打開詞彙編輯頁面
2. 在英文輸入框輸入 "cat"
3. 點擊圖片圖標
4. 驗證搜尋框自動填充 "cat"
5. 驗證圖片結果自動加載

## 相關文檔

- `docs/IMAGE_PICKER_AUTO_SEARCH_FEATURE.md` - 詳細功能文檔
- `tests/image-picker-auto-search.spec.ts` - 測試用例

## 修改統計

- 修改文件數：4 個
- 新增 prop：1 個（`initialSearchQuery`）
- 新增 useEffect：1 個
- 新增代碼行數：約 20 行
- 刪除代碼行數：0 行
- 向後兼容性：✅ 完全兼容

