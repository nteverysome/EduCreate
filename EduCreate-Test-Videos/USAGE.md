# EduCreate 測試影片管理系統 - 使用指南

## 🚀 快速開始

### 1. 系統初始化
```bash
# 初始化系統（首次使用）
node EduCreate-Test-Videos/scripts/utils/initialize-system.js
```

### 2. 處理測試影片
```bash
# 基本處理（將影片放入 test-results/ 目錄後執行）
node EduCreate-Test-Videos/scripts/automation/process-test-videos.js

# 處理後清理原始文件
node EduCreate-Test-Videos/scripts/automation/process-test-videos.js --cleanup

# 指定輸入目錄
node EduCreate-Test-Videos/scripts/automation/process-test-videos.js --input ./my-videos

# 靜默模式（不生成報告）
node EduCreate-Test-Videos/scripts/automation/process-test-videos.js --quiet --no-reports
```

### 3. 啟動監控模式
```bash
# 持續監控新測試影片（推薦用於開發環境）
node EduCreate-Test-Videos/scripts/automation/process-test-videos.js --monitor
```

## 📊 報告生成

### 生成各種報告
```bash
# 生成每日報告
node EduCreate-Test-Videos/scripts/automation/generate-reports.js daily

# 生成週報告
node EduCreate-Test-Videos/scripts/automation/generate-reports.js weekly

# 生成月報告
node EduCreate-Test-Videos/scripts/automation/generate-reports.js monthly

# 更新儀表板數據
node EduCreate-Test-Videos/scripts/automation/generate-reports.js dashboard

# 生成所有報告
node EduCreate-Test-Videos/scripts/automation/generate-reports.js all
```

## 🔍 查看詳細的 MCP 整合結果

### Langfuse 追蹤詳情
```bash
# 查看失敗測試的 Langfuse 追蹤
cat EduCreate-Test-Videos/mcp-integration/langfuse-traces/2025-07/trace_20250715_games_match-game_failure_v1.0.0_002.json

# 查看成功測試的 Langfuse 追蹤
cat EduCreate-Test-Videos/mcp-integration/langfuse-traces/2025-07/trace_20250715_games_match-game_success_v1.0.0_001.json

# 列出所有 Langfuse 追蹤文件
ls EduCreate-Test-Videos/mcp-integration/langfuse-traces/*/
```

### Sequential Thinking 邏輯推理
```bash
# 查看失敗測試的邏輯推理過程
cat EduCreate-Test-Videos/mcp-integration/sequential-thinking/games/st_20250715_games_match-game_failure_v1.0.0_002.json

# 查看成功測試的邏輯推理過程
cat EduCreate-Test-Videos/mcp-integration/sequential-thinking/games/st_20250715_games_match-game_success_v1.0.0_001.json

# 列出所有邏輯推理記錄
find EduCreate-Test-Videos/mcp-integration/sequential-thinking/ -name "*.json"
```

### 反饋收集請求
```bash
# 查看失敗測試的反饋收集請求
cat EduCreate-Test-Videos/mcp-integration/feedback-collection/failure-feedback/2025-07/feedback_20250715_games_match-game_failure_v1.0.0_002.json

# 列出所有反饋收集請求
find EduCreate-Test-Videos/mcp-integration/feedback-collection/ -name "*.json"
```

## 📦 版本管理

### 歸檔當前版本
```bash
# 歸檔當前版本（建議每個開發里程碑執行）
bash EduCreate-Test-Videos/scripts/automation/archive-version.sh v1.0.0

# 歸檔並清理當前版本文件
bash EduCreate-Test-Videos/scripts/automation/archive-version.sh v1.1.0
# 在提示時選擇 'y' 清理當前版本
```

### 清理舊版本
```bash
# 清理舊版本（建議每月執行）
bash EduCreate-Test-Videos/scripts/automation/cleanup-old-versions.sh
```

## 🧠 本地記憶系統查詢

### 查看記憶統計
```bash
# 查看所有測試記憶
cat EduCreate-Test-Videos/local-memory/video-memories.json

# 查看測試模式分析
cat EduCreate-Test-Videos/local-memory/test-patterns.json

# 查看失敗分析
cat EduCreate-Test-Videos/local-memory/failure-analysis.json

# 查看改進追蹤
cat EduCreate-Test-Videos/local-memory/improvement-tracking.json
```

