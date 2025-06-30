@echo off
echo 🔧 修復 VS Code 外部鏈接對話框問題...
echo.

REM 創建 VS Code 用戶設置目錄
set "SETTINGS_DIR=%APPDATA%\Code\User"
set "SETTINGS_FILE=%SETTINGS_DIR%\settings.json"

echo 📁 創建設置目錄...
if not exist "%SETTINGS_DIR%" mkdir "%SETTINGS_DIR%"

echo 📝 創建 VS Code 設置文件...

REM 創建設置文件內容
(
echo {
echo   "workbench.trustedDomains": [
echo     "https://edu-create.vercel.app",
echo     "https://*.vercel.app",
echo     "http://localhost:3000"
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

REM 創建工作區設置
echo 📝 創建工作區設置...
if not exist ".vscode" mkdir ".vscode"

(
echo {
echo   "workbench.trustedDomains": [
echo     "https://edu-create.vercel.app",
echo     "https://*.vercel.app"
echo   ],
echo   "security.workspace.trust.untrustedFiles": "open"
echo }
) > ".vscode\settings.json"

echo ✅ 工作區設置已創建！
echo.

REM 重啟 VS Code
echo 🔄 重啟 VS Code...
taskkill /f /im Code.exe >nul 2>&1
timeout /t 3 >nul

REM 嘗試啟動 VS Code
start "" "code" "." 2>nul
if errorlevel 1 (
    echo ⚠️ 請手動重啟 VS Code
) else (
    echo ✅ VS Code 已重啟
)

echo.
echo 🎉 完成！VS Code 現在應該會自動打開外部鏈接
echo 🧪 請測試點擊 EduCreate 鏈接
echo.
echo 如果仍有問題，請手動執行以下步驟:
echo 1. 按 Ctrl+Shift+P
echo 2. 輸入: Preferences: Open User Settings (JSON)
echo 3. 確認設置已正確保存
echo.
pause
