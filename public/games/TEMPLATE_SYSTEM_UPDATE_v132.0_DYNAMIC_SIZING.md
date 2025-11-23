# 模板系統更新 - v132.0 動態卡片尺寸調整

## 📅 更新日期
2025-11-23

## 🎯 更新目的
將 match-up-game 的 v132.0 **動態卡片尺寸調整系統**應用到遊戲模板中，實現根據容器寬度和高度自動調整卡片尺寸的響應式設計。

---

## ✅ 核心創新

### 🔥 v132.0 - 雙軸動態縮放系統

**分別計算水平和垂直縮放因子，實現完全響應式設計：**

#### 1️⃣ 水平縮放因子（寬度）
```javascript
// 計算容器利用率
const containerUtilization = cardWidth / usableContainerWidth;

if (cardWidth > usableContainerWidth) {
    // 卡片超出容器，自動縮小以適應
    horizontalScaleFactor = usableContainerWidth / cardWidth;
} else if (containerUtilization > 0.85) {
    horizontalScaleFactor = 1.0;   // 保持當前大小
} else if (containerUtilization > 0.70) {
    horizontalScaleFactor = 0.95;  // 適度縮小
} else {
    horizontalScaleFactor = 0.85;  // 進一步縮小
}
```

#### 2️⃣ 垂直縮放因子（高度）
```javascript
// 計算垂直利用率
const verticalUtilization = (cardHeight * itemCount + spacing * (itemCount - 1)) / availableHeight;

if (verticalUtilization > 0.95) {
    verticalScaleFactor = 0.9;     // 縮小 10%
} else if (verticalUtilization > 0.85) {
    verticalScaleFactor = 1.0;     // 保持當前
} else if (verticalUtilization > 0.70) {
    verticalScaleFactor = 1.1;     // 增加 10%
} else if (verticalUtilization > 0.50) {
    verticalScaleFactor = 1.2;     // 增加 20%
} else {
    verticalScaleFactor = 1.3;     // 增加 30%
}
```

#### 3️⃣ 應用縮放因子
```javascript
// 分別應用水平和垂直縮放因子
cardWidth = cardWidth * horizontalScaleFactor;
cardHeight = cardHeight * verticalScaleFactor;
fontSize = Math.round(fontSize * Math.max(horizontalScaleFactor, verticalScaleFactor));
```

---

## 📊 實際效果

### 5 卡片佈局示例
| 項目 | 值 |
|------|-----|
| 原始卡片寬度 | 300px |
| 可用容器寬度 | 160px |
| 水平縮放因子 | 0.533x |
| **最終寬度** | **160px** |
| 垂直利用率 | 60% |
| 垂直縮放因子 | 1.2x |
| **最終高度** | **46px** |
| **字體大小** | **20px** |

---

## 🚀 優勢

✅ **完全自動化** - 無需手動調整縮放因子
✅ **智能適應** - 根據容器大小自動計算最優尺寸
✅ **雙軸平衡** - 同時考慮寬度和高度
✅ **充分利用空間** - 卡片高度根據可用空間自動增加
✅ **適用所有卡片數量** - 3、4、5、7、10、20 都能自動調整
✅ **響應式完美** - 在不同屏幕尺寸上都能找到最優尺寸

---

## 📝 實現位置

**文件**: `public/games/match-up-game/scenes/game.js`
**行數**: 2150-2227
**版本**: v132.0

---

## 🔄 版本歷史

| 版本 | 日期 | 說明 |
|------|------|------|
| v132.0 | 2025-11-23 | 雙軸動態縮放系統 |
| v131.0 | 2025-11-23 | 容器寬度動態調整 |
| v130.0 | 2025-11-23 | 卡片縮小 25% |
| v129.0 | 2025-11-23 | 恢復 46a3376 佈局邏輯 |

---

## 🎯 下一步建議

1. **應用到其他遊戲** - 將此系統應用到其他需要響應式卡片的遊戲
2. **模板集成** - 將此邏輯集成到 `_template/scenes/game.js`
3. **文檔更新** - 更新開發指南，說明動態尺寸調整的最佳實踐
4. **測試驗證** - 在不同螢幕尺寸下測試所有遊戲

