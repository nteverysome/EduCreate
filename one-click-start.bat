@echo off
chcp 65001 >nul
echo ==========================================
echo     EduCreate 一鍵啟動工具
echo ==========================================
echo.
echo 🚀 正在執行完整的初始化和啟動流程...
echo.

REM 步驟 1: 檢查 Node.js 和 npm
echo 🔍 步驟 1: 檢查 Node.js 環境...
echo ================================
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js 未安裝或不在 PATH 中
    echo 💡 請先安裝 Node.js: https://nodejs.org/
    pause
    exit /b 1
)
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm 未安裝或不在 PATH 中
    pause
    exit /b 1
)
echo ✅ Node.js 和 npm 環境正常

echo.
echo 🔍 步驟 2: 檢查 PostgreSQL 連接...
echo ================================
psql -U postgres -c "SELECT version();" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PostgreSQL 連接成功
) else (
    echo ❌ PostgreSQL 連接失敗
    echo 💡 請確認:
    echo    1. PostgreSQL 服務正在運行
    echo    2. 用戶名和密碼正確 (postgres/z089336161)
    echo    3. 端口 5432 可用
    echo.
    echo 🔧 嘗試啟動 PostgreSQL 服務...
    net start postgresql-x64-17 >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ PostgreSQL 服務啟動成功
    ) else (
        echo ⚠️ 無法自動啟動 PostgreSQL 服務
        echo 請手動啟動後重新執行此腳本
        pause
        exit /b 1
    )
)

echo.
echo 🔍 步驟 3: 初始化資料庫...
echo ================================
echo 創建 educreate 資料庫...
psql -U postgres -c "CREATE DATABASE educreate;" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ educreate 資料庫創建成功
) else (
    echo ℹ️ educreate 資料庫已存在（正常情況）
)

echo.
echo 🔍 步驟 4: 檢查和創建 .env 配置...
echo ================================
if exist ".env" (
    echo ✅ 找到 .env 文件
    findstr "DATABASE_URL" .env >nul
    if %errorlevel% equ 0 (
        echo ✅ DATABASE_URL 已配置
    ) else (
        echo ⚠️ DATABASE_URL 未配置，正在添加...
        echo DATABASE_URL="postgresql://postgres:z089336161@localhost:5432/educreate?schema=public" >> .env
        echo ✅ DATABASE_URL 配置完成
    )
) else (
    echo ⚠️ .env 文件不存在，正在創建...
    (
        echo DATABASE_URL="postgresql://postgres:z089336161@localhost:5432/educreate?schema=public"
        echo NEXTAUTH_SECRET="educreate-secret-key-2024"
        echo NEXTAUTH_URL="http://localhost:3000"
        echo STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
        echo STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
        echo STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
    ) > .env
    echo ✅ .env 文件創建成功
)

echo.
echo 🔍 步驟 5: 安裝依賴...
echo ================================
if exist "node_modules" (
    echo ✅ node_modules 已存在
) else (
    echo 📦 正在安裝 npm 依賴...
    npm install
    if %errorlevel% equ 0 (
        echo ✅ 依賴安裝成功
    ) else (
        echo ❌ 依賴安裝失敗
        pause
        exit /b 1
    )
)

echo.
echo 🔍 步驟 6: 初始化 Prisma...
echo ================================
echo 推送資料庫 Schema...
npx prisma db push --accept-data-loss >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 資料庫 Schema 推送成功
) else (
    echo ⚠️ Schema 推送可能有問題，繼續執行...
)

echo 生成 Prisma Client...
npx prisma generate >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Prisma Client 生成成功
) else (
    echo ❌ Prisma Client 生成失敗
    pause
    exit /b 1
)

echo.
echo 🔍 步驟 7: 測試資料庫連接...
echo ================================
if exist "test-db-connection.js" (
    echo 執行資料庫連接測試...
    node test-db-connection.js
    if %errorlevel% equ 0 (
        echo ✅ 資料庫連接測試通過
    ) else (
        echo ⚠️ 資料庫連接測試失敗，但繼續啟動...
    )
) else (
    echo ℹ️ 跳過資料庫連接測試（測試文件不存在）
)

echo.
echo 🔍 步驟 8: 構建項目...
echo ================================
echo 執行 Next.js 構建檢查...
npx next build --dry-run >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 項目構建檢查通過
) else (
    echo ⚠️ 構建檢查有警告，但繼續啟動...
)

echo.
echo 🚀 步驟 9: 啟動開發伺服器...
echo ================================
echo 正在啟動 EduCreate 開發伺服器...
echo 📱 應用將在 http://localhost:3000 啟動
echo 🔄 請等待編譯完成...
echo.
echo ⚠️ 注意：如果出現錯誤，請檢查:
echo    1. 所有依賴是否正確安裝
echo    2. PostgreSQL 是否正常運行
echo    3. .env 配置是否正確
echo.
echo 🎯 按 Ctrl+C 可停止伺服器
echo ==========================================
echo.

REM 啟動開發伺服器
npm run dev