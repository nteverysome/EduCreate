# 簡單的 VS Code 配置腳本

Write-Host "開始配置 VS Code..." -ForegroundColor Green

# VS Code 設置路徑
$settingsPath = "$env:APPDATA\Code\User\settings.json"
$settingsDir = "$env:APPDATA\Code\User"

Write-Host "設置路徑: $settingsPath"

# 創建目錄
if (!(Test-Path $settingsDir)) {
    New-Item -ItemType Directory -Path $settingsDir -Force
    Write-Host "創建目錄成功"
}

# 設置內容
$settings = @'
{
  "workbench.trustedDomains": [
    "https://edu-create.vercel.app",
    "https://*.vercel.app",
    "http://localhost:3000"
  ],
  "security.workspace.trust.untrustedFiles": "open"
}
'@

# 寫入設置文件
$settings | Out-File -FilePath $settingsPath -Encoding UTF8 -Force

Write-Host "VS Code 設置已更新！" -ForegroundColor Green
Write-Host "請重啟 VS Code" -ForegroundColor Yellow
