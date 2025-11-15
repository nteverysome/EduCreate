# 業界標準容器感知響應式系統

## 📋 系統概述

Speaking Cards 遊戲採用**業界標準的容器感知響應式系統**，能夠根據實際容器大小動態調整卡片尺寸、間距、字體等所有佈局元素。

### 核心特性

✅ **6 級容器斷點系統**：從超小手機到寬屏桌面  
✅ **方向感知**：自動偵測直向/橫向並調整佈局  
✅ **動態 Padding 和 Gap**：根據容器大小智能調整間距  
✅ **智能卡片尺寸計算**：考慮最小/最大值和可讀性  
✅ **響應式字體系統**：字體大小隨容器縮放  
✅ **性能優化**：100ms 防抖機制  
✅ **詳細日誌**：完整的調試信息  

---

## 🎯 容器斷點系統

### 6 級斷點定義

| 斷點 | 容器寬度範圍 | 描述 | 典型設備 |
|------|-------------|------|---------|
| **xs** | 0 - 374px | 超小容器 | iPhone SE, 小手機 |
| **sm** | 375 - 639px | 小容器 | iPhone 14, 標準手機 |
| **md** | 640 - 767px | 中容器 | 大手機, 小平板 |
| **lg** | 768 - 1023px | 大容器 | iPad, 平板 |
| **xl** | 1024 - 1279px | 超大容器 | 桌面, 筆記本 |
| **xxl** | 1280px+ | 超超大容器 | 寬屏, 大顯示器 |

### 與傳統斷點的區別

**傳統響應式系統**：基於 `window.innerWidth`（視口寬度）  
**容器響應式系統**：基於實際容器寬度（更精確）

```
視口寬度 (window.innerWidth)
    ↓
實際容器寬度 (container.getBoundingClientRect().width)
    ↓
可用寬度 (容器寬度 - padding)
    ↓
卡片寬度 (可用寬度 × 比例)
```

---

## 📐 設計令牌系統

### 1. 卡片尺寸

```typescript
cardSize: {
  minWidth: 140,      // 最小寬度（保證可讀性）
  maxWidth: 400,      // 最大寬度（避免過大）
  aspectRatio: 1.4    // 寬高比（高度 = 寬度 × 1.4）
}
```

### 2. 容器 Padding（根據斷點）

| 斷點 | Padding | 說明 |
|------|---------|------|
| xs | 12px | 超小屏幕，最小間距 |
| sm | 16px | 小屏幕，標準間距 |
| md | 20px | 中屏幕，舒適間距 |
| lg | 24px | 大屏幕，寬鬆間距 |
| xl | 32px | 超大屏幕，更寬鬆 |
| xxl | 40px | 寬屏，最大間距 |

### 3. 卡片間距 Gap（根據斷點）

| 斷點 | Gap | 說明 |
|------|-----|------|
| xs | 12px | 緊湊佈局 |
| sm | 16px | 標準佈局 |
| md | 20px | 舒適佈局 |
| lg | 24px | 寬鬆佈局 |
| xl | 32px | 更寬鬆佈局 |
| xxl | 40px | 最寬鬆佈局 |

### 4. 字體大小（根據斷點）

| 斷點 | 標題 | 正文 | 小字 |
|------|------|------|------|
| xs | 18px | 14px | 12px |
| sm | 20px | 16px | 13px |
| md | 22px | 18px | 14px |
| lg | 24px | 20px | 15px |
| xl | 28px | 22px | 16px |
| xxl | 32px | 24px | 18px |

### 5. 卡片寬度佔比（根據斷點和方向）

#### 直向模式（Portrait）

| 斷點 | 寬度佔比 | 說明 |
|------|---------|------|
| xs | 85% | 超小屏幕，最大化利用空間 |
| sm | 80% | 小屏幕，留出適當邊距 |
| md | 75% | 中屏幕，平衡佈局 |
| lg | 70% | 大屏幕，舒適視覺 |
| xl | 65% | 超大屏幕，避免過寬 |
| xxl | 60% | 寬屏，保持合理比例 |

