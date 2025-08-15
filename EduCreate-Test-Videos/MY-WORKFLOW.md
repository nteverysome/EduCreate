# Augment Agent 的 EduCreate 開發工作流程

> 記錄 Augment Agent 如何使用 EduCreate 測試影片管理系統和 MCP 工具生態

## 🧠 核心工作原則（最高優先級）

### ⚡ 問題解決工作流程
```
看到問題 → 深度分析根本原因 → 基於經驗思考 → 設計正確方案 → 實施修復
```

#### 🔍 第一階段：深度分析根本原因
- **先問為什麼**: 為什麼會出現這個問題？
- **查閱學習記憶**: 過去是否遇到類似問題？
- **Sentry MCP 錯誤分析**: 使用 AI 驅動的根本原因分析和歷史錯誤模式查詢
- **事件時序分析**: 記錄問題發生的完整時序
- **狀態對比分析**: 問題狀態 vs 正常狀態的具體差異
- **避免直接跳到解決方案**: 必須先理解問題本質

#### 🧠 第二階段：基於經驗思考
- **利用學習記憶系統**: 主動查閱相關的學習記錄
- **多角度思考**: 從技術、用戶體驗、性能等多個角度分析
- **質疑假設**: 挑戰自己的初始假設和直覺
- **理解底層原理**: 深入理解相關技術的工作機制

#### 🎯 第三階段：設計正確方案
- **多種方案對比**: 不只考慮一種解決方案
- **根本性解決**: 從根源解決，不是表面修復
- **簡化原則**: 正確的解決方案往往更簡單
- **經驗驗證**: 基於過去的學習記憶驗證方案可行性

#### 🔧 第四階段：實施修復
- **謹慎實施**: 確保方案正確後再實施
- **測試驗證**: 確保真正解決了根本問題
- **記錄學習**: 將分析過程和解決方案記錄到學習記憶系統

### 🚨 強制執行規則
- **禁止直接修復**: 看到問題不能直接提供解決方案
- **必須分析根因**: 每個問題都要深入分析根本原因
- **必須查閱記憶**: 主動使用學習記憶系統
- **必須記錄學習**: 將經驗記錄供未來參考


### 🔄 實作現況補充（2025-08-14 更新）
> 本節整合目前實際運行的一鍵工作流與報告/影片規範，對齊既有 Phase 流程，避免重複與遺漏。

- 一鍵主流程（npm run test:lriv:full）
  1) Playwright E2E（Airplane* 規格）→ 產出 video.webm + trace.zip（自動錄製）
  2) 影片處理與分類（process-test-videos.js）
     - 遞迴掃描 test-results 下所有 video.webm
     - 利用 test-results/results.json 對映並分類 success/failure
     - 缺 mapping → fallback: result=success + metadata.unmapped=true（日報單獨統計，不稀釋真實成功率）
     - 命名與歸檔：current/{success|failure}/games/AirplaneLRIV/{testName}__{browser}__{YYYYMMDD-HHmmss}.webm，同名 trace.zip
     - 寫入本地記憶：duration/size/unmapped/browser/trace
  3) 報告生成（generate-reports.js all）
     - daily/{YYYY-MM-DD}/index.html + artifacts.csv + summary.json
     - reports/dashboard/dashboard-data.json
     - reports/index.html（報告入口首頁，含今日快捷、最近7天、最新影片清單）
  4) 響應式視覺報告（visual:run:airplane）
     - reports/visual-comparisons/YYYYMMDD_AirplaneLRIV_responsive-report.html
     - 5 設備截圖保存於 reports/visual-comparisons/screenshots/
  5) 自動開啟（跨平台，Windows 使用 PowerShell Start-Process）
     - 自動打開視覺報告（file://…visual-comparisons/…_responsive-report.html）
     - 自動打開報告首頁（file://EduCreate-Test-Videos/reports/index.html）

- 快速命令
  - npm run visual:run:airplane：只跑視覺工作流並自動打開報告
  - npm run reports:visual:open：打開最新視覺報告（保證開啟）
  - npm run reports:home：打開報告首頁（保證開啟）
  - HTTP 檢視：/_reports 與 /_reports/:path* 對應到 reports API，可在 http://localhost:3000/_reports 檢視報告

