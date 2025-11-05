# 🚀 右側卡片圖片支持 - 快速開始指南 v62.0

## ⚡ 5 分鐘快速開始

### 步驟 1：確保代碼已更新

```bash
git pull origin master
```

### 步驟 2：啟動開發服務器

```bash
npm run dev
```

### 步驟 3：打開遊戲頁面

```
http://localhost:3000/games/switcher?game=match-up-game&activityId=YOUR_ACTIVITY_ID
```

### 步驟 4：編輯詞彙

1. 點擊"編輯"按鈕
2. 為中文詞彙添加圖片 URL（`chineseImageUrl`）
3. 為詞彙添加語音 URL（`audioUrl`）
4. 點擊"保存"

### 步驟 5：開始遊戲

1. 點擊"更新並開始遊戲"
2. 查看右側卡片
3. 應該看到圖片和/或語音按鈕

## 📋 詞彙數據格式

### 完整示例

```javascript
{
  id: 1,
  english: "apple",
  chinese: "蘋果",
  imageUrl: "https://example.com/apple.jpg",
  chineseImageUrl: "https://example.com/蘋果.jpg",  // 新增
  audioUrl: "https://example.com/apple.mp3"         // 新增
}
```

### 最小示例（只有文字）

```javascript
{
  id: 1,
  english: "apple",
  chinese: "蘋果"
}
```

### 圖片 + 文字示例

```javascript
{
  id: 1,
  english: "apple",
  chinese: "蘋果",
  chineseImageUrl: "https://example.com/蘋果.jpg"
}
```

### 圖片 + 語音示例

```javascript
{
  id: 1,
  english: "apple",
  chinese: "蘋果",
  chineseImageUrl: "https://example.com/蘋果.jpg",
  audioUrl: "https://example.com/apple.mp3"
}
```

## 🎨 佈局預覽

### 佈局 A：圖片 + 文字 + 語音

```
┌─────────────────┐
│   🔊 語音按鈕   │ (30%)
├─────────────────┤
│                 │
│     🖼️ 圖片     │ (40%)
│                 │
├─────────────────┤
│     蘋果        │ (30%)
└─────────────────┘
```

### 佈局 D：圖片 + 文字

```
┌─────────────────┐
│                 │
│     🖼️ 圖片     │ (60%)
│                 │
├─────────────────┤
│     蘋果        │ (40%)
└─────────────────┘
```

### 佈局 E：文字 + 語音

```
┌─────────────────┐
│     蘋果        │ (70%)
├─────────────────┤
│   🔊 語音按鈕   │ (30%)
└─────────────────┘
```

### 佈局 F：只有圖片

```
┌─────────────────┐
│                 │
│     🖼️ 圖片     │ (1:1)
│                 │
└─────────────────┘
```

## 🔍 調試技巧

### 打開控制台日誌

1. 按 F12 打開開發者工具
2. 切換到 Console 標籤
3. 查看 `[v62.0]` 開頭的日誌

### 查看圖片加載

1. 打開 Network 標籤
2. 過濾 "img" 類型
3. 查看圖片 URL 和加載狀態

### 查看語音加載

1. 打開 Network 標籤
2. 過濾 "media" 類型
3. 查看語音 URL 和加載狀態

## ✅ 驗證清單

- [ ] 代碼已更新（git pull）
- [ ] 開發服務器運行中
- [ ] 可以打開遊戲頁面
- [ ] 可以編輯詞彙
- [ ] 可以添加圖片 URL
- [ ] 可以添加語音 URL
- [ ] 遊戲頁面顯示圖片
- [ ] 語音按鈕可點擊
- [ ] 語音可正常播放
- [ ] 卡片拖拽正常工作

## 🐛 常見問題

### Q1：圖片不顯示

**A**：
1. 檢查 `chineseImageUrl` 是否正確
2. 檢查圖片 URL 是否可訪問
3. 打開 Network 標籤查看圖片加載狀態

### Q2：語音不播放

**A**：
1. 檢查 `audioUrl` 是否正確
2. 檢查瀏覽器音量設置
3. 打開 Network 標籤查看語音加載狀態

### Q3：佈局不正確

**A**：
1. 檢查 Console 日誌
2. 確認內容組合（圖片、文字、語音）
3. 檢查 `createRightCard` 函數是否被正確調用

### Q4：性能問題

**A**：
1. 檢查圖片大小（建議 < 500KB）
2. 檢查語音大小（建議 < 1MB）
3. 檢查網絡連接速度

## 📚 詳細文檔

- **實現文檔**：`RIGHT_CARD_IMAGE_SUPPORT_IMPLEMENTATION_V62.md`
- **測試指南**：`RIGHT_CARD_IMAGE_SUPPORT_TESTING_V62.md`
- **最終總結**：`V62_FINAL_SUMMARY.md`

## 🎯 支持的內容組合

| 組合 | 圖片 | 文字 | 語音 | 佈局 |
|------|------|------|------|------|
| 1 | ✅ | ✅ | ✅ | A |
| 2 | ✅ | ✅ | ❌ | D |
| 3 | ✅ | ❌ | ✅ | ImageAudio |
| 4 | ✅ | ❌ | ❌ | F |
| 5 | ❌ | ✅ | ✅ | E |
| 6 | ❌ | ✅ | ❌ | C |
| 7 | ❌ | ❌ | ✅ | B |

## 🚀 下一步

1. **測試**：按照測試指南進行完整測試
2. **反饋**：收集用戶反饋
3. **優化**：根據反饋進行優化

## 💡 提示

- 💡 圖片建議使用 JPG 或 PNG 格式
- 💡 語音建議使用 MP3 或 WAV 格式
- 💡 確保 URL 可以從瀏覽器訪問
- 💡 使用 HTTPS URL 以避免混合內容警告

## 📞 需要幫助？

查看詳細文檔或檢查 Console 日誌中的錯誤信息。

---

**祝你使用愉快！** 🎉

