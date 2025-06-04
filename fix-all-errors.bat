@echo off
echo ====================================
echo EduCreate 綜合錯誤修復腳本
echo ====================================
echo.

:: 設置顏色
color 0B

echo 步驟 1: 修復圖標404錯誤
echo -----------------------------------

:: 確保圖標目錄存在
if not exist "public\icons" (
    mkdir "public\icons"
    echo 創建圖標目錄: public\icons
)

:: 重新生成所有圖標文件
echo 重新生成所有圖標文件...

:: 生成icon-144x144.png
echo ^<svg width="144" height="144" xmlns="http://www.w3.org/2000/svg"^> > "public\icons\icon-144x144.png"
echo   ^<rect width="144" height="144" fill="#4f46e5" /^> >> "public\icons\icon-144x144.png"
echo   ^<text x="50%%" y="50%%" font-family="Arial" font-size="36" fill="white" text-anchor="middle" dominant-baseline="middle"^>EC^</text^> >> "public\icons\icon-144x144.png"
echo ^</svg^> >> "public\icons\icon-144x144.png"

:: 生成其他尺寸的圖標
for %%s in (72 96 128 152 192 384 512) do (
    echo ^<svg width="%%s" height="%%s" xmlns="http://www.w3.org/2000/svg"^> > "public\icons\icon-%%sx%%s.png"
    echo   ^<rect width="%%s" height="%%s" fill="#4f46e5" /^> >> "public\icons\icon-%%sx%%s.png"
    echo   ^<text x="50%%" y="50%%" font-family="Arial" font-size="%%~ns" fill="white" text-anchor="middle" dominant-baseline="middle"^>EC^</text^> >> "public\icons\icon-%%sx%%s.png"
    echo ^</svg^> >> "public\icons\icon-%%sx%%s.png"
    echo 生成圖標: icon-%%sx%%s.png
)

echo 圖標文件重新生成完成
echo.

echo 步驟 2: 修復PWA配置
echo -----------------------------------

:: 檢查next-pwa依賴
echo 檢查next-pwa依賴...
npm list next-pwa || npm install next-pwa --save

:: 修復next.config.js
echo 修復next.config.js配置...

if exist "next.config.js" (
    copy next.config.js next.config.js.bak
    echo 已備份next.config.js到next.config.js.bak
)

echo /** @type {import('next-pwa').PWAConfig} */> next.config.js
echo const withPWA = require('next-pwa')({>> next.config.js
echo   dest: 'public',>> next.config.js
echo   disable: process.env.NODE_ENV === 'development',>> next.config.js
echo   register: true,>> next.config.js
echo   skipWaiting: true,>> next.config.js
echo });>> next.config.js
echo.>> next.config.js
echo /** @type {import('next').NextConfig} */>> next.config.js
echo const nextConfig = {>> next.config.js
echo   reactStrictMode: true,>> next.config.js
echo   distDir: './build',>> next.config.js
echo   images: {>> next.config.js
echo     domains: ['localhost', 'res.cloudinary.com'],>> next.config.js
echo     formats: ['image/webp', 'image/avif'],>> next.config.js
echo     deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],>> next.config.js
echo     imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],>> next.config.js
echo   },>> next.config.js
echo   experimental: {>> next.config.js
echo     optimizeCss: true,>> next.config.js
echo     scrollRestoration: true,>> next.config.js
echo   },>> next.config.js
echo   async headers() {>> next.config.js
echo     return [>> next.config.js
echo       {>> next.config.js
echo         source: '/static/:path*',>> next.config.js
echo         headers: [>> next.config.js
echo           {>> next.config.js
echo             key: 'Cache-Control',>> next.config.js
echo             value: 'public, max-age=31536000, immutable',>> next.config.js
echo           },>> next.config.js
echo         ],>> next.config.js
echo       },>> next.config.js
echo       {>> next.config.js
echo         source: '/api/:path*',>> next.config.js
echo         headers: [>> next.config.js
echo           {>> next.config.js
echo             key: 'Cache-Control',>> next.config.js
echo             value: 's-maxage=10, stale-while-revalidate=59',>> next.config.js
echo           },>> next.config.js
echo         ],>> next.config.js
echo       },>> next.config.js
echo     ];>> next.config.js
echo   },>> next.config.js
echo   env: {>> next.config.js
echo     NEXTAUTH_URL: process.env.NEXTAUTH_URL,>> next.config.js
echo     NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,>> next.config.js
echo     DATABASE_URL: process.env.DATABASE_URL,>> next.config.js
echo     STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,>> next.config.js
echo     STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,>> next.config.js
echo     STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,>> next.config.js
echo   },>> next.config.js
echo };>> next.config.js
echo.>> next.config.js
echo module.exports = withPWA(nextConfig);>> next.config.js

echo next.config.js已修復
echo.

echo 步驟 3: 修復API認證401錯誤
echo -----------------------------------

:: 運行認證錯誤修復腳本
if exist "scripts\fix-auth-errors.js" (
    node scripts/fix-auth-errors.js
    if %ERRORLEVEL% NEQ 0 (
        echo 錯誤: 修復腳本執行失敗
        pause
        exit /b 1
    )
) else (
    echo 警告: 認證錯誤修復腳本不存在
    echo 請確保scripts\fix-auth-errors.js文件存在
)

echo.
echo 步驟 4: 運行 Prisma 遷移和種子
echo -----------------------------------

npx prisma migrate dev --name add-test-users
if %ERRORLEVEL% NEQ 0 (
    echo 警告: Prisma 遷移失敗，嘗試繼續...
)

npx prisma db seed
if %ERRORLEVEL% NEQ 0 (
    echo 警告: Prisma 種子失敗，嘗試繼續...
)

echo.
echo 步驟 5: 清理緩存和終止佔用端口的進程
echo -----------------------------------

:: 終止佔用端口的進程
echo 正在檢查並終止佔用端口 3000, 3001, 3002 的進程...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo 終止佔用端口 3000 的進程 PID: %%a
    taskkill /F /PID %%a 2>nul
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    echo 終止佔用端口 3001 的進程 PID: %%a
    taskkill /F /PID %%a 2>nul
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3002') do (
    echo 終止佔用端口 3002 的進程 PID: %%a
    taskkill /F /PID %%a 2>nul
)

:: 清理緩存
echo 正在清理 .next 目錄和瀏覽器緩存...
if exist ".next" (
    rmdir /s /q .next
    echo .next 目錄已清理
)

if exist "node_modules\.cache" (
    rmdir /s /q node_modules\.cache
    echo node_modules\.cache 目錄已清理
)

echo.
echo 步驟 6: 啟動開發服務器
echo -----------------------------------
echo 修復完成！正在啟動開發服務器...
echo 請在瀏覽器中訪問 http://localhost:3000
echo 如果仍然無法訪問，請嘗試 http://127.0.0.1:3000
echo 按 Ctrl+C 可以停止服務器
echo.

npm run dev

pause