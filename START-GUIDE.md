# 🚀 EduCreate 一鍵啟動指南

## 📋 可用的啟動腳本

### 1. 🎯 **quick-start.bat** (推薦)
**最快速的啟動方式**
```bash
quick-start.bat
```
- ✅ 快速檢查和修復
- ✅ 自動處理常見問題
- ✅ 最少的輸出信息
- ⏱️ 啟動時間：1-2分鐘

### 2. 🔧 **one-click-start.bat** (完整版)
**詳細的初始化和檢查**
```bash
one-click-start.bat
```
- ✅ 完整的環境檢查
- ✅ 詳細的錯誤診斷
- ✅ 步驟說明和進度顯示
- ⏱️ 啟動時間：2-3分鐘

### 3. 💎 **one-click-start.ps1** (PowerShell版)
**最佳的用戶體驗**
```powershell
powershell -ExecutionPolicy Bypass -File one-click-start.ps1
```
- ✅ 彩色輸出和美觀界面
- ✅ 增強的錯誤處理
- ✅ 自動服務管理
- ⏱️ 啟動時間：2-3分鐘

## 🎮 使用方法

### 方法一：雙擊執行
1. 在文件管理器中找到腳本文件
2. 雙擊 `quick-start.bat` 或其他腳本
3. 等待自動完成初始化和啟動

### 方法二：命令行執行
1. 打開命令提示符 (cmd)
2. 切換到項目目錄：
   ```bash
   cd C:\Users\Administrator\Desktop\EduCreate
   ```
3. 執行腳本：
   ```bash
   quick-start.bat
   ```

### 方法三：PowerShell執行
1. 打開 PowerShell
2. 切換到項目目錄
3. 執行：
   ```powershell
   .\one-click-start.ps1
   ```

## 🔍 腳本功能對比

| 功能 | quick-start.bat | one-click-start.bat | one-click-start.ps1 |
|------|-----------------|---------------------|---------------------|
| PostgreSQL 檢查 | ✅ 基礎 | ✅ 詳細 | ✅ 增強 |
| 自動啟動服務 | ✅ | ✅ | ✅ 多版本支持 |
| 依賴安裝 | ✅ 靜默 | ✅ 詳細 | ✅ 錯誤處理 |
| .env 配置 | ✅ 自動創建 | ✅ 檢查修復 | ✅ 智能配置 |
| Prisma 初始化 | ✅ 快速 | ✅ 完整 | ✅ 錯誤恢復 |
| 資料庫測試 | ❌ | ✅ | ✅ |
| 構建檢查 | ❌ | ✅ | ✅ |
| 彩色輸出 | ❌ | ❌ | ✅ |
| 錯誤恢復 | 基礎 | 中等 | 高級 |

## 🛠️ 故障排除

### 常見問題

#### 1. PostgreSQL 連接失敗
**症狀：** `PostgreSQL 連接失敗`
**解決：**
- 確認 PostgreSQL 服務正在運行
- 檢查密碼是否為 `z089336161`
- 手動啟動服務：`net start postgresql-x64-17`

#### 2. 依賴安裝失敗
**症狀：** `依賴安裝失敗`
**解決：**
- 檢查網絡連接
- 清除 npm 緩存：`npm cache clean --force`
- 刪除 `node_modules` 後重新執行

#### 3. Prisma 初始化失敗
**症狀：** `Prisma Client 生成失敗`
**解決：**
- 檢查 `.env` 中的 `DATABASE_URL`
- 手動執行：`npx prisma db push`
- 手動執行：`npx prisma generate`

#### 4. 端口被占用
**症狀：** `Port 3000 is already in use`
**解決：**
- 關閉其他使用 3000 端口的應用
- 或修改 `package.json` 中的啟動端口

### 手動診斷工具

如果自動腳本失敗，可以使用這些診斷工具：

```bash
# 測試資料庫連接
node test-db-connection.js

# 檢查 PostgreSQL 狀態
check-postgresql-simple.bat

# 修復註冊問題
fix-register-issue.bat
```

## 📱 啟動後的驗證

### 1. 訪問應用
打開瀏覽器，訪問：http://localhost:3000

### 2. 測試功能
- ✅ 首頁載入正常
- ✅ 註冊功能可用
- ✅ 登入功能可用
- ✅ 資料庫連接正常

### 3. 檢查控制台
確認沒有嚴重錯誤信息

## 🎯 推薦使用流程

### 首次使用
1. 執行 `one-click-start.ps1` (完整檢查)
2. 驗證所有功能正常
3. 記錄任何問題並解決

### 日常開發
1. 執行 `quick-start.bat` (快速啟動)
2. 如有問題，切換到完整版腳本

### 問題排查
1. 執行 `one-click-start.bat` (詳細診斷)
2. 查看具體錯誤信息
3. 使用相應的修復工具

## 📞 技術支持

如果遇到無法解決的問題：

1. **查看日誌文件**：`logs/` 目錄下的錯誤日誌
2. **執行診斷腳本**：`diagnose-server.bat`
3. **檢查文檔**：相關的 README 和故障排除指南
4. **重置環境**：刪除 `node_modules` 和 `.next`，重新執行腳本

---

**🎉 祝您使用愉快！EduCreate 團隊**