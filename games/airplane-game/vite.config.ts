import { defineConfig } from 'vite';

export default defineConfig({
  // 設置基礎路徑，用於部署到 Next.js public 目錄
  base: '/games/airplane-game/',
  
  // 構建配置
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    
    // Rollup 配置
    rollupOptions: {
      output: {
        // 動態文件名包含版本哈希
        entryFileNames: 'main-[hash].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',

        // 手動代碼分割以優化 chunk 大小
        manualChunks: {
          // 將 Phaser 分離為獨立 chunk
          phaser: ['phaser'],
          // 將遊戲場景分離
          scenes: ['./src/scenes/GameScene'],
          // 將管理器分離
          managers: ['./src/managers/GEPTManager', './src/managers/MemoryEnhancementEngine', './src/managers/CollisionDetectionSystem'],
        },
      },
    },

    // 增加 chunk 大小警告限制
    chunkSizeWarningLimit: 1000,
    
    // 目標瀏覽器
    target: 'es2020',
    
    // 最小化配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // 保留 console.log 用於調試
      },
    },
  },
  
  // 開發服務器配置
  server: {
    port: 3001,
    host: true,
    open: false,
    cors: true,
  },
  
  // 預覽服務器配置
  preview: {
    port: 3002,
    host: true,
  },
  
  // 解析配置
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  
  // 定義全局變量
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
});
