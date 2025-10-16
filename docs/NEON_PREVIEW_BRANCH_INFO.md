# Neon Preview 分支信息

## 📅 創建信息
**創建時間**: 2025-10-16 17:47:23 +08:00  
**創建者**: AI Assistant (通過 Playwright 自動化)  
**狀態**: ✅ 成功創建  

---

## 🔑 分支詳情

### 基本信息
```
分支名稱: preview
分支 ID: br-winter-smoke-a8fhvngp
父分支: production (br-rough-field-a80z6kz8)
數據複製: 是（從 production 複製當前數據）
區域: Azure East US 2 (Virginia)
PostgreSQL 版本: 17
```

### Compute 信息
```
Compute ID: ep-soft-resonance-a8hnscfv
Compute 大小: 1 ↔ 2 CU (自動縮放)
狀態: ACTIVE
啟動時間: 2025-10-16 17:47:23 +08:00
```

---

## 🔗 連接字串

### Pooled Connection (推薦用於應用程式)
```
postgresql://neondb_owner:npg_JiVYrWK7L6Ff@ep-soft-resonance-a8hnscfv-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require
```

**用途**: 
- 用於 Next.js 應用程式
- 用於 Prisma ORM
- 用於高並發連接

**Vercel 環境變數設置**:
```env
# Preview 環境
DATABASE_URL=postgresql://neondb_owner:npg_JiVYrWK7L6Ff@ep-soft-resonance-a8hnscfv-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require
```

---

### Direct Connection (用於 Prisma Migrate)
```
postgresql://neondb_owner:npg_JiVYrWK7L6Ff@ep-soft-resonance-a8hnscfv.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require
```

**用途**:
- 用於運行 Prisma 遷移
- 用於資料庫管理工具
- 用於直接連接（不通過連接池）

**注意**: 直接連接有連接數限制，建議只在遷移時使用。

---

## 📊 與 Production 分支的比較

| 項目 | Production | Preview |
|------|-----------|---------|
| 分支 ID | br-rough-field-a80z6kz8 | br-winter-smoke-a8fhvngp |
| Compute ID | ep-curly-salad-a85exs3f | ep-soft-resonance-a8hnscfv |
| 數據大小 | 95.01 MB | 0 MB (初始，會隨使用增長) |
| Compute 時數 | 58.94 h | 0 h (剛創建) |
| 創建時間 | 2025-06-06 20:30 | 2025-10-16 17:47 |
| 狀態 | default (預設分支) | 普通分支 |

---

## 🎯 使用場景

### Preview 分支的用途
1. **Vercel Preview 部署**
   - 每次推送到非主分支時，Vercel 會創建 Preview 部署
   - Preview 部署應該使用 Preview 分支的資料庫
   - 測試不會影響 Production 數據

2. **功能測試**
   - 測試新功能
   - 測試資料庫遷移
   - 測試破壞性操作

3. **數據實驗**
   - 測試數據導入
   - 測試數據清理
   - 測試性能優化

---

## ⚠️ 重要注意事項

### 數據隔離
- ✅ Preview 分支的數據與 Production 完全隔離
- ✅ 在 Preview 創建的數據不會出現在 Production
- ✅ 在 Preview 刪除的數據不會影響 Production
- ✅ 在 Preview 修改的數據不會影響 Production

### 數據同步
- 📌 Preview 分支是從 Production 複製的快照
- 📌 創建時的數據與 Production 相同
- 📌 創建後，兩個分支的數據獨立演化
- 📌 如需同步最新數據，可以使用 "Reset from parent" 功能

### 成本考量
- 💰 Preview 分支只在數據變化時佔用存儲空間
- 💰 如果沒有修改數據，不會額外佔用存儲
- 💰 Compute 時數會單獨計算
- 💰 免費計畫支援 10 個分支，目前使用 2/10

---

## 🔄 分支管理操作

### 重置分支（同步最新數據）
```bash
# 在 Neon Console 中
1. 進入 preview 分支頁面
2. 點擊 "Reset from parent" 按鈕
3. 確認操作

# 這會將 preview 分支重置為 production 的最新狀態
# ⚠️ 警告：這會刪除 preview 分支的所有數據變更
```

### 查看 Schema 差異
```bash
# 在 Neon Console 中
1. 進入 preview 分支頁面
2. 點擊 "Schema diff" 按鈕
3. 查看與 production 的 schema 差異
```

### 刪除分支（如果不再需要）
```bash
# 在 Neon Console 中
1. 進入 Branches 頁面
2. 找到 preview 分支
3. 點擊右側的 "..." 按鈕
4. 選擇 "Delete branch"
5. 確認刪除

# ⚠️ 警告：刪除分支會永久刪除該分支的所有數據
```

---

## 📝 下一步操作

### 階段 2: 更新 Vercel 環境變數

1. **訪問 Vercel Dashboard**
   ```
   https://vercel.com/nteverysome/educreate/settings/environment-variables
   ```

2. **更新 DATABASE_URL**
   - 找到 `DATABASE_URL` 變數
   - 點擊 "Edit"
   - 取消勾選 "All Environments"
   - 為 Preview 環境設置新的連接字串：
     ```
     postgresql://neondb_owner:npg_JiVYrWK7L6Ff@ep-soft-resonance-a8hnscfv-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require
     ```

3. **保持 Production 不變**
   - Production 繼續使用當前的連接字串：
     ```
     postgresql://neondb_owner:npg_JiVYrWK7L6Ff@ep-curly-salad-a85exs3f-pooler.eastus2.azure.neon.tech/neondb?sslmode=require
     ```

4. **觸發 Preview 部署測試**
   - 創建測試分支並推送
   - 等待 Vercel 自動部署
   - 檢查部署日誌確認使用了新的 DATABASE_URL

---

## 🔍 驗證步驟

### 驗證 Preview 分支可用性

1. **使用 psql 連接**
   ```bash
   psql 'postgresql://neondb_owner:npg_JiVYrWK7L6Ff@ep-soft-resonance-a8hnscfv-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require'
   ```

2. **查詢數據**
   ```sql
   -- 檢查用戶數量
   SELECT COUNT(*) FROM "User";
   
   -- 檢查活動數量
   SELECT COUNT(*) FROM "Activity";
   
   -- 檢查資料夾數量
   SELECT COUNT(*) FROM "Folder";
   ```

3. **預期結果**
   - 數據應該與 Production 相同（因為是從 Production 複製的）
   - 所有表都應該存在
   - Schema 應該完全一致

---

## 📚 相關文檔

- [Neon Branching 文檔](https://neon.com/docs/introduction/branching)
- [Neon Console](https://console.neon.tech/app/projects/dry-cloud-00816876/branches)
- [環境隔離實施計畫](./ENVIRONMENT_ISOLATION_IMPLEMENTATION_PLAN.md)
- [單一數據源頭驗證報告](./SINGLE_DATABASE_SOURCE_VERIFICATION.md)

---

## ✅ 完成狀態

- [x] 創建 Preview 分支
- [x] 獲取連接字串
- [x] 記錄分支信息
- [ ] 更新 Vercel 環境變數
- [ ] 測試 Preview 部署
- [ ] 驗證數據隔離

---

**文檔版本**: 1.0  
**最後更新**: 2025-10-16 17:50  
**狀態**: ✅ Preview 分支創建成功，準備進行階段 2

