@echo off
echo ===== EduCreate 開發環境啟動腳本 =====

echo 正在檢查並終止佔用端口 3000 的進程...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    taskkill /F /PID %%a 2>nul
    if not errorlevel 1 echo 已終止進程 PID: %%a
)

echo 正在清理舊的 .next 目錄...
if exist ".next" (
    rmdir /s /q .next
    echo .next 目錄已清理
) else (
    echo .next 目錄不存在，無需清理
)

echo 檢查 node_modules 目錄...
if not exist "node_modules" (
    echo 正在安裝依賴...
    call npm install
) else (
    echo node_modules 已存在，跳過安裝
)

echo 正在啟動 Next.js 開發服務器...
call npm run dev -- -p 3000

echo 如果開發服務器未正常啟動，請檢查錯誤信息
pause