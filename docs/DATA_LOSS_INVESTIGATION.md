# 數據丟失調查報告

## 📋 問題描述

**報告時間**: 2025-10-16  
**報告人**: 用戶（南志宗）  
**問題**: 手動登入 Google 後，發現之前的"我的活動"和"我的結果"的數據全部不見了

---

## 🔍 問題確認

### 使用 Playwright 驗證

#### 1. 我的活動頁面
- **URL**: https://edu-create.vercel.app/my-activities
- **用戶**: 南志宗 (ID: `cmgt4vj1y0000jr0434tf8ipd`)
- **活動數量**: 0
- **資料夾數量**: 0
- **頁面顯示**: "還沒有活動"

**控制台日誌**:
```
🚀 為用戶 cmgt4vj1y0000jr0434tf8ipd 從 Activity API 載入活動...
✅ 成功載入 0 個活動
✅ [FolderApiManager] 成功获取 0 个 activities 资料夾
```

#### 2. 我的結果頁面
- **URL**: https://edu-create.vercel.app/my-results
- **用戶**: 南志宗 (ID: `cmgt4vj1y0000jr0434tf8ipd`)
- **結果數量**: 0
- **資料夾數量**: 0
- **頁面顯示**: "尚無結果"

**控制台日誌**:
```
✅ [FolderApiManager] 成功获取 0 个 results 资料夾
```

---

## 🔍 可能的原因分析

### 原因 1: 數據庫遷移導致數據丟失 ❓

**檢查結果**:
- 最近的遷移: `20251015_add_folder_type`
- 遷移內容: 添加 `FolderType` 枚舉和 `type` 字段
- 遷移操作:
  ```sql
  ALTER TABLE "Folder" ADD COLUMN "type" "FolderType" NOT NULL DEFAULT 'ACTIVITIES';
  DROP INDEX "Folder_name_userId_key";
  CREATE UNIQUE INDEX "Folder_name_userId_type_key" ON "Folder"("name", "userId", "type");
  ```

**分析**:
- ✅ 遷移使用了 `DEFAULT 'ACTIVITIES'`，不會刪除現有數據
- ✅ 只是添加字段和修改索引，不會影響現有記錄
- ❌ **不太可能**是這個遷移導致的數據丟失

---

### 原因 2: 不同的數據庫環境 ❓

**可能性**:
- 本地開發數據庫 vs Vercel 生產數據庫
- 不同的 DATABASE_URL 環境變數

**檢查方法**:
1. 確認 Vercel 環境變數中的 DATABASE_URL
2. 檢查是否連接到正確的數據庫

**分析**:
- ⚠️ **可能性較高**
- 如果之前的數據在本地數據庫，而 Vercel 使用不同的數據庫，就會看不到數據

---

### 原因 3: 數據庫被清空或重置 ❓

**可能性**:
- 數據庫被手動清空
- 數據庫被重新創建
- 執行了 `prisma migrate reset`

**檢查方法**:
1. 查看 Vercel 部署日誌
2. 檢查是否有數據庫重置操作
3. 查看 Git 提交歷史

**分析**:
- ⚠️ **可能性中等**
- 需要檢查部署日誌確認

---

### 原因 4: 用戶帳號不同 ❓

**可能性**:
- 之前使用的是不同的 Google 帳號
- 之前使用的是其他登入方式（GitHub、Email）

**檢查方法**:
1. 確認當前登入的 Google 帳號
2. 檢查數據庫中是否有其他用戶帳號

**分析**:
- ❌ **可能性較低**
- 用戶明確表示是"手動登入 Google"，應該是同一個帳號

---

### 原因 5: 外鍵關聯問題 ❓

**可能性**:
- Activity 和 Folder 的外鍵關聯出問題
- 級聯刪除導致數據被刪除

**檢查 Schema**:
```prisma
model Activity {
  folderId  String?
  folder    Folder? @relation(fields: [folderId], references: [id])
  // ...
}

model Folder {
  activities Activity[]
  // ...
}
```

**分析**:
- ❌ **可能性較低**
- 沒有 `onDelete: Cascade` 設置，不會自動刪除
- 即使資料夾被刪除，活動的 `folderId` 會變成 `null`，活動本身不會被刪除

---

## 🔧 調查步驟

### 步驟 1: 檢查數據庫中是否有數據

**需要執行的 SQL 查詢**:

```sql
-- 檢查用戶是否存在
SELECT * FROM "User" WHERE id = 'cmgt4vj1y0000jr0434tf8ipd';

-- 檢查該用戶的活動
SELECT * FROM "Activity" WHERE "userId" = 'cmgt4vj1y0000jr0434tf8ipd';

-- 檢查該用戶的資料夾
SELECT * FROM "Folder" WHERE "userId" = 'cmgt4vj1y0000jr0434tf8ipd';

-- 檢查該用戶的結果
SELECT * FROM "Result" WHERE "userId" = 'cmgt4vj1y0000jr0434tf8ipd';

-- 檢查所有用戶
SELECT id, name, email FROM "User";

-- 檢查所有活動
SELECT id, title, "userId", "createdAt" FROM "Activity";
```

---

### 步驟 2: 檢查 Vercel 環境變數

