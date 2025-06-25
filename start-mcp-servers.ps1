# MCP服务器启动脚本 (PowerShell版本)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    MCP 服务器启动脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🚀 启动MCP服务器..." -ForegroundColor Green
Write-Host ""

# 获取脚本目录
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 定义MCP服务器配置
$MCPServers = @(
    @{
        Name = "SQLite MCP"
        Command = "node"
        Args = "mcp-sqlite-jparkerweb/mcp-sqlite-server.js"
        WorkingDir = $ScriptDir
        Icon = "📁"
    }
    @{
        Name = "Microsoft Playwright MCP"
        Command = "node"
        Args = "playwright-mcp-microsoft/index.js"
        WorkingDir = $ScriptDir
        Icon = "🎭"
    }
    @{
        Name = "Mem0 MCP"
        Command = "python"
        Args = "mem0-mcp/main.py"
        WorkingDir = $ScriptDir
        Icon = "🧠"
    }
    @{
        Name = "Unstructured MCP"
        Command = "python"
        Args = "-m uns_mcp"
        WorkingDir = (Join-Path $ScriptDir "unstructured-mcp")
        Icon = "📄"
    }
    @{
        Name = "Sequential Thinking MCP"
        Command = "node"
        Args = "sequential-thinking-zalab/src/index.js"
        WorkingDir = $ScriptDir
        Icon = "💭"
    }
    @{
        Name = "Alternative Memory MCP"
        Command = "node"
        Args = "mcp-memory-sdimitrov/src/index.js"
        WorkingDir = $ScriptDir
        Icon = "🗄️"
    }
)

$StartedServers = @()

foreach ($Server in $MCPServers) {
    try {
        Write-Host "$($Server.Icon) 启动 $($Server.Name)..." -ForegroundColor Yellow
        
        $ProcessArgs = @{
            FilePath = $Server.Command
            ArgumentList = $Server.Args.Split(' ')
            WorkingDirectory = $Server.WorkingDir
            WindowStyle = "Normal"
            PassThru = $true
        }
        
        $Process = Start-Process @ProcessArgs
        
        if ($Process) {
            $StartedServers += @{
                Name = $Server.Name
                Process = $Process
                PID = $Process.Id
            }
            Write-Host "  ✅ $($Server.Name) 已启动 (PID: $($Process.Id))" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $($Server.Name) 启动失败" -ForegroundColor Red
        }
        
        Start-Sleep -Seconds 1
    }
    catch {
        Write-Host "  ❌ $($Server.Name) 启动错误: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✅ MCP服务器启动完成！" -ForegroundColor Green
Write-Host ""

Write-Host "📋 已启动的服务器：" -ForegroundColor Cyan
foreach ($Server in $StartedServers) {
    Write-Host "  - $($Server.Name) (PID: $($Server.PID))" -ForegroundColor White
}

Write-Host ""
Write-Host "💡 提示：" -ForegroundColor Yellow
Write-Host "  - 每个服务器在独立进程中运行" -ForegroundColor White
Write-Host "  - 使用任务管理器可查看和管理进程" -ForegroundColor White
Write-Host "  - 重启VS Code以加载新的MCP配置" -ForegroundColor White
Write-Host "  - 在VS Code的Copilot Chat中测试MCP功能" -ForegroundColor White

Write-Host ""
Write-Host "🔧 VS Code集成状态：" -ForegroundColor Cyan
Write-Host "  - 配置文件已更新: .vscode/settings.json" -ForegroundColor White
Write-Host "  - 通用配置已更新: mcp_settings.json" -ForegroundColor White

Write-Host ""
Write-Host "🛑 停止服务器：" -ForegroundColor Red
Write-Host "  运行 'stop-mcp-servers.ps1' 或手动结束进程" -ForegroundColor White

Write-Host ""
Write-Host "按任意键继续..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
