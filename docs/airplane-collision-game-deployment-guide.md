# AirplaneCollisionGame 部署指南

## 🎯 部署概述

AirplaneCollisionGame 採用雙服務器架構，包含 Next.js 主應用和 Vite 遊戲子專案，支援多種部署方式。

## 🏗️ 架構說明

### 雙服務器架構
```
┌─────────────────────────────────────────────────────────┐
│                 Production Environment                  │
├─────────────────────────────────────────────────────────┤
│  Next.js Application (Port 3000)                       │
│  ├── 主應用界面和路由                                     │
│  ├── 遊戲頁面 (/games/airplane)                         │
│  ├── iframe 嵌入機制                                     │
│  └── 用戶管理和數據處理                                   │
├─────────────────────────────────────────────────────────┤
│  Vite Game Server (Port 3001)                          │
│  ├── 獨立遊戲應用                                        │
│  ├── Phaser 3 遊戲引擎                                   │
│  ├── 遊戲資源和邏輯                                       │
│  └── 高性能遊戲渲染                                       │
└─────────────────────────────────────────────────────────┘
```

### 部署選項
1. **Vercel 部署** (推薦) - 自動化部署和 CDN
2. **Docker 部署** - 容器化部署
3. **傳統服務器部署** - VPS/專用服務器
4. **CDN 分離部署** - 遊戲資源 CDN 分離

## 🚀 Vercel 部署 (推薦)

### 前置準備
```bash
# 1. 安裝 Vercel CLI
npm install -g vercel

# 2. 登入 Vercel
vercel login

# 3. 確認專案結構
ls -la
# 確認存在: package.json, next.config.js, games/airplane-game/
```

### 主應用部署

#### 步驟 1: 配置 Next.js 專案
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 靜態資源優化
  images: {
    domains: ['localhost', 'your-domain.com'],
    unoptimized: true
  },
  
  // 輸出配置
  output: 'standalone',
  
  // 環境變數
  env: {
    VITE_GAME_URL: process.env.VITE_GAME_URL || 'http://localhost:3001'
  },
  
  // 重寫規則 (支援遊戲路由)
  async rewrites() {
    return [
      {
        source: '/games/airplane-game/:path*',
        destination: `${process.env.VITE_GAME_URL}/games/airplane-game/:path*`
      }
    ];
  }
};

module.exports = nextConfig;
```

#### 步驟 2: 配置 Vercel 設定
```json
// vercel.json
{
  "version": 2,
  "name": "educreat-main",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/games/airplane",
      "dest": "/games/airplane"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "VITE_GAME_URL": "https://educreat-games.vercel.app"
  }
}
```

#### 步驟 3: 部署主應用
```bash
# 1. 構建專案
npm run build

# 2. 部署到 Vercel
vercel --prod

# 3. 設置自定義域名 (可選)
vercel domains add educreat.com
vercel alias educreat-main.vercel.app educreat.com
```

### 遊戲子專案部署

#### 步驟 1: 準備遊戲專案
```bash
# 1. 進入遊戲目錄
cd games/airplane-game

# 2. 安裝依賴
npm install

# 3. 構建遊戲
npm run build
```

#### 步驟 2: 配置遊戲專案 Vercel 設定
```json
// games/airplane-game/vercel.json
{
  "version": 2,
  "name": "educreat-games",
  "builds": [
    {
      "src": "dist/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/games/airplane-game/(.*)",
      "dest": "/dist/$1"
    },
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
          "value": "https://educreat.com"
        },
        {
          "key": "X-Frame-Options",
          "value": "ALLOWALL"
        }
      ]
    }
  ]
}
```

#### 步驟 3: 部署遊戲專案
```bash
# 1. 在遊戲目錄中部署
cd games/airplane-game
vercel --prod

# 2. 設置自定義域名 (可選)
vercel domains add games.educreat.com
vercel alias educreat-games.vercel.app games.educreat.com
```

### 環境變數配置
```bash
# Vercel 環境變數設置
vercel env add VITE_GAME_URL production
# 輸入: https://games.educreat.com

vercel env add NEXT_PUBLIC_API_URL production  
# 輸入: https://api.educreat.com

vercel env add DATABASE_URL production
# 輸入: your-database-connection-string
```

## 🐳 Docker 部署

### Dockerfile 配置

#### 主應用 Dockerfile
```dockerfile
# Dockerfile (主目錄)
FROM node:18-alpine AS base

# 安裝依賴
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# 構建應用
FROM base AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

# 生產環境
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

#### 遊戲專案 Dockerfile
```dockerfile
# games/airplane-game/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 生產環境
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose 配置
```yaml
# docker-compose.yml
version: '3.8'

services:
  main-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - VITE_GAME_URL=http://game-server
    depends_on:
      - game-server
    networks:
      - educreat-network

  game-server:
    build: ./games/airplane-game
    ports:
      - "3001:80"
    networks:
      - educreat-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - main-app
      - game-server
    networks:
      - educreat-network

networks:
  educreat-network:
    driver: bridge
```

### 部署命令
```bash
# 1. 構建和啟動服務
docker-compose up -d --build

# 2. 查看服務狀態
docker-compose ps

# 3. 查看日誌
docker-compose logs -f

# 4. 停止服務
docker-compose down
```

## 🖥️ 傳統服務器部署

### 系統需求
```bash
# 最低需求
- OS: Ubuntu 20.04+ / CentOS 8+ / Windows Server 2019+
- CPU: 2 核心 2.0GHz
- RAM: 4GB
- 存儲: 20GB SSD
- 網絡: 100Mbps

