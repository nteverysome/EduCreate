# Augment Agent 的 EduCreate 開發工作流程

> 記錄 Augment Agent 如何使用 EduCreate 測試影片管理系統和 MCP 工具生態

## 🎯 完整工作流程

### Phase 1: 功能開發
```bash
# 1. 查看任務列表
view_tasklist

# 2. 開始新任務
update_tasks [{"task_id": "xxx", "state": "IN_PROGRESS"}]

# 3. 🎯 Phaser 3 專門檢查（強制執行）
# 如果任務涉及 Phaser 3、遊戲開發、phaser、game 關鍵詞：
node EduCreate-Test-Videos/scripts/phaser3-learning-persistence.js reminder
# ⚠️ 重要：這會顯示關鍵錯誤預防提醒和最近學習記錄

# 4. 使用 codebase-retrieval 分析現有代碼
# 5. 創建新組件和功能
# 6. 整合到現有系統
```

### Phase 2: 測試和驗證（含截圖比對）
```bash
# 1. 初始化測試影片管理系統
node EduCreate-Test-Videos/scripts/utils/initialize-system.js

# 2. 📸 修復前截圖（如果是修復問題）
browser_take_screenshot_Playwright --filename="before-fix-[issue-name].png"
# ⚠️ 重要：必須提供完整路徑給用戶檢查

# 3. 💻 代碼修改（如果需要修復）
# [實施修復方案]

# 4. 📸 修復後截圖（立即截圖驗證）
browser_take_screenshot_Playwright --filename="after-fix-[issue-name].png"
# ⚠️ 重要：必須提供完整路徑給用戶檢查

# 5. 🔍 截圖比對分析
# 比較修復前後差異，確認問題真正解決
# ⚠️ 重要：所有比對截圖都必須提供完整路徑

# 6. 運行 Playwright 測試生成影片
npx playwright test [test-file] --headed

# 6.1. 強制錯誤檢查（規則4）
# 立即掃描輸出中的錯誤關鍵詞：Error、Failed、timeout、did not find
# 如發現錯誤，立即執行規則4：互動中有看到錯誤用工具修復

# 7. ✅ 功能驗證測試
# 測試相關功能確保正常運行

# 7.1. 🎯 Phaser 3 專門驗證（如果涉及 Phaser 3）
# 如果是 Phaser 3 相關功能，運行完整驗證工作流程：
node EduCreate-Test-Videos/scripts/phaser3-verified-workflow.js verify "問題類型" "解決方案" "代碼模板" "文件路徑"
# ⚠️ 重要：只有通過技術驗證+測試驗證+用戶確認才記錄成功

# 8. 處理測試影片（關鍵步驟！）
node EduCreate-Test-Videos/scripts/automation/process-test-videos.js --cleanup

# 9. 生成完整報告
node EduCreate-Test-Videos/scripts/automation/generate-reports.js all
```

### Phase 3: 記錄和反饋（含截圖比對報告）
```bash
# 1. 查看測試結果
cat EduCreate-Test-Videos/reports/daily/daily-report-$(date +%Y-%m-%d).json

# 2. 檢查 MCP 整合記錄
cat EduCreate-Test-Videos/mcp-integration/langfuse-traces/2025-07/trace_*.json

# 3. 📋 生成截圖比對報告（使用標準模板）
# 🔧 修復問題: [問題描述]
# 📸 修復前截圖: [問題狀態]
# 💻 代碼修改: [修改內容]
# 📸 修復後截圖: [修復狀態]
# 🔍 比對結果: [差異分析]
# ✅ 驗證結果: [功能確認]

# 4. 使用 mcp-feedback-collector 收集反饋（強制執行）
# ⚠️ 重要：必須包含所有截圖的完整路徑
collect_feedback_mcp-feedback-collector

# 5. 完成任務
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
9. **filesystem-mcp** - 文件操作

### 🎯 Phaser 3 自動檢測機制（新增）
**觸發條件**：任務描述或對話中包含以下關鍵詞時自動執行
- `phaser`、`Phaser`、`phaser3`、`Phaser 3`
- `遊戲`、`game`、`Game`、`gaming`
- `AirplaneCollisionGame`、`GameScene`、`sprite`
- 文件路徑包含 `/games/` 或 `Game.tsx`

**自動執行步驟**：
1. 立即運行：`node EduCreate-Test-Videos/scripts/phaser3-learning-persistence.js reminder`
2. 顯示 Phaser 3 關鍵錯誤預防提醒
3. 在驗證階段自動運行 Phaser 3 專門驗證工作流程
4. 確保所有 Phaser 3 相關學習都被正確記錄

### 工具整合檢查清單
- [ ] Sequential Thinking 記錄已生成
- [ ] Langfuse 追蹤已記錄
- [ ] 本地記憶已更新
- [ ] 測試影片已正確存檔
- [ ] 報告已生成
- [ ] 反饋已收集

### 📸 截圖比對檢查清單（新增）
- [ ] 修復前截圖已拍攝
- [ ] 分析代碼修改要真實實現功能已完成
- [ ] 修復後截圖已拍攝
- [ ] 截圖差異已分析
- [ ] 視覺問題已確認真實解決
- [ ] 功能不要簡化測試已通過
- [ ] 比對報告已生成
- [ ] mcp-feedback-collector 已執行
- [ ] **所有截圖完整路徑已提供給用戶**

## 📁 截圖路徑規範（強制執行）

### ⚠️ 重要規則：所有截圖都必須提供完整路徑
每次拍攝截圖後，必須立即提供完整路徑給用戶檢查：

#### 標準格式：
```
完整路徑：C:\Users\Administrator\Desktop\EduCreate\EduCreate-Test-Videos\current\success\[模組]\[截圖檔名]
```

#### 截圖命名規範：
```
YYYYMMDD_模組_功能_結果_版本_序號.png
例如：20250720_canyonrunner_cloud_fix_success_v1.0.0_001.png
```

#### 路徑提供範例：
```
修復前截圖：
C:\Users\Administrator\Desktop\EduCreate\EduCreate-Test-Videos\current\success\games\20250720_canyonrunner_before_fix_v1.0.0_001.png

修復後截圖：
C:\Users\Administrator\Desktop\EduCreate\EduCreate-Test-Videos\current\success\games\20250720_canyonrunner_after_fix_v1.0.0_002.png
```

#### 用戶檢查要求：
- 用戶可以直接打開路徑檢查截圖
- 用戶可以進行視覺比對驗證
- 用戶可以確認修復是否真正生效



### 📸 生成的截圖
- `game-progress-1.png` 到 `game-progress-6.png`：遊戲進度記錄
- `final-complete-test.png`：最終測試結果
- `vocabulary-system-test.png`：詞彙系統測試






#### 🔍 比對結果: 綠色線條和粉紅色框框完全消失
#### ✅ 驗證結果: 遊戲功能正常，視覺效果專業

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
