# 🔧 Google Service Account JSON 轉 Base64 工具
# 使用方法: .\convert-json-to-base64.ps1 "C:\path\to\your\service-account-key.json"

param(
    [Parameter(Mandatory=$false)]
    [string]$JsonFilePath
)

Write-Host "🔧 Google Service Account JSON 轉 Base64 工具" -ForegroundColor Cyan
Write-Host "=" * 50

# 如果沒有提供文件路徑，提示用戶輸入
if (-not $JsonFilePath) {
    Write-Host "📁 請輸入 JSON 金鑰文件的完整路徑:" -ForegroundColor Yellow
    Write-Host "   例如: C:\Users\你的用戶名\Downloads\your-service-account-key.json" -ForegroundColor Gray
    $JsonFilePath = Read-Host "文件路徑"
}

# 檢查文件是否存在
if (-not (Test-Path $JsonFilePath)) {
    Write-Host "❌ 找不到文件: $JsonFilePath" -ForegroundColor Red
    Write-Host "   請檢查文件路徑是否正確" -ForegroundColor Yellow
    exit 1
}

try {
    # 讀取 JSON 文件
    Write-Host "🔄 讀取 JSON 文件..." -ForegroundColor Yellow
    $jsonContent = Get-Content $JsonFilePath -Raw -Encoding UTF8
    
    # 驗證 JSON 格式
    Write-Host "🔍 驗證 JSON 格式..." -ForegroundColor Yellow
    $jsonObject = $jsonContent | ConvertFrom-Json
    
    # 檢查必要欄位
    $requiredFields = @('type', 'project_id', 'private_key_id', 'private_key', 'client_email')
    $missingFields = @()
    
    foreach ($field in $requiredFields) {
        if (-not $jsonObject.$field) {
            $missingFields += $field
        }
    }
    
    if ($missingFields.Count -gt 0) {
        Write-Host "❌ JSON 文件缺少必要欄位: $($missingFields -join ', ')" -ForegroundColor Red
        exit 1
    }
    
    if ($jsonObject.type -ne 'service_account') {
        Write-Host "❌ 這不是一個有效的 Service Account 金鑰文件" -ForegroundColor Red
        Write-Host "   類型: $($jsonObject.type) (應該是 'service_account')" -ForegroundColor Yellow
        exit 1
    }
    
    # 轉換為 Base64
    Write-Host "🔄 轉換為 Base64..." -ForegroundColor Yellow
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonContent)
    $base64 = [System.Convert]::ToBase64String($bytes)
    
    # 顯示結果
    Write-Host "✅ 轉換成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "📧 服務帳戶郵箱: $($jsonObject.client_email)" -ForegroundColor Cyan
    Write-Host "🏗️  專案 ID: $($jsonObject.project_id)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 Base64 編碼結果:" -ForegroundColor Yellow
    Write-Host "=" * 50
    Write-Host $base64 -ForegroundColor White
    Write-Host "=" * 50
    
    # 複製到剪貼簿
    try {
        $base64 | Set-Clipboard
        Write-Host "✅ Base64 字符串已複製到剪貼簿！" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  無法複製到剪貼簿，請手動複製上面的 Base64 字符串" -ForegroundColor Yellow
    }
    
    # 提供下一步指示
    Write-Host ""
    Write-Host "📝 下一步操作:" -ForegroundColor Cyan
    Write-Host "1. 打開 .env 文件" -ForegroundColor White
    Write-Host "2. 找到 GOOGLEDRIVE_SERVICE_ACCOUNT_KEY 行" -ForegroundColor White
    Write-Host "3. 將上面的 Base64 字符串替換 YOUR_BASE64_ENCODED_SERVICE_ACCOUNT_KEY_HERE" -ForegroundColor White
    Write-Host "4. 保存 .env 文件" -ForegroundColor White
    Write-Host "5. 運行測試腳本: python test-google-drive-mcp.py" -ForegroundColor White
    
    # 保存到文件（可選）
    $outputFile = "service-account-base64.txt"
    $base64 | Out-File -FilePath $outputFile -Encoding UTF8
    Write-Host ""
    Write-Host "💾 Base64 字符串也已保存到: $outputFile" -ForegroundColor Green
    
} catch {
    Write-Host "❌ 轉換失敗: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   請檢查 JSON 文件格式是否正確" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🎉 轉換完成！" -ForegroundColor Green