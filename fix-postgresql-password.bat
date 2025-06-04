@echo off
echo =====================================
echo PostgreSQL 密碼修復工具
echo =====================================
echo.

echo 🔍 檢測到數據庫認證失敗錯誤
echo 錯誤代碼: P1000 - Authentication failed
echo.

echo 📋 當前 .env 文件中的數據庫配置:
echo DATABASE_URL="postgresql://postgres:z089336161@localhost:5432/educreate?schema=public"
echo.

echo 🛠️ 可能的解決方案:
echo.
echo 1. 重置 PostgreSQL 密碼
echo 2. 檢查 PostgreSQL 服務狀態
echo 3. 驗證數據庫連接
echo.

echo 📋 步驟 1: 檢查 PostgreSQL 服務狀態
net start | findstr postgres
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL 服務未運行
    echo 🚀 嘗試啟動 PostgreSQL 服務...
    net start postgresql-x64-14
    if %errorlevel% neq 0 (
        echo ❌ 無法啟動 PostgreSQL 服務
        echo 💡 請手動啟動 PostgreSQL 服務或重新安裝
        goto :end
    )
) else (
    echo ✅ PostgreSQL 服務正在運行
)
echo.

echo 📋 步驟 2: 測試當前密碼
echo 🔍 測試密碼: z089336161
psql -U postgres -d postgres -c "SELECT 1;" 2>nul
if %errorlevel% equ 0 (
    echo ✅ 當前密碼正確，檢查 educreate 數據庫
    goto :check_database
) else (
    echo ❌ 當前密碼不正確
    goto :reset_password
)

:check_database
echo.
echo 📋 步驟 3: 檢查 educreate 數據庫
psql -U postgres -d educreate -c "SELECT 1;" 2>nul
if %errorlevel% equ 0 (
    echo ✅ educreate 數據庫存在且可訪問
    echo 🔍 問題可能在於 Prisma 客戶端，嘗試重新生成...
    npx prisma generate
    echo ✅ Prisma 客戶端已重新生成
    goto :test_connection
) else (
    echo ❌ educreate 數據庫不存在或無法訪問
    echo 🚀 創建 educreate 數據庫...
    psql -U postgres -c "CREATE DATABASE educreate;"
    if %errorlevel% equ 0 (
        echo ✅ educreate 數據庫創建成功
        goto :setup_schema
    ) else (
        echo ❌ 無法創建 educreate 數據庫
        goto :end
    )
)

:reset_password
echo.
echo 🔧 重置 PostgreSQL 密碼選項:
echo.
echo 選項 1: 使用常見密碼嘗試連接
echo 選項 2: 重置為新密碼
echo.
set /p choice="請選擇 (1 或 2): "

if "%choice%"=="1" goto :try_common_passwords
if "%choice%"=="2" goto :reset_new_password
goto :reset_password

:try_common_passwords
echo.
echo 🔍 嘗試常見密碼...

for %%p in (postgres admin 123456 password root) do (
    echo 測試密碼: %%p
    set PGPASSWORD=%%p
    psql -U postgres -d postgres -c "SELECT 1;" 2>nul
    if !errorlevel! equ 0 (
        echo ✅ 找到正確密碼: %%p
        echo 🔧 更新 .env 文件...
        powershell -Command "(Get-Content .env) -replace 'postgresql://postgres:z089336161@', 'postgresql://postgres:%%p@' | Set-Content .env"
        echo ✅ .env 文件已更新
        goto :check_database
    )
)

echo ❌ 常見密碼都不正確
goto :reset_new_password

:reset_new_password
echo.
echo 🔧 重置 PostgreSQL 密碼為: newpassword123
echo.
echo 💡 請按照以下步驟手動重置密碼:
echo 1. 停止 PostgreSQL 服務: net stop postgresql-x64-14
echo 2. 以單用戶模式啟動 PostgreSQL
echo 3. 連接並重置密碼: ALTER USER postgres PASSWORD 'newpassword123';
echo 4. 重新啟動服務: net start postgresql-x64-14
echo.
echo 或者使用 pgAdmin 工具重置密碼
echo.
set /p confirm="密碼重置完成後，按 Enter 繼續..."

echo 🔧 更新 .env 文件為新密碼...
powershell -Command "(Get-Content .env) -replace 'postgresql://postgres:z089336161@', 'postgresql://postgres:newpassword123@' | Set-Content .env"
echo ✅ .env 文件已更新
goto :check_database

:setup_schema
echo.
echo 📋 步驟 4: 設置數據庫 Schema
echo 🚀 推送 Prisma Schema...
npx prisma db push
if %errorlevel% equ 0 (
    echo ✅ Prisma Schema 推送成功
) else (
    echo ❌ Prisma Schema 推送失敗
    goto :end
)

echo 🚀 生成 Prisma 客戶端...
npx prisma generate
if %errorlevel% equ 0 (
    echo ✅ Prisma 客戶端生成成功
) else (
    echo ❌ Prisma 客戶端生成失敗
    goto :end
)

:test_connection
echo.
echo 📋 步驟 5: 測試數據庫連接
echo 🔍 運行連接測試...
node test-db-connection.js
echo.

echo 🎉 修復完成！
echo.
echo 💡 現在可以嘗試註冊功能:
echo 1. 啟動開發服務器: npm run dev
echo 2. 訪問: http://localhost:3000/register
echo 3. 嘗試註冊新用戶
echo.

:end
echo 📋 如果問題仍然存在，請檢查:
echo 1. PostgreSQL 安裝是否正確
echo 2. 防火牆設置
echo 3. PostgreSQL 配置文件 (postgresql.conf, pg_hba.conf)
echo.
pause