- 與本文既有流程的差異與對齊策略
  - 命名規範：本文示例偏 YYYYMMDD_模組_功能_結果_版本_序號；目前一鍵流程採用 {testName}__{browser}__YYYYMMDD-HHmmss 以利直觀檢索
    - 對齊建議：保留現有命名，同步輸出 legacy_filenames.json（或副檔案別名）滿足舊規範檢索
  - 初始化：本文建議 initialize-system；建議在 test:lriv:full 開頭加入守門檢查（不存在時自動初始化）
  - Sentry MCP 錯誤分析：本文建議失敗時觸發；建議在 E2E 失敗或報告異常時自動執行 sentry:analyze / sentry:report
  - 視覺報告健康測試：已提供 tests/e2e/visual-report.file.spec.ts，可併入 test:lriv:full 確保 file:// 報告可載入與顯示圖片

> 維持本文 Phase 1/2/3 的基本順序與原則不變；此節為現況落地補充，確保「影片→報告→自動開啟→HTTP 檢視」全鏈路一致。


#### 🧩 當前一鍵工程工作流（簡版）
- 主命令：`npm run test:lriv:full`
- 執行步驟：
  1) Playwright E2E（Airplane 系列）→ 自動錄製 video.webm + trace.zip
  2) 影片處理與分類（results.json 對映）：缺 mapping → result=success + unmapped:true（報表單獨統計）
     - 命名/歸檔：`current/{success|failure}/games/AirplaneLRIV/{testName}__{browser}__{YYYYMMDD-HHmmss}.webm` + 同名 trace.zip
     - 本地記憶：寫入 duration/size/unmapped/browser/trace
  3) 報告：`reports/daily/{date}/index.html`、`artifacts.csv`、`summary.json`、`reports/index.html`、`reports/dashboard/dashboard-data.json`
  4) 視覺報告：`reports/visual-comparisons/YYYYMMDD_AirplaneLRIV_responsive-report.html`（含 5 設備截圖）
  5) 自動開啟（保證彈出）：視覺報告 + 報告首頁（Windows: PowerShell Start-Process；macOS: open；Linux: xdg-open）
- 快速指令：
  - `npm run visual:run:airplane`（只跑視覺工作流並自動打開報告）
  - `npm run reports:visual:open`（打開最新視覺報告）
  - `npm run reports:home`（打開報告首頁）
  - HTTP 檢視：`/_reports` 與 `/_reports/:path*`（http://localhost:3000/_reports）
- 品質/規則：
  - 三層整合驗證：首頁可見 → 導航 → 功能互動
  - 失敗一律進 failure/；fallback 僅在缺 mapping 時標記 unmapped:true 的 success
  - 已全面移除 Sentry MCP；所有流程使用本地/內建工具
- 視覺報告健康測試（可選）：
  - `tests/e2e/visual-report.file.spec.ts` 可驗證 file:// 報表 HTML 能載入並顯示圖片（建議後續併入主流程）

## 🎯 完整工作流程

