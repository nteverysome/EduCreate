# EduCreate 技術交接文檔

## 🎯 給新 Agent 的快速指南

### 第一次接手時必讀

1. **閱讀順序**：
   - 先讀 `HANDOVER_DOCUMENT.md`（專案概述）
   - 再讀本文檔（技術細節）
   - 查看 `.augment/rules/` 下的所有規則文檔

2. **立即檢查**：
   - Git 狀態：`git status`
   - 分支：`git branch`（應該在 master）
   - 最新提交：`git log --oneline -5`
   - 部署狀態：訪問 https://edu-create.vercel.app

3. **環境確認**：
   - Node.js 版本：`node -v`（應該 >= 18）
   - npm 版本：`npm -v`
   - 資料庫連接：檢查 `.env.local`

---

## 🔑 關鍵技術決策

### 1. 詞彙數據的三層架構

**為什麼有三種數據來源？**

這是專案演進的結果：

```
時間線：
舊版 → content.vocabularyItems (JSON 字段)
中期 → elements (JSON 字段)
新版 → vocabularyItems (關聯到 VocabularySet 模型)
```

**為什麼不統一？**
- 保持向後兼容性
- 舊活動仍然可以正常運作
- 逐步遷移而非一次性重構

**如何處理？**
使用統一工具函數：`lib/vocabulary/loadVocabularyData.ts`

```typescript
// ✅ 正確做法
import { loadVocabularyData } from '@/lib/vocabulary/loadVocabularyData';

const vocabularyData = await loadVocabularyData(activity);
// 自動處理三種來源，返回標準化格式

// ❌ 錯誤做法
const words = activity.vocabularyItems || activity.elements || activity.content?.vocabularyItems;
// 這樣會遇到空數組問題
```

### 2. 空數組陷阱

**JavaScript 的坑**：
```javascript
const arr = [];
if (arr) {
  console.log('這會執行！'); // 空數組是 truthy
}

if (arr && arr.length > 0) {
  console.log('這才不會執行'); // 正確檢查
}
```

**實際案例**：
```typescript
// 複製活動時，Prisma 創建了空數組
const copiedActivity = await prisma.activity.create({
  data: {
    vocabularyItems: [] // 空數組！
  }
});

// 錯誤檢查
if (copiedActivity.vocabularyItems && Array.isArray(copiedActivity.vocabularyItems)) {
  // 這會匹配！但數組是空的
  return copiedActivity.vocabularyItems; // 返回 []
}

// 正確檢查
if (copiedActivity.vocabularyItems && copiedActivity.vocabularyItems.length > 0) {
  // 這才不會匹配
  return copiedActivity.vocabularyItems;
}
```

**修復位置**：
- `app/create/[templateId]/page.tsx`（編輯頁面）
- `components/activities/WordwallStyleActivityCard.tsx`（活動卡片）
- `lib/vocabulary/loadVocabularyData.ts`（工具函數）

### 3. API 方法的語義

**為什麼需要 PATCH 和 PUT？**

```typescript
// PATCH - 部分更新（只更新指定字段）
PATCH /api/activities/[id]
Body: { title: "新標題" }
// 只更新 title，其他字段不變

// PUT - 完整更新（替換整個資源）
PUT /api/activities/[id]
Body: { title: "新標題", folderId: "xxx", ... }
// 更新多個字段，可能覆蓋其他數據
```

**實際應用**：
- **重新命名**：使用 PATCH（只改標題）
- **拖拽到資料夾**：使用 PUT（改標題和資料夾）
- **完整編輯**：使用 PUT（改多個字段）

### 4. 遊戲模式判斷

**兩種模式**：

```typescript
// 1. 姓名模式（記錄成績）
/games/switcher?game=vocabulary&activityId=xxx&assignmentId=xxx&studentName=xxx

// 2. 匿名模式（不記錄成績）
/games/switcher?game=vocabulary&activityId=xxx
```

**判斷邏輯**：
```typescript
const isNameMode = assignmentId && studentName;
const isAnonymousMode = !assignmentId && !studentName;

if (isNameMode) {
  // 記錄成績到資料庫
  await saveResult({ assignmentId, studentName, score });
}

if (isAnonymousMode) {
  // 只顯示遊戲，不記錄成績
  console.log('匿名模式，不記錄成績');
}
```

