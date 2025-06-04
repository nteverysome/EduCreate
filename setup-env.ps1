# 環境變量配置腳本
# 自動創建和配置 .env.local 文件

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "     環境變量配置工具" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 檢查是否存在 .env.local 文件
$envFile = ".env.local"
$backupFile = ".env.local.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

if (Test-Path $envFile) {
    Write-Host "⚠️  發現現有 .env.local 文件，創建備份..." -ForegroundColor Yellow
    Copy-Item $envFile $backupFile
    Write-Host "✅ 備份已創建: $backupFile" -ForegroundColor Green
}

# 默認數據庫配置
$defaultConfig = @{
    "DATABASE_URL" = "postgresql://postgres:password@localhost:5432/educreate"
    "NEXTAUTH_URL" = "http://localhost:3000"
    "NEXTAUTH_SECRET" = "your-secret-key-here-$(Get-Random -Minimum 1000 -Maximum 9999)"
    "STRIPE_PUBLISHABLE_KEY" = "pk_test_your_stripe_publishable_key_here"
    "STRIPE_SECRET_KEY" = "sk_test_your_stripe_secret_key_here"
    "STRIPE_WEBHOOK_SECRET" = "whsec_your_webhook_secret_here"
}

Write-Host "
🔧 配置數據庫連接..." -ForegroundColor Yellow

# 提示用戶輸入數據庫配置
Write-Host "請輸入 PostgreSQL 配置信息 (按 Enter 使用默認值):" -ForegroundColor Gray

$dbHost = Read-Host "數據庫主機 [localhost]"
if ([string]::IsNullOrWhiteSpace($dbHost)) { $dbHost = "localhost" }

$dbPort = Read-Host "數據庫端口 [5432]"
if ([string]::IsNullOrWhiteSpace($dbPort)) { $dbPort = "5432" }

$dbUser = Read-Host "數據庫用戶 [postgres]"
if ([string]::IsNullOrWhiteSpace($dbUser)) { $dbUser = "postgres" }

$dbPassword = Read-Host "數據庫密碼 [password]" -AsSecureString
if ($dbPassword.Length -eq 0) {
    $dbPasswordPlain = "password"
} else {
    $dbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword))
}

$dbName = Read-Host "數據庫名稱 [educreate]"
if ([string]::IsNullOrWhiteSpace($dbName)) { $dbName = "educreate" }

# 構建 DATABASE_URL
$databaseUrl = "postgresql://$dbUser`:$dbPasswordPlain@$dbHost`:$dbPort/$dbName"
$defaultConfig["DATABASE_URL"] = $databaseUrl

Write-Host "
🔧 配置其他環境變量..." -ForegroundColor Yellow

# NextAuth 配置
$nextAuthUrl = Read-Host "NextAuth URL [http://localhost:3000]"
if (![string]::IsNullOrWhiteSpace($nextAuthUrl)) {
    $defaultConfig["NEXTAUTH_URL"] = $nextAuthUrl
}

# 生成隨機 NextAuth Secret
$randomSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
$defaultConfig["NEXTAUTH_SECRET"] = $randomSecret

Write-Host "
📝 創建 .env.local 文件..." -ForegroundColor Yellow

# 創建 .env.local 內容
$envContent = @"
# 數據庫配置
DATABASE_URL="$($defaultConfig['DATABASE_URL'])"

# NextAuth 配置
NEXTAUTH_URL=$($defaultConfig['NEXTAUTH_URL'])
NEXTAUTH_SECRET=$($defaultConfig['NEXTAUTH_SECRET'])

# Stripe 配置 (請替換為實際的 API 密鑰)
STRIPE_PUBLISHABLE_KEY=$($defaultConfig['STRIPE_PUBLISHABLE_KEY'])
STRIPE_SECRET_KEY=$($defaultConfig['STRIPE_SECRET_KEY'])
STRIPE_WEBHOOK_SECRET=$($defaultConfig['STRIPE_WEBHOOK_SECRET'])

# 其他配置
NODE_ENV=development
PORT=3000

# 生成時間: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
"@

# 寫入文件
Set-Content -Path $envFile -Value $envContent -Encoding UTF8

Write-Host "✅ .env.local 文件已創建" -ForegroundColor Green

# 驗證配置
Write-Host "
🔍 驗證配置..." -ForegroundColor Yellow

if (Test-Path $envFile) {
    $content = Get-Content $envFile -Raw
    
    if ($content -match "DATABASE_URL") {
        Write-Host "✅ DATABASE_URL 配置正確" -ForegroundColor Green
    } else {
        Write-Host "❌ DATABASE_URL 配置缺失" -ForegroundColor Red
    }
    
    if ($content -match "NEXTAUTH_SECRET") {
        Write-Host "✅ NEXTAUTH_SECRET 配置正確" -ForegroundColor Green
    } else {
        Write-Host "❌ NEXTAUTH_SECRET 配置缺失" -ForegroundColor Red
    }
    
    Write-Host "
📋 當前配置:" -ForegroundColor Cyan
    Write-Host "數據庫: $dbHost`:$dbPort/$dbName" -ForegroundColor Gray
    Write-Host "用戶: $dbUser" -ForegroundColor Gray
    Write-Host "NextAuth URL: $($defaultConfig['NEXTAUTH_URL'])" -ForegroundColor Gray
    
} else {
    Write-Host "❌ .env.local 文件創建失敗" -ForegroundColor Red
}

# 測試數據庫連接
Write-Host "
🔍 測試數據庫連接..." -ForegroundColor Yellow

try {
    # 創建簡單的連接測試腳本
    $testScript = @"
const { Client } = require('pg');

const client = new Client({
  connectionString: '$databaseUrl'
});

async function testConnection() {
  try {
    await client.connect();
    console.log('✅ 數據庫連接成功');
    
    const result = await client.query('SELECT version()');
    console.log('PostgreSQL 版本:', result.rows[0].version);
    
    await client.end();
  } catch (error) {
    console.error('❌ 數據庫連接失敗:', error.message);
  }
}

testConnection();
"@
    
    Set-Content -Path "test-env-connection.js" -Value $testScript
    
    # 檢查是否安裝了 pg 模塊
    if (Test-Path "node_modules\pg") {
        node test-env-connection.js
    } else {
        Write-Host "⚠️  未找到 pg 模塊，跳過連接測試" -ForegroundColor Yellow
        Write-Host "   請運行 'npm install pg' 安裝依賴" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "❌ 連接測試失敗: $($_.Exception.Message)" -ForegroundColor Red
}

# 顯示下一步操作
Write-Host "
🎯 配置完成！" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host "下一步操作:" -ForegroundColor Yellow
Write-Host "1. 確保 PostgreSQL 服務正在運行" -ForegroundColor Gray
Write-Host "2. 運行 'npm install' 安裝依賴" -ForegroundColor Gray
Write-Host "3. 運行 'npx prisma db push' 初始化數據庫" -ForegroundColor Gray
Write-Host "4. 運行 'npm run dev' 啟動開發服務器" -ForegroundColor Gray
Write-Host "5. 訪問 http://localhost:3000 測試應用" -ForegroundColor Gray

Write-Host "
📝 重要提醒:" -ForegroundColor Yellow
Write-Host "- 請妥善保管 .env.local 文件，不要提交到版本控制" -ForegroundColor Gray
Write-Host "- Stripe API 密鑰需要替換為實際的密鑰" -ForegroundColor Gray
Write-Host "- 生產環境請使用更強的 NEXTAUTH_SECRET" -ForegroundColor Gray

Read-Host "
按 Enter 鍵退出"