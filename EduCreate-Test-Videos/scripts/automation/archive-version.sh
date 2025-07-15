#!/bin/bash
# scripts/automation/archive-version.sh
# EduCreate 測試影片版本歸檔腳本

set -e  # 遇到錯誤立即退出

# 配置變數
VERSION="$1"
CURRENT_DIR="EduCreate-Test-Videos/current"
ARCHIVE_DIR="EduCreate-Test-Videos/archive/$VERSION"
COMPRESSED_CURRENT="EduCreate-Test-Videos/compressed/current"
COMPRESSED_ARCHIVE="EduCreate-Test-Videos/compressed/archive/$VERSION"
METADATA_DIR="EduCreate-Test-Videos/metadata"
MEMORY_DIR="EduCreate-Test-Videos/local-memory"

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日誌函數
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 檢查參數
if [ -z "$VERSION" ]; then
    log_error "請提供版本號"
    echo "使用方法: $0 <版本號>"
    echo "例如: $0 v1.1.0"
    exit 1
fi

# 檢查當前目錄是否存在
if [ ! -d "$CURRENT_DIR" ]; then
    log_error "當前版本目錄不存在: $CURRENT_DIR"
    exit 1
fi

log_info "開始歸檔版本: $VERSION"

# 1. 創建歸檔目錄結構
log_info "創建歸檔目錄結構..."
mkdir -p "$ARCHIVE_DIR/success/games"
mkdir -p "$ARCHIVE_DIR/success/content"
mkdir -p "$ARCHIVE_DIR/success/file-space"
mkdir -p "$ARCHIVE_DIR/success/system"
mkdir -p "$ARCHIVE_DIR/failure/games"
mkdir -p "$ARCHIVE_DIR/failure/content"
mkdir -p "$ARCHIVE_DIR/failure/file-space"
mkdir -p "$ARCHIVE_DIR/failure/system"

mkdir -p "$COMPRESSED_ARCHIVE/success"
mkdir -p "$COMPRESSED_ARCHIVE/failure"

# 2. 計算當前版本統計
log_info "計算當前版本統計..."
TOTAL_FILES=$(find "$CURRENT_DIR" -name "*.webm" | wc -l)
SUCCESS_FILES=$(find "$CURRENT_DIR/success" -name "*.webm" 2>/dev/null | wc -l || echo 0)
FAILURE_FILES=$(find "$CURRENT_DIR/failure" -name "*.webm" 2>/dev/null | wc -l || echo 0)

if [ "$TOTAL_FILES" -eq 0 ]; then
    log_warning "當前版本沒有影片文件需要歸檔"
    exit 0
fi

log_info "發現 $TOTAL_FILES 個影片文件 (成功: $SUCCESS_FILES, 失敗: $FAILURE_FILES)"

