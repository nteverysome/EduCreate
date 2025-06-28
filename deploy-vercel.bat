@echo off
echo 🚀 開始 EduCreate Vercel 部署...
echo.

echo 📋 檢查環境...
node --version
npm --version
echo.

echo 🔧 檢查 Vercel CLI...
vercel --version
echo.

echo 📦 確保依賴已安裝...
npm install
echo.

echo 🏗️ 生成 Prisma 客戶端...
npx prisma generate
echo.

echo 🚀 開始部署到 Vercel 生產環境...
vercel --prod

echo.
echo ✅ 部署腳本執行完成！
pause
