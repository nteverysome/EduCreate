# 英文框和中文框獨立圖片功能實施報告

## 📋 需求說明

**頁面**: https://edu-create.vercel.app/create/shimozurdo-game  
**實施日期**: 2025-01-21  
**需求**: 中文框的加入圖片與英文框的加入圖片要能各自獨立的圖片

---

## 🎯 實施目標

### 原始設計

**問題**:
- 英文框和中文框共享同一張圖片
- 選擇圖片後，兩個框都顯示相同的圖片
- 無法為英文和中文分別選擇不同的圖片

**用戶需求**:
- 英文框可以選擇一張圖片（例如：apple 的圖片）
- 中文框可以選擇另一張圖片（例如：蘋果的圖片）
- 兩個圖片完全獨立，互不影響

---

## 🔧 技術實施

### 1. 數據結構更新

#### VocabularyItem 接口擴展

**文件**: `lib/vocabulary/loadVocabularyData.ts`

**變更前**:
```typescript
export interface VocabularyItem {
  id: string;
  english: string;
  chinese: string;
  phonetic?: string;
  imageId?: string;     // 圖片 ID
  imageUrl?: string;    // 圖片 URL
  // ...其他字段
}
```

**變更後**:
```typescript
export interface VocabularyItem {
  id: string;
  english: string;
  chinese: string;
  phonetic?: string;
  imageId?: string;           // 英文圖片 ID
  imageUrl?: string;          // 英文圖片 URL
  chineseImageId?: string;    // 中文圖片 ID
  chineseImageUrl?: string;   // 中文圖片 URL
  // ...其他字段
}
```

**新增字段**:
- ✅ `chineseImageId`: 中文圖片的 ID
- ✅ `chineseImageUrl`: 中文圖片的 URL

---

### 2. 組件狀態管理

#### VocabularyItemWithImage 組件更新

**文件**: `components/vocabulary-item-with-image/index.tsx`

#### 2.1 接口定義更新

**變更前**:
```typescript
export interface VocabularyItemData {
  id: string;
  english: string;
  chinese: string;
  imageId?: string;
  imageUrl?: string;
}
```

**變更後**:
```typescript
export interface VocabularyItemData {
  id: string;
  english: string;
  chinese: string;
  imageId?: string;           // 英文圖片 ID
  imageUrl?: string;          // 英文圖片 URL
  chineseImageId?: string;    // 中文圖片 ID
  chineseImageUrl?: string;   // 中文圖片 URL
}
```

#### 2.2 狀態變量添加

**新增狀態**:
```typescript
// 英文圖片狀態（原有）
const [showImagePicker, setShowImagePicker] = useState(false);
const [showImageEditor, setShowImageEditor] = useState(false);
const [isGenerating, setIsGenerating] = useState(false);
const [baseImageUrl, setBaseImageUrl] = useState<string | null>(null);

// 中文圖片狀態（新增）
const [showChineseImagePicker, setShowChineseImagePicker] = useState(false);
const [showChineseImageEditor, setShowChineseImageEditor] = useState(false);
const [isGeneratingChinese, setIsGeneratingChinese] = useState(false);
const [baseChineseImageUrl, setBaseChineseImageUrl] = useState<string | null>(null);
```

**說明**:
- ✅ 每個圖片功能都有獨立的狀態管理
- ✅ 英文和中文圖片完全分離
- ✅ 互不干擾

---

### 3. 處理函數實施

#### 3.1 中文圖片選擇處理

**新增函數**: `handleChineseImageSelect`

```typescript
const handleChineseImageSelect = async (images: UserImage[]) => {
  if (images.length > 0) {
    const selectedImage = images[0];
    setBaseChineseImageUrl(selectedImage.url);
    
    onChange({
      ...item,
      chineseImageId: selectedImage.id,
      chineseImageUrl: selectedImage.url,
    });
    
    setShowChineseImagePicker(false);
    
    // 如果有中文文字，自動生成帶文字的圖片
    if (item.chinese) {
      await generateChineseImageWithText(selectedImage.url);
    }
  }
};
```

#### 3.2 中文圖片編輯處理

**新增函數**: `handleChineseImageEdit`

```typescript
const handleChineseImageEdit = (editedBlob: Blob, editedUrl: string) => {
  setBaseChineseImageUrl(editedUrl);
  onChange({
    ...item,
    chineseImageUrl: editedUrl,
  });
  setShowChineseImageEditor(false);
  
  // 重新生成帶文字的圖片
  if (item.chinese) {
    generateChineseImageWithText(editedUrl);
  }
};
```

