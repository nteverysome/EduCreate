@echo off
echo 🚀 啟動 Chrome 調試模式以連接 Playwright...
echo.
echo 📍 這將啟動一個新的 Chrome 實例，您可以在其中登入 Vercel
echo 📍 然後 Playwright 可以連接到這個實例進行自動化操作
echo.

REM 關閉現有的 Chrome 進程（可選）
REM taskkill /f /im chrome.exe 2>nul

REM 啟動 Chrome 調試模式
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" ^
  --remote-debugging-port=9222 ^
  --user-data-dir="%TEMP%\chrome-debug-vercel" ^
  --disable-web-security ^
  --disable-features=VizDisplayCompositor ^
  --no-first-run ^
  --no-default-browser-check ^
  "https://vercel.com/minamisums-projects/edu-create/deployments"

echo.
echo ✅ Chrome 調試模式已啟動
echo 📍 請在新開的 Chrome 中登入 Vercel
echo 📍 然後運行: node monitor-vercel-deployment.js
echo.
pause
