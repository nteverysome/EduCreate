# Phaser 3 錯誤預防檢查腳本 (PowerShell 版本)
# 使用方法: .\phaser3-prevention-check.ps1 [文件路徑]

param(
    [string]$TargetPath = "."
)

Write-Host "🎯 執行 Phaser 3 錯誤預防檢查" -ForegroundColor Green
Write-Host "📁 檢查路徑: $TargetPath" -ForegroundColor Cyan

# 初始化檢查結果
$TotalChecks = 5
$PassedChecks = 0
$IssuesFound = @()

Write-Host ""
Write-Host "==================================" -ForegroundColor Yellow
Write-Host "🎮 Phaser 3 錯誤預防檢查報告" -ForegroundColor Yellow
Write-Host "==================================" -ForegroundColor Yellow

# 檢查 1: StandardPhaserConfig 使用
Write-Host "🔍 檢查 1/5: StandardPhaserConfig 使用狀況" -ForegroundColor Blue
$StandardConfigFound = Get-ChildItem -Path $TargetPath -Recurse -Include "*.js", "*.ts" | Select-String -Pattern "StandardPhaserConfig|STANDARD_CONFIG" -Quiet
if ($StandardConfigFound) {
    Write-Host "✅ 發現 StandardPhaserConfig 使用" -ForegroundColor Green
    $PassedChecks++
} else {
    Write-Host "⚠️ 未發現 StandardPhaserConfig 使用" -ForegroundColor Yellow
    $IssuesFound += "建議使用 StandardPhaserConfig (89% 成功率配置)"
}

# 檢查 2: 物理系統配置
Write-Host ""
Write-Host "🔍 檢查 2/5: 物理系統配置" -ForegroundColor Blue
$PhysicsConfigFound = Get-ChildItem -Path $TargetPath -Recurse -Include "*.js", "*.ts" | Select-String -Pattern "physics.*arcade|physics.*matter" -Quiet
$PhysicsUsageFound = Get-ChildItem -Path $TargetPath -Recurse -Include "*.js", "*.ts" | Select-String -Pattern "this\.physics\.add|physics\.add" -Quiet

if ($PhysicsUsageFound -and $PhysicsConfigFound) {
    Write-Host "✅ 物理系統配置正確" -ForegroundColor Green
    $PassedChecks++
} elseif ($PhysicsUsageFound -and -not $PhysicsConfigFound) {
    Write-Host "❌ 使用物理系統但未在配置中啟用" -ForegroundColor Red
    $IssuesFound += "在遊戲配置中啟用物理引擎: physics: { default: 'arcade', arcade: { gravity: { y: 0 } } }"
} else {
    Write-Host "ℹ️ 未使用物理系統" -ForegroundColor Cyan
    $PassedChecks++
}

# 檢查 3: 精靈創建方式
Write-Host ""
Write-Host "🔍 檢查 3/5: 精靈創建方式" -ForegroundColor Blue
$WrongSpriteUsage = Get-ChildItem -Path $TargetPath -Recurse -Include "*.js", "*.ts" | Select-String -Pattern "this\.add\.sprite.*setVelocity|add\.sprite.*setVelocity" -Quiet

if ($WrongSpriteUsage) {
    Write-Host "❌ 發現對非物理精靈使用物理方法" -ForegroundColor Red
    $IssuesFound += "使用 this.physics.add.sprite() 創建物理精靈，而不是 this.add.sprite()"
} else {
    Write-Host "✅ 精靈創建方式正確" -ForegroundColor Green
    $PassedChecks++
}

# 檢查 4: Scale Manager 配置
Write-Host ""
Write-Host "🔍 檢查 4/5: Scale Manager 配置" -ForegroundColor Blue
$ScaleConfigFound = Get-ChildItem -Path $TargetPath -Recurse -Include "*.js", "*.ts" | Select-String -Pattern "Scale\.FIT|scale.*FIT|Scale\.CENTER_BOTH|autoCenter.*CENTER_BOTH" -Quiet

if ($ScaleConfigFound) {
    Write-Host "✅ 發現正確的 Scale Manager 配置" -ForegroundColor Green
    $PassedChecks++
} else {
    Write-Host "⚠️ 未發現推薦的 Scale Manager 配置" -ForegroundColor Yellow
    $IssuesFound += "建議使用 Scale.FIT 模式和 CENTER_BOTH 自動居中"
}

# 檢查 5: 響應式系統簡化
Write-Host ""
Write-Host "🔍 檢查 5/5: 響應式系統複雜度" -ForegroundColor Blue
$ComplexResponsiveFound = Get-ChildItem -Path $TargetPath -Recurse -Include "*.js", "*.ts" | Select-String -Pattern "ResponsiveManager|AdaptiveFullscreenManager" -Quiet

