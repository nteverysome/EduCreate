# EduCreate 響應式測試工作流

## 概述
自動化響應式佈局測試和視覺對比報告生成系統。

## 使用方法

### 基本使用
```bash
# 運行響應式測試
npm run test:responsive

# 運行完整工作流整合
npm run test:responsive:integration
```

### 自定義測試
```bash
# 測試特定功能
node scripts/responsive-workflow/responsive-testing-workflow.js "功能名稱" "http://localhost:3000/path"
```

## 功能特點
- 🔄 自動化 5 種設備配置測試
- 📸 自動截圖收集
- 📊 視覺對比報告生成
- 🔧 MCP 工具整合
- 📹 EduCreate-Test-Videos 系統整合

## 報告位置
- 主報告：`reports/visual-comparisons/`
- 截圖：`reports/visual-comparisons/screenshots/`
- 存檔：`reports/visual-comparisons/archives/`

## 設備配置
1. 📱 手機直向 (375x667)
2. 📱 手機橫向 (812x375)
3. 📱 平板直向 (768x1024)
4. 📱 平板橫向 (1024x768)
5. 🖥️ 桌面版 (1440x900)
