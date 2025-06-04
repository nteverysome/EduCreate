@echo off
echo ========================================
echo NextAuth 設定與除錯腳本
echo ========================================
echo.

echo 1. 檢查 Node.js 版本...
node --version
echo.

echo 2. 檢查 npm 版本...
npm --version
echo.

echo 3. 安裝/更新依賴...
npm install
echo.

echo 4. 生成 Prisma Client...
npx prisma generate
echo.

echo 5. 推送資料庫 schema...
npx prisma db push
echo.

echo 6. 執行資料庫 seed...
npx prisma db seed
echo.

echo 7. 執行診斷腳本...
node quick-auth-diagnosis.js
echo.

echo 8. 啟動開發服務器...
echo 請在新的終端視窗執行: npm run dev
echo 然後訪問: http://localhost:3000/login
echo.
echo 測試帳號:
echo Email: admin@example.com
echo Password: password123
echo.
echo ========================================
echo 設定完成！請檢查上方輸出是否有錯誤。
echo ========================================
pause