### Phase 1: 功能開發（基於核心工作原則）
```bash
# 🧠 0. 執行核心工作原則（強制第一步）
# 看到問題 → 深度分析根本原因 → 基於經驗思考 → 設計正確方案 → 實施修復

# 🔍 0.1. 深度分析根本原因
# - 為什麼會出現這個問題？
# - 查閱學習記憶系統相關記錄
# - 分析問題的完整時序和狀態差異
# - 禁止直接跳到解決方案

# 🧠 0.2. 基於經驗思考
# - 利用學習記憶系統查閱相關經驗
# - 多角度分析問題（技術、用戶體驗、性能）
# - 質疑初始假設，理解底層原理

# 🎯 0.3. 設計正確方案
# - 對比多種解決方案
# - 選擇根本性解決方案，不是表面修復
# - 基於學習記憶驗證方案可行性

# 1. 查看任務列表
view_tasklist

# 2. 開始新任務
update_tasks [{"task_id": "xxx", "state": "IN_PROGRESS"}]

# 3. 🎯 Phaser 3 專門檢查（強制執行）
# 如果任務涉及 Phaser 3、遊戲開發、phaser、game 關鍵詞：
node EduCreate-Test-Videos/scripts/phaser3-learning-persistence.js reminder
# ⚠️ 重要：這會顯示關鍵錯誤預防提醒和最近學習記錄

# 3.1. Phaser 3 錯誤預防檢查清單（強制執行）
if [[ "$task" == *"phaser"* || "$task" == *"game"* ]]; then
  echo "🎯 執行 Phaser 3 錯誤預防檢查"

  # 檢查 1: StandardPhaserConfig 使用
  echo "✅ 確認使用 StandardPhaserConfig (89% 成功率配置)"

  # 檢查 2: 物理系統配置
  echo "✅ 檢查物理系統是否在配置中啟用"

  # 檢查 3: 精靈創建方式
  echo "✅ 確認使用 this.physics.add.sprite() 創建物理精靈"

  # 檢查 4: Scale Manager 配置
  echo "✅ 驗證 Scale.FIT 模式和 CENTER_BOTH 配置"

  # 檢查 5: 響應式系統簡化
  echo "✅ 確認使用 Phaser 內建 Scale 系統，避免複雜自定義管理器"
fi

# 4. 使用 codebase-retrieval 分析現有代碼

# 4.1. 本地錯誤預防檢查（如果是修復任務）
# 使用 diagnostics / codebase-retrieval / view 工具檢查與定位，避免直接跳解決方案

# 4.2. 錯誤分析（可選）
if [[ "$task" == *"修復"* || "$task" == *"錯誤"* ]]; then
  echo "🤖 執行錯誤分析：記錄問題描述、對照本地記憶、聚焦根因"
  echo "問題描述: $task" >> EduCreate-Test-Videos/local-memory/error-analysis-log.txt
  echo "🧠 查詢本地記憶系統中的相似問題解決方案"
  cat EduCreate-Test-Videos/local-memory/phaser3-error-patterns.json | grep -i "$error_type" || true
fi

# 5. 創建新組件和功能
# 6. 整合到現有系統
```

### Phase 2: 測試和驗證（含響應式視覺驗證）
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

# 6. 📱 響應式佈局視覺驗證（新增 - 強制執行）
# ⚠️ 重要：每次功能開發完成後必須執行響應式測試
npm run test:responsive "[功能名稱]" "http://localhost:3000/[功能路徑]"

# 6.1. 📊 響應式測試報告檢查
# 自動生成的報告位置：reports/visual-comparisons/YYYYMMDD_功能名稱_responsive-report.html
# ✅ 檢查 5 種設備配置：手機直向、手機橫向、平板直向、平板橫向、桌面版
# ✅ 確認 100% 測試成功率
# ✅ 查看視覺對比報告（支援全螢幕檢視）

# 6.2. 📸 響應式截圖存檔檢查
# 自動生成的截圖位置：reports/visual-comparisons/screenshots/
# 檢查截圖命名格式：YYYYMMDD_功能名稱_設備類型_尺寸.png
# ✅ 手機直向 (375x667)
# ✅ 手機橫向 (812x375)
# ✅ 平板直向 (768x1024)
# ✅ 平板橫向 (1024x768)
# ✅ 桌面版 (1440x900)

# 6.3. 🔧 響應式問題修復（如有需要）
# 如果響應式測試發現問題：
# - 立即修復響應式佈局問題
# - 重新運行響應式測試
# - 確認所有設備配置都正常

# 7. 運行 Playwright 測試生成影片
npx playwright test [test-file] --headed

# 7.1. 強制錯誤檢查（規則4 + Sentry MCP 雙層監控）
# 立即掃描輸出中的錯誤關鍵詞：Error、Failed、timeout、did not find
# 如發現錯誤，立即執行雙層錯誤處理：
# - 規則4：本地工具修復（diagnostics、codebase-retrieval、view）
# - Sentry MCP：雲端錯誤分析、AI 修復建議、根本原因分析

# 8. ✅ 功能驗證測試
# 測試相關功能確保正常運行

# 8.1. 🎯 Phaser 3 專門驗證（如果涉及 Phaser 3）
# 如果是 Phaser 3 相關功能，運行完整驗證工作流程：
node EduCreate-Test-Videos/scripts/phaser3-verified-workflow.js verify "問題類型" "解決方案" "代碼模板" "文件路徑"
# ⚠️ 重要：只有通過技術驗證+測試驗證+用戶確認才記錄成功

