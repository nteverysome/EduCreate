#!/bin/bash

# Wordwall Clone 項目設置腳本
# 此腳本將自動設置整個開發環境

set -e  # 遇到錯誤時退出

echo "🚀 開始設置 Wordwall Clone 項目..."

# 檢查必要的工具
echo "📋 檢查系統依賴..."

# 檢查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安裝。請先安裝 Node.js 18+ 版本。"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 版本過低。需要 18+ 版本，當前版本: $(node -v)"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"

# 檢查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安裝。"
    exit 1
fi

echo "✅ npm 版本: $(npm -v)"

# 檢查 Docker (可選)
if command -v docker &> /dev/null; then
    echo "✅ Docker 版本: $(docker -v)"
    DOCKER_AVAILABLE=true
else
    echo "⚠️  Docker 未安裝。將跳過 Docker 相關設置。"
    DOCKER_AVAILABLE=false
fi

# 檢查 PostgreSQL (可選)
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL 已安裝"
    POSTGRES_AVAILABLE=true
else
    echo "⚠️  PostgreSQL 未安裝。建議安裝或使用 Docker。"
    POSTGRES_AVAILABLE=false
fi

echo ""
echo "🔧 開始安裝項目依賴..."

# 安裝前端依賴
echo "📦 安裝前端依賴..."
cd frontend
if [ -f "package.json" ]; then
    npm install
    echo "✅ 前端依賴安裝完成"
else
    echo "⚠️  前端 package.json 不存在，跳過前端依賴安裝"
fi
cd ..

# 安裝後端依賴
echo "📦 安裝後端依賴..."
cd backend
if [ -f "package.json" ]; then
    npm install
    echo "✅ 後端依賴安裝完成"
else
    echo "⚠️  後端 package.json 不存在，跳過後端依賴安裝"
fi
cd ..

echo ""
echo "⚙️  配置環境變量..."

# 創建前端環境變量文件
if [ ! -f "frontend/.env" ]; then
    echo "📝 創建前端環境變量文件..."
    cat > frontend/.env << EOF
# API 配置
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_WS_URL=ws://localhost:5000

# 第三方服務
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# 功能開關
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_SOCIAL_LOGIN=true
EOF
    echo "✅ 前端環境變量文件已創建"
else
    echo "⚠️  前端環境變量文件已存在，跳過創建"
fi

# 創建後端環境變量文件
if [ ! -f "backend/.env" ]; then
    echo "📝 創建後端環境變量文件..."
    cat > backend/.env << EOF
# 應用配置
NODE_ENV=development
PORT=5000
API_VERSION=v1

# 數據庫配置
DATABASE_URL=postgresql://wordwall_user:wordwall_password@localhost:5432/wordwall_clone

# Redis 配置
REDIS_URL=redis://localhost:6379

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Cloudinary 配置
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# 郵件配置
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# 安全配置
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# 文件上傳配置
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,audio/mpeg,audio/wav

# 功能開關
ENABLE_REGISTRATION=true
ENABLE_EMAIL_VERIFICATION=false
ENABLE_SOCIAL_LOGIN=true
EOF
    echo "✅ 後端環境變量文件已創建"
else
    echo "⚠️  後端環境變量文件已存在，跳過創建"
fi

echo ""
echo "🗄️  設置數據庫..."

if [ "$DOCKER_AVAILABLE" = true ]; then
    echo "🐳 使用 Docker 啟動數據庫服務..."
    
    # 啟動 PostgreSQL 和 Redis
    docker-compose up -d postgres redis
    
    echo "⏳ 等待數據庫啟動..."
    sleep 10
    
    echo "✅ 數據庫服務已啟動"
elif [ "$POSTGRES_AVAILABLE" = true ]; then
    echo "📊 檢測到本地 PostgreSQL，請確保服務正在運行"
    echo "💡 請手動創建數據庫: wordwall_clone"
    echo "💡 或運行: createdb wordwall_clone"
else
    echo "⚠️  未檢測到 PostgreSQL 或 Docker"
    echo "💡 請安裝 PostgreSQL 或 Docker 來運行數據庫"
fi

# 運行數據庫遷移
if [ -f "backend/prisma/schema.prisma" ]; then
    echo "🔄 運行數據庫遷移..."
    cd backend
    
    # 生成 Prisma 客戶端
    npx prisma generate
    
    # 運行遷移
    if npx prisma migrate dev --name init; then
        echo "✅ 數據庫遷移完成"
        
        # 運行種子數據
        if [ -f "src/scripts/seed.ts" ]; then
            echo "🌱 插入種子數據..."
            npm run db:seed
            echo "✅ 種子數據插入完成"
        fi
    else
        echo "⚠️  數據庫遷移失敗，請檢查數據庫連接"
    fi
    
    cd ..
else
    echo "⚠️  Prisma schema 不存在，跳過數據庫遷移"
fi

echo ""
echo "🧪 運行測試..."

# 運行前端測試
echo "🔍 運行前端測試..."
cd frontend
if npm test -- --run --reporter=verbose 2>/dev/null; then
    echo "✅ 前端測試通過"
else
    echo "⚠️  前端測試失敗或未配置"
fi
cd ..

# 運行後端測試
echo "🔍 運行後端測試..."
cd backend
if npm test 2>/dev/null; then
    echo "✅ 後端測試通過"
else
    echo "⚠️  後端測試失敗或未配置"
fi
cd ..

echo ""
echo "🎉 設置完成！"
echo ""
echo "📋 下一步操作："
echo "1. 編輯環境變量文件，填入實際的配置值"
echo "   - frontend/.env"
echo "   - backend/.env"
echo ""
echo "2. 啟動開發服務器："
echo "   # 啟動後端 (終端 1)"
echo "   cd backend && npm run dev"
echo ""
echo "   # 啟動前端 (終端 2)"
echo "   cd frontend && npm run dev"
echo ""
echo "3. 或使用 Docker 一鍵啟動："
echo "   docker-compose up -d"
echo ""
echo "4. 訪問應用："
echo "   - 前端: http://localhost:3000"
echo "   - 後端 API: http://localhost:5000"
echo "   - 數據庫管理: http://localhost:8080 (如果使用 Docker)"
echo ""
echo "🚀 開始開發 Wordwall Clone 吧！"
