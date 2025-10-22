# 圖片如何進入遊戲 - 完整分析報告

## 📋 概述

本文檔詳細說明了在 EduCreate 系統中，圖片如何從創建頁面流向遊戲，以及在遊戲中如何使用這些圖片。

---

## 🔄 圖片流程圖

```
創建頁面 (Create Page)
    ↓
選擇/上傳圖片 (ImagePicker)
    ↓
編輯圖片 (ImageEditor)
    ↓
生成帶文字的圖片 (overlayTextOnImage)
    ↓
上傳到 Vercel Blob
    ↓
保存 imageUrl 和 imageId 到數據庫
    ↓
遊戲頁面載入詞彙數據
    ↓
GEPTManager 處理詞彙數據
    ↓
遊戲場景使用圖片
```

---

## 📝 詳細流程

### 1. 創建頁面 - 圖片選擇和編輯

#### 1.1 組件結構

**文件**: `app/create/[templateId]/page.tsx`

**組件**: `VocabularyItemWithImage`

**數據結構**:
```typescript
interface VocabularyItem {
  id: string;
  english: string;
  chinese: string;
  imageId?: string;           // 英文圖片 ID
  imageUrl?: string;          // 英文圖片 URL
  chineseImageId?: string;    // 中文圖片 ID
  chineseImageUrl?: string;   // 中文圖片 URL
}
```

#### 1.2 圖片選擇流程

**步驟 1**: 用戶點擊圖片圖標
```tsx
<button onClick={() => setShowImagePicker(true)}>
  <ImageIcon className="w-4 h-4" />
</button>
```

**步驟 2**: 打開 ImagePicker 選擇圖片
- Unsplash 搜索
- 本地上傳
- 圖片庫選擇

**步驟 3**: 選擇圖片後，打開 ImageEditor 編輯
```tsx
const handleImageSelect = async (imageUrl: string, imageId?: string) => {
  setBaseImageUrl(imageUrl);
  setBaseImageId(imageId);
  setShowImagePicker(false);
  setShowImageEditor(true);
};
```

**步驟 4**: 編輯完成後，生成帶文字的圖片
```tsx
const handleImageEdit = async (editedImageBlob: Blob, editedImageUrl: string) => {
  try {
    // 生成帶文字的圖片
    const imageWithText = await generateImageWithText(
      editedImageUrl,
      item.english  // 使用英文文字
    );

    // 更新狀態
    onChange({
      ...item,
      imageUrl: imageWithText.url,
      imageId: imageWithText.id
    });
  } catch (error) {
    console.error('生成圖片失敗:', error);
  }
};
```

#### 1.3 圖片生成和上傳

**文件**: `lib/image-text-overlay.ts`

**函數**: `overlayTextOnImage`

**流程**:
```typescript
export async function overlayTextOnImage(
  imageUrl: string,
  text: string
): Promise<{ blob: Blob; url: string }> {
  // 1. 載入圖片
  const img = await loadImage(imageUrl);

  // 2. 創建 Canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  // 3. 繪製圖片
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // 4. 繪製文字
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'black';
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);

  // 5. 轉換為 Blob
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png');
  });

  // 6. 創建預覽 URL
  const url = URL.createObjectURL(blob);

  return { blob, url };
}
```

**上傳到 Vercel Blob**:
```typescript
const formData = new FormData();
formData.append('file', imageWithText.blob, 'image-with-text.png');

const uploadResponse = await fetch('/api/images/upload-test', {
  method: 'POST',
  body: formData,
});

const uploadData = await uploadResponse.json();

// 獲取上傳後的 URL 和 ID
const finalImageUrl = uploadData.image?.url || uploadData.url;
const finalImageId = uploadData.image?.id || uploadData.id;
```

---

### 2. 保存到數據庫

#### 2.1 保存活動

**文件**: `app/create/[templateId]/page.tsx`

**函數**: `handleSave`

**數據結構**:
```typescript
const activityData = {
  title: activityTitle,
  description: '',
  type: 'game',
  templateType: 'custom',
  content: {
    gameTemplateId: templateId,
    vocabularyItems: vocabularyItems.map(item => ({
      id: item.id,
      english: item.english,
      chinese: item.chinese,
      imageUrl: item.imageUrl,        // ✅ 英文圖片 URL
      imageId: item.imageId,          // ✅ 英文圖片 ID
      chineseImageUrl: item.chineseImageUrl,  // ✅ 中文圖片 URL
      chineseImageId: item.chineseImageId,    // ✅ 中文圖片 ID
    }))
  }
};
```

**API 端點**: `/api/activities`

**保存到數據庫**:
```typescript
const activity = await prisma.activity.create({
  data: {
    userId: session.user.id,
    title: activityData.title,
    description: activityData.description,
    type: activityData.type,
    templateType: activityData.templateType,
    content: activityData.content,  // ✅ 包含 imageUrl 和 imageId
  }
});
```

---

### 3. 遊戲頁面載入詞彙數據

#### 3.1 遊戲頁面 URL 參數

**URL 格式**:
```
/games/shimozurdo-game/?activityId=xxx&customVocabulary=true
```

**參數說明**:
- `activityId`: 活動 ID
- `customVocabulary`: 標記使用自定義詞彙
- `assignmentId`: (可選) 學生遊戲模式
- `shareToken`: (可選) 社區分享模式

#### 3.2 GEPTManager 載入詞彙

**文件**: `public/games/shimozurdo-game/managers/GEPTManager.js`

**函數**: `loadFromCloud`

