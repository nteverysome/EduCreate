# 測試依賴修復指南

## 問題描述

項目中的測試文件（`__tests__/components/UserMenu.test.tsx` 和 `__tests__/pages/index.test.tsx`）存在類型錯誤，主要是因為缺少必要的測試依賴庫和類型定義。

錯誤包括：
- 找不到模塊 "@testing-library/react" 或其相應的類型聲明
- 找不到模塊 "@/components/UserMenu" 或其相應的類型聲明
- 找不到名稱 "jest"
- 找不到名稱 "describe"、"test"、"expect" 等

## 已完成的修復

已更新 `package.json` 文件，添加了以下依賴：

```json
"@testing-library/jest-dom": "^6.1.4",
"@testing-library/react": "^14.0.0",
"@testing-library/user-event": "^14.5.1",
"@types/jest": "^29.5.7",
"jest": "^29.7.0",
"jest-environment-jsdom": "^29.7.0"
```

## 手動安裝步驟

由於自動安裝命令執行失敗，請按照以下步驟手動安裝依賴：

1. 打開終端（命令提示符或 PowerShell）
2. 導航到項目根目錄：`cd c:\Users\Administrator\Desktop\EduCreate`
3. 執行安裝命令：`npm install`

## 驗證修復

安裝完成後，可以通過以下步驟驗證修復是否成功：

1. 重新打開 VS Code 或刷新 TypeScript 服務器：
   - 在 VS Code 中按 `Ctrl+Shift+P`
   - 輸入並選擇 "TypeScript: Restart TS Server"

2. 檢查測試文件中的錯誤是否消失

3. 運行測試以確認一切正常：
   ```
   npm test
   ```

## tsconfig.json 更新

已更新 `tsconfig.json` 文件，添加了正確的路徑別名配置和測試類型聲明：

```json
{
  "compilerOptions": {
    // 其他配置...
    "baseUrl": ".",
    "paths": {
      "@/*": ["*"]
    },
    "types": ["jest", "node", "@testing-library/jest-dom"]
  }
}
```

這些更改解決了模塊路徑別名 `@/` 的解析問題和測試類型定義問題。

## 其他可能的問題

如果安裝後仍然存在問題，可能需要：

1. 確保 VS Code 已重新啟動或 TypeScript 服務器已重新啟動

2. 確保 `jest.config.js` 和 `jest.setup.js` 配置正確

3. 如果特定模塊仍然無法找到，可能需要單獨安裝：
   ```
   npm install --save-dev [缺失的包名]
   ```