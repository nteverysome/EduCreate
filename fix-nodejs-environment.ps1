# Node.js 環境修復腳本
# 用於修復 Trae 市場 MCP 的 Node.js 環境問題

Write-Host "🔧 開始修復 Node.js 環境..." -ForegroundColor Green

# 1. 檢查當前 Node.js 狀態
Write-Host "`n📋 檢查當前 Node.js 狀態..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    $npmVersion = npm --version 2>$null
    Write-Host "當前 Node.js 版本: $nodeVersion" -ForegroundColor Cyan
    Write-Host "當前 npm 版本: $npmVersion" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Node.js 未正確安裝或配置" -ForegroundColor Red
}

# 2. 檢查環境變量
Write-Host "`n🔍 檢查環境變量..." -ForegroundColor Yellow
$nodePath = $env:NODE_PATH
$npmPath = $env:npm_config_prefix
Write-Host "NODE_PATH: $nodePath" -ForegroundColor Cyan
Write-Host "npm_config_prefix: $npmPath" -ForegroundColor Cyan

# 3. 清理 npm 緩存
Write-Host "`n🧹 清理 npm 緩存..." -ForegroundColor Yellow
try {
    npm cache clean --force
    Write-Host "✅ npm 緩存清理完成" -ForegroundColor Green
} catch {
    Write-Host "⚠️ npm 緩存清理失敗，可能需要重新安裝 Node.js" -ForegroundColor Red
}

# 4. 測試 npx 功能
Write-Host "`n🧪 測試 npx 功能..." -ForegroundColor Yellow
try {
    $npxVersion = npx --version 2>$null
    Write-Host "npx 版本: $npxVersion" -ForegroundColor Green
    Write-Host "✅ npx 工作正常" -ForegroundColor Green
} catch {
    Write-Host "❌ npx 無法正常工作" -ForegroundColor Red
}

# 5. 測試 Trae 市場 MCP
Write-Host "`n🎯 測試 Trae 市場 MCP..." -ForegroundColor Yellow
Write-Host "測試 chrome-devtools-mcp..." -ForegroundColor Cyan
try {
    $testResult = npx -y chrome-devtools-mcp@latest --help 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ chrome-devtools-mcp 測試成功" -ForegroundColor Green
    } else {
        Write-Host "❌ chrome-devtools-mcp 測試失敗" -ForegroundColor Red
        Write-Host "錯誤信息: $testResult" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ chrome-devtools-mcp 測試失敗" -ForegroundColor Red
}

Write-Host "`n📝 修復建議:" -ForegroundColor Yellow
Write-Host "1. 如果 Node.js 無法正常工作，請重新安裝 Node.js" -ForegroundColor White
Write-Host "   下載地址: https://nodejs.org/" -ForegroundColor White
Write-Host "2. 或使用 Chocolatey 安裝: choco install nodejs" -ForegroundColor White
Write-Host "3. 安裝完成後重啟 PowerShell 和 Trae IDE" -ForegroundColor White
Write-Host "4. 運行此腳本驗證修復結果" -ForegroundColor White

Write-Host "`n🎉 Node.js 環境檢查完成！" -ForegroundColor Green