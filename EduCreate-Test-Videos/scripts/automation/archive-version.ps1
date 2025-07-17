# scripts/automation/archive-version.ps1
# EduCreate 測試影片版本歸檔腳本 (PowerShell 版本)

param(
    [Parameter(Mandatory=$true)]
    [string]$Version
)

# 配置變數
$CurrentDir = "EduCreate-Test-Videos\current"
$ArchiveDir = "EduCreate-Test-Videos\archive\$Version"
$CompressedCurrent = "EduCreate-Test-Videos\compressed\current"
$CompressedArchive = "EduCreate-Test-Videos\compressed\archive\$Version"
$MetadataDir = "EduCreate-Test-Videos\metadata"
$MemoryDir = "EduCreate-Test-Videos\local-memory"

# 日誌函數
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# 檢查當前目錄是否存在
if (-not (Test-Path $CurrentDir)) {
    Write-Error "當前版本目錄不存在: $CurrentDir"
    exit 1
}

Write-Info "開始歸檔版本: $Version"

# 1. 創建歸檔目錄結構
Write-Info "創建歸檔目錄結構..."
$Directories = @(
    "$ArchiveDir\success\games",
    "$ArchiveDir\success\content", 
    "$ArchiveDir\success\file-space",
    "$ArchiveDir\success\system",
    "$ArchiveDir\success\activities",
    "$ArchiveDir\failure\games",
    "$ArchiveDir\failure\content",
    "$ArchiveDir\failure\file-space", 
    "$ArchiveDir\failure\system",
    "$ArchiveDir\failure\activities",
    "$CompressedArchive\success",
    "$CompressedArchive\failure"
)

foreach ($Dir in $Directories) {
    New-Item -ItemType Directory -Path $Dir -Force | Out-Null
}

# 2. 計算當前版本統計
Write-Info "計算當前版本統計..."
$TotalFiles = 0
$SuccessFiles = 0
$FailureFiles = 0

if (Test-Path "$CurrentDir\success") {
    $SuccessFiles = (Get-ChildItem -Path "$CurrentDir\success" -Recurse -Filter "*.webm" -ErrorAction SilentlyContinue).Count
}

if (Test-Path "$CurrentDir\failure") {
    $FailureFiles = (Get-ChildItem -Path "$CurrentDir\failure" -Recurse -Filter "*.webm" -ErrorAction SilentlyContinue).Count
}

$TotalFiles = $SuccessFiles + $FailureFiles

if ($TotalFiles -eq 0) {
    Write-Warning "當前版本沒有影片文件需要歸檔"
    exit 0
}

Write-Info "發現 $TotalFiles 個影片文件 (成功: $SuccessFiles, 失敗: $FailureFiles)"

# 3. 複製原始影片到歸檔目錄
Write-Info "複製原始影片到歸檔目錄..."
if (Test-Path "$CurrentDir\success") {
    Copy-Item -Path "$CurrentDir\success\*" -Destination "$ArchiveDir\success\" -Recurse -Force -ErrorAction SilentlyContinue
}

if (Test-Path "$CurrentDir\failure") {
    Copy-Item -Path "$CurrentDir\failure\*" -Destination "$ArchiveDir\failure\" -Recurse -Force -ErrorAction SilentlyContinue
}

# 4. 複製壓縮影片到歸檔目錄
Write-Info "複製壓縮影片到歸檔目錄..."
if (Test-Path $CompressedCurrent) {
    Copy-Item -Path "$CompressedCurrent\*" -Destination "$CompressedArchive\" -Recurse -Force -ErrorAction SilentlyContinue
}

# 5. 計算文件大小
$OriginalSize = 0
$CompressedSize = 0

if (Test-Path $ArchiveDir) {
    $OriginalSize = (Get-ChildItem -Path $ArchiveDir -Recurse -File | Measure-Object -Property Length -Sum).Sum
}

