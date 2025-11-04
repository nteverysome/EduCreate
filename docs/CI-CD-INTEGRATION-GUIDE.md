# CI/CD 集成指南 - CDP Responsively App 自動化測試

## 📋 概述

本指南介紹如何將 CDP Responsively App 自動化測試集成到 CI/CD 系統中，實現持續集成和持續部署。

---

## 🎯 支持的 CI/CD 系統

### ✅ GitHub Actions (推薦)
- 原生支持 Windows 環境
- 免費額度充足
- 易於配置和維護

### ⚠️ 其他系統
- GitLab CI
- Jenkins
- Azure Pipelines
- CircleCI

---

## 🚀 GitHub Actions 集成

### 文件位置
```
.github/workflows/cdp-responsively-test.yml
```

### 工作流程觸發條件

1. **推送到主分支**
   ```yaml
   on:
     push:
       branches: [ master, main, develop ]
   ```

2. **拉取請求**
   ```yaml
   on:
     pull_request:
       branches: [ master, main, develop ]
   ```

3. **定時運行**
   ```yaml
   on:
     schedule:
       - cron: '0 2 * * *'  # 每天 UTC 02:00
   ```

4. **手動觸發**
   ```yaml
   on:
     workflow_dispatch:
   ```

---

## 📊 工作流程步驟

### 1️⃣ 檢出代碼
```yaml
- name: 📥 檢出代碼
  uses: actions/checkout@v3
```

### 2️⃣ 設置 Node.js
```yaml
- name: 📦 設置 Node.js
  uses: actions/setup-node@v3
  with:
    node-version: 18.x
    cache: 'npm'
```

### 3️⃣ 安裝依賴
```yaml
- name: 📚 安裝依賴
  run: npm ci
```

### 4️⃣ 啟動 Responsively App
```yaml
- name: 🚀 啟動 Responsively App 並啟用 CDP
  run: |
    $responsivelyPath = "C:\Users\Administrator\AppData\Local\Programs\ResponsivelyApp\ResponsivelyApp.exe"
    Start-Process -FilePath $responsivelyPath `
                 -ArgumentList "--remote-debugging-port=9222", $gameUrl `
                 -PassThru
    Start-Sleep -Seconds 15
```

### 5️⃣ 運行 CDP 測試
```yaml
- name: 🧪 運行 CDP 自動化測試
  run: node scripts/cdp-auto-setup.js
```

### 6️⃣ 運行增強版測試
```yaml
- name: 📊 運行增強版 CDP 測試
  run: node scripts/cdp-enhanced-controller.js --network-throttle --screenshot
```

### 7️⃣ 上傳報告
```yaml
- name: 📤 上傳報告
  uses: actions/upload-artifact@v3
  with:
    name: cdp-test-reports
    path: reports/
    retention-days: 30
```

---

## 🔧 配置選項

### 環境變量

```yaml
env:
  GAME_URL: https://edu-create.vercel.app/games/switcher?game=match-up-game&activityId=cmh93tjuh0001l404hszkdf94&layout=mixed&itemsPerPage=20
  CDP_PORT: 9222
  RESPONSIVELY_PATH: C:\Users\Administrator\AppData\Local\Programs\ResponsivelyApp\ResponsivelyApp.exe
```

### 矩陣策略

```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x]
    os: [windows-latest]
```

---

## 📈 報告和工件

### 生成的報告

| 文件 | 說明 |
|------|------|
| `cdp-auto-setup-report.json` | 基本 CDP 測試報告 |
| `cdp-enhanced-report.json` | 增強版 CDP 測試報告 |
| `screenshots/*.png` | 遊戲截圖 |

### 工件保留期

```yaml
retention-days: 30  # 保留 30 天
```

---

## 🔍 故障排除

### 問題 1: Responsively App 未找到

**症狀:**
```
⚠️  Responsively App 未找到，跳過 CDP 測試
```

**解決方案:**
1. 確保 Responsively App 已安裝
2. 檢查安裝路徑是否正確
3. 在 Windows Runner 上安裝 Responsively App

### 問題 2: CDP 連接失敗

**症狀:**
```
❌ 錯誤: connect ECONNREFUSED 127.0.0.1:9222
```

**解決方案:**
1. 確保 Responsively App 已啟動
2. 確保 CDP 端口 9222 未被佔用
3. 增加等待時間

### 問題 3: 超時

**症狀:**
```
⏳ 等待頁面加載... (超時)
```

**解決方案:**
1. 增加等待時間
2. 檢查網絡連接
3. 檢查遊戲 URL 是否可訪問

---

## 📋 最佳實踐

### 1. 使用矩陣策略測試多個環境

```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x]
    os: [windows-latest]
```

### 2. 使用 `continue-on-error` 防止工作流程中斷

```yaml
- name: 🧪 運行 CDP 測試
  run: node scripts/cdp-auto-setup.js
  continue-on-error: true
```

### 3. 上傳工件用於調試

```yaml
- name: 📤 上傳報告
  if: always()
  uses: actions/upload-artifact@v3
```

### 4. 使用定時運行進行定期測試

```yaml
schedule:
  - cron: '0 2 * * *'  # 每天運行
```

### 5. 添加通知步驟

```yaml
- name: 📢 發送通知
  if: always()
  run: echo "✅ 測試完成"
```

---

## 🚀 快速開始

### 步驟 1: 複製工作流程文件

```bash
# 文件已在 .github/workflows/cdp-responsively-test.yml
```

### 步驟 2: 推送到 GitHub

```bash
git add .github/workflows/cdp-responsively-test.yml
git commit -m "Add CDP Responsively App CI/CD workflow"
git push origin master
```

### 步驟 3: 查看工作流程運行

1. 進入 GitHub 倉庫
2. 點擊 "Actions" 標籤
3. 查看 "CDP Responsively App 自動化測試" 工作流程

### 步驟 4: 查看報告

1. 點擊工作流程運行
2. 向下滾動到 "Artifacts"
3. 下載報告和截圖

---

## 📊 工作流程狀態

### 成功 ✅
```
✅ 所有步驟完成
✅ 報告已生成
✅ 工件已上傳
```

### 失敗 ❌
```
❌ 某個步驟失敗
❌ 查看日誌了解詳情
❌ 檢查故障排除部分
```

---

## 🔗 相關資源

- [GitHub Actions 文檔](https://docs.github.com/en/actions)
- [CDP 使用指南](./CDP-RESPONSIVELY-GUIDE.md)
- [Responsively App 指南](./RESPONSIVELY_APP_GUIDE.md)

---

## 📝 下一步

- [ ] 配置 GitHub Actions 工作流程
- [ ] 推送工作流程文件到 GitHub
- [ ] 運行第一次工作流程
- [ ] 查看報告和工件
- [ ] 根據需要調整配置

---

**最後更新**: 2025-11-02  
**狀態**: ✅ 完成

