# Match-Up Game 背景圖片動態加載修復

## 問題描述
用戶上傳新的背景圖片到視覺風格（雲朵主題）後，遊戲仍然顯示舊的背景圖片。新上傳的背景沒有覆蓋舊的。

## 根本原因
在 `public/games/match-up-game/scenes/preload.js` 中，背景圖片被硬編碼為靜態路徑：
```javascript
this.load.image('game-background', '/games/match-up-game/assets/game_background_4.png');
```

這導致遊戲始終加載舊的背景圖片，即使用戶上傳了新的背景到 Blob Storage。

## 解決方案
修改 `preload.js` 以動態加載背景圖片：

### 1. 移除硬編碼的背景加載
- 在 `preload()` 方法中移除硬編碼的背景加載
- 背景圖片現在在 `create()` 方法中動態加載

### 2. 添加新的方法
#### `loadBackgroundFromVisualStyle()`
- 從視覺風格資源中查找 `bg_layer` 資源
- 如果找到，使用新上傳的背景 URL
- 如果找不到，回退到備用背景

#### `loadFallbackBackground()`
- 加載備用背景圖片（硬編碼路徑）
- 作為備用方案，確保遊戲始終有背景

### 3. 修改 `create()` 方法
```javascript
// 先加載視覺風格資源
await this.loadVisualStyleResources();

// 從視覺風格資源中加載背景圖片
if (!this.textures.exists('game-background')) {
    await this.loadBackgroundFromVisualStyle();
}
```

## 資源類型命名
在上傳頁面 (`app/admin/visual-styles/page.tsx`) 中，背景圖片的資源類型為：
- **資源類型 ID**: `bg_layer`
- **顯示名稱**: "背景圖片"
- **支持格式**: PNG, JPEG, WebP

## 工作流程
1. 用戶在 `/admin/visual-styles` 頁面上傳新的背景圖片
2. 文件被上傳到 Vercel Blob Storage：`visual-styles/clouds/bg_layer.png`
3. 遊戲加載時，PreloadScene 會：
   - 調用 `loadVisualStyleResources()` 獲取視覺風格資源
   - 調用 `loadBackgroundFromVisualStyle()` 查找 `bg_layer` 資源
   - 使用新的 URL 加載背景圖片
4. GameScene 使用已加載的 `game-background` 紋理顯示背景

## 緩存破壞
API 返回的資源 URL 包含時間戳參數：
```
https://blob-url.com/visual-styles/clouds/bg_layer.png?v=1234567890
```

這確保瀏覽器不會使用舊的緩存版本。

## 測試步驟
1. 訪問 `/admin/visual-styles`
2. 選擇 "雲朵" 視覺風格
3. 上傳新的背景圖片到 "背景圖片" 欄位
4. 訪問 match-up-game 頁面
5. 驗證新的背景圖片已顯示
6. 打開瀏覽器開發者工具，檢查控制台日誌：
   - 應該看到 "🎨 PreloadScene: 從視覺風格資源加載背景圖片"
   - 應該看到 "✅ PreloadScene: 視覺風格背景圖片加載完成"

## 備用方案
如果視覺風格資源中沒有 `bg_layer`，遊戲會自動加載備用背景：
- 路徑: `/games/match-up-game/assets/game_background_4.png`
- 這確保遊戲始終有背景，不會出現白屏

## 相關文件
- `public/games/match-up-game/scenes/preload.js` - 修改的主要文件
- `public/games/match-up-game/scenes/game.js` - 背景顯示邏輯（無需修改）
- `app/admin/visual-styles/page.tsx` - 上傳頁面
- `app/api/visual-styles/upload/route.ts` - 上傳 API
- `app/api/visual-styles/resources/route.ts` - 資源獲取 API

