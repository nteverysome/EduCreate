# Node.js Upgrade Script - Windows
# This script will download and install the latest Node.js LTS version

Write-Host "Checking current Node.js version..." -ForegroundColor Cyan
$currentVersion = node --version
Write-Host "Current version: $currentVersion" -ForegroundColor Yellow

Write-Host "`nDownloading Node.js v20.18.0 LTS..." -ForegroundColor Cyan

# Download Node.js installer
$downloadUrl = "https://nodejs.org/dist/v20.18.0/node-v20.18.0-x64.msi"
$installerPath = "$env:TEMP\node-v20.18.0-x64.msi"

try {
    Write-Host "Downloading from: $downloadUrl" -ForegroundColor Gray
    Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath -UseBasicParsing
    Write-Host "Download completed" -ForegroundColor Green

    Write-Host "`nInstalling Node.js..." -ForegroundColor Cyan
    Write-Host "Note: May require administrator privileges" -ForegroundColor Yellow

    # Run installer
    Start-Process -FilePath $installerPath -ArgumentList "/quiet" -Wait

    Write-Host "Installation completed" -ForegroundColor Green

    # Refresh environment variables
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

    Write-Host "`nVerifying new version..." -ForegroundColor Cyan
    $newVersion = node --version
    $npmVersion = npm --version

    Write-Host "Node.js version: $newVersion" -ForegroundColor Green
    Write-Host "npm version: $npmVersion" -ForegroundColor Green

    # Cleanup
    Remove-Item $installerPath -Force

    Write-Host "`nUpgrade successful!" -ForegroundColor Green
    Write-Host "Please restart Augment or Claude Desktop to use the new version" -ForegroundColor Cyan

} catch {
    Write-Host "Upgrade failed: $_" -ForegroundColor Red
    Write-Host "`nPlease upgrade manually:" -ForegroundColor Yellow
    Write-Host "1. Visit https://nodejs.org/" -ForegroundColor Gray
    Write-Host "2. Download LTS version (v20.18.0 or newer)" -ForegroundColor Gray
    Write-Host "3. Run the installer" -ForegroundColor Gray
}

