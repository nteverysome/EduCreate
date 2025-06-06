/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Vercel 部署優化 - 移除自定義構建目錄
  // distDir: './build', // 使用 Vercel 默認構建目錄
  
  // 啟用圖片優化
  images: {
    domains: ['localhost', 'res.cloudinary.com', 'edu-create.vercel.app'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // 啟用代碼分割和懶加載
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  
  // 配置緩存策略
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
  
  // Vercel 環境變數配置 (移除 NODE_ENV，Next.js 自動處理)
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
  },
  
  // 輸出配置 - Vercel 自動處理
  // output: 'standalone', // 註釋掉，讓 Vercel 自動處理
  
  // 構建配置
  typescript: {
    // 在構建時忽略 TypeScript 錯誤（我們已經修復了所有錯誤）
    ignoreBuildErrors: false,
  },
  
  eslint: {
    // 在構建時忽略 ESLint 錯誤
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig