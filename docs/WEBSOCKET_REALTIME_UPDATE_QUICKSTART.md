# WebSocket 實時更新快速啟動指南

## 🎯 功能概述

實現了基於 Pusher 的 WebSocket 實時更新功能，讓用戶無需刷新頁面即可看到截圖生成狀態的變化。

## ⚡ 快速設置（5 分鐘）

### 步驟 1：註冊 Pusher（2 分鐘）

1. 訪問 https://pusher.com/
2. 註冊免費帳號
3. 創建新的 Channels App
4. 記錄以下信息：
   - App ID
   - Key（公開密鑰）
   - Secret（私密密鑰）
   - Cluster（區域，例如：ap1）

### 步驟 2：配置環境變數（1 分鐘）

在 `.env.local` 添加：

```env
PUSHER_APP_ID=your_app_id
NEXT_PUBLIC_PUSHER_KEY=your_public_key
PUSHER_SECRET=your_secret_key
NEXT_PUBLIC_PUSHER_CLUSTER=ap1
```

### 步驟 3：在 Vercel 配置環境變數（2 分鐘）

1. 登入 Vercel Dashboard
2. 選擇 EduCreate 專案
3. Settings → Environment Variables
4. 添加上述 4 個變數
5. 選擇 Production + Preview + Development
6. 保存並重新部署

## ✅ 驗證功能

### 本地測試

1. 啟動開發服務器：
   ```bash
   npm run dev
   ```

2. 打開瀏覽器控制台

3. 訪問 http://localhost:3000/my-activities

4. 觀察控制台輸出：
   ```
   [Pusher] Connected
   ```

5. 創建新活動

6. 觀察活動卡片狀態自動更新：
   - 🎮 等待生成截圖...
   - 📸 正在生成截圖...（動畫）
   - ✅ 顯示真實截圖（無需刷新）

### 生產環境測試

1. 部署到 Vercel 後訪問 https://edu-create.vercel.app/my-activities
2. 創建新活動
3. 觀察狀態自動更新

## 🎨 用戶體驗

### 實時連接指示器

頁面右上角顯示：
```
🟢 實時更新已連接
```

### 狀態自動更新

| 狀態 | 圖標 | 說明 |
|------|------|------|
| pending | 🎮 | 等待生成截圖... |
| generating | 📸 | 正在生成截圖...（動畫） |
| completed | ✅ | 顯示真實截圖 |
| failed | ❌ | 截圖生成失敗（顯示重試按鈕） |

## 🔧 技術細節

### 架構流程

```
用戶創建活動
  ↓
後端開始生成截圖
  ↓
推送 'generating' 狀態 → 前端顯示 📸
  ↓
截圖生成完成
  ↓
推送 'completed' + URL → 前端顯示截圖 ✅
```

### 私有頻道安全

- 每個用戶有獨立的私有頻道：`private-user-{userId}`
- 訂閱前需要通過 `/api/pusher/auth` 認證
- 只能接收自己的更新，無法看到其他用戶的數據

### 事件類型

1. **screenshot-update**（單個更新）
   ```typescript
   {
     activityId: "abc123",
     status: "completed",
     thumbnailUrl: "https://...",
     timestamp: "2024-01-15T10:30:00Z"
   }
   ```

2. **screenshot-batch-update**（批量更新）
   ```typescript
   {
     updates: [
       { activityId: "abc123", status: "completed", thumbnailUrl: "..." },
       { activityId: "def456", status: "failed", error: "..." }
     ],
     timestamp: "2024-01-15T10:30:00Z"
   }
   ```

## 📊 成本分析

### Pusher 免費方案

- ✅ 100 個並發連接
- ✅ 200,000 條消息/月
- ✅ 無限頻道數

### 預估使用量

假設：
- 100 個活躍用戶
- 每人每天創建 5 個活動
- 每個活動 2 次更新

**每月消息數**：
```
100 × 5 × 2 × 30 = 30,000 條/月
```

**結論**：免費方案完全足夠 ✅

## 🐛 故障排除

### 問題 1：看不到 "實時更新已連接"

**原因**：Pusher 配置錯誤

**解決**：
1. 檢查 `.env.local` 中的 `NEXT_PUBLIC_PUSHER_KEY`
2. 檢查 `NEXT_PUBLIC_PUSHER_CLUSTER`
3. 確認 Pusher App 狀態為 Active

### 問題 2：狀態不會自動更新

**原因**：私有頻道認證失敗

**解決**：
1. 確認用戶已登入
2. 檢查 `/api/pusher/auth` 端點是否正常
3. 檢查 `PUSHER_SECRET` 是否正確

### 問題 3：控制台顯示 "Subscription failed"

**原因**：頻道權限問題

**解決**：
1. 確認用戶 ID 正確
2. 檢查 session 是否有效
3. 查看 Pusher Dashboard 的 Debug Console

## 📚 相關文件

- **完整指南**：`docs/PUSHER_SETUP_GUIDE.md`
- **代碼文件**：
  - `lib/pusher.ts` - Pusher 配置
  - `hooks/useScreenshotUpdates.ts` - 實時更新 Hook
  - `app/api/pusher/auth/route.ts` - 認證端點
  - `app/api/generate-screenshot/route.ts` - 推送更新

## 🎉 完成！

現在您的 EduCreate 已經支持實時更新功能了！

用戶創建活動後，無需刷新頁面即可看到截圖生成的進度和結果。

---

**下一步建議**：
- 監控 Pusher Dashboard 查看實時連接數
- 根據實際使用量調整方案
- 考慮添加更多實時功能（如協作編輯、即時通知等）

