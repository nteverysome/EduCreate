# Responsively App - iPhone 14 直向模式啟動腳本
# 
# 使用方法：
# powershell -ExecutionPolicy Bypass -File scripts/launch-responsively-iphone14.ps1

# 配置
$RESPONSIVELY_PATH = "C:\Users\Administrator\AppData\Local\Programs\ResponsivelyApp\ResponsivelyApp.exe"
$GAME_URL = "https://edu-create.vercel.app/games/switcher?game=match-up-game&activityId=cmh93tjuh0001l404hszkdf94&layout=mixed&itemsPerPage=20"

# iPhone 14 規格
$IPHONE_14_WIDTH = 390
$IPHONE_14_HEIGHT = 844
$IPHONE_14_DPR = 3

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Responsively App - iPhone 14 直向模式啟動                  ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

Write-Host ""
Write-Host "📱 iPhone 14 規格:" -ForegroundColor Green
Write-Host "  • 寬度: $IPHONE_14_WIDTH px"
Write-Host "  • 高度: $IPHONE_14_HEIGHT px"
Write-Host "  • 設備像素比: $IPHONE_14_DPR"
Write-Host "  • 寬高比: $([math]::Round($IPHONE_14_WIDTH / $IPHONE_14_HEIGHT, 3))"

Write-Host ""
Write-Host "🌐 遊戲 URL:" -ForegroundColor Green
Write-Host "  $GAME_URL"

Write-Host ""
Write-Host "🚀 啟動 Responsively App..." -ForegroundColor Yellow

# 檢查 Responsively App 是否存在
if (-not (Test-Path $RESPONSIVELY_PATH)) {
    Write-Host "❌ 錯誤: Responsively App 未找到" -ForegroundColor Red
    Write-Host "   路徑: $RESPONSIVELY_PATH"
    exit 1
}

# 啟動 Responsively App
try {
    # 啟動應用並傳遞 URL
    $process = Start-Process -FilePath $RESPONSIVELY_PATH -ArgumentList $GAME_URL -PassThru
    
    Write-Host "✅ Responsively App 已啟動" -ForegroundColor Green
    Write-Host "   進程 ID: $($process.Id)"
    
    Write-Host ""
    Write-Host "📋 操作步驟:" -ForegroundColor Cyan
    Write-Host "  1. 在 Responsively App 中，點擊左側的 '+ Add Device'"
    Write-Host "  2. 搜索並選擇 'iPhone 14'"
    Write-Host "  3. 或者手動添加自定義設備:"
    Write-Host "     • 名稱: iPhone 14"
    Write-Host "     • 寬度: $IPHONE_14_WIDTH"
    Write-Host "     • 高度: $IPHONE_14_HEIGHT"
    Write-Host "     • 設備像素比: $IPHONE_14_DPR"
    Write-Host ""
    Write-Host "  4. 遊戲應該自動加載到 URL 中"
    Write-Host "  5. 檢查遊戲是否顯示 5 列卡片"
    Write-Host ""
    
    Write-Host "💡 提示:" -ForegroundColor Yellow
    Write-Host "  • 按 F12 打開開發者工具"
    Write-Host "  • 在控制台中查看 v20.0 的調試日誌"
    Write-Host "  • 查看 'Phaser 報告的尺寸' 和 '動態列數計算'"
    Write-Host ""
    
    Write-Host "⏳ 等待應用加載... (按 Ctrl+C 退出)" -ForegroundColor Yellow
    
    # 等待進程
    $process | Wait-Process
    
} catch {
    Write-Host "❌ 錯誤: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Responsively App 已關閉" -ForegroundColor Green

