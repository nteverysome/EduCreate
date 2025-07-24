#!/bin/bash

# EduCreate CDN Quick Start Script
# 基於 Task 1.0 基礎設施的 CDN 升級快速啟動腳本

set -e

echo "🚀 EduCreate CDN Quick Start"
echo "================================"

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 檢查函數
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 未安裝，請先安裝 $1${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ $1 已安裝${NC}"
    fi
}

# 檢查目錄是否存在
check_directory() {
    if [ ! -d "$1" ]; then
        echo -e "${RED}❌ 目錄不存在: $1${NC}"
        echo -e "${YELLOW}請確保已完成 Task 1.0 系列任務${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ 目錄存在: $1${NC}"
    fi
}

echo -e "${BLUE}步驟 1: 檢查前置條件${NC}"
echo "--------------------------------"

# 檢查必要命令
check_command "node"
check_command "npm"
check_command "git"

# 檢查 Task 1.0 基礎設施
echo -e "\n${BLUE}檢查 Task 1.0 基礎設施...${NC}"
check_directory "games/airplane-game"
check_directory "games/airplane-game/dist"
check_directory "app/games/airplane-iframe"
check_directory "public/games/airplane-game"

echo -e "${GREEN}✅ Task 1.0 基礎設施檢查通過${NC}"

echo -e "\n${BLUE}步驟 2: 安裝 Vercel CLI${NC}"
echo "--------------------------------"

if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}正在安裝 Vercel CLI...${NC}"
    npm install -g vercel
    echo -e "${GREEN}✅ Vercel CLI 安裝完成${NC}"
else
    echo -e "${GREEN}✅ Vercel CLI 已安裝${NC}"
fi

echo -e "\n${BLUE}步驟 3: 創建 CDN 項目目錄${NC}"
echo "--------------------------------"

CDN_DIR="../educreat-games-cdn"

if [ -d "$CDN_DIR" ]; then
    echo -e "${YELLOW}⚠️  CDN 項目目錄已存在，是否要重新創建？ (y/n)${NC}"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        rm -rf "$CDN_DIR"
        echo -e "${GREEN}✅ 舊目錄已刪除${NC}"
    else
        echo -e "${BLUE}使用現有目錄${NC}"
    fi
fi

if [ ! -d "$CDN_DIR" ]; then
    mkdir -p "$CDN_DIR"
    echo -e "${GREEN}✅ CDN 項目目錄創建完成: $CDN_DIR${NC}"
fi

echo -e "\n${BLUE}步驟 4: 初始化 CDN 項目${NC}"
echo "--------------------------------"

cd "$CDN_DIR"

# 初始化 package.json
if [ ! -f "package.json" ]; then
    echo -e "${YELLOW}正在初始化 package.json...${NC}"
    npm init -y
    echo -e "${GREEN}✅ package.json 創建完成${NC}"
fi

echo -e "\n${BLUE}步驟 5: 複製配置文件${NC}"
echo "--------------------------------"

# 複製 vercel.json
if [ -f "../EduCreate/vercel-deployment/games-cdn/vercel.json" ]; then
    cp "../EduCreate/vercel-deployment/games-cdn/vercel.json" ./
    echo -e "${GREEN}✅ vercel.json 複製完成${NC}"
else
    echo -e "${YELLOW}⚠️  創建基本 vercel.json...${NC}"
    cat > vercel.json << 'EOF'
{
  "version": 2,
  "name": "educreat-games-cdn",
  "builds": [
    {
      "src": "airplane-game/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/airplane-game/(.*)",
      "dest": "/airplane-game/$1"
    },
    {
      "src": "/api/games/config",
      "dest": "/api/games-config.js"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, OPTIONS"
        }
      ]
    }
  ]
}
EOF
    echo -e "${GREEN}✅ 基本 vercel.json 創建完成${NC}"
fi

# 複製 API 文件
if [ -d "../EduCreate/vercel-deployment/games-cdn/api" ]; then
    cp -r "../EduCreate/vercel-deployment/games-cdn/api" ./
    echo -e "${GREEN}✅ API 文件複製完成${NC}"
else
    echo -e "${YELLOW}⚠️  創建基本 API...${NC}"
    mkdir -p api
    cat > api/games-config.js << 'EOF'
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const gamesConfig = {
    'airplane': {
      id: 'airplane',
      name: 'Airplane Collision Game',
      version: '1.0.0',
      cdnUrl: 'https://educreat-games-cdn.vercel.app/airplane-game',
      entryPoint: '/index.html'
    }
  };

  const { gameId } = req.query;
  
  if (gameId) {
    const gameConfig = gamesConfig[gameId];
    if (!gameConfig) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }
    res.status(200).json({ success: true, data: gameConfig });
  } else {
    res.status(200).json({ success: true, data: gamesConfig });
  }
}
EOF
    echo -e "${GREEN}✅ 基本 API 創建完成${NC}"
