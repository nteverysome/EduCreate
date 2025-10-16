# 數據恢復調查指南

## 📋 問題總結

**發現**: 數據庫中沒有 2025-10-16 15:29:54 之前的數據  
**影響**: 用戶之前創建的所有活動和結果都不見了  
**數據庫**: Neon PostgreSQL  

---

## 🔍 調查步驟

### 步驟 1: 檢查 Vercel 部署日誌

#### 1.1 訪問 Vercel Dashboard
1. 登入 Vercel: https://vercel.com/dashboard
2. 選擇 EduCreate 專案
3. 點擊 "Deployments" 標籤

#### 1.2 查看部署歷史
查找 2025-10-16 15:29 之前的部署記錄：
- 查看部署時間
- 查看部署狀態（成功/失敗）
- 查看構建日誌

#### 1.3 搜索關鍵字
在部署日誌中搜索以下關鍵字：
- `prisma migrate`
- `prisma db push`
- `prisma migrate reset`
- `prisma migrate deploy`
- `DATABASE_URL`
- `error`
- `failed`

#### 1.4 重點檢查項目
- [ ] 是否有數據庫遷移執行
- [ ] 是否有遷移失敗的記錄
- [ ] 是否有 `prisma migrate reset` 命令執行
- [ ] 是否有環境變數變更
- [ ] 是否有構建錯誤

---

### 步驟 2: 檢查 Neon PostgreSQL 備份

#### 2.1 訪問 Neon Console
1. 登入 Neon: https://console.neon.tech/
2. 選擇 EduCreate 專案的數據庫
3. 查看數據庫詳情

#### 2.2 檢查備份設置
- [ ] 確認是否啟用了自動備份
- [ ] 查看備份保留期限
- [ ] 查看最近的備份時間

#### 2.3 查看數據庫歷史
在 Neon Console 中：
1. 點擊 "Branches" 或 "History" 標籤
2. 查看數據庫分支歷史
3. 確認是否有時間點恢復（Point-in-Time Recovery）功能

#### 2.4 檢查數據庫操作日誌
- [ ] 查看是否有 DROP DATABASE 操作
- [ ] 查看是否有 TRUNCATE TABLE 操作
- [ ] 查看是否有大量 DELETE 操作
- [ ] 查看是否有數據庫重置操作

#### 2.5 Neon 備份恢復選項
Neon PostgreSQL 提供以下恢復選項：
1. **時間點恢復（PITR）**: 恢復到特定時間點
2. **分支恢復**: 從數據庫分支恢復
3. **快照恢復**: 從快照恢復

---

### 步驟 3: 確認數據庫連接設置

#### 3.1 檢查 Vercel 環境變數
1. 訪問 Vercel Dashboard
2. 進入 EduCreate 專案
3. 點擊 "Settings" → "Environment Variables"
4. 查看 `DATABASE_URL` 的值

#### 3.2 確認數據庫連接字符串
檢查 `DATABASE_URL` 格式：
```
postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

重點檢查：
- [ ] Host 是否正確（應該是 Neon 的 host）
- [ ] Database 名稱是否正確
- [ ] 是否有多個環境（Development, Preview, Production）
- [ ] 每個環境的 DATABASE_URL 是否不同

#### 3.3 檢查本地 .env 文件
```bash
# 查看本地 .env 文件
cat .env | grep DATABASE_URL
```

確認：
- [ ] 本地 DATABASE_URL 是否與 Vercel 生產環境相同
- [ ] 是否有多個 .env 文件（.env.local, .env.production）

#### 3.4 測試數據庫連接
創建測試腳本 `scripts/test-connection.js`:
```javascript
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // 測試連接
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // 獲取數據庫信息
    const result = await prisma.$queryRaw`
      SELECT 
        current_database() as database,
        current_user as user,
        version() as version
    `;
    console.log('Database Info:', result);
    
    // 檢查表是否存在
    const tables = await prisma.$queryRaw`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;
    console.log('Tables:', tables);
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
```

執行測試：
```bash
node scripts/test-connection.js
```

---

## 🔧 數據恢復方案

### 方案 1: 從 Neon 備份恢復（推薦）

#### 前提條件
- Neon 有可用的備份
- 備份時間在數據丟失之前

