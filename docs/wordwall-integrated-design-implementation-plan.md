# Wordwall 整合設計實施計畫

**日期**: 2025-10-22  
**目標**: 完全模仿 Wordwall 的圖片整合設計  
**預估時間**: 3-4 小時

---

## 🎯 目標

將圖片功能完全整合到輸入框內部，實現 Wordwall 的設計理念：
- 圖片圖標在輸入框**內部右側**
- 圖片縮圖在輸入框**內部左側**
- 不佔用任何額外的垂直或水平空間

---

## 📊 當前 vs 目標設計

### 當前設計（EduCreate）
```
[序號] [🖼️] [英文輸入框] [中文輸入框] [刪除]
              ↓
       [圖片預覽 - 128px]

問題：
- 圖標在輸入框外部
- 預覽佔用 128px 垂直空間
- 10 個項目 = 1280px 額外空間
```

### 目標設計（Wordwall）
```
[序號] [英文輸入框: [📷縮圖] 文字區域 [🖼️]] [中文輸入框] [刪除]

優點：
- 圖標和縮圖都在輸入框內部
- 不佔用額外空間
- 視覺簡潔
```

---

## 📋 實施階段

### 階段 1: 創建 InputWithImage 組件（1 小時）

**目標**: 創建一個整合圖片功能的輸入框組件

**文件**: `components/input-with-image/index.tsx`

**功能需求**:
1. ✅ 基本輸入框功能
2. ✅ 右側圖片圖標（始終顯示）
3. ✅ 左側圖片縮圖（選擇圖片後顯示）
4. ✅ 點擊圖標觸發圖片選擇
5. ✅ 點擊縮圖觸發圖片編輯
6. ✅ 動態調整 padding（有縮圖時增加左側 padding）

**組件接口**:
```tsx
interface InputWithImageProps {
  value: string;
  onChange: (value: string) => void;
  imageUrl?: string;
  onImageIconClick: () => void;
  onThumbnailClick: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}
```

**實施細節**:
```tsx
export default function InputWithImage({
  value,
  onChange,
  imageUrl,
  onImageIconClick,
  onThumbnailClick,
  placeholder,
  disabled = false,
  className = ''
}: InputWithImageProps) {
  return (
    <div className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={`
          w-full px-3 py-2 border border-gray-300 rounded-md
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${imageUrl ? 'pl-12' : 'pl-3'}  // 有圖片時增加左側 padding
          pr-10  // 右側留空間給圖片圖標
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
          ${className}
        `}
      />
      
      {/* 左側縮圖（選擇圖片後顯示） */}
      {imageUrl && (
        <button
          type="button"
          onClick={onThumbnailClick}
          disabled={disabled}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded overflow-hidden border border-gray-300 hover:border-blue-500 transition-colors"
          title="點擊編輯圖片"
        >
          <img 
            src={imageUrl} 
            alt="preview" 
            className="w-full h-full object-cover" 
          />
        </button>
      )}
      
      {/* 右側圖片圖標（始終顯示） */}
      <button
        type="button"
        onClick={onImageIconClick}
        disabled={disabled}
        className={`
          absolute right-2 top-1/2 -translate-y-1/2 
          w-6 h-6 flex items-center justify-center
          text-gray-400 hover:text-blue-500 transition-colors
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
        title={imageUrl ? "更換圖片" : "添加圖片"}
      >
        🖼️
      </button>
    </div>
  );
}
```

---

### 階段 2: 更新 VocabularyItemWithImage 組件（1 小時）

**目標**: 使用新的 InputWithImage 組件替換當前的輸入框

**文件**: `components/vocabulary-item-with-image/index.tsx`

**修改內容**:
1. ✅ 導入 InputWithImage 組件
2. ✅ 替換英文和中文輸入框
3. ✅ 移除 ImageIconButton 組件
4. ✅ 移除 CompactImagePreview 組件
5. ✅ 保留 ImagePicker 和 ImageEditor 模態框
6. ✅ 保留自動文字疊加和版本管理功能

**修改前**:
```tsx
<div className="flex items-start space-x-4">
  <ImageIconButton onClick={() => setShowImagePicker(true)} />
  <div className="flex-1">
    <input type="text" value={item.english} />
    {item.imageUrl && <CompactImagePreview />}
  </div>
