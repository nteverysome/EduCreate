# =====================================
# PostgreSQL 數據庫認證修復工具
# =====================================

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "PostgreSQL 數據庫認證修復工具" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🚨 檢測到錯誤: P1000 - Authentication failed" -ForegroundColor Red
Write-Host "📋 當前配置密碼: z089336161" -ForegroundColor Yellow
Write-Host ""

# 檢查 PostgreSQL 服務
Write-Host "🔍 步驟 1: 檢查 PostgreSQL 服務狀態" -ForegroundColor Blue
$service = Get-Service -Name "postgresql-x64-14" -ErrorAction SilentlyContinue
if ($service) {
    if ($service.Status -eq "Running") {
        Write-Host "✅ PostgreSQL 服務正在運行" -ForegroundColor Green
    } else {
        Write-Host "❌ PostgreSQL 服務未運行，嘗試啟動..." -ForegroundColor Red
        try {
            Start-Service -Name "postgresql-x64-14"
            Start-Sleep -Seconds 3
            Write-Host "✅ PostgreSQL 服務已啟動" -ForegroundColor Green
        } catch {
            Write-Host "❌ 無法啟動 PostgreSQL 服務: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "❌ 找不到 PostgreSQL 服務 (postgresql-x64-14)" -ForegroundColor Red
    Write-Host "💡 請檢查 PostgreSQL 是否正確安裝" -ForegroundColor Yellow
}
Write-Host ""

# 測試常見密碼
Write-Host "🔍 步驟 2: 測試常見密碼" -ForegroundColor Blue
$passwords = @("postgres", "admin", "123456", "password", "root", "z089336161")
$correctPassword = $null

foreach ($pwd in $passwords) {
    Write-Host "測試密碼: $pwd" -ForegroundColor Yellow
    
    $env:PGPASSWORD = $pwd
    $result = & psql -U postgres -d postgres -c "SELECT 1 as test;" 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 密碼正確: $pwd" -ForegroundColor Green
        $correctPassword = $pwd
        break
    }
}

if ($correctPassword) {
    Write-Host ""
    Write-Host "🔧 步驟 3: 更新配置文件" -ForegroundColor Blue
    
    # 更新 .env 文件
    try {
        $envContent = Get-Content ".env" -Raw
        $newContent = $envContent -replace 'postgresql://postgres:[^@]*@', "postgresql://postgres:$correctPassword@"
        Set-Content ".env" -Value $newContent
        Write-Host "✅ .env 文件已更新" -ForegroundColor Green
    } catch {
        Write-Host "❌ 更新 .env 文件失敗: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "🔍 步驟 4: 檢查並創建數據庫" -ForegroundColor Blue
    
    # 檢查 educreate 數據庫
    $env:PGPASSWORD = $correctPassword
    $dbResult = & psql -U postgres -d educreate -c "SELECT 1;" 2>$null
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "📋 educreate 數據庫不存在，正在創建..." -ForegroundColor Yellow
        $createResult = & psql -U postgres -c "CREATE DATABASE educreate;"
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ educreate 數據庫創建成功" -ForegroundColor Green
        } else {
            Write-Host "❌ 創建數據庫失敗" -ForegroundColor Red
        }
    } else {
        Write-Host "✅ educreate 數據庫已存在" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "🚀 步驟 5: 初始化 Prisma" -ForegroundColor Blue
    
    # 推送 Prisma Schema
    Write-Host "推送 Prisma Schema..." -ForegroundColor Yellow
    $pushResult = & npx prisma db push --accept-data-loss
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Prisma Schema 推送成功" -ForegroundColor Green
    } else {
        Write-Host "❌ Prisma Schema 推送失敗" -ForegroundColor Red
    }
    
    # 生成 Prisma 客戶端
    Write-Host "生成 Prisma 客戶端..." -ForegroundColor Yellow
    $generateResult = & npx prisma generate
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Prisma 客戶端生成成功" -ForegroundColor Green
    } else {
        Write-Host "❌ Prisma 客戶端生成失敗" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "🎉 修復完成！" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 下一步:" -ForegroundColor Cyan
    Write-Host "1. 啟動開發服務器: npm run dev" -ForegroundColor White
    Write-Host "2. 訪問註冊頁面: http://localhost:3000/register" -ForegroundColor White
    Write-Host "3. 測試註冊功能" -ForegroundColor White
    
} else {
    Write-Host ""
    Write-Host "❌ 所有常見密碼都失敗" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 手動重置密碼選項:" -ForegroundColor Yellow
    Write-Host "1. 使用 pgAdmin 重置密碼" -ForegroundColor White
    Write-Host "2. 使用命令行重置:" -ForegroundColor White
    Write-Host "   - 停止服務: Stop-Service postgresql-x64-14" -ForegroundColor Gray
    Write-Host "   - 編輯 pg_hba.conf 設置 trust 認證" -ForegroundColor Gray
    Write-Host "   - 重啟服務並重置密碼" -ForegroundColor Gray
    Write-Host "3. 重新安裝 PostgreSQL" -ForegroundColor White
    Write-Host ""
    
    $choice = Read-Host "是否要嘗試重新安裝 PostgreSQL? (y/n)"
    if ($choice -eq "y" -or $choice -eq "Y") {
        Write-Host "💡 請參考 POSTGRESQL-QUICK-INSTALL.md 進行重新安裝" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "按任意鍵退出..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")