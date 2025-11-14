# Match-up 遊戲視覺風格管理系統設置指南

## 📋 概述

為 Match-up 遊戲創建了專屬的視覺風格管理系統，類似於 shimozurdo-game 的系統。

## 🎯 系統架構

### 1. 視覺風格配置
**文件**: `public/games/match-up-game/config/visual-styles.js`

定義了 7 種視覺風格：
- ☁️ 雲朵 (clouds)
- 🎮 電子遊戲 (videogame)
- 📚 魔法圖書館 (magiclibrary)
- 🐠 水下 (underwater)
- 🐶 寵物 (pets)
- 🚀 太空 (space)
- 🦕 恐龍 (dinosaur)

每種風格包含：
- 顏色配置 (primary, secondary, text, background, cardBackground, cardBorder)
- 字體配置 (primary, secondary)

### 2. 管理頁面
**URL**: `https://edu-create.vercel.app/admin/match-up-game/visual-styles`

**功能**：
- ✅ 選擇視覺風格
- ✅ 上傳背景圖片
- ✅ 上傳卡片背景
- ✅ 上傳卡片邊框
- ✅ 預覽已上傳的資源
- ✅ 刪除資源

### 3. API 端點
已修改 `/api/visual-styles/upload` 以支持 match-up-game：

| 方法 | 端點 | 功能 |
|------|------|------|
| POST | `/api/visual-styles/upload` | 上傳資源 |
| GET | `/api/visual-styles/upload?styleId={id}&game=match-up-game` | 獲取資源列表 |
| DELETE | `/api/visual-styles/upload?styleId={id}&resourceType={type}&game=match-up-game` | 刪除資源 |

### 4. Blob Storage 路徑結構
```
visual-styles/
├── clouds/
│   ├── colors.json
│   ├── fonts.json
│   ├── config.json
│   ├── background.png
│   ├── card_background.png
│   └── card_border.png
├── videogame/
├── magiclibrary/
├── underwater/
├── pets/
├── space/
└── dinosaur/
```

## 🚀 快速開始

### 步驟 1：上傳初始資源

運行上傳腳本以上傳所有視覺風格的配置文件：

```bash
npx tsx scripts/upload-match-up-visual-styles.ts
```

這將上傳：
- 7 種視覺風格
- 每種風格 3 個配置文件 (colors.json, fonts.json, config.json)
- 總共 21 個文件

### 步驟 2：訪問管理頁面

打開管理頁面：
```
https://edu-create.vercel.app/admin/match-up-game/visual-styles
```

### 步驟 3：上傳圖片資源

在管理頁面上：
1. 選擇視覺風格
2. 上傳背景圖片 (background.png)
3. 上傳卡片背景 (card_background.png)
4. 上傳卡片邊框 (card_border.png)

## 📦 資源規格

| 資源類型 | 建議尺寸 | 格式 | 說明 |
|---------|---------|------|------|
| 背景圖片 | 1920×1080 px | PNG/JPEG | 遊戲背景 |
| 卡片背景 | 330×284 px | PNG/JPEG | 卡片背景紋理 |
| 卡片邊框 | 330×284 px | PNG | 卡片邊框圖案 |

## 🔗 集成到遊戲

Match-up 遊戲已經支持視覺風格加載：

**文件**: `public/games/match-up-game/scenes/preload.js`

遊戲會自動：
1. 從 URL 參數或 gameOptions 讀取視覺風格 ID
2. 調用 `/api/visual-styles/resources?styleId={id}` 獲取資源
3. 加載顏色、字體和圖片配置

## 📝 使用示例

### 在遊戲中指定視覺風格

```html
<!-- 通過 URL 參數 -->
<iframe src="/games/match-up-game/?visualStyle=clouds"></iframe>

<!-- 或通過 gameOptions -->
<script>
  window.gameOptions = {
    visualStyle: 'clouds'
  };
</script>
```

### 在 API 中指定遊戲類型

```javascript
// 上傳資源
const formData = new FormData();
formData.append('file', file);
formData.append('styleId', 'clouds');
formData.append('resourceType', 'background');
formData.append('game', 'match-up-game');

fetch('/api/visual-styles/upload', {
  method: 'POST',
  body: formData
});

// 獲取資源
fetch('/api/visual-styles/upload?styleId=clouds&game=match-up-game');

// 刪除資源
fetch('/api/visual-styles/upload?styleId=clouds&resourceType=background&game=match-up-game', {
  method: 'DELETE'
});
```

## 🔧 文件清單

### 新建文件
- `public/games/match-up-game/config/visual-styles.js` - 視覺風格配置
- `app/admin/match-up-game/visual-styles/page.tsx` - 管理頁面
- `scripts/upload-match-up-visual-styles.ts` - 上傳腳本

### 修改文件
- `app/api/visual-styles/upload/route.ts` - 支持 match-up-game 的 API

## ✅ 驗證清單

- [ ] 運行上傳腳本上傳初始配置
- [ ] 訪問管理頁面確認可以訪問
- [ ] 上傳背景圖片
- [ ] 上傳卡片背景
- [ ] 上傳卡片邊框
- [ ] 在遊戲中測試視覺風格加載
- [ ] 驗證顏色和字體配置已應用

## 🐛 故障排除

### 問題：無法訪問管理頁面
- 確認已登錄
- 檢查 URL 是否正確：`/admin/match-up-game/visual-styles`

### 問題：上傳失敗
- 檢查文件格式是否正確
- 檢查文件大小是否合理
- 查看瀏覽器控制台的錯誤信息

### 問題：遊戲中看不到視覺風格
- 檢查 URL 參數中的 visualStyle 是否正確
- 檢查瀏覽器控制台的加載日誌
- 確認資源已上傳到 Blob Storage

## 📞 支持

如有問題，請檢查：
1. 瀏覽器控制台的調試信息
2. Vercel 部署日誌
3. Blob Storage 中的文件列表

