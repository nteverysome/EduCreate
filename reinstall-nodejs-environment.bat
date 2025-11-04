@echo off
REM Node.js 環境重新安裝腳本 (Batch 版本)
REM 用於 Windows CMD

setlocal enabledelayedexpansion

echo.
echo ================================
echo 🔧 Node.js 環境重新安裝工具
echo ================================
echo.

REM 步驟 1: 檢查 Node.js
echo 📋 步驟 1: 檢查 Node.js 安裝狀態...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js 已安裝: !NODE_VERSION!
) else (
    echo ❌ Node.js 未找到
    echo.
    echo 💡 請先安裝 Node.js:
    echo    1. 訪問 https://nodejs.org/
    echo    2. 下載 LTS 版本
    echo    3. 運行安裝程序
    echo    4. 重新啟動 CMD
    echo    5. 再次運行此腳本
    pause
    exit /b 1
)

REM 步驟 2: 檢查 npm
echo.
echo 📋 步驟 2: 檢查 npm 安裝狀態...
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✅ npm 已安裝: !NPM_VERSION!
) else (
    echo ❌ npm 未找到
    pause
    exit /b 1
)

REM 步驟 3: 清理舊依賴
echo.
echo 📋 步驟 3: 清理舊的依賴...

if exist "node_modules" (
    echo 🗑️  刪除 node_modules 目錄...
    rmdir /s /q node_modules
    echo ✅ node_modules 已刪除
)

if exist "package-lock.json" (
    echo 🗑️  刪除 package-lock.json...
    del package-lock.json
    echo ✅ package-lock.json 已刪除
)

REM 步驟 4: 清理 npm 緩存
echo.
echo 📋 步驟 4: 清理 npm 緩存...
npm cache clean --force
echo ✅ npm 緩存已清理

REM 步驟 5: 重新安裝依賴
echo.
echo 📋 步驟 5: 重新安裝依賴...
echo 📦 運行 npm install...
call npm install

if %errorlevel% neq 0 (
    echo ❌ npm install 失敗
    pause
    exit /b 1
)

echo ✅ npm install 完成

REM 步驟 6: 驗證安裝
echo.
echo 📋 步驟 6: 驗證安裝...

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i

echo ✅ Node.js: !NODE_VERSION!
echo ✅ npm: !NPM_VERSION!

REM 步驟 7: 檢查 Playwright
echo.
echo 📋 步驟 7: 檢查 Playwright...

if exist "node_modules\@playwright\test" (
    echo ✅ Playwright 已安裝
) else (
    echo ⚠️  Playwright 未找到，嘗試安裝...
    call npm install @playwright/test --save-dev
)

REM 完成
echo.
echo ================================
echo ✅ Node.js 環境重新安裝完成！
echo ================================
echo.
echo 📝 下一步:
echo    1. 運行開發服務器: npm run dev
echo    2. 運行 Playwright 測試: npm run test:playwright
echo    3. 查看 Playwright UI: npm run test:playwright:ui
echo.
pause

