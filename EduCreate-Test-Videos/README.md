# EduCreate 測試影片管理系統

> 基於記憶科學的智能教育遊戲測試影片管理系統，深度整合 MCP 工具生態

## 🎯 系統概述

EduCreate 測試影片管理系統是專為 EduCreate 智能教育平台設計的測試影片處理和分析系統。它能夠：

- 🎬 **智能處理測試影片**：自動組織、壓縮和分析測試影片
- 🧠 **本地記憶系統**：完全自主的測試記憶管理，無需外部依賴
- 🔗 **MCP 工具深度整合**：整合 Langfuse、Sequential Thinking、反饋收集等 8 個 MCP 工具
- 📊 **智能報告生成**：自動生成每日、週、月報告和實時儀表板
- 🎮 **記憶科學特化**：針對記憶科學遊戲的專門分析和優化
- 📦 **完整版本控制**：自動歸檔和清理策略，支持 200GB 空間管理

## 🏗️ 系統架構

```
EduCreate-Test-Videos/
├── scripts/                    # 核心腳本
│   ├── core/                   # 核心管理器
│   │   ├── LocalMemoryManager.js      # 本地記憶系統
│   │   ├── MCPIntegrationManager.js   # MCP 工具整合
│   │   ├── CompressionManager.js      # 智能壓縮管理
│   │   └── TestVideoProcessor.js      # 測試影片處理器
│   ├── automation/             # 自動化腳本
│   │   ├── process-test-videos.js     # 主處理腳本
│   │   ├── generate-reports.js        # 報告生成器
│   │   ├── archive-version.sh         # 版本歸檔
│   │   └── cleanup-old-versions.sh    # 舊版本清理
│   └── utils/                  # 工具腳本
│       └── initialize-system.js       # 系統初始化
├── current/                    # 當前版本影片
│   ├── success/               # 成功測試影片
│   └── failure/               # 失敗測試影片
├── compressed/                 # 壓縮後影片
├── archive/                    # 歷史版本歸檔
├── local-memory/              # 本地記憶系統
├── mcp-integration/           # MCP 工具整合數據
│   ├── langfuse-traces/       # Langfuse 追蹤記錄
│   ├── sequential-thinking/   # 邏輯推理記錄
│   └── feedback-collection/   # 反饋收集
├── metadata/                  # 系統元數據
├── reports/                   # 報告系統
│   ├── daily/                # 每日報告
│   ├── weekly/               # 週報告
│   ├── monthly/              # 月報告
│   └── dashboard/            # 儀表板數據
└── config/                    # 系統配置
```

## 🚀 快速開始

### 1. 系統要求
- Node.js 16+
- FFmpeg（用於影片壓縮）
- PowerShell（Windows）或 Bash（Linux/Mac）

### 2. 安裝 FFmpeg
```bash
# Windows (使用 Chocolatey)
choco install ffmpeg -y

# macOS (使用 Homebrew)
brew install ffmpeg

# Ubuntu/Debian
sudo apt update && sudo apt install ffmpeg
```

### 3. 初始化系統
```bash
node EduCreate-Test-Videos/scripts/utils/initialize-system.js
```

### 4. 處理測試影片
```bash
# 將測試影片放入 test-results/ 目錄，然後執行：
node EduCreate-Test-Videos/scripts/automation/process-test-videos.js --cleanup
```

## 🎮 支援的測試模組

### 遊戲模組 (games)
- **match-game**: Match 配對遊戲
- **fill-in-game**: 填空遊戲
- **quiz-game**: 問答遊戲
- **sequence-game**: 序列遊戲
- **flashcard-game**: 閃卡遊戲

### 內容模組 (content)
- **ai-content-generation**: AI 內容生成
- **rich-text-editor**: 富文本編輯器
- **gept-grading**: GEPT 分級系統

### 檔案空間模組 (file-space)
- **file-manager**: 檔案管理器
- **auto-save**: 自動保存系統
- **sharing**: 分享功能

