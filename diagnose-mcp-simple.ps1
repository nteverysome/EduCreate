# 简化的 MCP 诊断脚本

Write-Host "=== MCP 反馈收集器诊断 ===" -ForegroundColor Cyan

# 检查 Python
Write-Host "`n1. Python 版本:" -ForegroundColor Yellow
python --version

# 检查 MCP 服务器文件
Write-Host "`n2. MCP 服务器文件:" -ForegroundColor Yellow
$mcpPath = "mcp-feedback-collector\src\mcp_feedback_collector\server.py"
if (Test-Path $mcpPath) {
    Write-Host "   存在: $mcpPath" -ForegroundColor Green
} else {
    Write-Host "   不存在: $mcpPath" -ForegroundColor Red
}

# 检查依赖
Write-Host "`n3. 安装 Python 依赖:" -ForegroundColor Yellow
pip install -r mcp-feedback-collector\requirements.txt

# 检查 Augment 配置目录
Write-Host "`n4. 查找 Augment 配置:" -ForegroundColor Yellow
$paths = @(
    "$env:APPDATA\augment-vscode",
    "$env:APPDATA\Code\User\globalStorage\augment.augment"
)

foreach ($p in $paths) {
    if (Test-Path $p) {
        Write-Host "   找到: $p" -ForegroundColor Green
    }
}

Write-Host "`n=== 诊断完成 ===" -ForegroundColor Cyan

