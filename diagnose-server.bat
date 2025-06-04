@echo off
echo ===================================
echo EduCreate 服務器診斷腳本
echo ===================================
echo.

:: 設置顏色
color 0B

:: 創建診斷報告目錄
if not exist "logs" mkdir logs

:: 設置診斷報告文件
set REPORT_FILE=logs\server-diagnostic-%date:~0,4%%date:~5,2%%date:~8,2%-%time:~0,2%%time:~3,2%%time:~6,2%.txt
set REPORT_FILE=%REPORT_FILE: =0%

echo EduCreate 服務器診斷報告 > %REPORT_FILE%
echo 生成時間: %date% %time% >> %REPORT_FILE%
echo ===================================== >> %REPORT_FILE%
echo. >> %REPORT_FILE%

echo 步驟 1: 檢查系統環境
echo -----------------------------------
echo 正在檢查系統環境...

echo 系統環境: >> %REPORT_FILE%
echo --------------------------------------- >> %REPORT_FILE%
echo 操作系統: >> %REPORT_FILE%
ver >> %REPORT_FILE%
echo. >> %REPORT_FILE%

echo 步驟 2: 檢查Node.js和NPM版本
echo -----------------------------------
echo 正在檢查Node.js和NPM版本...

echo Node.js和NPM版本: >> %REPORT_FILE%
echo --------------------------------------- >> %REPORT_FILE%
node --version >> %REPORT_FILE% 2>&1
npm --version >> %REPORT_FILE% 2>&1
echo. >> %REPORT_FILE%

echo 步驟 3: 檢查端口佔用情況
echo -----------------------------------
echo 正在檢查端口佔用情況...

echo 端口佔用情況: >> %REPORT_FILE%
echo --------------------------------------- >> %REPORT_FILE%
echo 端口 3000: >> %REPORT_FILE%
netstat -ano | findstr :3000 >> %REPORT_FILE% 2>&1
echo. >> %REPORT_FILE%
echo 端口 3001: >> %REPORT_FILE%
netstat -ano | findstr :3001 >> %REPORT_FILE% 2>&1
echo. >> %REPORT_FILE%
echo 端口 3002: >> %REPORT_FILE%
netstat -ano | findstr :3002 >> %REPORT_FILE% 2>&1
echo. >> %REPORT_FILE%

echo 步驟 4: 檢查依賴項
echo -----------------------------------
echo 正在檢查依賴項...

echo 依賴項檢查: >> %REPORT_FILE%
echo --------------------------------------- >> %REPORT_FILE%
echo 檢查 next-pwa: >> %REPORT_FILE%
npm list next-pwa >> %REPORT_FILE% 2>&1
echo. >> %REPORT_FILE%
echo 檢查 next: >> %REPORT_FILE%
npm list next >> %REPORT_FILE% 2>&1
echo. >> %REPORT_FILE%

echo 步驟 5: 檢查配置文件
echo -----------------------------------
echo 正在檢查配置文件...

echo 配置文件檢查: >> %REPORT_FILE%
echo --------------------------------------- >> %REPORT_FILE%

echo next.config.js: >> %REPORT_FILE%
if exist "next.config.js" (
    type next.config.js >> %REPORT_FILE%
) else (
    echo 文件不存在 >> %REPORT_FILE%
)
echo. >> %REPORT_FILE%

echo next-pwa.config.js: >> %REPORT_FILE%
if exist "next-pwa.config.js" (
    type next-pwa.config.js >> %REPORT_FILE%
) else (
    echo 文件不存在 >> %REPORT_FILE%
)
echo. >> %REPORT_FILE%

echo 步驟 6: 檢查網絡連接
echo -----------------------------------
echo 正在檢查網絡連接...

echo 網絡連接檢查: >> %REPORT_FILE%
echo --------------------------------------- >> %REPORT_FILE%
ping -n 4 127.0.0.1 >> %REPORT_FILE% 2>&1
echo. >> %REPORT_FILE%
ping -n 4 localhost >> %REPORT_FILE% 2>&1
echo. >> %REPORT_FILE%

echo 診斷完成！
echo 診斷報告已保存到: %REPORT_FILE%
echo.
echo 建議修復步驟:
echo 1. 運行 fix-pwa-dependency.bat 安裝缺失的next-pwa依賴
echo 2. 運行 fix-server-start.bat 修復服務器啟動問題
echo 3. 如果仍然無法訪問，請嘗試使用http://127.0.0.1:3000而不是localhost

echo.
echo 是否要立即運行修復腳本？(Y/N)
set /p RUN_FIX=

if /i "%RUN_FIX%"=="Y" (
    echo 正在運行修復腳本...
    call fix-pwa-dependency.bat
) else (
    echo 您選擇不運行修復腳本。
    echo 請手動運行fix-pwa-dependency.bat或fix-server-start.bat進行修復。
)

pause