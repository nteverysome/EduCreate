import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // 開發服務器配置
  server: {
    host: 'localhost',
    port: 3000,
    open: true,
    cors: true,
    hmr: {
      port: 3001,
      overlay: true // 顯示錯誤覆蓋層
    },
    // 開發中間件
    middlewareMode: false,
    fs: {
      strict: false // 允許訪問工作區外的文件
    }
  },
  
  // 建置配置
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',
    target: 'es2020',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        manualChunks: {
          // 將 Phaser 單獨打包
          phaser: ['phaser'],
          // 將遊戲邏輯單獨打包
          game: [
            './src/game/scenes/GameScene.ts',
            './src/game/scenes/MenuScene.ts',
            './src/game/scenes/LoadingScene.ts'
          ],
          // 將飛機系統單獨打包
          planes: [
            './src/planes/PlaneManager.ts',
            './src/planes/PlaneRenderer.ts'
          ]
        }
      }
    }
  },
  
  // 路徑別名
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@game': resolve(__dirname, 'src/game'),
      '@planes': resolve(__dirname, 'src/planes'),
      '@ui': resolve(__dirname, 'src/ui'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@types': resolve(__dirname, 'src/types'),
      '@assets': resolve(__dirname, 'public/assets')
    }
  },
  
  // 資源處理
  assetsInclude: [
    '**/*.png',
    '**/*.jpg',
    '**/*.jpeg',
    '**/*.gif',
    '**/*.svg',
    '**/*.mp3',
    '**/*.wav',
    '**/*.ogg',
    '**/*.json'
  ],
  
  // CSS 配置
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  },
  
  // 插件配置
  plugins: [
    // 自定義插件：資源路徑處理
    {
      name: 'asset-path-resolver',
      configureServer(server) {
        server.middlewares.use('/assets', (_req, _res, next) => {
          // 處理資源路徑
          next();
        });
      }
    }
  ],
  
  // 優化配置
  optimizeDeps: {
    include: [
      'phaser'
    ],
    exclude: [
      // 排除不需要預構建的依賴
    ]
  },
  
  // 環境變數
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __PROD__: JSON.stringify(process.env.NODE_ENV === 'production'),
    __VERSION__: JSON.stringify(process.env.npm_package_version)
  },
  
  // 預覽配置（用於生產環境預覽）
  preview: {
    host: 'localhost',
    port: 3000,
    open: true
  }
});
