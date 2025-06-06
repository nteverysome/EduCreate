/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // 簡化的圖片配置
  images: {
    domains: ['localhost', 'res.cloudinary.com'],
    unoptimized: true, // 簡化部署
  },
  
  // 環境變數配置
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
  },
  
  // 構建配置
  typescript: {
    ignoreBuildErrors: false,
  },
  
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig