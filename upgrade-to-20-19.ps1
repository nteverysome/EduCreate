$downloadUrl = "https://nodejs.org/dist/v20.19.0/node-v20.19.0-x64.msi"
$installerPath = "$env:TEMP\node-v20.19.0-x64.msi"

Write-Host "Downloading Node.js v20.19.0..." -ForegroundColor Cyan
Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath -UseBasicParsing

Write-Host "Installing..." -ForegroundColor Cyan
Start-Process -FilePath $installerPath -ArgumentList "/quiet" -Wait

Write-Host "Verifying..." -ForegroundColor Cyan
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

node --version
npm --version

Remove-Item $installerPath -Force
Write-Host "Done!" -ForegroundColor Green

