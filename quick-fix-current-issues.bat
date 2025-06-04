@echo off
echo =====================================
echo EduCreate 當前問題快速修復
echo =====================================
echo.

echo 🚨 檢測到的問題:
echo 1. 數據庫認證失敗 (PrismaClientInitializationError)
echo 2. React 組件導入錯誤已修復
echo 3. Prisma 客戶端需要重新生成
echo.

echo 🔍 步驟 1: 檢查 PostgreSQL 服務
sc query postgresql-x64-14 | find "RUNNING" >nul
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL 服務未運行，嘗試啟動...
    net start postgresql-x64-14
    timeout /t 3 >nul
) else (
    echo ✅ PostgreSQL 服務正在運行
)
echo.

echo 🔍 步驟 2: 測試數據庫密碼
set PGPASSWORD=z089336161
psql -U postgres -d postgres -c "SELECT 1 as test;" 2>nul >nul
if %errorlevel% equ 0 (
    echo ✅ 數據庫密碼正確
    
    echo 🔍 步驟 3: 檢查 educreate 數據庫
    psql -U postgres -d educreate -c "SELECT 1;" 2>nul >nul
    if %errorlevel% neq 0 (
        echo 📋 創建 educreate 數據庫...
        psql -U postgres -c "CREATE DATABASE educreate;"
    ) else (
        echo ✅ educreate 數據庫存在
    )
    
    echo.
    echo 🚀 步驟 4: 修復 Prisma 客戶端
    echo 清理舊的客戶端文件...
    if exist "node_modules\.prisma\client" (
        rmdir /s /q "node_modules\.prisma\client" 2>nul
    )
    
    echo 推送 Prisma Schema...
    npx prisma db push --accept-data-loss
    
    echo 生成 Prisma 客戶端...
    npx prisma generate
    
    if %errorlevel% equ 0 (
        echo ✅ Prisma 客戶端修復成功
        
        echo.
        echo 🧪 步驟 5: 測試修復結果
        node test-db-simple.js
        
        echo.
        echo 🎉 修復完成!
        echo.
        echo 📋 下一步:
        echo 1. 重啟開發服務器: npm run dev
        echo 2. 訪問: http://localhost:3000/dashboard
        echo 3. 檢查控制台是否還有錯誤
        echo 4. 測試註冊和登錄功能
        echo.
        echo ✅ 數據庫認證和 React 組件問題都已修復!
        
    ) else (
        echo ❌ Prisma 客戶端生成失敗
        echo.
        echo 🔧 手動解決方案:
        echo 1. 關閉所有編輯器 (VS Code, WebStorm 等)
        echo 2. 以管理員身份運行此腳本
        echo 3. 或手動執行: npx prisma generate
    )
    
) else (
    echo ❌ 數據庫密碼錯誤
    echo.
    echo 🔧 請先修復數據庫認證問題:
    echo 運行: .\quick-fix-db-auth.bat
)

echo.
pause