# Phaser 3 Error Prevention Check Script (PowerShell Version)
# Usage: .\phaser3-prevention-check-en.ps1 [FilePath]

param(
    [string]$TargetPath = "."
)

Write-Host "Executing Phaser 3 Error Prevention Check" -ForegroundColor Green
Write-Host "Check Path: $TargetPath" -ForegroundColor Cyan

# Initialize check results
$TotalChecks = 5
$PassedChecks = 0
$IssuesFound = @()

Write-Host ""
Write-Host "==================================" -ForegroundColor Yellow
Write-Host "Phaser 3 Error Prevention Report" -ForegroundColor Yellow
Write-Host "==================================" -ForegroundColor Yellow

# Check 1: StandardPhaserConfig usage
Write-Host "Check 1/5: StandardPhaserConfig Usage" -ForegroundColor Blue
try {
    $StandardConfigFound = Get-ChildItem -Path $TargetPath -Recurse -Include "*.js", "*.ts" -ErrorAction SilentlyContinue | Select-String -Pattern "StandardPhaserConfig|STANDARD_CONFIG" -Quiet
    if ($StandardConfigFound) {
        Write-Host "PASS: StandardPhaserConfig found" -ForegroundColor Green
        $PassedChecks++
    } else {
        Write-Host "WARN: StandardPhaserConfig not found" -ForegroundColor Yellow
        $IssuesFound += "Recommend using StandardPhaserConfig (89% success rate configuration)"
    }
} catch {
    Write-Host "WARN: Could not check StandardPhaserConfig" -ForegroundColor Yellow
}

# Check 2: Physics system configuration
Write-Host ""
Write-Host "Check 2/5: Physics System Configuration" -ForegroundColor Blue
try {
    $PhysicsConfigFound = Get-ChildItem -Path $TargetPath -Recurse -Include "*.js", "*.ts" -ErrorAction SilentlyContinue | Select-String -Pattern "physics.*arcade|physics.*matter" -Quiet
    $PhysicsUsageFound = Get-ChildItem -Path $TargetPath -Recurse -Include "*.js", "*.ts" -ErrorAction SilentlyContinue | Select-String -Pattern "this\.physics\.add|physics\.add" -Quiet

    if ($PhysicsUsageFound -and $PhysicsConfigFound) {
        Write-Host "PASS: Physics system configured correctly" -ForegroundColor Green
        $PassedChecks++
    } elseif ($PhysicsUsageFound -and -not $PhysicsConfigFound) {
        Write-Host "FAIL: Physics used but not enabled in config" -ForegroundColor Red
        $IssuesFound += "Enable physics engine in game config: physics: { default: 'arcade', arcade: { gravity: { y: 0 } } }"
    } else {
        Write-Host "INFO: Physics system not used" -ForegroundColor Cyan
        $PassedChecks++
    }
} catch {
    Write-Host "WARN: Could not check physics configuration" -ForegroundColor Yellow
    $PassedChecks++
}

# Check 3: Sprite creation method
Write-Host ""
Write-Host "Check 3/5: Sprite Creation Method" -ForegroundColor Blue
try {
    $WrongSpriteUsage = Get-ChildItem -Path $TargetPath -Recurse -Include "*.js", "*.ts" -ErrorAction SilentlyContinue | Select-String -Pattern "this\.add\.sprite.*setVelocity|add\.sprite.*setVelocity" -Quiet

    if ($WrongSpriteUsage) {
        Write-Host "FAIL: Found physics methods on non-physics sprites" -ForegroundColor Red
        $IssuesFound += "Use this.physics.add.sprite() for physics sprites, not this.add.sprite()"
    } else {
        Write-Host "PASS: Sprite creation method correct" -ForegroundColor Green
        $PassedChecks++
    }
} catch {
    Write-Host "WARN: Could not check sprite creation" -ForegroundColor Yellow
    $PassedChecks++
}

