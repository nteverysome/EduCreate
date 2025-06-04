@echo off
echo ===================================
echo EduCreate PWA依賴修復腳本
echo ===================================
echo.

:: 設置顏色
color 0A

echo 步驟 1: 安裝缺失的next-pwa依賴
echo -----------------------------------
echo 正在安裝next-pwa依賴...
npm install next-pwa --save

if %ERRORLEVEL% NEQ 0 (
    echo 錯誤: next-pwa安裝失敗
    echo 嘗試使用yarn安裝...
    yarn add next-pwa
    
    if %ERRORLEVEL% NEQ 0 (
        echo 錯誤: yarn安裝也失敗，請手動安裝next-pwa
        pause
        exit /b 1
    )
)

echo.
echo 步驟 2: 修復next.config.js配置
echo -----------------------------------
echo 正在備份並修復next.config.js...

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
echo 步驟 3: 清理緩存
echo -----------------------------------
echo 正在清理.next目錄和node_modules/.cache...

if exist ".next" (
    rmdir /s /q .next
    echo .next目錄已清理
)

if exist "node_modules\.cache" (
    rmdir /s /q node_modules\.cache
    echo node_modules\.cache目錄已清理
)

echo.
echo 修復完成！請運行以下命令啟動開發服務器：
echo npm run dev
echo.
echo 如果仍然無法訪問，請嘗試使用http://127.0.0.1:3000而不是localhost

pause