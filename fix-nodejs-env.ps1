# 修復 Node.js 環境變量腳本
Write-Host "🔧 修復 Node.js 環境變量" -ForegroundColor Green

# 獲取 Node.js 安裝路徑
$nodePath = (Get-Command node).Source
$nodeDir = Split-Path $nodePath -Parent
Write-Host "Node.js 安裝目錄: $nodeDir" -ForegroundColor Yellow

# 設置環境變量
$env:NODE_PATH = $nodeDir
$env:npm_config_prefix = $nodeDir

Write-Host "設置環境變量:" -ForegroundColor Cyan
Write-Host "NODE_PATH = $nodeDir" -ForegroundColor White
Write-Host "npm_config_prefix = $nodeDir" -ForegroundColor White

# 測試 Node.js 功能
Write-Host "`n🧪 測試 Node.js 功能..." -ForegroundColor Cyan

try {
    $nodeVersion = & $nodePath --version
    Write-Host "✅ Node.js 版本: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js 測試失敗" -ForegroundColor Red
}

# 測試 npm
$npmPath = Join-Path $nodeDir "npm.cmd"
if (Test-Path $npmPath) {
    try {
        $npmVersion = & $npmPath --version
        Write-Host "✅ npm 版本: $npmVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ npm 測試失敗" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️ npm.cmd 未找到在: $npmPath" -ForegroundColor Yellow
}

# 測試 npx
$npxPath = Join-Path $nodeDir "npx.cmd"
if (Test-Path $npxPath) {
    try {
        $npxVersion = & $npxPath --version
        Write-Host "✅ npx 版本: $npxVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ npx 測試失敗" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️ npx.cmd 未找到在: $npxPath" -ForegroundColor Yellow
}

Write-Host "`n🎯 下一步:" -ForegroundColor Cyan
Write-Host "1. 重啟 Trae IDE" -ForegroundColor White
Write-Host "2. 測試 Trae 市場 MCP 功能" -ForegroundColor White