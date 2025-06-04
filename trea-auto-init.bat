@echo off
REM ====================================================
REM Trea AI 終端機自動初始化腳本
REM 將此腳本設為 Trea AI 終端機的自動啟動腳本
REM ====================================================

REM 設定顏色
color 0B

REM 顯示歡迎信息
echo ====================================================
echo Trea AI 終端機自動初始化中...
echo ====================================================
echo.

REM 1. 設定 Node.js 路徑
set PATH=C:\Program Files\nodejs\;%PATH%

REM 2. 設定編碼為 UTF-8
chcp 65001 > nul

REM 3. 切換到專案根目錄
cd /d C:\Users\Administrator\Desktop\EduCreate

REM 4. 載入環境變數
REM 檢查 .env.local 文件
if exist ".env.local" (
    for /F "tokens=*" %%A in (.env.local) do (
        set %%A
    )
)

REM 檢查 .env 文件
if exist ".env" (
    for /F "tokens=*" %%A in (.env) do (
        set %%A
    )
)

REM 5. 顯示簡短的初始化完成信息
echo [%date% %time%] Trea AI 終端機環境已初始化
echo - Node: %NODE_VERSION%
echo - 目錄: %CD%
echo - 編碼: UTF-8 (65001)
echo ====================================================
echo.

REM 設定命令提示符樣式
prompt $P$_$G 

REM 清除變數
set NODE_VERSION=