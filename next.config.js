// 簡化的 Next.js 配置（移除 PWA 支援）

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

  // Webpack 配置 - 外部化大型依賴到 CDN
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 只在客戶端構建時外部化這些依賴
      config.externals = {
        ...config.externals,
        // 注意：React 和 React-DOM 由 Next.js 管理，不建議外部化
        // 'react': 'React',
        // 'react-dom': 'ReactDOM',
      };
    }
    return config;
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
      {
        source: '/games/starshake-game',
        destination: '/games/starshake-game/dist/index.html'
      },
      {
        source: '/games/starshake-game/dist',
        destination: '/games/starshake-game/dist/index.html'
      },
      {
        source: '/games/starshake-game/dist/',
        destination: '/games/starshake-game/dist/index.html'
      },
      {
        source: '/games/starshake-game/:path*',
        destination: '/games/starshake-game/:path*'
      },
      {
        source: '/games/runner-game',
        destination: '/games/runner-game/dist/index.html'
      },
      {
        source: '/games/runner-game/dist',
        destination: '/games/runner-game/dist/index.html'
      },
      {
        source: '/games/runner-game/dist/',
        destination: '/games/runner-game/dist/index.html'
      },
      {
        source: '/games/runner-game/:path*',
        destination: '/games/runner-game/:path*'
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

module.exports = nextConfig;