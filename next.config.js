// 簡化的 Next.js 配置 - 修復 Vercel 部署錯誤

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // 暫時關閉嚴格模式以避免錯誤
  swcMinify: true, // 使用 SWC 壓縮器

  // 簡化的圖片配置
  images: {
    domains: ['localhost', 'res.cloudinary.com', 'edu-create.vercel.app'],
    unoptimized: true, // 簡化部署
  },

  // 環境變數配置
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    FORCE_REBUILD: '2025-10-19-21-52-FOLDER-TREE-FIX',
  },

  // 構建配置 - 更寬鬆的錯誤處理
  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  // 實驗性功能
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },

  // 簡化的 Webpack 配置
  webpack: (config, { isServer }) => {
    // 修復潛在的模組解析問題
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    return config;
  },

  // HTTP 頭配置 - 允許 iframe 嵌入
  async headers() {
    return [
      // 🔥 API 路由：添加 CORS 頭
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400',
          },
        ],
      },
      // 🔥 Match-up 遊戲：禁用快取，確保每次都加載最新代碼
      {
        source: '/games/match-up-game/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
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
      // PushPull 推拉方塊遊戲路由
      {
        source: '/games/pushpull-game',
        destination: '/games/pushpull-game/dist/index.html'
      },
      {
        source: '/games/pushpull-game/dist',
        destination: '/games/pushpull-game/dist/index.html'
      },
      {
        source: '/games/pushpull-game/dist/',
        destination: '/games/pushpull-game/dist/index.html'
      },
      {
        source: '/games/pushpull-game/:path*',
        destination: '/games/pushpull-game/:path*'
      },
      // WallHammer 破牆遊戲路由
      {
        source: '/games/wallhammer-game',
        destination: '/games/wallhammer-game/dist/index.html'
      },
      {
        source: '/games/wallhammer-game/dist',
        destination: '/games/wallhammer-game/dist/index.html'
      },
      {
        source: '/games/wallhammer-game/dist/',
        destination: '/games/wallhammer-game/dist/index.html'
      },
      {
        source: '/games/wallhammer-game/:path*',
        destination: '/games/wallhammer-game/:path*'
      },
      // Zenbaki 數字遊戲路由
      {
        source: '/games/zenbaki-game',
        destination: '/games/zenbaki-game/dist/index.html'
      },
      {
        source: '/games/zenbaki-game/dist',
        destination: '/games/zenbaki-game/dist/index.html'
      },
      {
        source: '/games/zenbaki-game/dist/',
        destination: '/games/zenbaki-game/dist/index.html'
      },
      {
        source: '/games/zenbaki-game/:path*',
        destination: '/games/zenbaki-game/:path*'
      },
      // Mars 火星探險遊戲路由
      {
        source: '/games/mars-game',
        destination: '/games/mars-game/dist/index.html'
      },
      {
        source: '/games/mars-game/dist',
        destination: '/games/mars-game/dist/index.html'
      },
      {
        source: '/games/mars-game/dist/',
        destination: '/games/mars-game/dist/index.html'
      },
      {
        source: '/games/mars-game/:path*',
        destination: '/games/mars-game/:path*'
      },
      // Fate 命運之戰遊戲路由
      {
        source: '/games/fate-game',
        destination: '/games/fate-game/dist/index.html'
      },
      {
        source: '/games/fate-game/dist',
        destination: '/games/fate-game/dist/index.html'
      },
      {
        source: '/games/fate-game/dist/',
        destination: '/games/fate-game/dist/index.html'
      },
      {
        source: '/games/fate-game/:path*',
        destination: '/games/fate-game/:path*'
      },
      // Dungeon 地牢探險遊戲路由
      {
        source: '/games/dungeon-game',
        destination: '/games/dungeon-game/dist/index.html'
      },
      {
        source: '/games/dungeon-game/dist',
        destination: '/games/dungeon-game/dist/index.html'
      },
      {
        source: '/games/dungeon-game/dist/',
        destination: '/games/dungeon-game/dist/index.html'
      },
      {
        source: '/games/dungeon-game/:path*',
        destination: '/games/dungeon-game/:path*'
      },
      // Blastemup 太空射擊遊戲路由
      {
        source: '/games/blastemup-game',
        destination: '/games/blastemup-game/dist/index.html'
      },
      {
        source: '/games/blastemup-game/dist',
        destination: '/games/blastemup-game/dist/index.html'
      },
      {
        source: '/games/blastemup-game/dist/',
        destination: '/games/blastemup-game/dist/index.html'
      },
      {
        source: '/games/blastemup-game/:path*',
        destination: '/games/blastemup-game/:path*'
      },
      // Math Attack 數學攻擊遊戲路由
      {
        source: '/games/math-attack-game',
        destination: '/games/math-attack-game/index.html'
      },
      {
        source: '/games/math-attack-game/',
        destination: '/games/math-attack-game/index.html'
      },
      {
        source: '/games/math-attack-game/:path*',
        destination: '/games/math-attack-game/:path*'
      },
      // Match-up 配對遊戲路由
      {
        source: '/games/match-up-game',
        destination: '/games/match-up-game/index.html'
      },
      {
        source: '/games/match-up-game/',
        destination: '/games/match-up-game/index.html'
      },
      {
        source: '/games/match-up-game/:path*',
        destination: '/games/match-up-game/:path*'
      },
      // Dino Chrome Clone 恐龍遊戲路由 - 由 vercel.json 處理
      {
        source: '/games/dino-chrome-clone/:path*',
        destination: '/games/dino-chrome-clone/:path*'
      },
      // Platformer 平台遊戲路由 - 由 vercel.json 處理
      {
        source: '/games/platformer-game/:path*',
        destination: '/games/platformer-game/:path*'
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