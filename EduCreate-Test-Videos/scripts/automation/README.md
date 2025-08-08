# 🚀 EduCreate 自動化開發助手系統

> 基於 MY-WORKFLOW.md 核心工作原則的完整自動化開發助手系統
> 將編程從"猜測式開發"轉變為"數據驅動的智能開發"

## 🎯 系統概述

EduCreate 自動化開發助手系統是基於 MongoDB MCP 成功整合經驗，擴展到整個 EduCreate 開發工作流程的完整自動化解決方案。

### 核心特色
- 🧠 **核心工作原則自動執行**：看到問題 → 深度分析根本原因 → 基於經驗思考 → 設計正確方案 → 實施修復
- 🔧 **9個 MCP 工具深度整合**：自動化協調使用所有 MCP 工具（新增 Sentry MCP）
- 📱 **響應式測試自動化**：5種設備配置的完整測試流程
- 🎮 **Phaser 3 專門檢測**：自動檢測和提醒系統
- 🚨 **雙層錯誤監控系統**：本地檢測 + Sentry 雲端監控 + AI 修復建議
- 📊 **完整報告生成**：自動生成測試報告和分析

## 🏗️ 系統架構

```
EduCreate-Test-Videos/scripts/automation/
├── workflow-automation-master.js      # 主控制腳本
├── workflow-config.json              # 配置文件
├── core-workflow-principles.js       # 核心工作原則執行
├── responsive-testing-automation.js  # 響應式測試自動化
├── error-detection-system.js         # 錯誤檢測系統
├── mcp-tools-integration.js         # MCP 工具整合
├── phaser3-auto-detection.js        # Phaser 3 自動檢測
└── README.md                         # 使用說明
```

## 🚀 快速開始

### 1. 安裝依賴
```bash
# 確保已安裝必要的依賴
npm install chalk
npm install --save-dev @playwright/test
```

### 2. 一鍵啟動命令

#### 完整工作流程
```bash
# 執行完整的 Phase 1-3 工作流程
npm run workflow:full

# 或直接使用主控制腳本
npm run workflow:master full-workflow
```

#### 分階段執行
```bash
# Phase 1: 功能開發
npm run workflow:phase1

# Phase 2: 測試驗證
npm run workflow:phase2

# Phase 3: 記錄反饋
npm run workflow:phase3
```

#### 專門功能
```bash
# 核心工作原則分析
npm run workflow:core "問題描述" '{"context": "上下文"}'

# 響應式測試
npm run workflow:responsive "功能名稱" "http://localhost:3000/path"
```

## 📋 使用說明

### 🧠 核心工作原則自動執行

基於 MY-WORKFLOW.md 第36-40行的強制執行規則：

```bash
# 當遇到問題時，自動執行四階段分析
node EduCreate-Test-Videos/scripts/automation/core-workflow-principles.js "MongoDB MCP 連接失敗" '{"type": "connection", "service": "mongodb"}'
```

**執行流程**：
1. 🔍 **深度分析根本原因** - 5個為什麼分析、學習記憶檢查、時序分析、狀態對比
2. 🧠 **基於經驗思考** - 記憶洞察、多角度分析、假設質疑、原理理解
3. 🎯 **設計正確方案** - 多方案生成、根本性解決、經驗驗證
4. 🔧 **實施修復** - 謹慎實施、測試驗證、學習記錄

### 📱 響應式測試自動化

基於 MY-WORKFLOW.md 第101-125行的響應式測試要求：

```bash
# 自動執行5種設備配置測試
npm run workflow:responsive "遊戲切換器" "http://localhost:3000/games/switcher"
```

**測試設備**：
- 📱 手機直向 (375x667)
- 📱 手機橫向 (812x375)  
- 📱 平板直向 (768x1024)
- 📱 平板橫向 (1024x768)
- 💻 桌面版 (1440x900)

**自動生成**：
- 📸 5種設備截圖
- 📊 視覺對比報告 (HTML)
- 📈 成功率統計
- 🔧 自動修復建議

### 🎮 Phaser 3 自動檢測

當檢測到以下關鍵詞時自動觸發：
- `phaser`, `Phaser`, `phaser3`, `Phaser 3`
- `遊戲`, `game`, `Game`, `gaming`
- `AirplaneCollisionGame`, `GameScene`, `sprite`
- 文件路徑包含 `/games/` 或 `Game.tsx`

**自動執行**：
```bash
# 自動運行 Phaser 3 學習提醒
node EduCreate-Test-Videos/scripts/phaser3-learning-persistence.js reminder
```

### 🚨 雙層錯誤監控系統

當檢測到以下錯誤關鍵詞時自動觸發：
- `Error`, `Failed`, `timeout`, `did not find`
- `ECONNREFUSED`, `404`, `500`, `ENOENT`
- `SyntaxError`, `TypeError`, `ReferenceError`

**第一層：本地自動修復工具**：
- `diagnostics` - 檢查語法錯誤
- `codebase-retrieval` - 理解代碼結構
- `view` - 查看具體文件內容
- `str-replace-editor` - 自動修復代碼

**第二層：Sentry MCP 雲端分析**：
- `analyze_issue_with_seer` - AI 根本原因分析
- `search_issues` - 查找類似問題和解決方案
- `get_issue_details` - 獲取詳細錯誤上下文
- `update_issue` - 自動更新問題狀態