if (Test-Path $CompressedArchive) {
    $CompressedSize = (Get-ChildItem -Path $CompressedArchive -Recurse -File | Measure-Object -Property Length -Sum).Sum
}

$OriginalSizeMB = [math]::Round($OriginalSize / 1MB, 2)
$CompressedSizeMB = [math]::Round($CompressedSize / 1MB, 2)
$SpaceSavedMB = [math]::Round($OriginalSizeMB - $CompressedSizeMB, 2)

# 6. 創建版本快照的元數據
Write-Info "創建版本快照元數據..."
$VersionMetadata = @{
    version = $Version
    archiveDate = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffK")
    statistics = @{
        totalFiles = $TotalFiles
        successFiles = $SuccessFiles
        failureFiles = $FailureFiles
        originalSizeMB = $OriginalSizeMB
        compressedSizeMB = $CompressedSizeMB
        spaceSavedMB = $SpaceSavedMB
    }
    moduleBreakdown = @{
        games = @{
            success = (Get-ChildItem -Path "$ArchiveDir\success\games" -Filter "*.webm" -ErrorAction SilentlyContinue).Count
            failure = (Get-ChildItem -Path "$ArchiveDir\failure\games" -Filter "*.webm" -ErrorAction SilentlyContinue).Count
        }
        content = @{
            success = (Get-ChildItem -Path "$ArchiveDir\success\content" -Filter "*.webm" -ErrorAction SilentlyContinue).Count
            failure = (Get-ChildItem -Path "$ArchiveDir\failure\content" -Filter "*.webm" -ErrorAction SilentlyContinue).Count
        }
        "file-space" = @{
            success = (Get-ChildItem -Path "$ArchiveDir\success\file-space" -Filter "*.webm" -ErrorAction SilentlyContinue).Count
            failure = (Get-ChildItem -Path "$ArchiveDir\failure\file-space" -Filter "*.webm" -ErrorAction SilentlyContinue).Count
        }
        system = @{
            success = (Get-ChildItem -Path "$ArchiveDir\success\system" -Filter "*.webm" -ErrorAction SilentlyContinue).Count
            failure = (Get-ChildItem -Path "$ArchiveDir\failure\system" -Filter "*.webm" -ErrorAction SilentlyContinue).Count
        }
        activities = @{
            success = (Get-ChildItem -Path "$ArchiveDir\success\activities" -Filter "*.webm" -ErrorAction SilentlyContinue).Count
            failure = (Get-ChildItem -Path "$ArchiveDir\failure\activities" -Filter "*.webm" -ErrorAction SilentlyContinue).Count
        }
    }
    archivePath = $ArchiveDir
    compressedArchivePath = $CompressedArchive
}

$VersionMetadata | ConvertTo-Json -Depth 10 | Out-File -FilePath "$ArchiveDir\version-metadata.json" -Encoding UTF8

# 7. 備份本地記憶系統快照
Write-Info "備份本地記憶系統快照..."
$MemorySnapshot = "$ArchiveDir\memory-snapshot"
New-Item -ItemType Directory -Path $MemorySnapshot -Force | Out-Null
if (Test-Path $MemoryDir) {
    Copy-Item -Path "$MemoryDir\*" -Destination $MemorySnapshot -Recurse -Force -ErrorAction SilentlyContinue
}

# 8. 生成歸檔報告
Write-Info "生成歸檔報告..."
$ArchiveReport = "$ArchiveDir\archive-report.md"
$CurrentDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$SuccessRate = if ($TotalFiles -gt 0) { [math]::Round(($SuccessFiles * 100) / $TotalFiles, 1) } else { 0 }
$CompressionRate = if ($OriginalSizeMB -gt 0) { [math]::Round((($OriginalSizeMB - $CompressedSizeMB) * 100) / $OriginalSizeMB, 1) } else { 0 }