if ($ComplexResponsiveFound) {
    Write-Host "⚠️ 發現複雜的響應式管理器" -ForegroundColor Yellow
    $IssuesFound += "建議使用 Phaser 內建 Scale 系統: scene.scale.on('resize', callback)"
} else {
    Write-Host "✅ 響應式系統簡化良好" -ForegroundColor Green
    $PassedChecks++
}

# 生成檢查報告
Write-Host ""
Write-Host "==================================" -ForegroundColor Yellow
Write-Host "📊 檢查結果統計" -ForegroundColor Yellow
Write-Host "==================================" -ForegroundColor Yellow
Write-Host "✅ 通過檢查: $PassedChecks/$TotalChecks" -ForegroundColor Green

# 計算通過率
$PassRate = [math]::Round(($PassedChecks * 100 / $TotalChecks), 1)
Write-Host "📈 通過率: $PassRate%" -ForegroundColor Cyan

# 評估結果
if ($PassedChecks -eq $TotalChecks) {
    Write-Host "🎉 所有檢查通過！Phaser 3 配置完美" -ForegroundColor Green
    $ResultStatus = "PERFECT"
} elseif ($PassedChecks -ge 4) {
    Write-Host "👍 大部分檢查通過，只有少量問題" -ForegroundColor Yellow
    $ResultStatus = "GOOD"
} elseif ($PassedChecks -ge 2) {
    Write-Host "⚠️ 部分檢查通過，需要改進" -ForegroundColor Yellow
    $ResultStatus = "NEEDS_IMPROVEMENT"
} else {
    Write-Host "❌ 多項檢查失敗，需要重大改進" -ForegroundColor Red
    $ResultStatus = "CRITICAL"
}

# 顯示發現的問題
if ($IssuesFound.Count -gt 0) {
    Write-Host ""
    Write-Host "🔧 發現的問題和建議修復方案:" -ForegroundColor Yellow
    for ($i = 0; $i -lt $IssuesFound.Count; $i++) {
        Write-Host "$($i+1). $($IssuesFound[$i])" -ForegroundColor White
    }
}

# 提供 Phaser 3 最佳實踐建議
Write-Host ""
Write-Host "💡 Phaser 3 最佳實踐建議:" -ForegroundColor Cyan
Write-Host "1. 使用 StandardPhaserConfig 統一配置模板" -ForegroundColor White
Write-Host "2. 物理系統使用前必須在配置中啟用" -ForegroundColor White
Write-Host "3. 創建物理精靈使用 this.physics.add.sprite()" -ForegroundColor White
Write-Host "4. 使用 Scale.FIT 保持比例，CENTER_BOTH 自動居中" -ForegroundColor White
Write-Host "5. 避免複雜的自定義響應式管理器" -ForegroundColor White

# 記錄檢查結果到本地記憶系統
$Timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss"
$CheckResult = @{
    timestamp = $Timestamp
    target_path = $TargetPath
    total_checks = $TotalChecks
    passed_checks = $PassedChecks
    pass_rate = $PassRate
    status = $ResultStatus
    issues_count = $IssuesFound.Count
} | ConvertTo-Json -Compress

# 確保目錄存在
$MemoryDir = "EduCreate-Test-Videos/local-memory"
if (-not (Test-Path $MemoryDir)) {
    New-Item -ItemType Directory -Path $MemoryDir -Force | Out-Null
}

# 記錄到 Phaser 3 錯誤模式文件
$Phaser3ErrorFile = "$MemoryDir/phaser3-error-patterns.json"
if (Test-Path $Phaser3ErrorFile) {
    try {
        $ExistingData = Get-Content $Phaser3ErrorFile | ConvertFrom-Json
        if (-not $ExistingData.prevention_checks) {
            $ExistingData | Add-Member -MemberType NoteProperty -Name "prevention_checks" -Value @()
        }
        $ExistingData.prevention_checks += ($CheckResult | ConvertFrom-Json)
        $ExistingData | ConvertTo-Json -Depth 10 | Set-Content $Phaser3ErrorFile
        Write-Host "🧠 檢查結果已記錄到本地記憶系統" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ 無法更新 phaser3-error-patterns.json 文件: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️ phaser3-error-patterns.json 文件不存在，跳過記錄" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Phaser 3 錯誤預防檢查完成" -ForegroundColor Green

# 返回適當的退出碼
if ($ResultStatus -eq "PERFECT" -or $ResultStatus -eq "GOOD") {
    exit 0
} else {
    exit 1
}
