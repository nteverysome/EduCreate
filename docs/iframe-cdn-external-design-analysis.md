# iframe + CDN External 設計方案分析 (Vercel)

## 🎯 架構概述

### 當前架構 (Local Development)
```
┌─────────────────┐    iframe    ┌─────────────────┐
│   Next.js App  │ ──────────► │   Vite Game     │
│ localhost:3000  │             │ localhost:3001  │
│                 │◄────────────│                 │
└─────────────────┘  postMessage └─────────────────┘
```

### CDN External 架構 (Production)
```
┌─────────────────┐    iframe    ┌─────────────────┐
│   Next.js App  │ ──────────► │   Vite Game     │
│ vercel.app      │             │ cdn.vercel.app  │
│                 │◄────────────│                 │
└─────────────────┘  postMessage └─────────────────┘
```

## 🚀 CDN External 設計方案

### 方案 1: Vercel Edge Network + 獨立部署

#### 架構設計
```
┌─────────────────────────────────────────────────────────┐
│                    Vercel Platform                      │
├─────────────────────────────────────────────────────────┤
│  Main App (Next.js)                                    │
│  ├── educreat.vercel.app                               │
│  ├── /games/airplane-iframe                            │
│  └── iframe src="https://games.educreat.vercel.app"    │
├─────────────────────────────────────────────────────────┤
│  Games CDN (Vite Static)                               │
│  ├── games.educreat.vercel.app                         │
│  ├── /airplane-game/                                   │
│  ├── /match-game/                                      │
│  └── /quiz-game/                                       │
└─────────────────────────────────────────────────────────┘
```

#### 實現步驟
1. **創建獨立的遊戲部署項目**
2. **配置 Vercel 子域名**
3. **設置 CORS 和安全策略**
4. **優化 CDN 緩存策略**

### 方案 2: Vercel Static Assets + Edge Functions

#### 架構設計
```
┌─────────────────────────────────────────────────────────┐
│                 Vercel Edge Network                     │
├─────────────────────────────────────────────────────────┤
│  Static Assets (/_static/games/)                       │
│  ├── /_static/games/airplane/                          │
│  ├── /_static/games/match/                             │
│  └── Cache-Control: max-age=31536000                   │
├─────────────────────────────────────────────────────────┤
│  Edge Functions (/api/games/)                          │
│  ├── /api/games/airplane/manifest                      │
│  ├── /api/games/match/manifest                         │
│  └── Dynamic game configuration                        │
└─────────────────────────────────────────────────────────┘
```

## 📊 方案比較分析

### 方案 1: 獨立部署 (推薦)

#### ✅ 優勢
- **完全獨立**: 遊戲和主應用分離，互不影響
- **專用優化**: 可針對遊戲進行專門的 CDN 優化
- **版本控制**: 遊戲可獨立版本發布
- **擴展性**: 支援多個遊戲項目
- **成本效益**: Vercel 免費層支援多個項目

#### ⚠️ 挑戰
- **CORS 配置**: 需要正確配置跨域策略
- **部署複雜性**: 需要管理多個部署流程
- **域名管理**: 需要配置子域名

#### 💰 成本分析
```
Vercel Pro Plan ($20/月):
├── 主應用: educreat.vercel.app
├── 遊戲 CDN: games.educreat.vercel.app  
├── 帶寬: 1TB/月 (通常足夠)
└── Edge Functions: 500GB-hours/月
```

### 方案 2: 靜態資源 + Edge Functions

#### ✅ 優勢
- **單一部署**: 所有資源在同一個項目中
- **簡化管理**: 統一的部署和版本控制
- **無 CORS 問題**: 同域名下的資源載入

#### ⚠️ 挑戰
- **構建複雜性**: 需要整合多個構建流程
- **緩存策略**: 需要精細的緩存控制
- **項目大小**: 可能超出 Vercel 項目大小限制

## 🛠️ 技術實現細節

### 1. Vercel 配置 (vercel.json)

#### 主應用配置
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/games/(.*)",
      "dest": "/games/$1"
    }
  ],
  "headers": [
    {
      "source": "/games/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        }
      ]
    }
  ]
}
```

#### 遊戲 CDN 配置
```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/dist/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://educreat.vercel.app"
        },
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 2. 自動化部署流程

#### GitHub Actions 配置
```yaml
name: Deploy Games to CDN
on:
  push:
    paths: ['games/**']
    branches: [main]

jobs:
  deploy-games:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Build Airplane Game
        run: |
          cd games/airplane-game
          npm ci
          npm run build
          
      - name: Deploy to Vercel
        uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_GAMES_PROJECT_ID }}
          working-directory: games/airplane-game/dist
```

