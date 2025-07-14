# Sequential Thinking MCP Startup Script
# Enable Augment to use sequential-thinking MCP during regular coding

Write-Host "Starting Sequential Thinking MCP Server..." -ForegroundColor Cyan

# 設置工作目錄
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$mcpPath = Join-Path $scriptPath "sequential-thinking-zalab"

# 檢查 MCP 服務器是否存在
if (-not (Test-Path $mcpPath)) {
    Write-Host "❌ Sequential Thinking MCP 路徑不存在: $mcpPath" -ForegroundColor Red
    exit 1
}

# 檢查 Node.js 是否安裝
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js 版本: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js 未安裝或不在 PATH 中" -ForegroundColor Red
    exit 1
}

# 檢查 MCP 服務器文件
$mcpServerPath = Join-Path $mcpPath "dist\index.js"
if (-not (Test-Path $mcpServerPath)) {
    Write-Host "⚠️  編譯後的服務器文件不存在，嘗試構建..." -ForegroundColor Yellow
    
    Set-Location $mcpPath
    try {
        npm run build
        Write-Host "✅ MCP 服務器構建成功" -ForegroundColor Green
    } catch {
        Write-Host "❌ MCP 服務器構建失敗" -ForegroundColor Red
        exit 1
    }
    Set-Location $scriptPath
}

# 啟動 Sequential Thinking MCP 服務器
Write-Host "🚀 啟動 Sequential Thinking MCP 服務器..." -ForegroundColor Green
Write-Host "📍 服務器路徑: $mcpServerPath" -ForegroundColor Gray
Write-Host "🔧 使用命令: node `"$mcpServerPath`"" -ForegroundColor Gray

try {
    # 在後台啟動 MCP 服務器
    $process = Start-Process -FilePath "node" -ArgumentList "`"$mcpServerPath`"" -PassThru -WindowStyle Hidden
    
    # 等待一下讓服務器啟動
    Start-Sleep -Seconds 2
    
    # 檢查進程是否還在運行
    if (Get-Process -Id $process.Id -ErrorAction SilentlyContinue) {
        Write-Host "✅ Sequential Thinking MCP 服務器已啟動" -ForegroundColor Green
        Write-Host "🆔 進程 ID: $($process.Id)" -ForegroundColor Gray
        Write-Host "📋 服務器功能:" -ForegroundColor Cyan
        Write-Host "   • 動態問題分解" -ForegroundColor White
        Write-Host "   • 反思性思考" -ForegroundColor White
        Write-Host "   • 分支推理" -ForegroundColor White
        Write-Host "   • 假設生成和驗證" -ForegroundColor White
        Write-Host "   • 步驟化分析" -ForegroundColor White
        
        Write-Host "`n🎯 現在您可以在 Augment 中使用 sequential-thinking 工具了！" -ForegroundColor Green
        Write-Host "💡 使用方式: 在對話中提及複雜問題，Augment 會自動使用 sequential-thinking 進行分析" -ForegroundColor Yellow
        
        # 保存進程 ID 以便後續管理
        $process.Id | Out-File -FilePath "sequential-thinking-mcp.pid" -Encoding UTF8
        
    } else {
        Write-Host "❌ Sequential Thinking MCP 服務器啟動失敗" -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "❌ 啟動 Sequential Thinking MCP 服務器時發生錯誤: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n📖 使用說明:" -ForegroundColor Cyan
Write-Host "1. Sequential Thinking MCP 現在已在後台運行" -ForegroundColor White
Write-Host "2. 在 Augment 中處理複雜問題時會自動使用" -ForegroundColor White
Write-Host "3. 特別適用於:" -ForegroundColor White
Write-Host "   • 代碼架構設計" -ForegroundColor Gray
Write-Host "   • 複雜算法實現" -ForegroundColor Gray
Write-Host "   • 問題調試分析" -ForegroundColor Gray
Write-Host "   • 系統設計規劃" -ForegroundColor Gray
Write-Host "4. 要停止服務器，運行: .\stop-sequential-thinking-mcp.ps1" -ForegroundColor White

Write-Host "`n🎉 Sequential Thinking MCP 配置完成！" -ForegroundColor Green
