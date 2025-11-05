# 🔐 認證問題完整診斷報告

## 📋 問題描述

用戶登入 Google 後，嘗試創建新活動時收到 **401 Unauthorized** 錯誤。

## 🔍 根本原因分析

### 問題 1：v54.0 修改導致 Session 數據丟失

**位置**：`lib/auth.ts` 第 138-188 行

**原始代碼（v54.0）**：
```typescript
if (token) {
  if (!session.user) {
    session.user = {
      id: '',
      email: '',
      name: '',
      image: null
    };
  }
  
  session.user.id = token.id as string;  // ❌ 如果 token.id 為 undefined，會設置為空字符串
  session.user.email = token.email as string;  // ❌ 同樣的問題
}
```

**問題**：
- 當 `token.id` 或 `token.email` 為 undefined 時，會被設置為空字符串 `''`
- 後端檢查 `if (!session?.user?.email)` 會失敗，因為空字符串是 falsy 值
- 導致 API 返回 401 Unauthorized

### 問題 2：JWT Callback 可能沒有正確填充 Token

**位置**：`lib/auth.ts` 第 128-137 行

**代碼**：
```typescript
async jwt({ token, user, account }) {
  if (user) {
    token.id = user.id;
    token.email = user.email;
    token.name = user.name;
  }
  return token;
}
```

**問題**：
- 只有在 `user` 存在時才填充 token
- 但在後續的 session 回調中，`user` 可能為 undefined
- 導致 token 中的數據為 undefined

## ✅ 已實施的修復

### v54.1：改進 Session Callback

**修改**：`lib/auth.ts` 第 138-188 行

```typescript
async session({ session, token }) {
  // 只有當 token 中有有效數據時才填充 session
  if (token && (token.id || token.email)) {
    if (!session.user) {
      session.user = { id: '', email: '', name: '', image: null };
    }
    
    // 只填充非空值
    if (token.id) {
      session.user.id = token.id as string;
    }
    if (token.email) {
      session.user.email = token.email as string;
    }
    // ... 其他字段
  }
  return session;
}
```

**改進**：
- ✅ 檢查 token 中是否有有效數據
- ✅ 只填充非空值，避免覆蓋有效數據
- ✅ 添加警告日誌以便調試

### v55.0：改進前端錯誤處理

**修改**：`app/create/[templateId]/page.tsx` 第 520-554 行

```typescript
if (response.ok) {
  const activity = await response.json();
  
  // 驗證 activity.id 是否存在
  if (!activity.id) {
    alert('保存失敗：無法獲取活動 ID，請重試');
    return;
  }
  
  router.push(`/games/switcher?game=${templateId}&activityId=${activity.id}`);
} else {
  // 根據錯誤類型提供更詳細的提示
  if (response.status === 401) {
    alert('保存失敗：請先登入才能保存活動');
  } else if (response.status === 400) {
    alert('保存失敗：' + (errorData.error || '缺少必要字段'));
  }
}
```

**改進**：
- ✅ 驗證 API 返回的 activity.id
- ✅ 防止 `activityId=undefined` 的情況
- ✅ 提供更詳細的錯誤提示

## 🧪 測試步驟

### 1. 驗證 Session 狀態

在瀏覽器控制台執行：
```javascript
const session = await fetch('/api/auth/session').then(r => r.json());
console.log('Session:', session);
console.log('User Email:', session.user?.email);
console.log('User ID:', session.user?.id);
```

### 2. 測試創建活動

1. 登入應用（使用 Google 帳號）
2. 進入創建活動頁面
3. 填寫活動信息和詞彙
4. 點擊"完成並開始遊戲"
5. 檢查是否成功創建活動

### 3. 檢查 API 日誌

在開發服務器日誌中查看：
```
📋 Session callback: { hasToken: true, hasSessionUser: true, tokenId: '...', tokenEmail: '...' }
✅ Session 已更新: { userId: '...', userEmail: '...', userName: '...' }
```

## 📝 相關文件

- `lib/auth.ts` - NextAuth 配置（v54.1）
- `app/create/[templateId]/page.tsx` - 創建活動頁面（v55.0）
- `app/api/activities/route.ts` - 創建活動 API
- `app/api/activities/[id]/route.ts` - 更新活動 API（v53.0）

## 🎯 建議

### 立即行動
1. **重新登入**：登出後重新使用 Google 帳號登入
2. **清除 Cookie**：清除瀏覽器 Cookie 以重置 session
3. **測試創建活動**：嘗試創建新活動

### 未來改進
1. **添加更詳細的日誌**：在 session callback 中添加更多調試信息
2. **改進錯誤處理**：在 API 端點中提供更詳細的錯誤信息
3. **添加 Session 驗證**：在前端添加 session 驗證邏輯

