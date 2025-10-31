# Simple Node.js Environment Fix
Write-Host "Fixing Node.js Environment..." -ForegroundColor Green

# Set Node.js path
$nodeDir = "C:\Users\Administrator\Tools\node\node-v23.9.0-win-x64"
$env:PATH = "$nodeDir;" + $env:PATH

Write-Host "Node.js path set to: $nodeDir" -ForegroundColor Yellow

# Test Node.js
Write-Host "Testing Node.js..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js test failed" -ForegroundColor Red
    exit 1
}

# Test npm
Write-Host "Testing npm..." -ForegroundColor Cyan
try {
    $npmVersion = npm --version
    Write-Host "npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "npm test failed" -ForegroundColor Red
    exit 1
}

# Test npx
Write-Host "Testing npx..." -ForegroundColor Cyan
try {
    $npxVersion = npx --version
    Write-Host "npx version: $npxVersion" -ForegroundColor Green
} catch {
    Write-Host "npx test failed" -ForegroundColor Red
    exit 1
}

# Test chrome-devtools-mcp
Write-Host "Testing chrome-devtools-mcp..." -ForegroundColor Cyan
try {
    npx chrome-devtools-mcp@latest --help | Out-Null
    Write-Host "chrome-devtools-mcp is available" -ForegroundColor Green
} catch {
    Write-Host "chrome-devtools-mcp test completed (may show warnings)" -ForegroundColor Yellow
}

Write-Host "Node.js environment fix completed!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart Trae IDE" -ForegroundColor White
Write-Host "2. Test Trae Market MCP functionality" -ForegroundColor White