# 建議需求  
- OS: Ubuntu 22.04 LTS
- CPU: 4 核心 2.5GHz
- RAM: 8GB
- 存儲: 50GB SSD
- 網絡: 1Gbps
```

### 環境準備
```bash
# 1. 更新系統
sudo apt update && sudo apt upgrade -y

# 2. 安裝 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. 安裝 PM2 (進程管理)
sudo npm install -g pm2

# 4. 安裝 Nginx (反向代理)
sudo apt install nginx -y

# 5. 安裝 SSL 證書工具
sudo apt install certbot python3-certbot-nginx -y
```

### 應用部署
```bash
# 1. 克隆專案
git clone https://github.com/your-repo/EduCreate.git
cd EduCreate

# 2. 安裝主應用依賴
npm install
npm run build

# 3. 安裝遊戲依賴
cd games/airplane-game
npm install
npm run build
cd ../..

# 4. 配置 PM2
# ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'educreat-main',
      script: 'npm',
      args: 'start',
      cwd: '/path/to/EduCreate',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'educreat-game',
      script: 'npx',
      args: 'serve -s dist -l 3001',
      cwd: '/path/to/EduCreate/games/airplane-game',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};

# 5. 啟動應用
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Nginx 配置
```nginx
# /etc/nginx/sites-available/educreat
server {
    listen 80;
    server_name educreat.com www.educreat.com;
    
    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name educreat.com www.educreat.com;
    
    # SSL 配置
    ssl_certificate /etc/letsencrypt/live/educreat.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/educreat.com/privkey.pem;
    
    # 主應用代理
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # 遊戲應用代理
    location /games/airplane-game/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS 標頭
        add_header Access-Control-Allow-Origin "https://educreat.com";
        add_header X-Frame-Options "ALLOWALL";
    }
    
    # 靜態資源緩存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### SSL 證書設置
```bash
# 1. 獲取 SSL 證書
sudo certbot --nginx -d educreat.com -d www.educreat.com

# 2. 設置自動續期
sudo crontab -e
# 添加: 0 12 * * * /usr/bin/certbot renew --quiet

# 3. 測試 Nginx 配置
sudo nginx -t

# 4. 重載 Nginx
sudo systemctl reload nginx
```

## 🌐 CDN 分離部署

### 架構說明
```
┌─────────────────────────────────────────────────────────┐
│                 CDN Distribution                        │
├─────────────────────────────────────────────────────────┤
│  Main App: https://app.educreat.com                    │
│  ├── Next.js 應用                                       │
│  ├── 用戶界面和邏輯                                       │
│  └── iframe 嵌入遊戲                                     │
├─────────────────────────────────────────────────────────┤
│  Game CDN: https://games-cdn.educreat.com              │
│  ├── 遊戲靜態資源                                        │
│  ├── 全球 CDN 分發                                       │
│  ├── 高速載入                                           │
│  └── 版本化管理                                         │
└─────────────────────────────────────────────────────────┘
```

### CDN 配置步驟
```bash
# 1. 構建遊戲資源
cd games/airplane-game
npm run build

# 2. 上傳到 CDN
# 使用 AWS S3 + CloudFront 或 Vercel 或其他 CDN 服務

# 3. 配置 CDN 域名
# games-cdn.educreat.com -> CDN 分發點

# 4. 更新主應用配置
# 修改 iframe src 指向 CDN URL
```

## 📊 監控和維護

### 性能監控
```bash
# 1. 安裝監控工具
npm install -g @vercel/analytics
npm install -g newrelic

# 2. 配置監控
# 添加監控代碼到應用中

# 3. 設置警報
# 配置 CPU、記憶體、響應時間警報
```

### 日誌管理
```bash
# 1. PM2 日誌
pm2 logs educreat-main
pm2 logs educreat-game

# 2. Nginx 日誌
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# 3. 系統日誌
sudo journalctl -u nginx -f
```

### 備份策略
```bash
# 1. 代碼備份
git push origin main  # 代碼版本控制

# 2. 數據備份
# 定期備份用戶數據和學習記錄

# 3. 配置備份
tar -czf config-backup-$(date +%Y%m%d).tar.gz \
  /etc/nginx/sites-available/ \
  ecosystem.config.js \
  .env.production
```

## 🔧 故障排除

### 常見部署問題

#### 1. 端口衝突
```bash
# 檢查端口使用
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :3001

# 終止佔用進程
sudo kill -9 <PID>
```

#### 2. 權限問題
```bash
# 修復文件權限
sudo chown -R $USER:$USER /path/to/EduCreate
chmod -R 755 /path/to/EduCreate
```

#### 3. 記憶體不足
```bash
# 檢查記憶體使用
free -h
top

# 增加 swap 空間
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

#### 4. SSL 證書問題
```bash
# 檢查證書狀態
sudo certbot certificates

# 手動續期
sudo certbot renew

# 測試 SSL 配置
openssl s_client -connect educreat.com:443
```

## 🚀 自動化部署

### GitHub Actions 配置
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy-main:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build application
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'

  deploy-game:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Build game
        run: |
          cd games/airplane-game
          npm ci
          npm run build
          
      - name: Deploy game to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.GAME_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: './games/airplane-game'
```

**AirplaneCollisionGame 支援多種部署方式，選擇最適合您需求的部署策略！** 🚀🌐
