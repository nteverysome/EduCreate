# 簡單的 VS Code 設置修復腳本

Write-Host "🔧 修復 VS Code 外部鏈接對話框問題..." -ForegroundColor Green

# 1. 創建 VS Code 用戶設置目錄
$settingsDir = "$env:APPDATA\Code\User"
$settingsFile = "$settingsDir\settings.json"

Write-Host "📁 檢查設置目錄: $settingsDir" -ForegroundColor Yellow

if (!(Test-Path $settingsDir)) {
    New-Item -ItemType Directory -Path $settingsDir -Force | Out-Null
    Write-Host "✅ 創建用戶設置目錄" -ForegroundColor Green
}

# 2. 創建設置內容
$settingsContent = @"
{
  "workbench.trustedDomains": [
    "https://edu-create.vercel.app",
    "https://*.vercel.app",
    "http://localhost:3000",
    "http://localhost:3001"
  ],
  "security.workspace.trust.untrustedFiles": "open",
  "workbench.externalUriOpeners": {
    "https://edu-create.vercel.app": "default"
  },
  "workbench.trustedDomains.promptInTrustedWorkspace": false,
  "security.workspace.trust.banner": "never",
  "security.workspace.trust.startupPrompt": "never"
}
"@

# 3. 寫入設置文件
try {
    $settingsContent | Out-File -FilePath $settingsFile -Encoding UTF8 -Force
    Write-Host "✅ VS Code 設置已更新" -ForegroundColor Green
    Write-Host "📝 設置文件: $settingsFile" -ForegroundColor Cyan
}
catch {
    Write-Host "❌ 無法寫入設置文件: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 4. 創建工作區設置
$workspaceDir = ".vscode"
$workspaceSettingsFile = "$workspaceDir\settings.json"

if (!(Test-Path $workspaceDir)) {
    New-Item -ItemType Directory -Path $workspaceDir -Force | Out-Null
}

$workspaceSettings = @"
{
  "workbench.trustedDomains": [
    "https://edu-create.vercel.app",
    "https://*.vercel.app"
  ],
  "security.workspace.trust.untrustedFiles": "open"
}
"@

$workspaceSettings | Out-File -FilePath $workspaceSettingsFile -Encoding UTF8 -Force
Write-Host "✅ 工作區設置已創建" -ForegroundColor Green

# 5. 顯示設置內容
Write-Host ""
Write-Host "📋 已配置的設置:" -ForegroundColor Cyan
Write-Host $settingsContent -ForegroundColor White

# 6. 重啟 VS Code
Write-Host ""
Write-Host "🔄 正在重啟 VS Code..." -ForegroundColor Yellow

# 關閉 VS Code
Get-Process -Name "Code" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 3

# 重新啟動 VS Code
try {
    Start-Process "code" -ArgumentList "." -WindowStyle Normal
    Write-Host "✅ VS Code 已重啟" -ForegroundColor Green
}
catch {
    Write-Host "⚠️ 請手動重啟 VS Code" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 完成！VS Code 現在應該會自動打開外部鏈接" -ForegroundColor Green
Write-Host "🧪 請測試點擊 EduCreate 鏈接" -ForegroundColor Yellow
Write-Host ""
Write-Host "如果仍有問題，請手動執行以下步驟:" -ForegroundColor Cyan
Write-Host "1. 按 Ctrl+Shift+P" -ForegroundColor White
Write-Host "2. 輸入: Preferences: Open User Settings (JSON)" -ForegroundColor White
Write-Host "3. 確認設置已正確保存" -ForegroundColor White
