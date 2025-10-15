# MCP 反馈收集器自动安装脚本
# 基于 https://github.com/sanshao85/mcp-feedback-collector

Write-Host "=== MCP 反馈收集器自动安装 ===" -ForegroundColor Cyan
Write-Host ""

# 步骤 1: 安装 uvx
Write-Host "步骤 1: 安装 uvx..." -ForegroundColor Yellow
try {
    pip install uvx
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ uvx 安装成功" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  uvx 安装可能有问题" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ uvx 安装失败: $_" -ForegroundColor Red
}

# 步骤 2: 测试 MCP 服务器
Write-Host ""
Write-Host "步骤 2: 测试 MCP 服务器（5秒测试）..." -ForegroundColor Yellow
$testJob = Start-Job -ScriptBlock {
    uvx mcp-feedback-collector
}

Start-Sleep -Seconds 5

if ($testJob.State -eq "Running") {
    Write-Host "   ✅ MCP 服务器可以启动" -ForegroundColor Green
    Stop-Job $testJob
    Remove-Job $testJob
} else {
    Write-Host "   ⚠️  MCP 服务器启动可能有问题" -ForegroundColor Yellow
    Remove-Job $testJob
}

# 步骤 3: 生成 Augment MCP 配置
Write-Host ""
Write-Host "步骤 3: 生成 Augment MCP 配置..." -ForegroundColor Yellow

$mcpConfig = @"
{
  "mcpServers": {
    "mcp-feedback-collector": {
      "command": "uvx",
      "args": ["mcp-feedback-collector"],
      "env": {
        "PYTHONIOENCODING": "utf-8",
        "MCP_DIALOG_TIMEOUT": "1200"
      }
    }
  }
}
"@

$configPath = "augment-mcp-feedback-config.json"
$mcpConfig | Out-File -FilePath $configPath -Encoding UTF8
Write-Host "   ✅ 配置文件已生成: $configPath" -ForegroundColor Green

# 步骤 4: 查找 Augment 配置目录
Write-Host ""
Write-Host "步骤 4: 查找 Augment 配置目录..." -ForegroundColor Yellow

$possiblePaths = @(
    "$env:APPDATA\augment-vscode",
    "$env:APPDATA\Code\User\globalStorage\augment.augment",
    "$env:USERPROFILE\.augment",
    ".\.augment"
)

$foundPath = $null
foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        Write-Host "   ✅ 找到 Augment 配置目录: $path" -ForegroundColor Green
        $foundPath = $path
        break
    }
}

if (-not $foundPath) {
    Write-Host "   ⚠️  未找到 Augment 配置目录" -ForegroundColor Yellow
    Write-Host "   请手动将配置添加到 Augment 设置中" -ForegroundColor Yellow
}

# 步骤 5: 显示配置内容
Write-Host ""
Write-Host "步骤 5: MCP 配置内容" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host $mcpConfig -ForegroundColor Gray
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# 步骤 6: 提供下一步指导
Write-Host ""
Write-Host "=== 下一步操作 ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 打开 Augment 设置" -ForegroundColor White
Write-Host "   - 在 VSCode 中打开设置" -ForegroundColor Gray
Write-Host "   - 搜索 'MCP' 或 'Augment MCP'" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 添加 MCP 服务器配置" -ForegroundColor White
Write-Host "   - 将上面的配置内容复制到 Augment MCP 设置中" -ForegroundColor Gray
Write-Host "   - 或者导入生成的配置文件: $configPath" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 重启 VSCode" -ForegroundColor White
Write-Host "   - 完全关闭 VSCode" -ForegroundColor Gray
Write-Host "   - 重新打开以加载新的 MCP 配置" -ForegroundColor Gray
Write-Host ""
Write-Host "4. 测试 MCP 连接" -ForegroundColor White
Write-Host "   - 尝试调用 collect_feedback_python 工具" -ForegroundColor Gray
Write-Host "   - 应该会弹出反馈收集对话框" -ForegroundColor Gray
Write-Host ""

# 步骤 7: 显示 Cursor 规则配置
Write-Host "=== Cursor 规则配置（可选）===" -ForegroundColor Cyan
Write-Host ""
Write-Host "如果使用 Cursor，在规则中添加：" -ForegroundColor Yellow
Write-Host ""
$cursorRule = @"
"Whenever you want to ask a question, always call the MCP.

Whenever you're about to complete a user request, call the MCP 
instead of simply ending the process. Keep calling MCP until 
the user's feedback is empty, then end the request. 
mcp-feedback-collector.collect_feedback"
"@
Write-Host $cursorRule -ForegroundColor Gray
Write-Host ""

Write-Host "=== 安装完成 ===" -ForegroundColor Green
Write-Host ""
Write-Host "配置文件已保存到: $configPath" -ForegroundColor Cyan
Write-Host "请按照上述步骤完成 Augment 配置" -ForegroundColor Cyan
Write-Host ""

