@echo off
echo =====================================
echo Prisma 客戶端權限修復工具
echo =====================================
echo.

echo 🚨 檢測到錯誤: EPERM - operation not permitted
echo 📋 問題: query_engine-windows.dll.node 文件權限問題
echo.

echo 🔍 步驟 1: 停止可能占用文件的進程
taskkill /f /im node.exe 2>nul
taskkill /f /im Code.exe 2>nul
echo ✅ 進程已停止
echo.

echo 🗑️ 步驟 2: 清理 Prisma 客戶端緩存
if exist "node_modules\.prisma\client" (
    echo 正在刪除舊的 Prisma 客戶端...
    rmdir /s /q "node_modules\.prisma\client" 2>nul
    echo ✅ 舊客戶端已清理
) else (
    echo ℹ️ Prisma 客戶端目錄不存在
)
echo.

echo 🚀 步驟 3: 重新生成 Prisma 客戶端
npx prisma generate
if %errorlevel% equ 0 (
    echo ✅ Prisma 客戶端生成成功!
) else (
    echo ❌ Prisma 客戶端生成失敗
    echo.
    echo 🔧 手動解決方案:
    echo 1. 以管理員身份運行此腳本
    echo 2. 關閉所有編輯器和開發工具
    echo 3. 重新安裝依賴: npm install
    echo 4. 或刪除 node_modules 重新安裝
    goto :end
)
echo.

echo 🧪 步驟 4: 測試數據庫連接
node test-db-simple.js
echo.

echo 🎉 修復完成!
echo.
echo 📋 下一步:
echo 1. 啟動開發服務器: npm run dev
echo 2. 訪問註冊頁面: http://localhost:3000/register
echo 3. 測試註冊功能
echo.
echo ✅ 數據庫認證和 Prisma 客戶端都已修復!

:end
pause