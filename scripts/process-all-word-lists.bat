@echo off
echo ========================================
echo GEPT 單字列表批量處理工具
echo ========================================
echo.

REM 檢查 Node.js 是否安裝
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [錯誤] 未找到 Node.js，請先安裝 Node.js
    pause
    exit /b 1
)

echo [1/5] 檢查來源檔案...
echo.

REM GEPT Kids
if exist "data\sources\gept-kids-raw.txt" (
    echo [2/5] 處理 GEPT Kids...
    node scripts\clean-word-list.js data\sources\gept-kids-raw.txt data\word-lists\gept-kids-all.txt
    echo.
) else (
    echo [跳過] GEPT Kids 來源檔案不存在: data\sources\gept-kids-raw.txt
    echo.
)

REM GEPT 初級
if exist "data\sources\gept-elementary-raw.txt" (
    echo [3/5] 處理 GEPT 初級...
    node scripts\clean-word-list.js data\sources\gept-elementary-raw.txt data\word-lists\gept-elementary.txt
    echo.
) else (
    echo [跳過] GEPT 初級來源檔案不存在: data\sources\gept-elementary-raw.txt
    echo.
)

REM GEPT 中級
if exist "data\sources\gept-intermediate-raw.txt" (
    echo [4/5] 處理 GEPT 中級...
    node scripts\clean-word-list.js data\sources\gept-intermediate-raw.txt data\word-lists\gept-intermediate.txt
    echo.
) else (
    echo [跳過] GEPT 中級來源檔案不存在: data\sources\gept-intermediate-raw.txt
    echo.
)

REM GEPT 中高級
if exist "data\sources\gept-high-intermediate-raw.txt" (
    echo [5/5] 處理 GEPT 中高級...
    node scripts\clean-word-list.js data\sources\gept-high-intermediate-raw.txt data\word-lists\gept-high-intermediate.txt
    echo.
) else (
    echo [跳過] GEPT 中高級來源檔案不存在: data\sources\gept-high-intermediate-raw.txt
    echo.
)

echo ========================================
echo 處理完成!
echo ========================================
echo.
echo 下一步:
echo 1. 檢查生成的檔案: data\word-lists\
echo 2. 驗證單字數量
echo 3. 開始自動收集詞彙數據
echo.

pause

