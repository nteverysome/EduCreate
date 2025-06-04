@echo off
echo ===================================
echo EduCreate 服務器啟動修復腳本
echo ===================================
echo.

:: 設置顏色
color 0A

echo 步驟 1: 終止可能佔用端口的進程
echo -----------------------------------
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

echo.
echo 步驟 2: 安裝缺失的依賴
echo -----------------------------------
echo 正在安裝 next-pwa 依賴...
npm install next-pwa --save

echo.
echo 步驟 3: 清理臨時文件和緩存
echo -----------------------------------
echo 正在清理 .next 目錄和 node_modules/.cache...

if exist ".next" (
    rmdir /s /q .next
    echo .next 目錄已清理
)

if exist "node_modules\.cache" (
    rmdir /s /q node_modules\.cache
    echo node_modules\.cache 目錄已清理
)

echo.
echo 步驟 4: 修復 next.config.js
echo -----------------------------------
echo 正在備份並修復 next.config.js...

if exist "next.config.js" (
    copy next.config.js next.config.js.bak
    echo 已備份 next.config.js 到 next.config.js.bak
)

echo const withPWA = require('next-pwa')({> next.config.temp
echo   dest: 'public',>> next.config.temp
echo   disable: process.env.NODE_ENV === 'development',>> next.config.temp
echo   register: true,>> next.config.temp
echo   skipWaiting: true,>> next.config.temp
echo });>> next.config.temp
echo.>> next.config.temp
echo /** @type {import('next').NextConfig} */>> next.config.temp
echo const nextConfig = {>> next.config.temp
echo   reactStrictMode: true,>> next.config.temp
echo   distDir: './build',>> next.config.temp
echo   images: {>> next.config.temp
echo     domains: ['localhost', 'res.cloudinary.com'],>> next.config.temp
echo     formats: ['image/webp', 'image/avif'],>> next.config.temp
echo     deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],>> next.config.temp
echo     imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],>> next.config.temp
echo   },>> next.config.temp
echo   experimental: {>> next.config.temp
echo     optimizeCss: true,>> next.config.temp
echo     scrollRestoration: true,>> next.config.temp
echo   },>> next.config.temp
echo   async headers() {>> next.config.temp
echo     return [>> next.config.temp
echo       {>> next.config.temp
echo         source: '/static/:path*',>> next.config.temp
echo         headers: [>> next.config.temp
echo           {>> next.config.temp
echo             key: 'Cache-Control',>> next.config.temp
echo             value: 'public, max-age=31536000, immutable',>> next.config.temp
echo           },>> next.config.temp
echo         ],>> next.config.temp
echo       },>> next.config.temp
echo       {>> next.config.temp
echo         source: '/api/:path*',>> next.config.temp
echo         headers: [>> next.config.temp
echo           {>> next.config.temp
echo             key: 'Cache-Control',>> next.config.temp
echo             value: 's-maxage=10, stale-while-revalidate=59',>> next.config.temp
echo           },>> next.config.temp
echo         ],>> next.config.temp
echo       },>> next.config.temp
echo     ];>> next.config.temp
echo   },>> next.config.temp
echo   env: {>> next.config.temp
echo     NEXTAUTH_URL: process.env.NEXTAUTH_URL,>> next.config.temp
echo     NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,>> next.config.temp
echo     DATABASE_URL: process.env.DATABASE_URL,>> next.config.temp
echo     STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,>> next.config.temp
echo     STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,>> next.config.temp
echo     STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,>> next.config.temp
echo   },>> next.config.temp
echo };>> next.config.temp
echo.>> next.config.temp
echo module.exports = withPWA(nextConfig);>> next.config.temp

move /y next.config.temp next.config.js
echo next.config.js 已修復

echo.
echo 步驟 5: 啟動開發服務器
echo -----------------------------------
echo 正在啟動開發服務器，請在瀏覽器中訪問 http://localhost:3000
echo 如果仍然無法訪問，請嘗試 http://127.0.0.1:3000
echo 按 Ctrl+C 可以停止服務器
echo.

npm run dev

pause