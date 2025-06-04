@echo off
chcp 65001 >nul
echo ==========================================
echo     EduCreate 資料庫初始化工具 (簡化版)
echo ==========================================
echo.

echo 🔍 步驟 1: 檢查 PostgreSQL 連接...
echo ================================
echo 測試 PostgreSQL 連接...
psql -U postgres -c "SELECT version();" 2>nul
if %errorlevel% equ 0 (
    echo ✅ PostgreSQL 連接成功
) else (
    echo ❌ PostgreSQL 連接失敗
    echo 💡 請確認 PostgreSQL 服務正在運行
    pause
    exit /b 1
)

echo.
echo 🔍 步驟 2: 創建 educreate 資料庫...
echo ================================
echo 嘗試創建 educreate 資料庫...
psql -U postgres -c "CREATE DATABASE educreate;" 2>nul
if %errorlevel% equ 0 (
    echo ✅ educreate 資料庫創建成功
) else (
    echo ℹ️ educreate 資料庫可能已存在（這是正常的）
)

echo.
echo 🔍 步驟 3: 檢查 .env 配置...
echo ================================
if exist ".env" (
    echo ✅ 找到 .env 文件
    findstr "DATABASE_URL" .env >nul
    if %errorlevel% equ 0 (
        echo ✅ DATABASE_URL 已配置
        findstr "DATABASE_URL" .env
    ) else (
        echo ⚠️ DATABASE_URL 未配置
        echo 請在 .env 文件中添加 DATABASE_URL
    )
) else (
    echo ⚠️ .env 文件不存在
    echo 正在創建 .env 文件...
    (
        echo DATABASE_URL="postgresql://postgres:z089336161@localhost:5432/educreate?schema=public"
        echo NEXTAUTH_SECRET="your-secret-key-here"
        echo NEXTAUTH_URL="http://localhost:3000"
        echo STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"
        echo STRIPE_SECRET_KEY="your-stripe-secret-key"
    ) > .env
    echo ✅ .env 文件創建成功
)

echo.
echo 🔍 步驟 4: 檢查 Prisma Schema...
echo ================================
if exist "prisma\schema.prisma" (
    echo ✅ 找到 Prisma Schema
) else (
    echo ❌ Prisma Schema 不存在
    pause
    exit /b 1
)

echo.
echo 🔍 步驟 5: 推送資料庫變更...
echo ================================
echo 執行 npx prisma db push...
npx prisma db push
if %errorlevel% equ 0 (
    echo ✅ 資料庫 Schema 推送成功
) else (
    echo ❌ 資料庫 Schema 推送失敗
    echo 💡 請檢查資料庫連接和 Schema 配置
)

echo.
echo 🔍 步驟 6: 生成 Prisma Client...
echo ================================
echo 執行 npx prisma generate...
npx prisma generate
if %errorlevel% equ 0 (
    echo ✅ Prisma Client 生成成功
) else (
    echo ❌ Prisma Client 生成失敗
)

echo.
echo ==========================================
echo 🎉 資料庫初始化完成！
echo ==========================================
echo.
echo 📋 接下來的步驟:
echo 1. 執行 npm run dev 啟動開發伺服器
echo 2. 訪問 http://localhost:3000 測試應用
echo 3. 測試註冊和登入功能
echo.
echo 🔧 如果遇到問題，請執行:
echo    node test-db-connection.js (測試資料庫連接)
echo.
pause