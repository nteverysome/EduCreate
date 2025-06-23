@echo off
echo Starting Mem0 MCP Server...
echo.

echo Checking if dependencies are installed...
python -c "import mem0, mcp, uvicorn" 2>nul
if %errorlevel% neq 0 (
    echo Installing required dependencies...
    pip install httpx mcp mem0ai uvicorn starlette python-dotenv
)

echo.
echo Starting Mem0 MCP Server on http://localhost:8080
echo Press Ctrl+C to stop the server
echo.

cd mem0-mcp
python main.py
