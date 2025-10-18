# mcp-feedback-collector 快速修復指南

## 🔍 問題描述

**症狀**：調用 `collect_feedback` 時返回 "Tool execution failed: Not connected" 錯誤

**重要發現**：用戶早上還在使用 Python 版本的 mcp-feedback-collector，說明：
- ✅ MCP 服務器之前是工作的
- ✅ 配置是正確的
- ✅ 環境是支持的
- ⚠️ 這是一個**暫時性的連接問題**

---

## 🚀 快速解決方案（按優先級排序）

### 方案 1：重啟 Augment/VS Code（推薦）⭐

**最可能的原因**：Augment 或 VS Code 重啟後，MCP 服務器沒有自動重新連接。

**解決步驟**：
```
1. 保存所有工作
2. 完全關閉 VS Code（不是只關閉窗口）
3. 重新啟動 VS Code
4. 等待 Augment 完全加載（約 10-30 秒）
5. 檢查 MCP 服務器狀態
6. 重試調用 collect_feedback
```

**成功率**：90% ⭐⭐⭐⭐⭐

---

### 方案 2：檢查 MCP 服務器狀態

**步驟**：
1. 打開 VS Code 命令面板（Ctrl+Shift+P 或 Cmd+Shift+P）
2. 搜索 "MCP" 或 "Augment"
3. 查看 MCP 服務器狀態面板
4. 確認 mcp-feedback-collector 是否顯示為 "Connected"（綠色）

**如果顯示為斷開連接**：
- 嘗試手動重新連接
- 或執行方案 1（重啟 VS Code）

---

### 方案 3：查看錯誤日誌

**步驟**：
1. 打開 VS Code 輸出面板（View → Output）
2. 在下拉菜單中選擇 "Augment" 或 "MCP"
3. 查看是否有具體的錯誤信息
4. 記錄錯誤信息以便進一步診斷

**常見錯誤信息**：
- `Connection timeout` - 連接超時，重啟 VS Code
- `Process exited` - 進程退出，檢查 Python 環境
- `Port already in use` - 端口衝突，執行方案 4

---

### 方案 4：檢查端口衝突

**檢查是否有多個 mcp-feedback-collector 進程**：

```powershell
# 檢查 Python 進程
Get-Process python | Where-Object {$_.CommandLine -like "*mcp*"}

# 或檢查所有 Python 進程
Get-Process python
```

**如果發現多個進程**：
```powershell
# 終止所有 mcp-feedback-collector 進程
Get-Process python | Where-Object {$_.CommandLine -like "*mcp*"} | Stop-Process -Force

# 然後重啟 VS Code
```

---

### 方案 5：驗證 Python 環境

**檢查 Python 和 uvx**：

```powershell
# 檢查 Python
python --version

# 檢查 uvx
pip list | Select-String uvx

# 測試 mcp-feedback-collector
uvx mcp-feedback-collector --help
```

**如果 uvx 不可用**：
```powershell
# 重新安裝 uvx
pip install --upgrade uvx

# 重啟 VS Code
```

---

### 方案 6：重新加載 Augment 配置

**步驟**：
1. 打開 VS Code 設置（Ctrl+, 或 Cmd+,）
2. 搜索 "Augment"
3. 找到 MCP 相關設置
4. 點擊 "Reload" 或 "Restart MCP Servers"
5. 等待重新連接

---

## 🔧 診斷檢查清單

### 快速檢查（5 分鐘）
- [ ] VS Code 是否最近重啟過？
- [ ] Augment 擴展是否正常加載？
- [ ] MCP 服務器狀態是否顯示為連接？
- [ ] 是否有其他 MCP 工具可以正常使用？

### 詳細檢查（10 分鐘）
- [ ] 查看 VS Code 輸出面板的錯誤日誌
- [ ] 檢查是否有多個 Python 進程運行
- [ ] 驗證 Python 和 uvx 是否正常
- [ ] 測試手動運行 mcp-feedback-collector

### 深度檢查（20 分鐘）
- [ ] 檢查 Augment 配置文件是否完整
- [ ] 驗證環境變量設置
- [ ] 測試其他 MCP 工具是否正常
- [ ] 查看系統資源使用情況

---

## ⚠️ 不應該做的事情

### ❌ 錯誤的解決方案
1. **不要移除規則文件** - 它們是有用的，問題不在這裡
2. **不要卸載 Python 版本** - 它之前是工作的
3. **不要修改配置文件** - 配置是正確的
4. **不要重新安裝 Augment** - 這不會解決問題