# 3. 複製原始影片到歸檔目錄
log_info "複製原始影片到歸檔目錄..."
if [ -d "$CURRENT_DIR/success" ]; then
    cp -r "$CURRENT_DIR/success"/* "$ARCHIVE_DIR/success/" 2>/dev/null || true
fi

if [ -d "$CURRENT_DIR/failure" ]; then
    cp -r "$CURRENT_DIR/failure"/* "$ARCHIVE_DIR/failure/" 2>/dev/null || true
fi

# 4. 複製壓縮影片到歸檔目錄
log_info "複製壓縮影片到歸檔目錄..."
if [ -d "$COMPRESSED_CURRENT" ]; then
    cp -r "$COMPRESSED_CURRENT"/* "$COMPRESSED_ARCHIVE/" 2>/dev/null || true
fi

# 5. 創建版本快照的元數據
log_info "創建版本快照元數據..."
VERSION_METADATA="$ARCHIVE_DIR/version-metadata.json"

# 計算文件大小
ORIGINAL_SIZE=$(du -sb "$ARCHIVE_DIR" | cut -f1)
COMPRESSED_SIZE=$(du -sb "$COMPRESSED_ARCHIVE" 2>/dev/null | cut -f1 || echo 0)
ORIGINAL_SIZE_MB=$((ORIGINAL_SIZE / 1024 / 1024))
COMPRESSED_SIZE_MB=$((COMPRESSED_SIZE / 1024 / 1024))

# 生成版本元數據
cat > "$VERSION_METADATA" << EOF
{
  "version": "$VERSION",
  "archiveDate": "$(date -Iseconds)",
  "statistics": {
    "totalFiles": $TOTAL_FILES,
    "successFiles": $SUCCESS_FILES,
    "failureFiles": $FAILURE_FILES,
    "originalSizeMB": $ORIGINAL_SIZE_MB,
    "compressedSizeMB": $COMPRESSED_SIZE_MB,
    "spaceSavedMB": $((ORIGINAL_SIZE_MB - COMPRESSED_SIZE_MB))
  },
  "moduleBreakdown": {
    "games": {
      "success": $(find "$ARCHIVE_DIR/success/games" -name "*.webm" 2>/dev/null | wc -l || echo 0),
      "failure": $(find "$ARCHIVE_DIR/failure/games" -name "*.webm" 2>/dev/null | wc -l || echo 0)
    },
    "content": {
      "success": $(find "$ARCHIVE_DIR/success/content" -name "*.webm" 2>/dev/null | wc -l || echo 0),
      "failure": $(find "$ARCHIVE_DIR/failure/content" -name "*.webm" 2>/dev/null | wc -l || echo 0)
    },
    "file-space": {
      "success": $(find "$ARCHIVE_DIR/success/file-space" -name "*.webm" 2>/dev/null | wc -l || echo 0),
      "failure": $(find "$ARCHIVE_DIR/failure/file-space" -name "*.webm" 2>/dev/null | wc -l || echo 0)
    },
    "system": {
      "success": $(find "$ARCHIVE_DIR/success/system" -name "*.webm" 2>/dev/null | wc -l || echo 0),
      "failure": $(find "$ARCHIVE_DIR/failure/system" -name "*.webm" 2>/dev/null | wc -l || echo 0)
    }
  },
  "archivePath": "$ARCHIVE_DIR",
  "compressedArchivePath": "$COMPRESSED_ARCHIVE"
}
EOF

# 6. 更新版本歷史記錄
log_info "更新版本歷史記錄..."
VERSION_HISTORY="$METADATA_DIR/version-history.json"

# 如果版本歷史文件不存在，創建它
if [ ! -f "$VERSION_HISTORY" ]; then
    echo '{"versions": []}' > "$VERSION_HISTORY"
fi

# 添加新版本到歷史記錄
TEMP_FILE=$(mktemp)
jq --arg version "$VERSION" \
   --arg date "$(date -Iseconds)" \
   --argjson videoCount "$TOTAL_FILES" \
   --argjson originalSize "$ORIGINAL_SIZE_MB" \
   --argjson compressedSize "$COMPRESSED_SIZE_MB" \
   '.versions += [{
     "version": $version,
     "archiveDate": $date,
     "videoCount": $videoCount,
     "originalSizeMB": $originalSize,
     "compressedSizeMB": $compressedSize,
     "archivePath": "archive/\($version)"
   }]' "$VERSION_HISTORY" > "$TEMP_FILE" && mv "$TEMP_FILE" "$VERSION_HISTORY"

# 7. 備份本地記憶系統快照
log_info "備份本地記憶系統快照..."
MEMORY_SNAPSHOT="$ARCHIVE_DIR/memory-snapshot"
mkdir -p "$MEMORY_SNAPSHOT"
cp -r "$MEMORY_DIR"/* "$MEMORY_SNAPSHOT/" 2>/dev/null || true

# 8. 生成歸檔報告
log_info "生成歸檔報告..."
ARCHIVE_REPORT="$ARCHIVE_DIR/archive-report.md"

cat > "$ARCHIVE_REPORT" << EOF
# EduCreate 測試影片歸檔報告

**版本**: $VERSION  
**歸檔日期**: $(date '+%Y-%m-%d %H:%M:%S')  
**歸檔路徑**: $ARCHIVE_DIR

## 📊 統計摘要

- **總影片數**: $TOTAL_FILES
- **成功測試**: $SUCCESS_FILES
- **失敗測試**: $FAILURE_FILES
- **成功率**: $(( SUCCESS_FILES * 100 / TOTAL_FILES ))%

## 💾 空間使用

- **原始大小**: ${ORIGINAL_SIZE_MB} MB
- **壓縮後大小**: ${COMPRESSED_SIZE_MB} MB
- **節省空間**: $((ORIGINAL_SIZE_MB - COMPRESSED_SIZE_MB)) MB
- **壓縮率**: $(( (ORIGINAL_SIZE_MB - COMPRESSED_SIZE_MB) * 100 / ORIGINAL_SIZE_MB ))%

## 🎯 模組分佈

### 遊戲模組 (games)
- 成功測試: $(find "$ARCHIVE_DIR/success/games" -name "*.webm" 2>/dev/null | wc -l || echo 0)
- 失敗測試: $(find "$ARCHIVE_DIR/failure/games" -name "*.webm" 2>/dev/null | wc -l || echo 0)

### 內容模組 (content)  
- 成功測試: $(find "$ARCHIVE_DIR/success/content" -name "*.webm" 2>/dev/null | wc -l || echo 0)
- 失敗測試: $(find "$ARCHIVE_DIR/failure/content" -name "*.webm" 2>/dev/null | wc -l || echo 0)

### 檔案空間模組 (file-space)
- 成功測試: $(find "$ARCHIVE_DIR/success/file-space" -name "*.webm" 2>/dev/null | wc -l || echo 0)
- 失敗測試: $(find "$ARCHIVE_DIR/failure/file-space" -name "*.webm" 2>/dev/null | wc -l || echo 0)

### 系統模組 (system)
- 成功測試: $(find "$ARCHIVE_DIR/success/system" -name "*.webm" 2>/dev/null | wc -l || echo 0)
- 失敗測試: $(find "$ARCHIVE_DIR/failure/system" -name "*.webm" 2>/dev/null | wc -l || echo 0)

## 📁 歸檔結構

\`\`\`
$ARCHIVE_DIR/
├── success/
│   ├── games/
│   ├── content/
│   ├── file-space/
│   └── system/
├── failure/
│   ├── games/
│   ├── content/
│   ├── file-space/
│   └── system/
├── memory-snapshot/
├── version-metadata.json
└── archive-report.md
\`\`\`

## 🔗 相關文件

- **版本元數據**: [version-metadata.json](./version-metadata.json)
- **記憶系統快照**: [memory-snapshot/](./memory-snapshot/)
- **壓縮歸檔**: $COMPRESSED_ARCHIVE

---
*此報告由 EduCreate 測試影片管理系統自動生成*
EOF

# 9. 可選：清理當前版本（需要確認）
read -p "是否要清理當前版本的影片文件？(y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_warning "清理當前版本影片文件..."
    rm -rf "$CURRENT_DIR/success"/* 2>/dev/null || true
    rm -rf "$CURRENT_DIR/failure"/* 2>/dev/null || true
    rm -rf "$COMPRESSED_CURRENT"/* 2>/dev/null || true
    log_success "當前版本影片文件已清理"
else
    log_info "保留當前版本影片文件"
fi

# 10. 完成歸檔
log_success "版本 $VERSION 歸檔完成！"
log_info "歸檔統計:"
log_info "  - 歸檔路徑: $ARCHIVE_DIR"
log_info "  - 影片數量: $TOTAL_FILES"
log_info "  - 原始大小: ${ORIGINAL_SIZE_MB} MB"
log_info "  - 壓縮大小: ${COMPRESSED_SIZE_MB} MB"
log_info "  - 節省空間: $((ORIGINAL_SIZE_MB - COMPRESSED_SIZE_MB)) MB"

# 11. 顯示下一步建議
log_info "建議的下一步操作:"
echo "  1. 檢查歸檔報告: cat '$ARCHIVE_REPORT'"
echo "  2. 驗證歸檔完整性: ls -la '$ARCHIVE_DIR'"
echo "  3. 開始新版本開發: 繼續添加測試影片到 current/ 目錄"
echo "  4. 定期清理: 運行 cleanup-old-versions.sh 清理舊版本"

exit 0
