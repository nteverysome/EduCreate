# 詞彙載入快速參考

## 🚀 四種模式速查表

| 模式 | URL 示例 | API 端點 | 需要登入 | 保存結果 |
|------|---------|---------|---------|---------|
| 預設詞彙 | `/games/shimozurdo-game/` | 無 | ❌ | ❌ |
| 正常登入 | `/games/switcher?activityId=xxx` | `/api/activities/${activityId}/vocabulary` | ✅ | ✅ |
| 社區分享 | `/share/${activityId}/${shareToken}` | `/api/share/${activityId}/${shareToken}` | ❌ | ❌ |
| 學生遊戲 | `/play/${activityId}/${assignmentId}` | `/api/play/${activityId}/${assignmentId}` | ❌ | ✅ |

## 🔍 問題診斷速查

### 症狀：遊戲載入預設詞彙而非自定義詞彙

**檢查步驟**：

1. **打開瀏覽器控制台**
2. **查找 GameSwitcher 日誌**（應該看到以下之一）：
   ```
   🎓 學生遊戲模式: { activityIdParam: "...", assignmentIdParam: "..." }
   🌍 社區分享模式: { activityIdParam: "...", shareTokenParam: "..." }
   🎯 正常模式: { activityIdParam: "..." }
   ```
3. **查找 GEPTManager 日誌**（應該看到以下之一）：
   ```
   🎓 載入學生遊戲詞彙 (匿名模式): { activityId: "...", assignmentId: "..." }
   🌍 載入分享活動的詞彙 (匿名模式): ...
   🎯 載入特定活動的詞彙: ...
   ```

### 常見問題和解決方案

#### 問題 1：GameSwitcher 日誌正確，GEPTManager 日誌錯誤

**原因**：iframe URL 沒有包含必要參數

**檢查**：
```typescript
// components/games/GameSwitcher.tsx
const getGameUrlWithVocabulary = (game: GameConfig): string => {
  // ⚠️ 確保這部分存在
  if (assignmentId) {
    url += `&assignmentId=${assignmentId}`;
  } else if (isShared && shareToken) {
    url += `&shareToken=${shareToken}&isShared=true`;
  }
}
```

#### 問題 2：GameSwitcher 日誌錯誤

**原因**：URL 參數沒有正確提取或設置

**檢查**：
```typescript
// app/games/switcher/page.tsx
useEffect(() => {
  const assignmentIdParam = searchParams?.get('assignmentId');
  
  if (assignmentIdParam) {
    // ⚠️ 確保設置狀態
    setAssignmentId(assignmentIdParam);
  }
}, [searchParams]);
```

#### 問題 3：API 返回 401

**原因**：使用了需要身份驗證的 API

**解決**：
- 學生模式：使用 `/api/play/${activityId}/${assignmentId}`
- 社區分享：使用 `/api/share/${activityId}/${shareToken}`

## 📋 新遊戲整合檢查清單

### 必須實現的功能

- [ ] **URL 參數檢測**
  ```javascript
  const activityId = urlParams.get('activityId');
  const assignmentId = urlParams.get('assignmentId');
  const shareToken = urlParams.get('shareToken');
  const isShared = urlParams.get('isShared') === 'true';
  ```

- [ ] **API 選擇邏輯**（優先級順序）
  ```javascript
  if (assignmentId) {
    apiUrl = `/api/play/${activityId}/${assignmentId}`;
  } else if (isShared && shareToken) {
    apiUrl = `/api/share/${activityId}/${shareToken}`;
  } else if (activityId) {
    apiUrl = `/api/activities/${activityId}/vocabulary`;
  }
  ```

- [ ] **控制台日誌**
  ```javascript
  console.log('🎓 載入學生遊戲詞彙 (匿名模式):', { activityId, assignmentId });
  console.log('✅ 學生遊戲詞彙載入完成，總共 X 個詞彙');
  ```

- [ ] **API 響應處理**
  ```javascript
  // 處理兩種響應格式
  if (result.activity && result.activity.vocabularyItems) {
    vocabularyItems = result.activity.vocabularyItems;
  } else if (result.vocabularyItems) {
    vocabularyItems = result.vocabularyItems;
  }
  ```

### 測試清單

- [ ] 預設詞彙模式：直接訪問遊戲
- [ ] 正常登入模式：教師登入後玩遊戲
- [ ] 社區分享模式：無痕視窗訪問分享連結
- [ ] 學生遊戲模式：無痕視窗訪問學生連結

## 🎯 關鍵代碼位置

### GameSwitcher 組件
```
components/games/GameSwitcher.tsx
- Props 接口定義（第 31-44 行）
- 參數解構（第 316-329 行）
- getGameUrlWithVocabulary 函數（第 351-377 行）
```

### 遊戲頁面
```
app/games/switcher/page.tsx
- 狀態定義（第 39-44 行）
- useEffect 參數提取（第 108-144 行）
- GameSwitcher 調用（第 602-615 行）
```

### 遊戲詞彙管理器
```
public/games/shimozurdo-game/managers/GEPTManager.js
- loadFromCloud 方法
- URL 參數檢測
- API 選擇邏輯
```

## 💡 最佳實踐

1. **始終遵循參數優先級**：assignmentId > shareToken > activityId
2. **添加詳細的控制台日誌**：方便診斷問題
3. **統一處理 API 響應格式**：兼容兩種格式
4. **完整測試四種模式**：確保所有場景都正常工作
5. **保持代碼一致性**：所有遊戲使用相同的模式

## 📞 需要幫助？

查看完整文檔：`docs/VOCABULARY_LOADING_GUIDE.md`

