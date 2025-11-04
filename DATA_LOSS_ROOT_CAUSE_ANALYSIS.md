# 🔍 數據丟失根本原因分析

**日期**: 2025-11-04  
**問題**: My Activities 頁面沒有之前發佈的數據  
**狀態**: 🚨 **需要進一步調查**

---

## 📊 當前數據狀況

### Production Branch（生產環境使用）
```
Compute: ep-curly-salad-a85exs3f
Branch ID: br-rough-field-a80z6kz8
DATABASE_URL: ep-curly-salad-a85exs3f-pooler.eastus2.azure.neon.tech

數據統計：
- Activity 表：92 個（其中 75 個被標記為已刪除）
- 活躍活動：17 個
- Folder 表：77 個活躍資料夾
- 用戶：nteverysome@gmail.com（92 個活動）
- 備註：已恢復到 2025-11-03 上午 12:00 的數據
```

### Development Branch（本地開發使用）
```
Compute: ep-hidden-field-a8tai7gk
Branch ID: br-summer-fog-a8wizgpz
DATABASE_URL: ep-hidden-field-a8tai7gk-pooler.eastus2.azure.neon.tech

數據統計：
- Activity 表：1 個（已刪除）
- 活躍活動：0 個
- Folder 表：2 個活躍資料夾
- 用戶：demo@educreate.com（0 個活動）
```

---

## 🔎 問題分析

### 問題 1：為什麼 Production Branch 有 92 個活動？

**可能的原因**：
1. ✅ 這 92 個活動是之前發佈的數據
2. ✅ 其中 75 個被誤標記為已刪除
3. ✅ 我們已經恢復了這 75 個活動

**驗證**：
- 本地診斷顯示 92 個活動已恢復
- 但生產環境（Vercel）仍然顯示沒有數據

### 問題 2：為什麼生產環境看不到數據？

**可能的原因**：
1. ❓ Vercel 還沒有部署最新代碼
2. ❓ Vercel 使用的是不同的數據庫連接
3. ❓ Vercel 使用的是 Development Branch 而不是 Production Branch
4. ❓ 生產環境的數據庫連接字符串不正確

### 問題 3：為什麼 Development Branch 沒有數據？

**可能的原因**：
1. Development Branch 從未同步過 Production Branch 的數據
2. Development Branch 是一個獨立的分支，有自己的數據
3. 之前發佈的數據只在 Production Branch 中

---

## 🔧 需要檢查的項目

### 1. Vercel 環境變數配置

**需要確認**：
```
Vercel 中的 DATABASE_URL 是否指向 Production Branch？
- 應該是：ep-curly-salad-a85exs3f-pooler.eastus2.azure.neon.tech
- 而不是：ep-hidden-field-a8tai7gk-pooler.eastus2.azure.neon.tech
```

**檢查方法**：
1. 登錄 Vercel：https://vercel.com
2. 選擇 EduCreate 項目
3. 進入 Settings → Environment Variables
4. 查看 DATABASE_URL 的值

### 2. Vercel 部署狀態

**需要確認**：
- 最新的代碼是否已部署？
- 部署是否成功？
- 是否有部署錯誤？

**檢查方法**：
1. 登錄 Vercel
2. 選擇 EduCreate 項目
3. 查看 Deployments 標籤
4. 檢查最新部署的狀態和日誌

### 3. Neon 數據庫連接

**需要確認**：
- Production Branch 是否正常運行？
- 連接是否正常？
- 是否有連接錯誤？

**檢查方法**：
```bash
# 測試 Production Branch 連接
psql "postgresql://neondb_owner:npg_JiVYrWK7L6Ff@ep-curly-salad-a85exs3f-pooler.eastus2.azure.neon.tech/neondb?sslmode=require" -c "SELECT COUNT(*) FROM \"Activity\" WHERE \"deletedAt\" IS NULL;"

# 應該返回：92
```

---

## 📋 根本原因假設

### 假設 A：Vercel 使用了錯誤的數據庫分支

**症狀**：
- 本地看到 92 個活動
- 生產環境看不到任何活動

**原因**：
- Vercel 的 DATABASE_URL 指向 Development Branch（0 個活動）
- 而不是 Production Branch（92 個活動）

**解決方案**：
1. 更新 Vercel 的 DATABASE_URL
2. 指向 Production Branch
3. 重新部署

### 假設 B：Vercel 還沒有部署最新代碼

**症狀**：
- 代碼已推送到 GitHub
- 但 Vercel 還沒有部署

**原因**：
- Vercel 自動部署可能失敗
- 或者部署還在進行中

**解決方案**：
1. 檢查 Vercel 部署日誌
2. 手動觸發重新部署
3. 確認部署成功

### 假設 C：生產環境的數據確實丟失了

**症狀**：
- 之前發佈的數據不見了
- 只有最近恢復的 92 個活動

**原因**：
- 數據在 2025-11-03 12:00 之前被刪除
- Neon 的 PITR 無法恢復更早的數據

**解決方案**：
1. 檢查 Neon 備份
2. 嘗試使用 PITR 恢復
3. 如果無法恢復，考慮從其他備份恢復

---

## 🎯 建議的調查步驟

### 步驟 1：確認 Vercel 配置（優先級：高）

```bash
# 1. 登錄 Vercel
# 2. 檢查 DATABASE_URL 環境變數
# 3. 確認指向 Production Branch
```

### 步驟 2：檢查 Vercel 部署（優先級：高）

```bash
# 1. 查看最新部署
# 2. 檢查部署日誌
# 3. 確認部署成功
```

### 步驟 3：測試 API 連接（優先級：中）

```bash
# 1. 訪問 https://edu-create.vercel.app/api/activities
# 2. 檢查是否返回 92 個活動
# 3. 檢查是否有錯誤信息
```

### 步驟 4：檢查 Neon 備份（優先級：中）

```bash
# 1. 登錄 Neon Console
# 2. 檢查 Production Branch 的備份
# 3. 查看是否可以恢復更早的數據
```

---

## 📞 後續行動

**立即行動**：
1. ✅ 檢查 Vercel 環境變數配置
2. ✅ 檢查 Vercel 部署狀態
3. ✅ 測試 API 連接

**如果上述步驟無法解決**：
1. 檢查 Neon 備份和 PITR 選項
2. 考慮從其他備份恢復
3. 聯繫 Neon 技術支持

---

## 📝 相關文件

- `DATA_RECOVERY_REPORT_V44.md` - 數據恢復報告
- `scripts/diagnose-data-loss.js` - 診斷工具
- `scripts/check-neon-backup.md` - Neon 備份檢查指南

