@echo off
chcp 65001 >nul
echo.
echo ==========================================
echo    EduCreate 註冊錯誤緊急修復
echo ==========================================
echo.

echo 🔍 運行診斷...
node quick-diagnosis.js
echo.

echo 🔍 檢查 PostgreSQL 服務...
call check-postgresql.bat

echo.
echo 🔧 運行 PostgreSQL 連接修復...
echo ================================
powershell -ExecutionPolicy Bypass -File fix-postgresql-connection.ps1
echo.

echo 🧪 測試數據庫連接...
node test-database-connection.js
echo.

echo 🔧 開始修復...
echo.

echo 📋 步驟 1: 生成 Prisma 客戶端...
npx prisma generate
if errorlevel 1 (
    echo ⚠️  Prisma 生成失敗，繼續下一步...
) else (
    echo ✅ Prisma 客戶端生成成功
)
echo.

echo 📋 步驟 2: 推送數據庫架構...
npx prisma db push --accept-data-loss
if errorlevel 1 (
    echo ⚠️  數據庫推送失敗，可能需要啟動 PostgreSQL
    echo 💡 請確保 PostgreSQL 服務正在運行
) else (
    echo ✅ 數據庫架構推送成功
)
echo.

echo 📋 步驟 3: 重新安裝依賴...
npm install
if errorlevel 1 (
    echo ⚠️  依賴安裝失敗
) else (
    echo ✅ 依賴安裝成功
)
echo.

echo 📋 步驟 4: 清理緩存...
if exist ".next" rmdir /s /q ".next"
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache"
echo ✅ 緩存清理完成
echo.

echo 🎉 修復完成！
echo ==========================================
echo.
echo 📝 接下來請執行:
echo 1. npm run dev
echo 2. 打開瀏覽器訪問: http://localhost:3000/register
echo 3. 測試註冊功能
echo.
echo 💡 如果仍有問題:
echo - 檢查 PostgreSQL 是否運行
echo - 查看瀏覽器控制台錯誤
echo - 查看終端錯誤信息
echo.
pause