@echo off
echo ====================================
echo EduCreate 服務器問題修復腳本
echo ====================================
echo.

:: 設置顏色
color 0B

echo 步驟 1: 修復圖標404錯誤
echo -----------------------------------

:: 確保圖標目錄存在
if not exist "public\icons" (
    mkdir "public\icons"
    echo 創建圖標目錄: public\icons
)

:: 創建缺失的圖標文件
if not exist "public\icons\icon-144x144.png" (
    echo ^<svg width="144" height="144" xmlns="http://www.w3.org/2000/svg"^> > "public\icons\icon-144x144.png"
    echo   ^<rect width="144" height="144" fill="#4f46e5" /^> >> "public\icons\icon-144x144.png"
    echo   ^<text x="50%%" y="50%%" font-family="Arial" font-size="36" fill="white" text-anchor="middle" dominant-baseline="middle"^>EC^</text^> >> "public\icons\icon-144x144.png"
    echo ^</svg^> >> "public\icons\icon-144x144.png"
    echo 創建圖標文件: icon-144x144.png
) else (
    echo 圖標文件已存在: icon-144x144.png
)

echo 圖標文件檢查完成
echo.

echo 步驟 2: 運行認證錯誤修復腳本
echo -----------------------------------

if exist "scripts\fix-auth-errors.js" (
    node scripts/fix-auth-errors.js
    if %ERRORLEVEL% NEQ 0 (
        echo 錯誤: 修復腳本執行失敗
        pause
        exit /b 1
    )
) else (
    echo 警告: 認證錯誤修復腳本不存在
    echo 請確保scripts\fix-auth-errors.js文件存在
)

echo.
echo 步驟 3: 運行 Prisma 遷移和種子
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
echo 步驟 4: 清理緩存和終止佔用端口的進程
echo -----------------------------------

:: 終止佔用端口的進程
echo 正在檢查並終止佔用端口 3000, 3001, 3002 的進程...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo 終止佔用端口 3000 的進程 PID: %%a
    taskkill /F /PID %%a 2>nul
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    echo 終止佔用端口 3001 的進程 PID: %%a
    taskkill /F /PID %%a 2>nul
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3002') do (
    echo 終止佔用端口 3002 的進程 PID: %%a
    taskkill /F /PID %%a 2>nul
)

:: 清理緩存
echo 正在清理 .next 目錄...
if exist ".next" (
    rmdir /s /q .next
    echo .next 目錄已清理
)

echo.
echo 步驟 5: 安裝缺失的依賴
echo -----------------------------------
echo 正在檢查並安裝缺失的依賴...

npm list next-pwa || npm install next-pwa --save

echo.
echo 步驟 6: 啟動開發服務器
echo -----------------------------------
echo 修復完成！正在啟動開發服務器...
echo 請在瀏覽器中訪問 http://localhost:3000
echo 如果仍然無法訪問，請嘗試 http://127.0.0.1:3000
echo 按 Ctrl+C 可以停止服務器
echo.

npm run dev

pause