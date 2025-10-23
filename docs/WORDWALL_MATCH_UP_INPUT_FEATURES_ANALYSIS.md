# Wordwall Match Up 輸入框後的 3 個功能分析

## 📋 概述

分析 Wordwall Match Up 模板 (https://wordwall.net/create/entercontent?templateId=3&folderId=0) 中,**匹配定義輸入框後的 3 個功能**。

---

## 🎯 3 個核心功能

### 1. **Add Image** (加入圖片) 🖼️

#### 位置
- 在輸入框內部左側
- 緊鄰輸入文字區域

#### 功能
- 點擊後打開圖片選擇器
- 支持上傳本地圖片
- 支持從圖片庫選擇
- 圖片添加後顯示縮圖

#### UI 特徵
- 圖標: 📷 相機圖標
- 文字: "Add Image"
- 樣式: 灰色圖標,hover 時變色
- 位置: 輸入框內部左側

---

### 2. **Add Sound** (加入聲音) 🔊

#### 位置
- 在 "Add Image" 按鈕右側
- 輸入框內部

#### 功能
- 點擊後打開 TTS 對話框
- 支持多語言語音生成
- 支持選擇語音類型 (成人/兒童, 男/女)
- 語音添加後顯示縮圖

#### UI 特徵
- 圖標: 🔊 喇叭圖標
- 文字: "Add Sound"
- 樣式: 灰色圖標,hover 時變色
- 位置: 輸入框內部,"Add Image" 右側

---

### 3. **格式化工具欄** (Formatting Toolbar) ✏️

#### 位置
- 在輸入框下方
- 當輸入框獲得焦點時顯示

#### 包含的按鈕

##### 3.1 **B** (粗體)
- 功能: 將選中的文字設為粗體
- 快捷鍵: Ctrl+B (推測)
- 樣式: 黑色 "B" 字母

##### 3.2 **x²** (上標)
- 功能: 將選中的文字設為上標
- 用途: 數學公式 (如 x², m³)
- 樣式: "x" 加上標 "2"

##### 3.3 **x₂** (下標)
- 功能: 將選中的文字設為下標
- 用途: 化學公式 (如 H₂O, CO₂)
- 樣式: "x" 加下標 "2"

##### 3.4 **Ω** (特殊符號)
- 功能: 插入特殊符號
- 點擊後打開符號選擇器
- 包含: 數學符號、希臘字母、貨幣符號等
- 樣式: 希臘字母 Omega (Ω)

---

## 📊 功能對比表

| 功能 | 位置 | 觸發方式 | 主要用途 |
|------|------|---------|---------|
| **Add Image** | 輸入框內左側 | 點擊圖標 | 添加視覺輔助 |
| **Add Sound** | 輸入框內中間 | 點擊圖標 | 添加語音輔助 |
| **格式化工具欄** | 輸入框下方 | 獲得焦點時顯示 | 文字格式化 |

---

## 🎨 UI 布局結構

### Keyword 輸入框區域

```
┌─────────────────────────────────────────────────────┐
│ [🖼️ Add Image] [🔊 Add Sound] [輸入文字...]        │ ← 輸入框
└─────────────────────────────────────────────────────┘
  [B] [x²] [x₂] [Ω]                                    ← 格式化工具欄
```

### Matching Definition 輸入框區域

```
┌─────────────────────────────────────────────────────┐
│ [🖼️ Add Image] [輸入文字...]                        │ ← 輸入框
└─────────────────────────────────────────────────────┘
```

**注意**: Matching Definition 輸入框**沒有** "Add Sound" 按鈕!

---

## 🔍 詳細分析

### 1. Add Image 功能

#### 點擊後的流程
1. 打開圖片選擇對話框
2. 提供兩個選項:
   - **Upload** (上傳): 從本地上傳圖片
   - **Library** (圖片庫): 從 Wordwall 圖片庫選擇
3. 選擇圖片後:
   - 圖片上傳到服務器
   - 在輸入框左側顯示縮圖
   - 縮圖可點擊編輯或移除

#### 圖片縮圖特徵
- 尺寸: 約 40×40 px
- 位置: 輸入框內部最左側
- 功能: 點擊可編輯或移除圖片
- 樣式: 圓角矩形,帶邊框

---

### 2. Add Sound 功能

#### 點擊後的流程
1. 打開 TTS 對話框 (兩個模態框流程)
2. **第一個模態框** (輸入配置):
   - 輸入文字 (默認為輸入框內容)
   - 選擇語言 (English, Spanish, etc.)
   - 選擇語音類型 (Adult/Child, Male/Female)
   - 點擊 "Generate" 生成語音
3. **第二個模態框** (預覽確認):
   - 顯示生成的語音信息
   - 播放按鈕預覽語音
   - "Back" 返回編輯
   - "OK" 確認添加
4. 確認後:
   - 語音文件保存到服務器
   - 在輸入框顯示語音縮圖 (綠色 🔊 圖標)
   - 縮圖可點擊播放或移除

#### 語音縮圖特徵
- 圖標: 綠色 🔊 喇叭
- 位置: 輸入框內部,"Add Image" 右側
- 功能: 點擊可播放或移除語音
- 樣式: 圓形,綠色背景

---

### 3. 格式化工具欄功能

#### 顯示邏輯
- **觸發**: 輸入框獲得焦點時顯示
- **隱藏**: 輸入框失去焦點時隱藏
- **位置**: 輸入框正下方,左對齊

#### 按鈕功能詳解

##### B (粗體)
```html
<button class="format-btn">
  <strong>B</strong>
</button>
```
- 點擊後: 選中的文字變為粗體
- 再次點擊: 取消粗體
- 快捷鍵: Ctrl+B (推測)

##### x² (上標)
```html
<button class="format-btn">
  x<sup>2</sup>
</button>
```
- 點擊後: 選中的文字變為上標
- 用途: 數學公式 (x², m³, 10⁵)
- 示例: "E=mc²" → "E=mc²"

##### x₂ (下標)
```html
<button class="format-btn">
  x<sub>2</sub>
</button>
```
- 點擊後: 選中的文字變為下標
- 用途: 化學公式 (H₂O, CO₂, CH₄)
- 示例: "H2O" → "H₂O"

##### Ω (特殊符號)
```html
<button class="format-btn">
  Ω
</button>
```
- 點擊後: 打開符號選擇器
- 包含符號類別:
  - 數學符號: ±, ×, ÷, √, ∞, ≈, ≠, ≤, ≥
  - 希臘字母: α, β, γ, δ, π, Σ, Ω
  - 貨幣符號: $, €, £, ¥
  - 其他符號: ©, ®, ™, °, µ

---

## 🎯 EduCreate 實施建議

### 已實現的功能 ✅
1. **Add Image** - 完整實現
2. **Add Sound** - 完整實現 (僅英文輸入框)

### 待實現的功能 ⏳
3. **格式化工具欄** - 尚未實現

---

## 📝 格式化工具欄實施計畫

### Phase 1: 基礎架構
- [ ] 創建 `FormattingToolbar` 組件
- [ ] 實現顯示/隱藏邏輯 (focus/blur)
- [ ] 設計 UI 樣式 (與 Wordwall 一致)

### Phase 2: 粗體功能
- [ ] 實現粗體按鈕
- [ ] 處理文字選擇
- [ ] 應用 `<strong>` 或 `<b>` 標籤
- [ ] 支持快捷鍵 Ctrl+B

### Phase 3: 上標/下標功能
- [ ] 實現上標按鈕 (x²)
- [ ] 實現下標按鈕 (x₂)
- [ ] 處理文字選擇
- [ ] 應用 `<sup>` 和 `<sub>` 標籤

### Phase 4: 特殊符號功能
- [ ] 創建符號選擇器對話框
- [ ] 分類符號 (數學、希臘字母、貨幣等)
- [ ] 實現符號插入邏輯
- [ ] 支持搜索符號

### Phase 5: 整合測試
- [ ] 測試所有格式化功能
- [ ] 測試與圖片/語音功能的兼容性
- [ ] 測試跨瀏覽器兼容性
- [ ] 性能優化

---

## 🔧 技術實施細節

### 組件結構

```typescript
// FormattingToolbar.tsx
interface FormattingToolbarProps {
  visible: boolean;
  onFormat: (type: 'bold' | 'superscript' | 'subscript') => void;
  onInsertSymbol: (symbol: string) => void;
}

export default function FormattingToolbar({
  visible,
  onFormat,
  onInsertSymbol
}: FormattingToolbarProps) {
  if (!visible) return null;
  
  return (
    <div className="formatting-toolbar">
      <button onClick={() => onFormat('bold')}>
        <strong>B</strong>
      </button>
      <button onClick={() => onFormat('superscript')}>
        x<sup>2</sup>
      </button>
      <button onClick={() => onFormat('subscript')}>
        x<sub>2</sub>
      </button>
      <button onClick={() => setShowSymbolPicker(true)}>
        Ω
      </button>
    </div>
  );
}
```

### 文字格式化邏輯

```typescript
const handleFormat = (type: 'bold' | 'superscript' | 'subscript') => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  
  const range = selection.getRangeAt(0);
  const selectedText = range.toString();
  
  if (!selectedText) return;
  
  let formattedElement: HTMLElement;
  
  switch (type) {
    case 'bold':
      formattedElement = document.createElement('strong');
      break;
    case 'superscript':
      formattedElement = document.createElement('sup');
      break;
    case 'subscript':
      formattedElement = document.createElement('sub');
      break;
  }
  
  formattedElement.textContent = selectedText;
  range.deleteContents();
  range.insertNode(formattedElement);
};
```

---

## 📊 總結

### Wordwall Match Up 輸入框後的 3 個功能:

1. ✅ **Add Image** (加入圖片)
   - 位置: 輸入框內左側
   - 功能: 上傳或選擇圖片
   - 狀態: EduCreate 已實現

2. ✅ **Add Sound** (加入聲音)
   - 位置: 輸入框內中間
   - 功能: TTS 語音生成
   - 狀態: EduCreate 已實現 (僅英文)

3. ⏳ **格式化工具欄** (Formatting Toolbar)
   - 位置: 輸入框下方
   - 功能: 粗體、上標、下標、特殊符號
   - 狀態: EduCreate 尚未實現

---

**分析完成!** 🎉

**下一步建議**: 實施格式化工具欄功能,提升 EduCreate 的文字編輯能力。

