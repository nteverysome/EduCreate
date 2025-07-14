# Sequential Thinking MCP 停止腳本

Write-Host "🛑 停止 Sequential Thinking MCP 服務器..." -ForegroundColor Yellow

# 檢查 PID 文件是否存在
$pidFile = "sequential-thinking-mcp.pid"
if (Test-Path $pidFile) {
    try {
        $processId = Get-Content $pidFile -ErrorAction Stop
        
        # 檢查進程是否還在運行
        $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
        if ($process) {
            # 停止進程
            Stop-Process -Id $processId -Force
            Write-Host "✅ Sequential Thinking MCP 服務器已停止 (PID: $processId)" -ForegroundColor Green
        } else {
            Write-Host "⚠️  進程 $processId 已經不存在" -ForegroundColor Yellow
        }
        
        # 刪除 PID 文件
        Remove-Item $pidFile -Force
        
    } catch {
        Write-Host "❌ 讀取 PID 文件失敗: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  PID 文件不存在，嘗試查找並停止所有相關進程..." -ForegroundColor Yellow
}

# 查找並停止所有 sequential-thinking MCP 相關進程
try {
    $processes = Get-Process | Where-Object { 
        $_.ProcessName -eq "node" -and 
        $_.CommandLine -like "*sequential-thinking*" 
    }
    
    if ($processes) {
        foreach ($proc in $processes) {
            Stop-Process -Id $proc.Id -Force
            Write-Host "✅ 停止進程: $($proc.Id)" -ForegroundColor Green
        }
    } else {
        Write-Host "ℹ️  沒有找到運行中的 Sequential Thinking MCP 進程" -ForegroundColor Blue
    }
} catch {
    Write-Host "⚠️  查找進程時發生錯誤: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "🎉 Sequential Thinking MCP 服務器停止完成！" -ForegroundColor Green
