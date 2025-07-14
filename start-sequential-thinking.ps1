# Sequential Thinking MCP Startup Script
Write-Host "Starting Sequential Thinking MCP Server..." -ForegroundColor Cyan

# Set working directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$mcpPath = Join-Path $scriptPath "sequential-thinking-zalab"

# Check if MCP server exists
if (-not (Test-Path $mcpPath)) {
    Write-Host "Error: Sequential Thinking MCP path not found: $mcpPath" -ForegroundColor Red
    exit 1
}

# Check Node.js installation
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Node.js not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Check MCP server file
$mcpServerPath = Join-Path $mcpPath "dist\index.js"
if (-not (Test-Path $mcpServerPath)) {
    Write-Host "Building MCP server..." -ForegroundColor Yellow
    
    Set-Location $mcpPath
    try {
        npm run build
        Write-Host "MCP server built successfully" -ForegroundColor Green
    } catch {
        Write-Host "Error: MCP server build failed" -ForegroundColor Red
        exit 1
    }
    Set-Location $scriptPath
}

# Start Sequential Thinking MCP server
Write-Host "Starting Sequential Thinking MCP server..." -ForegroundColor Green
Write-Host "Server path: $mcpServerPath" -ForegroundColor Gray

try {
    # Start MCP server in background
    $process = Start-Process -FilePath "node" -ArgumentList "`"$mcpServerPath`"" -PassThru -WindowStyle Hidden
    
    # Wait for server to start
    Start-Sleep -Seconds 2
    
    # Check if process is still running
    if (Get-Process -Id $process.Id -ErrorAction SilentlyContinue) {
        Write-Host "Sequential Thinking MCP server started successfully" -ForegroundColor Green
        Write-Host "Process ID: $($process.Id)" -ForegroundColor Gray
        Write-Host "Server features:" -ForegroundColor Cyan
        Write-Host "  - Dynamic problem decomposition" -ForegroundColor White
        Write-Host "  - Reflective thinking" -ForegroundColor White
        Write-Host "  - Branch reasoning" -ForegroundColor White
        Write-Host "  - Hypothesis generation and verification" -ForegroundColor White
        Write-Host "  - Step-by-step analysis" -ForegroundColor White
        
        Write-Host "`nYou can now use sequential-thinking tools in Augment!" -ForegroundColor Green
        
        # Save process ID for management
        $process.Id | Out-File -FilePath "sequential-thinking-mcp.pid" -Encoding UTF8
        
    } else {
        Write-Host "Error: Sequential Thinking MCP server failed to start" -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "Error starting Sequential Thinking MCP server: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`nUsage instructions:" -ForegroundColor Cyan
Write-Host "1. Sequential Thinking MCP is now running in background" -ForegroundColor White
Write-Host "2. It will be automatically used when handling complex problems in Augment" -ForegroundColor White
Write-Host "3. Especially useful for:" -ForegroundColor White
Write-Host "   - Code architecture design" -ForegroundColor Gray
Write-Host "   - Complex algorithm implementation" -ForegroundColor Gray
Write-Host "   - Problem debugging analysis" -ForegroundColor Gray
Write-Host "   - System design planning" -ForegroundColor Gray
Write-Host "4. To stop the server, run: .\stop-sequential-thinking.ps1" -ForegroundColor White

Write-Host "`nSequential Thinking MCP configuration complete!" -ForegroundColor Green
