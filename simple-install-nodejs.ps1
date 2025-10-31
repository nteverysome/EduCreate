Write-Host "🚀 Node.js 簡易安裝腳本" -ForegroundColor Green

$nodeVersion = "v22.12.0"
$architecture = "x64"
$fileName = "node-$nodeVersion-win-$architecture.msi"
$downloadUrl = "https://nodejs.org/dist/$nodeVersion/$fileName"
$downloadPath = "$env:TEMP\$fileName"

Write-Host "正在下載 Node.js..." -ForegroundColor Yellow
Invoke-WebRequest -Uri $downloadUrl -OutFile $downloadPath -UseBasicParsing

Write-Host "開始安裝 Node.js..." -ForegroundColor Yellow
Start-Process -FilePath "msiexec.exe" -ArgumentList "/i", $downloadPath, "/quiet", "/norestart" -Wait

Write-Host "✅ 安裝完成！請重啟 PowerShell 和 Trae IDE" -ForegroundColor Green
Remove-Item $downloadPath -Force