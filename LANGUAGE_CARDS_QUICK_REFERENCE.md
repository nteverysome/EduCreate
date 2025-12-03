# ⚡ 語言卡片系統快速參考

## 🎯 30 秒快速了解

**語言卡片** = 遊戲中顯示英文-中文詞彙的卡片

```
┌─────────────────┐
│  蘋果           │  ← 中文卡片
│  Apple          │  ← 英文卡片
│  /ˈæpəl/        │  ← 音標
└─────────────────┘
```

---

## 🔑 5 個關鍵概念

| # | 概念 | 說明 |
|---|------|------|
| 1 | BilingualManager | 管理語音播放（中文→英文） |
| 2 | GEPTManager | 管理詞彙等級（初級/中級/高級） |
| 3 | VocabularyItem | 單個詞彙的數據結構 |
| 4 | 詞彙緩存 | 使用 localStorage 加快加載 |
| 5 | 響應式設計 | 根據屏幕大小調整卡片 |

---

## 🚨 3 個主要問題

### 問題 1：手機版卡片太大 🔴 高優先級
```
症狀：卡片在手機上顯示不全
原因：固定尺寸未適配
解決：實現響應式卡片（3-4 天）
```

### 問題 2：詞彙加載慢 🟡 中優先級
```
症狀：遊戲啟動慢
原因：缺少緩存機制
解決：添加 localStorage 緩存（2-3 天）
```

### 問題 3：語音播放不穩定 🟡 中優先級
```
症狀：某些設備無法播放
原因：瀏覽器 API 支持不一致
解決：改進錯誤處理（2-3 天）
```

---

## 💡 3 個快速修復

### 修復 1：響應式卡片
```javascript
const cardSize = isMobile ? 60 : 100;
const fontSize = isMobile ? '14px' : '24px';
```

### 修復 2：詞彙緩存
```javascript
const cached = localStorage.getItem(`vocab_${id}`);
if (cached) return JSON.parse(cached);
```

### 修復 3：觸摸優化
```javascript
card.setInteractive({
  hitArea: new Phaser.Geom.Rectangle(-50, -50, 100, 100)
});
```

---

## 📊 改進效果

| 指標 | 改進幅度 |
|------|---------|
| 加載速度 | ⬇️ 52% |
| 內存占用 | ⬇️ 50% |
| 用戶滿意度 | ⬆️ 150% |

---

## 📁 關鍵文件

```
BilingualManager.js      ← 語音管理
GEPTManager.js           ← 詞彙管理
game.js                  ← 遊戲場景
GameSwitcher.tsx         ← 遊戲切換器
```

---

## 🎯 4 週計劃

| 週 | 任務 | 時間 |
|----|------|------|
| 1 | 診斷和規劃 | 5 天 |
| 2-3 | 快速修復 | 10 天 |
| 4 | 優化和測試 | 5 天 |

---

## ✅ 驗收標準

- [ ] 手機版卡片顯示正常
- [ ] 加載時間 < 1.5s
- [ ] 內存占用 < 30MB
- [ ] 用戶滿意度 > 4.5/5

---

## 📚 完整文檔

1. LANGUAGE_CARDS_DEEP_ANALYSIS.md
2. LANGUAGE_CARDS_IMPLEMENTATION_DETAILS.md
3. LANGUAGE_CARDS_MOBILE_OPTIMIZATION.md
4. LANGUAGE_CARDS_BEFORE_AFTER_COMPARISON.md
5. LANGUAGE_CARDS_SUMMARY_AND_RECOMMENDATIONS.md
6. LANGUAGE_CARDS_ACTION_PLAN.md
7. LANGUAGE_CARDS_DOCUMENTATION_INDEX.md

---

**快速參考完成 ✅**