### 系統模組 (system)
- **homepage**: 主頁功能
- **navigation**: 導航系統
- **dashboard**: 儀表板

## 🧠 MCP 工具整合

### 已整合的 MCP 工具
1. **Sequential Thinking MCP** - 邏輯推理過程記錄
2. **本地記憶系統** - 自主測試記憶管理
3. **SQLite MCP** - 數據庫操作（未來擴展）
4. **向量搜索引擎** - 智能搜索（未來擴展）
5. **Playwright MCP** - 測試自動化整合
6. **MCP Feedback Collector** - 反饋收集系統
7. **AutoGen Microsoft MCP** - 多代理協作（未來擴展）
8. **Langfuse MCP** - 詳細測試追蹤和分析

## 📊 智能壓縮策略

### 壓縮質量選擇
- **高質量 (high)**: 失敗測試，便於詳細分析
  - 解析度: 1920x1080
  - 位元率: 1.5M
  - 預期大小: 8-12MB/分鐘

- **標準質量 (standard)**: 成功測試，日常使用
  - 解析度: 1280x720
  - 位元率: 1M
  - 預期大小: 4-6MB/分鐘

- **歸檔質量 (archive)**: 歷史版本，長期保存
  - 解析度: 1280x720
  - 位元率: 600k
  - 預期大小: 2-3MB/分鐘

### 空間管理策略
- **200GB 總限制**管理
- **智能版本歸檔**：保留最近3個版本的所有影片
- **選擇性保留**：保留最近6個版本的成功測試
- **關鍵功能保留**：保留最近12個版本的關鍵功能測試

## 🔍 記憶科學特化功能

### 自動分析項目
- **主動回憶機制**驗證
- **間隔重複算法**效果評估
- **認知負荷**適當性分析
- **學習效果**科學測量

### GEPT 分級整合
- 自動識別 GEPT 相關測試
- 詞彙分級驗證
- 學習進度追蹤

## 📈 報告系統

### 自動生成報告
- **每日報告**: 測試統計、模組表現、系統健康
- **週報告**: 趨勢分析、模式識別、改進建議
- **月報告**: 性能分析、質量指標、目標設定
- **實時儀表板**: 當前狀態、警報、快速統計

### 報告格式
- JSON 格式（程式處理）
- Markdown 格式（人類閱讀）
- 儀表板數據（實時顯示）

## 🛠️ 使用指南

詳細的使用說明請參考 [USAGE.md](./USAGE.md)

### 常用命令
```bash
# 處理測試影片
node scripts/automation/process-test-videos.js --cleanup

# 生成報告
node scripts/automation/generate-reports.js daily

# 啟動監控模式
node scripts/automation/process-test-videos.js --monitor

# 歸檔版本
bash scripts/automation/archive-version.sh v1.0.0

# 清理舊版本
bash scripts/automation/cleanup-old-versions.sh
```

## 🔒 安全和隱私

### Git 排除規則
- ✅ 核心腳本和配置文件會被版本控制
- 🚫 測試影片檔案不會上傳（太大且包含敏感資訊）
- 🚫 MCP 整合數據不會上傳（可能包含敏感資訊）
- 🚫 動態生成的報告不會上傳（可以重新生成）

### 數據保護
- 本地記憶系統完全離線運作
- 敏感測試資料不會外傳
- 支援數據加密（未來版本）

## 🎉 系統特色

- **零依賴記憶系統**: 完全自主運作，無需外部服務
- **智能決策引擎**: 根據測試結果自動選擇處理策略
- **教育遊戲特化**: 針對記憶科學和 GEPT 分級的專門優化
- **可擴展架構**: 支援未來添加更多模組和功能
- **完整生命週期管理**: 從測試到歸檔的完整流程

## 📞 支援

如有問題或建議，請參考：
- [使用指南](./USAGE.md)
- [系統配置](./config/system-config.json)
- [故障排除](./USAGE.md#故障排除)

---
*EduCreate 測試影片管理系統 v1.0.0 - 讓測試影片管理變得智能化*
