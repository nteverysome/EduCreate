# 📚 EduCreate 文檔索引和使用指導

> 幫助您快速找到正確的文檔和使用方式

## 🎯 **快速導航**

### 🚀 **我想要...**

#### **立即開始開發**
👉 **直接使用**：[automation/README.md](scripts/automation/README.md)
```bash
npm run workflow:full  # 一鍵啟動完整工作流程
```

#### **理解系統原理**
👉 **深度學習**：[MY-WORKFLOW.md](MY-WORKFLOW.md)
- 核心工作原則
- 四階段分析流程
- 強制執行規則

#### **解決問題**
👉 **組合使用**：
1. 先查看 [automation/README.md 故障排除](scripts/automation/README.md#-故障排除)
2. 如果無法解決，使用 [MY-WORKFLOW.md 核心原則](MY-WORKFLOW.md#-核心工作原則最高優先級)

#### **培訓新人**
👉 **學習路徑**：
1. [MY-WORKFLOW.md](MY-WORKFLOW.md) - 理解原則 (30分鐘)
2. [automation/README.md](scripts/automation/README.md) - 學習操作 (20分鐘)
3. 實際使用自動化工具 (10分鐘)

## 📋 **文檔關係圖**

```
MY-WORKFLOW.md (核心憲法)
    ↓ 指導設計
automation/README.md (操作手冊)
    ↓ 實際執行
自動化開發助手系統
```

## 🎯 **使用場景對照表**

| 場景 | 主要文檔 | 輔助文檔 | 說明 |
|------|----------|----------|------|
| **日常開發** | automation/README.md | - | 直接使用自動化命令 |
| **學習原理** | MY-WORKFLOW.md | - | 理解核心工作原則 |
| **故障排除** | automation/README.md | MY-WORKFLOW.md | 先自動化，後手動分析 |
| **新人培訓** | MY-WORKFLOW.md | automation/README.md | 先原理，後操作 |
| **系統設計** | MY-WORKFLOW.md | automation/README.md | 基於原則設計 |
| **性能優化** | automation/README.md | MY-WORKFLOW.md | 工具配置 + 原則指導 |

## 🚀 **快速命令參考**

### **完整工作流程**
```bash
npm run workflow:full                    # 執行完整 Phase 1-3
```

### **分階段執行**
```bash
npm run workflow:phase1                  # 功能開發
npm run workflow:phase2                  # 測試驗證
npm run workflow:phase3                  # 記錄反饋
```

### **專門功能**
```bash
npm run workflow:core "問題描述"         # 核心工作原則分析
npm run workflow:responsive "功能" "URL" # 響應式測試
npm run workflow:sentry "錯誤分析"       # Sentry 錯誤分析和 AI 修復建議
```

### **Sentry MCP 錯誤監控**
```bash
npm run sentry:health                    # 檢查 Sentry MCP 連接狀態
npm run sentry:analyze "錯誤描述"        # AI 錯誤分析和修復建議
npm run sentry:monitor                   # 啟動實時錯誤監控
npm run sentry:report                    # 生成錯誤統計報告
```

### **MCP 工具生態系統**
```bash
# 10個 MCP 工具自動協調
npm run workflow:master mcp-integration  # 自動協調所有 MCP 工具

# 個別 MCP 工具檢查
npm run sentry:health                    # Sentry MCP 健康檢查
```

**完整工具列表**: 詳見 [automation/README.md MCP 工具整合](scripts/automation/README.md#-10個-mcp-工具深度整合)

### **演示和學習**
```bash
node EduCreate-Test-Videos/scripts/automation/demo-workflow.js full
```

### **詳細技術說明**
👉 **完整配置**: [automation/README.md 配置說明](scripts/automation/README.md#-配置說明)
👉 **故障排除**: [automation/README.md 故障排除](scripts/automation/README.md#-故障排除)
👉 **最佳實踐**: [automation/README.md 最佳實踐](scripts/automation/README.md#-最佳實踐)
👉 **成功案例**: [automation/README.md 成功案例](scripts/automation/README.md#-成功案例)

## 📖 **文檔維護策略**

### ✅ **需要同時維護**
- **MY-WORKFLOW.md**：核心原則和理念（較少變動）
- **automation/README.md**：工具使用和配置（經常更新）

### 🔄 **更新原則**
1. **原則變更**：先更新 MY-WORKFLOW.md，再同步到 automation/README.md
2. **工具更新**：直接更新 automation/README.md
3. **新功能**：兩個文檔都需要更新

### 📝 **版本同步**
- MY-WORKFLOW.md 更新時，在 automation/README.md 中添加引用
- 確保兩個文檔的核心原則保持一致

## 🎯 **推薦工作流程**

### **新項目開始**
1. 閱讀 MY-WORKFLOW.md 理解原則
2. 使用 automation/README.md 設置工具
3. 開始自動化開發

### **日常開發**
1. 直接使用 `npm run workflow:full`
2. 遇到問題時查看 automation/README.md
3. 複雜問題回到 MY-WORKFLOW.md 原則

### **問題解決**
1. 使用 `npm run workflow:core "問題描述"`
2. 如果自動化無法解決，手動執行 MY-WORKFLOW.md 流程
3. 將解決方案反饋到自動化系統

## 🔍 **文檔內容對照**

### **MY-WORKFLOW.md 核心內容**
- 🧠 核心工作原則（第5-40行）
- 🎯 完整工作流程（第42-405行）
- 🚨 強制執行規則
- 📋 Phase 1-3 詳細步驟
- 🔧 10個 MCP 工具整合（第185-208行）
- 🚨 Sentry MCP 雙層錯誤監控系統

### **automation/README.md 核心內容**
- 🚀 快速開始命令
- 🏗️ 系統架構說明
- 🔧 配置和自定義
- 🔍 故障排除指南
- 🔧 10個 MCP 工具深度整合（包含 filesystem-mcp）
- 🚨 Sentry MCP 專門命令和配置

## 💡 **最佳實踐建議**

### **對於開發者**
- **日常**：使用自動化工具
- **學習**：理解核心原則
- **問題**：先工具後原則

### **對於團隊領導**
- **培訓**：先原則後工具
- **標準**：基於 MY-WORKFLOW.md 制定
- **改進**：兩個文檔同步更新

### **對於新人**
- **第一天**：讀 MY-WORKFLOW.md
- **第二天**：讀 automation/README.md
- **第三天**：開始實際使用

## 🎉 **總結**

- **MY-WORKFLOW.md** = 🧠 **思維方式** (為什麼這樣做)
- **automation/README.md** = 🛠️ **操作工具** (怎麼做)
- **兩者結合** = 🚀 **高效開發** (既理解原理又會使用工具)

**記住**：自動化工具是基於核心原則設計的，理解原則讓您更好地使用工具！

---
*最後更新: 2025-08-09 by Augment Agent - 完整整合 Sentry MCP 雙層錯誤監控系統*
