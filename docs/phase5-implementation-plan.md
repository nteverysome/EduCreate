# Phase 5: 高級功能 - 實施計劃

## 📋 概述

Phase 5 將實現圖片編輯、版本控制等高級功能。

---

## 🎯 任務列表

### 5.1 圖片編輯 ⏳
- 裁剪功能
- 旋轉功能
- 濾鏡效果

### 5.2 批量上傳 ✅（已在 Phase 2 完成）

### 5.3 拖放上傳 ✅（已在 Phase 4 完成）

### 5.4 版本控制 ⏳
- 版本歷史
- 恢復功能

---

## 🔧 5.1 圖片編輯功能

### 技術選型

**推薦庫**:
1. **react-image-crop** - 圖片裁剪
   - 輕量級（~10KB）
   - 易於使用
   - 支持響應式

2. **react-easy-crop** - 高級裁剪
   - 更多功能
   - 更好的 UX
   - 支持縮放和旋轉

3. **canvas-api** - 濾鏡效果
   - 原生 Canvas API
   - 無需額外依賴
   - 高性能

### 組件設計

**ImageEditor 組件**:
```typescript
interface ImageEditorProps {
  imageUrl: string;
  onSave: (editedImageUrl: string) => void;
  onCancel: () => void;
}
```

**功能**:
- 裁剪（自由裁剪、固定比例）
- 旋轉（90°、180°、270°）
- 濾鏡（灰階、棕褐色、反轉、亮度、對比度）
- 縮放（放大、縮小）
- 重置（恢復原圖）

### 實施步驟

**Week 1: 裁剪功能**
1. 安裝 react-easy-crop
2. 創建 ImageCropper 組件
3. 實現裁剪邏輯
4. 保存裁剪後的圖片

**Week 2: 旋轉和濾鏡**
1. 實現旋轉功能
2. 實現濾鏡效果
3. 整合到 ImageEditor
4. 測試和優化

### 代碼示例

**安裝依賴**:
```bash
npm install react-easy-crop
```

**ImageEditor 組件**:
```typescript
import { useState } from 'react';
import Cropper from 'react-easy-crop';

export default function ImageEditor({ imageUrl, onSave, onCancel }: ImageEditorProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [filter, setFilter] = useState('none');

  const handleSave = async () => {
    // 1. 創建 canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 2. 繪製圖片
    const image = new Image();
    image.src = imageUrl;
    await image.decode();
    
    // 3. 應用編輯
    // - 裁剪
    // - 旋轉
    // - 濾鏡
    
    // 4. 轉換為 Blob
    canvas.toBlob((blob) => {
      // 5. 上傳到 Vercel Blob
      // 6. 調用 onSave
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Cropper */}
      <div className="relative h-[calc(100vh-200px)]">
        <Cropper
          image={imageUrl}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={4 / 3}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
        />
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-white p-4">
        {/* Zoom */}
        <input
          type="range"
          min={1}
          max={3}
          step={0.1}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
        />

        {/* Rotation */}
        <div className="flex gap-2 mt-2">
          <button onClick={() => setRotation((r) => r - 90)}>
            ↶ 90°
          </button>
          <button onClick={() => setRotation((r) => r + 90)}>
            ↷ 90°
          </button>
        </div>

        {/* Filters */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="mt-2"
        >
          <option value="none">無濾鏡</option>
          <option value="grayscale">灰階</option>
          <option value="sepia">棕褐色</option>
          <option value="invert">反轉</option>
        </select>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <button onClick={onCancel}>取消</button>
          <button onClick={handleSave}>保存</button>
        </div>
      </div>
    </div>
  );
}
```

---

## 🔧 5.4 版本控制功能

### 數據庫設計

**ImageVersion 模型**:
```prisma
model ImageVersion {
  id          String   @id @default(cuid())
  imageId     String
  version     Int
  url         String
  blobPath    String
  changes     Json     // 記錄變更內容
  createdAt   DateTime @default(now())
  createdBy   String
  
  image       UserImage @relation(fields: [imageId], references: [id])
  user        User      @relation(fields: [createdBy], references: [id])
  
  @@unique([imageId, version])
}
```

### API 設計

**版本管理 API**:
1. `GET /api/images/[id]/versions` - 獲取版本列表
2. `POST /api/images/[id]/versions` - 創建新版本
3. `POST /api/images/[id]/restore` - 恢復到指定版本

### 組件設計

**VersionHistory 組件**:
```typescript
interface VersionHistoryProps {
  imageId: string;
  onRestore: (versionId: string) => void;
}
```

**功能**:
- 顯示版本列表
- 預覽版本
- 恢復到指定版本
- 刪除版本

### 實施步驟

**Week 1: 數據庫和 API**
1. 添加 ImageVersion 模型
2. 創建版本管理 API
3. 實現版本創建邏輯
4. 實現版本恢復邏輯

**Week 2: 前端組件**
1. 創建 VersionHistory 組件
2. 實現版本列表顯示
3. 實現版本預覽
4. 實現版本恢復

---

## 📊 實施時間表

### Week 1-2: 圖片編輯
- Day 1-2: 裁剪功能
- Day 3-4: 旋轉功能
- Day 5-6: 濾鏡效果
- Day 7: 整合和測試

### Week 3-4: 版本控制
- Day 1-2: 數據庫模型和 API
- Day 3-4: 版本創建和恢復
- Day 5-6: 前端組件
- Day 7: 整合和測試

---

## 🧪 測試計劃

### 圖片編輯測試
- [ ] 裁剪功能測試
- [ ] 旋轉功能測試
- [ ] 濾鏡效果測試
- [ ] 保存功能測試
- [ ] 性能測試

### 版本控制測試
- [ ] 版本創建測試
- [ ] 版本列表測試
- [ ] 版本恢復測試
- [ ] 版本刪除測試

---

## 📖 相關資源

### 圖片編輯庫
- **react-easy-crop**: https://github.com/ValentinH/react-easy-crop
- **react-image-crop**: https://github.com/DominicTobias/react-image-crop
- **Canvas API**: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API

### 圖片處理
- **sharp**: https://sharp.pixelplumbing.com/
- **jimp**: https://github.com/jimp-dev/jimp

---

## 🚀 下一步

1. 安裝必要的依賴
2. 創建 ImageEditor 組件
3. 實現裁剪功能
4. 實現旋轉功能
5. 實現濾鏡效果
6. 添加版本控制
7. 測試和優化

---

## 💡 注意事項

### 性能考慮
- 大圖片處理可能較慢
- 考慮使用 Web Worker
- 添加加載指示器

### 用戶體驗
- 提供預覽功能
- 支持撤銷/重做
- 保存前確認

### 存儲考慮
- 編輯後的圖片需要重新上傳
- 版本控制會增加存儲成本
- 考慮設置版本數量限制

---

**文檔版本**: 1.0  
**最後更新**: 2025-10-21  
**維護者**: EduCreate Team