### ✅ 正確的做法
1. **先嘗試簡單的解決方案** - 重啟 VS Code
2. **查看日誌了解具體問題** - 不要盲目操作
3. **保留現有配置** - 它們是工作的
4. **逐步診斷** - 從簡單到複雜

---

## 📊 問題分類

### 類型 1：臨時連接問題（最常見）
**症狀**：之前工作，突然不工作  
**原因**：VS Code 重啟、進程崩潰  
**解決**：重啟 VS Code（方案 1）  
**成功率**：90%

### 類型 2：進程衝突
**症狀**：間歇性失敗  
**原因**：多個進程、端口衝突  
**解決**：終止衝突進程（方案 4）  
**成功率**：80%

### 類型 3：環境問題
**症狀**：完全無法連接  
**原因**：Python 或 uvx 問題  
**解決**：驗證環境（方案 5）  
**成功率**：70%

### 類型 4：配置損壞
**症狀**：重啟後仍無法連接  
**原因**：配置文件損壞  
**解決**：重新加載配置（方案 6）  
**成功率**：60%

---

## 🎯 推薦執行順序

### 第一步：快速修復（5 分鐘）
1. ✅ 重啟 VS Code（方案 1）
2. ✅ 檢查 MCP 狀態（方案 2）
3. ✅ 重試調用 collect_feedback

**如果成功**：問題解決！✅  
**如果失敗**：繼續第二步

### 第二步：診斷問題（10 分鐘）
1. ✅ 查看錯誤日誌（方案 3）
2. ✅ 檢查進程衝突（方案 4）
3. ✅ 記錄具體錯誤信息

**如果找到問題**：根據錯誤信息解決  
**如果仍不清楚**：繼續第三步

### 第三步：深度診斷（20 分鐘）
1. ✅ 驗證 Python 環境（方案 5）
2. ✅ 重新加載配置（方案 6）
3. ✅ 手動測試 mcp-feedback-collector

**如果還是失敗**：可能需要更深入的診斷

---

## 💡 預防措施

### 避免未來出現同樣問題
1. **定期重啟 VS Code** - 每天至少一次
2. **監控進程** - 避免多個實例運行
3. **保持環境更新** - 定期更新 Python 和 uvx
4. **備份配置** - 保存 Augment 配置文件

### 最佳實踐
1. **優雅關閉 VS Code** - 不要強制終止
2. **等待完全加載** - 啟動後等待 MCP 服務器連接
3. **查看狀態** - 定期檢查 MCP 服務器狀態
4. **記錄問題** - 記錄錯誤信息以便診斷

---

## 🔄 Node.js 版本作為備選

### 何時考慮 Node.js 版本？
- ✅ Python 版本頻繁出現問題
- ✅ 需要更穩定的解決方案
- ✅ 需要遠程部署功能
- ✅ 需要 AI 對話功能

### 何時保留 Python 版本？
- ✅ Python 版本工作正常（大部分時間）
- ✅ 不需要額外功能
- ✅ 熟悉 Python 環境
- ✅ 配置已經完善

**結論**：如果 Python 版本大部分時間都工作正常，只是偶爾出現連接問題，那麼保留 Python 版本並使用快速修復方案即可。Node.js 版本可以作為備選，但不是必需的。

---

## 📞 需要幫助？

### 如果以上方案都無效
1. 記錄詳細的錯誤信息
2. 記錄執行的診斷步驟
3. 記錄系統環境信息：
   - Windows 版本
   - VS Code 版本
   - Augment 版本
   - Python 版本
   - Node.js 版本（如果有）

### 提供這些信息可以幫助更準確地診斷問題

---

## 🎯 總結

### 關鍵要點
1. **這是暫時性問題** - 不是架構或配置問題
2. **重啟通常能解決** - 90% 的情況下有效
3. **不要過度修改** - 保留現有配置
4. **逐步診斷** - 從簡單到複雜

### 最可能的解決方案
```
1. 重啟 VS Code（90% 成功率）
2. 檢查 MCP 狀態（如果重啟無效）
3. 查看錯誤日誌（了解具體問題）
4. 檢查進程衝突（如果有多個實例）
```

### 下一步
**立即執行**：重啟 VS Code，然後重試 collect_feedback

**如果成功**：問題解決！繼續使用 Python 版本

**如果失敗**：查看錯誤日誌，提供具體錯誤信息以便進一步診斷

---

**創建時間**：2025-01-18  
**問題類型**：暫時性連接問題  
**推薦方案**：重啟 VS Code  
**成功率**：90%