#### 橫向模式（Landscape）

| 斷點 | 寬度佔比 | 說明 |
|------|---------|------|
| xs | 70% | 橫向時減少寬度 |
| sm | 65% | 保持合理比例 |
| md | 60% | 平衡佈局 |
| lg | 55% | 舒適視覺 |
| xl | 50% | 避免過寬 |
| xxl | 45% | 最佳比例 |

---

## 🔧 技術實現

### 核心算法

```typescript
function calculateLayoutMetrics(containerWidth: number, containerHeight: number): LayoutMetrics {
  // 1. 確定斷點
  const breakpoint = getContainerBreakpoint(containerWidth);
  
  // 2. 確定方向
  const orientation = containerHeight > containerWidth ? 'portrait' : 'landscape';
  
  // 3. 獲取設計令牌
  const padding = DESIGN_TOKENS.padding[breakpoint.name];
  const gap = DESIGN_TOKENS.gap[breakpoint.name];
  const fontSize = DESIGN_TOKENS.fontSize[breakpoint.name];
  const widthRatio = DESIGN_TOKENS.cardWidthRatio[orientation][breakpoint.name];
  
  // 4. 計算可用空間
  const availableWidth = containerWidth - (padding * 2);
  const availableHeight = containerHeight - (padding * 2);
  
  // 5. 計算卡片寬度
  let cardWidth = availableWidth * widthRatio;
  
  // 6. 應用最小/最大限制
  cardWidth = Math.max(DESIGN_TOKENS.cardSize.minWidth, cardWidth);
  cardWidth = Math.min(DESIGN_TOKENS.cardSize.maxWidth, cardWidth);
  
  // 7. 計算卡片高度（保持寬高比）
  const cardHeight = cardWidth * DESIGN_TOKENS.cardSize.aspectRatio;
  
  // 8. 確保卡片不超過可用高度
  if (cardHeight > availableHeight) {
    const adjustedCardHeight = availableHeight;
    cardWidth = adjustedCardHeight / DESIGN_TOKENS.cardSize.aspectRatio;
  }
  
  return { /* ... */ };
}
```

### ResizeObserver 監聽

```typescript
const resizeObserver = new ResizeObserver((entries) => {
  // 防抖處理（100ms）
  debounceTimerRef.current = setTimeout(() => {
    for (let entry of entries) {
      const { width, height } = entry.contentRect;
      const metrics = calculateLayoutMetrics(width, height);
      setLayoutMetrics(metrics);
    }
  }, 100);
});

resizeObserver.observe(container);
```

---

## 📊 實際測試案例

### 案例 1：iPhone 14 直向模式

**容器尺寸**：311×760px  
**斷點**：sm（小容器）  
**方向**：portrait（直向）  
**Padding**：16px  
**Gap**：16px  
**可用寬度**：311 - 32 = 279px  
**卡片寬度**：279 × 0.80 = 223px  
**卡片高度**：223 × 1.4 = 312px  
**字體大小**：標題 20px, 正文 16px, 小字 13px  

### 案例 2：iPad 直向模式

**容器尺寸**：705×1024px  
**斷點**：lg（大容器）  
**方向**：portrait（直向）  
**Padding**：24px  
**Gap**：24px  
**可用寬度**：705 - 48 = 657px  
**卡片寬度**：657 × 0.70 = 460px → 限制為 400px（最大值）  
**卡片高度**：400 × 1.4 = 560px  
**字體大小**：標題 24px, 正文 20px, 小字 15px  

### 案例 3：桌面寬屏模式

**容器尺寸**：1841×963px  
**斷點**：xxl（超超大容器）  
**方向**：landscape（橫向）  
**Padding**：40px  
**Gap**：40px  
**可用寬度**：1841 - 80 = 1761px  
**卡片寬度**：1761 × 0.45 = 792px → 限制為 400px（最大值）  
**卡片高度**：400 × 1.4 = 560px  
**字體大小**：標題 32px, 正文 24px, 小字 18px  

