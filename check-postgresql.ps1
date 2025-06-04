# PostgreSQL 服務檢查和啟動工具 (PowerShell 版本)

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "    PostgreSQL 服務檢查和啟動工具" -ForegroundColor Cyan
Write-Host "==========================================`n" -ForegroundColor Cyan

# 檢查是否以管理員身份運行
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "⚠️  警告: 未以管理員身份運行，可能無法啟動服務" -ForegroundColor Yellow
    Write-Host "建議: 右鍵點擊 PowerShell，選擇 '以管理員身份運行'`n" -ForegroundColor Yellow
}

# 檢查 PostgreSQL 服務
Write-Host "🔍 檢查 PostgreSQL 服務..." -ForegroundColor Green

$postgresServices = @(
    "postgresql-x64-14",
    "postgresql-x64-13",
    "postgresql-x64-15",
    "postgresql-x64-12",
    "postgresql",
    "PostgreSQL"
)

$foundServices = @()

foreach ($serviceName in $postgresServices) {
    try {
        $service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
        if ($service) {
            $foundServices += $service
            $status = $service.Status
            $statusColor = if ($status -eq "Running") { "Green" } else { "Red" }
            Write-Host "✅ 找到服務: $serviceName - 狀態: $status" -ForegroundColor $statusColor
        }
    }
    catch {
        # 服務不存在，忽略錯誤
    }
}

if ($foundServices.Count -eq 0) {
    Write-Host "❌ 未找到任何 PostgreSQL 服務" -ForegroundColor Red
    Write-Host "💡 可能的原因:" -ForegroundColor Yellow
    Write-Host "   1. PostgreSQL 未安裝" -ForegroundColor Yellow
    Write-Host "   2. 服務名稱不同" -ForegroundColor Yellow
    Write-Host "   3. 使用便攜版 PostgreSQL" -ForegroundColor Yellow
} else {
    Write-Host "`n📋 找到 $($foundServices.Count) 個 PostgreSQL 服務`n" -ForegroundColor Cyan
}

# 嘗試啟動停止的服務
$stoppedServices = $foundServices | Where-Object { $_.Status -ne "Running" }

if ($stoppedServices.Count -gt 0) {
    Write-Host "🔧 嘗試啟動停止的 PostgreSQL 服務...`n" -ForegroundColor Yellow
    
    foreach ($service in $stoppedServices) {
        try {
            Write-Host "📋 啟動服務: $($service.Name)..." -ForegroundColor Blue
            Start-Service -Name $service.Name -ErrorAction Stop
            Write-Host "✅ $($service.Name) 啟動成功" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ $($service.Name) 啟動失敗: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
} else {
    if ($foundServices.Count -gt 0) {
        Write-Host "✅ 所有 PostgreSQL 服務都在運行中" -ForegroundColor Green
    }
}

# 檢查端口 5432
Write-Host "`n🔍 檢查端口 5432..." -ForegroundColor Green

try {
    $connections = Get-NetTCPConnection -LocalPort 5432 -ErrorAction SilentlyContinue
    if ($connections) {
        Write-Host "✅ 端口 5432 正在使用中" -ForegroundColor Green
        foreach ($conn in $connections) {
            $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "   進程: $($process.ProcessName) (PID: $($process.Id))" -ForegroundColor Cyan
            }
        }
    } else {
        Write-Host "❌ 端口 5432 未被使用" -ForegroundColor Red
    }
}
catch {
    Write-Host "⚠️  無法檢查端口狀態: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 檢查 PostgreSQL 安裝
Write-Host "`n🔍 檢查 PostgreSQL 安裝..." -ForegroundColor Green

$commonPaths = @(
    "C:\Program Files\PostgreSQL",
    "C:\Program Files (x86)\PostgreSQL",
    "C:\PostgreSQL"
)

$foundInstallations = @()

foreach ($path in $commonPaths) {
    if (Test-Path $path) {
        $versions = Get-ChildItem $path -Directory -ErrorAction SilentlyContinue
        foreach ($version in $versions) {
            $binPath = Join-Path $version.FullName "bin\postgres.exe"
            if (Test-Path $binPath) {
                $foundInstallations += $version.FullName
                Write-Host "✅ 找到 PostgreSQL 安裝: $($version.FullName)" -ForegroundColor Green
            }
        }
    }
}

if ($foundInstallations.Count -eq 0) {
    Write-Host "❌ 未找到 PostgreSQL 安裝" -ForegroundColor Red
}

# 測試數據庫連接
Write-Host "`n🧪 測試數據庫連接..." -ForegroundColor Green

if (Test-Path "package.json") {
    try {
        $result = & npx prisma db pull --help 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Prisma CLI 可用" -ForegroundColor Green
            Write-Host "💡 可以運行: npx prisma db pull" -ForegroundColor Cyan
        } else {
            Write-Host "❌ Prisma CLI 不可用" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "❌ 無法檢查 Prisma CLI" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  未找到 package.json，跳過 Prisma 檢查" -ForegroundColor Yellow
}

# 顯示故障排除建議
Write-Host "`n💡 故障排除建議:" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow

if ($foundServices.Count -eq 0) {
    Write-Host "如果未找到 PostgreSQL 服務:" -ForegroundColor White
    Write-Host "1. 下載並安裝 PostgreSQL: https://www.postgresql.org/download/windows/" -ForegroundColor Gray
    Write-Host "2. 確保在安裝時選擇了 '作為服務安裝'" -ForegroundColor Gray
    Write-Host "3. 檢查是否使用便攜版或 Docker 版本" -ForegroundColor Gray
}

if ($stoppedServices.Count -gt 0) {
    Write-Host "如果服務無法啟動:" -ForegroundColor White
    Write-Host "1. 以管理員身份運行此腳本" -ForegroundColor Gray
    Write-Host "2. 檢查 Windows 事件日誌中的錯誤" -ForegroundColor Gray
    Write-Host "3. 確保端口 5432 未被其他程序佔用" -ForegroundColor Gray
    Write-Host "4. 檢查 PostgreSQL 數據目錄權限" -ForegroundColor Gray
}

Write-Host "`n下一步操作:" -ForegroundColor White
Write-Host "1. 如果 PostgreSQL 正在運行，測試數據庫連接:" -ForegroundColor Gray
Write-Host "   npx prisma db pull" -ForegroundColor Cyan
Write-Host "2. 如果連接成功，運行註冊修復:" -ForegroundColor Gray
Write-Host "   .\fix-register-now.bat" -ForegroundColor Cyan
Write-Host "3. 啟動開發服務器:" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Cyan

Write-Host "`n按任意鍵繼續..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")