# Phase 4: 數據遷移和測試 - 執行計畫

## 📅 計畫信息
- **開始時間**: 2025-10-16
- **預計耗時**: 30-45 分鐘
- **狀態**: 準備開始
- **風險等級**: 低（僅測試 Preview 環境）

## 🎯 目標

驗證環境隔離架構的正確性，確保：
1. Preview 環境使用 Preview 分支資料庫
2. Production 環境不受影響
3. 數據完全隔離
4. 所有功能正常運作

## 📋 執行步驟

### 步驟 1: 驗證 Neon Preview 分支數據 ⏳ PENDING

使用 Neon SQL Editor 檢查 Preview 分支的數據狀態。

**檢查項目**:
1. 連接到 Preview 分支 (br-winter-smoke-a8fhvngp)
2. 檢查資料表是否存在
3. 檢查數據是否與 Production 一致（因為是從 Production 複製的）
4. 記錄當前數據狀態

**SQL 查詢**:
```sql
-- 檢查所有資料表
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- 檢查用戶數量
SELECT COUNT(*) as user_count FROM "User";

-- 檢查活動數量
SELECT COUNT(*) as activity_count FROM "Activity";

-- 檢查結果數量
SELECT COUNT(*) as result_count FROM "Result";
```

### 步驟 2: 觸發 Preview 部署 ⏳ PENDING

創建測試分支並推送到 GitHub，觸發 Vercel Preview 部署。

**步驟**:
```powershell
# 創建測試分支
git checkout -b test/preview-env-verification

# 創建測試文件（觸發部署）
echo "# Preview Environment Test" > docs/PREVIEW_ENV_TEST.md
echo "測試時間: $(Get-Date)" >> docs/PREVIEW_ENV_TEST.md

# 提交並推送
git add docs/PREVIEW_ENV_TEST.md
git commit -m "test: 觸發 Preview 部署以驗證環境隔離"
git push origin test/preview-env-verification
```

**預期結果**:
- Vercel 自動檢測到新分支
- 開始 Preview 部署
- 使用新的 DATABASE_URL (Preview)

### 步驟 3: 監控 Preview 部署 ⏳ PENDING

**檢查項目**:
1. 訪問 Vercel Dashboard
2. 找到新的 Preview 部署
3. 檢查部署日誌
4. 確認環境變數使用情況
5. 等待部署完成

**關鍵日誌檢查**:
- 尋找 DATABASE_URL 相關日誌
- 確認連接到正確的資料庫
- 檢查是否有連接錯誤

### 步驟 4: 測試 Preview 環境功能 ⏳ PENDING

部署完成後，測試 Preview 環境的基本功能。

**測試項目**:

#### 4.1 資料庫連接測試
- [ ] 訪問 Preview URL
- [ ] 檢查主頁是否正常載入
- [ ] 檢查是否有資料庫連接錯誤

#### 4.2 登入功能測試
- [ ] 使用 Google 登入
- [ ] 檢查用戶資料是否正確載入
- [ ] 確認 session 正常運作

#### 4.3 數據讀取測試
- [ ] 訪問「我的活動」頁面
- [ ] 檢查活動列表是否顯示
- [ ] 訪問「我的結果」頁面
- [ ] 檢查結果列表是否顯示

#### 4.4 數據寫入測試（關鍵！）
- [ ] 創建新的測試活動
- [ ] 記錄活動 ID
- [ ] 確認活動成功保存

### 步驟 5: 驗證數據隔離 ⏳ PENDING

**這是最關鍵的測試！** 確認 Preview 環境的數據不會影響 Production。

**驗證步驟**:

#### 5.1 在 Preview 環境創建測試數據
```
1. 在 Preview 環境創建測試活動
   - 名稱: "Preview Test Activity - [時間戳]"
   - 記錄活動 ID

2. 在 Preview 環境創建測試結果
   - 關聯到測試活動
   - 記錄結果 ID
```

#### 5.2 檢查 Neon Preview 分支
```sql
-- 在 Neon SQL Editor 連接到 Preview 分支
-- 檢查新創建的活動是否存在
SELECT * FROM "Activity" 
WHERE name LIKE 'Preview Test Activity%'
ORDER BY "createdAt" DESC;
```

#### 5.3 檢查 Neon Production 分支
```sql
-- 在 Neon SQL Editor 連接到 Production 分支
-- 確認測試活動 NOT 存在
SELECT * FROM "Activity" 
WHERE name LIKE 'Preview Test Activity%'
ORDER BY "createdAt" DESC;

-- 應該返回 0 行！
```

#### 5.4 檢查 Production 環境
```
1. 訪問 Production URL (https://edu-create.vercel.app)
2. 登入相同帳號
3. 檢查「我的活動」
4. 確認測試活動 NOT 出現在列表中
```

