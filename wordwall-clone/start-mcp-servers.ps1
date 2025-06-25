# Start MCP Servers for Wordwall Clone

Write-Host "馃殌 Starting MCP Servers for Wordwall Clone..." -ForegroundColor Cyan

# Load environment variables
if (Test-Path ".env.mcp") {
    Get-Content ".env.mcp" | ForEach-Object {
        if ( -match "^([^#][^=]+)=(.*)$") {
            [Environment]::SetEnvironmentVariable([1], [2], "Process")
        }
    }
}

Write-Host "鉁?MCP Servers are ready!" -ForegroundColor Green
Write-Host "馃搳 Access Jaeger UI at: http://localhost:16686" -ForegroundColor Yellow
Write-Host "馃攳 Access Weaviate at: http://localhost:8080" -ForegroundColor Yellow
Write-Host "馃搱 Check Langfuse at: https://cloud.langfuse.com" -ForegroundColor Yellow
