# EduCreate 開發環境問題解決方案

## 問題診斷

在運行 `npm run dev` 命令時遇到了兩個主要問題：

1. **端口佔用問題**：端口 3000、3001 和 3002 已被佔用，Next.js 嘗試使用端口 3003
2. **權限錯誤**：無法訪問 `.next/trace` 目錄，出現 EPERM 錯誤（操作不允許）

```
[Error: EPERM: operation not permitted, open 'C:\Users\Administrator\Desktop\js\.next\trace']
```

## 解決方案

為解決上述問題，我們實施了以下解決方案：

### 1. 修改 Next.js 配置

創建了新的 `next.config.js` 文件，主要變更：

- 設置 `distDir: './build'` 將輸出目錄從默認的 `.next` 更改為 `build`，避免權限問題
- 保留了原有的圖片優化、實驗性功能和緩存策略配置

### 2. 創建啟動腳本

創建了 `start-dev.bat` 批處理文件，功能包括：

- 自動檢測並終止佔用端口 3000-3003 的進程
- 清理舊的 `.next` 目錄
- 啟動 Next.js 開發服務器

## 使用說明

### 方法一：使用啟動腳本（推薦）

1. 在 Windows 資源管理器中，導航到 `C:\Users\Administrator\Desktop\js` 目錄
2. 右鍵點擊 `start-dev.bat` 文件，選擇「以管理員身份運行」
3. 腳本將自動處理端口佔用和權限問題，然後啟動開發服務器

### 方法二：手動啟動

如果不想使用批處理文件，可以按照以下步驟手動操作：

1. 使用任務管理器終止佔用端口的進程
2. 刪除 `.next` 目錄（如果存在）
3. 運行 `npm run dev` 命令啟動開發服務器

## 注意事項

- 確保在正確的工作目錄下運行命令（`C:\Users\Administrator\Desktop\js`）
- 如果問題仍然存在，可能需要重新啟動計算機以釋放被鎖定的資源
- 如果使用 EduCreate 子目錄中的項目，請確保將配置文件複製到正確位置

## 項目結構說明

當前工作目錄是 `js`，而 EduCreate 項目位於 `js\EduCreate` 子目錄中。根據錯誤信息，Next.js 嘗試在 `js` 目錄而非 `EduCreate` 子目錄中創建 `.next` 文件夾，這表明當前的工作目錄設置可能不正確。

建議在運行開發服務器時，先切換到 EduCreate 目錄：

```
cd EduCreate
npm run dev
```

或者修改批處理文件以自動切換到正確的目錄。