@echo off
setlocal enabledelayedexpansion

echo 🚀 開始設置 Wordwall Clone 項目...
echo.

echo 📋 檢查系統依賴...

:: 檢查 Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js 未安裝。請先安裝 Node.js 18+ 版本。
    pause
    exit /b 1
)

for /f "tokens=1 delims=." %%a in ('node --version') do (
    set NODE_MAJOR=%%a
    set NODE_MAJOR=!NODE_MAJOR:v=!
)

if !NODE_MAJOR! lss 18 (
    echo ❌ Node.js 版本過低。需要 18+ 版本，當前版本: 
    node --version
    pause
    exit /b 1
)

echo ✅ Node.js 版本: 
node --version

:: 檢查 npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm 未安裝。
    pause
    exit /b 1
)

echo ✅ npm 版本: 
npm --version

:: 檢查 Docker (可選)
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Docker 版本: 
    docker --version
    set DOCKER_AVAILABLE=true
) else (
    echo ⚠️  Docker 未安裝。將跳過 Docker 相關設置。
    set DOCKER_AVAILABLE=false
)

echo.
echo 🔧 開始安裝項目依賴...

:: 安裝前端依賴
echo 📦 安裝前端依賴...
if exist "frontend\package.json" (
    cd frontend
    npm install
    if %errorlevel% equ 0 (
        echo ✅ 前端依賴安裝完成
    ) else (
        echo ❌ 前端依賴安裝失敗
    )
    cd ..
) else (
    echo ⚠️  前端 package.json 不存在，跳過前端依賴安裝
)

:: 安裝後端依賴
echo 📦 安裝後端依賴...
if exist "backend\package.json" (
    cd backend
    npm install
    if %errorlevel% equ 0 (
        echo ✅ 後端依賴安裝完成
    ) else (
        echo ❌ 後端依賴安裝失敗
    )
    cd ..
) else (
    echo ⚠️  後端 package.json 不存在，跳過後端依賴安裝
)

echo.
echo ⚙️  配置環境變量...

:: 創建前端環境變量文件
if not exist "frontend\.env" (
    echo 📝 創建前端環境變量文件...
    (
        echo # API 配置
        echo VITE_API_BASE_URL=http://localhost:5000/api/v1
        echo VITE_WS_URL=ws://localhost:5000
        echo.
        echo # 第三方服務
        echo VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
        echo VITE_GOOGLE_CLIENT_ID=your_google_client_id
        echo.
        echo # 功能開關
        echo VITE_ENABLE_ANALYTICS=false
        echo VITE_ENABLE_SOCIAL_LOGIN=true
    ) > frontend\.env
    echo ✅ 前端環境變量文件已創建
) else (
    echo ⚠️  前端環境變量文件已存在，跳過創建
)

:: 創建後端環境變量文件
if not exist "backend\.env" (
    echo 📝 創建後端環境變量文件...
    (
        echo # 應用配置
        echo NODE_ENV=development
        echo PORT=5000
        echo API_VERSION=v1
        echo.
        echo # 數據庫配置
        echo DATABASE_URL=postgresql://wordwall_user:wordwall_password@localhost:5432/wordwall_clone
        echo.
        echo # Redis 配置
        echo REDIS_URL=redis://localhost:6379
        echo.
        echo # JWT 配置
        echo JWT_SECRET=your-super-secret-jwt-key-change-in-production
        echo JWT_EXPIRES_IN=24h
        echo JWT_REFRESH_EXPIRES_IN=7d
        echo.
        echo # Cloudinary 配置
        echo CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
        echo CLOUDINARY_API_KEY=your-cloudinary-api-key
        echo CLOUDINARY_API_SECRET=your-cloudinary-api-secret
        echo.
        echo # 郵件配置
        echo SMTP_HOST=smtp.gmail.com
        echo SMTP_PORT=587
        echo SMTP_USER=your-email@gmail.com
        echo SMTP_PASS=your-app-password
        echo.
        echo # 安全配置
        echo BCRYPT_ROUNDS=12
        echo RATE_LIMIT_WINDOW_MS=900000
        echo RATE_LIMIT_MAX_REQUESTS=100
        echo.
        echo # 文件上傳配置
        echo MAX_FILE_SIZE=10485760
        echo ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,audio/mpeg,audio/wav
        echo.
        echo # 功能開關
        echo ENABLE_REGISTRATION=true
        echo ENABLE_EMAIL_VERIFICATION=false
        echo ENABLE_SOCIAL_LOGIN=true
    ) > backend\.env
    echo ✅ 後端環境變量文件已創建
) else (
    echo ⚠️  後端環境變量文件已存在，跳過創建
)

echo.
echo 🗄️  設置數據庫...

if "%DOCKER_AVAILABLE%"=="true" (
    echo 🐳 使用 Docker 啟動數據庫服務...
    
    :: 啟動 PostgreSQL 和 Redis
    docker-compose up -d postgres redis
    
    echo ⏳ 等待數據庫啟動...
    timeout /t 10 /nobreak >nul
    
    echo ✅ 數據庫服務已啟動
) else (
    echo ⚠️  未檢測到 Docker
    echo 💡 請安裝 PostgreSQL 和 Redis，或使用 Docker
)

:: 運行數據庫遷移
if exist "backend\prisma\schema.prisma" (
    echo 🔄 運行數據庫遷移...
    cd backend
    
    :: 生成 Prisma 客戶端
    npx prisma generate
    
    :: 運行遷移
    npx prisma migrate dev --name init
    if %errorlevel% equ 0 (
        echo ✅ 數據庫遷移完成
        
        :: 運行種子數據
        if exist "src\scripts\seed.ts" (
            echo 🌱 插入種子數據...
            npm run db:seed
            echo ✅ 種子數據插入完成
        )
    ) else (
        echo ⚠️  數據庫遷移失敗，請檢查數據庫連接
    )
    
    cd ..
) else (
    echo ⚠️  Prisma schema 不存在，跳過數據庫遷移
)

echo.
echo 🎉 設置完成！
echo.
echo 📋 下一步操作：
echo 1. 編輯環境變量文件，填入實際的配置值
echo    - frontend\.env
echo    - backend\.env
echo.
echo 2. 啟動開發服務器：
echo    # 啟動後端 (終端 1)
echo    cd backend ^&^& npm run dev
echo.
echo    # 啟動前端 (終端 2)
echo    cd frontend ^&^& npm run dev
echo.
echo 3. 或使用 Docker 一鍵啟動：
echo    docker-compose up -d
echo.
echo 4. 訪問應用：
echo    - 前端: http://localhost:3000
echo    - 後端 API: http://localhost:5000
echo    - 數據庫管理: http://localhost:8080 (如果使用 Docker)
echo.
echo 🚀 開始開發 Wordwall Clone 吧！
echo.
pause
