# 整合圖片功能到遊戲創建頁面

**日期**: 2025-10-22  
**目標**: 將 `/test-image-components` 的圖片功能整合到 `/create/shimozurdo-game` 頁面

---

## 📋 當前狀況分析

### 現有頁面結構

**`/create/[templateId]` (app/create/[templateId]/page.tsx)**
- ✅ 活動標題輸入
- ✅ 詞彙項目列表（英文 + 中文）
- ✅ 添加/刪除項目功能
- ✅ 保存活動到數據庫
- ❌ **缺少圖片功能**

**`/test-image-components` (app/test-image-components/page.tsx)**
- ✅ ImagePicker - 圖片選擇器
- ✅ ImageEditor - 圖片編輯器
- ✅ ImageGallery - 圖片管理
- ✅ ContentItemWithImage - 內容編輯器（圖片 + 文字）
- ✅ VersionHistory - 版本歷史

---

## 🎯 整合目標

### 方案 A：完整整合（推薦）⭐

**將詞彙項目改造為 ContentItemWithImage**

**改造前**:
```tsx
<div className="flex items-center space-x-4">
  <input type="text" value={item.english} />
  <input type="text" value={item.chinese} />
  <button onClick={removeItem}>刪除</button>
</div>
```

**改造後**:
```tsx
<ContentItemWithImage
  value={{
    id: item.id,
    imageId: item.imageId,
    imageUrl: item.imageUrl,
    text: `${item.english} - ${item.chinese}`,
    position: index
  }}
  onChange={(value) => updateItemWithImage(item.id, value)}
  onRemove={() => removeItem(item.id)}
/>
```

**優點**:
- ✅ 完整的圖片功能（選擇、編輯、文字疊加）
- ✅ 與 Wordwall 功能對等
- ✅ 用戶體驗最佳

**缺點**:
- ⚠️ UI 變化較大
- ⚠️ 需要更新數據庫 schema

---

### 方案 B：漸進式整合

**保留原有文字輸入，添加可選的圖片功能**

**UI 設計**:
```
┌─────────────────────────────────────┐
│ 1. [英文輸入框] [中文輸入框] [刪除] │
│    [+ 添加圖片] (可選)               │
│                                     │
│    如果添加了圖片:                   │
│    ┌─────────────────────────────┐ │
│    │ [圖片預覽 + 文字疊加]        │ │
│    │ [編輯圖片] [刪除圖片]        │ │
│    └─────────────────────────────┘ │
└─────────────────────────────────────┘
```

**優點**:
- ✅ 保持向後兼容
- ✅ 用戶可選擇是否使用圖片
- ✅ UI 變化較小

**缺點**:
- ⚠️ UI 複雜度增加
- ⚠️ 需要處理有圖片和無圖片兩種狀態

---

### 方案 C：簡化整合

**只添加圖片選擇功能，不包含編輯和文字疊加**

**UI 設計**:
```
┌─────────────────────────────────────┐
│ 1. [圖片縮略圖] [英文] [中文] [刪除]│
│    [選擇圖片]                        │
└─────────────────────────────────────┘
```

**優點**:
- ✅ 實施簡單快速
- ✅ UI 變化最小

**缺點**:
- ⚠️ 功能不完整
- ⚠️ 無法編輯圖片或添加文字

---

## 🔧 技術實施方案（方案 A）

### 1. 更新數據結構

#### Prisma Schema 更新

```prisma
model Activity {
  id          String   @id @default(cuid())
  title       String
  templateId  String
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  items       ActivityItem[]  // 關聯到 ActivityItem
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model ActivityItem {
  id          String   @id @default(cuid())
  activityId  String
  activity    Activity @relation(fields: [activityId], references: [id], onDelete: Cascade)
  
  // 原有欄位
  english     String
  chinese     String
  phonetic    String?
  
  // 新增圖片欄位
  imageId     String?
  imageUrl    String?
  
  position    Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([activityId])
}
```

### 2. 更新 TypeScript 接口

```typescript
// lib/vocabulary/loadVocabularyData.ts
export interface VocabularyItem {
  id: string;
  english: string;
  chinese: string;
  phonetic?: string;
  imageId?: string;      // 新增
  imageUrl?: string;     // 新增
  position?: number;
}
```

### 3. 更新頁面組件

#### 導入必要組件

```typescript
import ContentItemWithImage from '@/components/content-item-with-image';
import ImagePicker from '@/components/image-picker';
```

#### 更新狀態管理

```typescript
const [vocabularyItems, setVocabularyItems] = useState<VocabularyItem[]>([
  { 
    id: '1', 
    english: '', 
    chinese: '',
    imageId: undefined,
    imageUrl: undefined,
    position: 0
  },
]);
```

#### 更新 UI 渲染

