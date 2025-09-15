// Sentry integration removed; pass-through wrapper
const withSentryConfig = (cfg) => cfg;

/** @type {import('next-pwa').PWAConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'cloudinary-images',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 天
        },
      },
    },
    {
      urlPattern: /\/api\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'apis',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 5, // 5 分鐘
        },
        networkTimeoutSeconds: 10,
      },
    },
  ],
});

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
    FORCE_REBUILD: '2025-08-07-16-13',
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
        source: '/unified-content-manager',
        destination: '/unified-content-manager.html'
      },
      {
        source: '/games/airplane-game',
        destination: '/games/airplane-game/index.html'
      },
      {
        source: '/games/airplane-game/:path*',
        destination: '/games/airplane-game/:path*'
      },
      {
        source: '/games/shimozurdo-game',
        destination: '/games/shimozurdo-game/index.html'
      },
      {
        source: '/games/shimozurdo-game/:path*',
        destination: '/games/shimozurdo-game/:path*'
      },
      // Reports API mapping (HTML index + all assets)
      {
        source: '/_reports',
        destination: '/api/_reports/index.html'
      },
      {
        source: '/_reports/:path*',
        destination: '/api/_reports/:path*'
      },
      // Back-compat: allow direct /current, /reports, /EduCreate-Test-Videos to resolve via the same API
      {
        source: '/current/:path*',
        destination: '/api/_reports/current/:path*'
      },
      {
        source: '/reports/:path*',
        destination: '/api/_reports/:path*'
      },
      {
        source: '/EduCreate-Test-Videos/:path*',
        destination: '/api/_reports/:path*'
      },
      // Daily reports and dashboard direct access
      {
        source: '/daily/:path*',
        destination: '/api/_reports/daily/:path*'
      },
      {
        source: '/dashboard/:path*',
        destination: '/api/_reports/dashboard/:path*'
      }
    ];
  },
}

module.exports = withPWA(nextConfig);