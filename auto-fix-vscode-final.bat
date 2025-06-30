@echo off
echo 🔧 自動修復 VS Code 外部網站提示問題...
echo.

REM 創建 VS Code 用戶設置目錄
set "VSCODE_DIR=%APPDATA%\Code\User"
if not exist "%VSCODE_DIR%" (
    echo 📁 創建 VS Code 用戶目錄...
    mkdir "%VSCODE_DIR%"
)

REM 創建設置文件
set "SETTINGS_FILE=%VSCODE_DIR%\settings.json"
echo 📝 創建 VS Code 設置文件...

(
echo {
echo   "workbench.trustedDomains": [
echo     "https://edu-create.vercel.app",
echo     "https://*.vercel.app",
echo     "http://localhost:3000",
echo     "http://localhost:3001"
echo   ],
echo   "security.workspace.trust.untrustedFiles": "open",
echo   "workbench.externalUriOpeners": {
echo     "https://edu-create.vercel.app": "default"
echo   }
echo }
) > "%SETTINGS_FILE%"

echo ✅ VS Code 設置已更新！
echo 📍 設置文件位置: %SETTINGS_FILE%
echo.
echo 🔄 請重啟 VS Code 以使設置生效
echo.

REM 嘗試重啟 VS Code
echo 🚀 正在嘗試重啟 VS Code...
taskkill /f /im Code.exe >nul 2>&1
timeout /t 2 >nul
start "" "code" "."

echo.
echo 🎉 完成！VS Code 現在會自動打開外部鏈接
echo 🧪 請測試點擊 EduCreate 鏈接
pause
