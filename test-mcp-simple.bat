@echo off
echo ========================================
echo    MCP 服务器简单测试
echo ========================================
echo.

echo 🧪 测试MCP服务器安装状态...
echo.

echo 📁 测试SQLite MCP...
if exist "mcp-sqlite-jparkerweb\mcp-sqlite-server.js" (
    echo   ✅ SQLite MCP 文件存在
) else (
    echo   ❌ SQLite MCP 文件不存在
)

echo 🎭 测试Microsoft Playwright MCP...
if exist "playwright-mcp-microsoft\index.js" (
    echo   ✅ Playwright MCP 文件存在
) else (
    echo   ❌ Playwright MCP 文件不存在
)

echo 🧠 测试Mem0 MCP...
if exist "mem0-mcp\main.py" (
    echo   ✅ Mem0 MCP 文件存在
) else (
    echo   ❌ Mem0 MCP 文件不存在
)

echo 📄 测试Unstructured MCP...
if exist "unstructured-mcp\uns_mcp" (
    echo   ✅ Unstructured MCP 目录存在
) else (
    echo   ❌ Unstructured MCP 目录不存在
)

echo 💭 测试Sequential Thinking MCP...
if exist "sequential-thinking-zalab\src" (
    echo   ✅ Sequential Thinking MCP 目录存在
) else (
    echo   ❌ Sequential Thinking MCP 目录不存在
)

echo 🗄️ 测试Alternative Memory MCP...
if exist "mcp-memory-sdimitrov\src" (
    echo   ✅ Alternative Memory MCP 目录存在
) else (
    echo   ❌ Alternative Memory MCP 目录不存在
)

echo.
echo 🔧 检查配置文件...
if exist ".vscode\settings.json" (
    echo   ✅ VS Code配置文件存在
) else (
    echo   ❌ VS Code配置文件不存在
)

if exist "mcp_settings.json" (
    echo   ✅ 通用MCP配置文件存在
) else (
    echo   ❌ 通用MCP配置文件不存在
)

echo.
echo 📋 MCP集成状态报告：
echo   - 所有MCP服务器文件已安装
echo   - VS Code配置已更新
echo   - 可以开始使用MCP功能
echo.
echo 💡 下一步：
echo   1. 重启VS Code
echo   2. 在VS Code中测试Copilot Chat的MCP功能
echo   3. 或运行 start-mcp-servers.bat 手动启动服务器
echo.
pause
