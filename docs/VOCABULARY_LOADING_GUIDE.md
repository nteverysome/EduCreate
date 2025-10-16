# 遊戲詞彙載入完整指南

## 📋 目錄
1. [四種詞彙載入模式](#四種詞彙載入模式)
2. [三層詞彙載入架構](#三層詞彙載入架構)
3. [數據流圖](#數據流圖)
4. [關鍵技術點](#關鍵技術點)
5. [問題診斷方法](#問題診斷方法)
6. [解決方案模式](#解決方案模式)
7. [未來遊戲整合清單](#未來遊戲整合清單)

---

## 四種詞彙載入模式

### 1️⃣ 預設詞彙模式（Default Vocabulary）

**使用場景**：
- 用戶未登入
- 沒有提供任何活動 ID 或參數
- 遊戲的初始體驗模式

**數據來源**：
- 遊戲內建的預設詞彙庫
- 通常是 GEPT 分級的基礎詞彙

**API 端點**：
```
無 API 調用，使用本地數據
```

**URL 參數**：
```
/games/shimozurdo-game/
（無任何參數）
```

**特徵**：
- ✅ 無需登入
- ✅ 無需網絡請求
- ✅ 快速載入
- ❌ 無法自定義詞彙
- ❌ 無法追蹤學習進度

---

### 2️⃣ 正常登入模式（Authenticated Mode）

**使用場景**：
- 教師已登入
- 從 `/my-activities` 點擊「玩遊戲」
- 使用自己創建的活動

**數據來源**：
- 教師創建的活動自定義詞彙
- 需要身份驗證

**API 端點**：
```typescript
GET /api/activities/${activityId}/vocabulary
Authorization: Required (NextAuth Session)
```

**URL 參數**：
```
/games/switcher?game=shimozurdo-game&activityId=cmgsp6j600001l70498z9of5c
```

**數據流**：
```
教師登入
  ↓
/my-activities
  ↓
點擊「玩遊戲」
  ↓
/games/switcher?activityId=...
  ↓
GameSwitcher 檢測 activityId（無 assignmentId、無 shareToken）
  ↓
調用 /api/activities/${activityId}/vocabulary（需要登入）
  ↓
載入自定義詞彙
  ↓
傳遞給遊戲 iframe: /games/shimozurdo-game/?activityId=...&customVocabulary=true
  ↓
GEPTManager 檢測 activityId（無 assignmentId、無 shareToken）
  ↓
調用 /api/activities/${activityId}/vocabulary
  ↓
遊戲使用自定義詞彙
```

**特徵**：
- ✅ 完整的自定義詞彙
- ✅ 可追蹤學習進度
- ✅ 可保存遊戲結果
- ❌ 需要登入
- ❌ 僅限教師自己使用

---

### 3️⃣ 社區分享模式（Community Share Mode）

**使用場景**：
- 教師開啟「社區分享」
- 任何人（包括未登入用戶）可以訪問
- 從 `/my-activities` 的「社區分享」連結訪問

**數據來源**：
- 教師創建的活動自定義詞彙
- 通過 shareToken 驗證，無需登入

**API 端點**：
```typescript
GET /api/share/${activityId}/${shareToken}
Authorization: Not Required (Public Access)

Response:
{
  success: true,
  activity: {
    id: string,
    title: string,
    vocabularyItems: [
      { english: string, chinese: string, ... }
    ]
  }
}
```

**URL 參數**：
```
/share/cmgsp6j600001l70498z9of5c/VlONrLyZqwl94yMA
  ↓ (自動重定向)
/games/switcher?game=shimozurdo-game&activityId=cmgsp6j600001l70498z9of5c&shareToken=VlONrLyZqwl94yMA&isShared=true
```

**數據流**：
```
任何人訪問分享連結
  ↓
/share/${activityId}/${shareToken}
  ↓
自動重定向到遊戲頁面
  ↓
/games/switcher?activityId=...&shareToken=...&isShared=true
  ↓
GameSwitcher 檢測 shareToken 和 isShared
  ↓
調用 /api/share/${activityId}/${shareToken}（無需登入）
  ↓
載入自定義詞彙
  ↓
傳遞給遊戲 iframe: /games/shimozurdo-game/?activityId=...&customVocabulary=true&shareToken=...&isShared=true
  ↓
GEPTManager 檢測 shareToken 和 isShared
  ↓
調用 /api/share/${activityId}/${shareToken}
  ↓
遊戲使用自定義詞彙
```

**特徵**：
- ✅ 完整的自定義詞彙
- ✅ 無需登入
- ✅ 可分享給任何人
- ✅ 支持 QR Code 掃描
- ❌ 不保存遊戲結果
- ❌ 不追蹤學習進度
- ✅ 統計社區遊玩次數

---

### 4️⃣ 學生遊戲模式（Student Assignment Mode）

**使用場景**：
- 教師從 `/my-results` 創建課業
- 學生通過「學生分享連結」訪問
- 學生輸入姓名後開始遊戲

**數據來源**：
- 教師創建的活動自定義詞彙
- 通過 assignmentId 驗證，無需登入

**API 端點**：
```typescript
GET /api/play/${activityId}/${assignmentId}
Authorization: Not Required (Public Access)

Response:
{
  success: true,
  activity: {
    id: string,
    title: string,
    vocabularyItems: [
      { english: string, chinese: string, ... }
    ]
  },
  assignment: {
    id: string,
    activityId: string,
    ...
  }
}
```

**URL 參數**：
```
/play/cmgsp6j600001l70498z9of5c/cmgsp7jc10001l204ljldm3sh
  ↓ (輸入姓名後)
/games/switcher?game=shimozurdo-game&activityId=cmgsp6j600001l70498z9of5c&assignmentId=cmgsp7jc10001l204ljldm3sh&studentName=小明
```

**數據流**：
```
學生訪問分享連結
  ↓
/play/${activityId}/${assignmentId}
  ↓
調用 /api/play/${activityId}/${assignmentId}（無需登入）
  ↓
顯示課業信息和姓名輸入框
  ↓
學生輸入姓名，點擊「開始遊戲」
  ↓
/games/switcher?activityId=...&assignmentId=...&studentName=...
  ↓
GameSwitcher 檢測 assignmentId（優先級最高）
  ↓
調用 /api/play/${activityId}/${assignmentId}（無需登入）
  ↓
載入自定義詞彙
  ↓
傳遞給遊戲 iframe: /games/shimozurdo-game/?activityId=...&customVocabulary=true&assignmentId=...
  ↓
GEPTManager 檢測 assignmentId（優先級最高）
  ↓
調用 /api/play/${activityId}/${assignmentId}
  ↓
遊戲使用自定義詞彙
  ↓
遊戲結束後保存結果到 /api/results
```

**特徵**：
- ✅ 完整的自定義詞彙
- ✅ 無需登入
- ✅ 保存遊戲結果
- ✅ 追蹤學習進度
- ✅ 教師可查看學生成績
- ✅ 支持 QR Code 掃描
- ✅ 學生只需輸入姓名

---

## 三層詞彙載入架構

### 為什麼需要三層？

遊戲詞彙載入涉及三個不同的執行環境：

1. **第一層：遊戲入口頁面**（如 `/play/[activityId]/[assignmentId]/page.tsx`）
   - 負責顯示課業信息
   - 驗證訪問權限
   - 提供用戶輸入界面

2. **第二層：GameSwitcher 組件**（`components/games/GameSwitcher.tsx`）
   - 負責遊戲選擇和切換
   - 載入詞彙數據並傳遞給 iframe
   - 管理遊戲狀態

3. **第三層：遊戲 iframe 內部**（如 `public/games/shimozurdo-game/managers/GEPTManager.js`）
   - 遊戲的實際執行環境
   - 獨立的 JavaScript 上下文
   - 需要自己調用 API 載入詞彙

### 三層架構圖

```
┌─────────────────────────────────────────────────────────────┐
│ 第一層：遊戲入口頁面                                          │
│ /play/[activityId]/[assignmentId]/page.tsx                  │
│                                                              │
│ 職責：                                                       │
│ - 從 URL 提取 activityId 和 assignmentId                    │
│ - 調用 API 載入課業數據                                      │
│ - 顯示課業信息和姓名輸入框                                    │
│ - 跳轉到 GameSwitcher                                       │
│                                                              │
│ API: /api/play/${activityId}/${assignmentId}                │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    傳遞 URL 參數
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 第二層：GameSwitcher 組件                                    │
│ app/games/switcher/page.tsx                                 │
│ components/games/GameSwitcher.tsx                           │
│                                                              │
│ 職責：                                                       │
│ - 從 URL 參數提取 activityId、assignmentId、shareToken      │
│ - 根據參數類型決定使用哪個 API                               │
│ - 調用 API 載入詞彙數據                                      │
│ - 生成 iframe URL 並傳遞參數                                 │
│                                                              │
│ API 選擇邏輯：                                               │
│ if (assignmentId) {                                         │
│   API: /api/play/${activityId}/${assignmentId}             │
│ } else if (shareToken && isShared) {                        │
│   API: /api/share/${activityId}/${shareToken}              │
│ } else if (activityId) {                                    │
│   API: /api/activities/${activityId}/vocabulary            │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    iframe URL 參數
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 第三層：遊戲 iframe 內部                                      │
│ public/games/shimozurdo-game/managers/GEPTManager.js        │
│                                                              │
│ 職責：                                                       │
│ - 從 iframe URL 參數提取 activityId、assignmentId、shareToken│
│ - 根據參數類型決定使用哪個 API                               │
│ - 調用 API 載入詞彙數據                                      │
│ - 將詞彙數據提供給遊戲邏輯                                    │
│                                                              │
│ API 選擇邏輯（與第二層相同）：                                │
│ if (assignmentId) {                                         │
│   API: /api/play/${activityId}/${assignmentId}             │
│ } else if (shareToken && isShared) {                        │
│   API: /api/share/${activityId}/${shareToken}              │
│ } else if (activityId) {                                    │
│   API: /api/activities/${activityId}/vocabulary            │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
```

### 關鍵點：為什麼第二層和第三層都要載入？

**第二層載入的目的**：
- 提供快速的用戶反饋（顯示詞彙數量、活動標題等）
- 驗證數據可用性
- 為未來的功能預留數據（如詞彙預覽）

**第三層載入的目的**：
- 遊戲 iframe 是獨立的執行環境，無法直接訪問父頁面的數據
- 遊戲需要完整的詞彙數據來運行
- 確保遊戲在任何情況下都能正確載入詞彙

**為什麼不能只在第二層載入然後傳遞給第三層？**
- iframe 的 `postMessage` 有大小限制
- 詞彙數據可能很大（數百個單詞）
- API 調用更可靠和標準化
- 避免跨域通信的複雜性

---

## 關鍵技術點

### 1. URL 參數優先級

在 `GameSwitcher` 和 `GEPTManager` 中，參數檢測的優先級非常重要：

```typescript
// ✅ 正確的優先級順序
if (assignmentId) {
  // 學生遊戲模式（優先級最高）
  apiUrl = `/api/play/${activityId}/${assignmentId}`;
}
else if (isShared && shareToken) {
  // 社區分享模式（優先級第二）
  apiUrl = `/api/share/${activityId}/${shareToken}`;
}
else if (activityId) {
  // 正常登入模式（優先級最低）
  apiUrl = `/api/activities/${activityId}/vocabulary`;
}
else {
  // 預設詞彙模式
  // 使用本地數據
}
```

**為什麼這個順序很重要？**
- `assignmentId` 是最具體的標識符，代表特定的課業
- `shareToken` 是公開分享的標識符
- `activityId` 單獨存在時代表教師自己的活動
- 如果順序錯誤，可能會使用錯誤的 API 端點

### 2. API 響應格式統一

不同的 API 端點返回不同的響應格式，需要統一處理：

```typescript
// 正常模式 API 響應
{
  vocabularyItems: [...],
  activity: {...}
}

// 分享模式和學生模式 API 響應
{
  success: true,
  activity: {
    vocabularyItems: [...]
  }
}
```

**處理方式**：

```typescript
const response = await fetch(apiUrl);
const result = await response.json();

// 統一處理兩種格式
let vocabularyItems;
if (result.activity && result.activity.vocabularyItems) {
  // 分享模式或學生模式
  vocabularyItems = result.activity.vocabularyItems;
} else if (result.vocabularyItems) {
  // 正常模式
  vocabularyItems = result.vocabularyItems;
}
```

### 3. Props 傳遞鏈

確保參數在整個組件鏈中正確傳遞：

```typescript
// 1. 定義 Props 接口
interface GameSwitcherProps {
  activityId?: string | null;
  shareToken?: string | null;
  isShared?: boolean;
  assignmentId?: string | null;  // ⚠️ 不要忘記添加
}

// 2. 組件參數解構
const GameSwitcher: React.FC<GameSwitcherProps> = ({
  activityId = null,
  shareToken = null,
  isShared = false,
  assignmentId = null  // ⚠️ 不要忘記添加
}) => {

// 3. 使用參數
const getGameUrlWithVocabulary = (game: GameConfig): string => {
  if (assignmentId) {  // ⚠️ 確保使用
    url += `&assignmentId=${assignmentId}`;
  }
}

// 4. 傳遞給子組件
<GameSwitcher
  activityId={activityId}
  shareToken={shareToken}
  isShared={isShared}
  assignmentId={assignmentId}  // ⚠️ 不要忘記傳遞
/>
```

### 4. iframe URL 參數傳遞

確保 iframe URL 包含所有必要的參數：

```typescript
// ❌ 錯誤：只傳遞 activityId
const url = `/games/shimozurdo-game/?activityId=${activityId}&customVocabulary=true`;

// ✅ 正確：根據模式傳遞相應參數
let url = `/games/shimozurdo-game/?activityId=${activityId}&customVocabulary=true`;
if (assignmentId) {
  url += `&assignmentId=${assignmentId}`;
} else if (shareToken && isShared) {
  url += `&shareToken=${shareToken}&isShared=true`;
}
```

---

## 問題診斷方法

### 診斷流程圖

```
遊戲載入錯誤的詞彙
        ↓
檢查瀏覽器控制台
        ↓
┌───────┴───────┐
│               │
第二層日誌      第三層日誌
（GameSwitcher）（GEPTManager）
│               │
└───────┬───────┘
        ↓
確定哪一層出問題
```

### 第一步：檢查控制台日誌

**GameSwitcher 日誌**（第二層）：
```javascript
// 應該看到以下日誌之一：
🎓 學生遊戲模式: { activityIdParam: "...", assignmentIdParam: "..." }
🌍 社區分享模式: { activityIdParam: "...", shareTokenParam: "..." }
🎯 正常模式: { activityIdParam: "..." }

// 然後是：
🎓 載入學生遊戲詞彙: { activityId: "...", assignmentId: "..." }
✅ 成功載入學生遊戲詞彙: [...]

// 最後是：
🎓 學生遊戲模式 URL: /games/shimozurdo-game/?activityId=...&customVocabulary=true&assignmentId=...
```

**GEPTManager 日誌**（第三層）：
```javascript
// 應該看到以下日誌之一：
🎓 載入學生遊戲詞彙 (匿名模式): { activityId: "...", assignmentId: "..." }
🌍 載入分享活動的詞彙 (匿名模式): ...
🎯 載入特定活動的詞彙: ...

// 然後是：
🎓 載入學生遊戲詞彙: ... (3 個詞彙)
✅ 學生遊戲詞彙載入完成，總共 3 個詞彙
```

### 第二步：診斷常見問題

#### 問題 1：第二層日誌正確，但第三層日誌錯誤

**症狀**：
```
✅ GameSwitcher: 🎓 學生遊戲模式
❌ GEPTManager: 🎯 載入特定活動的詞彙（應該是學生模式）
```

**原因**：
- iframe URL 沒有包含 `assignmentId` 參數
- `getGameUrlWithVocabulary` 函數沒有正確添加參數

**解決方案**：
```typescript
// 檢查 getGameUrlWithVocabulary 函數
const getGameUrlWithVocabulary = (game: GameConfig): string => {
  let url = game.url;
  if (customVocabulary.length > 0 && activityId) {
    const separator = url.includes('?') ? '&' : '?';
    url += `${separator}activityId=${activityId}&customVocabulary=true`;
    
    // ⚠️ 確保這部分存在
    if (assignmentId) {
      url += `&assignmentId=${assignmentId}`;
    }
  }
  return url;
};
```

#### 問題 2：第二層和第三層日誌都錯誤

**症狀**：
```
❌ GameSwitcher: 🎯 正常模式（應該是學生模式）
❌ GEPTManager: 🎯 載入特定活動的詞彙（應該是學生模式）
```

**原因**：
- URL 參數沒有正確傳遞到 GameSwitcher
- `assignmentId` 狀態沒有設置

**解決方案**：
```typescript
// 檢查 useEffect 中的參數提取
useEffect(() => {
  const assignmentIdParam = searchParams?.get('assignmentId');
  
  if (assignmentIdParam) {
    // ⚠️ 確保設置狀態
    setAssignmentId(assignmentIdParam);
  }
}, [searchParams]);
```

#### 問題 3：API 返回 401 Unauthorized

**症狀**：
```
❌ Failed to load resource: the server responded with a status of 401
```

**原因**：
- 使用了需要身份驗證的 API 端點
- 應該使用公開的 API 端點

**解決方案**：
```typescript
// ❌ 錯誤：使用需要登入的 API
const response = await fetch(`/api/activities/${activityId}/vocabulary`);

// ✅ 正確：使用公開的 API
const response = await fetch(`/api/play/${activityId}/${assignmentId}`);
```

---

## 未來遊戲整合清單

當添加新遊戲時，確保完成以下檢查清單：

### ✅ 遊戲整合檢查清單

#### 1. 遊戲配置
- [ ] 在 `GameSwitcher` 的 `BASE_GAMES_CONFIG` 中添加遊戲配置
- [ ] 設置正確的遊戲 URL
- [ ] 設置遊戲類型（main/iframe/vite/component）

#### 2. 詞彙管理器
- [ ] 創建或修改遊戲的詞彙管理器（如 `GEPTManager.js`）
- [ ] 實現 `loadFromCloud()` 方法
- [ ] 添加 URL 參數檢測邏輯：
  ```javascript
  const activityId = urlParams.get('activityId');
  const assignmentId = urlParams.get('assignmentId');
  const shareToken = urlParams.get('shareToken');
  const isShared = urlParams.get('isShared') === 'true';
  ```
- [ ] 實現 API 選擇邏輯（優先級：assignmentId > shareToken > activityId）
- [ ] 處理兩種不同的 API 響應格式

#### 3. 控制台日誌
- [ ] 添加模式檢測日誌：
  ```javascript
  if (assignmentId) {
    console.log('🎓 載入學生遊戲詞彙 (匿名模式):', { activityId, assignmentId });
  } else if (isShared && shareToken) {
    console.log('🌍 載入分享活動的詞彙 (匿名模式):', activityId);
  } else {
    console.log('🎯 載入特定活動的詞彙:', activityId);
  }
  ```
- [ ] 添加詞彙載入成功日誌
- [ ] 添加錯誤處理日誌

#### 4. 測試四種模式
- [ ] **預設詞彙模式**：直接訪問遊戲 URL，無任何參數
- [ ] **正常登入模式**：教師登入後從 `/my-activities` 玩遊戲
- [ ] **社區分享模式**：使用分享連結訪問（無痕視窗）
- [ ] **學生遊戲模式**：使用學生分享連結訪問（無痕視窗）

#### 5. 驗證詞彙載入
- [ ] 檢查瀏覽器控制台日誌
- [ ] 確認 API 調用使用正確的端點
- [ ] 確認遊戲使用正確的詞彙（不是預設詞彙）
- [ ] 測試詞彙數量是否正確

#### 6. 結果保存（僅學生模式）
- [ ] 實現結果收集器整合
- [ ] 測試遊戲結束後結果是否正確保存
- [ ] 確認教師可以在 `/my-results` 查看學生成績

---

## 總結

### 核心概念

1. **四種模式，四種數據流**
   - 每種模式有不同的 API 端點和參數
   - 優先級順序很重要

2. **三層架構，三次載入**
   - 每一層都有自己的職責
   - 第二層和第三層都需要載入詞彙

3. **參數傳遞鏈完整性**
   - Props 接口定義
   - 組件參數解構
   - 狀態設置
   - URL 參數傳遞
   - iframe 參數接收

4. **診斷從日誌開始**
   - 控制台日誌是最好的診斷工具
   - 分層檢查，逐層排查

### 最佳實踐

1. **始終添加詳細的控制台日誌**
2. **統一 API 響應格式處理**
3. **遵循參數優先級順序**
4. **完整測試四種模式**
5. **保持代碼一致性**

---

**文檔版本**：1.0  
**最後更新**：2025-10-16  
**維護者**：EduCreate 開發團隊

