/** @type {import('next').NextConfig} */ 
const nextConfig = { 
  reactStrictMode: true, 
  // 更改輸出目錄位置，避免權限問�?
  distDir: './build', 
  // 啟用圖片優化 
  images: { 
    domains: ['localhost', 'res.cloudinary.com'], 
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
  env: { 
    NEXTAUTH_URL: process.env.NEXTAUTH_URL, 
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET, 
    DATABASE_URL: process.env.DATABASE_URL, 
    STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY, 
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY, 
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET, 
  }, 
} 
 
module.exports = nextConfig 
