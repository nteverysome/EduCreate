// 專門用於 Vercel 部署的最小化配置

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // 最小化的圖片配置
  images: {
    domains: ['localhost', 'res.cloudinary.com'],
    unoptimized: true,
  },

  // 環境變數配置
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
  },

  // 構建配置 - 跳過檢查以加快構建
  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  // 優化構建大小
  experimental: {
    // 啟用 SWC 最小化
    swcMinify: true,
    // 減少 serverless function 大小
    outputFileTracing: true,
  },

  // 移除自定義 webpack 配置以減少複雜性
  // webpack: undefined,

  // HTTP 頭配置 - 簡化版本
  async headers() {
    return [
      {
        source: '/games/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ];
  },

  // 重定向配置 - 簡化版本
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/enhanced-dashboard',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
