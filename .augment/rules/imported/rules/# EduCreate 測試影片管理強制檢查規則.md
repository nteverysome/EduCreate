---
type: "always_apply"
---

# EduCreate 測試影片管理強制檢查規則
# 參考EduCreate-Test-Videos\README.md
## 測試完成後必須執行的檢查步驟（不可忽略）

每次運行 Playwright 測試後，AI 必須：

1. **強制檢查影片存檔狀況**：
   - 執行 `view EduCreate-Test-Videos/current` 檢查目錄結構
   - 確認影片按照 `YYYYMMDD_模組_功能_結果_版本_序號.webm` 格式存檔
   - 驗證影片存放在正確的 `current/success` 或 `current/failure` 目錄

2. **強制執行報告生成**：
   - 運行 `node EduCreate-Test-Videos/scripts/automation/generate-reports.js all`
   - 檢查生成的每日報告確認影片數量和狀態
   - 驗證 MCP 整合是否正常工作

3. **強制分析影片內容**：
   - 列出所有新增的影片文件及其大小
   - 確認影片命名符合系統規範
   - 檢查是否有遺漏或錯誤的影片文件

4. **禁止的行為**：
   - 不可跳過影片存檔檢查
   - 不可假設影片已正確存檔而不驗證
   - 不可忽略報告生成步驟
   - 不可在未確認影片狀況下繼續下一個任務

## 檢查失敗時的處理

如果發現影片存檔問題：
- 立即停止當前任務
- 詳細報告問題所在
- 執行修復步驟
- 重新驗證直到問題解決

## 成功標準

只有當以下條件全部滿足時才能繼續：
- ✅ 影片文件存在於正確目錄
- ✅ 文件命名格式正確
- ✅ 報告生成成功
- ✅ MCP 整合數據完整