@echo off
echo Starting Chrome with remote debugging...
echo.

REM Create temp directory
if not exist "C:\temp" mkdir "C:\temp"
if not exist "C:\temp\chrome-debug" mkdir "C:\temp\chrome-debug"

echo Closing existing Chrome windows...
timeout /t 2

REM Close existing Chrome processes
taskkill /f /im chrome.exe 2>nul

echo Starting Chrome with remote debugging port 9222...
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\temp\chrome-debug" https://vercel.com/minamisums-projects/edu-create

echo.
echo Chrome started successfully!
echo Please login to Vercel in the browser and navigate to your project page.
echo Then run: node get-vercel-error.js
echo.
pause
