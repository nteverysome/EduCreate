@echo off
chcp 65001 >nul
echo ==========================================
echo      修復 EduCreate 註冊問題
echo ==========================================
echo.

echo 🔧 步驟 1: 檢查 PostgreSQL 服務狀態...
echo.

:: 檢查 PostgreSQL 17
sc query postgresql-x64-17 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PostgreSQL 17 服務已找到
    sc query postgresql-x64-17 | findstr "STATE" | findstr "RUNNING" >nul
    if %errorlevel% equ 0 (
        echo ✅ PostgreSQL 17 服務正在運行
        goto :db_check_done
    ) else (
        echo ⚠️ PostgreSQL 17 服務未運行，嘗試啟動...
        net start postgresql-x64-17
        if %errorlevel% equ 0 (
            echo ✅ PostgreSQL 17 服務啟動成功
            goto :db_check_done
        ) else (
            echo ❌ PostgreSQL 17 服務啟動失敗
        )
    )
) else (
    echo ❌ 未找到 PostgreSQL 17 服務
)

:: 檢查 PostgreSQL 16
sc query postgresql-x64-16 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PostgreSQL 16 服務已找到
    sc query postgresql-x64-16 | findstr "STATE" | findstr "RUNNING" >nul
    if %errorlevel% equ 0 (
        echo ✅ PostgreSQL 16 服務正在運行
        goto :db_check_done
    ) else (
        echo ⚠️ PostgreSQL 16 服務未運行，嘗試啟動...
        net start postgresql-x64-16
        if %errorlevel% equ 0 (
            echo ✅ PostgreSQL 16 服務啟動成功
            goto :db_check_done
        ) else (
            echo ❌ PostgreSQL 16 服務啟動失敗
        )
    )
) else (
    echo ❌ 未找到 PostgreSQL 16 服務
)

:: 檢查 PostgreSQL 15
sc query postgresql-x64-15 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PostgreSQL 15 服務已找到
    sc query postgresql-x64-15 | findstr "STATE" | findstr "RUNNING" >nul
    if %errorlevel% equ 0 (
        echo ✅ PostgreSQL 15 服務正在運行
        goto :db_check_done
    ) else (
        echo ⚠️ PostgreSQL 15 服務未運行，嘗試啟動...
        net start postgresql-x64-15
        if %errorlevel% equ 0 (
            echo ✅ PostgreSQL 15 服務啟動成功
            goto :db_check_done
        ) else (
            echo ❌ PostgreSQL 15 服務啟動失敗
        )
    )
) else (
    echo ❌ 未找到 PostgreSQL 15 服務
)

:: 檢查 PostgreSQL 14
sc query postgresql-x64-14 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PostgreSQL 14 服務已找到
    sc query postgresql-x64-14 | findstr "STATE" | findstr "RUNNING" >nul
    if %errorlevel% equ 0 (
        echo ✅ PostgreSQL 14 服務正在運行
        goto :db_check_done
    ) else (
        echo ⚠️ PostgreSQL 14 服務未運行，嘗試啟動...
        net start postgresql-x64-14
        if %errorlevel% equ 0 (
            echo ✅ PostgreSQL 14 服務啟動成功
            goto :db_check_done
        ) else (
            echo ❌ PostgreSQL 14 服務啟動失敗
        )
    )
) else (
    echo ❌ 未找到任何 PostgreSQL 服務 (14, 15, 16, 17)
    echo 💡 請運行 install-postgresql-auto.ps1 安裝 PostgreSQL
)

:db_check_done

echo.
echo 🔧 步驟 2: 檢查環境配置...
if exist ".env" (
    echo ✅ 找到 .env 文件
    findstr "DATABASE_URL" .env >nul
    if %errorlevel% equ 0 (
        echo ✅ DATABASE_URL 已配置
    ) else (
        echo ❌ DATABASE_URL 未配置
        echo 💡 請檢查 .env 文件中的數據庫配置
    )
) else (
    echo ❌ 未找到 .env 文件
    echo 💡 請從 .env.example 複製並配置 .env 文件
)

echo.
echo 🔧 步驟 3: 測試數據庫連接...
if exist "node_modules" (
    echo ✅ 找到 node_modules
    echo 🧪 運行數據庫連接測試...
    node test-register-fix.js
) else (
    echo ❌ 未找到 node_modules
    echo 💡 請先運行: npm install
)

echo.
echo 🔧 步驟 4: 檢查開發服務器...
echo 💡 如果數據庫連接正常，請手動執行以下命令:
echo    npm run dev
echo.
echo 🔧 步驟 5: 測試註冊功能...
echo 💡 服務器啟動後，訪問: http://localhost:3000/register
echo 💡 查看瀏覽器控制台和服務器日誌中的詳細錯誤信息

echo.
echo ==========================================
echo      修復完成
echo ==========================================
echo 💡 如果問題仍然存在，請檢查:
echo    1. PostgreSQL 服務是否正在運行
echo    2. .env 文件中的數據庫連接字符串
echo    3. 防火牆是否阻止了數據庫連接
echo    4. 數據庫用戶權限是否正確
echo.
pause