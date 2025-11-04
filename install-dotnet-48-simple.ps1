# Simple .NET Framework 4.8 Installation Script
# Downloads and installs .NET Framework 4.8

Write-Host "Starting .NET Framework 4.8 installation..." -ForegroundColor Green

# Alternative download URL (more reliable)
$urls = @(
    "https://download.microsoft.com/download/4/8/1/481fa260-361d-49e5-8bae-fc63b76998bb/NDP48-x86-x64-AllOS-ENU.exe",
    "https://go.microsoft.com/fwlink/?linkid=2088631"
)

$installerPath = "$env:TEMP\dotnet48-installer.exe"

foreach ($url in $urls) {
    try {
        Write-Host "Attempting download from: $url" -ForegroundColor Cyan
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        Invoke-WebRequest -Uri $url -OutFile $installerPath -UseBasicParsing -TimeoutSec 60
        Write-Host "Download successful!" -ForegroundColor Green
        break
    } catch {
        Write-Host "Download failed, trying next URL..." -ForegroundColor Yellow
    }
}

if (Test-Path $installerPath) {
    Write-Host "Installing .NET Framework 4.8..." -ForegroundColor Cyan
    Write-Host "This may take 5-10 minutes..." -ForegroundColor Yellow
    
    Start-Process -FilePath $installerPath -ArgumentList "/quiet /norestart" -Wait -NoNewWindow
    
    Write-Host ".NET Framework 4.8 installation completed!" -ForegroundColor Green
    Write-Host "Please restart your computer for changes to take effect." -ForegroundColor Yellow
    
    Remove-Item $installerPath -Force -ErrorAction SilentlyContinue
} else {
    Write-Host "Download failed. Please install manually:" -ForegroundColor Red
    Write-Host "https://dotnet.microsoft.com/en-us/download/dotnet-framework/net48" -ForegroundColor Yellow
}