---

## 🎨 視覺效果對比

### 傳統響應式系統 vs 容器響應式系統

| 特性 | 傳統系統 | 容器響應式系統 |
|------|---------|---------------|
| 基準 | 視口寬度 | 實際容器寬度 |
| 精確度 | 低（不考慮 padding） | 高（考慮所有間距） |
| 斷點數量 | 4 個 | 6 個 |
| 方向感知 | 無 | 有 |
| 動態 padding | 無 | 有 |
| 動態 gap | 無 | 有 |
| 字體縮放 | 固定 | 動態 |
| 性能優化 | 無 | 防抖 100ms |
| 調試日誌 | 簡單 | 詳細 |

---

## 🚀 使用方法

### 在組件中使用

```typescript
import { useContainerResponsiveLayout } from './useContainerResponsiveLayout';

function SpeakingCardsGame() {
  const containerLayout = useContainerResponsiveLayout();
  
  return (
    <div ref={containerLayout.containerRef}>
      <div style={{
        width: `${containerLayout.cardWidth}px`,
        height: `${containerLayout.cardHeight}px`,
        padding: `${containerLayout.padding}px`,
        gap: `${containerLayout.gap}px`
      }}>
        <h1 style={{ fontSize: `${containerLayout.fontSize.title}px` }}>
          標題
        </h1>
        <p style={{ fontSize: `${containerLayout.fontSize.body}px` }}>
          正文內容
        </p>
      </div>
    </div>
  );
}
```

### 返回值說明

```typescript
{
  containerRef,        // 容器引用（必須綁定到容器元素）
  containerSize,       // 容器大小 { width, height }
  layoutMetrics,       // 完整的佈局指標
  cardWidth,           // 卡片寬度（便捷訪問）
  cardHeight,          // 卡片高度（便捷訪問）
  breakpoint,          // 當前斷點名稱
  orientation,         // 當前方向
  padding,             // 當前 padding
  gap,                 // 當前 gap
  fontSize             // 當前字體大小 { title, body, small }
}
```

---

## 📝 調試日誌

系統會在控制台輸出詳細的調試信息：

### 初始化日誌

```
🚀 [容器響應式系統] 初始化完成 {
  容器尺寸: "311×760px",
  斷點: "sm (小容器（手機）)"
}
```

### 佈局更新日誌

```
📐 [容器響應式系統] 佈局更新 {
  容器尺寸: "311×760px",
  斷點: "sm (小容器（手機）)",
  方向: "直向",
  寬高比: "0.41",
  可用空間: "279×728px",
  Padding: "16px",
  Gap: "16px",
  卡片尺寸: "223×312px",
  字體大小: "標題:20px, 正文:16px, 小字:13px"
}
```

### 清理日誌

```
🧹 [容器響應式系統] 已清理
```

---

## ✅ 優勢總結

1. **精確性**：基於實際容器大小，而非視口大小
2. **靈活性**：6 級斷點系統，覆蓋所有設備
3. **智能性**：方向感知，自動調整佈局策略
4. **完整性**：padding、gap、fontSize 全部動態調整
5. **性能**：防抖機制，避免頻繁計算
6. **可維護性**：設計令牌系統，易於調整
7. **可調試性**：詳細日誌，快速定位問題
8. **向後兼容**：保持原有 API，無縫升級

---

## 🔮 未來擴展

- [ ] 支持自定義斷點配置
- [ ] 支持主題切換時的佈局調整
- [ ] 支持動畫過渡效果
- [ ] 支持更多設計令牌（陰影、圓角等）
- [ ] 支持 A/B 測試不同佈局策略
- [ ] 支持用戶偏好設置（字體大小、間距等）

---

**版本**：v1.0.0  
**最後更新**：2025-11-15  
**作者**：EduCreate Team