### 步驟 6: 測試 Preview 環境的破壞性操作 ⏳ PENDING

**目的**: 驗證在 Preview 環境進行破壞性操作不會影響 Production。

**測試操作**:
1. 在 Preview 環境刪除測試活動
2. 在 Preview 環境修改測試數據
3. 在 Preview 環境創建大量測試數據

**驗證**:
- 檢查 Production 環境完全不受影響
- 檢查 Production 分支數據完整性

### 步驟 7: 清理測試數據 ⏳ PENDING

**清理項目**:
1. 刪除 Preview 環境的測試活動
2. 刪除測試分支（可選）
3. 記錄測試結果

```powershell
# 刪除測試分支（如果需要）
git checkout master
git branch -D test/preview-env-verification
git push origin --delete test/preview-env-verification
```

## 🔍 驗證檢查清單

### Preview 部署驗證
- [ ] Preview 部署成功完成
- [ ] 沒有部署錯誤
- [ ] 環境變數正確使用
- [ ] 可以訪問 Preview URL

### 資料庫連接驗證
- [ ] Preview 環境連接到 Preview 分支
- [ ] 沒有資料庫連接錯誤
- [ ] 可以讀取數據
- [ ] 可以寫入數據

### 數據隔離驗證（最重要！）
- [ ] Preview 環境的新數據只存在於 Preview 分支
- [ ] Production 分支沒有 Preview 的測試數據
- [ ] Production 環境看不到 Preview 的測試數據
- [ ] 兩個環境完全獨立

### 功能完整性驗證
- [ ] 登入功能正常
- [ ] 活動創建功能正常
- [ ] 活動列表顯示正常
- [ ] 結果記錄功能正常
- [ ] 所有主要功能可用

## 📊 測試結果記錄模板

### Preview 環境信息
```
Preview URL: [待填寫]
部署時間: [待填寫]
部署 ID: [待填寫]
DATABASE_URL: postgresql://...@ep-soft-resonance-a8hnscfv-pooler...
```

### 測試數據記錄
```
測試活動 ID: [待填寫]
測試活動名稱: Preview Test Activity - [時間戳]
創建時間: [待填寫]
```

### 數據隔離驗證結果
```
✅ Preview 分支包含測試數據: [是/否]
✅ Production 分支不包含測試數據: [是/否]
✅ Production 環境看不到測試數據: [是/否]
```

### 功能測試結果
```
✅ 登入: [通過/失敗]
✅ 創建活動: [通過/失敗]
✅ 讀取活動: [通過/失敗]
✅ 刪除活動: [通過/失敗]
```

## ⚠️ 常見問題和解決方案

### 問題 1: Preview 部署失敗
**症狀**: Vercel 部署過程中出現錯誤
**可能原因**:
1. DATABASE_URL 格式錯誤
2. Preview 分支無法訪問
3. Prisma 遷移失敗

**解決方案**:
1. 檢查 Vercel 部署日誌
2. 驗證 DATABASE_URL 環境變數
3. 檢查 Neon Preview 分支狀態
4. 嘗試手動運行 Prisma 遷移

### 問題 2: Preview 環境連接到錯誤的資料庫
**症狀**: Preview 環境顯示 Production 數據
**可能原因**:
1. 環境變數配置錯誤
2. Vercel 快取舊配置
3. 環境變數優先級問題

**解決方案**:
1. 重新檢查 Vercel 環境變數設置
2. 觸發新的部署（Redeploy）
3. 檢查部署日誌確認使用的 DATABASE_URL

### 問題 3: 數據隔離失敗
**症狀**: Preview 的測試數據出現在 Production
**可能原因**:
1. 兩個環境使用相同的資料庫
2. 環境變數配置錯誤

**解決方案**:
1. 立即停止測試
2. 檢查 Vercel 環境變數配置
3. 檢查 Neon 連接字串
4. 重新配置環境變數

## 🎯 成功標準

Phase 4 完成的標準：
1. ✅ Preview 部署成功
2. ✅ Preview 環境連接到 Preview 分支
3. ✅ 可以在 Preview 環境創建測試數據
4. ✅ 測試數據只存在於 Preview 分支
5. ✅ Production 環境完全不受影響
6. ✅ 數據隔離驗證通過
7. ✅ 所有功能測試通過

## 📝 下一步

Phase 4 完成後，將進入：
- **Phase 5**: 文檔和監控
  - 創建環境設置文檔
  - 創建資料庫架構文檔
  - 更新 README
  - 設置監控和維護流程

---

**文檔創建時間**: 2025-10-16
**創建者**: AI Assistant
**狀態**: 準備開始 Preview 環境測試