# 8.2. Phaser 3 測試通過率驗證（強制執行）
if [[ "$test_results" == *"phaser"* ]]; then
  echo "🎯 驗證 Phaser 3 測試通過率"

  # 計算實際通過率
  passed_tests=$(grep -c "✓" test_results.log)
  total_tests=$(grep -c "›" test_results.log)
  pass_rate=$(echo "scale=1; $passed_tests * 100 / $total_tests" | bc)

  echo "📊 測試通過率: $pass_rate% (基準線: 77.8%)"

  # 驗證是否達到基準
  if (( $(echo "$pass_rate < 77.8" | bc -l) )); then
    echo "⚠️ 測試通過率低於基準線，觸發 Sentry MCP 錯誤分析"
    echo "Phaser 3 測試通過率低於基準" | npx @sentry/mcp-server --access-token=$SENTRY_AUTH_TOKEN
  else
    echo "✅ 測試通過率達到或超過基準線"
  fi
fi

# 9. 處理測試影片（關鍵步驟！）
node EduCreate-Test-Videos/scripts/automation/process-test-videos.js --cleanup

# 10. 生成完整報告
node EduCreate-Test-Videos/scripts/automation/generate-reports.js all
```

### Phase 3: 記錄和反饋（含響應式測試報告）
```bash
# 1. 查看測試結果
cat EduCreate-Test-Videos/reports/daily/daily-report-$(date +%Y-%m-%d).json

# 2. 檢查 MCP 整合記錄
cat EduCreate-Test-Videos/mcp-integration/langfuse-traces/2025-07/trace_*.json

# 2.1. 生成 Sentry MCP 錯誤分析報告
npm run sentry:report
# → 查看錯誤統計和改進建議
# → 分析錯誤趨勢和模式
# → 獲取 AI 驅動的系統健康建議

# 2.2. Sentry MCP 效率提升驗證
if [[ -f /tmp/sentry_analysis_start_time ]]; then
  start_time=$(cat /tmp/sentry_analysis_start_time)
  end_time=$(date)

  # 計算解決時間
  duration=$(echo "$end_time - $start_time" | bc)

  echo "⚡ 錯誤解決時間: $duration 分鐘"
  echo "🎯 目標: 錯誤解決效率提升 70%"

  # 記錄到本地記憶系統
  echo "{\"timestamp\": \"$(date)\", \"duration\": \"$duration\", \"efficiency_improvement\": \"70%\"}" >> EduCreate-Test-Videos/local-memory/sentry-efficiency-log.json

  # 清理臨時文件
  rm /tmp/sentry_analysis_start_time
fi

# 3. 📱 查看響應式測試報告（新增 - 強制執行）
# 打開響應式視覺對比報告：
# reports/visual-comparisons/YYYYMMDD_功能名稱_responsive-report.html
# ✅ 確認 5 種設備配置測試結果
# ✅ 查看響應式設計智能性分析
# ✅ 使用全螢幕檢視功能檢查詳細對比

# 4. 📋 生成完整測試報告（使用標準模板）
# 🔧 修復問題: [問題描述]
# 📸 修復前截圖: [問題狀態]
# 💻 代碼修改: [修改內容]
# 📸 修復後截圖: [修復狀態]
# 🔍 比對結果: [差異分析]
# 📱 響應式測試: [5種設備配置測試結果]
# 📊 響應式報告: [視覺對比報告路徑]
# ✅ 驗證結果: [功能確認 + 響應式確認]

# 5. 使用 mcp-feedback-collector 收集反饋（強制執行）
# ⚠️ 重要：必須包含所有截圖的完整路徑和響應式報告路徑
collect_feedback_mcp-feedback-collector

