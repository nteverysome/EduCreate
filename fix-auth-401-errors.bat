@echo off
chcp 65001 >nul
echo.
echo ==========================================
echo   EduCreate 401 認證錯誤修復工具
echo ==========================================
echo.

echo 🔧 開始修復 401 認證錯誤...
echo.

REM 檢查 Node.js 是否安裝
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 錯誤: 未找到 Node.js，請先安裝 Node.js
    pause
    exit /b 1
)

REM 檢查 npm 是否可用
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 錯誤: 未找到 npm，請檢查 Node.js 安裝
    pause
    exit /b 1
)

echo ✅ Node.js 和 npm 已安裝
echo.

REM 安裝依賴（如果需要）
if not exist "node_modules" (
    echo 📦 安裝項目依賴...
    npm install
    if errorlevel 1 (
        echo ❌ 依賴安裝失敗
        pause
        exit /b 1
    )
    echo ✅ 依賴安裝完成
    echo.
)

REM 運行修復腳本
echo 🔧 運行認證修復腳本...
node fix-auth-401-errors.js
if errorlevel 1 (
    echo ❌ 修復腳本執行失敗
    pause
    exit /b 1
)

echo.
echo ==========================================
echo   修復完成！
echo ==========================================
echo.
echo 📋 接下來的步驟:
echo 1. 檢查 .env 文件中的配置
echo 2. 運行 'npm run dev' 啟動開發服務器
echo 3. 在瀏覽器中測試 http://localhost:3000
echo.
echo 📚 如果仍有問題，請查看:
echo - ERROR-FIX-README.md
echo - REGISTER-FIX-README.md
echo.
pause