**需要確認**:
1. Vercel Dashboard → Project Settings → Environment Variables
2. 確認 `DATABASE_URL` 指向正確的數據庫
3. 確認是否有多個數據庫環境（開發、預覽、生產）

---

### 步驟 3: 檢查 Vercel 部署日誌

**需要查看**:
1. Vercel Dashboard → Deployments → 最近的部署
2. 查看構建日誌中是否有數據庫遷移錯誤
3. 查看是否有 `prisma migrate` 或 `prisma db push` 命令執行

---

### 步驟 4: 檢查 Git 提交歷史

**需要查看**:
```bash
# 查看最近的提交
git log --oneline --since="7 days ago"

# 查看數據庫相關的變更
git log --oneline --since="7 days ago" -- prisma/

# 查看特定提交的詳細內容
git show <commit-hash>
```

---

## 📊 數據恢復可能性

### 情況 1: 數據在不同的數據庫

**恢復可能性**: ✅ 高

**恢復方法**:
1. 找到包含數據的數據庫
2. 導出數據
3. 導入到正確的數據庫

---

### 情況 2: 數據被誤刪

**恢復可能性**: ⚠️ 中等

**恢復方法**:
1. 檢查數據庫備份
2. 從備份中恢復數據
3. 如果使用 Vercel Postgres，檢查是否有自動備份

---

### 情況 3: 數據庫被重置

**恢復可能性**: ❌ 低

**恢復方法**:
1. 檢查是否有數據庫備份
2. 如果沒有備份，數據可能無法恢復
3. 需要重新創建數據

---

## 🎯 推薦的調查順序

### 優先級 1: 確認數據庫環境 🔴

**原因**: 最可能的原因，也最容易確認

**步驟**:
1. 連接到 Vercel 生產數據庫
2. 執行 SQL 查詢檢查數據
3. 確認用戶和活動是否存在

**命令**:
```bash
# 使用 Vercel CLI 連接到數據庫
vercel env pull
npx prisma studio

# 或使用 SQL 客戶端直接連接
# 使用 Vercel Dashboard 中的 DATABASE_URL
```

---

### 優先級 2: 檢查 Vercel 部署日誌 🟡

**原因**: 可能有數據庫遷移錯誤或重置操作

**步驟**:
1. 訪問 Vercel Dashboard
2. 查看最近的部署日誌
3. 搜索 "prisma"、"migrate"、"reset" 等關鍵字

---

### 優先級 3: 檢查數據庫備份 🟢

**原因**: 如果數據真的丟失，需要從備份恢復

**步驟**:
1. 檢查 Vercel Postgres 是否有自動備份
2. 檢查是否有手動備份
3. 評估恢復可能性

---

## 📝 臨時解決方案

### 方案 1: 創建測試數據

**目的**: 驗證系統功能正常

**步驟**:
1. 創建新的活動
2. 創建新的資料夾
3. 測試所有功能是否正常

---

### 方案 2: 使用演示帳號

**目的**: 提供臨時的演示環境

**步驟**:
1. 創建演示用戶（已完成）
2. 為演示用戶添加示例數據
3. 使用演示帳號進行測試

---

## 🔮 預防措施

### 1. 定期備份數據庫

**建議**:
- 啟用 Vercel Postgres 自動備份
- 定期手動備份重要數據
- 保留至少 7 天的備份

---

### 2. 使用數據庫遷移最佳實踐

**建議**:
- 在本地測試遷移
- 使用 `prisma migrate dev` 而非 `prisma db push`
- 在生產環境使用 `prisma migrate deploy`
- 避免使用 `prisma migrate reset` 在生產環境

---

### 3. 添加軟刪除

**建議**:
- 所有重要數據使用軟刪除（`deletedAt` 字段）
- 不要物理刪除數據
- 定期清理軟刪除的數據

**當前狀態**:
- ✅ Activity 已有 `deletedAt` 字段
- ✅ Folder 已有 `deletedAt` 字段
- ✅ Result 已有 `deletedAt` 字段

---

### 4. 添加數據審計日誌

**建議**:
- 記錄所有數據變更
- 包括創建、更新、刪除操作
- 記錄操作人和操作時間

---

## ✨ 總結

### 關鍵發現
1. ✅ 用戶帳號存在（南志宗，ID: cmgt4vj1y0000jr0434tf8ipd）
2. ❌ 該用戶的活動數量為 0
3. ❌ 該用戶的資料夾數量為 0
4. ❌ 該用戶的結果數量為 0

### 最可能的原因
1. **數據庫環境不同**（可能性最高）
   - 之前的數據在本地數據庫
   - Vercel 使用不同的數據庫

2. **數據庫被重置**（可能性中等）
   - 部署過程中執行了數據庫重置
   - 需要檢查部署日誌確認

3. **數據庫遷移失敗**（可能性較低）
   - 遷移過程中出現錯誤
   - 導致數據丟失

### 下一步行動
1. **立即**: 連接到 Vercel 生產數據庫，執行 SQL 查詢確認數據狀態
2. **短期**: 檢查 Vercel 部署日誌，查找可能的錯誤
3. **長期**: 實施數據備份和審計日誌系統

### 數據恢復可能性
- 如果數據在不同的數據庫：✅ 高
- 如果數據被誤刪且有備份：⚠️ 中等
- 如果數據庫被重置且無備份：❌ 低