## 📈 系統監控

### 檢查系統狀態
```bash
# 檢查系統完整性
node EduCreate-Test-Videos/scripts/utils/initialize-system.js

# 查看壓縮統計
cat EduCreate-Test-Videos/metadata/compression-stats.json

# 查看測試目錄
cat EduCreate-Test-Videos/metadata/test-catalog.json
```

### 查看當前影片
```bash
# 列出所有當前影片
find EduCreate-Test-Videos/current/ -name "*.webm"

# 列出壓縮後的影片
find EduCreate-Test-Videos/compressed/current/ -name "*.webm"

# 檢查影片大小
du -sh EduCreate-Test-Videos/current/
du -sh EduCreate-Test-Videos/compressed/current/
```

## 🎯 常用工作流程

### 日常開發流程
```bash
# 1. 運行測試並生成影片（在您的測試框架中）
# 2. 處理新的測試影片
node EduCreate-Test-Videos/scripts/automation/process-test-videos.js --cleanup

# 3. 查看每日報告
cat EduCreate-Test-Videos/reports/daily/daily-report-$(date +%Y-%m-%d).md

# 4. 如果有失敗測試，查看詳細分析
cat EduCreate-Test-Videos/mcp-integration/langfuse-traces/$(date +%Y-%m)/trace_*_failure_*.json
```

### 週期性維護
```bash
# 每週執行
node EduCreate-Test-Videos/scripts/automation/generate-reports.js weekly

# 每月執行
node EduCreate-Test-Videos/scripts/automation/generate-reports.js monthly
bash EduCreate-Test-Videos/scripts/automation/archive-version.sh v$(date +%Y.%m).0

# 季度清理
bash EduCreate-Test-Videos/scripts/automation/cleanup-old-versions.sh
```

## 🔧 故障排除

### 常見問題
```bash
# 如果 FFmpeg 不可用
choco install ffmpeg -y

# 如果權限問題
# 確保腳本有執行權限（Linux/Mac）
chmod +x EduCreate-Test-Videos/scripts/automation/*.sh

# 如果目錄不存在
node EduCreate-Test-Videos/scripts/utils/initialize-system.js

# 如果記憶系統損壞，重新初始化
rm -rf EduCreate-Test-Videos/local-memory/
node EduCreate-Test-Videos/scripts/utils/initialize-system.js
```

### 系統重置
```bash
# ⚠️ 危險操作：完全重置系統（會刪除所有數據）
rm -rf EduCreate-Test-Videos/current/
rm -rf EduCreate-Test-Videos/compressed/
rm -rf EduCreate-Test-Videos/local-memory/
rm -rf EduCreate-Test-Videos/mcp-integration/
rm -rf EduCreate-Test-Videos/metadata/
rm -rf EduCreate-Test-Videos/reports/

# 重新初始化
node EduCreate-Test-Videos/scripts/utils/initialize-system.js
```

## 📝 文件命名規範

### 測試影片命名格式
```
YYYYMMDD_模組_功能_結果_版本_序號.webm

例如：
20250715_games_match-game_success_v1.0.0_001.webm
20250715_content_ai-generation_failure_v1.1.0_002.webm
```

### 支援的模組
- `games`: 記憶科學遊戲模組
- `content`: AI內容生成和GEPT分級模組  
- `file-space`: 檔案空間管理模組
- `system`: 系統功能模組

### 支援的結果
- `success`: 測試成功
- `failure`: 測試失敗

## 🎉 系統特色

- **智能壓縮**: 根據測試結果自動選擇壓縮質量
- **MCP 深度整合**: Langfuse、Sequential Thinking、反饋收集
- **記憶科學特化**: 針對教育遊戲的專門分析
- **完整版本控制**: 自動歸檔和清理策略
- **實時監控**: 持續監控新測試影片
- **豐富報告**: 每日、週、月報告自動生成

---
*EduCreate 測試影片管理系統 v1.0.0*
