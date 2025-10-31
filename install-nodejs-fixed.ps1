# Node.js 自動安裝腳本
Write-Host "🚀 Node.js 自動安裝腳本" -ForegroundColor Green
Write-Host "此腳本將下載並安裝最新版本的 Node.js" -ForegroundColor Yellow

# 設置下載參數
$nodeVersion = "v22.12.0"
$architecture = if ([Environment]::Is64BitOperatingSystem) { "x64" } else { "x86" }
$fileName = "node-$nodeVersion-win-$architecture.msi"
$downloadUrl = "https://nodejs.org/dist/$nodeVersion/$fileName"
$downloadPath = "$env:TEMP\$fileName"

Write-Host "`n📥 準備下載 Node.js $nodeVersion ($architecture)..." -ForegroundColor Cyan
Write-Host "下載地址: $downloadUrl" -ForegroundColor Gray

try {
    Write-Host "正在下載..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $downloadUrl -OutFile $downloadPath -UseBasicParsing
    Write-Host "✅ 下載完成: $downloadPath" -ForegroundColor Green
    
    if (Test-Path $downloadPath) {
        Write-Host "`n🔧 開始安裝 Node.js..." -ForegroundColor Yellow
        Write-Host "注意：安裝過程中可能需要管理員權限" -ForegroundColor Red
        
        $installArgs = "/i `"$downloadPath`" /quiet /norestart ADDLOCAL=ALL"
        Start-Process -FilePath "msiexec.exe" -ArgumentList $installArgs -Wait -NoNewWindow
        
        Write-Host "✅ Node.js 安裝完成！" -ForegroundColor Green
        
        Remove-Item $downloadPath -Force
        Write-Host "🧹 清理臨時文件完成" -ForegroundColor Green
        
        Write-Host "`n⚠️ 重要提醒:" -ForegroundColor Red
        Write-Host "1. 請重啟 PowerShell 終端" -ForegroundColor Yellow
        Write-Host "2. 請重啟 Trae IDE" -ForegroundColor Yellow
        Write-Host "3. 然後運行驗證腳本確認安裝成功" -ForegroundColor Yellow
    } else {
        Write-Host "❌ 下載失敗，文件不存在" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 安裝過程中發生錯誤: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n📝 手動安裝步驟:" -ForegroundColor Yellow
    Write-Host "1. 訪問 https://nodejs.org/" -ForegroundColor White
    Write-Host "2. 下載 Windows Installer (.msi)" -ForegroundColor White
    Write-Host "3. 運行安裝程序並按照提示完成安裝" -ForegroundColor White
    Write-Host "4. 重啟 PowerShell 和 Trae IDE" -ForegroundColor White
}

Write-Host "`n🎯 安裝完成後的驗證步驟:" -ForegroundColor Cyan
Write-Host "運行以下命令驗證安裝:" -ForegroundColor White
Write-Host "node --version" -ForegroundColor Gray
Write-Host "npm --version" -ForegroundColor Gray
Write-Host "npx --version" -ForegroundColor Gray