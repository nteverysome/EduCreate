# 🔧 Node.js 環境重新安裝指南

## 📋 概述

本指南幫助你重新安裝 Node.js 環境，以解決 npm 和 node 命令無法識別的問題。

---

## 🚀 快速開始（推薦）

### 方法 1: 使用自動化腳本（最簡單）

```powershell
# 在 PowerShell 中運行
.\reinstall-nodejs-environment.ps1
```

**優點**:
- ✅ 自動檢查 Node.js 和 npm
- ✅ 自動清理舊依賴
- ✅ 自動重新安裝
- ✅ 自動驗證安裝

---

## 📖 手動安裝步驟

### 步驟 1: 卸載舊的 Node.js

#### Windows 方法 A: 使用控制面板
1. 打開 **控制面板** → **程序和功能**
2. 找到 **Node.js**
3. 點擊 **卸載**
4. 按照提示完成卸載
5. **重新啟動計算機**

#### Windows 方法 B: 使用 PowerShell（管理員）
```powershell
# 以管理員身份打開 PowerShell
Get-WmiObject -Class Win32_Product -Filter "Name LIKE '%Node%'" | Remove-WmiObject
```

### 步驟 2: 下載 Node.js

1. 訪問 [https://nodejs.org/](https://nodejs.org/)
2. 選擇 **LTS 版本**（推薦）
3. 下載 **Windows Installer (.msi)**

**推薦版本**:
- LTS (長期支持) - 穩定性最好
- 當前版本 - 最新功能

### 步驟 3: 安裝 Node.js

1. 雙擊下載的 `.msi` 文件
2. 點擊 **Next**
3. 接受許可協議
4. 選擇安裝位置（默認即可）
5. 確保勾選 **Add to PATH**
6. 點擊 **Install**
7. 完成安裝

### 步驟 4: 驗證安裝

**重新啟動 PowerShell 或 CMD**，然後運行：

```powershell
node --version
npm --version
```

應該看到類似輸出：
```
v18.17.0
9.6.7
```

### 步驟 5: 清理項目依賴

```powershell
# 進入項目目錄
cd C:\Users\Administrator\Desktop\EduCreate

# 刪除舊的 node_modules
Remove-Item -Recurse -Force node_modules

# 刪除 package-lock.json
Remove-Item package-lock.json

# 清理 npm 緩存
npm cache clean --force
```

### 步驟 6: 重新安裝依賴

```powershell
npm install
```

### 步驟 7: 驗證 Playwright

```powershell
# 檢查 Playwright 是否已安裝
Test-Path node_modules/@playwright/test

# 應該返回 True
```

---

## 🔍 故障排除

### 問題 1: "npm 不是內部或外部命令"

**原因**: Node.js 未正確添加到 PATH

**解決方案**:
```powershell
# 檢查 Node.js 安裝位置
Get-Command node

# 如果找不到，手動添加到 PATH
$env:Path += ";C:\Program Files\nodejs"

# 驗證
node --version
```

### 問題 2: "npm install 失敗"

**原因**: 可能是網絡問題或 npm 緩存損壞

**解決方案**:
```powershell
# 清理 npm 緩存
npm cache clean --force

# 使用淘寶鏡像（如果在中國）
npm config set registry https://registry.npmmirror.com

# 重新安裝
npm install
```

### 問題 3: "權限被拒絕"

**原因**: 需要管理員權限

**解決方案**:
1. 右鍵點擊 PowerShell
2. 選擇 **以管理員身份運行**
3. 重新運行命令

### 問題 4: "node_modules 無法刪除"

**原因**: 文件被占用

**解決方案**:
```powershell
# 關閉所有 Node.js 進程
Get-Process node | Stop-Process -Force

# 然後刪除
Remove-Item -Recurse -Force node_modules
```

---

## ✅ 驗證清單

安裝完成後，檢查以下項目：

- [ ] `node --version` 返回版本號
- [ ] `npm --version` 返回版本號
- [ ] `npm list @playwright/test` 顯示 Playwright 已安裝
- [ ] `npm run dev` 可以啟動開發服務器
- [ ] `npm run test:playwright` 可以運行測試

---

## 🎯 常用命令

### 開發相關
```powershell
# 啟動開發服務器
npm run dev

# 構建項目
npm run build

# 啟動生產服務器
npm start
```

### 測試相關
```powershell
# 運行所有 Playwright 測試
npm run test:playwright

# UI 模式（推薦開發時使用）
npm run test:playwright:ui

# 調試模式
npm run test:playwright:debug
```

### 依賴管理
```powershell
# 安裝新包
npm install package-name

# 卸載包
npm uninstall package-name

# 更新所有包
npm update

# 檢查過時的包
npm outdated
```

---

## 📊 版本信息

### 推薦版本
- **Node.js**: v18 LTS 或更新
- **npm**: v9 或更新
- **Playwright**: 最新版本

### 檢查當前版本
```powershell
node --version
npm --version
npm list @playwright/test
```

---

## 🔗 有用的鏈接

- [Node.js 官方網站](https://nodejs.org/)
- [npm 官方文檔](https://docs.npmjs.com/)
- [Playwright 官方文檔](https://playwright.dev/)
- [Windows PATH 設置指南](https://www.architectryan.com/add-to-the-path-on-windows-10/)

---

## 💡 提示

### 使用 nvm（可選）

如果需要管理多個 Node.js 版本，可以使用 nvm-windows：

```powershell
# 安裝 nvm-windows
# 訪問: https://github.com/coreybutler/nvm-windows

# 安裝特定版本
nvm install 18.17.0

# 使用特定版本
nvm use 18.17.0

# 列出已安裝版本
nvm list
```

### 使用淘寶鏡像（中國用戶）

```powershell
# 設置淘寶鏡像
npm config set registry https://registry.npmmirror.com

# 恢復官方鏡像
npm config set registry https://registry.npmjs.org/

# 查看當前鏡像
npm config get registry
```

---

## 🆘 需要幫助？

如果問題仍未解決，請：

1. 檢查 Node.js 是否在 PATH 中
2. 重新啟動計算機
3. 使用管理員權限運行 PowerShell
4. 查看 npm 日誌：`npm install --verbose`

---

## ✨ 完成後

重新安裝完成後，你可以：

1. ✅ 運行 Playwright 測試
2. ✅ 啟動開發服務器
3. ✅ 安裝新的 npm 包
4. ✅ 構建和部署項目

**祝你使用愉快！** 🎉

---

*最後更新: 2025-11-01*
*EduCreate 項目 - Node.js 環境設置指南*

