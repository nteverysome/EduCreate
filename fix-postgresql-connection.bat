@echo off
chcp 65001 >nul
echo ==========================================
echo     PostgreSQL 連接問題修復工具
echo ==========================================

echo.
echo 🔍 步驟 1: 檢查當前狀態...
echo ================================

echo 📋 檢查端口 5432 使用情況...
netstat -ano | findstr :5432
if %errorlevel% equ 0 (
    echo ✅ 端口 5432 正在使用中
) else (
    echo ❌ 端口 5432 未被使用
)

echo.
echo 📋 檢查 PostgreSQL 進程...
tasklist | findstr postgres
if %errorlevel% equ 0 (
    echo ✅ 找到 PostgreSQL 進程
) else (
    echo ❌ 未找到 PostgreSQL 進程
)

echo.
echo 🔍 步驟 2: 測試數據庫連接...
echo ================================
node quick-db-test.js

echo.
echo 🔍 步驟 3: 檢查可能的解決方案...
echo ================================

echo 💡 如果連接失敗，可能的原因:
echo 1. PostgreSQL 未安裝
echo 2. PostgreSQL 服務未啟動
echo 3. 數據庫 'educreate' 不存在
echo 4. 用戶身份驗證問題

echo.
echo 🔧 建議的修復步驟:
echo ================================
echo 1. 安裝 PostgreSQL (如果未安裝):
echo    - 下載: https://www.postgresql.org/download/windows/
echo    - 或使用 Chocolatey: choco install postgresql

echo.
echo 2. 啟動 PostgreSQL 服務:
echo    net start postgresql-x64-14

echo.
echo 3. 創建數據庫:
echo    createdb -U postgres educreate

echo.
echo 4. 運行 Prisma 遷移:
echo    npx prisma db push

echo.
echo 🎯 修復完成！
echo 請根據上述檢查結果執行相應的修復操作。
pause