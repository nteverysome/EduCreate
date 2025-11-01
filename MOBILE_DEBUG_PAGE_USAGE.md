# 📱 手機直向調試頁面使用指南

## 🎯 目的

自動收集手機直向環境下的遊戲調試信息，無需手動打開 F12 Console。

---

## 🚀 快速開始

### 步驟 1：打開調試頁面

在手機上訪問以下 URL：

```
https://edu-create.vercel.app/games/match-up-game/debug-mobile.html?activityId=cmh93tjuh0001l404hszkdf94&customVocabulary=true
```

**或者本地開發環境**：

```
http://localhost:3000/games/match-up-game/debug-mobile.html?activityId=cmh93tjuh0001l404hszkdf94&customVocabulary=true
```

### 步驟 2：等待頁面加載

頁面會自動加載遊戲並收集信息。

**預期看到**：
```
✅ 遊戲已加載，信息已更新
```

### 步驟 3：查看收集到的信息

頁面會自動顯示以下信息：

#### 📊 設備信息
- 視窗寬度
- 視窗高度
- 寬高比

#### 🔍 圖片檢測
- **hasImages**: 是否有圖片（✅ true 或 ❌ false）
- **佈局模式**: 🟦 正方形模式 或 🟨 長方形模式

#### 🎴 第一個卡片信息
- ID
- 英文
- 中文
- **imageUrl**: 英文圖片 URL
- **chineseImageUrl**: 中文圖片 URL
- audioUrl: 音頻 URL

#### 📐 卡片佈局
- **frameWidth**: 卡片寬度
- **cardHeightInFrame**: 卡片高度
- **卡片比例**: 寬高比（應該是 1:1 正方形）
- 列數
- 行數

#### 📄 分頁信息
- 每頁卡片數
- 當前頁
- 總頁數
- 總卡片數

---

## 📋 關鍵信息解讀

### 1️⃣ hasImages 值

**✅ true（正確）**：
```
hasImages: ✅ true
佈局模式: 🟦 正方形模式
```
→ 圖片檢測成功，應該進入正方形模式

**❌ false（錯誤）**：
```
hasImages: ❌ false
佈局模式: 🟨 長方形模式
```
→ 圖片檢測失敗，進入了長方形模式

### 2️⃣ imageUrl 和 chineseImageUrl

**有值（正確）**：
```
imageUrl: https://example.com/image.jpg
chineseImageUrl: https://example.com/chinese.jpg
```

**null（錯誤）**：
```
imageUrl: null
chineseImageUrl: null
```
→ 圖片 URL 為空，需要檢查數據

### 3️⃣ frameWidth 和 cardHeightInFrame

**相等（正方形）**：
```
frameWidth: 75
cardHeightInFrame: 75
卡片比例: 1:1 (正方形)
```
→ 正確的正方形卡片

**不相等（長方形）**：
```
frameWidth: 100
cardHeightInFrame: 67
卡片比例: 1.49:1
```
→ 長方形卡片（錯誤）

---

## 🔧 操作按鈕

### 🔄 刷新信息
點擊此按鈕重新收集遊戲信息。

### 📋 複製所有信息
將所有調試信息複製到剪貼板，方便分享。

---

## 📸 截圖示例

### 正確情況（正方形模式）
```
📊 設備信息
視窗寬度: 375
視窗高度: 667
寬高比: 0.56

🔍 圖片檢測
hasImages: ✅ true
佈局模式: 🟦 正方形模式

🎴 第一個卡片信息
imageUrl: https://...
chineseImageUrl: https://...

📐 卡片佈局
frameWidth: 75
cardHeightInFrame: 75
卡片比例: 1:1 (正方形)
列數: 5
行數: 4
```

### 錯誤情況（長方形模式）
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

## 🐛 常見問題

### Q1：頁面顯示「❌ 遊戲未加載」

**原因**：遊戲加載失敗

**解決方案**：
1. 檢查網絡連接
2. 刷新頁面
3. 檢查 URL 是否正確
4. 等待 3-5 秒後點擊「🔄 刷新信息」

### Q2：imageUrl 為 null

**原因**：
- 數據庫中沒有圖片 URL
- API 沒有返回圖片 URL
- 圖片字段名稱不匹配

**解決方案**：
1. 檢查數據庫中的圖片 URL
2. 檢查 API 響應
3. 確認圖片字段名稱

### Q3：frameWidth 和 cardHeightInFrame 不相等

**原因**：
- hasImages = false，進入了長方形模式
- 圖片檢測失敗

**解決方案**：
1. 檢查 hasImages 值
2. 檢查 imageUrl 和 chineseImageUrl
3. 確認圖片數據是否正確

---

## 📞 提交信息

當您訪問調試頁面後，請告訴我以下信息：

1. **視窗大小**：375×667
2. **hasImages 值**：✅ true 或 ❌ false
3. **佈局模式**：🟦 正方形模式 或 🟨 長方形模式
4. **imageUrl**：值或 null
5. **chineseImageUrl**：值或 null
6. **frameWidth**：數值
7. **cardHeightInFrame**：數值
8. **卡片比例**：比例值
9. **列數**：數值
10. **行數**：數值

---

## 🎯 下一步

根據收集到的信息，我可以：

1. **診斷問題根本原因**
2. **修復圖片檢測邏輯**
3. **調整卡片尺寸計算**
4. **優化佈局算法**