#### 3.3 中文圖片刪除處理

**新增函數**: `handleChineseImageRemove`

```typescript
const handleChineseImageRemove = () => {
  onChange({
    ...item,
    chineseImageId: undefined,
    chineseImageUrl: undefined,
  });
  setBaseChineseImageUrl(null);
};
```

#### 3.4 中文圖片文字疊加

**新增函數**: `generateChineseImageWithText`

```typescript
const generateChineseImageWithText = async (imageUrl: string) => {
  if (!item.chinese) return;

  setIsGeneratingChinese(true);
  try {
    // 文字疊加選項
    const options: TextOverlayOptions = {
      text: item.chinese,
      position: { x: 50, y: 50 },
      fontSize: 'medium',
      textColor: 'white',
      showBackground: true,
    };

    // 生成圖片 Blob
    const generatedImageBlob = await overlayTextOnImage(imageUrl, options);

    // 創建預覽 URL
    const previewUrl = URL.createObjectURL(generatedImageBlob);

    // 立即更新預覽
    onChange({
      ...item,
      chineseImageUrl: previewUrl,
    });

    // 上傳到 Vercel Blob
    const formData = new FormData();
    formData.append('file', generatedImageBlob, `vocabulary-chinese-${item.id}-${Date.now()}.png`);

    const uploadResponse = await fetch('/api/images/upload-test', {
      method: 'POST',
      body: formData,
    });

    if (uploadResponse.ok) {
      const uploadData = await uploadResponse.json();
      const imageData = uploadData.image || uploadData;

      // 更新為永久 URL
      onChange({
        ...item,
        chineseImageUrl: imageData.url,
        chineseImageId: imageData.id,
      });

      URL.revokeObjectURL(previewUrl);
    }
  } catch (error) {
    console.error('生成中文圖片失敗:', error);
  } finally {
    setIsGeneratingChinese(false);
  }
};
```

---

### 4. UI 組件更新

#### 4.1 英文輸入框（保持不變）

```tsx
{/* 英文輸入框（整合圖片功能） */}
<div className="flex-1">
  <InputWithImage
    value={item.english}
    onChange={(value) => onChange({ ...item, english: value })}
    imageUrl={item.imageUrl}
    onImageIconClick={() => setShowImagePicker(true)}
    onThumbnailClick={() => setShowImageEditor(true)}
    placeholder="輸入英文單字..."
    disabled={isGenerating}
  />

  {/* 生成狀態提示 */}
  {isGenerating && (
    <div className="flex items-center space-x-2 text-sm text-blue-600 mt-2">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      <span>正在生成圖片...</span>
    </div>
  )}
</div>
```

#### 4.2 中文輸入框（更新為獨立圖片）

**變更前**:
```tsx
{/* 中文輸入框 */}
<div className="flex-1">
  <InputWithImage
    value={item.chinese}
    onChange={(value) => onChange({ ...item, chinese: value })}
    imageUrl={item.imageUrl}  // ❌ 使用英文圖片
    onImageIconClick={() => setShowImagePicker(true)}  // ❌ 打開英文圖片選擇器
    onThumbnailClick={() => setShowImageEditor(true)}  // ❌ 打開英文圖片編輯器
    placeholder="輸入中文翻譯..."
    disabled={isGenerating}
  />
</div>
```

**變更後**:
```tsx
{/* 中文輸入框（獨立的圖片功能） */}
<div className="flex-1">
  <InputWithImage
    value={item.chinese}
    onChange={(value) => onChange({ ...item, chinese: value })}
    imageUrl={item.chineseImageUrl}  // ✅ 使用中文圖片
    onImageIconClick={() => setShowChineseImagePicker(true)}  // ✅ 打開中文圖片選擇器
    onThumbnailClick={() => setShowChineseImageEditor(true)}  // ✅ 打開中文圖片編輯器
    placeholder="輸入中文翻譯..."
    disabled={isGeneratingChinese}  // ✅ 使用中文圖片生成狀態
  />

  {/* 生成狀態提示 */}
  {isGeneratingChinese && (
    <div className="flex items-center space-x-2 text-sm text-blue-600 mt-2">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      <span>正在生成中文圖片...</span>
    </div>
  )}
</div>
```

#### 4.3 模態框更新