</div>
```

**修改後**:
```tsx
<div className="flex-1 space-y-2">
  {/* 英文輸入框（整合圖片功能） */}
  <InputWithImage
    value={item.english}
    onChange={(value) => onChange({ ...item, english: value })}
    imageUrl={item.imageUrl}
    onImageIconClick={() => setShowImagePicker(true)}
    onThumbnailClick={() => setShowImageEditor(true)}
    placeholder="輸入英文單字..."
    disabled={isGenerating}
  />
  
  {/* 中文輸入框（普通輸入框） */}
  <input
    type="text"
    value={item.chinese}
    onChange={(e) => onChange({ ...item, chinese: e.target.value })}
    className="w-full px-3 py-2 border border-gray-300 rounded-md"
    placeholder="輸入中文翻譯..."
    disabled={isGenerating}
  />
</div>
```

---

### 階段 3: 測試和優化（1 小時）

**測試項目**:
1. ✅ 圖片選擇流程
2. ✅ 圖片編輯流程
3. ✅ 圖片刪除功能
4. ✅ 自動文字疊加
5. ✅ 縮圖顯示和隱藏
6. ✅ 輸入框 padding 動態調整
7. ✅ Hover 效果
8. ✅ 禁用狀態
9. ✅ 響應式設計

**優化項目**:
1. ✅ 縮圖大小調整（確保不影響輸入）
2. ✅ 圖標位置微調
3. ✅ 動畫效果（縮圖出現/消失）
4. ✅ 無障礙支持（aria-label）
5. ✅ 鍵盤導航

---

### 階段 4: 文檔和清理（30 分鐘）

**文檔更新**:
1. ✅ 更新 README.md
2. ✅ 創建組件使用文檔
3. ✅ 更新實施報告

**代碼清理**:
1. ✅ 移除未使用的 ImageIconButton 組件（可選）
2. ✅ 移除未使用的 CompactImagePreview 組件（可選）
3. ✅ 更新導入語句
4. ✅ 代碼格式化

---

## 📁 文件結構

### 新建文件
```
components/
  input-with-image/
    index.tsx          # 新建：整合圖片功能的輸入框
    README.md          # 新建：組件文檔
```

### 修改文件
```
components/
  vocabulary-item-with-image/
    index.tsx          # 修改：使用 InputWithImage 組件
```

### 可選刪除（保留以備後用）
```
components/
  vocabulary-item-with-image/
    ImageIconButton.tsx       # 可選刪除
    CompactImagePreview.tsx   # 可選刪除
```

---

## 🎨 視覺效果對比

### 當前設計
```
1. [🖼️] [英文輸入框]
           ↓
    [圖片預覽 - 128px 高度]
    [中文輸入框]

高度：約 200px
```

### 新設計
```
1. [英文輸入框: [📷] 文字 [🖼️]]
   [中文輸入框]

高度：約 80px（減少 60%）
```

---

## ✅ 驗收標準

### 功能完整性
- ✅ 圖片選擇功能正常
- ✅ 圖片編輯功能正常
- ✅ 圖片刪除功能正常
- ✅ 自動文字疊加正常
- ✅ 版本管理正常

### UI/UX
- ✅ 縮圖顯示在輸入框左側
- ✅ 圖標顯示在輸入框右側
- ✅ 輸入框 padding 動態調整
- ✅ Hover 效果正常
- ✅ 點擊交互正常

### 性能
- ✅ 頁面長度減少 50-70%
- ✅ 滾動性能提升
- ✅ 無明顯的性能問題

### 代碼質量
- ✅ 無語法錯誤
- ✅ TypeScript 類型完整
- ✅ 代碼註釋完整
- ✅ 組件結構清晰

---

## 🚀 實施順序

1. **階段 1**: 創建 InputWithImage 組件（1 小時）
2. **階段 2**: 更新 VocabularyItemWithImage 組件（1 小時）
3. **階段 3**: 測試和優化（1 小時）
4. **階段 4**: 文檔和清理（30 分鐘）

**總計**: 3.5 小時

---

## 📊 預期效果

### 空間節省
- 每個項目節省 128px 垂直空間
- 10 個項目節省 1280px（超過一個屏幕高度）
- 頁面長度減少 50-70%

### 用戶體驗
- 視覺更簡潔
- 更接近 Wordwall 的體驗
- 移動端友好

### 代碼質量
- 組件更簡潔
- 易於維護
- 符合設計理念

---

**準備開始實施？** 🚀

