# MCP 配置切換腳本
# 用於在不同 MCP 配置之間切換

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("market", "current", "backup")]
    [string]$Config
)

$mcpPath = ".trae\mcp.json"
$marketPath = "mcp-marketplace.json"
$backupPath = ".trae\mcp-backup.json"

Write-Host "🔄 MCP 配置切換工具" -ForegroundColor Green

switch ($Config) {
    "market" {
        Write-Host "切換到 Trae 市場版本配置..." -ForegroundColor Yellow
        
        # 備份當前配置
        if (Test-Path $mcpPath) {
            Copy-Item $mcpPath $backupPath -Force
            Write-Host "✅ 當前配置已備份到: $backupPath" -ForegroundColor Green
        }
        
        # 切換到市場版本
        if (Test-Path $marketPath) {
            Copy-Item $marketPath $mcpPath -Force
            Write-Host "✅ 已切換到 Trae 市場版本配置" -ForegroundColor Green
            Write-Host "📋 包含的 MCP 服務器:" -ForegroundColor Cyan
            Write-Host "  - chrome-devtools (npx)" -ForegroundColor White
            Write-Host "  - sequential-thinking (npx)" -ForegroundColor White
            Write-Host "  - playwright (npx)" -ForegroundColor White
            Write-Host "  - context7 (npx)" -ForegroundColor White
            Write-Host "  - mcp-feedback-collector (本地)" -ForegroundColor White
        } else {
            Write-Host "❌ 市場配置文件不存在: $marketPath" -ForegroundColor Red
        }
    }
    
    "current" {
        Write-Host "保持當前配置..." -ForegroundColor Yellow
        if (Test-Path $mcpPath) {
            Write-Host "✅ 當前配置文件存在: $mcpPath" -ForegroundColor Green
        } else {
            Write-Host "❌ 當前配置文件不存在: $mcpPath" -ForegroundColor Red
        }
    }
    
    "backup" {
        Write-Host "恢復備份配置..." -ForegroundColor Yellow
        if (Test-Path $backupPath) {
            Copy-Item $backupPath $mcpPath -Force
            Write-Host "✅ 已恢復備份配置" -ForegroundColor Green
        } else {
            Write-Host "❌ 備份配置文件不存在: $backupPath" -ForegroundColor Red
        }
    }
}

Write-Host "`n⚠️ 重要提醒:" -ForegroundColor Red
Write-Host "配置更改後請重啟 Trae IDE 以生效！" -ForegroundColor Yellow

Write-Host "`n📝 使用說明:" -ForegroundColor Cyan
Write-Host "PowerShell -ExecutionPolicy Bypass -File switch-mcp-config.ps1 -Config market   # 切換到市場版本" -ForegroundColor Gray
Write-Host "PowerShell -ExecutionPolicy Bypass -File switch-mcp-config.ps1 -Config current  # 保持當前配置" -ForegroundColor Gray
Write-Host "PowerShell -ExecutionPolicy Bypass -File switch-mcp-config.ps1 -Config backup   # 恢復備份配置" -ForegroundColor Gray