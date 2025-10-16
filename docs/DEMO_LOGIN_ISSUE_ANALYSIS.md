# 演示登入問題深度分析報告

## 🔍 問題發現

通過 Playwright 自動化測試發現，演示登入功能存在嚴重的架構問題，導致用戶無法正常使用系統功能。

## 📊 錯誤詳情

### 控制台錯誤
```
[ERROR] Failed to load resource: the server responded with a status of 401 ()
[ERROR] ❌ [FolderApiManager] 获取 activities 资料夹失败: Error: 获取资料夹失败: 401
[ERROR] ❌ 載入資料夾失敗: Error: 获取资料夹失败: 401
```

### 錯誤發生位置
- **API 端點**: `/api/folders?type=activities`
- **HTTP 狀態碼**: 401 Unauthorized
- **觸發場景**: 演示用戶登入後訪問「我的活動」頁面

## 🔬 根本原因分析

### 1. 演示登入的實現方式

**前端實現** (`app/login/page.tsx`):
```typescript
const handleDemoLogin = async () => {
  // 創建演示會話
  const demoSession = {
    user: {
      id: 'demo-user',
      name: '演示用戶',
      email: 'demo@educreate.com',
      role: 'USER'
    }
  };
  
  // 存儲到 localStorage 作為演示
  localStorage.setItem('demo-session', JSON.stringify(demoSession));
  
  // 直接跳轉到目標頁面
  router.push(callbackUrl);
};
```

**問題**:
- ❌ 演示 session 只存儲在瀏覽器的 localStorage 中
- ❌ 後端 API 無法訪問 localStorage
- ❌ 這是一個純前端的模擬登入，沒有後端支持

### 2. 後端 API 的身份驗證方式

**資料夾 API** (`app/api/folders/route.ts`):
```typescript
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }
  // ...
}
```

**問題**:
- ❌ `getServerSession` 只能讀取 NextAuth 的 session
- ❌ 無法讀取 localStorage 中的演示 session
- ❌ 所有需要身份驗證的 API 都會返回 401

### 3. 架構不匹配

```
前端演示登入 (localStorage)
        ↓
    [無法通信]
        ↓
後端 API (NextAuth Session)
```

## 💡 解決方案

### 方案 1: 創建真實的演示用戶（推薦）✅

**優點**:
- ✅ 使用真實的 NextAuth 登入流程
- ✅ 所有 API 都能正常工作
- ✅ 用戶體驗一致
- ✅ 安全性高

**實現步驟**:

1. **在數據庫中創建演示用戶**
```sql
INSERT INTO "User" (id, email, name, password, role, emailVerified)
VALUES (
  'demo-user-id',
  'demo@educreate.com',
  '演示用戶',
  '$2a$10$...',  -- bcrypt hash of 'demo123'
  'USER',
  NOW()
);
```

2. **修改演示登入邏輯**
```typescript
const handleDemoLogin = async () => {
  setIsLoading(true);
  setError('');
  
  try {
    // 使用真實的 NextAuth 登入
    const result = await signIn('credentials', {
      email: 'demo@educreate.com',
      password: 'demo123',
      callbackUrl,
      redirect: false
    });
    
    if (result?.error) {
      setError('演示登入失敗');
    } else if (result?.url) {
      router.push(result.url);
    }
  } catch (error) {
    setError('演示登入失敗');
  } finally {
    setIsLoading(false);
  }
};
```

3. **定期清理演示用戶數據**
```typescript
// 可以添加一個 cron job 每天清理演示用戶的數據
// 或者在演示用戶登入時自動清理舊數據
```

### 方案 2: 修改所有 API 支持演示 session（不推薦）❌

**缺點**:
- ❌ 需要修改所有 API 端點
- ❌ 安全性問題（前端可以偽造 session）
- ❌ 維護成本高
- ❌ 不符合最佳實踐

### 方案 3: 使用 JWT Token（中等推薦）⚠️