---

## 🛠️ 常見開發任務

### 任務 1：添加新的遊戲類型

**步驟**：

1. **更新遊戲類型映射**（`components/activities/WordwallStyleActivityCard.tsx`）：
```typescript
const getGameTypeInfo = (gameType: string): { icon: string; name: string } => {
  const gameTypeMap: { [key: string]: { icon: string; name: string } } = {
    // ... 現有類型
    'new-game': { icon: '🎮', name: '新遊戲' }, // 添加這行
  };
  return gameTypeMap[gameType] || { icon: '🎮', name: gameType || '遊戲' };
};
```

2. **添加遊戲預覽**（`components/activities/GameThumbnailPreview.tsx`）：
```typescript
const renderNewGamePreview = () => (
  <div className="w-full h-full bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
    <div className="text-3xl mb-3">🎮</div>
    {/* 添加預覽內容 */}
  </div>
);

// 在 renderPreview() 中添加判斷
if (gameTypeKey.includes('new-game') || gameTypeKey === '新遊戲') {
  return renderNewGamePreview();
}
```

3. **測試**：
```bash
# 創建測試活動
# 訪問 /my-activities
# 確認預覽顯示正確
```

### 任務 2：修復詞彙載入問題

**診斷步驟**：

1. **檢查數據來源**：
```typescript
console.log('vocabularyItems:', activity.vocabularyItems);
console.log('elements:', activity.elements);
console.log('content:', activity.content);
```

2. **使用工具函數**：
```typescript
import { loadVocabularyData, getSourceDisplayName } from '@/lib/vocabulary/loadVocabularyData';

const { data, source } = await loadVocabularyData(activity);
console.log('載入來源:', getSourceDisplayName(source));
console.log('詞彙數量:', data.length);
```

3. **檢查長度**：
```typescript
if (data.length === 0) {
  console.error('❌ 沒有詞彙數據！');
  // 檢查資料庫
  // 檢查 API 響應
}
```

### 任務 3：添加新的 API 端點

**範例：添加活動統計 API**

1. **創建文件**：`app/api/activities/[id]/stats/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. 驗證用戶
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    // 2. 獲取活動
    const activity = await prisma.activity.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        playCount: true,
        shareCount: true,
        // ... 其他字段
      }
    });

    if (!activity) {
      return NextResponse.json({ error: '活動不存在' }, { status: 404 });
    }

    // 3. 返回統計數據
    return NextResponse.json({
      playCount: activity.playCount,
      shareCount: activity.shareCount,
      // ... 其他統計
    });

  } catch (error) {
    console.error('❌ 獲取統計失敗:', error);
    return NextResponse.json({ error: '服務器錯誤' }, { status: 500 });
  }
}
```

2. **測試 API**：
```bash
# 使用 curl 測試
curl http://localhost:3000/api/activities/xxx/stats

# 或在瀏覽器中訪問
```

3. **在前端調用**：
```typescript
const response = await fetch(`/api/activities/${activityId}/stats`);
const stats = await response.json();
console.log('統計數據:', stats);
```

---

## 🐛 故障排除指南

### 問題 1：詞彙數據不顯示

**症狀**：
- 編輯頁面空白
- 活動卡片彈出框沒有單字
- 遊戲預覽沒有內容

**診斷**：
```typescript
// 1. 檢查 API 響應
const response = await fetch(`/api/activities/${activityId}`);
const data = await response.json();
console.log('API 響應:', data);

// 2. 檢查詞彙字段
console.log('vocabularyItems:', data.vocabularyItems);
console.log('elements:', data.elements);
console.log('content:', data.content);

// 3. 使用工具函數
const vocabularyData = await loadVocabularyData(data);
console.log('載入結果:', vocabularyData);
```

**解決方案**：
1. 確保 API 返回 `elements` 和 `vocabularyItems` 字段
2. 使用 `loadVocabularyData` 工具函數
3. 檢查數組長度（`arr.length > 0`）

### 問題 2：重新命名失敗

