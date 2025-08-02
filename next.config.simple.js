/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // 圖片優化配置
  images: {
    domains: ['localhost', 'res.cloudinary.com', 'edu-create.vercel.app'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // 實驗性功能
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  
  // TypeScript 配置
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // ESLint 配置
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig