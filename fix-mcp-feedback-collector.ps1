# MCP 反馈收集器修复脚本
# 用于诊断和修复 mcp-feedback-collector 连接问题

Write-Host "=== MCP 反馈收集器诊断和修复 ===" -ForegroundColor Cyan
Write-Host ""

# 1. 检查 Python 环境
Write-Host "1. 检查 Python 环境..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "   ✅ Python 版本: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Python 未安装或不在 PATH 中" -ForegroundColor Red
    exit 1
}

# 2. 检查 MCP 服务器文件
Write-Host ""
Write-Host "2. 检查 MCP 服务器文件..." -ForegroundColor Yellow
$mcpServerPath = "mcp-feedback-collector\src\mcp_feedback_collector\server.py"
if (Test-Path $mcpServerPath) {
    Write-Host "   ✅ MCP 服务器文件存在: $mcpServerPath" -ForegroundColor Green
} else {
    Write-Host "   ❌ MCP 服务器文件不存在: $mcpServerPath" -ForegroundColor Red
    exit 1
}

# 3. 检查 Python 依赖
Write-Host ""
Write-Host "3. 检查 Python 依赖..." -ForegroundColor Yellow
$requirementsPath = "mcp-feedback-collector\requirements.txt"
if (Test-Path $requirementsPath) {
    Write-Host "   ✅ requirements.txt 存在" -ForegroundColor Green
    Write-Host "   📦 安装依赖..." -ForegroundColor Cyan
    pip install -r $requirementsPath --quiet
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ 依赖安装成功" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  依赖安装可能有问题" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⚠️  requirements.txt 不存在" -ForegroundColor Yellow
}

# 4. 测试 MCP 服务器启动
Write-Host ""
Write-Host "4. 测试 MCP 服务器启动..." -ForegroundColor Yellow
Write-Host "   启动 MCP 服务器（5秒测试）..." -ForegroundColor Cyan

$job = Start-Job -ScriptBlock {
    param($serverPath)
    python $serverPath
} -ArgumentList (Resolve-Path $mcpServerPath).Path

Start-Sleep -Seconds 5

if ($job.State -eq "Running") {
    Write-Host "   ✅ MCP 服务器成功启动" -ForegroundColor Green
    Stop-Job $job
    Remove-Job $job
} else {
    Write-Host "   ❌ MCP 服务器启动失败" -ForegroundColor Red
    $jobOutput = Receive-Job $job
    if ($jobOutput) {
        Write-Host "   错误输出:" -ForegroundColor Red
        Write-Host $jobOutput -ForegroundColor Red
    }
    Remove-Job $job
}

# 5. 检查 Augment 配置目录
Write-Host ""
Write-Host "5. 检查 Augment 配置目录..." -ForegroundColor Yellow
$augmentConfigPaths = @(
    "$env:APPDATA\augment-vscode",
    "$env:APPDATA\Code\User\globalStorage\augment.augment",
    "$env:USERPROFILE\.augment",
    "$env:USERPROFILE\.config\augment"
)

$foundConfig = $false
foreach ($path in $augmentConfigPaths) {
    if (Test-Path $path) {
        Write-Host "   ✅ 找到 Augment 配置目录: $path" -ForegroundColor Green
        $foundConfig = $true
        
        # 列出目录内容
        Write-Host "   📁 目录内容:" -ForegroundColor Cyan
        Get-ChildItem $path -Recurse -Depth 2 | ForEach-Object {
            Write-Host "      $($_.FullName)" -ForegroundColor Gray
        }
    }
}

if (-not $foundConfig) {
    Write-Host "   ⚠️  未找到 Augment 配置目录" -ForegroundColor Yellow
    Write-Host "   可能的原因:" -ForegroundColor Yellow
    Write-Host "   - Augment 未正确安装" -ForegroundColor Yellow
    Write-Host "   - 配置目录在其他位置" -ForegroundColor Yellow
}

# 6. 创建 MCP 配置文件（如果需要）
Write-Host ""
Write-Host "6. 创建/更新 MCP 配置..." -ForegroundColor Yellow

$mcpConfig = @{
    mcpServers = @{
        "feedback-collector" = @{
            command = "python"
            args = @(
                (Resolve-Path $mcpServerPath).Path
            )
            env = @{
                MCP_DIALOG_TIMEOUT = "1200"
                PYTHONPATH = (Resolve-Path "mcp-feedback-collector\src").Path
                MCP_SERVER_NAME = "feedback-collector"
            }
        }
    }
} | ConvertTo-Json -Depth 10

$configOutputPath = "mcp-config-generated.json"
$mcpConfig | Out-File -FilePath $configOutputPath -Encoding UTF8
Write-Host "   ✅ MCP 配置已生成: $configOutputPath" -ForegroundColor Green
Write-Host "   📋 配置内容:" -ForegroundColor Cyan
Write-Host $mcpConfig -ForegroundColor Gray

# 7. 提供修复建议
Write-Host ""
Write-Host "=== 修复建议 ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "如果 MCP 仍然无法连接，请尝试以下步骤:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. 重启 VSCode/Augment" -ForegroundColor White
Write-Host "   - 完全关闭 VSCode" -ForegroundColor Gray
Write-Host "   - 重新打开以加载新的 MCP 配置" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 手动配置 Augment MCP" -ForegroundColor White
Write-Host "   - 打开 Augment 设置" -ForegroundColor Gray
Write-Host "   - 找到 MCP 服务器配置选项" -ForegroundColor Gray
Write-Host "   - 导入生成的配置文件: $configOutputPath" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 检查 Augment 日志" -ForegroundColor White
Write-Host "   - 查看 Augment 的错误日志" -ForegroundColor Gray
Write-Host "   - 寻找 MCP 相关的错误信息" -ForegroundColor Gray
Write-Host ""
Write-Host "4. 使用替代方案" -ForegroundColor White
Write-Host "   - 在 MCP 修复前，直接在对话中收集反馈" -ForegroundColor Gray
Write-Host "   - 使用其他工具（如 GitHub Issues）" -ForegroundColor Gray
Write-Host ""

# 8. 生成诊断报告
Write-Host "=== 生成诊断报告 ===" -ForegroundColor Cyan
$diagnosticReport = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    pythonVersion = $pythonVersion
    mcpServerExists = Test-Path $mcpServerPath
    augmentConfigFound = $foundConfig
    configGenerated = Test-Path $configOutputPath
} | ConvertTo-Json -Depth 10

$reportPath = "mcp-diagnostic-report.json"
$diagnosticReport | Out-File -FilePath $reportPath -Encoding UTF8
Write-Host "✅ 诊断报告已保存: $reportPath" -ForegroundColor Green
Write-Host ""
Write-Host "=== 诊断完成 ===" -ForegroundColor Cyan

