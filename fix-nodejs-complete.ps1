# 完整修復 Node.js 環境腳本
Write-Host "🔧 完整修復 Node.js 環境" -ForegroundColor Green

# 1. 清理現有的 Node.js 路徑
Write-Host "`n📋 當前 PATH 中的 Node.js 路徑:" -ForegroundColor Cyan
$env:PATH -split ';' | Where-Object { $_ -like '*node*' } | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }

# 2. 設置正確的 Node.js 路徑
$nodeDir = "C:\Users\Administrator\Tools\node\node-v23.9.0-win-x64"
Write-Host "`n🎯 設置 Node.js 路徑: $nodeDir" -ForegroundColor Cyan

# 3. 臨時設置環境變量
$env:PATH = "$nodeDir;" + $env:PATH
$env:NODE_PATH = $nodeDir

Write-Host "✅ 環境變量已設置" -ForegroundColor Green

# 4. 測試 Node.js
Write-Host "`n🧪 測試 Node.js..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js 版本: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js 測試失敗: $_" -ForegroundColor Red
    exit 1
}

# 5. 測試 npm
Write-Host "`n🧪 測試 npm..." -ForegroundColor Cyan
try {
    $npmVersion = npm --version
    Write-Host "✅ npm 版本: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm 測試失敗: $_" -ForegroundColor Red
    exit 1
}

# 6. 測試 npx
Write-Host "`n🧪 測試 npx..." -ForegroundColor Cyan
try {
    $npxVersion = npx --version
    Write-Host "✅ npx 版本: $npxVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npx 測試失敗: $_" -ForegroundColor Red
    exit 1
}

# 7. 測試 chrome-devtools-mcp
Write-Host "`n🧪 測試 chrome-devtools-mcp..." -ForegroundColor Cyan
try {
    $output = npx chrome-devtools-mcp@latest --help 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ chrome-devtools-mcp 可用" -ForegroundColor Green
    } else {
        Write-Host "⚠️ chrome-devtools-mcp 測試警告，但可能正常" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ chrome-devtools-mcp 測試失敗: $_" -ForegroundColor Red
}

# 8. 永久設置環境變量（用戶級別）
Write-Host "`n🔧 設置永久環境變量..." -ForegroundColor Cyan
try {
    # 獲取當前用戶 PATH
    $userPath = [Environment]::GetEnvironmentVariable("PATH", "User")
    
    # 檢查是否已包含 Node.js 路徑
    if ($userPath -notlike "*$nodeDir*") {
        $newPath = "$nodeDir;$userPath"
        [Environment]::SetEnvironmentVariable("PATH", $newPath, "User")
        Write-Host "已將 Node.js 路徑添加到用戶 PATH" -ForegroundColor Green
    } else {
        Write-Host "Node.js 路徑已存在於用戶 PATH" -ForegroundColor Green
    }
} catch {
    Write-Host "設置永久環境變量失敗: $_" -ForegroundColor Yellow
}

Write-Host "`n🎉 Node.js 環境修復完成！" -ForegroundColor Green
Write-Host "`n📋 下一步:" -ForegroundColor Cyan
Write-Host "1. 重啟 Trae IDE" -ForegroundColor White
Write-Host "2. 測試 Trae 市場 MCP 功能" -ForegroundColor White
Write-Host "3. 如果問題仍然存在，請重啟 PowerShell" -ForegroundColor White