fi

echo -e "\n${BLUE}步驟 6: 複製遊戲文件${NC}"
echo "--------------------------------"

# 複製飛機遊戲構建文件
if [ -d "../EduCreate/games/airplane-game/dist" ]; then
    mkdir -p airplane-game
    cp -r "../EduCreate/games/airplane-game/dist/"* airplane-game/
    echo -e "${GREEN}✅ 飛機遊戲文件複製完成${NC}"
    
    # 顯示文件統計
    file_count=$(find airplane-game -type f | wc -l)
    total_size=$(du -sh airplane-game | cut -f1)
    echo -e "${BLUE}   文件數量: $file_count${NC}"
    echo -e "${BLUE}   總大小: $total_size${NC}"
else
    echo -e "${RED}❌ 找不到飛機遊戲構建文件${NC}"
    echo -e "${YELLOW}請先運行: cd games/airplane-game && npm run build${NC}"
    exit 1
fi

echo -e "\n${BLUE}步驟 7: Vercel 登入檢查${NC}"
echo "--------------------------------"

# 檢查是否已登入 Vercel
if vercel whoami &> /dev/null; then
    current_user=$(vercel whoami)
    echo -e "${GREEN}✅ 已登入 Vercel，用戶: $current_user${NC}"
else
    echo -e "${YELLOW}⚠️  需要登入 Vercel${NC}"
    echo -e "${BLUE}請運行: vercel login${NC}"
    echo -e "${BLUE}然後重新運行此腳本${NC}"
    exit 1
fi

echo -e "\n${BLUE}步驟 8: 首次部署測試${NC}"
echo "--------------------------------"

echo -e "${YELLOW}準備進行首次部署測試...${NC}"
echo -e "${BLUE}這將創建一個預覽部署，不會影響生產環境${NC}"
echo -e "${YELLOW}是否繼續？ (y/n)${NC}"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}正在部署...${NC}"
    
    # 首次部署（預覽）
    deployment_url=$(vercel --yes 2>&1 | grep -o 'https://[^[:space:]]*' | head -1)
    
    if [ $? -eq 0 ] && [ ! -z "$deployment_url" ]; then
        echo -e "${GREEN}✅ 部署成功！${NC}"
        echo -e "${BLUE}預覽 URL: $deployment_url${NC}"
        
        # 測試部署
        echo -e "\n${BLUE}測試部署...${NC}"
        
        # 測試遊戲文件
        if curl -s -I "$deployment_url/airplane-game/index.html" | grep -q "200 OK"; then
            echo -e "${GREEN}✅ 遊戲文件可訪問${NC}"
        else
            echo -e "${RED}❌ 遊戲文件無法訪問${NC}"
        fi
        
        # 測試 API
        if curl -s "$deployment_url/api/games/config" | grep -q "success"; then
            echo -e "${GREEN}✅ API 正常運行${NC}"
        else
            echo -e "${RED}❌ API 無法訪問${NC}"
        fi
        
        # 保存部署信息
        cat > deployment-info.txt << EOF
CDN 部署信息
=============
部署時間: $(date)
預覽 URL: $deployment_url
遊戲 URL: $deployment_url/airplane-game/index.html
API URL: $deployment_url/api/games/config

下一步:
1. 測試遊戲載入: 訪問遊戲 URL
2. 測試 API: 訪問 API URL
3. 在主應用中整合 CDN 載入器
4. 設置生產部署: vercel --prod
EOF
        
        echo -e "\n${GREEN}🎉 CDN 快速啟動完成！${NC}"
        echo -e "${BLUE}部署信息已保存到 deployment-info.txt${NC}"
        echo -e "\n${YELLOW}下一步操作:${NC}"
        echo -e "${BLUE}1. 測試遊戲: $deployment_url/airplane-game/index.html${NC}"
        echo -e "${BLUE}2. 測試 API: $deployment_url/api/games/config${NC}"
        echo -e "${BLUE}3. 查看詳細計劃: cat ../EduCreate/docs/cdn-implementation-action-plan.md${NC}"
        
    else
        echo -e "${RED}❌ 部署失敗${NC}"
        echo -e "${YELLOW}請檢查 Vercel 配置和網絡連接${NC}"
        exit 1
    fi
else
    echo -e "${BLUE}跳過部署測試${NC}"
    echo -e "${YELLOW}稍後可手動運行: vercel${NC}"
fi

echo -e "\n${GREEN}🎊 CDN 快速啟動腳本執行完成！${NC}"
echo -e "${BLUE}項目目錄: $(pwd)${NC}"
echo -e "${BLUE}查看完整實施計劃: cat ../EduCreate/docs/cdn-implementation-action-plan.md${NC}"
