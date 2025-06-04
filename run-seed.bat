@echo off
echo ========================================
echo 執行資料庫 Seed 腳本
echo ========================================
echo.

echo 1. 檢查 Node.js 和 npm...
node --version
npm --version
echo.

echo 2. 安裝缺少的類型定義...
npm install --save-dev @types/bcryptjs
echo.

echo 3. 生成 Prisma Client...
npx prisma generate
echo.

echo 4. 推送資料庫 schema...
npx prisma db push
echo.

echo 5. 執行 seed 腳本...
npx prisma db seed
echo.

if %ERRORLEVEL% EQU 0 (
    echo ✅ Seed 執行成功！
    echo.
    echo 測試帳號已建立：
    echo - admin@example.com (密碼: password123)
    echo - user@example.com (密碼: password123)
    echo - premium@example.com (密碼: password123)
) else (
    echo ❌ Seed 執行失敗，錯誤代碼: %ERRORLEVEL%
    echo.
    echo 可能的解決方案：
    echo 1. 確認 PostgreSQL 服務正在運行
    echo 2. 檢查 .env 檔案中的 DATABASE_URL
    echo 3. 執行 npx prisma db push
    echo 4. 檢查 TypeScript 編譯錯誤
)

echo.
echo ========================================
pause