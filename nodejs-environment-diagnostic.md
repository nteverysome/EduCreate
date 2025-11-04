# 🔍 Node.js 環境診斷和修復指南

## 📊 當前狀態

### 問題描述
- ❌ `node` 命令無法識別
- ❌ `npm` 命令無法識別
- ✅ `node_modules` 目錄存在
- ✅ `package.json` 文件存在
- ✅ Playwright 已安裝在 node_modules 中

### 根本原因
Node.js 未正確添加到系統 PATH 環境變量，或者 Node.js 未正確安裝。

---

## 🛠️ 快速修復方案

### 方案 1: 運行自動修復腳本（推薦）

#### Windows PowerShell
```powershell
# 以管理員身份打開 PowerShell
.\reinstall-nodejs-environment.ps1
```

#### Windows CMD
```cmd
# 以管理員身份打開 CMD
reinstall-nodejs-environment.bat
```

**預期結果**:
- ✅ 檢查 Node.js 和 npm
- ✅ 清理舊依賴
- ✅ 重新安裝所有包
- ✅ 驗證安裝成功

---

## 🔧 手動修復步驟

### 步驟 1: 檢查 Node.js 安裝

#### 方法 A: 檢查安裝位置
```powershell
# 在 PowerShell 中
Get-Command node
Get-Command npm

# 或在 CMD 中
where node
where npm
```

**預期輸出**:
```
C:\Program Files\nodejs\node.exe
C:\Program Files\nodejs\npm.cmd
```

#### 方法 B: 檢查 PATH 環境變量
```powershell
# 在 PowerShell 中
$env:Path -split ';' | Select-String 'nodejs'

# 或在 CMD 中
echo %PATH%
```

**應該包含**:
```
C:\Program Files\nodejs
```

### 步驟 2: 添加 Node.js 到 PATH（如果缺失）

#### 臨時添加（當前會話）
```powershell
# PowerShell
$env:Path += ";C:\Program Files\nodejs"

# 驗證
node --version
```

#### 永久添加（推薦）

**Windows 10/11**:
1. 按 `Win + X`，選擇 **系統**
2. 點擊 **高級系統設置**
3. 點擊 **環境變量**
4. 在 **系統變量** 中找到 **Path**
5. 點擊 **編輯**
6. 點擊 **新建**
7. 輸入 `C:\Program Files\nodejs`
8. 點擊 **確定**
9. **重新啟動計算機**

### 步驟 3: 重新啟動終端

關閉並重新打開 PowerShell 或 CMD，然後驗證：

```powershell
node --version
npm --version
```

### 步驟 4: 清理和重新安裝

```powershell
# 進入項目目錄
cd C:\Users\Administrator\Desktop\EduCreate

# 刪除舊的依賴
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# 清理 npm 緩存
npm cache clean --force

# 重新安裝
npm install
```

---

## 🔄 完整重新安裝流程

### 如果上述方法不起作用，請按以下步驟操作：

#### 1. 完全卸載 Node.js

**方法 A: 使用控制面板**
1. 打開 **控制面板**
2. 進入 **程序和功能**
3. 找到 **Node.js**
4. 點擊 **卸載**
5. 按照提示完成

**方法 B: 使用 PowerShell（管理員）**
```powershell
Get-WmiObject -Class Win32_Product -Filter "Name LIKE '%Node%'" | Remove-WmiObject
```

#### 2. 刪除 Node.js 文件夾

```powershell
# 刪除安裝目錄
Remove-Item -Recurse -Force "C:\Program Files\nodejs"
Remove-Item -Recurse -Force "C:\Program Files (x86)\nodejs"

# 刪除 npm 全局包目錄
Remove-Item -Recurse -Force "$env:APPDATA\npm"
Remove-Item -Recurse -Force "$env:APPDATA\npm-cache"
```

#### 3. 清理環境變量

```powershell
# 檢查 PATH 中是否還有 nodejs 相關路徑
$env:Path -split ';' | Where-Object { $_ -match 'nodejs' }

# 如果有，需要手動從環境變量中刪除
```

#### 4. 重新啟動計算機

```powershell
Restart-Computer
```

#### 5. 重新安裝 Node.js

1. 訪問 [https://nodejs.org/](https://nodejs.org/)
2. 下載 **LTS 版本** 的 Windows Installer
3. 運行安裝程序
4. 確保勾選 **Add to PATH**
5. 完成安裝

#### 6. 驗證安裝

```powershell
node --version
npm --version
```

#### 7. 重新安裝項目依賴

```powershell
cd C:\Users\Administrator\Desktop\EduCreate
npm install
```

---

## ✅ 驗證清單

完成後，檢查以下項目：

- [ ] `node --version` 返回版本號（如 v18.17.0）
- [ ] `npm --version` 返回版本號（如 9.6.7）
- [ ] `npm list @playwright/test` 顯示 Playwright 已安裝
- [ ] `npm run dev` 可以啟動開發服務器
- [ ] `npm run test:playwright` 可以運行 Playwright 測試

---

## 🎯 測試 Playwright 功能

安裝完成後，測試 Playwright：

```powershell
# 運行 Playwright 測試
npm run test:playwright

# 或使用 UI 模式
npm run test:playwright:ui

# 或運行特定測試
npx playwright test test-playwright-health-check.js
```

---

## 📝 常見問題

### Q1: 為什麼 npm install 很慢？

**A**: 可能是網絡問題或 npm 源問題。

**解決方案**:
```powershell
# 使用淘寶鏡像（中國用戶）
npm config set registry https://registry.npmmirror.com

# 或使用官方源
npm config set registry https://registry.npmjs.org/

# 查看當前源
npm config get registry
```

### Q2: npm install 失敗，提示權限問題？

**A**: 需要管理員權限。

**解決方案**:
1. 右鍵點擊 PowerShell/CMD
2. 選擇 **以管理員身份運行**
3. 重新運行命令

### Q3: 刪除 node_modules 時提示文件被占用？

**A**: 有 Node.js 進程仍在運行。

**解決方案**:
```powershell
# 終止所有 Node.js 進程
Get-Process node | Stop-Process -Force

# 然後刪除
Remove-Item -Recurse -Force node_modules
```

### Q4: 安裝後仍然找不到 node 命令？

**A**: PATH 環境變量未更新。

**解決方案**:
1. 重新啟動計算機
2. 或在 PowerShell 中臨時添加：
   ```powershell
   $env:Path += ";C:\Program Files\nodejs"
   ```

---

## 🔗 有用資源

- [Node.js 官方下載](https://nodejs.org/)
- [npm 官方文檔](https://docs.npmjs.com/)
- [Playwright 官方文檔](https://playwright.dev/)
- [Windows PATH 設置指南](https://www.architectryan.com/add-to-the-path-on-windows-10/)

---

## 💡 推薦配置

### 推薦版本
- **Node.js**: v18 LTS 或更新
- **npm**: v9 或更新
- **Playwright**: 最新版本

### 推薦設置
```powershell
# 設置 npm 全局包目錄
npm config set prefix "C:\Users\Administrator\AppData\Roaming\npm"

# 設置 npm 緩存目錄
npm config set cache "C:\Users\Administrator\AppData\Roaming\npm-cache"

# 查看所有配置
npm config list
```

---

## 🆘 仍需幫助？

如果問題仍未解決：

1. 檢查 Node.js 是否在 PATH 中
2. 重新啟動計算機
3. 使用管理員權限運行
4. 查看詳細日誌：`npm install --verbose`
5. 清理所有緩存：`npm cache clean --force`

---

*最後更新: 2025-11-01*
*EduCreate 項目 - Node.js 環境診斷指南*

