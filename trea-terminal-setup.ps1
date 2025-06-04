# Trea AI 終端機環境設定腳本 (PowerShell 版本)

Write-Host "===================================================" -ForegroundColor Green
Write-Host "Trea AI 終端機環境設定腳本 (PowerShell 版本)" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
Write-Host ""

# 1. 設定 Node.js 路徑
Write-Host "步驟 1: 設定 Node.js 路徑..." -ForegroundColor Cyan
$env:PATH = "C:\Program Files\nodejs\;$env:PATH"
Write-Host "Node.js 路徑已設定為: C:\Program Files\nodejs\" -ForegroundColor White

# 2. 設定編碼為 UTF-8
Write-Host "步驟 2: 設定編碼為 UTF-8..." -ForegroundColor Cyan
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
Write-Host "PowerShell 編碼已設定為 UTF-8" -ForegroundColor White

# 3. 切換到專案根目錄
Write-Host "步驟 3: 切換到專案根目錄..." -ForegroundColor Cyan
Set-Location -Path "C:\Users\Administrator\Desktop\EduCreate"
Write-Host "當前目錄: $(Get-Location)" -ForegroundColor White

# 4. 載入環境變數
Write-Host "步驟 4: 載入環境變數..." -ForegroundColor Cyan

# 檢查 .env.local 文件
if (Test-Path ".env.local") {
    Write-Host "載入 .env.local 文件..." -ForegroundColor White
    Get-Content ".env.local" | ForEach-Object {
        if ($_ -match "^([^=]+)=(.*)$") {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            if ($name -and $value) {
                [Environment]::SetEnvironmentVariable($name, $value, "Process")
            }
        }
    }
}

# 檢查 .env 文件
if (Test-Path ".env") {
    Write-Host "載入 .env 文件..." -ForegroundColor White
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^([^=]+)=(.*)$") {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            if ($name -and $value) {
                [Environment]::SetEnvironmentVariable($name, $value, "Process")
            }
        }
    }
}

Write-Host "環境變數已載入" -ForegroundColor White

# 5. 顯示設定結果
Write-Host ""
Write-Host "===================================================" -ForegroundColor Green
Write-Host "環境設定完成！" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
Write-Host ""

Write-Host "Node 版本:" -ForegroundColor Yellow
node -v
Write-Host ""

Write-Host "NPM 版本:" -ForegroundColor Yellow
npm -v
Write-Host ""

Write-Host "當前編碼:" -ForegroundColor Yellow
Write-Host "UTF-8 (PowerShell)" -ForegroundColor White
Write-Host ""

Write-Host "當前目錄:" -ForegroundColor Yellow
Write-Host "$(Get-Location)" -ForegroundColor White
Write-Host ""

Write-Host "環境變數已從 .env/.env.local 載入" -ForegroundColor White
Write-Host ""

Write-Host "===================================================" -ForegroundColor Green
Write-Host "Trea AI 終端機環境已設定完成" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

# 啟動 cmd.exe 作為預設 shell
Write-Host "正在啟動 cmd.exe..." -ForegroundColor Cyan
Start-Process cmd.exe -NoNewWindow -Wait