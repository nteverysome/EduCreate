# EduCreate 服務器啟動問題修復指南

## 問題描述

當運行 `npm run dev` 啟動 EduCreate 開發服務器時，控制台顯示服務器已在端口 3002 上啟動，但瀏覽器訪問 http://localhost:3002 時出現 `ERR_CONNECTION_REFUSED` 錯誤。同時，控制台顯示以下錯誤：

```
Error while trying to use the following icon from the Manifest: http://localhost:3000/icons/icon-144x144.png (Download error or resource isn't a valid image)

Failed to load resource: the server responded with a status of 500 (Internal Server Error)

Failed to load resource: the server responded with a status of 401 (Unauthorized)
```

## 可能的原因

1. **缺少依賴項**：項目使用了 `next-pwa.config.js` 配置文件，但 `package.json` 中缺少 `next-pwa` 依賴
2. **配置文件不兼容**：`next.config.js` 和 `next-pwa.config.js` 配置不一致或整合不正確
3. **圖標文件缺失**：manifest.json 引用的圖標文件不存在
4. **API認證問題**：API端點返回401未授權錯誤
5. **端口被佔用**：端口 3000、3001 和 3002 可能被其他進程佔用
6. **進程崩潰**：Next.js 服務器可能在啟動後立即崩潰

## 修復腳本

為了解決這些問題，我們提供了多個修復腳本：

### 1. `fix-server-issues.bat`（推薦）

最新的綜合修復腳本，專門針對圖標404錯誤、API認證401錯誤和服務器啟動問題。執行以下操作：

- 修復圖標404錯誤
- 運行認證錯誤修復腳本
- 執行Prisma遷移和種子
- 清理緩存和終止佔用端口的進程
- 安裝缺失的依賴
- 啟動開發服務器

**使用方法**：
```
雙擊 fix-server-issues.bat
```

### 2. `fix-server-issues.ps1`

PowerShell版本的修復腳本，功能與`fix-server-issues.bat`相同，但使用PowerShell語法實現。

**使用方法**：
```powershell
# 在PowerShell中運行
.\fix-server-issues.ps1
```

> **注意**：如果遇到PowerShell執行策略限制，請以管理員身份運行PowerShell並執行：
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
> .\fix-server-issues.ps1
> ```

### 3. `diagnose-server.bat`

診斷腳本，用於收集系統環境、依賴項、端口佔用情況等信息，生成診斷報告。

**使用方法**：
```
雙擊 diagnose-server.bat
```

或在PowerShell中運行：
```powershell
.\diagnose-server.bat
```

診斷報告將保存在 `logs` 目錄下。

### 4. `fix-pwa-dependency.bat`

修復 PWA 依賴問題的腳本，主要執行以下操作：
- 安裝缺失的 `next-pwa` 依賴
- 修復 `next.config.js` 文件，正確整合 PWA 配置
- 清理緩存文件

**使用方法**：
```
雙擊 fix-pwa-dependency.bat
```

或在PowerShell中運行：
```powershell
.\fix-pwa-dependency.bat
```

### 5. `fix-server-start.bat`

全面修復服務器啟動問題的腳本，執行以下操作：
- 終止佔用端口 3000、3001 和 3002 的進程
- 安裝缺失的 `next-pwa` 依賴
- 清理臨時文件和緩存
- 修復 `next.config.js` 文件
- 啟動開發服務器

**使用方法**：
```
雙擊 fix-server-start.bat
```

或在PowerShell中運行：
```powershell
.\fix-server-start.bat
```

## 推薦修復步驟

1. 首先運行 `fix-server-issues.bat`（推薦）進行全面修復
2. 如果問題仍然存在，運行 `diagnose-server.bat` 生成診斷報告
3. 根據診斷報告，選擇運行 `fix-pwa-dependency.bat` 或 `fix-server-start.bat`
4. 如果使用 localhost 仍然無法訪問，請嘗試使用 http://127.0.0.1:3000 代替

## 手動修復步驟

如果修復腳本無法解決問題，可以嘗試以下手動步驟：

1. 安裝缺失的依賴：
   ```
   npm install next-pwa --save
   ```

2. 修改 `next.config.js` 文件，整合 PWA 配置：
   ```javascript
   const withPWA = require('next-pwa')({
     dest: 'public',
     disable: process.env.NODE_ENV === 'development',
     register: true,
     skipWaiting: true,
   });

   /** @type {import('next').NextConfig} */
   const nextConfig = {
     // 原有配置...
   };

   module.exports = withPWA(nextConfig);
   ```

3. 創建缺失的圖標文件：
   ```
   mkdir -p public/icons
   touch public/icons/icon-144x144.png
   ```

4. 運行認證錯誤修復腳本：
   ```
   node scripts/fix-auth-errors.js
   ```

5. 運行Prisma遷移和種子：
   ```
   npx prisma migrate dev --name add-test-users
   npx prisma db seed
   ```

6. 檢查並終止佔用端口的進程：
   ```
   netstat -ano | findstr :3000
   taskkill /F /PID <進程ID>
   ```

7. 清理緩存：
   ```
   rmdir /s /q .next
   ```

8. 使用 IP 地址代替 localhost：
   ```
   http://127.0.0.1:3000
   ```

## 注意事項

- 修復腳本需要在 Windows 環境下運行
- 在PowerShell中運行腳本時，可能需要調整執行策略
- 某些操作可能需要管理員權限
- 修復過程中會備份原有配置文件
- 如果問題仍然存在，請檢查防火牆和殺毒軟件設置
- 確保PostgreSQL數據庫服務正在運行