# 🚀 快速調試指南 - 手機直向佈局問題

## 📱 立即在手機上測試

### 方法 1：使用已部署的版本（推薦）

在您的手機上打開以下 URL：

```
https://edu-create.vercel.app/games/match-up-game/debug-mobile.html?activityId=cmh93tjuh0001l404hszkdf94&customVocabulary=true
```

**優點**：
- ✅ 無需本地開發環境
- ✅ 實時查看生產環境數據
- ✅ 立即看到結果

---

## 📊 頁面會自動顯示的信息

頁面加載後，您會看到以下信息自動填充：

### 🔍 關鍵信息（最重要）

1. **hasImages 值**
   - ✅ true = 圖片檢測成功
   - ❌ false = 圖片檢測失敗

2. **佈局模式**
   - 🟦 正方形模式 = 正確（應該看到 5 列）
   - 🟨 長方形模式 = 錯誤（只有 3 列）

3. **imageUrl 和 chineseImageUrl**
   - 有值 = 圖片數據存在
   - null = 圖片數據缺失

4. **frameWidth 和 cardHeightInFrame**
   - 相等 = 正方形卡片 ✅
   - 不相等 = 長方形卡片 ❌

5. **列數和行數**
   - 應該是 5 列 × 4 行（20 個卡片）

---

## 📸 截圖示例

### ✅ 正確情況
```
🔍 圖片檢測
hasImages: ✅ true
佈局模式: 🟦 正方形模式

🎴 第一個卡片信息
imageUrl: https://example.com/image.jpg
chineseImageUrl: https://example.com/chinese.jpg

📐 卡片佈局
frameWidth: 75
cardHeightInFrame: 75
卡片比例: 1:1 (正方形)
列數: 5
行數: 4
```

### ❌ 錯誤情況
```
🔍 圖片檢測
hasImages: ❌ false
佈局模式: 🟨 長方形模式

🎴 第一個卡片信息
imageUrl: null
chineseImageUrl: null

📐 卡片佈局
frameWidth: 75
cardHeightInFrame: 67
卡片比例: 1.12:1
列數: 3
行數: 4
```

---

## 🎯 訪問後請告訴我

訪問調試頁面後，請截圖或告訴我以下信息：

### 必須提供的信息

1. **hasImages 值**：✅ true 或 ❌ false
2. **佈局模式**：🟦 正方形模式 或 🟨 長方形模式
3. **imageUrl**：有值或 null
4. **chineseImageUrl**：有值或 null
5. **frameWidth**：數值
6. **cardHeightInFrame**：數值
7. **卡片比例**：比例值
8. **列數**：數值
9. **行數**：數值
10. **每頁卡片數**：應該是 20

---

## 🔧 頁面功能

### 🔄 刷新信息按鈕
- 點擊重新收集遊戲信息
- 用於驗證數據是否更新

### 📋 複製所有信息按鈕
- 一鍵複製所有調試信息到剪貼板
- 方便分享給開發者

---

## ⚠️ 常見問題

### Q1：頁面顯示「❌ 遊戲未加載」

**解決方案**：
1. 檢查網絡連接
2. 刷新頁面（Ctrl+R 或 Cmd+R）
3. 等待 3-5 秒
4. 點擊「🔄 刷新信息」按鈕

### Q2：imageUrl 為 null

**可能原因**：
- 數據庫中沒有圖片 URL
- API 沒有返回圖片 URL
- 圖片字段名稱不匹配

### Q3：frameWidth 和 cardHeightInFrame 不相等

**原因**：
- hasImages = false，進入了長方形模式
- 圖片檢測失敗

---

## 📞 下一步

根據您提供的信息，我可以：

1. **診斷問題根本原因**
   - 圖片檢測邏輯是否正確
   - 數據是否正確加載
   - 佈局計算是否正確

2. **修復問題**
   - 修復圖片檢測邏輯
   - 調整卡片尺寸計算
   - 優化佈局算法

3. **驗證修復**
   - 再次訪問調試頁面
   - 確認所有信息正確

---

## 🎯 預期最終結果

### 修復前
```
手機直向（375×667px）
3 列 × 4 行 = 12 個卡片/頁
hasImages: false
佈局模式: 長方形模式
```

### 修復後
```
手機直向（375×667px）
5 列 × 4 行 = 20 個卡片/頁
hasImages: true
佈局模式: 正方形模式
```

---

**現在就訪問調試頁面，然後告訴我看到的信息！** 🚀


