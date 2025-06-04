# EduCreate 資料庫初始化工具 (PowerShell 版本)
# ==========================================

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "     EduCreate 資料庫初始化工具" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 步驟 1: 檢查 PostgreSQL 連接
Write-Host "🔍 步驟 1: 檢查 PostgreSQL 連接..." -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow

try {
    $env:PGPASSWORD = "z089336161"
    $result = & psql -U postgres -c "SELECT version();" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PostgreSQL 連接成功" -ForegroundColor Green
    } else {
        throw "連接失敗"
    }
} catch {
    Write-Host "❌ PostgreSQL 連接失敗" -ForegroundColor Red
    Write-Host "💡 請確認:" -ForegroundColor Yellow
    Write-Host "   1. PostgreSQL 服務正在運行" -ForegroundColor White
    Write-Host "   2. 用戶名和密碼正確" -ForegroundColor White
    Write-Host "   3. 端口 5432 可用" -ForegroundColor White
    Read-Host "按 Enter 鍵退出"
    exit 1
}

# 步驟 2: 檢查 educreate 資料庫
Write-Host ""
Write-Host "🔍 步驟 2: 檢查 educreate 資料庫..." -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow

try {
    $databases = & psql -U postgres -lqt 2>$null
    if ($databases -match "educreate") {
        Write-Host "✅ educreate 資料庫已存在" -ForegroundColor Green
    } else {
        Write-Host "⚠️ educreate 資料庫不存在，正在創建..." -ForegroundColor Yellow
        & psql -U postgres -c "CREATE DATABASE educreate;" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ educreate 資料庫創建成功" -ForegroundColor Green
        } else {
            throw "資料庫創建失敗"
        }
    }
} catch {
    Write-Host "❌ educreate 資料庫操作失敗" -ForegroundColor Red
    Read-Host "按 Enter 鍵退出"
    exit 1
}

# 步驟 3: 檢查 .env 配置
Write-Host ""
Write-Host "🔍 步驟 3: 檢查 .env 配置..." -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow

if (Test-Path ".env") {
    Write-Host "✅ 找到 .env 文件" -ForegroundColor Green
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "DATABASE_URL") {
        Write-Host "✅ DATABASE_URL 已配置" -ForegroundColor Green
        $databaseUrl = (Get-Content ".env" | Select-String "DATABASE_URL").ToString()
        Write-Host $databaseUrl -ForegroundColor White
    } else {
        Write-Host "❌ DATABASE_URL 未配置" -ForegroundColor Red
        Write-Host "💡 請在 .env 文件中添加:" -ForegroundColor Yellow
        Write-Host 'DATABASE_URL="postgresql://postgres:z089336161@localhost:5432/educreate?schema=public"' -ForegroundColor White
        Read-Host "按 Enter 鍵退出"
        exit 1
    }
} else {
    Write-Host "❌ 未找到 .env 文件" -ForegroundColor Red
    Write-Host "💡 正在創建 .env 文件..." -ForegroundColor Yellow
    'DATABASE_URL="postgresql://postgres:z089336161@localhost:5432/educreate?schema=public"' | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ .env 文件創建完成" -ForegroundColor Green
}

# 步驟 4: 檢查 Prisma 配置
Write-Host ""
Write-Host "🔍 步驟 4: 檢查 Prisma 配置..." -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow

if (Test-Path "prisma\schema.prisma") {
    Write-Host "✅ 找到 Prisma schema 文件" -ForegroundColor Green
} else {
    Write-Host "❌ 未找到 Prisma schema 文件" -ForegroundColor Red
    Write-Host "💡 請確認 prisma/schema.prisma 文件存在" -ForegroundColor Yellow
    Read-Host "按 Enter 鍵退出"
    exit 1
}

# 步驟 5: 執行 Prisma 資料庫推送
Write-Host ""
Write-Host "🔍 步驟 5: 執行 Prisma 資料庫推送..." -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow

Write-Host "正在執行 npx prisma db push..." -ForegroundColor White
try {
    & npx prisma db push
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Prisma 資料庫推送成功" -ForegroundColor Green
        Write-Host "✅ 所有資料表已創建完成" -ForegroundColor Green
    } else {
        throw "Prisma 推送失敗"
    }
} catch {
    Write-Host "❌ Prisma 資料庫推送失敗" -ForegroundColor Red
    Write-Host "💡 請檢查:" -ForegroundColor Yellow
    Write-Host "   1. 資料庫連接字符串是否正確" -ForegroundColor White
    Write-Host "   2. 資料庫權限是否足夠" -ForegroundColor White
    Write-Host "   3. Prisma schema 語法是否正確" -ForegroundColor White
    Read-Host "按 Enter 鍵退出"
    exit 1
}

# 步驟 6: 生成 Prisma Client
Write-Host ""
Write-Host "🔍 步驟 6: 生成 Prisma Client..." -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow

Write-Host "正在執行 npx prisma generate..." -ForegroundColor White
try {
    & npx prisma generate
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Prisma Client 生成成功" -ForegroundColor Green
    } else {
        Write-Host "❌ Prisma Client 生成失敗" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Prisma Client 生成失敗" -ForegroundColor Red
}

# 完成
Write-Host ""
Write-Host "🎯 資料庫初始化完成！" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✅ PostgreSQL 連接正常" -ForegroundColor Green
Write-Host "✅ educreate 資料庫已創建" -ForegroundColor Green
Write-Host "✅ .env 配置正確" -ForegroundColor Green
Write-Host "✅ Prisma schema 已推送" -ForegroundColor Green
Write-Host "✅ 資料表結構已建立" -ForegroundColor Green
Write-Host ""
Write-Host "💡 接下來可以執行:" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "🌐 然後訪問: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Read-Host "按 Enter 鍵退出"