@echo off
chcp 65001 >nul
echo ==========================================
echo     EduCreate 資料庫初始化工具
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
    echo 💡 請確認:
    echo    1. PostgreSQL 服務正在運行
    echo    2. 用戶名和密碼正確
    echo    3. 端口 5432 可用
    pause
    exit /b 1
)

echo.
echo 🔍 步驟 2: 檢查 educreate 資料庫...
echo ================================
psql -U postgres -lqt | findstr "educreate" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ educreate 資料庫已存在
) else (
    echo ⚠️ educreate 資料庫不存在，正在創建...
    psql -U postgres -c "CREATE DATABASE educreate;"
    if %errorlevel% equ 0 (
        echo ✅ educreate 資料庫創建成功
    ) else (
        echo ❌ educreate 資料庫創建失敗
        pause
        exit /b 1
    )
)

echo.
echo 🔍 步驟 3: 檢查 .env 配置...
echo ================================
if exist ".env" (
    echo ✅ 找到 .env 文件
    findstr "DATABASE_URL" .env >nul
    if %errorlevel% equ 0 (
        echo ✅ DATABASE_URL 已配置
        type .env | findstr "DATABASE_URL"
    ) else (
        echo ❌ DATABASE_URL 未配置
        echo 💡 請在 .env 文件中添加:
        echo DATABASE_URL="postgresql://postgres:z089336161@localhost:5432/educreate?schema=public"
        pause
        exit /b 1
    )
) else (
    echo ❌ 未找到 .env 文件
    echo 💡 正在創建 .env 文件...
    echo DATABASE_URL="postgresql://postgres:z089336161@localhost:5432/educreate?schema=public" > .env
    echo ✅ .env 文件創建完成
)

echo.
echo 🔍 步驟 4: 檢查 Prisma 配置...
echo ================================
if exist "prisma\schema.prisma" (
    echo ✅ 找到 Prisma schema 文件
) else (
    echo ❌ 未找到 Prisma schema 文件
    echo 💡 請確認 prisma/schema.prisma 文件存在
    pause
    exit /b 1
)

echo.
echo 🔍 步驟 5: 執行 Prisma 資料庫推送...
echo ================================
echo 正在執行 npx prisma db push...
npx prisma db push
if %errorlevel% equ 0 (
    echo ✅ Prisma 資料庫推送成功
    echo ✅ 所有資料表已創建完成
) else (
    echo ❌ Prisma 資料庫推送失敗
    echo 💡 請檢查:
    echo    1. 資料庫連接字符串是否正確
    echo    2. 資料庫權限是否足夠
    echo    3. Prisma schema 語法是否正確
    pause
    exit /b 1
)

echo.
echo 🔍 步驟 6: 生成 Prisma Client...
echo ================================
echo 正在執行 npx prisma generate...
npx prisma generate
if %errorlevel% equ 0 (
    echo ✅ Prisma Client 生成成功
) else (
    echo ❌ Prisma Client 生成失敗
)

echo.
echo 🎯 資料庫初始化完成！
echo ==========================================
echo ✅ PostgreSQL 連接正常
echo ✅ educreate 資料庫已創建
echo ✅ .env 配置正確
echo ✅ Prisma schema 已推送
echo ✅ 資料表結構已建立
echo.
echo 💡 接下來可以執行:
echo    npm run dev
echo.
echo 🌐 然後訪問: http://localhost:3000
echo.
pause