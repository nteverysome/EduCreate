@echo off
chcp 65001 >nul
echo ==========================================
echo     EduCreate 快速啟動
echo ==========================================
echo.

REM 快速檢查 PostgreSQL
echo 🔍 檢查 PostgreSQL...
psql -U postgres -c "SELECT 1;" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL 未連接，嘗試啟動服務...
    net start postgresql-x64-17 >nul 2>&1
    if %errorlevel% neq 0 (
        echo ⚠️ 請手動啟動 PostgreSQL 服務
        pause
        exit /b 1
    )
    echo ✅ PostgreSQL 服務已啟動
) else (
    echo ✅ PostgreSQL 連接正常
)

REM 快速檢查 .env
echo 🔍 檢查配置...
if not exist ".env" (
    echo ⚠️ 創建 .env 文件...
    (
        echo DATABASE_URL="postgresql://postgres:z089336161@localhost:5432/educreate?schema=public"
        echo NEXTAUTH_SECRET="educreate-secret-2024"
        echo NEXTAUTH_URL="http://localhost:3000"
    ) > .env
    echo ✅ .env 文件已創建
) else (
    echo ✅ 配置文件存在
)

REM 快速檢查依賴
echo 🔍 檢查依賴...
if not exist "node_modules" (
    echo 📦 安裝依賴...
    npm install --silent
    if %errorlevel% neq 0 (
        echo ❌ 依賴安裝失敗
        pause
        exit /b 1
    )
    echo ✅ 依賴安裝完成
) else (
    echo ✅ 依賴已存在
)

REM 快速初始化 Prisma
echo 🔍 初始化資料庫...
npx prisma db push --accept-data-loss >nul 2>&1
npx prisma generate >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 資料庫初始化完成
) else (
    echo ⚠️ 資料庫初始化可能有問題，繼續啟動...
)

echo.
echo 🚀 啟動 EduCreate...
echo 📱 http://localhost:3000
echo 🎯 按 Ctrl+C 停止
echo ==========================================
echo.

REM 啟動伺服器
npm run dev