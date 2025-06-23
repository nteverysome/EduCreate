@echo off
echo Installing Mem0 MCP Server...
echo.

echo Step 1: Installing uv package manager...
powershell -Command "irm https://astral.sh/uv/install.ps1 | iex"

echo.
echo Step 2: Setting up Mem0 MCP environment...
cd mem0-mcp

echo Step 3: Creating virtual environment...
uv venv

echo Step 4: Installing dependencies...
uv pip install -e .

echo.
echo Step 5: Setup complete!
echo.
echo Next steps:
echo 1. Get your Mem0 API key from https://mem0.ai
echo 2. Update the .env file with your API key
echo 3. Run: uv run main.py
echo.
pause