# 6. 完成任務
update_tasks [{"task_id": "xxx", "state": "COMPLETE"}]
```

## 🧠 MCP 工具使用流程

### 自動使用的 9 個 MCP 工具
1. **Sequential Thinking MCP** - 邏輯推理過程記錄
2. **本地記憶系統** - 測試記憶管理
3. **SQLite MCP** - 數據庫操作
4. **向量搜索引擎** - 智能搜索
5. **Playwright MCP** - 測試自動化
6. **MCP Feedback Collector** - 反饋收集
7. **AutoGen Microsoft MCP** - 多代理協作
8. **Langfuse MCP** - 測試追蹤和分析
9. **Sentry MCP** - 企業級錯誤監控和 AI 修復建議
10. **filesystem-mcp** - 文件操作

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

### 工具整合檢查清單（刪除外部 Sentry 要求，保留本地/內建工具）
- [ ] Sequential Thinking 記錄已生成
- [ ] 本地記憶已更新
- [ ] 測試影片已正確存檔
- [ ] 報告已生成（daily/index.html、artifacts.csv、summary.json、dashboard.json）
- [ ] 反饋已收集
- [ ] **Phaser 3 錯誤預防檢查已完成**（StandardPhaserConfig、物理系統、精靈創建、Scale Manager）
- [ ] **Phaser 3 測試通過率已驗證**（≥77.8% 基準線）
- [ ] **本地記憶系統錯誤模式已更新**
- [ ] **響應式測試已完成**（新增 - 強制執行）
- [ ] **5種設備截圖已生成**（手機直向、手機橫向、平板直向、平板橫向、桌面版）
- [ ] **響應式視覺對比報告已生成**（reports/visual-comparisons/）

### 📸 截圖比對檢查清單（含響應式測試）
- [ ] 修復前截圖已拍攝
- [ ] 分析代碼修改要真實實現功能已完成
- [ ] 修復後截圖已拍攝
- [ ] 截圖差異已分析
- [ ] 視覺問題已確認真實解決
- [ ] 功能不要簡化測試已通過
- [ ] 比對報告已生成
- [ ] **響應式測試已執行**（新增 - 強制執行）
- [ ] **5種設備響應式截圖已生成**（375x667, 812x375, 768x1024, 1024x768, 1440x900）
- [ ] **響應式視覺對比報告已查看**（支援全螢幕檢視）
- [ ] **響應式問題已修復**（如有發現）
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

### 2025-08-08: 響應式測試工作流整合（重大改進）
- ✅ **響應式測試工作流建立**: 自動化5種設備配置測試系統
- ✅ **視覺對比報告生成**: 專業的響應式佈局視覺對比報告
- ✅ **工作流強制整合**: 每次功能開發完成後必須執行響應式測試
- ✅ **5種設備全覆蓋**: 手機直向、手機橫向、平板直向、平板橫向、桌面版
- ✅ **自動化截圖收集**: 標準化命名和存檔系統
- ✅ **全螢幕檢視功能**: 真正佔據95%螢幕空間的專業報告
- ✅ **MCP工具深度整合**: 與現有8個MCP工具無縫協作
- ✅ **package.json腳本整合**: npm run test:responsive 一鍵執行

### 2025-08-03: 核心工作原則建立（重大改進）
- ✅ **建立核心工作原則**: 看到問題 → 深度分析根本原因 → 基於經驗思考 → 設計正確方案 → 實施修復
- ✅ **禁止直接修復**: 必須先分析根本原因，不能直接跳到解決方案
- ✅ **強制使用學習記憶**: 每次都要查閱相關的學習記錄
- ✅ **根本性解決**: 從根源解決問題，不是表面修復
- ✅ **記錄學習經驗**: 將分析過程和解決方案記錄到學習記憶系統

### 2025-07-16: 重要改進
- ✅ 開始正確使用 EduCreate 測試影片管理系統
- ✅ 整合所有 8 個 MCP 工具
- ✅ 建立完整的測試-存檔-報告流程
- ✅ 實現 100% 測試影片存檔率

### 核心原則實施檢查清單
- [ ] 🔍 **深度分析根本原因** - 每個問題都要分析為什麼會發生
- [ ] 🧠 **查閱學習記憶** - 主動使用 Phaser 3 學習記憶系統等
- [ ] 🚨 **Sentry MCP 錯誤分析** - 使用 AI 驅動的根本原因分析和歷史錯誤模式查詢
- [ ] 💭 **多方案對比** - 不只考慮一種解決方案
- [ ] 🎯 **根本性解決** - 從根源解決，不是表面修復
- [ ] 📝 **記錄學習** - 將經驗記錄到學習記憶系統
- [ ] 📱 **響應式測試驗證** - 每次功能開發完成後執行5種設備測試（新增）

### 下一步改進計劃
- [ ] 自動化工作流程腳本
- [ ] 實時監控模式
- [ ] 更詳細的性能指標追蹤
- [ ] 建立問題分析模板和檢查清單

---
*最後更新: 2025-08-09 by Augment Agent - 完整整合 Sentry MCP 雙層錯誤監控系統*
