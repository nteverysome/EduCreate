@echo off
echo ===================================================
echo Trea AI 終端機環境設定腳本
echo ===================================================
echo.

:: 設定顏色
color 0A

:: 1. 設定 Node.js 路徑
echo 步驟 1: 設定 Node.js 路徑...
set PATH=C:\Program Files\nodejs\;%PATH%
echo Node.js 路徑已設定為: C:\Program Files\nodejs\

:: 2. 設定編碼為 UTF-8
echo 步驟 2: 設定編碼為 UTF-8...
chcp 65001 > nul
echo 編碼已設定為 UTF-8 (Code Page 65001)

:: 3. 切換到專案根目錄
echo 步驟 3: 切換到專案根目錄...
cd /d C:\Users\Administrator\Desktop\EduCreate
echo 當前目錄: %CD%

:: 4. 載入環境變數
echo 步驟 4: 載入環境變數...

:: 檢查 .env.local 文件
if exist ".env.local" (
    echo 載入 .env.local 文件...
    for /F "tokens=*" %%A in (.env.local) do (
        set %%A
    )
)

:: 檢查 .env 文件
if exist ".env" (
    echo 載入 .env 文件...
    for /F "tokens=*" %%A in (.env) do (
        set %%A
    )
)

echo 環境變數已載入

:: 5. 顯示設定結果
echo.
echo ===================================================
echo 環境設定完成！
echo ===================================================
echo.
echo Node 版本:
node -v
echo.
echo NPM 版本:
npm -v
echo.
echo 當前編碼:
chcp
echo.
echo 當前目錄:
echo %CD%
echo.
echo 環境變數已從 .env/.env.local 載入
echo.
echo ===================================================
echo Trea AI 終端機環境已設定完成
echo ===================================================

:: 保持終端機開啟
cmd /k