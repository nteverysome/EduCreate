# PostgreSQL 自動安裝和配置腳本
# 設置控制台編碼
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# 創建日誌文件
$logFile = "postgresql-install-log-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    Write-Host $logEntry
    Add-Content -Path $logFile -Value $logEntry
}

function Test-AdminRights {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "     PostgreSQL 自動安裝配置工具" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

Write-Log "開始 PostgreSQL 安裝和配置過程"

# 檢查管理員權限
if (-not (Test-AdminRights)) {
    Write-Host "❌ 需要管理員權限運行此腳本" -ForegroundColor Red
    Write-Log "錯誤: 需要管理員權限" "ERROR"
    Read-Host "按 Enter 鍵退出"
    exit 1
}

Write-Host "✅ 管理員權限檢查通過" -ForegroundColor Green
Write-Log "管理員權限檢查通過"

# 步驟 1: 檢查現有安裝
Write-Host "
🔍 步驟 1: 檢查現有 PostgreSQL 安裝..." -ForegroundColor Yellow
Write-Log "檢查現有 PostgreSQL 安裝"

$existingServices = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($existingServices) {
    Write-Host "✅ 發現現有 PostgreSQL 服務:" -ForegroundColor Green
    foreach ($svc in $existingServices) {
        Write-Host "   $($svc.Name) - $($svc.Status)" -ForegroundColor Gray
        Write-Log "發現服務: $($svc.Name) - $($svc.Status)"
    }
} else {
    Write-Host "❌ 未發現 PostgreSQL 服務" -ForegroundColor Red
    Write-Log "未發現 PostgreSQL 服務"
}

# 檢查端口 5432
$port5432 = Get-NetTCPConnection -LocalPort 5432 -ErrorAction SilentlyContinue
if ($port5432) {
    Write-Host "⚠️  端口 5432 已被使用 (PID: $($port5432.OwningProcess))" -ForegroundColor Yellow
    Write-Log "端口 5432 已被使用 (PID: $($port5432.OwningProcess))"
} else {
    Write-Host "✅ 端口 5432 可用" -ForegroundColor Green
    Write-Log "端口 5432 可用"
}

# 步驟 2: 檢查 Chocolatey
Write-Host "
🔍 步驟 2: 檢查 Chocolatey..." -ForegroundColor Yellow
Write-Log "檢查 Chocolatey"

try {
    $chocoVersion = choco --version 2>$null
    if ($chocoVersion) {
        Write-Host "✅ Chocolatey 已安裝 (版本: $chocoVersion)" -ForegroundColor Green
        Write-Log "Chocolatey 已安裝 (版本: $chocoVersion)"
        $chocoInstalled = $true
    } else {
        throw "Chocolatey 未安裝"
    }
} catch {
    Write-Host "❌ Chocolatey 未安裝" -ForegroundColor Red
    Write-Log "Chocolatey 未安裝"
    $chocoInstalled = $false
}

# 步驟 3: 安裝 Chocolatey (如果需要)
if (-not $chocoInstalled) {
    Write-Host "
🔧 步驟 3: 安裝 Chocolatey..." -ForegroundColor Yellow
    Write-Log "開始安裝 Chocolatey"
    
    try {
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
        
        # 重新加載環境變量
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
        Write-Host "✅ Chocolatey 安裝成功" -ForegroundColor Green
        Write-Log "Chocolatey 安裝成功"
        $chocoInstalled = $true
    } catch {
        Write-Host "❌ Chocolatey 安裝失敗: $($_.Exception.Message)" -ForegroundColor Red
        Write-Log "Chocolatey 安裝失敗: $($_.Exception.Message)" "ERROR"
    }
}

# 步驟 4: 安裝 PostgreSQL
if ($chocoInstalled -and -not $existingServices) {
    Write-Host "
🔧 步驟 4: 安裝 PostgreSQL..." -ForegroundColor Yellow
    Write-Log "開始安裝 PostgreSQL"
    
    try {
        # 使用 Chocolatey 安裝 PostgreSQL
        choco install postgresql14 --params '/Password:password' -y
        
        Write-Host "✅ PostgreSQL 安裝完成" -ForegroundColor Green
        Write-Log "PostgreSQL 安裝完成"
        
        # 等待服務啟動
        Write-Host "⏳ 等待 PostgreSQL 服務啟動..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        
    } catch {
        Write-Host "❌ PostgreSQL 安裝失敗: $($_.Exception.Message)" -ForegroundColor Red
        Write-Log "PostgreSQL 安裝失敗: $($_.Exception.Message)" "ERROR"
    }
}

# 步驟 5: 檢查服務狀態
Write-Host "
🔍 步驟 5: 檢查 PostgreSQL 服務狀態..." -ForegroundColor Yellow
Write-Log "檢查 PostgreSQL 服務狀態"

$pgServices = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($pgServices) {
    foreach ($svc in $pgServices) {
        if ($svc.Status -eq 'Running') {
            Write-Host "✅ $($svc.Name) 正在運行" -ForegroundColor Green
            Write-Log "服務 $($svc.Name) 正在運行"
        } else {
            Write-Host "⚠️  $($svc.Name) 未運行，嘗試啟動..." -ForegroundColor Yellow
            Write-Log "嘗試啟動服務 $($svc.Name)"
            try {
                Start-Service $svc.Name
                Write-Host "✅ $($svc.Name) 啟動成功" -ForegroundColor Green
                Write-Log "服務 $($svc.Name) 啟動成功"
            } catch {
                Write-Host "❌ $($svc.Name) 啟動失敗: $($_.Exception.Message)" -ForegroundColor Red
                Write-Log "服務 $($svc.Name) 啟動失敗: $($_.Exception.Message)" "ERROR"
            }
        }
    }
} else {
    Write-Host "❌ 未找到 PostgreSQL 服務" -ForegroundColor Red
    Write-Log "未找到 PostgreSQL 服務" "ERROR"
}

# 步驟 6: 創建數據庫
Write-Host "
🔧 步驟 6: 創建 educreate 數據庫..." -ForegroundColor Yellow
Write-Log "創建 educreate 數據庫"

try {
    # 設置 PostgreSQL 環境變量
    $pgPath = "C:\Program Files\PostgreSQL\14\bin"
    if (Test-Path $pgPath) {
        $env:Path += ";$pgPath"
    }
    
    # 創建數據庫
    $createDbCmd = "createdb -U postgres -h localhost educreate"
    Write-Host "執行: $createDbCmd" -ForegroundColor Gray
    
    # 使用 PGPASSWORD 環境變量
    $env:PGPASSWORD = "password"
    
    $result = cmd /c "createdb -U postgres -h localhost educreate 2>&1"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 數據庫 educreate 創建成功" -ForegroundColor Green
        Write-Log "數據庫 educreate 創建成功"
    } else {
        if ($result -like "*already exists*") {
            Write-Host "✅ 數據庫 educreate 已存在" -ForegroundColor Green
            Write-Log "數據庫 educreate 已存在"
        } else {
            Write-Host "⚠️  創建數據庫時出現問題: $result" -ForegroundColor Yellow
            Write-Log "創建數據庫時出現問題: $result" "WARNING"
        }
    }
    
} catch {
    Write-Host "❌ 創建數據庫失敗: $($_.Exception.Message)" -ForegroundColor Red
    Write-Log "創建數據庫失敗: $($_.Exception.Message)" "ERROR"
}