**新增中文圖片模態框**:
```tsx
{/* 英文圖片模態框 */}
{showImagePicker && (
  <ImagePicker
    onSelect={handleImageSelect}
    onClose={() => setShowImagePicker(false)}
    multiple={false}
  />
)}

{showImageEditor && item.imageUrl && (
  <ImageEditor
    imageUrl={baseImageUrl || item.imageUrl}
    onSave={handleImageEdit}
    onClose={() => setShowImageEditor(false)}
  />
)}

{/* 中文圖片模態框 */}
{showChineseImagePicker && (
  <ImagePicker
    onSelect={handleChineseImageSelect}
    onClose={() => setShowChineseImagePicker(false)}
    multiple={false}
  />
)}

{showChineseImageEditor && item.chineseImageUrl && (
  <ImageEditor
    imageUrl={baseChineseImageUrl || item.chineseImageUrl}
    onSave={handleChineseImageEdit}
    onClose={() => setShowChineseImageEditor(false)}
  />
)}
```

---

### 5. 自動文字疊加更新

#### 5.1 英文圖片自動更新

**變更前**:
```typescript
useEffect(() => {
  if (baseImageUrl && (item.english || item.chinese)) {
    const timer = setTimeout(() => {
      generateImageWithText(baseImageUrl);
    }, 1000);
    
    return () => clearTimeout(timer);
  }
}, [item.english, item.chinese]);
```

**變更後**:
```typescript
// 只在英文改變時更新英文圖片
useEffect(() => {
  if (baseImageUrl && item.english) {
    const timer = setTimeout(() => {
      generateImageWithText(baseImageUrl);
    }, 1000);
    
    return () => clearTimeout(timer);
  }
}, [item.english]);
```

#### 5.2 中文圖片自動更新（新增）

```typescript
// 當中文改變時更新中文圖片
useEffect(() => {
  if (baseChineseImageUrl && item.chinese) {
    const timer = setTimeout(() => {
      generateChineseImageWithText(baseChineseImageUrl);
    }, 1000);
    
    return () => clearTimeout(timer);
  }
}, [item.chinese]);
```

---

## 📊 實施效果

### 修復前

| 功能 | 狀態 | 問題 |
|------|------|------|
| 英文框圖片 | ✅ 正常 | 可以選擇圖片 |
| 中文框圖片 | ❌ 共享 | 與英文框共享同一張圖片 |
| 獨立選擇 | ❌ 不支持 | 無法為中文選擇不同的圖片 |

### 修復後

| 功能 | 狀態 | 改進 |
|------|------|------|
| 英文框圖片 | ✅ 正常 | 可以選擇圖片 |
| 中文框圖片 | ✅ 獨立 | 可以選擇不同的圖片 |
| 獨立選擇 | ✅ 支持 | 英文和中文完全獨立 |
| 自動文字疊加 | ✅ 獨立 | 各自生成帶文字的圖片 |

---

## 🚀 Git 提交記錄

**Commit**: `7ebff56`  
**Message**: "feat: Add independent image functionality for Chinese input field"

**變更文件**:
1. `lib/vocabulary/loadVocabularyData.ts` (2 行新增)
   - 添加 `chineseImageId` 和 `chineseImageUrl` 字段

2. `components/vocabulary-item-with-image/index.tsx` (158 行新增，16 行刪除)
   - 添加中文圖片狀態管理
   - 添加中文圖片處理函數
   - 更新 UI 組件
   - 添加中文圖片模態框

**總計**: 2 個文件，174 行變更

---

## 🎯 使用示例

### 場景 1: 為英文和中文選擇不同的圖片

1. **英文框**:
   - 輸入 "apple"
   - 點擊 🖼️ 圖標
   - 選擇蘋果的圖片
   - 自動生成帶 "apple" 文字的圖片

2. **中文框**:
   - 輸入 "蘋果"
   - 點擊 🖼️ 圖標
   - 選擇另一張蘋果的圖片（或完全不同的圖片）
   - 自動生成帶 "蘋果" 文字的圖片

3. **結果**:
   - 英文框顯示第一張圖片
   - 中文框顯示第二張圖片
   - 兩張圖片完全獨立

---

## 🎉 總結

### 成就

- ✅ **英文和中文圖片完全獨立**
- ✅ **各自的圖片選擇和編輯功能**
- ✅ **獨立的自動文字疊加**
- ✅ **獨立的生成狀態提示**
- ✅ **完整的數據結構支持**
- ✅ **保持 Wordwall 整合設計風格**

### 影響

- 🎯 用戶體驗大幅提升
- 📱 功能更靈活
- 🚀 支持更多使用場景
- 💡 英文和中文可以使用不同的視覺輔助

---

**獨立圖片功能實施完成！等待 Vercel 部署後即可測試！** 🎉

