@echo off
echo ========================================
echo 修復 NextAuth 401 錯誤診斷工具
echo ========================================
echo.

echo 1. 檢查 Node.js 版本...
node --version
echo.

echo 2. 檢查 npm 版本...
npm --version
echo.

echo 3. 檢查環境變數...
echo NEXTAUTH_URL=%NEXTAUTH_URL%
echo NEXTAUTH_SECRET=%NEXTAUTH_SECRET%
echo DATABASE_URL=%DATABASE_URL%
echo.

echo 4. 生成 Prisma Client...
npx prisma generate
echo.

echo 5. 檢查資料庫連接...
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.$connect().then(() => { console.log('✅ 資料庫連接成功'); return prisma.user.count(); }).then(count => { console.log('用戶數量:', count); if(count === 0) console.log('⚠️ 需要執行 seed'); }).catch(err => console.error('❌ 資料庫錯誤:', err.message)).finally(() => prisma.$disconnect());"
echo.

echo 6. 常見 401 錯誤解決方案:
echo - 確認測試用戶已創建 (執行 npx prisma db seed)
echo - 檢查密碼是否正確 (password123)
echo - 確認 NEXTAUTH_SECRET 已設定
echo - 檢查 credentials provider 配置
echo.

echo 7. 測試帳號:
echo 管理員: admin@example.com / password123
echo 普通用戶: user@example.com / password123
echo 高級用戶: premium@example.com / password123
echo.

echo ========================================
echo 診斷完成！如果問題持續，請檢查:
echo 1. PostgreSQL 服務是否運行
echo 2. 資料庫是否包含測試用戶
echo 3. NextAuth 配置是否正確
echo ========================================
pause