@echo off
echo ========================================
echo    MCP 服务器启动脚本
echo ========================================
echo.

echo 🚀 启动MCP服务器...
echo.

echo 📁 启动SQLite MCP服务器...
start "SQLite MCP" cmd /k "cd /d %~dp0 && node mcp-sqlite-jparkerweb/mcp-sqlite-server.js"
timeout /t 2 /nobreak >nul

echo 🎭 启动Microsoft Playwright MCP服务器...
start "Playwright MCP" cmd /k "cd /d %~dp0 && node playwright-mcp-microsoft/index.js"
timeout /t 2 /nobreak >nul

echo 🧠 启动Mem0 MCP服务器...
start "Mem0 MCP" cmd /k "cd /d %~dp0 && python mem0-mcp/main.py"
timeout /t 2 /nobreak >nul

echo 📄 启动Unstructured MCP服务器...
start "Unstructured MCP" cmd /k "cd /d %~dp0/unstructured-mcp && python -m uns_mcp"
timeout /t 2 /nobreak >nul

echo 💭 启动Sequential Thinking MCP服务器...
start "Sequential MCP" cmd /k "cd /d %~dp0 && node sequential-thinking-zalab/src/index.js"
timeout /t 2 /nobreak >nul

echo 🗄️ 启动Alternative Memory MCP服务器...
start "Memory Alt MCP" cmd /k "cd /d %~dp0 && node mcp-memory-sdimitrov/src/index.js"
timeout /t 2 /nobreak >nul

echo.
echo ✅ 所有MCP服务器启动命令已执行！
echo.
echo 📋 已启动的服务器：
echo   - SQLite MCP (数据库管理)
echo   - Microsoft Playwright MCP (浏览器自动化)
echo   - Mem0 MCP (编码偏好管理)
echo   - Unstructured MCP (文档处理)
echo   - Sequential Thinking MCP (思维链)
echo   - Alternative Memory MCP (记忆存储)
echo.
echo 💡 提示：
echo   - 每个服务器在独立的命令窗口中运行
echo   - 关闭相应窗口可停止对应服务器
echo   - 检查VS Code中的MCP集成状态
echo.
echo 🔧 VS Code集成：
echo   - 重启VS Code以加载新的MCP配置
echo   - 在Copilot Chat中测试MCP功能
echo.
pause
