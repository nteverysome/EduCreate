# 分離模式優化路線圖

## 📅 項目時間表

**總計**：8-12 小時  
**難度**：中等  
**風險**：低（可逐步實施）

---

## 🚀 Phase 1：準備階段（1-2 小時）

### 任務 1.1：分析當前代碼
- [ ] 確認所有分離模式的實現位置
- [ ] 列出所有硬編碼的常量
- [ ] 識別所有計算邏輯

**代碼位置**：
- 分離模式入口：第 1587-1604 行
- 左右單列佈局：第 1606-1751 行
- 左右多行佈局：第 1877-2039 行
- 上下多行佈局：第 2040-2200 行

### 任務 1.2：創建測試用例
- [ ] 創建 5 種設備類型的測試
- [ ] 創建不同卡片數量的測試（3-5, 6-20, 21-30）
- [ ] 創建不同文字長度的測試

**測試設備**：
- iPhone 12 (390×844)
- iPhone 14 Pro (393×852)
- iPad (768×1024)
- iPad Pro (1024×1366)
- Desktop (1920×1080)

---

## 🔧 Phase 2：提取常量（1-2 小時）

### 任務 2.1：提取設備配置
```javascript
// 創建新文件：separated-mode-config.js
const SEPARATED_MODE_CONFIG = {
    'mobile-portrait': { ... },
    'mobile-landscape': { ... },
    'tablet-portrait': { ... },
    'tablet-landscape': { ... },
    'desktop': { ... }
};
```

### 任務 2.2：提取卡片配置
```javascript
const CARD_CONFIG = {
    cardWidth: { min, max, ratio },
    cardHeight: { min, max, ratio },
    spacing: { horizontal, vertical },
    margins: { top, bottom, left, right }
};
```

### 任務 2.3：提取計算常量
```javascript
const CALCULATION_CONSTANTS = {
    minCardWidth: 60,
    spacing: 10,
    horizontalMargin: 30,
    minCardHeight: 50,
    verticalMargin: 30
};
```

---

## 📦 Phase 3：創建計算類（2-3 小時）

### 任務 3.1：創建 DeviceDetector 類
```javascript
class DeviceDetector {
    static getDeviceType(width, height) { ... }
    static getScreenSize(width, height) { ... }
    static isIPad(width, height) { ... }
}
```

### 任務 3.2：創建 SeparatedModeConfig 類
```javascript
class SeparatedModeConfig {
    static get(deviceType) { ... }
    static calculateCardSize(...) { ... }
}
```

### 任務 3.3：創建 SeparatedLayoutCalculator 類
```javascript
class SeparatedLayoutCalculator {
    constructor(width, height, itemCount, layoutType) { ... }
    calculatePositions() { ... }
    calculateCardSize() { ... }
    calculateFontSize(...) { ... }
    getLayoutVariant() { ... }
}
```

---

## 🔄 Phase 4：重構實現（3-4 小時）

### 任務 4.1：重構 createLeftRightSingleColumn
- [ ] 替換硬編碼的設備檢測
- [ ] 使用 SeparatedModeConfig 替換卡片尺寸計算
- [ ] 使用 SeparatedLayoutCalculator 替換位置計算
- [ ] 簡化代碼邏輯

### 任務 4.2：重構 createLeftRightMultiRows
- [ ] 應用相同的優化
- [ ] 確保與 createLeftRightSingleColumn 一致

### 任務 4.3：重構 createTopBottomMultiRows
- [ ] 應用相同的優化
- [ ] 支持多列佈局

### 任務 4.4：創建 SeparatedLayoutRenderer 類
```javascript
class SeparatedLayoutRenderer {
    constructor(scene, width, height) { ... }
    render(pairs, layoutType) { ... }
    renderLeftRightSingleColumn(...) { ... }
    renderLeftRightMultiRows(...) { ... }
    renderTopBottomMultiRows(...) { ... }
}
```

---

## ✅ Phase 5：測試和驗證（2-3 小時）

### 任務 5.1：單元測試
- [ ] 測試 DeviceDetector
- [ ] 測試 SeparatedModeConfig
- [ ] 測試 SeparatedLayoutCalculator

### 任務 5.2：集成測試
- [ ] 測試 5 種設備類型
- [ ] 測試不同卡片數量（3-5, 6-20, 21-30）
- [ ] 測試不同文字長度

### 任務 5.3：性能測試
- [ ] 測試計算時間（目標：< 30ms）
- [ ] 測試內存使用
- [ ] 測試幀率

### 任務 5.4：視覺測試
- [ ] 確保卡片不被裁切
- [ ] 確保字體大小合適
- [ ] 確保佈局美觀
- [ ] 確保與混合模式風格一致

---

## 📊 驗收標準

### 功能驗收
- ✅ 所有設備類型都能正確支持
- ✅ 卡片尺寸在所有分辨率上都合適
- ✅ 字體大小在所有文字長度上都合適
- ✅ 卡片不會被裁切
- ✅ 與混合模式風格一致

### 性能驗收
- ✅ 計算時間減少 80% 以上（125ms → 25ms）
- ✅ 代碼行數減少 50% 以上（600+ → 250）
- ✅ 圈複雜度降低 75% 以上（15 → 4）

### 代碼質量驗收
- ✅ 所有代碼都有註釋
- ✅ 所有函數都有文檔
- ✅ 所有測試都通過
- ✅ 代碼風格與混合模式一致

---

## 🎯 里程碑

| 里程碑 | 時間 | 狀態 |
|-------|------|------|
| Phase 1 完成 | 1-2h | ⏳ |
| Phase 2 完成 | 1-2h | ⏳ |
| Phase 3 完成 | 2-3h | ⏳ |
| Phase 4 完成 | 3-4h | ⏳ |
| Phase 5 完成 | 2-3h | ⏳ |
| **項目完成** | **8-12h** | ⏳ |

---

## 📝 注意事項

1. **向後兼容性**
   - 確保新代碼與現有代碼兼容
   - 逐步遷移，不要一次性替換
   - 保留舊函數作為備份

2. **測試覆蓋**
   - 在每個 Phase 後進行測試
   - 確保沒有回歸
   - 測試所有設備類型

3. **文檔更新**
   - 更新代碼註釋
   - 更新 API 文檔
   - 更新使用示例

4. **性能監控**
   - 在生產環境中監控性能
   - 收集用戶反饋
   - 持續優化

---

## 🔗 相關文檔

- SEPARATED_MODE_DEEP_ANALYSIS.md - 深度分析
- SEPARATED_MODE_IMPLEMENTATION_GUIDE.md - 實現指南
- HYBRID_MODE_ANALYSIS_SUMMARY.md - 混合模式參考
- HYBRID_MODE_IMPLEMENTATION_DETAILS.md - 架構設計參考

