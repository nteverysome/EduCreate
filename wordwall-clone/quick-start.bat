@echo off
echo 🚀 Wordwall Clone 快速啟動腳本
echo ================================
echo.

echo 📋 檢查 Node.js 環境...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未檢測到 Node.js，請先安裝 Node.js
    echo 📥 下載地址: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js 環境正常
echo.

echo 🔧 啟動簡化服務器 (無需依賴)...
echo 📍 當前目錄: %cd%
echo.

echo 🌐 服務器將在以下地址啟動:
echo    主頁: http://localhost:3000
echo    遊戲演示: http://localhost:3000/interactive-demo.html
echo    詞彙管理: http://localhost:3000/vocabulary-input.html
echo    Agent儀表板: http://localhost:3000/agent-dashboard.html
echo.

echo 💡 提示: 按 Ctrl+C 停止服務器
echo.

node simple-server.js

pause
