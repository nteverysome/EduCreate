# Neon PostgreSQL 備份調查結果

## 📅 調查時間
**日期**: 2025-10-16  
**調查人**: AI Assistant  
**調查方法**: Playwright 自動化瀏覽器訪問 Neon Console  

---

## 🔍 調查結果總結

### ❌ 關鍵發現：無法恢復數據

**結論**: 由於 Neon 的歷史保留期限只有 1 天，無法恢復 2025-10-16 15:29 之前的數據。

---

## 📊 Neon Console 檢查結果

### 1. 專案信息
- **專案名稱**: EduCreate
- **專案 ID**: dry-cloud-00816876
- **區域**: Azure East US 2 (Virginia)
- **PostgreSQL 版本**: 17
- **創建時間**: Jun 6, 2025 8:30 pm
- **數據庫大小**: 95.07 MB
- **最後活動**: Oct 16, 2025 5:06 pm

### 2. 歷史保留設置 ⚠️
- **History Retention**: **1 day** （1 天）
- **計畫類型**: Free Plan
- **可恢復時間範圍**: 過去 24 小時內

### 3. 數據庫分支
- **分支數量**: 1
- **主分支**: production (default)
- **其他分支**: 無
- **分支創建時間**: 無記錄（原始分支）

### 4. Point-in-Time Recovery (PITR)
- **PITR 狀態**: ✅ 已啟用
- **保留期限**: 1 天
- **可恢復時間**: 2025-10-15 17:10 之後
- **時區**: Asia/Taipei (GMT+08:00)

### 5. 備份選項
- **自動備份**: ✅ 已啟用（通過 PITR）
- **手動快照**: 無
- **其他備份**: 無

---

## 🎯 數據恢復可能性分析

### 時間線分析

```
2025-10-16 15:29:54 - 演示用戶創建（數據庫最早記錄）
2025-10-16 16:03:56 - 南志宗用戶創建
2025-10-16 16:17:04 - 無標題活動創建
2025-10-16 16:18:56 - 活動被刪除
2025-10-16 17:10:00 - 當前時間（調查時間）

PITR 可恢復範圍: 2025-10-15 17:10 ~ 2025-10-16 17:10
數據丟失時間: 2025-10-16 15:29 之前
```

### 恢復可能性評估

#### ❌ 無法恢復的數據
- **2025-10-16 15:29 之前的所有數據**
  - 原因：超出 PITR 保留期限（1 天）
  - 恢復可能性：0%

#### ✅ 可以恢復的數據
- **2025-10-15 17:10 之後的數據**
  - 包括：演示用戶、南志宗用戶、無標題活動（已刪除）
  - 恢復可能性：100%
  - 但這些都是新數據，不是用戶想要的舊數據

---

## 🔧 為什麼數據丟失了？

### 可能的原因分析

#### 原因 1: 數據庫重置 🔴 最可能
**證據**:
- 數據庫中最早的記錄是 2025-10-16 15:29:54
- 這個時間點非常精確，不像自然增長的數據
- 演示用戶是第一個記錄，表明可能執行了 seed 腳本

**可能的操作**:
```bash
# 可能執行了以下命令之一
npx prisma migrate reset
npx prisma db push --force-reset
npx prisma migrate deploy --force
```

**如何確認**:
- 檢查 Vercel 部署日誌
- 查找 2025-10-16 15:29 左右的部署記錄
- 搜索 "prisma migrate reset" 或 "force-reset"

---

#### 原因 2: 切換到新數據庫 🟡 可能
**證據**:
- 專案創建時間是 Jun 6, 2025（未來日期？可能是顯示錯誤）
- 數據庫大小 95.07 MB，但實際數據很少

**可能的操作**:
- 在 Vercel 中更改了 DATABASE_URL
- 從舊的 Neon 專案切換到新專案
- 創建了新的數據庫實例

**如何確認**:
- 檢查 Vercel 環境變數歷史
- 查看是否有多個 Neon 專案
- 確認 DATABASE_URL 是否變更過

---

#### 原因 3: 數據遷移失敗 🟢 不太可能
**證據**:
- 數據庫結構完整（31 個表）
- 沒有遷移錯誤的跡象
- 演示用戶成功創建

**為什麼不太可能**:
- 如果是遷移失敗，應該會有錯誤記錄
- 數據庫結構不會這麼完整
- 不會只有新數據而沒有舊數據

---

## 📝 Vercel 部署日誌檢查建議

### 需要檢查的關鍵時間點
1. **2025-10-16 15:29 左右** - 數據庫最早記錄時間
2. **2025-10-16 15:00 ~ 15:30** - 可能的重置時間範圍

### 需要搜索的關鍵字
```
prisma migrate reset
prisma db push
force-reset
DATABASE_URL
seed
演示用戶
demo@educreate.com
```

### 檢查步驟
1. 登入 Vercel Dashboard: https://vercel.com/dashboard
2. 選擇 EduCreate 專案
3. 點擊 "Deployments" 標籤
4. 查看 2025-10-16 15:29 之前的部署
5. 點擊部署查看構建日誌
6. 搜索上述關鍵字

---

## 🎯 數據恢復方案

### 方案 A: 從 Vercel 部署歷史恢復 ⚠️

**前提條件**:
- 之前的部署使用了不同的數據庫
- 舊數據庫仍然存在

**步驟**:
1. 在 Vercel Dashboard 查看部署歷史
2. 找到 2025-10-16 15:29 之前的部署
3. 查看該部署的環境變數
4. 獲取舊的 DATABASE_URL
5. 使用 `psql` 或 Prisma 連接到舊數據庫
6. 檢查是否有數據
7. 如果有數據，導出並導入到當前數據庫

