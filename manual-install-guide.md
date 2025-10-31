# 🚀 Node.js 手動安裝指導

## 問題說明
由於網絡或權限問題，自動安裝腳本無法正常工作。請按照以下步驟手動安裝 Node.js。

## 📥 手動安裝步驟

### 步驟 1：下載 Node.js
1. 打開瀏覽器，訪問：https://nodejs.org/
2. 點擊 "Download Node.js (LTS)" 綠色按鈕
3. 選擇 "Windows Installer (.msi)" 版本
4. 下載完成後，找到下載的 `.msi` 文件

### 步驟 2：安裝 Node.js
1. 雙擊下載的 `.msi` 文件
2. 按照安裝向導的提示進行安裝
3. **重要**：確保勾選 "Add to PATH" 選項
4. 完成安裝

### 步驟 3：重啟環境
1. 關閉所有 PowerShell 終端
2. 重啟 Trae IDE
3. 重新打開 PowerShell 終端

### 步驟 4：驗證安裝
運行驗證腳本：
```powershell
PowerShell -ExecutionPolicy Bypass -File "verify-nodejs.ps1"
```

## 🎯 預期結果
安裝成功後，您應該能看到：
- ✅ Node.js 版本: v22.x.x
- ✅ npm 版本: 10.x.x  
- ✅ npx 版本: 10.x.x
- ✅ 所有 Trae 市場 MCP 服務器可用

## 🔧 故障排除
如果安裝後仍有問題：
1. 確認 Node.js 已添加到 PATH 環境變量
2. 重啟計算機
3. 檢查防火牆或殺毒軟件是否阻止了安裝

## 📋 完成後的配置
安裝完成後，您的 Trae 市場 MCP 配置將包含：
- 🌐 chrome-devtools
- 🧠 sequential-thinking  
- 🎭 playwright
- 📝 context7
- 💬 mcp-feedback-collector