**優點**:
- ✅ 可以在前端生成 token
- ✅ 後端可以驗證 token

**缺點**:
- ⚠️ 需要額外的 token 驗證邏輯
- ⚠️ 與 NextAuth 的整合複雜

## 🎯 推薦實施方案

### 立即修復（方案 1）

1. **創建演示用戶遷移腳本**
```typescript
// prisma/seed-demo-user.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('demo123', 10);
  
  await prisma.user.upsert({
    where: { email: 'demo@educreate.com' },
    update: {},
    create: {
      id: 'demo-user-id',
      email: 'demo@educreate.com',
      name: '演示用戶',
      password: hashedPassword,
      role: 'USER',
      emailVerified: new Date(),
    },
  });
  
  console.log('✅ 演示用戶創建成功');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

2. **修改演示登入邏輯**（如上所示）

3. **添加演示用戶數據清理**
```typescript
// app/api/demo/cleanup/route.ts
export async function POST() {
  // 清理演示用戶的所有數據
  await prisma.activity.deleteMany({
    where: { userId: 'demo-user-id' }
  });
  
  await prisma.folder.deleteMany({
    where: { userId: 'demo-user-id' }
  });
  
  // ... 清理其他數據
  
  return NextResponse.json({ success: true });
}
```

## 📈 影響範圍

### 受影響的功能
1. ❌ 我的活動頁面
2. ❌ 我的結果頁面
3. ❌ 創建活動
4. ❌ 資料夾管理
5. ❌ 所有需要身份驗證的功能

### 受影響的 API 端點
- `/api/folders`
- `/api/activities`
- `/api/results`
- `/api/vocabulary`
- 所有需要 `getServerSession` 的端點

## 🚀 實施計劃

### 階段 1: 緊急修復（1 小時）
1. 創建演示用戶遷移腳本
2. 執行遷移創建演示用戶
3. 修改演示登入邏輯
4. 測試驗證

### 階段 2: 優化（2 小時）
1. 添加演示用戶數據清理功能
2. 添加演示用戶使用說明
3. 優化演示用戶體驗

### 階段 3: 監控（持續）
1. 監控演示用戶使用情況
2. 定期清理演示用戶數據
3. 收集用戶反饋

## 📝 測試計劃

### 測試用例
1. ✅ 演示登入成功
2. ✅ 訪問我的活動頁面
3. ✅ 創建新活動
4. ✅ 創建資料夾
5. ✅ 查看我的結果
6. ✅ 登出演示用戶

### Playwright 測試腳本
```typescript
test('演示登入完整流程', async ({ page }) => {
  // 1. 訪問登入頁面
  await page.goto('/login');
  
  // 2. 點擊演示登入
  await page.click('button:has-text("快速演示登入")');
  
  // 3. 等待跳轉到我的活動頁面
  await page.waitForURL('/my-activities');
  
  // 4. 驗證頁面載入成功
  await expect(page.locator('h1:has-text("我的活動")')).toBeVisible();
  
  // 5. 驗證沒有 401 錯誤
  const errors = await page.evaluate(() => {
    return window.console.errors || [];
  });
  expect(errors.filter(e => e.includes('401'))).toHaveLength(0);
});
```

## 🎉 預期結果

修復後：
- ✅ 演示用戶可以正常登入
- ✅ 所有功能都能正常使用
- ✅ 沒有 401 錯誤
- ✅ 用戶體驗流暢
- ✅ 數據安全可控

## 📚 相關文件

- `app/login/page.tsx` - 登入頁面
- `lib/auth.ts` - NextAuth 配置
- `app/api/folders/route.ts` - 資料夾 API
- `components/navigation/UnifiedNavigation.tsx` - 導航組件
- `app/my-activities/page.tsx` - 我的活動頁面

## 🔗 參考資料

- [NextAuth.js 文檔](https://next-auth.js.org/)
- [Prisma 文檔](https://www.prisma.io/docs)
- [Next.js App Router 文檔](https://nextjs.org/docs/app)

