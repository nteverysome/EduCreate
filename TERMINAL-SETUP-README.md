# Trea AI 終端機環境設定指南

## 概述

本指南提供了如何將 Trea AI 的終端機環境設定為與本地 Windows cmd.exe 環境一致的方法。這些腳本可以幫助您：

1. 統一 Node.js 與 npm 的路徑與版本
2. 載入環境變數（從 .env.local/.env 文件）
3. 自動切換到專案根目錄
4. 設定預設使用 cmd.exe
5. 設定編碼為 UTF-8 (Code Page 65001)

## 可用腳本

我們提供了多個版本的腳本，您可以根據需求選擇使用：

### 1. `trea-terminal-setup.bat`（批處理版本）

這是 Windows 批處理腳本版本，適合直接在 Windows 環境中雙擊執行或在 cmd.exe 中運行。

**使用方法**：
```
雙擊 trea-terminal-setup.bat
```

或在命令提示符中運行：
```cmd
trea-terminal-setup.bat
```

### 2. `trea-terminal-setup.ps1`（PowerShell 版本）

PowerShell 腳本版本，提供更豐富的輸出格式和更好的錯誤處理。

**使用方法**：
```powershell
# 在 PowerShell 中運行
.\trea-terminal-setup.ps1
```

> **注意**：如果遇到 PowerShell 執行策略限制，請以管理員身份運行 PowerShell 並執行：
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
> .\trea-terminal-setup.ps1
> ```

### 3. `trea-auto-init.bat`（自動初始化腳本）

這是一個精簡版的自動初始化腳本，專為設定為 Trea AI 終端機的自動啟動腳本而設計。它執行與其他腳本相同的核心功能，但輸出更簡潔，適合自動化使用。

**使用方法**：
```cmd
trea-auto-init.bat
```

## 在 Trea AI 中設定終端機環境

### 方法 1：每次手動運行腳本

1. 在 Trea AI 中開啟終端機
2. 運行以下命令：
   ```
   .\trea-terminal-setup.bat
   ```
   或
   ```powershell
   .\trea-terminal-setup.ps1
   ```

### 方法 2：設定 Trea AI 終端機自動初始化（推薦）

#### 設定步驟：

1. 在 Trea AI 的設定/偏好中，找到「終端機」或「集成終端機」設定
2. 尋找「初始化腳本」或「啟動命令」選項
3. 設定為以下路徑：
   ```
   C:\Users\Administrator\Desktop\EduCreate\trea-auto-init.bat
   ```
4. 保存設定

如果 Trea AI 不支援直接設定初始化腳本，您可以嘗試以下替代方法：

#### 替代方法 A：修改 Trea AI 的終端機配置文件

1. 找到 Trea AI 的配置目錄（通常在用戶目錄下）
2. 尋找終端機相關的配置文件（如 `settings.json`）
3. 添加以下配置：
   ```json
   {
     "terminal.integrated.shellArgs.windows": ["/c", "C:\Users\Administrator\Desktop\EduCreate\trea-auto-init.bat"]
   }
   ```

#### 替代方法 B：創建終端機配置文件

1. 在 Trea AI 的設定中，找到「終端機 > 配置文件」
2. 創建一個新的配置文件，命名為「EduCreate 開發環境」
3. 設定命令為：
   ```
   cmd.exe /k C:\Users\Administrator\Desktop\EduCreate\trea-auto-init.bat
   ```
4. 將此配置文件設為默認

## 驗證設定

腳本運行後，將顯示以下信息以驗證設定是否成功：

- Node.js 版本 (`node -v`)
- npm 版本 (`npm -v`)
- 當前編碼 (`chcp`)
- 當前目錄
- 環境變數載入狀態

## 故障排除

### 問題：腳本無法運行

**解決方案**：
- 確保您有足夠的權限運行腳本
- 在 PowerShell 中，可能需要調整執行策略

### 問題：Node.js 路徑設定不正確

**解決方案**：
- 編輯腳本中的 Node.js 路徑，確保與您系統上的實際安裝路徑一致
- 檢查 `C:\Program Files\nodejs\` 目錄是否存在

### 問題：環境變數未正確載入

**解決方案**：
- 確保 `.env` 或 `.env.local` 文件存在於專案根目錄
- 檢查文件格式是否正確（每行應為 `KEY=VALUE` 格式）

### 問題：自動初始化未生效

**解決方案**：
- 確認 Trea AI 是否支援自定義終端機初始化腳本
- 檢查腳本路徑是否正確
- 嘗試使用絕對路徑而非相對路徑
- 檢查腳本是否有執行權限

## 自訂腳本

您可以根據需要自訂腳本：

- 修改 Node.js 路徑
- 添加其他環境變數
- 設定其他工具或依賴項的路徑
- 添加項目特定的初始化命令

## 注意事項

- 這些腳本僅在 Windows 環境下測試
- 批處理腳本 (.bat) 僅適用於 Windows
- PowerShell 腳本 (.ps1) 需要 PowerShell 3.0 或更高版本
- 某些操作可能需要管理員權限
- 自動初始化腳本 (`trea-auto-init.bat`) 設計為簡潔輸出，適合作為啟動腳本使用