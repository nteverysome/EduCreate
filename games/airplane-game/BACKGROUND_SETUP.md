# 🌙 月亮主題背景設置指南

## 📁 背景資源放置位置

請將您的月亮背景資源文件放置到以下目錄：

```
games/airplane-game/public/assets/backgrounds/moon/
```

## 🖼️ 需要的背景文件

請將以下文件從您的資源包複製到上述目錄：

1. **layer-1.png** - 最遠背景層（天空/星空）
2. **layer-2.png** - 中景層（山脈/地形）  
3. **layer-3.png** - 近景層（樹木/建築）
4. **moon.png** - 月亮圖片

## 📋 複製步驟

1. 打開您的資源目錄：
   ```
   C:\Users\Administrator\Downloads\assetpack\parallax\moon
   ```

2. 選擇所有背景圖片文件

3. 複製到遊戲目錄：
   ```
   C:\Users\Administrator\Desktop\EduCreate\games\airplane-game\public\assets\backgrounds\moon\
   ```

4. 確保文件命名正確：
   - `layer-1.png` (或 .jpg)
   - `layer-2.png` (或 .jpg)  
   - `layer-3.png` (或 .jpg)
   - `moon.png` (或 .jpg)

## 🔄 重新載入遊戲

完成文件複製後：

1. 刷新瀏覽器頁面：http://localhost:3001/games/airplane-game/
2. 查看控制台日誌確認背景載入狀態
3. 如果看到 "🌙 使用月亮主題背景圖片" 表示成功
4. 如果看到 "🌌 使用備用漸層背景" 表示文件未找到

## 🎨 視差效果

成功載入後您將看到：

- ✨ **多層視差滾動背景**
- 🌙 **月亮靜態顯示在右上角**
- ⭐ **80個閃爍星星**
- 🌌 **深夜藍色主題**

## 🔧 故障排除

如果背景沒有顯示：

1. **檢查文件路徑**：確保文件在正確目錄
2. **檢查文件名**：必須完全匹配（區分大小寫）
3. **檢查文件格式**：支援 .png 和 .jpg
4. **查看控制台**：檢查是否有載入錯誤

## 🎮 備用方案

如果沒有背景圖片，遊戲會自動使用：
- 深夜藍色漸層背景
- 閃爍星空效果
- 視差滾動動畫

遊戲功能不會受到影響！