# 創建報告內容
$ReportLines = @()
$ReportLines += "# EduCreate Test Video Archive Report"
$ReportLines += ""
$ReportLines += "**Version**: $Version"
$ReportLines += "**Archive Date**: $CurrentDate"
$ReportLines += "**Archive Path**: $ArchiveDir"
$ReportLines += ""
$ReportLines += "## Statistics Summary"
$ReportLines += ""
$ReportLines += "- Total Videos: $TotalFiles"
$ReportLines += "- Success Tests: $SuccessFiles"
$ReportLines += "- Failed Tests: $FailureFiles"
$ReportLines += "- Success Rate: $SuccessRate%"
$ReportLines += ""
$ReportLines += "## Storage Usage"
$ReportLines += ""
$ReportLines += "- Original Size: $OriginalSizeMB MB"
$ReportLines += "- Compressed Size: $CompressedSizeMB MB"
$ReportLines += "- Space Saved: $SpaceSavedMB MB"
$ReportLines += "- Compression Rate: $CompressionRate%"
$ReportLines += ""
$ReportLines += "## Module Distribution"
$ReportLines += ""
$ReportLines += "### Games Module"
$ReportLines += "- Success Tests: $($VersionMetadata.moduleBreakdown.games.success)"
$ReportLines += "- Failed Tests: $($VersionMetadata.moduleBreakdown.games.failure)"
$ReportLines += ""
$ReportLines += "### Content Module"
$ReportLines += "- Success Tests: $($VersionMetadata.moduleBreakdown.content.success)"
$ReportLines += "- Failed Tests: $($VersionMetadata.moduleBreakdown.content.failure)"
$ReportLines += ""
$ReportLines += "### Activities Module"
$ReportLines += "- Success Tests: $($VersionMetadata.moduleBreakdown.activities.success)"
$ReportLines += "- Failed Tests: $($VersionMetadata.moduleBreakdown.activities.failure)"
$ReportLines += ""
$ReportLines += "---"
$ReportLines += "*This report was automatically generated by EduCreate Test Video Management System*"

$ReportLines | Out-File -FilePath $ArchiveReport -Encoding UTF8

# 9. 更新版本歷史記錄
Write-Info "更新版本歷史記錄..."
$VersionHistory = "$MetadataDir\version-history.json"

# 確保元數據目錄存在
New-Item -ItemType Directory -Path $MetadataDir -Force | Out-Null

# 如果版本歷史文件不存在，創建它
if (-not (Test-Path $VersionHistory)) {
    @{ versions = @() } | ConvertTo-Json | Out-File -FilePath $VersionHistory -Encoding UTF8
}

# 讀取現有版本歷史
$HistoryData = Get-Content -Path $VersionHistory -Raw | ConvertFrom-Json

# 添加新版本
$NewVersion = @{
    version = $Version
    archiveDate = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffK")
    videoCount = $TotalFiles
    originalSizeMB = $OriginalSizeMB
    compressedSizeMB = $CompressedSizeMB
    archivePath = "archive\$Version"
}

$HistoryData.versions += $NewVersion
$HistoryData | ConvertTo-Json -Depth 10 | Out-File -FilePath $VersionHistory -Encoding UTF8

# 10. 完成歸檔
Write-Success "版本 $Version 歸檔完成！"
Write-Info "歸檔統計:"
Write-Info "  - 歸檔路徑: $ArchiveDir"
Write-Info "  - 影片數量: $TotalFiles"
Write-Info "  - 原始大小: $OriginalSizeMB MB"
Write-Info "  - 壓縮大小: $CompressedSizeMB MB"
Write-Info "  - 節省空間: $SpaceSavedMB MB"

# 11. 顯示下一步建議
Write-Info "建議的下一步操作:"
Write-Host "  1. 檢查歸檔報告: Get-Content '$ArchiveReport'"
Write-Host "  2. 驗證歸檔完整性: Get-ChildItem '$ArchiveDir' -Recurse"
Write-Host "  3. 開始新版本開發: 繼續添加測試影片到 current\ 目錄"
Write-Host "  4. 定期清理: 運行 cleanup-old-versions.ps1 清理舊版本"

exit 0