## 🔧 配置說明

### workflow-config.json 主要配置

```json
{
  "coreWorkflowPrinciples": {
    "enabled": true,
    "forceAnalysis": true,
    "requireMemoryCheck": true,
    "preventDirectFix": true
  },
  "mcpTools": {
    "sequentialThinking": { "enabled": true, "priority": 1 },
    "localMemory": { "enabled": true, "priority": 2 },
    "sentry": { "enabled": true, "priority": 3, "autoAnalysis": true, "aiFixSuggestions": true },
    "mongodb": { "enabled": true, "priority": 9 }
  },
  "responsiveTesting": {
    "enabled": true,
    "mandatory": true,
    "successRate": 100
  },
  "errorDetection": {
    "enabled": true,
    "autoFix": true
  }
}
```

### 自定義配置

```bash
# 修改配置文件
vim EduCreate-Test-Videos/scripts/automation/workflow-config.json

# 重新載入配置
npm run workflow:master help
```

## 📊 成功標準

- ✅ **自動化覆蓋率**: 90% 以上的工作流程步驟
- ✅ **響應式測試成功率**: 100%
- ✅ **測試影片管理成功率**: 100%
- ✅ **錯誤檢測率**: 100%
- ✅ **MCP 工具整合率**: 100%
- ✅ **工作流程合規性**: 100%

## 🔍 故障排除

### 常見問題

#### 1. MongoDB MCP 連接失敗
```bash
# 自動診斷和修復
npm run workflow:core "MongoDB MCP 連接失敗"
```

#### 2. 響應式測試失敗
```bash
# 檢查服務器狀態
curl -f http://localhost:3000

# 重新運行響應式測試
npm run workflow:responsive "功能名稱" "http://localhost:3000"
```

#### 3. Phaser 3 相關錯誤
```bash
# 自動觸發 Phaser 3 學習提醒
echo "phaser game error" | npm run workflow:master phase1
```

#### 4. 測試影片存檔問題
```bash
# 檢查測試影片目錄
ls -la EduCreate-Test-Videos/current/

# 手動處理測試影片
node EduCreate-Test-Videos/scripts/automation/process-test-videos.js --cleanup
```

### 日誌檢查

```bash
# 查看自動化日誌
tail -f EduCreate-Test-Videos/logs/workflow-automation.log

# 查看錯誤日誌
grep "ERROR" EduCreate-Test-Videos/logs/workflow-automation.log
```

## 🎯 最佳實踐

### 1. 開發前準備
```bash
# 1. 檢查系統狀態
npm run workflow:master help

# 2. 確認服務器運行
npm run dev

# 3. 執行完整工作流程
npm run workflow:full
```

### 2. 問題解決流程
```bash
# 1. 遇到問題時，立即執行核心工作原則
npm run workflow:core "具體問題描述"

# 2. 檢查相關的學習記憶
cat EduCreate-Test-Videos/local-memory/problem-solving-experience.json

# 3. 執行自動修復
# (系統會自動檢測錯誤並觸發修復)
```

### 3. 功能開發流程
```bash
# 1. Phase 1: 功能開發
npm run workflow:phase1 --problem="新功能需求" --taskId="task-uuid"

# 2. Phase 2: 測試驗證
npm run workflow:phase2 --feature="功能名稱" --playwrightTest="test-file.spec.js"

# 3. Phase 3: 記錄反饋
npm run workflow:phase3 --taskId="task-uuid"
```

## 🔗 整合說明

### 與現有系統整合

1. **任務管理系統**
   - 自動調用 `view_tasklist`, `update_tasks`
   - 與現有 task management API 整合

2. **測試系統**
   - 整合 Playwright、Jest、Cypress
   - 自動處理測試影片和截圖

3. **MCP 工具生態**
   - 深度整合所有8個 MCP 工具
   - 自動化協調和數據共享

4. **MongoDB MCP**
   - 數據驅動的智能開發
   - 實時數據分析和優化建議

## 📈 監控和分析

### 性能監控
```bash
# 查看自動化性能統計
node EduCreate-Test-Videos/scripts/automation/performance-monitor.js

# 生成性能報告
npm run workflow:master performance-report
```

### 使用統計
```bash
# 查看工作流程使用統計
cat EduCreate-Test-Videos/reports/workflow-usage-stats.json

# 生成使用分析報告
npm run workflow:master usage-analysis
```

## 🎉 成功案例

### MongoDB MCP 整合成功
- ✅ 從紅燈到綠燈的完整解決方案
- ✅ 數據驅動的智能開發實現
- ✅ 實時數據庫查詢和分析

### 響應式測試自動化
- ✅ 5種設備配置100%覆蓋
- ✅ 自動截圖和視覺對比報告
- ✅ 問題自動檢測和修復建議

### Phaser 3 學習持久化
- ✅ 自動檢測和提醒系統
- ✅ 學習經驗積累和應用
- ✅ 錯誤預防和最佳實踐

---

## 🚀 開始使用

```bash
# 立即開始使用自動化開發助手系統
npm run workflow:full

# 或從單個階段開始
npm run workflow:phase1
```

**讓 EduCreate 開發變得更智能、更高效、更可靠！** 🎯✨
