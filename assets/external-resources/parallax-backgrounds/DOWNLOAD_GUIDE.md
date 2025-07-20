# 視差背景資源下載指南

## 🎯 目標資源
**Parallax (Forest, desert, sky, moon) by Bongseng**
- 網址: https://bongseng.itch.io/parallax-forest-desert-sky-moon
- 評分: 5.0/5 星 (11 評價)
- 更新: 2 小時前

## 📋 詳細下載步驟

### 步驟 1: 訪問資源頁面
1. 打開瀏覽器
2. 前往: https://bongseng.itch.io/parallax-forest-desert-sky-moon
3. 查看資源預覽和說明

### 步驟 2: 準備下載
1. 滾動到頁面下方的 "Download" 區域
2. 看到兩個可下載檔案：
   - **Horizontal asset pack.zip** (1.3 MB)
   - **Vertical asset pack.zip** (837 kB)

### 步驟 3: 開始下載流程
1. 點擊 "Download Now" 按鈕
2. 會跳轉到購買頁面（即使是免費資源也需要此流程）

### 步驟 4: 設定價格
1. 在 "Name your own price" 欄位中：
   - 可以輸入 $0 進行免費下載
   - 或者輸入任意金額支持作者
2. 點擊 "Download" 或 "Purchase" 按鈕

### 步驟 5: 帳號處理
如果沒有 itch.io 帳號：
1. 點擊 "Create account" 
2. 填寫基本資訊（用戶名、郵箱、密碼）
3. 驗證郵箱（檢查垃圾郵件夾）

如果已有帳號：
1. 點擊 "Log in"
2. 輸入帳號密碼登入

### 步驟 6: 完成下載
1. 登入後會自動跳轉到下載頁面
2. 分別下載兩個檔案：
   - Horizontal asset pack.zip
   - Vertical asset pack.zip
3. 檔案會保存到瀏覽器預設下載目錄

## 📁 檔案組織

### 建議目錄結構
下載完成後，請按以下結構組織檔案：

```
assets/external-resources/parallax-backgrounds/bongseng-parallax/
├── horizontal/
│   ├── forest/
│   │   ├── layer1.png
│   │   ├── layer2.png
│   │   └── ...
│   ├── desert/
│   ├── sky/
│   └── moon/
├── vertical/
│   └── forest/
├── bonus-assets/
│   ├── enemies/
│   ├── explosions/
│   ├── player-ship/
│   └── icons/
└── LICENSE.txt
```

### 解壓縮步驟
1. 在 `assets/external-resources/parallax-backgrounds/` 創建 `bongseng-parallax` 資料夾
2. 解壓縮 `Horizontal asset pack.zip` 到 `bongseng-parallax/horizontal/`
3. 解壓縮 `Vertical asset pack.zip` 到 `bongseng-parallax/vertical/`
4. 整理檔案到對應的主題資料夾中

## 🎮 資源內容詳情

### 水平版本 (Horizontal asset pack)
- **森林場景**: 6層視差 + 長短版本前景
- **沙漠場景**: 6層視差
- **天空場景**: 9層視差  
- **月亮場景**: 6層視差（作者標註仍在完善中）

### 垂直版本 (Vertical asset pack)
- **森林場景**: 垂直擴展版本 + 4層額外雲層

### 額外遊戲素材
- **6個敵人**: JPG 和 sprite sheet 格式
- **爆炸動畫**: 7幀動畫
- **小圖標**: 血量和能量圖標
- **玩家飛船**: 動畫部件（雷射、排氣等）
- **飛船 sprite sheet**: 預設、上傾、下傾（共7幀）

## ⚖️ 授權條款

### ✅ 允許的使用
- 在商業項目中使用
- 在非商業項目中使用  
- 編輯和修改素材
- 整合到 EduCreate 平台

### ❌ 禁止的使用
- 轉售或分發原始素材給他人
- 編輯後轉售素材給他人

## 🔧 EduCreate 整合檢查清單

### 下載完成後檢查
- [ ] 兩個 ZIP 檔案都已下載
- [ ] 檔案完整性檢查（檔案大小正確）
- [ ] 解壓縮無錯誤
- [ ] 檔案按建議結構組織

### 技術整合準備
- [ ] 圖片格式轉換（如需要轉為 WebP）
- [ ] 圖片尺寸優化
- [ ] 建立圖片載入管理器
- [ ] 實現視差滾動邏輯

### 遊戲整合測試
- [ ] 背景載入測試
- [ ] 視差效果測試
- [ ] 性能影響評估
- [ ] 無障礙設計驗證

## 🚨 常見問題

### Q: 下載時顯示需要付費？
A: 這是正常的，選擇 "Name your own price" 並輸入 $0 即可免費下載。

### Q: 沒有收到驗證郵件？
A: 檢查垃圾郵件夾，或等待幾分鐘後重新發送。

### Q: 檔案損壞或無法解壓？
A: 重新下載檔案，確保網路連接穩定。

### Q: 可以修改這些素材嗎？
A: 可以，授權允許編輯和修改，但不能轉售。

## 📞 支援聯絡

如果在下載或整合過程中遇到問題：
1. 查看 [EduCreate 技術文檔](../../docs/)
2. 聯絡開發團隊
3. 參考 [Bongseng 的其他作品](https://bongseng.itch.io/) 獲取靈感

---
**最後更新**: 2025-07-20
**負責人**: EduCreate 開發團隊
