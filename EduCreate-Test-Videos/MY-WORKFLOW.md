# Augment Agent 的 EduCreate 開發工作流程

> 記錄 Augment Agent 如何使用 EduCreate 測試影片管理系統和 MCP 工具生態

## 🎯 完整工作流程

### Phase 1: 功能開發
```bash
# 1. 查看任務列表
view_tasklist

# 2. 開始新任務
update_tasks [{"task_id": "xxx", "state": "IN_PROGRESS"}]

# 3. 使用 codebase-retrieval 分析現有代碼
# 4. 創建新組件和功能
# 5. 整合到現有系統
```

### Phase 2: 測試和驗證
```bash
# 1. 初始化測試影片管理系統
node EduCreate-Test-Videos/scripts/utils/initialize-system.js

# 2. 運行 Playwright 測試生成影片
npx playwright test [test-file] --headed

# 3. 處理測試影片（關鍵步驟！）
node EduCreate-Test-Videos/scripts/automation/process-test-videos.js --cleanup

# 4. 生成完整報告
node EduCreate-Test-Videos/scripts/automation/generate-reports.js all
```

### Phase 3: 記錄和反饋
```bash
# 1. 查看測試結果
cat EduCreate-Test-Videos/reports/daily/daily-report-$(date +%Y-%m-%d).json

# 2. 檢查 MCP 整合記錄
cat EduCreate-Test-Videos/mcp-integration/langfuse-traces/2025-07/trace_*.json

# 3. 使用 mcp-feedback-collector 收集反饋
collect_feedback_mcp-feedback-collector

# 4. 完成任務
update_tasks [{"task_id": "xxx", "state": "COMPLETE"}]
```

## 🧠 MCP 工具使用流程

### 自動使用的 8 個 MCP 工具
1. **Sequential Thinking MCP** - 邏輯推理過程記錄
2. **本地記憶系統** - 測試記憶管理
3. **SQLite MCP** - 數據庫操作
4. **向量搜索引擎** - 智能搜索
5. **Playwright MCP** - 測試自動化
6. **MCP Feedback Collector** - 反饋收集
7. **AutoGen Microsoft MCP** - 多代理協作
8. **Langfuse MCP** - 測試追蹤和分析

### 工具整合檢查清單
- [ ] Sequential Thinking 記錄已生成
- [ ] Langfuse 追蹤已記錄
- [ ] 本地記憶已更新
- [ ] 測試影片已正確存檔
- [ ] 報告已生成
- [ ] 反饋已收集

## 📊 最近執行的工作流程實例

### 批量操作系統實施 (2025-07-16)

#### 1. 功能開發階段
```
✅ 創建 BatchOperationPanel.tsx
✅ 創建 BatchOperationManager.ts  
✅ 整合到 MyActivities.tsx
✅ 創建測試頁面 batch-operations/page.tsx
```

#### 2. 測試和驗證階段
```bash
# 系統初始化
node EduCreate-Test-Videos/scripts/utils/initialize-system.js
# 輸出: ✅ 系統初始化完成！

# 測試影片處理
node EduCreate-Test-Videos/scripts/automation/process-test-videos.js --cleanup
# 輸出: 🎉 批量處理完成！成功率: 100%

# 報告生成
node EduCreate-Test-Videos/scripts/automation/generate-reports.js all
# 輸出: ✅ 報告生成完成
```

#### 3. 結果驗證
```
✅ 影片存檔: EduCreate-Test-Videos/current/success/activities/batch-operations/
✅ Langfuse 追蹤: trace_20250716_activities_batch-operations_success_v1.1.0_001.json
✅ Sequential Thinking: st_20250716_activities_batch-operations_success_v1.1.0_001.json
✅ 每日報告: daily-report-2025-07-16.json (100% 成功率)
```

## 🔍 工作流程監控點

### 檢查點 1: 功能完成度
```bash
# 查看任務進度
view_tasklist

# 檢查代碼質量
diagnostics [file-paths]
```

### 檢查點 2: 測試覆蓋度
```bash
# 查看測試影片
find EduCreate-Test-Videos/current/ -name "*.webm"

# 檢查測試統計
cat EduCreate-Test-Videos/metadata/test-catalog.json
```

### 檢查點 3: MCP 工具整合
```bash
# 檢查 Langfuse 追蹤
ls EduCreate-Test-Videos/mcp-integration/langfuse-traces/2025-07/

# 檢查 Sequential Thinking 記錄
ls EduCreate-Test-Videos/mcp-integration/sequential-thinking/
```

## 🚨 常見問題和解決方案

### 問題 1: 忘記使用測試影片管理系統
**症狀**: 測試完成但沒有影片存檔記錄
**解決**: 
```bash
# 檢查 test-results 目錄
ls test-results/

# 手動處理測試影片
node EduCreate-Test-Videos/scripts/automation/process-test-videos.js --cleanup
```

### 問題 2: MCP 工具沒有正確整合
**症狀**: 缺少 Langfuse 追蹤或 Sequential Thinking 記錄
**解決**:
```bash
# 重新初始化系統
node EduCreate-Test-Videos/scripts/utils/initialize-system.js

# 檢查系統完整性
cat EduCreate-Test-Videos/metadata/test-catalog.json
```

## 📈 工作流程改進記錄

### 2025-07-16: 重要改進
- ✅ 開始正確使用 EduCreate 測試影片管理系統
- ✅ 整合所有 8 個 MCP 工具
- ✅ 建立完整的測試-存檔-報告流程
- ✅ 實現 100% 測試影片存檔率

### 下一步改進計劃
- [ ] 自動化工作流程腳本
- [ ] 實時監控模式
- [ ] 更詳細的性能指標追蹤

---
*最後更新: 2025-07-16 by Augment Agent*