# 步驟 7: 測試數據庫連接
Write-Host "
🔍 步驟 7: 測試數據庫連接..." -ForegroundColor Yellow
Write-Log "測試數據庫連接"

try {
    if (Test-Path "quick-db-test.js") {
        node quick-db-test.js
        Write-Log "數據庫連接測試完成"
    } else {
        Write-Host "⚠️  未找到 quick-db-test.js 文件" -ForegroundColor Yellow
        Write-Log "未找到 quick-db-test.js 文件" "WARNING"
    }
} catch {
    Write-Host "❌ 數據庫連接測試失敗: $($_.Exception.Message)" -ForegroundColor Red
    Write-Log "數據庫連接測試失敗: $($_.Exception.Message)" "ERROR"
}

# 步驟 8: 運行 Prisma 遷移
Write-Host "
🔧 步驟 8: 運行 Prisma 遷移..." -ForegroundColor Yellow
Write-Log "運行 Prisma 遷移"

try {
    npx prisma db push
    Write-Host "✅ Prisma 遷移完成" -ForegroundColor Green
    Write-Log "Prisma 遷移完成"
} catch {
    Write-Host "❌ Prisma 遷移失敗: $($_.Exception.Message)" -ForegroundColor Red
    Write-Log "Prisma 遷移失敗: $($_.Exception.Message)" "ERROR"
}

# 生成完成報告
Write-Host "
📋 安裝完成報告" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

$completionReport = @()

# 檢查服務狀態
$pgServices = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($pgServices -and ($pgServices | Where-Object {$_.Status -eq 'Running'})) {
    Write-Host "✅ PostgreSQL 服務正在運行" -ForegroundColor Green
    $completionReport += "✅ PostgreSQL 服務正在運行"
} else {
    Write-Host "❌ PostgreSQL 服務未運行" -ForegroundColor Red
    $completionReport += "❌ PostgreSQL 服務未運行"
}

# 檢查端口
$port5432 = Get-NetTCPConnection -LocalPort 5432 -ErrorAction SilentlyContinue
if ($port5432) {
    Write-Host "✅ 端口 5432 可訪問" -ForegroundColor Green
    $completionReport += "✅ 端口 5432 可訪問"
} else {
    Write-Host "❌ 端口 5432 不可訪問" -ForegroundColor Red
    $completionReport += "❌ 端口 5432 不可訪問"
}

# 檢查環境配置
if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local" -Raw
    if ($envContent -like "*DATABASE_URL*") {
        Write-Host "✅ DATABASE_URL 已配置" -ForegroundColor Green
        $completionReport += "✅ DATABASE_URL 已配置"
    } else {
        Write-Host "❌ DATABASE_URL 未配置" -ForegroundColor Red
        $completionReport += "❌ DATABASE_URL 未配置"
    }
} else {
    Write-Host "❌ .env.local 文件不存在" -ForegroundColor Red
    $completionReport += "❌ .env.local 文件不存在"
}

# 保存完成報告
$reportFile = "postgresql-completion-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
Write-Log "生成完成報告: $reportFile"

$reportContent = @"
==========================================
     PostgreSQL 安裝完成報告
==========================================

安裝時間: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

完成狀態:
$($completionReport -join "`n")

下一步操作:
1. 如果服務未運行，請手動啟動 PostgreSQL 服務
2. 確認 .env.local 中的 DATABASE_URL 配置正確
3. 運行 'npm run dev' 啟動開發服務器
4. 測試註冊功能

故障排除:
- 查看安裝日誌: $logFile
- 運行診斷腳本: powershell -ExecutionPolicy Bypass -File fix-postgresql-connection.ps1
- 手動測試連接: node quick-db-test.js

==========================================
"@

Set-Content -Path $reportFile -Value $reportContent

Write-Host "
🎯 安裝過程完成！" -ForegroundColor Green
Write-Host "📄 詳細日誌: $logFile" -ForegroundColor Gray
Write-Host "📋 完成報告: $reportFile" -ForegroundColor Gray

Write-Log "PostgreSQL 安裝和配置過程完成"

Read-Host "按 Enter 鍵退出"