/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // 簡化的圖片配置
  images: {
    unoptimized: true,
  },

  // 構建配置
  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  // HTTP 頭配置 - 允許 iframe 嵌入
  async headers() {
    return [
      {
        source: '/games/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self'",
          },
        ],
      },
    ];
  },

  // 靜態文件重寫規則
  async rewrites() {
    return [
      {
        source: '/games/shimozurdo-game',
        destination: '/games/shimozurdo-game/index.html'
      },
      {
        source: '/games/shimozurdo-game/:path*',
        destination: '/games/shimozurdo-game/:path*'
      },
    ];
  },
}

module.exports = nextConfig;