**症狀**：
- 點擊重新命名按鈕後顯示錯誤
- 控制台顯示 405 Method Not Allowed

**診斷**：
```typescript
// 檢查 API 路由是否支援 PATCH 方法
// 文件：app/api/activities/[id]/route.ts

// 應該有這個函數
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  // ...
}
```

**解決方案**：
- 確保 API 路由有 PATCH 方法處理器
- 檢查請求方法是否正確（PATCH 而非 PUT）

### 問題 3：瀏覽次數不增加

**症狀**：
- 訪問遊戲頁面後，瀏覽次數沒有變化

**診斷**：
```typescript
// 1. 檢查追蹤 API 是否被調用
// 文件：app/games/switcher/page.tsx
// 在 loadActivityInfo 函數中應該有這段代碼

fetch(`/api/activities/${activityId}/view`, {
  method: 'POST',
}).catch(error => {
  console.error('❌ 增加瀏覽次數失敗:', error);
});

// 2. 檢查 API 是否存在
// 文件：app/api/activities/[id]/view/route.ts
```

**解決方案**：
1. 確保追蹤 API 存在（`app/api/activities/[id]/view/route.ts`）
2. 確保遊戲頁面調用追蹤 API
3. 檢查資料庫 `playCount` 字段是否更新

### 問題 4：遊戲預覽不顯示

**症狀**：
- 活動卡片縮略圖顯示空白或錯誤

**診斷**：
```typescript
// 1. 檢查組件是否正確導入
import GameThumbnailPreview from './GameThumbnailPreview';

// 2. 檢查傳遞的 props
<GameThumbnailPreview
  gameType={activity.gameType}
  vocabularyItems={activity.vocabularyItems}
  activityTitle={activity.title}
/>

// 3. 檢查遊戲類型是否支援
console.log('遊戲類型:', activity.gameType);
```

**解決方案**：
1. 確保 `GameThumbnailPreview.tsx` 文件存在
2. 確保組件正確導入和使用
3. 檢查遊戲類型是否在支援列表中
4. 添加新的遊戲類型預覽（如果需要）

---

## 📋 開發檢查清單

### 每次修改前

- [ ] 閱讀相關的規則文檔（`.augment/rules/`）
- [ ] 使用 `codebase-retrieval` 查找相關代碼
- [ ] 使用 `view` 查看現有實現
- [ ] 確認不會重複開發已存在的功能

### 每次修改後

- [ ] 運行 `diagnostics` 檢查語法錯誤
- [ ] 測試完整的用戶流程（從主頁開始）
- [ ] 檢查是否影響其他功能
- [ ] 更新相關文檔（如果需要）
- [ ] 提交清晰的 commit message

### 每次提交前

- [ ] 檢查 Git 狀態（`git status`）
- [ ] 確認只提交相關文件
- [ ] 寫清楚的 commit message（參考現有格式）
- [ ] 推送到 GitHub（`git push`）
- [ ] 等待 Vercel 部署完成
- [ ] 測試生產環境

---

## 🎓 學習資源

### 專案相關
- Next.js 14 文檔：https://nextjs.org/docs
- Prisma 文檔：https://www.prisma.io/docs
- Tailwind CSS：https://tailwindcss.com/docs

### 記憶科學
- 間隔重複理論
- 主動回憶原理
- 認知負荷理論

### GEPT 分級
- GEPT Kids：基礎 300 字
- GEPT 初級：基礎 1000 字
- GEPT 中級：進階 2000 字
- GEPT 中高級：高級 3000 字

---

## 🚨 緊急聯絡

### 如果遇到無法解決的問題

1. **檢查 Git 歷史**：
```bash
git log --oneline --graph -20
git show <commit-hash>
```

2. **回退到已知良好版本**：
```bash
git reset --hard <commit-hash>
git push -f origin master
```

3. **查看部署日誌**：
- 訪問 Vercel Dashboard
- 查看部署日誌和錯誤信息

4. **資料庫問題**：
```bash
npx prisma studio  # 打開資料庫管理界面
npx prisma db push # 同步資料庫模型
```

---

**文檔版本**：1.0  
**最後更新**：2025-01-18  
**維護者**：EduCreate Team

