@echo off
setlocal enabledelayedexpansion

REM EduCreate CDN Quick Start Script (Windows)
REM 基於 Task 1.0 基礎設施的 CDN 升級快速啟動腳本

echo 🚀 EduCreate CDN Quick Start (Windows)
echo ================================

REM 檢查 Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js 未安裝，請先安裝 Node.js
    pause
    exit /b 1
) else (
    echo ✅ Node.js 已安裝
)

REM 檢查 npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm 未安裝
    pause
    exit /b 1
) else (
    echo ✅ npm 已安裝
)

REM 檢查 git
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git 未安裝，請先安裝 Git
    pause
    exit /b 1
) else (
    echo ✅ Git 已安裝
)

echo.
echo 步驟 1: 檢查 Task 1.0 基礎設施
echo --------------------------------

REM 檢查必要目錄
if not exist "games\airplane-game" (
    echo ❌ 目錄不存在: games\airplane-game
    echo 請確保已完成 Task 1.0 系列任務
    pause
    exit /b 1
) else (
    echo ✅ 目錄存在: games\airplane-game
)

if not exist "games\airplane-game\dist" (
    echo ❌ 目錄不存在: games\airplane-game\dist
    echo 請先運行: cd games\airplane-game && npm run build
    pause
    exit /b 1
) else (
    echo ✅ 目錄存在: games\airplane-game\dist
)

if not exist "app\games\airplane-iframe" (
    echo ❌ 目錄不存在: app\games\airplane-iframe
    echo 請確保已完成 Task 1.0.3 iframe 嵌入機制
    pause
    exit /b 1
) else (
    echo ✅ 目錄存在: app\games\airplane-iframe
)

echo ✅ Task 1.0 基礎設施檢查通過

echo.
echo 步驟 2: 安裝 Vercel CLI
echo --------------------------------

vercel --version >nul 2>&1
if errorlevel 1 (
    echo 正在安裝 Vercel CLI...
    npm install -g vercel
    if errorlevel 1 (
        echo ❌ Vercel CLI 安裝失敗
        pause
        exit /b 1
    ) else (
        echo ✅ Vercel CLI 安裝完成
    )
) else (
    echo ✅ Vercel CLI 已安裝
)

echo.
echo 步驟 3: 創建 CDN 項目目錄
echo --------------------------------

set CDN_DIR=..\educreat-games-cdn

if exist "%CDN_DIR%" (
    echo ⚠️  CDN 項目目錄已存在
    set /p response="是否要重新創建？ (y/n): "
    if /i "!response!"=="y" (
        rmdir /s /q "%CDN_DIR%"
        echo ✅ 舊目錄已刪除
    )
)

if not exist "%CDN_DIR%" (
    mkdir "%CDN_DIR%"
    echo ✅ CDN 項目目錄創建完成: %CDN_DIR%
)

echo.
echo 步驟 4: 初始化 CDN 項目
echo --------------------------------

cd "%CDN_DIR%"

if not exist "package.json" (
    echo 正在初始化 package.json...
    echo {"name":"educreat-games-cdn","version":"1.0.0","description":"EduCreate Games CDN"} > package.json
    echo ✅ package.json 創建完成
)

echo.
echo 步驟 5: 創建配置文件
echo --------------------------------

REM 創建 vercel.json
echo 創建 vercel.json...
(
echo {
echo   "version": 2,
echo   "name": "educreat-games-cdn",
echo   "builds": [
echo     {
echo       "src": "airplane-game/**",
echo       "use": "@vercel/static"
echo     }
echo   ],
echo   "routes": [
echo     {
echo       "src": "/airplane-game/^.*^",
echo       "dest": "/airplane-game/$1"
echo     },
echo     {
echo       "src": "/api/games/config",
echo       "dest": "/api/games-config.js"
echo     }
echo   ],
echo   "headers": [
echo     {
echo       "source": "/^.*^",
echo       "headers": [
echo         {
echo           "key": "Access-Control-Allow-Origin",
echo           "value": "*"
echo         },
echo         {
echo           "key": "Access-Control-Allow-Methods",
echo           "value": "GET, POST, OPTIONS"
echo         }
echo       ]
echo     }
echo   ]
echo }
) > vercel.json
echo ✅ vercel.json 創建完成

REM 創建 API 目錄和文件
if not exist "api" mkdir api

echo 創建 API 文件...
(
echo export default async function handler^(req, res^) {
echo   res.setHeader^('Access-Control-Allow-Origin', '*'^);
echo   res.setHeader^('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'^);
echo   
echo   if ^(req.method === 'OPTIONS'^) {
echo     res.status^(200^).end^(^);
echo     return;
echo   }
echo.
echo   const gamesConfig = {
echo     'airplane': {
echo       id: 'airplane',
echo       name: 'Airplane Collision Game',
echo       version: '1.0.0',
echo       cdnUrl: 'https://educreat-games-cdn.vercel.app/airplane-game',
echo       entryPoint: '/index.html'
echo     }
echo   };
echo.
echo   const { gameId } = req.query;
echo   
echo   if ^(gameId^) {
echo     const gameConfig = gamesConfig[gameId];
echo     if ^(!gameConfig^) {
echo       res.status^(404^).json^({ error: 'Game not found' }^);
echo       return;
echo     }
echo     res.status^(200^).json^({ success: true, data: gameConfig }^);
echo   } else {
echo     res.status^(200^).json^({ success: true, data: gamesConfig }^);
echo   }
echo }
) > api\games-config.js
echo ✅ API 文件創建完成

echo.
echo 步驟 6: 複製遊戲文件
echo --------------------------------

if not exist "airplane-game" mkdir airplane-game

echo 複製飛機遊戲文件...
xcopy "..\EduCreate\games\airplane-game\dist\*" "airplane-game\" /E /I /Y >nul 2>&1
if errorlevel 1 (
    echo ❌ 遊戲文件複製失敗
    echo 請檢查路徑: ..\EduCreate\games\airplane-game\dist\
    pause
    exit /b 1
) else (
    echo ✅ 飛機遊戲文件複製完成
)

echo.
echo 步驟 7: 檢查 Vercel 登入狀態
echo --------------------------------

vercel whoami >nul 2>&1
if errorlevel 1 (
    echo ⚠️  需要登入 Vercel
    echo 請運行: vercel login
    echo 然後重新運行此腳本
    pause
    exit /b 1
) else (
    echo ✅ 已登入 Vercel
)

echo.
echo 步驟 8: 準備部署
echo --------------------------------

echo 項目結構:
dir /b
echo.

echo CDN 項目設置完成！
echo.
echo 下一步操作:
echo 1. 運行 'vercel' 進行首次部署
echo 2. 運行 'vercel --prod' 進行生產部署
echo 3. 測試遊戲載入和 API
echo.
echo 詳細實施計劃請查看:
echo ..\EduCreate\docs\cdn-implementation-action-plan.md
echo.

set /p response="是否現在進行首次部署？ (y/n): "
if /i "!response!"=="y" (
    echo 正在部署...
    vercel --yes
    if errorlevel 1 (
        echo ❌ 部署失敗
    ) else (
        echo ✅ 部署成功！
        echo 請查看上方的部署 URL
    )
) else (
    echo 跳過部署，稍後可手動運行: vercel
)

echo.
echo 🎊 CDN 快速啟動完成！
echo 當前目錄: %CD%
pause
