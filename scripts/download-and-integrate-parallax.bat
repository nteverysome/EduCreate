@echo off
echo ========================================
echo EduCreate 視差背景資源自動整合腳本
echo ========================================
echo.

echo 🎮 開始整合 Bongseng 視差背景資源...
echo.

echo 📋 請確保您已經：
echo    1. 從 itch.io 下載了 ZIP 檔案到 Downloads 資料夾
echo    2. 檔案名稱為：Horizontal asset pack.zip 和/或 Vertical asset pack.zip
echo.

pause

echo 🚀 執行整合腳本...
node scripts/download-and-integrate-parallax.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ 整合完成！
    echo.
    echo 📋 後續步驟：
    echo    1. 檢查 assets/external-resources/parallax-backgrounds/ 目錄
    echo    2. 運行測試：npm run test:parallax
    echo    3. 查看整合示例：components/games/ParallaxBackground.tsx
    echo.
    echo 🎯 EduCreate 整合點：
    echo    - 記憶科學遊戲背景
    echo    - 主題切換系統
    echo    - GEPT 分級場景
    echo    - 無障礙設計支援
    echo.
) else (
    echo.
    echo ❌ 整合過程中發生錯誤
    echo 請檢查錯誤訊息並重試
    echo.
)

echo 按任意鍵結束...
pause > nul
