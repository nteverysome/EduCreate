# 🎨 React 項目初始化

## 🎯 任務目標

建立一個現代化的 React + TypeScript 前端項目，配置所有必要的開發工具和依賴。

## 📋 實施步驟

### 步驟 1: 創建 React 項目

```bash
# 使用 Vite 創建 React + TypeScript 項目
npm create vite@latest wordwall-frontend -- --template react-ts

# 進入項目目錄
cd wordwall-frontend

# 安裝依賴
npm install
```

**執行原理**: Vite 是現代化的前端構建工具，比 Create React App 更快，支持熱模塊替換 (HMR) 和更好的開發體驗。

### 步驟 2: 安裝核心依賴

```bash
# UI 框架和樣式
npm install tailwindcss @tailwindcss/forms @tailwindcss/typography
npm install @headlessui/react @heroicons/react
npm install framer-motion lucide-react

# 路由和狀態管理
npm install react-router-dom @types/react-router-dom
npm install zustand

# HTTP 客戶端和數據獲取
npm install axios @tanstack/react-query

# 表單處理和驗證
npm install react-hook-form @hookform/resolvers
npm install zod

# 工具庫
npm install clsx tailwind-merge
npm install date-fns
npm install react-hot-toast
```

**依賴說明**:
- `tailwindcss`: 原子化 CSS 框架，快速構建 UI
- `@headlessui/react`: 無樣式的可訪問組件庫
- `framer-motion`: 強大的動畫庫
- `zustand`: 輕量級狀態管理
- `@tanstack/react-query`: 服務器狀態管理
- `react-hook-form`: 高性能表單庫
- `zod`: TypeScript 優先的數據驗證

### 步驟 3: 安裝開發依賴

```bash
# 開發工具
npm install -D @types/node
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D prettier eslint-config-prettier eslint-plugin-prettier
npm install -D autoprefixer postcss
npm install -D @vitejs/plugin-react

# 測試工具
npm install -D @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event
npm install -D vitest jsdom
```

### 步驟 4: 配置 Tailwind CSS

```bash
# 初始化 Tailwind CSS
npx tailwindcss init -p
```

**創建 `tailwind.config.js`**:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        secondary: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

**更新 `src/index.css`**:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: 'Inter', system-ui, sans-serif;
  }
  
  body {
    @apply bg-gray-50 text-gray-900;
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors;
  }
  
  .btn-secondary {
    @apply bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-sm border border-gray-200 p-6;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(10px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}
```

### 步驟 5: 配置 ESLint 和 Prettier

**創建 `.eslintrc.json`**:
```json
{
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint", "prettier"],
  "rules": {
    "prettier/prettier": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "react-hooks/exhaustive-deps": "warn"
  },
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  }
}
```

**創建 `.prettierrc`**:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### 步驟 6: 配置項目結構

**創建基礎目錄結構**:
```bash
mkdir -p src/{components,pages,hooks,store,services,types,utils}
mkdir -p src/components/{ui,layout,game}
mkdir -p public/{images,icons,sounds}
```

**創建 `src/types/index.ts`**:
```typescript
// 用戶類型
export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  role: 'student' | 'teacher' | 'admin';
  avatarUrl?: string;
  createdAt: string;
}

// 活動類型
export interface Activity {
  id: string;
  title: string;
  description?: string;
  templateId: string;
  content: Record<string, any>;
  settings: Record<string, any>;
  isPublic: boolean;
  viewCount: number;
  playCount: number;
  createdAt: string;
  updatedAt: string;
}

// 遊戲模板類型
export interface Template {
  id: string;
  name: string;
  type: string;
  description: string;
  iconUrl?: string;
  config: Record<string, any>;
  isPremium: boolean;
}

// API 響應類型
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

// 遊戲狀態類型
export interface GameState {
  id: string;
  activityId: string;
  status: 'waiting' | 'playing' | 'finished';
  currentQuestion?: number;
  score: number;
  timeRemaining?: number;
  answers: Record<string, any>;
}
```

### 步驟 7: 配置環境變量

**創建 `.env.example`**:
```bash
# API 配置
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_WS_URL=ws://localhost:5000

# 第三方服務
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# 功能開關
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_SOCIAL_LOGIN=true
```

**創建 `.env.local`**:
```bash
# 複製 .env.example 並填入實際值
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_WS_URL=ws://localhost:5000
```

### 步驟 8: 更新 Vite 配置

**更新 `vite.config.ts`**:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/store': path.resolve(__dirname, './src/store'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@headlessui/react', 'framer-motion'],
        },
      },
    },
  },
})
```

### 步驟 9: 更新 package.json 腳本

**更新 `package.json`**:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint src --ext ts,tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

## 🧪 測試驗證

### 測試 1: 項目啟動測試
```bash
# 啟動開發服務器
npm run dev

# 預期結果: 
# - 服務器在 http://localhost:3000 啟動
# - 瀏覽器顯示 React 默認頁面
# - 熱重載功能正常
```

### 測試 2: 構建測試
```bash
# 執行生產構建
npm run build

# 預期結果:
# - 構建成功，無錯誤
# - dist 目錄生成
# - 文件正確分塊
```

### 測試 3: 代碼質量測試
```bash
# 運行 ESLint 檢查
npm run lint

# 運行 TypeScript 類型檢查
npm run type-check

# 格式化代碼
npm run format

# 預期結果: 無錯誤和警告
```

### 測試 4: Tailwind CSS 測試

**創建測試組件 `src/components/TestComponent.tsx`**:
```typescript
export const TestComponent = () => {
  return (
    <div className="card">
      <h1 className="text-2xl font-bold text-primary-600 mb-4">
        Wordwall Clone
      </h1>
      <button className="btn-primary mr-2">
        Primary Button
      </button>
      <button className="btn-secondary">
        Secondary Button
      </button>
    </div>
  );
};
```

**在 `src/App.tsx` 中測試**:
```typescript
import { TestComponent } from './components/TestComponent';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <TestComponent />
    </div>
  );
}

export default App;
```

## 📊 完成檢查清單

- [ ] ✅ React + TypeScript 項目創建成功
- [ ] ✅ 所有依賴安裝完成
- [ ] ✅ Tailwind CSS 配置正確
- [ ] ✅ ESLint 和 Prettier 配置完成
- [ ] ✅ 項目結構創建完成
- [ ] ✅ 環境變量配置完成
- [ ] ✅ Vite 配置優化完成
- [ ] ✅ 開發服務器正常啟動
- [ ] ✅ 生產構建成功
- [ ] ✅ 代碼質量檢查通過
- [ ] ✅ 樣式系統正常工作

## 🔧 故障排除

### 問題 1: 依賴安裝失敗
```bash
# 清除 npm 緩存
npm cache clean --force

# 刪除 node_modules 重新安裝
rm -rf node_modules package-lock.json
npm install
```

### 問題 2: TypeScript 類型錯誤
```bash
# 檢查 TypeScript 配置
npx tsc --showConfig

# 更新類型定義
npm update @types/react @types/react-dom
```

### 問題 3: Tailwind 樣式不生效
```bash
# 檢查 PostCSS 配置
cat postcss.config.js

# 重新構建 CSS
npm run build
```

---

**狀態**: ⏳ 計劃中
**負責人**: 前端工程師
**預計完成**: 第 3 天
**依賴項**: 數據庫設計完成
**下一步**: UI 組件開發
