# EduCreate 綜合錯誤修復腳本 (PowerShell版本)

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "EduCreate 綜合錯誤修復腳本" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "步驟 1: 修復圖標404錯誤" -ForegroundColor Yellow
Write-Host "-----------------------------------"

# 確保圖標目錄存在
if (-not (Test-Path "public\icons")) {
    New-Item -Path "public\icons" -ItemType Directory -Force | Out-Null
    Write-Host "創建圖標目錄: public\icons" -ForegroundColor Green
}

# 重新生成所有圖標文件
Write-Host "重新生成所有圖標文件..." -ForegroundColor Green

# 生成icon-144x144.png
$svg144 = @"
<svg width="144" height="144" xmlns="http://www.w3.org/2000/svg">
  <rect width="144" height="144" fill="#4f46e5" />
  <text x="50%" y="50%" font-family="Arial" font-size="36" fill="white" text-anchor="middle" dominant-baseline="middle">EC</text>
</svg>
"@

Set-Content -Path "public\icons\icon-144x144.png" -Value $svg144
Write-Host "生成圖標: icon-144x144.png" -ForegroundColor Green

# 生成其他尺寸的圖標
$sizes = @(72, 96, 128, 152, 192, 384, 512)
foreach ($size in $sizes) {
    $fontSize = [Math]::Floor($size / 4)
    $svgContent = @"
<svg width="$size" height="$size" xmlns="http://www.w3.org/2000/svg">
  <rect width="$size" height="$size" fill="#4f46e5" />
  <text x="50%" y="50%" font-family="Arial" font-size="$fontSize" fill="white" text-anchor="middle" dominant-baseline="middle">EC</text>
</svg>
"@
    
    Set-Content -Path "public\icons\icon-${size}x${size}.png" -Value $svgContent
    Write-Host "生成圖標: icon-${size}x${size}.png" -ForegroundColor Green
}

Write-Host "圖標文件重新生成完成" -ForegroundColor Green
Write-Host ""

Write-Host "步驟 2: 修復PWA配置" -ForegroundColor Yellow
Write-Host "-----------------------------------"

# 檢查next-pwa依賴
Write-Host "檢查next-pwa依賴..." -ForegroundColor Green
npm list next-pwa
if ($LASTEXITCODE -ne 0) {
    Write-Host "安裝next-pwa依賴..." -ForegroundColor Yellow
    npm install next-pwa --save
}

# 修復next.config.js
Write-Host "修復next.config.js配置..." -ForegroundColor Green

if (Test-Path "next.config.js") {
    Copy-Item -Path "next.config.js" -Destination "next.config.js.bak" -Force
    Write-Host "已備份next.config.js到next.config.js.bak" -ForegroundColor Green
}

$nextConfigContent = @"
/** @type {import('next-pwa').PWAConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: './build',
  images: {
    domains: ['localhost', 'res.cloudinary.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  async headers() {
    return [
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=10, stale-while-revalidate=59',
          },
        ],
      },
    ];
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  },
};

module.exports = withPWA(nextConfig);
"@

Set-Content -Path "next.config.js" -Value $nextConfigContent
Write-Host "next.config.js已修復" -ForegroundColor Green
Write-Host ""

Write-Host "步驟 3: 修復API認證401錯誤" -ForegroundColor Yellow
Write-Host "-----------------------------------"

# 運行認證錯誤修復腳本
if (Test-Path "scripts\fix-auth-errors.js") {
    Write-Host "運行認證錯誤修復腳本..." -ForegroundColor Green
    node scripts/fix-auth-errors.js
    if ($LASTEXITCODE -ne 0) {
        Write-Host "錯誤: 修復腳本執行失敗" -ForegroundColor Red
        Read-Host "按Enter繼續"
        exit 1
    }
} else {
    Write-Host "警告: 認證錯誤修復腳本不存在" -ForegroundColor Yellow
    Write-Host "請確保scripts\fix-auth-errors.js文件存在" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "步驟 4: 運行 Prisma 遷移和種子" -ForegroundColor Yellow
Write-Host "-----------------------------------"

Write-Host "運行Prisma遷移..." -ForegroundColor Green
npx prisma migrate dev --name add-test-users
if ($LASTEXITCODE -ne 0) {
    Write-Host "警告: Prisma 遷移失敗，嘗試繼續..." -ForegroundColor Yellow
}

Write-Host "運行Prisma種子..." -ForegroundColor Green
npx prisma db seed
if ($LASTEXITCODE -ne 0) {
    Write-Host "警告: Prisma 種子失敗，嘗試繼續..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "步驟 5: 清理緩存和終止佔用端口的進程" -ForegroundColor Yellow
Write-Host "-----------------------------------"

# 終止佔用端口的進程
Write-Host "正在檢查並終止佔用端口 3000, 3001, 3002 的進程..." -ForegroundColor Green

$ports = @(3000, 3001, 3002)
foreach ($port in $ports) {
    $processes = netstat -ano | Select-String ":$port" | ForEach-Object { $_ -match '\s+(\d+)$' | Out-Null; $matches[1] }
    foreach ($process in $processes) {
        Write-Host "終止佔用端口 $port 的進程 PID: $process" -ForegroundColor Yellow
        Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
    }
}

# 清理緩存
Write-Host "正在清理 .next 目錄和瀏覽器緩存..." -ForegroundColor Green
if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force
    Write-Host ".next 目錄已清理" -ForegroundColor Green
}

if (Test-Path "node_modules\.cache") {
    Remove-Item -Path "node_modules\.cache" -Recurse -Force
    Write-Host "node_modules\.cache 目錄已清理" -ForegroundColor Green
}

Write-Host ""
Write-Host "步驟 6: 啟動開發服務器" -ForegroundColor Yellow
Write-Host "-----------------------------------"
Write-Host "修復完成！正在啟動開發服務器..." -ForegroundColor Green
Write-Host "請在瀏覽器中訪問 http://localhost:3000" -ForegroundColor Cyan
Write-Host "如果仍然無法訪問，請嘗試 http://127.0.0.1:3000" -ForegroundColor Cyan
Write-Host "按 Ctrl+C 可以停止服務器" -ForegroundColor Cyan
Write-Host ""

npm run dev

Read-Host "按Enter退出"