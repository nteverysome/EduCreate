# EduCreate 401 認證錯誤修復工具 (PowerShell 版本)
# 解決 API 認證中間件和測試令牌相關問題

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   EduCreate 401 認證錯誤修復工具" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# 設置錯誤處理
$ErrorActionPreference = "Stop"

try {
    # 檢查 Node.js 是否安裝
    Write-Host "🔍 檢查 Node.js 安裝..." -ForegroundColor Yellow
    $nodeVersion = node --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 錯誤: 未找到 Node.js，請先安裝 Node.js" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Node.js 已安裝: $nodeVersion" -ForegroundColor Green
    
    # 檢查 npm 是否可用
    $npmVersion = npm --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 錯誤: 未找到 npm，請檢查 Node.js 安裝" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ npm 已安裝: $npmVersion" -ForegroundColor Green
    Write-Host ""
    
    # 檢查並安裝依賴
    if (!(Test-Path "node_modules")) {
        Write-Host "📦 安裝項目依賴..." -ForegroundColor Yellow
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ 依賴安裝失敗" -ForegroundColor Red
            exit 1
        }
        Write-Host "✅ 依賴安裝完成" -ForegroundColor Green
        Write-Host ""
    }
    
    # 運行修復腳本
    Write-Host "🔧 運行認證修復腳本..." -ForegroundColor Yellow
    node fix-auth-401-errors.js
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 修復腳本執行失敗" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host "   修復完成！" -ForegroundColor Green
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "📋 接下來的步驟:" -ForegroundColor Cyan
    Write-Host "1. 檢查 .env 文件中的配置" -ForegroundColor White
    Write-Host "2. 運行 'npm run dev' 啟動開發服務器" -ForegroundColor White
    Write-Host "3. 在瀏覽器中測試 http://localhost:3000" -ForegroundColor White
    Write-Host ""
    
    Write-Host "📚 如果仍有問題，請查看:" -ForegroundColor Cyan
    Write-Host "- ERROR-FIX-README.md" -ForegroundColor White
    Write-Host "- REGISTER-FIX-README.md" -ForegroundColor White
    Write-Host ""
    
    # 詢問是否立即啟動開發服務器
    $startServer = Read-Host "是否立即啟動開發服務器？(y/N)"
    if ($startServer -eq "y" -or $startServer -eq "Y") {
        Write-Host "🚀 啟動開發服務器..." -ForegroundColor Yellow
        npm run dev
    }
    
} catch {
    Write-Host "❌ 執行過程中發生錯誤: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "請檢查錯誤信息並重試" -ForegroundColor Yellow
    exit 1
}

Write-Host "按任意鍵退出..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")