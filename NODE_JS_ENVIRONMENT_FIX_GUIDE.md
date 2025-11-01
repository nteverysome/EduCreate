# 🔧 Node.js 環境修復指南

## 📊 當前狀態

**日期**：2025-11-01  
**問題**：Node.js 環境配置問題  
**症狀**：`Could not determine Node.js install directory`  
**優先級**：🔴 最高

---

## ✅ 修復步驟

### 步驟 1：檢查 Node.js 安裝狀態

**在 PowerShell 中執行**：

```powershell
# 檢查 Node.js 版本
node --version

# 檢查 npm 版本
npm --version

# 檢查 npm 配置
npm config list
```

**預期結果**：
- Node.js 版本：v14+ 或更高
- npm 版本：v6+ 或更高

**如果看到錯誤**：
- "node: 無法將"node"項識別為 cmdlet..."
- "npm: 無法將"npm"項識別為 cmdlet..."

→ 表示 Node.js 未安裝或未添加到 PATH

---

### 步驟 2：下載 Node.js LTS

**訪問官方網站**：
- 打開瀏覽器
- 訪問 https://nodejs.org/
- 選擇 LTS 版本（推薦 v18 或 v20）
- 點擊下載按鈕

**選擇正確的版本**：
- Windows 64-bit：.msi 文件
- Windows 32-bit：.msi 文件（如果需要）

---

### 步驟 3：安裝 Node.js

**運行安裝程序**：

1. 雙擊下載的 .msi 文件
2. 點擊"Next"開始安裝
3. 接受許可協議
4. 選擇安裝位置（默認即可）
5. **重要**：確保勾選"Add to PATH"選項
6. 點擊"Install"開始安裝
7. 等待安裝完成
8. 點擊"Finish"完成安裝

**關鍵步驟**：
- ✅ 必須勾選"Add to PATH"
- ✅ 必須勾選"npm package manager"
- ✅ 必須勾選"Add to PATH"（再次確認）

---

### 步驟 4：重啟計算機

**重啟系統以應用環境變數**：

1. 保存所有工作
2. 點擊"開始"菜單
3. 選擇"重啟"
4. 等待計算機重啟

**為什麼需要重啟**：
- 環境變數需要重新加載
- PowerShell 需要重新初始化
- 系統需要識別新的 PATH 設置

---

### 步驟 5：驗證安裝

**重啟後，打開新的 PowerShell 窗口**：

```powershell
# 檢查 Node.js 版本
node --version
# 預期輸出：v18.x.x 或 v20.x.x

# 檢查 npm 版本
npm --version
# 預期輸出：9.x.x 或 10.x.x

# 檢查 npm 緩存
npm cache verify
# 預期輸出：Verified ... files
```

**如果仍然出現錯誤**：
- 檢查 PATH 環境變數
- 重新安裝 Node.js
- 聯繫技術支持

---

## 🚀 修復後的部署步驟

### 完整部署流程

```powershell
# 步驟 1：切換到修復分支
git checkout fix/p0-step-order-horizontalspacing

# 步驟 2：拉取最新代碼
git pull origin fix/p0-step-order-horizontalspacing

# 步驟 3：安裝依賴
npm install

# 步驟 4：構建項目
npm run build

# 步驟 5：部署
npm run deploy
```

### 快速部署（一鍵）

```powershell
git checkout fix/p0-step-order-horizontalspacing; git pull origin fix/p0-step-order-horizontalspacing; npm install; npm run build; npm run deploy
```

---

## 📋 修復檢查清單

### 安裝前

- [ ] 下載 Node.js LTS 安裝程序
- [ ] 確認是 Windows 版本
- [ ] 確認是 64-bit 或 32-bit 正確版本

### 安裝中

- [ ] 運行安裝程序
- [ ] 接受許可協議
- [ ] **勾選"Add to PATH"**
- [ ] **勾選"npm package manager"**
- [ ] 完成安裝

### 安裝後

- [ ] 重啟計算機
- [ ] 打開新的 PowerShell 窗口
- [ ] 驗證 `node --version`
- [ ] 驗證 `npm --version`
- [ ] 驗證 `npm cache verify`

### 部署前

- [ ] Node.js 已安裝
- [ ] npm 已安裝
- [ ] 環境變數已配置
- [ ] PowerShell 已重新啟動

---

## ⚠️ 常見問題

### 問題 1：安裝後仍然找不到 node

**原因**：
- 未勾選"Add to PATH"
- 環境變數未重新加載
- PowerShell 未重新啟動

**解決方案**：
1. 重新安裝 Node.js
2. 確保勾選"Add to PATH"
3. 重啟計算機
4. 打開新的 PowerShell 窗口

### 問題 2：npm install 仍然失敗

**原因**：
- npm 緩存損壞
- 網絡連接問題
- 依賴版本衝突

**解決方案**：
```powershell
# 清除 npm 緩存
npm cache clean --force

# 重新配置 npm
npm config set registry https://registry.npmjs.org/

# 重新安裝
npm install
```

### 問題 3：npm run build 失敗

**原因**：
- 依賴未完全安裝
- 構建配置問題
- 磁盤空間不足

**解決方案**：
```powershell
# 刪除 node_modules
Remove-Item -Recurse -Force node_modules

# 刪除 package-lock.json
Remove-Item package-lock.json

# 重新安裝
npm install

# 重新構建
npm run build
```

---

## 📞 聯繫方式

**分支**：`fix/p0-step-order-horizontalspacing`  
**狀態**：等待 Node.js 環境修復  
**優先級**：🔴 最高

**建議**：立即按照步驟修復 Node.js 環境

---

**修復指南版本**：v1.0  
**最後更新**：2025-11-01


