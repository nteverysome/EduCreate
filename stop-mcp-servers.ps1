# MCP服务器停止脚本

Write-Host "========================================" -ForegroundColor Red
Write-Host "    MCP 服务器停止脚本" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

Write-Host "🛑 正在停止MCP服务器..." -ForegroundColor Yellow
Write-Host ""

# 定义要停止的进程名称和关键词
$MCPProcesses = @(
    "node",
    "python"
)

$MCPKeywords = @(
    "mcp-sqlite-server",
    "playwright-mcp",
    "mem0-mcp",
    "uns_mcp",
    "sequential-thinking",
    "mcp-memory"
)

$StoppedCount = 0

# 获取所有相关进程
foreach ($ProcessName in $MCPProcesses) {
    $Processes = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue
    
    foreach ($Process in $Processes) {
        try {
            # 检查进程命令行是否包含MCP相关关键词
            $CommandLine = (Get-WmiObject Win32_Process -Filter "ProcessId = $($Process.Id)").CommandLine
            
            $IsMCPProcess = $false
            foreach ($Keyword in $MCPKeywords) {
                if ($CommandLine -like "*$Keyword*") {
                    $IsMCPProcess = $true
                    break
                }
            }
            
            if ($IsMCPProcess) {
                Write-Host "🔴 停止进程: $($Process.ProcessName) (PID: $($Process.Id))" -ForegroundColor Red
                Write-Host "   命令行: $CommandLine" -ForegroundColor Gray
                
                $Process.Kill()
                $StoppedCount++
                
                Write-Host "   ✅ 已停止" -ForegroundColor Green
                Start-Sleep -Milliseconds 500
            }
        }
        catch {
            Write-Host "   ❌ 停止失败: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host ""
if ($StoppedCount -gt 0) {
    Write-Host "✅ 已停止 $StoppedCount 个MCP服务器进程" -ForegroundColor Green
} else {
    Write-Host "ℹ️  没有发现运行中的MCP服务器进程" -ForegroundColor Blue
}

Write-Host ""
Write-Host "🔍 检查剩余的相关进程..." -ForegroundColor Yellow

# 再次检查是否还有相关进程
$RemainingProcesses = @()
foreach ($ProcessName in $MCPProcesses) {
    $Processes = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue
    
    foreach ($Process in $Processes) {
        $CommandLine = (Get-WmiObject Win32_Process -Filter "ProcessId = $($Process.Id)").CommandLine
        
        foreach ($Keyword in $MCPKeywords) {
            if ($CommandLine -like "*$Keyword*") {
                $RemainingProcesses += $Process
                break
            }
        }
    }
}

if ($RemainingProcesses.Count -gt 0) {
    Write-Host "⚠️  发现 $($RemainingProcesses.Count) 个进程可能仍在运行：" -ForegroundColor Yellow
    foreach ($Process in $RemainingProcesses) {
        Write-Host "  - $($Process.ProcessName) (PID: $($Process.Id))" -ForegroundColor White
    }
    Write-Host ""
    Write-Host "💡 如需强制停止，请使用任务管理器或运行：" -ForegroundColor Cyan
    Write-Host "   taskkill /F /PID <进程ID>" -ForegroundColor Gray
} else {
    Write-Host "✅ 所有MCP服务器进程已停止" -ForegroundColor Green
}

Write-Host ""
Write-Host "按任意键退出..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
