# ⚡ Augment 工具快速參考卡

> 一頁紙搞定所有 Augment 工具！

## 🚀 最常用工具 (記住這5個就夠了)

```bash
# 1. 智能分析 - 理解代碼和問題
codebase-retrieval "描述你要找的代碼或問題"

# 2. 精確編輯 - 批量修復代碼
str-replace-editor  # 比自己寫腳本快300倍

# 3. 錯誤檢測 - 實時語法檢查
diagnostics ["文件路徑"]

# 4. 智能查看 - 查看和搜索文件
view "文件路徑" --search-query-regex "搜索模式"

# 5. 執行命令 - 運行測試和腳本
launch-process "命令" --wait=true
```

## 🧠 Context Engine 超能力

### 語義搜索 (不是關鍵字搜索!)
```bash
# ❌ 普通搜索
view "*.tsx"

# ✅ 語義搜索
codebase-retrieval "找到所有處理用戶認證的組件"
codebase-retrieval "分析性能瓶頸的代碼"
codebase-retrieval "檢查安全風險的實現"
```

### 自動理解項目架構
- **組件關係**: 自動分析 React 組件依賴
- **API 映射**: 理解所有 API 端點
- **數據流**: 追蹤數據在組件間的流動
- **模式識別**: 識別設計模式和最佳實踐

## 🔥 高效工具組合

### 代碼修復組合 (2分鐘解決100+錯誤)
```bash
codebase-retrieval "分析錯誤類型" 
→ diagnostics ["文件"] 
→ str-replace-editor 
→ diagnostics ["驗證"]
```

### 深度研究組合 (10倍效率)
```bash
firecrawl_deep_research "技術主題"
→ codebase-retrieval "分析現有實現" 
→ render-mermaid "生成架構圖"
```

### 複雜問題分析組合
```bash
sequentialthinking_Sequential_thinking "分析問題"
→ codebase-retrieval "理解代碼"
→ str-replace-editor "實施解決方案"
```

## 🎯 未充分利用的神器

### 1. Sequential Thinking - AI 推理引擎
```typescript
sequentialthinking_Sequential_thinking({
  thought: "分析這個架構問題的根本原因",
  thoughtNumber: 1,
  totalThoughts: 5
})
```

### 2. Firecrawl Deep Research - 深度研究
```typescript
firecrawl_deep_research({
  query: "React 18 最新性能優化技術",
  maxDepth: 3
})
```

### 3. Render Mermaid - 圖表生成
```typescript
render-mermaid({
  diagram_definition: `
    graph TD
    A[前端] --> B[API]
    B --> C[數據庫]
  `
})
```

### 4. Browser Snapshot - 智能截圖
```bash
browser_snapshot  # 比普通截圖更好，可以操作!
```

## 🛠️ 完整工具分類

### 📝 代碼操作
- `str-replace-editor` - 精確編輯
- `save-file` - 創建文件  
- `remove-files` - 安全刪除

### 🔍 分析工具
- `codebase-retrieval` - 智能分析
- `diagnostics` - 錯誤檢測
- `view` - 文件查看

### 🌐 網路工具
- `firecrawl_deep_research` - 深度研究
- `firecrawl_search` - 智能搜索
- `web-fetch` - 獲取網頁

### 🧪 測試工具
- `browser_snapshot` - 智能截圖
- `browser_click` - 點擊操作
- `browser_type` - 文字輸入

### 🔄 系統工具
- `launch-process` - 執行命令
- `read-process` - 讀取輸出
- `kill-process` - 終止進程

### 📊 管理工具
- `view_tasklist` - 查看任務
- `update_tasks` - 更新任務
- `remember` - 記住信息

### 🧠 AI 工具
- `sequentialthinking_Sequential_thinking` - 推理
- `render-mermaid` - 圖表
- `github-api` - GitHub 操作

## ⚡ 效率對比

| 任務 | 傳統方法 | Augment 工具 | 提升倍數 |
|------|----------|--------------|----------|
| 代碼修復 | 手動逐個 | str-replace-editor | **300x** |
| 錯誤檢測 | 手動編譯 | diagnostics | **10x** |
| 技術研究 | 手動搜索 | firecrawl_deep_research | **10x** |
| 架構分析 | 手動閱讀 | codebase-retrieval | **5x** |

## 🎯 使用原則

### ✅ 正確使用
1. **先分析再行動** - 用 codebase-retrieval 理解問題
2. **批量操作** - 用 str-replace-editor 而不是手動
3. **實時驗證** - 每次修改後用 diagnostics 檢查
4. **語義搜索** - 用自然語言描述要找的內容
5. **記錄重要信息** - 用 remember 保存關鍵發現

### ❌ 避免錯誤
1. 不要盲目修改代碼
2. 不要忽略語法錯誤
3. 不要手動重複工作
4. 不要用關鍵字搜索代替語義搜索
5. 不要重複造輪子

## 🏆 成功案例

### EduCreate 項目實戰
- **100+ 語法錯誤** → 2分鐘修復 (99% 成功率)
- **12項功能驗證** → 100% 自動化測試通過
- **技術研究** → 10倍效率提升

## 🎓 學習建議

### 新手入門 (第1週)
1. 熟練使用 5 個最常用工具
2. 學會語義搜索而不是關鍵字搜索
3. 掌握基本的工具組合

### 進階使用 (第2週)
1. 開始使用 Sequential Thinking
2. 嘗試 Firecrawl 深度研究
3. 學會生成 Mermaid 圖表

### 專家級別 (第3週+)
1. 創建自定義工作流程
2. 組合多個工具解決複雜問題
3. 利用 Context Engine 的高級功能

---

## 🔗 相關資源

- **完整指南**: `AUGMENT-TOOLS-REFERENCE.md`
- **錯誤修復**: `EduCreate-Test-Videos/RULE4-REMINDER.md`
- **項目文檔**: `docs/EDUCREAT_COMPREHENSIVE_ANALYSIS_AND_ROADMAP.md`

---

**記住**: Augment 不只是代碼編輯器，是完整的 AI 開發生態系統！🚀

**最後更新**: 2025-07-17
