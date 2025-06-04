@echo off
chcp 65001 >nul
echo.
echo ==========================================
echo    EduCreate 註冊問題修復工具
echo ==========================================
echo.

echo 🔍 檢查Node.js和npm...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未找到Node.js，請先安裝Node.js
    echo 下載地址: https://nodejs.org/
    pause
    exit /b 1
)

npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未找到npm，請檢查Node.js安裝
    pause
    exit /b 1
)

echo ✅ Node.js和npm檢查通過
echo.

echo 🚀 開始修復註冊問題...
node fix-register-issues.js

echo.
echo ==========================================
echo 🎯 修復完成！接下來的步驟:
echo ==========================================
echo.
echo 1. 確保PostgreSQL服務正在運行
echo 2. 在新的命令提示符中運行: npm run dev
echo 3. 打開瀏覽器訪問: http://localhost:3000/register
echo 4. 測試註冊功能
echo.
echo 💡 常見問題解決:
echo - 如果數據庫連接失敗，請檢查PostgreSQL服務
echo - 如果端口被占用，請關閉其他應用或更改端口
echo - 如果依然有問題，請檢查瀏覽器控制台錯誤
echo.
echo 📚 相關文檔:
echo - Next.js: https://nextjs.org/docs
echo - Prisma: https://www.prisma.io/docs
echo - NextAuth: https://next-auth.js.org/
echo.
pause