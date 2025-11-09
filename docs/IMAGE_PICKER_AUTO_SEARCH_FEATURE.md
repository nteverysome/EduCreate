# 圖片模態框自動搜尋功能

## 功能說明

當用戶在詞彙編輯頁面輸入英文或中文單字時，點擊圖片圖標打開圖片模態框，搜尋框會自動填充為輸入框上的文字，並自動執行搜尋。

## 實現方式

### 1. ImagePicker 組件修改

**文件**: `components/image-picker/index.tsx`

添加了新的 prop：
```typescript
export interface ImagePickerProps {
  onSelect: (images: UserImage[]) => void;
  onClose: () => void;
  multiple?: boolean;
  maxSelection?: number;
  initialSearchQuery?: string;  // 新增：初始搜尋詞
}
```

將 `initialSearchQuery` 傳遞給 SearchTab：
```typescript
{activeTab === 'search' && (
  <SearchTab
    onSelect={handleImageSelect}
    isSelected={isImageSelected}
    initialSearchQuery={initialSearchQuery}  // 新增
  />
)}
```

### 2. SearchTab 組件修改

**文件**: `components/image-picker/SearchTab.tsx`

添加了新的 prop 和 useEffect：
```typescript
interface SearchTabProps {
  onSelect: (image: UserImage) => void;
  isSelected: (imageId: string) => boolean;
  initialSearchQuery?: string;  // 新增
}

export default function SearchTab({ 
  onSelect, 
  isSelected, 
  initialSearchQuery = '' 
}: SearchTabProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || 'education');
  
  // 當初始搜尋詞改變時，自動搜尋
  useEffect(() => {
    if (initialSearchQuery && initialSearchQuery !== searchQuery) {
      setSearchQuery(initialSearchQuery);
      setPage(1);
    }
  }, [initialSearchQuery]);

  useEffect(() => {
    if (searchQuery) {
      searchPhotos();
    }
  }, [page, orientation, color, searchQuery]);
}
```

### 3. VocabularyItemWithImage 組件修改

**文件**: `components/vocabulary-item-with-image/index.tsx`

英文圖片模態框：
```typescript
{showImagePicker && (
  <ImagePicker
    onSelect={handleImageSelect}
    onClose={() => setShowImagePicker(false)}
    multiple={false}
    initialSearchQuery={item.english}  // 新增：傳遞英文單字
  />
)}
```

中文圖片模態框：
```typescript
{showChineseImagePicker && (
  <ImagePicker
    onSelect={handleChineseImageSelect}
    onClose={() => setShowChineseImagePicker(false)}
    multiple={false}
    initialSearchQuery={item.chinese}  // 新增：傳遞中文單字
  />
)}
```

### 4. ContentItemWithImage 組件修改

**文件**: `components/content-item-with-image/index.tsx`

```typescript
{showImagePicker && (
  <ImagePicker
    onSelect={handleImageSelect}
    onClose={() => setShowImagePicker(false)}
    multiple={false}
    initialSearchQuery={localValue.text}  // 新增：傳遞內容文字
  />
)}
```

## 使用流程

1. 用戶在詞彙編輯頁面輸入英文單字（例如："apple"）
2. 用戶點擊圖片圖標
3. 圖片模態框打開，搜尋框自動填充 "apple"
4. 搜尋自動執行，顯示相關圖片結果
5. 用戶可以選擇喜歡的圖片

## 技術細節

### 搜尋流程

1. `initialSearchQuery` prop 通過 ImagePicker 傳遞給 SearchTab
2. SearchTab 初始化時，如果有 `initialSearchQuery`，則設置為初始搜尋詞
3. 當 `initialSearchQuery` 改變時，觸發 useEffect，更新搜尋詞並重置頁碼
4. 搜尋詞改變時，觸發另一個 useEffect，自動執行搜尋

### 優點

- ✅ 提高用戶體驗：無需手動輸入搜尋詞
- ✅ 自動搜尋：打開模態框時自動執行搜尋
- ✅ 靈活性：支持任何文字內容作為搜尋詞
- ✅ 向後兼容：不傳遞 `initialSearchQuery` 時使用默認值

## 測試方法

1. 打開詞彙編輯頁面
2. 輸入英文單字（例如："cat"）
3. 點擊圖片圖標
4. 驗證搜尋框自動填充 "cat"
5. 驗證圖片結果自動加載

## 相關文件

- `components/image-picker/index.tsx` - ImagePicker 主組件
- `components/image-picker/SearchTab.tsx` - 搜尋標籤
- `components/vocabulary-item-with-image/index.tsx` - 詞彙項目組件
- `components/content-item-with-image/index.tsx` - 內容項目組件

