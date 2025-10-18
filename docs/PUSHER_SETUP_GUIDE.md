# Pusher 實時更新設置指南

## 概述

EduCreate 使用 Pusher 實現截圖生成的實時狀態更新，讓用戶無需刷新頁面即可看到最新的截圖。

## 功能特性

- ✅ **實時狀態更新**：截圖生成狀態自動更新（generating → completed/failed）
- ✅ **無需刷新頁面**：使用 WebSocket 推送更新
- ✅ **私有頻道**：每個用戶只能接收自己的更新
- ✅ **安全認證**：使用 NextAuth session 驗證頻道訂閱權限
- ✅ **批量更新支持**：支持同時更新多個活動的截圖狀態

## 設置步驟

### 1. 註冊 Pusher 帳號

1. 訪問 [Pusher 官網](https://pusher.com/)
2. 註冊免費帳號（每月 200,000 條消息免費）
3. 創建新的 Channels App

### 2. 獲取 API 憑證

在 Pusher Dashboard 中找到以下信息：

- **App ID**: 應用程序 ID
- **Key**: 公開密鑰（客戶端使用）
- **Secret**: 私密密鑰（服務端使用）
- **Cluster**: 區域集群（例如：ap1, us2, eu）

### 3. 配置環境變數

在 `.env.local` 文件中添加以下變數：

```env
# Pusher 配置
PUSHER_APP_ID=your_app_id
NEXT_PUBLIC_PUSHER_KEY=your_public_key
PUSHER_SECRET=your_secret_key
NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster
```

**注意**：
- `NEXT_PUBLIC_` 前綴的變數會暴露給客戶端
- `PUSHER_SECRET` 不應該有 `NEXT_PUBLIC_` 前綴（僅服務端使用）

### 4. 在 Vercel 中配置環境變數

1. 登入 Vercel Dashboard
2. 選擇 EduCreate 專案
3. 進入 Settings → Environment Variables
4. 添加以下變數：
   - `PUSHER_APP_ID`
   - `NEXT_PUBLIC_PUSHER_KEY`
   - `PUSHER_SECRET`
   - `NEXT_PUBLIC_PUSHER_CLUSTER`
5. 選擇適用環境：Production, Preview, Development
6. 保存並重新部署

## 技術架構

### 服務端推送流程

```
截圖生成 API
  ↓
更新數據庫狀態
  ↓
調用 pushScreenshotUpdate()
  ↓
Pusher 推送到私有頻道
  ↓
客戶端接收更新
```

### 客戶端接收流程

```
用戶登入
  ↓
useScreenshotUpdates Hook
  ↓
訂閱 private-user-{userId} 頻道
  ↓
監聽 screenshot-update 事件
  ↓
更新活動狀態（無需刷新）
```

## 代碼示例

### 服務端推送更新

```typescript
import { pushScreenshotUpdate } from '@/lib/pusher';

// 推送截圖生成完成事件
await pushScreenshotUpdate(
  userId,
  activityId,
  'completed',
  { thumbnailUrl: 'https://...' }
);

// 推送截圖生成失敗事件
await pushScreenshotUpdate(
  userId,
  activityId,
  'failed',
  { error: 'Screenshot generation failed' }
);
```

### 客戶端接收更新

```typescript
import { useScreenshotUpdates } from '@/hooks/useScreenshotUpdates';

function MyComponent({ userId }) {
  const handleUpdate = (update) => {
    console.log('Screenshot update:', update);
    // 更新 UI 狀態
  };

  const { isConnected } = useScreenshotUpdates(userId, handleUpdate);

  return (
    <div>
      {isConnected && <span>✅ 實時更新已連接</span>}
    </div>
  );
}
```

## 頻道和事件

### 私有頻道

- **格式**：`private-user-{userId}`
- **用途**：每個用戶只能接收自己的更新
- **認證**：通過 `/api/pusher/auth` 端點驗證

### 事件類型

#### 1. `screenshot-update`（單個更新）

```typescript
{
  activityId: string;
  status: 'generating' | 'completed' | 'failed';
  thumbnailUrl?: string;
  error?: string;
  retryCount?: number;
  timestamp: string;
}
```

#### 2. `screenshot-batch-update`（批量更新）

```typescript
{
  updates: Array<{
    activityId: string;
    status: 'generating' | 'completed' | 'failed';
    thumbnailUrl?: string;
    error?: string;
  }>;
  timestamp: string;
}
```

## 安全性

### 私有頻道認證

1. 客戶端嘗試訂閱 `private-user-{userId}` 頻道
2. Pusher 自動調用 `/api/pusher/auth` 端點
3. 服務端驗證用戶 session
4. 確認用戶只能訂閱自己的頻道
5. 返回認證簽名

### 權限檢查

```typescript
// 只允許用戶訂閱自己的頻道
const expectedChannel = `private-user-${session.user.id}`;
if (channelName !== expectedChannel) {
  return NextResponse.json(
    { error: 'Forbidden' },
    { status: 403 }
  );
}
```

## 測試

### 本地測試

1. 確保 `.env.local` 配置正確
2. 啟動開發服務器：`npm run dev`
3. 打開瀏覽器控制台
4. 創建新活動
5. 觀察控制台輸出：
   ```
   [Pusher] Connected
   [Pusher] Screenshot update received: { activityId: '...', status: 'generating' }
   [Pusher] Screenshot update received: { activityId: '...', status: 'completed' }
   ```

### 生產環境測試

1. 部署到 Vercel
2. 確認環境變數已設置
3. 創建新活動
4. 觀察活動卡片狀態自動更新

## 故障排除

### 問題 1：無法連接到 Pusher

**症狀**：控制台顯示 "Pusher connection failed"

**解決方案**：
1. 檢查 `NEXT_PUBLIC_PUSHER_KEY` 是否正確
2. 檢查 `NEXT_PUBLIC_PUSHER_CLUSTER` 是否正確
3. 確認 Pusher App 狀態為 Active

### 問題 2：無法訂閱私有頻道

**症狀**：控制台顯示 "Subscription failed"

**解決方案**：
1. 檢查 `/api/pusher/auth` 端點是否正常工作
2. 確認用戶已登入（有 session）
3. 檢查 `PUSHER_SECRET` 是否正確

### 問題 3：收不到更新事件

**症狀**：頻道已訂閱但沒有收到事件

**解決方案**：
1. 檢查服務端是否正確調用 `pushScreenshotUpdate()`
2. 確認 `userId` 參數正確
3. 檢查 Pusher Dashboard 的 Debug Console

## 成本估算

### Pusher 免費方案

- **連接數**：100 個並發連接
- **消息數**：200,000 條/月
- **頻道數**：無限制

### 預估使用量

假設：
- 100 個活躍用戶
- 每個用戶每天創建 5 個活動
- 每個活動 2 次更新（generating + completed）

**每月消息數**：
```
100 用戶 × 5 活動/天 × 2 更新/活動 × 30 天 = 30,000 條消息/月
```

**結論**：免費方案足夠使用 ✅

## 相關文件

- `lib/pusher.ts` - Pusher 配置和工具函數
- `hooks/useScreenshotUpdates.ts` - 實時更新 Hook
- `app/api/pusher/auth/route.ts` - 私有頻道認證端點
- `app/api/generate-screenshot/route.ts` - 截圖生成 API（推送更新）

## 參考資源

- [Pusher 官方文檔](https://pusher.com/docs/)
- [Pusher Channels 定價](https://pusher.com/channels/pricing)
- [Next.js 環境變數](https://nextjs.org/docs/basic-features/environment-variables)

