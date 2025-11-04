# 啟動 Responsively App 並啟用 Chrome DevTools Protocol (CDP)
# 
# 使用方法:
# powershell -ExecutionPolicy Bypass -File scripts/launch-responsively-with-cdp.ps1

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  啟動 Responsively App 並啟用 CDP                          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# 配置
$RESPONSIVELY_PATH = "C:\Users\Administrator\AppData\Local\Programs\ResponsivelyApp\ResponsivelyApp.exe"
$GAME_URL = "https://edu-create.vercel.app/games/switcher?game=match-up-game&activityId=cmh93tjuh0001l404hszkdf94&layout=mixed&itemsPerPage=20"
$CDP_PORT = 9222

# 檢查 Responsively App 是否存在
if (-not (Test-Path $RESPONSIVELY_PATH)) {
    Write-Host "❌ 錯誤: Responsively App 未找到" -ForegroundColor Red
    Write-Host "   路徑: $RESPONSIVELY_PATH" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Responsively App 已找到" -ForegroundColor Green
Write-Host "   路徑: $RESPONSIVELY_PATH" -ForegroundColor Green
Write-Host ""

# 檢查 CDP 端口是否已被佔用
Write-Host "🔍 檢查 CDP 端口 $CDP_PORT..." -ForegroundColor Yellow
$portInUse = Get-NetTCPConnection -LocalPort $CDP_PORT -ErrorAction SilentlyContinue

if ($portInUse) {
    Write-Host "⚠️  警告: 端口 $CDP_PORT 已被佔用" -ForegroundColor Yellow
    Write-Host "   請關閉其他 Responsively App 實例或使用不同的端口" -ForegroundColor Yellow
    Write-Host ""
}

# 啟動 Responsively App 並啟用 CDP
Write-Host "🚀 啟動 Responsively App..." -ForegroundColor Cyan
Write-Host "   URL: $GAME_URL" -ForegroundColor Cyan
Write-Host "   CDP 端口: $CDP_PORT" -ForegroundColor Cyan
Write-Host ""

try {
    # 啟動進程
    $process = Start-Process -FilePath $RESPONSIVELY_PATH `
                            -ArgumentList "--remote-debugging-port=$CDP_PORT", $GAME_URL `
                            -PassThru `
                            -ErrorAction Stop

    Write-Host "✅ Responsively App 已啟動" -ForegroundColor Green
    Write-Host "   進程 ID: $($process.Id)" -ForegroundColor Green
    Write-Host ""

    # 等待應用啟動
    Write-Host "⏳ 等待應用啟動... (5 秒)" -ForegroundColor Yellow
    Start-Sleep -Seconds 5

    # 檢查 CDP 端口是否可用
    Write-Host "🔍 檢查 CDP 端口連接..." -ForegroundColor Yellow
    $maxRetries = 10
    $retryCount = 0
    $cdpReady = $false

    while ($retryCount -lt $maxRetries) {
        try {
            $tcpClient = New-Object System.Net.Sockets.TcpClient
            $tcpClient.Connect("localhost", $CDP_PORT)
            $tcpClient.Close()
            $cdpReady = $true
            break
        } catch {
            $retryCount++
            if ($retryCount -lt $maxRetries) {
                Write-Host "   ⏳ 重試 ($retryCount/$maxRetries)..." -ForegroundColor Yellow
                Start-Sleep -Seconds 1
            }
        }
    }

    if ($cdpReady) {
        Write-Host "✅ CDP 端口已就緒" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "⚠️  警告: CDP 端口未就緒，但應用已啟動" -ForegroundColor Yellow
        Write-Host ""
    }

    # 顯示下一步指示
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║  📋 下一步                                                 ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""

    Write-Host "1️⃣  在 Responsively App 中:" -ForegroundColor Green
    Write-Host "   • 添加 iPhone 14 設備 (390×844px)" -ForegroundColor Green
    Write-Host "   • 確認遊戲已加載" -ForegroundColor Green
    Write-Host ""

    Write-Host "2️⃣  在另一個終端中運行 CDP 控制器:" -ForegroundColor Green
    Write-Host "   node scripts/cdp-responsively-controller.js" -ForegroundColor Cyan
    Write-Host ""

    Write-Host "3️⃣  或者，在 Responsively App 中按 F12 查看控制台日誌" -ForegroundColor Green
    Write-Host ""

    Write-Host "📊 CDP 連接信息:" -ForegroundColor Yellow
    Write-Host "   • 主機: localhost" -ForegroundColor Yellow
    Write-Host "   • 端口: $CDP_PORT" -ForegroundColor Yellow
    Write-Host "   • WebSocket: ws://localhost:$CDP_PORT" -ForegroundColor Yellow
    Write-Host ""

    Write-Host "⏹️  按 Ctrl+C 停止 Responsively App" -ForegroundColor Yellow
    Write-Host ""

    # 等待進程結束
    $process.WaitForExit()

} catch {
    Write-Host "❌ 錯誤: $_" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Responsively App 已關閉" -ForegroundColor Green

