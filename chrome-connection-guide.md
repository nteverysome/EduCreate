# Chrome 連接指南 - 方式 B

## 🎯 目標
使用 Playwright 連接到你已經運行的 Chrome 瀏覽器，而不是啟動新實例。

## 📋 步驟

### 1. 啟動支援遠程調試的 Chrome

**方法 A：使用提供的批處理文件**
```bash
# 雙擊運行
start-chrome-debug.bat
```

**方法 B：手動啟動**
```bash
# 在命令提示符中運行
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="%TEMP%\chrome-debug"
```

### 2. 驗證 Chrome 調試端口

在瀏覽器中訪問：`http://localhost:9222`

你應該看到 Chrome 的調試界面，顯示所有打開的標籤頁。

### 3. 使用 Python 腳本連接

```bash
# 安裝依賴（如果還沒安裝）
pip install playwright requests

# 運行連接腳本
python connect-to-chrome.py
```

## 🔧 技術原理

### Chrome 啟動參數說明
- `--remote-debugging-port=9222`: 開啟遠程調試端口
- `--user-data-dir="%TEMP%\chrome-debug"`: 使用臨時用戶數據目錄
- `--disable-web-security`: 禁用網頁安全限制（測試用）
- `--no-first-run`: 跳過首次運行設置

### Playwright 連接方式
```python
# 連接到已運行的 Chrome
browser = await playwright.chromium.connect_over_cdp("http://localhost:9222")
```

## ✅ 優勢

1. **保持會話狀態**: 保留你的登錄信息、Cookie、瀏覽歷史
2. **資源節省**: 不啟動新的瀏覽器進程
3. **實時互動**: 你可以看到自動化操作實時發生
4. **調試方便**: 可以在開發者工具中監控所有操作

## 🚨 注意事項

1. **端口衝突**: 確保端口 9222 沒有被其他程序佔用
2. **安全性**: 遠程調試模式會降低安全性，僅用於開發測試
3. **數據目錄**: 使用臨時數據目錄避免影響正常的 Chrome 配置
4. **進程管理**: 腳本不會關閉 Chrome，需要手動關閉

## 🔍 故障排除

### 問題：無法連接到端口 9222
**解決方案：**
1. 檢查 Chrome 是否以正確參數啟動
2. 檢查防火牆設置
3. 確認端口沒有被佔用：`netstat -an | findstr 9222`

### 問題：Playwright 連接失敗
**解決方案：**
1. 確認 Chrome 調試端口可訪問：`http://localhost:9222`
2. 檢查 Playwright 版本兼容性
3. 查看詳細錯誤信息

## 📚 相關資源

- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
- [Playwright 文檔](https://playwright.dev/python/docs/api/class-browser#browser-connect-over-cdp)
- [Chrome 命令行參數](https://peter.sh/experiments/chromium-command-line-switches/)