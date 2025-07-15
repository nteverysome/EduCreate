#!/bin/bash
# scripts/automation/cleanup-old-versions.sh
# EduCreate 測試影片舊版本清理腳本

set -e

# 配置變數
ARCHIVE_DIR="EduCreate-Test-Videos/archive"
COMPRESSED_ARCHIVE_DIR="EduCreate-Test-Videos/compressed/archive"
METADATA_DIR="EduCreate-Test-Videos/metadata"
KEEP_RECENT_VERSIONS=3      # 保留最近3個版本的所有影片
KEEP_SUCCESS_VERSIONS=6     # 保留最近6個版本的成功測試影片
KEEP_CRITICAL_VERSIONS=12   # 保留最近12個版本的關鍵功能影片

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# 檢查目錄是否存在
if [ ! -d "$ARCHIVE_DIR" ]; then
    log_warning "歸檔目錄不存在: $ARCHIVE_DIR"
    exit 0
fi

log_info "開始清理舊版本測試影片..."

# 獲取所有版本目錄，按修改時間排序（最新的在前）
VERSIONS=($(ls -t "$ARCHIVE_DIR" 2>/dev/null || true))

if [ ${#VERSIONS[@]} -eq 0 ]; then
    log_warning "沒有找到需要清理的版本"
    exit 0
fi

log_info "發現 ${#VERSIONS[@]} 個歷史版本"

# 初始化統計變數
TOTAL_CLEANED=0
TOTAL_SPACE_FREED=0
VERSIONS_PROCESSED=0

# 處理每個版本
for i in "${!VERSIONS[@]}"; do
    VERSION="${VERSIONS[$i]}"
    VERSION_PATH="$ARCHIVE_DIR/$VERSION"
    COMPRESSED_VERSION_PATH="$COMPRESSED_ARCHIVE_DIR/$VERSION"
    
    # 跳過非目錄項目
    if [ ! -d "$VERSION_PATH" ]; then
        continue
    fi
    
    VERSIONS_PROCESSED=$((VERSIONS_PROCESSED + 1))
    POSITION=$((i + 1))
    
    log_info "處理版本 $VERSION (第 $POSITION 個，共 ${#VERSIONS[@]} 個)"
    
    # 計算版本大小（清理前）
    VERSION_SIZE_BEFORE=$(du -sb "$VERSION_PATH" 2>/dev/null | cut -f1 || echo 0)
    COMPRESSED_SIZE_BEFORE=$(du -sb "$COMPRESSED_VERSION_PATH" 2>/dev/null | cut -f1 || echo 0)
    
    if [ $POSITION -le $KEEP_RECENT_VERSIONS ]; then
        # 保留最近版本的所有影片
        log_success "  保留版本 $VERSION 的所有影片 (最近 $KEEP_RECENT_VERSIONS 個版本)"
        continue
        
    elif [ $POSITION -le $KEEP_SUCCESS_VERSIONS ]; then
        # 只保留成功測試影片
        log_warning "  版本 $VERSION: 只保留成功測試影片"
        
        # 刪除失敗測試影片
        if [ -d "$VERSION_PATH/failure" ]; then
            FAILURE_SIZE=$(du -sb "$VERSION_PATH/failure" 2>/dev/null | cut -f1 || echo 0)
            rm -rf "$VERSION_PATH/failure"
            log_info "    已刪除失敗測試影片 (節省 $((FAILURE_SIZE / 1024 / 1024)) MB)"
            TOTAL_SPACE_FREED=$((TOTAL_SPACE_FREED + FAILURE_SIZE))
        fi
        
        # 刪除壓縮版本中的失敗測試影片
        if [ -d "$COMPRESSED_VERSION_PATH/failure" ]; then
            rm -rf "$COMPRESSED_VERSION_PATH/failure"
        fi
        
    elif [ $POSITION -le $KEEP_CRITICAL_VERSIONS ]; then
        # 只保留關鍵功能的成功測試影片
        log_warning "  版本 $VERSION: 只保留關鍵功能的成功測試影片"
        
        # 刪除失敗測試影片
        if [ -d "$VERSION_PATH/failure" ]; then
            rm -rf "$VERSION_PATH/failure"
        fi
        if [ -d "$COMPRESSED_VERSION_PATH/failure" ]; then
            rm -rf "$COMPRESSED_VERSION_PATH/failure"
        fi
        
        # 只保留關鍵功能的成功測試
        CRITICAL_MODULES=("games" "content")
        
        if [ -d "$VERSION_PATH/success" ]; then
            # 遍歷所有模組，刪除非關鍵模組
            for module_dir in "$VERSION_PATH/success"/*; do
                if [ -d "$module_dir" ]; then
                    module_name=$(basename "$module_dir")
                    
                    # 檢查是否為關鍵模組
                    is_critical=false
                    for critical_module in "${CRITICAL_MODULES[@]}"; do
                        if [ "$module_name" = "$critical_module" ]; then
                            is_critical=true
                            break
                        fi
                    done
                    
                    if [ "$is_critical" = false ]; then
                        MODULE_SIZE=$(du -sb "$module_dir" 2>/dev/null | cut -f1 || echo 0)
                        rm -rf "$module_dir"
                        log_info "    已刪除非關鍵模組: $module_name (節省 $((MODULE_SIZE / 1024 / 1024)) MB)"
                        TOTAL_SPACE_FREED=$((TOTAL_SPACE_FREED + MODULE_SIZE))
                    fi
                fi
            done
        fi
        
        # 同樣處理壓縮版本
        if [ -d "$COMPRESSED_VERSION_PATH/success" ]; then
            for module_dir in "$COMPRESSED_VERSION_PATH/success"/*; do
                if [ -d "$module_dir" ]; then
                    module_name=$(basename "$module_dir")
                    
                    is_critical=false
                    for critical_module in "${CRITICAL_MODULES[@]}"; do
                        if [ "$module_name" = "$critical_module" ]; then
                            is_critical=true
                            break
                        fi
                    done
                    
                    if [ "$is_critical" = false ]; then
                        rm -rf "$module_dir"
                    fi
                fi
            done
        fi
        
    else
        # 刪除整個版本
        log_error "  刪除整個版本 $VERSION (超過保留期限)"
        
        VERSION_SIZE=$(du -sb "$VERSION_PATH" 2>/dev/null | cut -f1 || echo 0)
        COMPRESSED_SIZE=$(du -sb "$COMPRESSED_VERSION_PATH" 2>/dev/null | cut -f1 || echo 0)
        
        rm -rf "$VERSION_PATH"
        rm -rf "$COMPRESSED_VERSION_PATH" 2>/dev/null || true
        
        TOTAL_SPACE_FREED=$((TOTAL_SPACE_FREED + VERSION_SIZE + COMPRESSED_SIZE))
        TOTAL_CLEANED=$((TOTAL_CLEANED + 1))
        
        log_info "    已刪除版本 $VERSION (節省 $(((VERSION_SIZE + COMPRESSED_SIZE) / 1024 / 1024)) MB)"
    fi
    
    # 計算版本大小（清理後）
    VERSION_SIZE_AFTER=$(du -sb "$VERSION_PATH" 2>/dev/null | cut -f1 || echo 0)
    COMPRESSED_SIZE_AFTER=$(du -sb "$COMPRESSED_VERSION_PATH" 2>/dev/null | cut -f1 || echo 0)
    
    # 如果版本目錄為空，刪除它
    if [ -d "$VERSION_PATH" ] && [ -z "$(ls -A "$VERSION_PATH" 2>/dev/null)" ]; then
        rm -rf "$VERSION_PATH"
        log_info "    已刪除空版本目錄: $VERSION"
    fi
    
    if [ -d "$COMPRESSED_VERSION_PATH" ] && [ -z "$(ls -A "$COMPRESSED_VERSION_PATH" 2>/dev/null)" ]; then
        rm -rf "$COMPRESSED_VERSION_PATH"
    fi
done

# 更新清理統計
CLEANUP_STATS="$METADATA_DIR/cleanup-stats.json"

# 如果統計文件不存在，創建它
if [ ! -f "$CLEANUP_STATS" ]; then
    echo '{"cleanupHistory": [], "totalStats": {}}' > "$CLEANUP_STATS"
fi

# 添加本次清理記錄
TEMP_FILE=$(mktemp)
jq --arg date "$(date -Iseconds)" \
   --argjson versionsProcessed "$VERSIONS_PROCESSED" \
   --argjson versionsDeleted "$TOTAL_CLEANED" \
   --argjson spaceFreesMB "$((TOTAL_SPACE_FREED / 1024 / 1024))" \
   '.cleanupHistory += [{
     "cleanupDate": $date,
     "versionsProcessed": $versionsProcessed,
     "versionsDeleted": $versionsDeleted,
     "spaceFreedMB": $spaceFreesMB
   }] | .totalStats = {
     "totalCleanups": (.cleanupHistory | length),
     "totalVersionsDeleted": (.cleanupHistory | map(.versionsDeleted) | add),
     "totalSpaceFreedMB": (.cleanupHistory | map(.spaceFreedMB) | add),
     "lastCleanup": $date
   }' "$CLEANUP_STATS" > "$TEMP_FILE" && mv "$TEMP_FILE" "$CLEANUP_STATS"

# 生成清理報告
CLEANUP_REPORT="EduCreate-Test-Videos/reports/daily/cleanup-report-$(date +%Y%m%d).md"
mkdir -p "$(dirname "$CLEANUP_REPORT")"

cat > "$CLEANUP_REPORT" << EOF
# EduCreate 測試影片清理報告

**清理日期**: $(date '+%Y-%m-%d %H:%M:%S')  
**處理版本數**: $VERSIONS_PROCESSED  
**刪除版本數**: $TOTAL_CLEANED  
**釋放空間**: $((TOTAL_SPACE_FREED / 1024 / 1024)) MB

## 📋 清理策略

- **保留最近 $KEEP_RECENT_VERSIONS 個版本**: 所有影片
- **保留最近 $KEEP_SUCCESS_VERSIONS 個版本**: 僅成功測試影片  
- **保留最近 $KEEP_CRITICAL_VERSIONS 個版本**: 僅關鍵功能成功測試影片
- **超過 $KEEP_CRITICAL_VERSIONS 個版本**: 完全刪除

## 🎯 關鍵功能模組

- **games**: 記憶科學遊戲模組
- **content**: AI內容生成和GEPT分級模組

## 📊 清理結果

$(if [ $TOTAL_CLEANED -gt 0 ]; then
    echo "### 已刪除的版本"
    echo ""
    # 這裡可以添加已刪除版本的詳細列表
    echo "- 共刪除 $TOTAL_CLEANED 個完整版本"
    echo "- 釋放空間: $((TOTAL_SPACE_FREED / 1024 / 1024)) MB"
else
    echo "### 無版本被完全刪除"
    echo ""
    echo "所有版本都在保留期限內，僅進行了部分清理。"
fi)

## 💾 當前空間使用

- **歸檔目錄大小**: $(du -sh "$ARCHIVE_DIR" 2>/dev/null | cut -f1 || echo "0")
- **壓縮歸檔大小**: $(du -sh "$COMPRESSED_ARCHIVE_DIR" 2>/dev/null | cut -f1 || echo "0")
- **剩餘版本數**: $(ls "$ARCHIVE_DIR" 2>/dev/null | wc -l || echo 0)

## 🔄 下次清理建議

建議每月運行一次清理腳本，或當歸檔目錄超過 50GB 時運行。

---
*此報告由 EduCreate 測試影片管理系統自動生成*
EOF

# 顯示清理結果
log_success "清理完成！"
log_info "清理統計:"
log_info "  - 處理版本數: $VERSIONS_PROCESSED"
log_info "  - 刪除版本數: $TOTAL_CLEANED"
log_info "  - 釋放空間: $((TOTAL_SPACE_FREED / 1024 / 1024)) MB"
log_info "  - 剩餘版本數: $(ls "$ARCHIVE_DIR" 2>/dev/null | wc -l || echo 0)"

# 顯示當前空間使用
CURRENT_ARCHIVE_SIZE=$(du -sh "$ARCHIVE_DIR" 2>/dev/null | cut -f1 || echo "0")
CURRENT_COMPRESSED_SIZE=$(du -sh "$COMPRESSED_ARCHIVE_DIR" 2>/dev/null | cut -f1 || echo "0")

log_info "當前空間使用:"
log_info "  - 歸檔目錄: $CURRENT_ARCHIVE_SIZE"
log_info "  - 壓縮歸檔: $CURRENT_COMPRESSED_SIZE"

# 顯示清理報告位置
log_info "清理報告已生成: $CLEANUP_REPORT"

# 建議下次清理時間
NEXT_CLEANUP_DATE=$(date -d "+1 month" '+%Y-%m-%d')
log_info "建議下次清理時間: $NEXT_CLEANUP_DATE"

exit 0
