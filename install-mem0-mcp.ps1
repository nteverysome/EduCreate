Write-Host "Installing Mem0 MCP Server..." -ForegroundColor Green
Write-Host ""

Write-Host "Step 1: Installing uv package manager..." -ForegroundColor Yellow
try {
    # Check if uv is already installed
    uv --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "uv is already installed" -ForegroundColor Green
    }
} catch {
    Write-Host "Installing uv..." -ForegroundColor Yellow
    irm https://astral.sh/uv/install.ps1 | iex
}

Write-Host ""
Write-Host "Step 2: Setting up Mem0 MCP environment..." -ForegroundColor Yellow
Set-Location mem0-mcp

Write-Host "Step 3: Creating virtual environment..." -ForegroundColor Yellow
uv venv

Write-Host "Step 4: Installing dependencies..." -ForegroundColor Yellow
uv pip install -e .

Write-Host ""
Write-Host "Step 5: Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Get your Mem0 API key from https://mem0.ai" -ForegroundColor White
Write-Host "2. Update the .env file with your API key" -ForegroundColor White
Write-Host "3. Run: uv run main.py" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to continue"
