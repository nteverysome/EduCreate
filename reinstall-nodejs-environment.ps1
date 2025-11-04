# Node.js 環境重新安裝腳本
# 用於 Windows PowerShell

Write-Host "🔧 Node.js 環境重新安裝工具" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 第一步：檢查 Node.js 是否已安裝
Write-Host "📋 步驟 1: 檢查 Node.js 安裝狀態..." -ForegroundColor Yellow

$nodeInstalled = $false
try {
    $nodeVersion = & node --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Node.js 已安裝: $nodeVersion" -ForegroundColor Green
        $nodeInstalled = $true
    }
} catch {
    Write-Host "❌ Node.js 未找到" -ForegroundColor Red
}

# 第二步：檢查 npm
Write-Host ""
Write-Host "📋 步驟 2: 檢查 npm 安裝狀態..." -ForegroundColor Yellow

$npmInstalled = $false
try {
    $npmVersion = & npm --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ npm 已安裝: $npmVersion" -ForegroundColor Green
        $npmInstalled = $true
    }
} catch {
    Write-Host "❌ npm 未找到" -ForegroundColor Red
}

# 第三步：清理 node_modules 和 package-lock.json
Write-Host ""
Write-Host "📋 步驟 3: 清理舊的依賴..." -ForegroundColor Yellow

if (Test-Path "node_modules") {
    Write-Host "🗑️  刪除 node_modules 目錄..." -ForegroundColor Cyan
    Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
    Write-Host "✅ node_modules 已刪除" -ForegroundColor Green
}

if (Test-Path "package-lock.json") {
    Write-Host "🗑️  刪除 package-lock.json..." -ForegroundColor Cyan
    Remove-Item -Force "package-lock.json" -ErrorAction SilentlyContinue
    Write-Host "✅ package-lock.json 已刪除" -ForegroundColor Green
}

# 第四步：清理 npm 緩存
Write-Host ""
Write-Host "📋 步驟 4: 清理 npm 緩存..." -ForegroundColor Yellow

if ($npmInstalled) {
    try {
        & npm cache clean --force 2>$null
        Write-Host "✅ npm 緩存已清理" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  npm 緩存清理失敗（可能需要管理員權限）" -ForegroundColor Yellow
    }
}

# 第五步：重新安裝依賴
Write-Host ""
Write-Host "📋 步驟 5: 重新安裝依賴..." -ForegroundColor Yellow

if ($npmInstalled) {
    Write-Host "📦 運行 npm install..." -ForegroundColor Cyan
    & npm install
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ npm install 完成" -ForegroundColor Green
    } else {
        Write-Host "❌ npm install 失敗" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ npm 未安裝，無法繼續" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 請先安裝 Node.js:" -ForegroundColor Yellow
    Write-Host "   1. 訪問 https://nodejs.org/" -ForegroundColor Cyan
    Write-Host "   2. 下載 LTS 版本" -ForegroundColor Cyan
    Write-Host "   3. 運行安裝程序" -ForegroundColor Cyan
    Write-Host "   4. 重新啟動 PowerShell" -ForegroundColor Cyan
    Write-Host "   5. 再次運行此腳本" -ForegroundColor Cyan
    exit 1
}

# 第六步：驗證安裝
Write-Host ""
Write-Host "📋 步驟 6: 驗證安裝..." -ForegroundColor Yellow

try {
    $nodeVersion = & node --version
    $npmVersion = & npm --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 驗證失敗" -ForegroundColor Red
    exit 1
}

# 第七步：檢查 Playwright
Write-Host ""
Write-Host "📋 步驟 7: 檢查 Playwright..." -ForegroundColor Yellow

if (Test-Path "node_modules/@playwright/test") {
    Write-Host "✅ Playwright 已安裝" -ForegroundColor Green
} else {
    Write-Host "⚠️  Playwright 未找到，嘗試安裝..." -ForegroundColor Yellow
    & npm install @playwright/test --save-dev
}

# 完成
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ Node.js 環境重新安裝完成！" -ForegroundColor Green
Write-Host ""
Write-Host "📝 下一步:" -ForegroundColor Yellow
Write-Host "   1. 運行開發服務器: npm run dev" -ForegroundColor Cyan
Write-Host "   2. 運行 Playwright 測試: npm run test:playwright" -ForegroundColor Cyan
Write-Host "   3. 查看 Playwright UI: npm run test:playwright:ui" -ForegroundColor Cyan
Write-Host ""

