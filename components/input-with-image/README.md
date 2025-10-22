# InputWithImage 組件

**Wordwall 風格的整合圖片功能輸入框**

---

## 📖 概述

`InputWithImage` 是一個完全模仿 Wordwall 設計的輸入框組件，將圖片功能整合到輸入框內部：
- 圖片圖標在輸入框**內部右側**
- 圖片縮圖在輸入框**內部左側**
- 不佔用任何額外的垂直或水平空間

---

## 🎯 設計理念

### Wordwall 的設計
```
初始狀態：
┌─────────────────────────────────────────┐
│ [輸入文字區域]              [🖼️圖標] │
└─────────────────────────────────────────┘

選擇圖片後：
┌─────────────────────────────────────────┐
│ [📷縮圖] [輸入文字區域]     [🖼️圖標] │
└─────────────────────────────────────────┘
```

### 優點
- ✅ 空間效率極高（不佔用額外空間）
- ✅ 視覺簡潔（看起來就是一個普通輸入框）
- ✅ 移動端友好（不需要響應式調整）

---

## 📦 使用方法

### 基本使用

```tsx
import InputWithImage from '@/components/input-with-image';

export default function MyComponent() {
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState<string>();
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);

  return (
    <InputWithImage
      value={text}
      onChange={setText}
      imageUrl={imageUrl}
      onImageIconClick={() => setShowImagePicker(true)}
      onThumbnailClick={() => setShowImageEditor(true)}
      placeholder="輸入文字..."
    />
  );
}
```

---

## 🔧 Props

| Prop | 類型 | 必填 | 默認值 | 說明 |
|------|------|------|--------|------|
| `value` | `string` | ✅ | - | 輸入框的值 |
| `onChange` | `(value: string) => void` | ✅ | - | 值改變時的回調 |
| `imageUrl` | `string` | ❌ | `undefined` | 圖片 URL（有值時顯示縮圖） |
| `onImageIconClick` | `() => void` | ✅ | - | 點擊圖片圖標時的回調 |
| `onThumbnailClick` | `() => void` | ✅ | - | 點擊縮圖時的回調 |
| `placeholder` | `string` | ❌ | `undefined` | 輸入框佔位符 |
| `disabled` | `boolean` | ❌ | `false` | 是否禁用 |
| `className` | `string` | ❌ | `''` | 額外的 CSS 類名 |

---

## 🎨 視覺效果

### 初始狀態（無圖片）
- 輸入框左側 padding: 12px
- 輸入框右側 padding: 40px（留空間給圖標）
- 右側顯示 🖼️ 圖標（灰色）

### 選擇圖片後
- 輸入框左側 padding: 48px（留空間給縮圖）
- 左側顯示 8x8 的圖片縮圖
- 右側 🖼️ 圖標保持顯示

### Hover 效果
- 縮圖：邊框變藍色
- 圖標：顏色變藍色

### 禁用狀態
- 輸入框背景變灰
- 縮圖和圖標透明度降低
- 鼠標變為 not-allowed

---

## 🔄 交互流程

1. **添加圖片**
   - 用戶點擊右側 🖼️ 圖標
   - 觸發 `onImageIconClick` 回調
   - 父組件顯示圖片選擇器

2. **編輯圖片**
   - 用戶點擊左側縮圖
   - 觸發 `onThumbnailClick` 回調
   - 父組件顯示圖片編輯器

3. **更換圖片**
   - 用戶點擊右側 🖼️ 圖標
   - 觸發 `onImageIconClick` 回調
   - 父組件顯示圖片選擇器

---

## 🎯 與 Wordwall 的對比

| 特性 | Wordwall | InputWithImage |
|------|----------|----------------|
| 圖標位置 | 輸入框內部右側 | ✅ 輸入框內部右側 |
| 縮圖位置 | 輸入框內部左側 | ✅ 輸入框內部左側 |
| 空間佔用 | 0px | ✅ 0px |
| 動態 padding | ✅ | ✅ |
| Hover 效果 | ✅ | ✅ |

---

## 📊 空間效率對比

### 舊設計（分離設計）
```
[🖼️] [輸入框]
       ↓
[圖片預覽 - 128px]

高度：約 170px
```

### 新設計（整合設計）
```
[輸入框: [📷] 文字 [🖼️]]

高度：約 40px（減少 76%）
```

---

## 🔍 技術細節

### CSS 類名結構
```tsx
<div className="relative w-full">
  <input className="w-full py-2 pl-{dynamic} pr-10 ..." />
  <button className="absolute left-2 top-1/2 -translate-y-1/2 ..." />  // 縮圖
  <button className="absolute right-2 top-1/2 -translate-y-1/2 ..." /> // 圖標
</div>
```

### 動態 Padding
- 無圖片：`pl-3`（12px）
- 有圖片：`pl-12`（48px）

### 無障礙支持
- `aria-label` 屬性
- `title` 屬性
- `focus:ring` 樣式
- 鍵盤導航支持

---

## 🚀 最佳實踐

1. **與模態框配合使用**
   ```tsx
   <InputWithImage
     onImageIconClick={() => setShowImagePicker(true)}
     onThumbnailClick={() => setShowImageEditor(true)}
   />
   
   {showImagePicker && <ImagePicker ... />}
   {showImageEditor && <ImageEditor ... />}
   ```

2. **處理圖片刪除**
   ```tsx
   const handleImageRemove = () => {
     setImageUrl(undefined);
   };
   ```

3. **禁用狀態**
   ```tsx
   <InputWithImage
     disabled={isLoading}
     value={text}
     onChange={setText}
   />
   ```

---

## 📝 注意事項

1. **縮圖大小固定為 32x32px**
   - 確保圖片清晰可見
   - 不影響輸入框高度

2. **圖標始終顯示**
   - 即使有圖片，圖標也保持顯示
   - 方便用戶更換圖片

3. **動態 padding**
   - 有圖片時自動增加左側 padding
   - 確保文字不被縮圖遮擋

---

## 🎉 完成

這個組件完全模仿了 Wordwall 的設計，提供了極高的空間效率和簡潔的視覺效果！

