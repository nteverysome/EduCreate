# Install .NET Framework 4.8
# This script downloads and installs .NET Framework 4.8 required by PowerShell Language Server

Write-Host "Checking .NET Framework 4.8 installation..." -ForegroundColor Cyan

# Check if .NET Framework 4.8 is already installed
$dotnetFramework48 = Get-ChildItem "HKLM:\SOFTWARE\Microsoft\NET Framework Setup\NDP\v4\Full" -ErrorAction SilentlyContinue | 
    Where-Object { $_.GetValue("Release") -ge 528040 }

if ($dotnetFramework48) {
    Write-Host ".NET Framework 4.8 is already installed" -ForegroundColor Green
    exit 0
}

Write-Host ".NET Framework 4.8 not found. Installing..." -ForegroundColor Yellow

$downloadUrl = "https://download.microsoft.com/download/4/8/1/481fa260-361d-49e5-8bae-fc63b76998bb/NDP48-x86-x64-AllOS-ENU.exe"
$installerPath = "$env:TEMP\NDP48-x86-x64-AllOS-ENU.exe"

try {
    Write-Host "Downloading .NET Framework 4.8..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath -UseBasicParsing
    Write-Host "Download completed" -ForegroundColor Green
    
    Write-Host "Installing .NET Framework 4.8..." -ForegroundColor Cyan
    Write-Host "This may take several minutes..." -ForegroundColor Yellow
    
    Start-Process -FilePath $installerPath -ArgumentList "/quiet /norestart" -Wait
    
    Write-Host ".NET Framework 4.8 installation completed" -ForegroundColor Green
    Write-Host "Please restart your computer for changes to take effect" -ForegroundColor Yellow
    
    Remove-Item $installerPath -Force
    
} catch {
    Write-Host "Installation failed: $_" -ForegroundColor Red
    Write-Host "Please download manually from: https://dotnet.microsoft.com/download/dotnet-framework/net48" -ForegroundColor Yellow
}