#### 恢復步驟
1. 登入 Neon Console
2. 選擇數據庫專案
3. 點擊 "Restore" 或 "Point-in-Time Recovery"
4. 選擇恢復時間點（2025-10-16 15:29 之前）
5. 創建新的數據庫分支或恢復到主分支
6. 更新 Vercel 的 DATABASE_URL 指向恢復的數據庫

#### 注意事項
- ⚠️ 恢復會覆蓋當前數據
- ⚠️ 建議先創建當前數據的備份
- ⚠️ 恢復後需要重新部署應用

---

### 方案 2: 從 Vercel 部署歷史恢復

#### 前提條件
- 之前的部署使用了不同的數據庫
- 舊數據庫仍然存在

#### 恢復步驟
1. 查看 Vercel 部署歷史
2. 找到數據丟失前的部署
3. 查看該部署的環境變數
4. 獲取舊的 DATABASE_URL
5. 連接到舊數據庫
6. 導出數據
7. 導入到當前數據庫

---

### 方案 3: 從本地開發數據庫恢復

#### 前提條件
- 本地開發環境有數據
- 本地數據是最新的

#### 恢復步驟
1. 從本地數據庫導出數據：
```bash
# 使用 pg_dump 導出
pg_dump -h localhost -U postgres -d educreate > backup.sql

# 或使用 Prisma
npx prisma db pull
npx prisma db push --force-reset
```

2. 導入到 Neon 數據庫：
```bash
# 使用 psql 導入
psql $DATABASE_URL < backup.sql
```

---

## 📊 數據庫狀態檢查清單

### 當前數據庫狀態
- [x] 數據庫連接正常
- [x] 用戶表存在
- [x] Activity 表存在
- [x] Folder 表存在
- [ ] 有 2025-10-16 15:29 之前的數據
- [ ] 有用戶的活動數據
- [ ] 有用戶的結果數據

### 數據丟失範圍
- [x] 所有 2025-10-16 15:29 之前的數據
- [x] 用戶之前創建的活動
- [x] 用戶之前創建的結果
- [x] 用戶之前的課業分配

---

## 🎯 調查結果記錄

### Vercel 部署日誌檢查結果
```
日期: _______________
檢查人: _______________

發現:
- [ ] 有數據庫遷移執行
- [ ] 有遷移失敗記錄
- [ ] 有 reset 命令執行
- [ ] 有環境變數變更
- [ ] 有構建錯誤

詳細記錄:
_______________________________________
_______________________________________
_______________________________________
```

### Neon 備份檢查結果
```
日期: _______________
檢查人: _______________

發現:
- [ ] 有自動備份
- [ ] 有可用的備份點
- [ ] 有時間點恢復功能
- [ ] 有數據庫操作日誌

最近備份時間: _______________
備份保留期限: _______________

詳細記錄:
_______________________________________
_______________________________________
_______________________________________
```

### 數據庫連接檢查結果
```
日期: _______________
檢查人: _______________

發現:
- [ ] DATABASE_URL 正確
- [ ] 連接到正確的數據庫
- [ ] 沒有多個數據庫實例
- [ ] 環境變數一致

當前 DATABASE_URL: _______________
數據庫名稱: _______________
Host: _______________

詳細記錄:
_______________________________________
_______________________________________
_______________________________________
```

---

## 📞 聯繫支援

### Neon Support
- 網站: https://neon.tech/docs/introduction
- 支援: https://neon.tech/docs/introduction/support
- Discord: https://discord.gg/neon

### Vercel Support
- 網站: https://vercel.com/support
- 文檔: https://vercel.com/docs

---

## ✨ 總結

### 調查優先級
1. 🔴 **最高優先級**: 檢查 Neon 備份
   - 如果有備份，可以直接恢復數據
   - 這是最快速和最可靠的方法

2. 🟡 **中等優先級**: 檢查 Vercel 部署日誌
   - 了解數據丟失的原因
   - 防止未來再次發生

3. 🟢 **低優先級**: 確認數據庫連接設置
   - 確保連接到正確的數據庫
   - 排除配置錯誤的可能性

### 預期結果
- ✅ 找到數據丟失的原因
- ✅ 確認是否有可用的備份
- ✅ 制定數據恢復計畫
- ✅ 實施預防措施

### 下一步行動
1. 立即檢查 Neon Console 的備份狀態
2. 如果有備份，準備恢復計畫
3. 如果沒有備份，檢查其他恢復選項
4. 實施數據恢復
5. 驗證恢復結果
6. 添加預防措施（定期備份、監控）