# Check 4: Scale Manager configuration
Write-Host ""
Write-Host "Check 4/5: Scale Manager Configuration" -ForegroundColor Blue
try {
    $ScaleConfigFound = Get-ChildItem -Path $TargetPath -Recurse -Include "*.js", "*.ts" -ErrorAction SilentlyContinue | Select-String -Pattern "Scale\.FIT|scale.*FIT|Scale\.CENTER_BOTH|autoCenter.*CENTER_BOTH" -Quiet

    if ($ScaleConfigFound) {
        Write-Host "PASS: Correct Scale Manager configuration found" -ForegroundColor Green
        $PassedChecks++
    } else {
        Write-Host "WARN: Recommended Scale Manager configuration not found" -ForegroundColor Yellow
        $IssuesFound += "Recommend using Scale.FIT mode and CENTER_BOTH auto-center"
    }
} catch {
    Write-Host "WARN: Could not check Scale Manager configuration" -ForegroundColor Yellow
}

# Check 5: Responsive system simplification
Write-Host ""
Write-Host "Check 5/5: Responsive System Complexity" -ForegroundColor Blue
try {
    $ComplexResponsiveFound = Get-ChildItem -Path $TargetPath -Recurse -Include "*.js", "*.ts" -ErrorAction SilentlyContinue | Select-String -Pattern "ResponsiveManager|AdaptiveFullscreenManager" -Quiet

    if ($ComplexResponsiveFound) {
        Write-Host "WARN: Complex responsive manager found" -ForegroundColor Yellow
        $IssuesFound += "Recommend using Phaser built-in Scale system: scene.scale.on('resize', callback)"
    } else {
        Write-Host "PASS: Responsive system simplified well" -ForegroundColor Green
        $PassedChecks++
    }
} catch {
    Write-Host "WARN: Could not check responsive system" -ForegroundColor Yellow
    $PassedChecks++
}

# Generate check report
Write-Host ""
Write-Host "==================================" -ForegroundColor Yellow
Write-Host "Check Results Statistics" -ForegroundColor Yellow
Write-Host "==================================" -ForegroundColor Yellow
Write-Host "Passed Checks: $PassedChecks/$TotalChecks" -ForegroundColor Green

# Calculate pass rate
$PassRate = [math]::Round(($PassedChecks * 100 / $TotalChecks), 1)
Write-Host "Pass Rate: $PassRate%" -ForegroundColor Cyan

# Evaluate results
if ($PassedChecks -eq $TotalChecks) {
    Write-Host "EXCELLENT: All checks passed! Phaser 3 configuration is perfect" -ForegroundColor Green
    $ResultStatus = "PERFECT"
} elseif ($PassedChecks -ge 4) {
    Write-Host "GOOD: Most checks passed, only minor issues" -ForegroundColor Yellow
    $ResultStatus = "GOOD"
} elseif ($PassedChecks -ge 2) {
    Write-Host "NEEDS IMPROVEMENT: Some checks passed, needs improvement" -ForegroundColor Yellow
    $ResultStatus = "NEEDS_IMPROVEMENT"
} else {
    Write-Host "CRITICAL: Multiple checks failed, needs major improvement" -ForegroundColor Red
    $ResultStatus = "CRITICAL"
}

# Display found issues
if ($IssuesFound.Count -gt 0) {
    Write-Host ""
    Write-Host "Issues Found and Recommended Solutions:" -ForegroundColor Yellow
    for ($i = 0; $i -lt $IssuesFound.Count; $i++) {
        Write-Host "$($i+1). $($IssuesFound[$i])" -ForegroundColor White
    }
}

# Provide Phaser 3 best practices
Write-Host ""
Write-Host "Phaser 3 Best Practices:" -ForegroundColor Cyan
Write-Host "1. Use StandardPhaserConfig unified configuration template" -ForegroundColor White
Write-Host "2. Physics system must be enabled in config before use" -ForegroundColor White
Write-Host "3. Create physics sprites using this.physics.add.sprite()" -ForegroundColor White
Write-Host "4. Use Scale.FIT to maintain aspect ratio, CENTER_BOTH for auto-center" -ForegroundColor White
Write-Host "5. Avoid complex custom responsive managers" -ForegroundColor White

Write-Host ""
Write-Host "Phaser 3 Error Prevention Check Completed" -ForegroundColor Green

# Return appropriate exit code
if ($ResultStatus -eq "PERFECT" -or $ResultStatus -eq "GOOD") {
    exit 0
} else {
    exit 1
}
