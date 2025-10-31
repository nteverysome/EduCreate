# Node.js 環境驗證腳本
# 用於確認 Node.js 安裝成功並測試 Trae 市場 MCP

Write-Host "🔍 Node.js 環境驗證腳本" -ForegroundColor Green
Write-Host "正在檢查 Node.js 環境..." -ForegroundColor Yellow

# 檢查 Node.js
Write-Host "`n📦 檢查 Node.js..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✅ Node.js 版本: $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Node.js 未安裝或無法訪問" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Node.js 檢查失敗: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 檢查 npm
Write-Host "`n📦 檢查 npm..." -ForegroundColor Cyan
try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Write-Host "✅ npm 版本: $npmVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ npm 未安裝或無法訪問" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ npm 檢查失敗: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 檢查 npx
Write-Host "`n📦 檢查 npx..." -ForegroundColor Cyan
try {
    $npxVersion = npx --version 2>$null
    if ($npxVersion) {
        Write-Host "✅ npx 版本: $npxVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ npx 未安裝或無法訪問" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ npx 檢查失敗: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 測試 Trae 市場 MCP 服務器
Write-Host "`n🧪 測試 Trae 市場 MCP 服務器..." -ForegroundColor Cyan

# 測試 chrome-devtools-mcp
Write-Host "測試 chrome-devtools-mcp..." -ForegroundColor Yellow
try {
    $chromeTest = npx chrome-devtools-mcp@latest --help 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ chrome-devtools-mcp 可用" -ForegroundColor Green
    } else {
        Write-Host "⚠️ chrome-devtools-mcp 測試失敗，但這可能是正常的" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ chrome-devtools-mcp 測試異常: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 測試 sequential-thinking
Write-Host "測試 sequential-thinking..." -ForegroundColor Yellow
try {
    $seqTest = npx @modelcontextprotocol/server-sequential-thinking --help 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ sequential-thinking 可用" -ForegroundColor Green
    } else {
        Write-Host "⚠️ sequential-thinking 測試失敗，但這可能是正常的" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ sequential-thinking 測試異常: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 測試 playwright-mcp
Write-Host "測試 playwright-mcp..." -ForegroundColor Yellow
try {
    $playwrightTest = npx @executeautomation/playwright-mcp-server --help 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ playwright-mcp 可用" -ForegroundColor Green
    } else {
        Write-Host "⚠️ playwright-mcp 測試失敗，但這可能是正常的" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ playwright-mcp 測試異常: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 測試 context7
Write-Host "測試 context7..." -ForegroundColor Yellow
try {
    $contextTest = npx @upstash/context7-mcp@latest --help 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ context7 可用" -ForegroundColor Green
    } else {
        Write-Host "⚠️ context7 測試失敗，但這可能是正常的" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ context7 測試異常: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n🎉 Node.js 環境驗證完成！" -ForegroundColor Green
Write-Host "如果所有基本檢查都通過，您現在可以:" -ForegroundColor Yellow
Write-Host "1. 使用 mcp-marketplace.json 配置文件" -ForegroundColor White
Write-Host "2. 重啟 Trae IDE" -ForegroundColor White
Write-Host "3. 享受 Trae 市場 MCP 功能！" -ForegroundColor White