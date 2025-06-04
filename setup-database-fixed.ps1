# EduCreate 資料庫初始化工具 (修復版)
# 解決 Windows 命令兼容性問題

Write-Host "=========================================="
Write-Host "     EduCreate 資料庫初始化工具"
Write-Host "=========================================="
Write-Host ""

# 步驟 1: 檢查 PostgreSQL 連接
Write-Host "🔍 步驟 1: 檢查 PostgreSQL 連接..." -ForegroundColor Cyan
Write-Host "================================"
Write-Host "測試 PostgreSQL 連接..."

try {
    $result = & psql -U postgres -c "SELECT version();" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PostgreSQL 連接成功" -ForegroundColor Green
    } else {
        throw "連接失敗"
    }
} catch {
    Write-Host "❌ PostgreSQL 連接失敗" -ForegroundColor Red
    Write-Host "💡 請確認:"
    Write-Host "   1. PostgreSQL 服務正在運行"
    Write-Host "   2. 用戶名和密碼正確"
    Write-Host "   3. 端口 5432 可用"
    Read-Host "按任意鍵繼續"
    exit 1
}

Write-Host ""

# 步驟 2: 檢查 educreate 資料庫
Write-Host "🔍 步驟 2: 檢查 educreate 資料庫..." -ForegroundColor Cyan
Write-Host "================================"

try {
    $dbList = & psql -U postgres -lqt 2>$null
    if ($dbList -match "educreate") {
        Write-Host "✅ educreate 資料庫已存在" -ForegroundColor Green
    } else {
        Write-Host "⚠️ educreate 資料庫不存在，正在創建..." -ForegroundColor Yellow
        $createResult = & psql -U postgres -c "CREATE DATABASE educreate;" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ educreate 資料庫創建成功" -ForegroundColor Green
        } else {
            Write-Host "❌ educreate 資料庫創建失敗" -ForegroundColor Red
            Read-Host "按任意鍵繼續"
            exit 1
        }
    }
} catch {
    Write-Host "❌ 檢查資料庫時發生錯誤" -ForegroundColor Red
    Read-Host "按任意鍵繼續"
    exit 1
}

Write-Host ""

# 步驟 3: 檢查 .env 配置
Write-Host "🔍 步驟 3: 檢查 .env 配置..." -ForegroundColor Cyan
Write-Host "================================"

if (Test-Path ".env") {
    Write-Host "✅ 找到 .env 文件" -ForegroundColor Green
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "DATABASE_URL") {
        Write-Host "✅ DATABASE_URL 已配置" -ForegroundColor Green
        $dbUrl = (Get-Content ".env" | Select-String "DATABASE_URL").Line
        Write-Host $dbUrl
    } else {
        Write-Host "⚠️ DATABASE_URL 未配置" -ForegroundColor Yellow
        Write-Host "請在 .env 文件中添加:"
        Write-Host 'DATABASE_URL="postgresql://postgres:your_password@localhost:5432/educreate?schema=public"'
    }
} else {
    Write-Host "⚠️ .env 文件不存在" -ForegroundColor Yellow
    Write-Host "正在創建 .env 文件..."
    $envTemplate = @'
DATABASE_URL="postgresql://postgres:z089336161@localhost:5432/educreate?schema=public"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"
STRIPE_SECRET_KEY="your-stripe-secret-key"
'@
    $envTemplate | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ .env 文件創建成功" -ForegroundColor Green
}

Write-Host ""

# 步驟 4: 檢查 Prisma Schema
Write-Host "🔍 步驟 4: 檢查 Prisma Schema..." -ForegroundColor Cyan
Write-Host "================================"

if (Test-Path "prisma\schema.prisma") {
    Write-Host "✅ 找到 Prisma Schema" -ForegroundColor Green
} else {
    Write-Host "❌ Prisma Schema 不存在" -ForegroundColor Red
    Read-Host "按任意鍵繼續"
    exit 1
}

Write-Host ""

# 步驟 5: 推送資料庫變更
Write-Host "🔍 步驟 5: 推送資料庫變更..." -ForegroundColor Cyan
Write-Host "================================"
Write-Host "執行 npx prisma db push..."

try {
    & npx prisma db push
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 資料庫 Schema 推送成功" -ForegroundColor Green
    } else {
        Write-Host "❌ 資料庫 Schema 推送失敗" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 執行 prisma db push 時發生錯誤" -ForegroundColor Red
}

Write-Host ""

# 步驟 6: 生成 Prisma Client
Write-Host "🔍 步驟 6: 生成 Prisma Client..." -ForegroundColor Cyan
Write-Host "================================"
Write-Host "執行 npx prisma generate..."

try {
    & npx prisma generate
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Prisma Client 生成成功" -ForegroundColor Green
    } else {
        Write-Host "❌ Prisma Client 生成失敗" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 執行 prisma generate 時發生錯誤" -ForegroundColor Red
}

Write-Host ""
Write-Host "=========================================="
Write-Host "🎉 資料庫初始化完成！"
Write-Host "=========================================="
Write-Host ""
Write-Host "📋 接下來的步驟:"
Write-Host "1. 執行 npm run dev 啟動開發伺服器"
Write-Host "2. 訪問 http://localhost:3000 測試應用"
Write-Host "3. 測試註冊和登入功能"
Write-Host ""
Write-Host "🔧 如果遇到問題，請執行:"
Write-Host "   node test-db-connection.js (測試資料庫連接)"
Write-Host ""
Read-Host "按任意鍵結束"