**流程**:
```javascript
async loadFromCloud() {
  // 1. 從 URL 獲取參數
  const urlParams = new URLSearchParams(window.location.search);
  const activityId = urlParams.get('activityId');
  const assignmentId = urlParams.get('assignmentId');
  const shareToken = urlParams.get('shareToken');
  const isShared = urlParams.get('isShared') === 'true';

  // 2. 構建 API URL
  let apiUrl;
  if (assignmentId) {
    // 學生遊戲模式
    apiUrl = `/api/play/${activityId}/${assignmentId}`;
  } else if (isShared && shareToken) {
    // 社區分享模式
    apiUrl = `/api/share/${shareToken}`;
  } else {
    // 正常模式
    apiUrl = `/api/activities/${activityId}/vocabulary`;
  }

  // 3. 載入詞彙數據
  const response = await fetch(apiUrl);
  const result = await response.json();

  // 4. 處理詞彙數據
  const vocabularyItems = result.activity.vocabularyItems;

  // 5. 轉換為遊戲格式
  const customWords = vocabularyItems.map(item => ({
    id: item.id,
    english: item.english,
    chinese: item.chinese,
    level: 'elementary',
    difficulty: item.difficultyLevel || 1,
    frequency: 100 - (item.difficultyLevel || 1) * 10,
    category: 'custom',
    partOfSpeech: item.partOfSpeech || 'NOUN',
    image: item.imageUrl,  // ✅ 圖片 URL
    phonetic: item.phonetic
  }));

  // 6. 保存到詞彙數據庫
  this.wordDatabase.set('elementary', customWords);
}
```

---

### 4. 遊戲場景使用圖片

#### 4.1 獲取詞彙

**文件**: `public/games/shimozurdo-game/scenes/title.js`

**函數**: `getRandomWord`

```javascript
const word = this.game.geptManager.getRandomWord();

// word 對象結構:
{
  id: "1",
  english: "apple",
  chinese: "蘋果",
  level: "elementary",
  difficulty: 1,
  frequency: 90,
  category: "custom",
  partOfSpeech: "NOUN",
  image: "https://xxx.vercel-storage.com/image-with-text.png",  // ✅ 圖片 URL
  phonetic: "ˈæpl"
}
```

#### 4.2 在遊戲中顯示圖片

**目前狀態**: ❌ **尚未實現**

**需要實現的功能**:

1. **在雲朵敵人上顯示圖片**
```javascript
spawnCloudEnemy() {
  const word = this.game.geptManager.getRandomWord();
  
  // 創建雲朵敵人
  const enemy = this.physics.add.sprite(x, y, 'cloud_enemy');
  
  // ✅ 如果有圖片，顯示圖片
  if (word.image) {
    // 載入圖片
    this.load.image(`word-image-${word.id}`, word.image);
    this.load.once('complete', () => {
      // 創建圖片精靈
      const wordImage = this.add.image(0, 0, `word-image-${word.id}`);
      wordImage.setScale(0.5);  // 調整大小
      
      // 將圖片添加到雲朵容器
      enemy.wordImage = wordImage;
    });
    this.load.start();
  }
  
  // 添加文字
  const wordText = this.add.text(0, 0, word.chinese, {
    fontSize: '24px',
    color: '#000000'
  });
  
  // 保存詞彙數據
  enemy.wordData = word;
}
```

2. **在目標詞彙顯示區域顯示圖片**
```javascript
updateTargetWord() {
  const word = this.game.geptManager.getRandomWord();
  this.currentTargetWord = word;
  
  // 更新文字
  this.chineseText.setText(word.english);
  this.targetText.setText(word.chinese);
  
  // ✅ 如果有圖片，顯示圖片
  if (word.image) {
    // 載入圖片
    this.load.image(`target-image-${word.id}`, word.image);
    this.load.once('complete', () => {
      // 創建或更新圖片精靈
      if (this.targetImage) {
        this.targetImage.setTexture(`target-image-${word.id}`);
      } else {
        this.targetImage = this.add.image(x, y, `target-image-${word.id}`);
        this.targetImage.setScale(0.8);
        this.targetImage.setDepth(200);
      }
    });
    this.load.start();
  }
}
```

---

## 🎯 總結

### 當前狀態

| 功能 | 狀態 | 說明 |
|------|------|------|
| **圖片選擇** | ✅ 完成 | ImagePicker 支持 Unsplash、上傳、圖片庫 |
| **圖片編輯** | ✅ 完成 | ImageEditor 支持裁剪、旋轉、濾鏡 |
| **文字疊加** | ✅ 完成 | overlayTextOnImage 自動生成帶文字的圖片 |
| **圖片上傳** | ✅ 完成 | 上傳到 Vercel Blob 並獲取 URL |
| **保存到數據庫** | ✅ 完成 | imageUrl 和 imageId 保存到活動數據 |
| **載入詞彙數據** | ✅ 完成 | GEPTManager 正確載入包含圖片的詞彙 |
| **遊戲中顯示圖片** | ❌ **未實現** | 需要在遊戲場景中添加圖片顯示邏輯 |

### 需要實現的功能

1. **在雲朵敵人上顯示圖片**
   - 動態載入圖片
   - 調整圖片大小和位置
   - 與文字配合顯示

2. **在目標詞彙區域顯示圖片**
   - 顯示當前目標詞彙的圖片
   - 圖片與文字同步更新

3. **圖片預載入優化**
   - 在遊戲開始前預載入所有圖片
   - 避免遊戲中動態載入造成卡頓

---

**圖片流程分析完成！** 🎉

