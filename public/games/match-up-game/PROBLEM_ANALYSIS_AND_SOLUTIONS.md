# Match-Up Game 問題分析與解決方案總結

## 🎯 您遇到的問題

**症狀**：
- ❌ 縮小到工作列或換分頁就重新載入詞彙
- ❌ 卡片順序被重新洗牌
- ❌ 已配對狀態丟失
- ❌ 顯示「載入詞彙中…」

**特點**：
- ✅ 本地環境正常
- ❌ 生產環境有問題
- ✅ 修復後本地和生產都正常

---

## 🔍 根本原因分析

您遇到的問題實際上有 **多個不同的根本原因**，需要在不同層級進行修復。

### 問題 1：React 組件卸載（v102.0-v102.2）

**根本原因**：當 `customVocabulary` 改變時，改變了 `gameKey`，導致 GameSwitcher 組件被卸載和重新掛載。

**症狀**：
- 換標籤時重新載入詞彙
- 縮小到工作列時重新載入詞彙
- 卡片順序被重新洗牌
- 已配對狀態丟失

**修復層級**：三層修復

#### 第一層：Phaser 配置層級（v102.0）
```javascript
// config.js
pauseOnBlur: false  // 禁用失焦時自動暫停
```

#### 第二層：Phaser 場景層級（v102.1）
```javascript
// scenes/handler.js
this.scene.launch('PreloadScene');  // 使用 launch() 而非 start()
```

#### 第三層：React 組件層級（v102.2）⭐ 關鍵
```javascript
// app/games/switcher/page.tsx
// 移除在 customVocabulary 改變時改變 gameKey 的邏輯
// 讓 iframe src 自動更新
```

### 問題 2：useEffect 無限循環（v102.5）

**根本原因**：useEffect 的依賴項中包含了函數，該函數本身也有依賴項。當這些依賴項改變時，導致無限循環。

**症狀**：
- 頁面加載時重新初始化
- 本地和生產都出現問題
- Console 中看到重複的日誌

**修復方法**：移除函數從 useEffect 的依賴項

```javascript
// 修復前
}, [searchParams, loadActivityInfo]);  // ❌ 包含函數

// 修復後
}, [searchParams]);  // ✅ 移除函數
```

---

## 📊 問題對應表

| 問題 | 根本原因 | 修復方法 | 版本 |
|------|---------|--------|------|
| 換標籤重新載入 | React 組件卸載 | 移除 gameKey 改變邏輯 | v102.2 |
| 縮小到工作列重新載入 | Phaser pauseOnBlur | 添加 `pauseOnBlur: false` | v102.0 |
| 場景被重複重啟 | scene.start() 而非 launch() | 使用 `scene.launch()` | v102.1 |
| 頁面加載時重新初始化 | useEffect 無限循環 | 移除函數從依賴項 | v102.5 |

---

## 🎯 為什麼本地正常，生產有問題？

### v102.0-v102.2 問題
- **本地環境**：用戶已登錄，`customVocabulary` 不改變
- **生產環境**：`customVocabulary` 從 null 變為已加載，導致 gameKey 改變

### v102.5 問題
- **本地環境**：session 從一開始就存在，不改變
- **生產環境**：session 從 null 變為已登錄，導致 `loadActivityInfo` 被重新創建，導致 useEffect 無限循環

---

## ✅ 完整修復清單

### v102.0 修復
- ✅ config.js：添加 `pauseOnBlur: false`
- ✅ Handler：添加頁面可見性處理
- ✅ PreloadScene：檢查 GameScene 是否已運行

### v102.1 修復
- ✅ Handler：使用 `scene.launch()` 啟動背景場景

### v102.2 修復（關鍵）
- ✅ app/games/switcher/page.tsx：移除 gameKey 改變邏輯

### v102.3 修復
- ✅ components/games/GameSwitcher.tsx：支援 localStorage 快取

### v102.4 修復
- ✅ components/games/GameSwitcher.tsx：添加 vocabUpdateTrigger 機制

### v102.5 修復（完整）
- ✅ app/games/switcher/page.tsx：移除第 744 行的 loadActivityInfo 依賴項
- ✅ app/games/switcher/page.tsx：移除第 756 行的 loadActivityInfo 依賴項

---

## 📚 詳細文檔

### 三層修復詳解
**文件**：`V102_COMPLETE_FIX_REPORT.md`
- 詳細說明 v102.0-v102.2 的三層修復
- 為什麼 v102.2 是關鍵修復
- iframe src 如何自動更新

### useEffect 無限循環修復詳解
**文件**：`V102_5_PRODUCTION_FIX_REPORT.md`
- useEffect 無限循環的根本原因
- 為什麼只在生產環境出現
- 修復前後的對比

### 通用除錯指南
**文件**：`docs/DEBUGGING_GUIDE_USEEFFECT_INFINITE_LOOP.md`
- 如何診斷 useEffect 無限循環
- 三種修復方案
- 症狀對應表
- 診斷流程圖

---

## 🎓 其他遊戲如何避免這些問題？

### 1. 避免在 useEffect 依賴項中包含函數
```javascript
// ❌ 不好
useEffect(() => {
  loadData();
}, [loadData]);

// ✅ 好
useEffect(() => {
  loadData();
}, []);
```

### 2. 避免改變 gameKey 來觸發重新加載
```javascript
// ❌ 不好
useEffect(() => {
  if (customVocabulary.length > 0) {
    setGameKey(prev => prev + 1);  // 導致組件卸載
  }
}, [customVocabulary]);

// ✅ 好
// 讓 iframe src 自動更新
<iframe src={getGameUrlWithVocabulary(currentGame)} />
```

### 3. 檢查 Phaser 配置
```javascript
// ✅ 推薦配置
export const config = {
  pauseOnBlur: false,  // 禁用失焦時自動暫停
  // ... 其他配置
};
```

### 4. 使用 scene.launch() 而非 scene.start()
```javascript
// ❌ 不好
this.scene.start('GameScene');  // 銷毀並重建場景

// ✅ 好
this.scene.launch('GameScene');  // 啟動場景而不銷毀
```

---

## 🧪 驗證步驟

1. **第一次載入**
   - 正常顯示「載入詞彙中…」

2. **配對幾組卡片**
   - 產生已配對狀態

3. **切換標籤測試**
   - 切到別的標籤，等 2 秒
   - 切回來
   - **預期**：不顯示「載入詞彙中…」

4. **最小化測試**
   - 最小化到工作列，等 2 秒
   - 恢復視窗
   - **預期**：不顯示「載入詞彙中…」

5. **Console 檢查**
   - 應該看到：`🔧 Handler: 啟動背景場景 PreloadScene`
   - 不應該看到：`🎮 GameScene: 創建白色背景和載入文字`（除非第一次）

---

## 📞 需要幫助？

如果其他遊戲遇到類似問題：

1. 查看本文檔的「問題對應表」
2. 根據症狀找到對應的根本原因
3. 參考「完整修復清單」中的修復方法
4. 查看詳細文檔了解具體實現
5. 按照「驗證步驟」測試修復

---

**最後更新**: 2025-11-08
**狀態**: ✅ 已驗證和測試
**相關版本**: v102.0-v102.5

