@echo off
echo ===================================
echo EduCreate 自動修復與啟動腳本
echo ===================================
echo.

:: 設置顏色
color 0A

echo 步驟 1: 執行認證錯誤修復腳本
echo -----------------------------------
node scripts/fix-auth-errors.js
if %ERRORLEVEL% NEQ 0 (
    echo 錯誤: 修復腳本執行失敗
    pause
    exit /b 1
)

echo.
echo 步驟 2: 執行 Prisma 遷移和種子
echo -----------------------------------
npx prisma migrate dev --name add-test-users
if %ERRORLEVEL% NEQ 0 (
    echo 警告: Prisma 遷移失敗，嘗試繼續...
)

npx prisma db seed
if %ERRORLEVEL% NEQ 0 (
    echo 警告: Prisma 種子失敗，嘗試繼續...
)

echo.
echo 步驟 3: 啟動開發服務器
echo -----------------------------------
echo 正在啟動開發服務器，請在瀏覽器中訪問 http://localhost:3000
echo 按 Ctrl+C 可以停止服務器
echo.

npm run dev

pause