```typescript
{vocabularyItems.map((item, index) => (
  <ContentItemWithImage
    key={item.id}
    value={{
      id: item.id,
      imageId: item.imageId,
      imageUrl: item.imageUrl,
      text: `${item.english}\n${item.chinese}`,
      position: index
    }}
    onChange={(value) => {
      // 解析文字回英文和中文
      const [english, chinese] = value.text.split('\n');
      updateItem(item.id, {
        english: english || '',
        chinese: chinese || '',
        imageId: value.imageId,
        imageUrl: value.imageUrl
      });
    }}
    onRemove={() => removeItem(item.id)}
  />
))}
```

### 4. 更新 API 端點

#### `/api/activities` POST/PUT

```typescript
// 保存活動時包含圖片信息
const activity = await prisma.activity.create({
  data: {
    title: activityTitle,
    templateId,
    userId: session.user.id,
    items: {
      create: vocabularyItems.map((item, index) => ({
        english: item.english,
        chinese: item.chinese,
        phonetic: item.phonetic,
        imageId: item.imageId,      // 新增
        imageUrl: item.imageUrl,    // 新增
        position: index
      }))
    }
  }
});
```

---

## 📊 工作量估算

### 方案 A：完整整合

| 任務 | 時間 |
|------|------|
| 更新 Prisma Schema | 0.5 小時 |
| 更新 TypeScript 接口 | 0.25 小時 |
| 更新頁面組件 | 1.5 小時 |
| 更新 API 端點 | 0.75 小時 |
| 測試和調試 | 1 小時 |
| **總計** | **4 小時** |

### 方案 B：漸進式整合

| 任務 | 時間 |
|------|------|
| 更新 Prisma Schema | 0.5 小時 |
| 更新 TypeScript 接口 | 0.25 小時 |
| 創建混合 UI 組件 | 2 小時 |
| 更新 API 端點 | 0.75 小時 |
| 測試和調試 | 1.5 小時 |
| **總計** | **5 小時** |

### 方案 C：簡化整合

| 任務 | 時間 |
|------|------|
| 更新 Prisma Schema | 0.5 小時 |
| 更新 TypeScript 接口 | 0.25 小時 |
| 添加圖片選擇按鈕 | 1 小時 |
| 更新 API 端點 | 0.5 小時 |
| 測試和調試 | 0.75 小時 |
| **總計** | **3 小時** |

---

## 🎨 UI/UX 設計（方案 A）

### 改造後的頁面結構

```
┌─────────────────────────────────────────────┐
│ Shimozurdo 雲朵遊戲                          │
│ 通過雲朵碰撞學習英語詞彙                      │
├─────────────────────────────────────────────┤
│ 活動標題: [輸入框]                           │
├─────────────────────────────────────────────┤
│ 內容項目:                                    │
│                                             │
│ ┌─────────────────────────────────────────┐│
│ │ 內容項目 #1                        [刪除]││
│ │ ┌─────────────────────────────────────┐ ││
│ │ │ [圖片預覽 + 文字疊加]                │ ││
│ │ │ "apple - 蘋果"                       │ ││
│ │ └─────────────────────────────────────┘ ││
│ │ 文字內容:                                ││
│ │ [文字編輯區]                             ││
│ │ apple                                   ││
│ │ 蘋果                                     ││
│ └─────────────────────────────────────────┘││
│                                             │
│ ┌─────────────────────────────────────────┐│
│ │ 內容項目 #2                        [刪除]││
│ │ ...                                     ││
│ └─────────────────────────────────────────┘││
│                                             │
│ [+ 新增項目]                                 │
├─────────────────────────────────────────────┤
│ [返回] [完成並開始遊戲]                      │
└─────────────────────────────────────────────┘
```

---

## 💡 推薦方案

**推薦：方案 A（完整整合）**

**理由**:
1. **功能完整** - 提供與 Wordwall 對等的圖片功能
2. **用戶體驗最佳** - 統一的內容編輯體驗
3. **長期價值** - 為未來的功能擴展打好基礎
4. **時間合理** - 4 小時的投入換取完整功能

---

## 📝 實施步驟

### 第一步：數據庫更新（30 分鐘）

1. 更新 `prisma/schema.prisma`
2. 運行 `npx prisma migrate dev`
3. 驗證數據庫更新成功

### 第二步：接口更新（15 分鐘）

1. 更新 `lib/vocabulary/loadVocabularyData.ts`
2. 更新相關的 TypeScript 類型定義

### 第三步：頁面組件更新（1.5 小時）

1. 導入 `ContentItemWithImage` 組件
2. 更新狀態管理邏輯
3. 替換原有的輸入框為 `ContentItemWithImage`
4. 處理文字解析邏輯

### 第四步：API 更新（45 分鐘）

1. 更新 `/api/activities` POST 端點
2. 更新 `/api/activities/[id]` PUT 端點
3. 確保圖片信息正確保存和讀取

### 第五步：測試（1 小時）

1. 創建新活動並添加圖片
2. 編輯現有活動
3. 驗證圖片保存和讀取
4. 測試遊戲啟動

---

**文檔版本**: v1.0  
**創建時間**: 2025-10-22  
**狀態**: 等待用戶確認

