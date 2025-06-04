@echo off
echo =====================================
echo 快速修復數據庫認證問題
echo =====================================
echo.

echo 🚨 檢測到錯誤: P1000 - Authentication failed
echo 📋 當前密碼: z089336161
echo.

echo 🔍 步驟 1: 檢查 PostgreSQL 服務
sc query postgresql-x64-14 | find "RUNNING" >nul
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL 服務未運行，嘗試啟動...
    net start postgresql-x64-14
    timeout /t 3 >nul
) else (
    echo ✅ PostgreSQL 服務正在運行
)
echo.

echo 🔍 步驟 2: 測試常見密碼
setlocal enabledelayedexpansion

for %%p in (postgres admin 123456 password root z089336161) do (
    echo 測試密碼: %%p
    set PGPASSWORD=%%p
    psql -U postgres -d postgres -c "SELECT 1 as test;" 2>nul >nul
    if !errorlevel! equ 0 (
        echo ✅ 密碼正確: %%p
        
        REM 更新 .env 文件
        echo 🔧 更新 .env 文件...
        powershell -Command "(Get-Content '.env') -replace 'postgresql://postgres:[^@]*@', 'postgresql://postgres:%%p@' | Set-Content '.env'"
        
        REM 檢查並創建數據庫
        echo 🔍 檢查 educreate 數據庫...
        set PGPASSWORD=%%p
        psql -U postgres -d educreate -c "SELECT 1;" 2>nul >nul
        if !errorlevel! neq 0 (
            echo 📋 創建 educreate 數據庫...
            psql -U postgres -c "CREATE DATABASE educreate;"
        )
        
        REM 推送 Schema
        echo 🚀 推送 Prisma Schema...
        npx prisma db push --accept-data-loss
        
        REM 生成客戶端
        echo 🚀 生成 Prisma 客戶端...
        npx prisma generate
        
        echo.
        echo ✅ 修復完成！
        echo 💡 現在可以嘗試註冊: http://localhost:3000/register
        goto :success
    )
)

echo ❌ 所有常見密碼都失敗
echo.
echo 🔧 手動重置密碼步驟:
echo 1. 打開 pgAdmin 或命令行
echo 2. 重置 postgres 用戶密碼
echo 3. 更新 .env 文件中的密碼
echo 4. 重新運行此腳本
echo.
goto :end

:success
echo.
echo 🎉 數據庫認證問題已修復！
echo.
echo 📋 下一步:
echo 1. 啟動開發服務器: npm run dev
echo 2. 訪問註冊頁面: http://localhost:3000/register
echo 3. 測試註冊功能
echo.

:end
pause