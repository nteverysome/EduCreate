@echo off
echo ========================================
echo    EduCreate Vercel 部署腳本
echo ========================================
echo.

echo 🔍 檢查 Vercel CLI 登入狀態...
vercel whoami
if %errorlevel% neq 0 (
    echo ❌ 請先登入 Vercel CLI
    echo 運行: vercel login
    pause
    exit /b 1
)

echo.
echo 🚀 開始部署到 Vercel...
echo.

echo 📦 檢查項目配置...
if not exist "package.json" (
    echo ❌ 找不到 package.json
    pause
    exit /b 1
)

if not exist "vercel.json" (
    echo ❌ 找不到 vercel.json
    pause
    exit /b 1
)

echo ✅ 項目配置檢查完成
echo.

echo 🔧 設置環境變數提醒...
echo.
echo ⚠️  請確保在 Vercel 項目設置中配置以下環境變數：
echo    - DATABASE_URL
echo    - NEXTAUTH_URL
echo    - NEXTAUTH_SECRET
echo.

set /p continue="是否繼續部署？ (y/n): "
if /i "%continue%" neq "y" (
    echo 部署已取消
    pause
    exit /b 0
)

echo.
echo 🚀 執行部署...
vercel --prod

echo.
echo ✅ 部署完成！
echo.
echo 📋 部署後檢查清單：
echo    1. 檢查 Vercel 儀表板確認部署狀態
echo    2. 訪問您的網站 URL 測試功能
echo    3. 檢查 /api/health 端點
echo    4. 測試遊戲功能 /games
echo.

pause
