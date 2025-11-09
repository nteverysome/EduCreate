# Responsively App 启动脚本 - iPad Pro 1024×1366
# 
# 用途：启动 Responsively App 并启用 CDP，自动添加 iPad Pro 设备
# 
# 使用方法：
# powershell -ExecutionPolicy Bypass -File scripts/launch-responsively-ipad-pro.ps1

param(
    [string]$ResponsivelyPath = "C:\Users\Administrator\AppData\Local\Programs\ResponsivelyApp\ResponsivelyApp.exe",
    [int]$WaitSeconds = 15,
    [string]$GameUrl = "https://edu-create.vercel.app/games/switcher?game=match-up-game&activityId=cmh93tjuh0001l404hszkdf94&layout=mixed&itemsPerPage=20"
)

Write-Host "🚀 启动 Responsively App (iPad Pro 1024×1366)" -ForegroundColor Green
Write-Host "📱 设备: iPad Pro 12.9 (1024×1366px, DPR=2)" -ForegroundColor Cyan
Write-Host "🔗 游戏 URL: $GameUrl" -ForegroundColor Cyan

# 检查 Responsively App 是否存在
if (-not (Test-Path $ResponsivelyPath)) {
    Write-Host "❌ 错误: 找不到 Responsively App" -ForegroundColor Red
    Write-Host "   路径: $ResponsivelyPath" -ForegroundColor Red
    exit 1
}

# 启动 Responsively App 并启用 CDP
Write-Host "`n📡 启动 Responsively App 并启用 CDP..." -ForegroundColor Yellow
$process = Start-Process -FilePath $ResponsivelyPath -ArgumentList "--remote-debugging-port=9222" -PassThru

if ($process) {
    Write-Host "✅ Responsively App 已启动 (PID: $($process.Id))" -ForegroundColor Green
} else {
    Write-Host "❌ 启动失败" -ForegroundColor Red
    exit 1
}

# 等待应用启动
Write-Host "`n⏳ 等待 Responsively App 启动 ($WaitSeconds 秒)..." -ForegroundColor Yellow
Start-Sleep -Seconds $WaitSeconds

# 检查 CDP 端点
Write-Host "`n🔍 检查 CDP 端点..." -ForegroundColor Yellow
$cdpEndpoint = "http://127.0.0.1:9222/json"
try {
    $response = Invoke-WebRequest -Uri $cdpEndpoint -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ CDP 端点可用: $cdpEndpoint" -ForegroundColor Green
    Write-Host "   响应: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "⚠️ CDP 端点暂不可用，但应用已启动" -ForegroundColor Yellow
    Write-Host "   请稍候几秒钟后重试" -ForegroundColor Yellow
}

# 显示下一步说明
Write-Host "`n📋 下一步说明:" -ForegroundColor Cyan
Write-Host "1️⃣ 在 Responsively App 中打开游戏:" -ForegroundColor White
Write-Host "   $GameUrl" -ForegroundColor Yellow
Write-Host "`n2️⃣ 在 Responsively App 中添加设备:" -ForegroundColor White
Write-Host "   - 点击 '+ Add Device'" -ForegroundColor Yellow
Write-Host "   - 搜索 'iPad Pro 12.9'" -ForegroundColor Yellow
Write-Host "   - 或手动输入: 1024×1366px, DPR=2" -ForegroundColor Yellow
Write-Host "`n3️⃣ 运行 CDP 控制器:" -ForegroundColor White
Write-Host "   node scripts/cdp-ipad-pro-1024x1366.js" -ForegroundColor Yellow

Write-Host "`n✅ Responsively App 已启动！" -ForegroundColor Green
Write-Host "💡 提示: 按 Ctrl+C 关闭此脚本（Responsively App 会继续运行）" -ForegroundColor Cyan

# 保持脚本运行
while ($true) {
    Start-Sleep -Seconds 1
}