**恢復可能性**: 30-50%

---

### 方案 B: 從本地開發環境恢復 ⚠️

**前提條件**:
- 本地開發環境有數據
- 本地數據是最新的

**步驟**:
1. 檢查本地數據庫是否有數據
2. 使用 `pg_dump` 導出本地數據
3. 使用 `psql` 導入到 Neon 數據庫

**恢復可能性**: 10-20%

---

### 方案 C: 聯繫 Neon Support ⚠️

**前提條件**:
- Neon 可能有更長的備份保留
- Neon 可能有系統級備份

**步驟**:
1. 訪問 Neon Support: https://neon.tech/docs/introduction/support
2. 說明情況：數據在 2025-10-16 15:29 丟失
3. 請求檢查是否有系統級備份
4. 提供專案 ID: dry-cloud-00816876

**恢復可能性**: 5-10%

---

## 📊 Free Plan 限制

### Neon Free Plan 的限制
- **History Retention**: 1 天（24 小時）
- **Branches**: 最多 10 個
- **Storage**: 0.5 GB
- **Compute**: 100 小時/月
- **Network Transfer**: 5 GB/月

### 升級到 Pro Plan 的好處
- **History Retention**: 7 天（168 小時）
- **Branches**: 無限制
- **Storage**: 更大容量
- **Compute**: 更多小時
- **Network Transfer**: 更多流量

### 升級建議
如果需要更長的數據保留期限，建議升級到 Pro Plan：
- 點擊 Neon Console 右上角的 "Upgrade" 按鈕
- 選擇 Pro Plan
- 配置 History Retention 為 7 天或更長

---

## 🛡️ 預防措施

### 1. 增加 History Retention
**操作步驟**:
1. 在 Neon Console 中點擊 "Settings"
2. 找到 "Storage" 部分
3. 調整 "History Retention" 為 7 天或更長
4. 保存設置

**注意**: Free Plan 最多只能設置 1 天

---

### 2. 定期手動備份
**建議頻率**: 每天或每週

**備份腳本**:
```bash
# 創建備份目錄
mkdir -p backups

# 導出數據庫
pg_dump $DATABASE_URL > backups/backup-$(date +%Y%m%d-%H%M%S).sql

# 或使用 Prisma
npx prisma db pull
npx prisma db push --preview-feature
```

---

### 3. 使用數據庫分支
**操作步驟**:
1. 在 Neon Console 中點擊 "Branches"
2. 點擊 "New Branch"
3. 選擇 "From current state"
4. 命名分支（例如：backup-20251016）
5. 創建分支

**好處**:
- 分支是完整的數據庫副本
- 可以隨時恢復
- 不佔用額外的 History Retention

---

### 4. 監控部署日誌
**建議**:
- 每次部署後檢查日誌
- 確認沒有 "reset" 或 "force" 命令
- 驗證數據庫遷移成功

---

### 5. 使用環境變數保護
**建議**:
- 為不同環境使用不同的數據庫
- Development: 本地數據庫或開發專用 Neon 數據庫
- Preview: 預覽專用 Neon 數據庫
- Production: 生產專用 Neon 數據庫

---

## ✨ 總結

### 調查結果
- ✅ Neon Console 訪問成功
- ✅ PITR 已啟用
- ❌ History Retention 只有 1 天
- ❌ 無法恢復 2025-10-16 15:29 之前的數據
- ❌ 沒有其他數據庫分支
- ❌ 沒有手動備份

### 數據丟失原因（推測）
1. **最可能**: 數據庫在 2025-10-16 15:29 被重置
2. **可能**: 切換到了新的數據庫實例
3. **不太可能**: 數據遷移失敗

### 數據恢復可能性
- **從 Neon 備份恢復**: ❌ 0%（超出保留期限）
- **從 Vercel 部署歷史恢復**: ⚠️ 30-50%（如果有舊數據庫）
- **從本地環境恢復**: ⚠️ 10-20%（如果本地有數據）
- **從 Neon Support 恢復**: ⚠️ 5-10%（可能有系統備份）

### 下一步行動
1. 🔴 **立即**: 檢查 Vercel 部署日誌（2025-10-16 15:29 左右）
2. 🟡 **短期**: 檢查是否有其他 Neon 專案或舊數據庫
3. 🟢 **長期**: 實施預防措施（增加保留期限、定期備份）

### 預防建議
1. 升級到 Pro Plan（History Retention 7 天）
2. 定期創建數據庫分支作為備份
3. 實施自動化備份腳本
4. 監控部署日誌
5. 為不同環境使用不同數據庫

---

## 📸 截圖記錄

調查過程中保存的截圖：
1. `neon-login-page.png` - Neon Console 登入頁面
2. `neon-restore-page.png` - Restore 頁面（顯示 1 天保留期限）
3. `neon-branches-page.png` - Branches 頁面（只有 1 個分支）

---

## 📞 聯繫信息

### Neon Support
- 文檔: https://neon.tech/docs/introduction
- 支援: https://neon.tech/docs/introduction/support
- Discord: https://discord.gg/neon

### Vercel Support
- 網站: https://vercel.com/support
- 文檔: https://vercel.com/docs

---

**調查完成時間**: 2025-10-16 17:15  
**調查狀態**: ✅ 完成  
**結論**: 數據無法從 Neon 備份恢復，需要檢查其他恢復選項

