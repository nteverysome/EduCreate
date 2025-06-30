# VS Code 自動配置腳本
# 自動解決外部網站提示問題

Write-Host "🔧 開始自動配置 VS Code 設置..." -ForegroundColor Green

# 獲取 VS Code 用戶設置路徑
$vscodeSettingsPath = "$env:APPDATA\Code\User\settings.json"
$vscodeSettingsDir = "$env:APPDATA\Code\User"

Write-Host "📁 VS Code 設置路徑: $vscodeSettingsPath" -ForegroundColor Yellow

# 創建目錄（如果不存在）
if (!(Test-Path $vscodeSettingsDir)) {
    New-Item -ItemType Directory -Path $vscodeSettingsDir -Force
    Write-Host "✅ 創建 VS Code 用戶目錄" -ForegroundColor Green
}

# 讀取現有設置（如果存在）
$existingSettings = @{}
if (Test-Path $vscodeSettingsPath) {
    try {
        $existingContent = Get-Content $vscodeSettingsPath -Raw
        if ($existingContent) {
            $existingSettings = $existingContent | ConvertFrom-Json -AsHashtable
        }
    }
    catch {
        Write-Host "⚠️ 無法解析現有設置，將創建新的設置文件" -ForegroundColor Yellow
    }
}

# 新的信任域名設置
$trustedDomains = @(
    "https://edu-create.vercel.app",
    "https://*.vercel.app",
    "http://localhost:3000",
    "http://localhost:3001"
)

# 更新設置
$existingSettings["workbench.trustedDomains"] = $trustedDomains
$existingSettings["security.workspace.trust.untrustedFiles"] = "open"
$existingSettings["workbench.externalUriOpeners"] = @{
    "https://edu-create.vercel.app" = "default"
    "https://*.vercel.app" = "default"
}

# 轉換為 JSON 並保存
$jsonSettings = $existingSettings | ConvertTo-Json -Depth 10
$jsonSettings | Out-File -FilePath $vscodeSettingsPath -Encoding UTF8

Write-Host "✅ VS Code 設置已更新！" -ForegroundColor Green
Write-Host "📋 已添加信任域名:" -ForegroundColor Cyan
foreach ($domain in $trustedDomains) {
    Write-Host "   - $domain" -ForegroundColor White
}

Write-Host ""
Write-Host "🔄 請重啟 VS Code 以使設置生效" -ForegroundColor Yellow
Write-Host "🎉 完成！現在 VS Code 會自動打開 EduCreate 鏈接" -ForegroundColor Green

# 嘗試重啟 VS Code（可選）
$restartChoice = Read-Host "是否要自動重啟 VS Code？(y/n)"
if ($restartChoice -eq "y" -or $restartChoice -eq "Y") {
    Write-Host "🔄 正在重啟 VS Code..." -ForegroundColor Yellow
    
    # 關閉 VS Code
    Get-Process -Name "Code" -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 2
    
    # 重新啟動 VS Code
    Start-Process "code" -ArgumentList "."
    Write-Host "✅ VS Code 已重啟！" -ForegroundColor Green
}

Write-Host ""
Write-Host "📝 設置文件位置: $vscodeSettingsPath" -ForegroundColor Cyan
Write-Host "🧪 現在可以測試 EduCreate 鏈接了！" -ForegroundColor Green