### 3. 動態遊戲載入

#### 遊戲配置管理
```typescript
// /api/games/config.ts
export interface GameConfig {
  id: string;
  name: string;
  version: string;
  cdnUrl: string;
  entryPoint: string;
  assets: string[];
  dependencies: string[];
}

export const GAMES_CONFIG: Record<string, GameConfig> = {
  'airplane': {
    id: 'airplane',
    name: 'Airplane Collision Game',
    version: '1.0.0',
    cdnUrl: 'https://games.educreat.vercel.app/airplane',
    entryPoint: '/main-[hash].js',
    assets: ['/assets/backgrounds/', '/assets/sprites/'],
    dependencies: ['phaser']
  }
};
```

#### 動態 iframe 載入
```typescript
// components/games/DynamicGameLoader.tsx
import { useEffect, useState } from 'react';

interface DynamicGameLoaderProps {
  gameId: string;
  onGameReady?: () => void;
}

export default function DynamicGameLoader({ gameId, onGameReady }: DynamicGameLoaderProps) {
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [gameUrl, setGameUrl] = useState<string>('');

  useEffect(() => {
    async function loadGameConfig() {
      try {
        const response = await fetch(`/api/games/${gameId}/config`);
        const config = await response.json();
        setGameConfig(config);
        
        // 構建完整的遊戲 URL
        const fullUrl = `${config.cdnUrl}/index.html?v=${config.version}`;
        setGameUrl(fullUrl);
      } catch (error) {
        console.error('Failed to load game config:', error);
      }
    }

    loadGameConfig();
  }, [gameId]);

  if (!gameUrl) {
    return <div>Loading game configuration...</div>;
  }

  return (
    <GameIframeSimple
      gameUrl={gameUrl}
      title={gameConfig?.name || 'Game'}
      onGameReady={onGameReady}
    />
  );
}
```

## 🔧 優化策略

### 1. CDN 緩存優化

#### 緩存策略
```typescript
// 靜態資源 (JS, CSS, Images)
Cache-Control: public, max-age=31536000, immutable

// HTML 文件
Cache-Control: public, max-age=3600, must-revalidate

// API 響應
Cache-Control: public, max-age=300, s-maxage=3600
```

#### 版本化資源
```typescript
// 自動版本化構建
const buildConfig = {
  entryFileNames: `main-${Date.now()}.js`,
  chunkFileNames: `chunks/[name]-${Date.now()}.js`,
  assetFileNames: `assets/[name]-${Date.now()}.[ext]`
};
```

### 2. 性能監控

#### 載入性能追蹤
```typescript
// 遊戲載入性能監控
export function trackGameLoadPerformance(gameId: string) {
  const startTime = performance.now();
  
  return {
    markLoaded: () => {
      const loadTime = performance.now() - startTime;
      
      // 發送到分析服務
      analytics.track('game_load_time', {
        gameId,
        loadTime,
        timestamp: Date.now()
      });
    }
  };
}
```

## 📈 預期效益

### 性能提升
- **載入速度**: 50-70% 提升 (CDN 邊緣節點)
- **緩存命中率**: 90%+ (靜態資源)
- **全球延遲**: <100ms (Vercel Edge Network)

### 開發效益
- **獨立開發**: 遊戲和主應用可並行開發
- **版本控制**: 遊戲可獨立發布和回滾
- **擴展性**: 支援 25+ 遊戲的架構

### 成本效益
- **帶寬節省**: 60-80% (CDN 緩存)
- **服務器負載**: 降低 70% (靜態資源分離)
- **維護成本**: 降低 40% (自動化部署)

## 🎯 推薦實施方案

### 階段 1: 基礎架構 (1-2 週)
1. 設置獨立的遊戲 CDN 項目
2. 配置 Vercel 子域名和 CORS
3. 實現基本的 iframe 載入機制

### 階段 2: 優化和自動化 (2-3 週)
1. 實施自動化部署流程
2. 添加性能監控和分析
3. 優化緩存策略和版本控制

### 階段 3: 擴展和完善 (3-4 週)
1. 支援多遊戲動態載入
2. 實現 A/B 測試和功能開關
3. 添加錯誤監控和恢復機制

**總結**: iframe + CDN External 架構在 Vercel 上是一個高效、可擴展的解決方案，特別適合 EduCreate 的多遊戲平台需求。
