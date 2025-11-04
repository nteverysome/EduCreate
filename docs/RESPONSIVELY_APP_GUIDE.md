# 使用 Responsively App 獲取 iPhone 14 直向遊戲資訊

## 📱 iPhone 14 規格

| 項目 | 值 |
|------|-----|
| **CSS 像素寬度** | 390px |
| **CSS 像素高度** | 844px |
| **設備像素比 (DPR)** | 3 |
| **寬高比** | 0.462 |
| **物理屏幕** | 6.1 英寸 |
| **分辨率** | 2532 × 1170 像素 |

## 🚀 快速開始

### 方法 1：使用 PowerShell 腳本（推薦）

```powershell
# 執行啟動腳本
powershell -ExecutionPolicy Bypass -File scripts/launch-responsively-iphone14.ps1
```

### 方法 2：直接命令行啟動

```powershell
# 啟動 Responsively App 並打開遊戲 URL
C:\Users\Administrator\AppData\Local\Programs\ResponsivelyApp\ResponsivelyApp.exe "https://edu-create.vercel.app/games/switcher?game=match-up-game&activityId=cmh93tjuh0001l404hszkdf94&layout=mixed&itemsPerPage=20"
```

### 方法 3：使用 Node.js 腳本（高級）

```bash
# 安裝依賴
npm install puppeteer-core

# 執行腳本
node scripts/get-iphone14-info.js
```

## 📋 在 Responsively App 中設置 iPhone 14

### 步驟 1：添加設備

1. 打開 Responsively App
2. 點擊左側的 **"+ Add Device"** 或設備列表
3. 搜索 **"iPhone 14"**
4. 點擊選擇

### 步驟 2：手動配置（如果需要）

如果自動配置不工作，手動添加：

1. 點擊 **"Add Custom Device"**
2. 填寫以下信息：
   - **名稱**: iPhone 14
   - **寬度**: 390
   - **高度**: 844
   - **設備像素比 (DPR)**: 3
   - **用戶代理**: `Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15`
3. 點擊 **"Save"**

### 步驟 3：驗證尺寸

- 確認頂部顯示 **"390 × 844"**
- 檢查寬高比是否為 **0.462**

## 🔍 獲取遊戲資訊

### 在 Responsively App 中查看資訊

1. **打開開發者工具**：按 `F12`
2. **查看控制台日誌**：
   - 查找 `[v20.0] 設備尺寸和寬高比詳細信息`
   - 查找 `[v18.0] 動態列數計算`
3. **檢查遊戲佈局**：
   - 應該顯示 **5 列卡片**
   - 每列寬度應該約 **65px**

### 控制台日誌示例

```javascript
📱 [v20.0] 設備尺寸和寬高比詳細信息: {
  width: 390,
  height: 844,
  aspectRatio: 0.462,
  isPortraitMode: true,
  isPortraitCompactMode: true,
  screenCategory: "直向螢幕"
}

🔥 [v18.0] 動態列數計算: itemCount=20, cols=5
```

## 📊 預期結果

### 視口信息
```
視口寬度: 390px
視口高度: 844px
設備像素比: 3
寬高比: 0.462
```

### 遊戲佈局
```
項目數: 20
列數: 5
卡片寬度: 約 65px
卡片高度: 約 65px
```

## 🎯 與真實 iPhone 14 比對

1. **在 Responsively App 中**：
   - 設置為 iPhone 14 (390×844px)
   - 查看遊戲佈局

2. **在真實 iPhone 14 上**：
   - 打開同一個 URL
   - 查看遊戲佈局

3. **比對結果**：
   - 應該看到完全相同的佈局
   - 應該都顯示 5 列卡片
   - 卡片尺寸應該相同

## 🛠️ 故障排除

### 問題 1：Responsively App 無法打開 URL

**解決方案**：
1. 手動在 Responsively App 中輸入 URL
2. 確保網絡連接正常
3. 檢查 URL 是否正確

### 問題 2：設備尺寸不正確

**解決方案**：
1. 刪除設備並重新添加
2. 確認寬度為 390，高度為 844
3. 確認設備像素比為 3

### 問題 3：遊戲未加載

**解決方案**：
1. 刷新頁面（F5）
2. 清除瀏覽器緩存
3. 檢查網絡連接
4. 查看控制台是否有錯誤

## 📸 截圖和報告

### 自動生成報告

使用 Node.js 腳本自動生成報告：

```bash
node scripts/get-iphone14-info.js
```

生成的文件：
- `screenshots/iphone14-game.png` - 遊戲截圖
- `reports/iphone14-game-info.json` - 詳細報告

### 手動截圖

在 Responsively App 中：
1. 點擊相機圖標
2. 選擇 "Take Screenshot"
3. 選擇保存位置

## 💡 提示和技巧

### 實時同步交互

- 在 Responsively App 中的任何點擊都會同步到所有設備
- 可以同時測試多個設備

### 統一檢查器

- 按 `Ctrl+I` 打開統一檢查器
- 可以檢查所有設備上的元素

### 一鍵截圖

- 可以截圖所有設備或單個設備
- 支持全頁截圖

## 📚 相關資源

- [Responsively App 官網](https://responsively.app/)
- [GitHub 倉庫](https://github.com/responsively-org/responsively-app)
- [Discord 社區](https://discord.gg/responsively)

## 🔗 遊戲 URL

```
https://edu-create.vercel.app/games/switcher?game=match-up-game&activityId=cmh93tjuh0001l404hszkdf94&layout=mixed&itemsPerPage=20
```

## 📝 筆記

- 確保 Responsively App 已更新到最新版本
- 確保 Chrome/Chromium 已更新
- 確保網絡連接穩定

