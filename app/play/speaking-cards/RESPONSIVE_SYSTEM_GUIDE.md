# Speaking Cards 響應式系統指南

## 📋 概述

Speaking Cards 遊戲現已升級為業界標準的響應式系統，參考 Match-up Game 的架構。該系統提供了完整的設備適配、斷點管理和設計令牌系統。

## 🏗️ 系統架構

### 第 1 層：預定義斷點系統
```typescript
// responsive-config.ts
RESPONSIVE_BREAKPOINTS = {
  mobile: 0-767px,      // 手機設備
  tablet: 768-1023px,   // 平板設備
  desktop: 1024-1279px, // 桌面設備
  wide: 1280px+         // 寬屏設備
}
```

### 第 2 層：設計令牌系統
```typescript
DESIGN_TOKENS = {
  spacing: { xs, sm, md, lg, xl, xxl },
  fontSize: { xs, sm, md, lg, xl, xxl },
  margins: { mobile, tablet, desktop, wide },
  gaps: { mobile, tablet, desktop, wide },
  cardSize: { mobile, tablet, desktop, wide },
  buttonSize: { mobile, tablet, desktop, wide },
  ipad: { mini, air, pro-11, pro-12.9 }
}
```

### 第 3 層：響應式佈局引擎
```typescript
// responsive-layout.ts
SpeakingCardsResponsiveLayout {
  getCardSize()
  getButtonSize()
  getMargins()
  getGaps()
  getFontSizes()
  getCardStyle()
  getButtonStyle()
  isMobile() / isTablet() / isDesktop() / isWide()
  isPortraitMode() / isLandscapeMode()
}
```

### 第 4 層：React Hook
```typescript
// useResponsiveLayout.ts
useResponsiveLayout() {
  layout, config, windowSize,
  breakpoint, cardSize, buttonSize,
  margins, gaps, fontSize,
  isMobile, isTablet, isDesktop, isWide,
  isPortrait, isLandscape, isIPad
}
```

## 📱 設備適配

### 卡片尺寸
| 設備 | 寬度 | 高度 |
|------|------|------|
| 手機 | 200px | 280px |
| 平板 | 240px | 320px |
| 桌面 | 280px | 360px |
| 寬屏 | 320px | 400px |

### iPad 特殊優化
| 型號 | 寬度 | 高度 | 字體 |
|------|------|------|------|
| iPad Mini | 220px | 300px | 16px |
| iPad Air | 260px | 340px | 18px |
| iPad Pro 11" | 300px | 380px | 20px |
| iPad Pro 12.9" | 340px | 420px | 22px |

### 按鈕區域
| 設備 | 方向 | 間距 |
|------|------|------|
| 手機 | 垂直 | 8px |
| 平板 | 水平 | 12px |
| 桌面 | 水平 | 16px |
| 寬屏 | 水平 | 20px |

## 🎯 使用方法

### 在組件中使用 Hook

```typescript
import { useResponsiveLayout } from './useResponsiveLayout';

function SpeakingCardsGame() {
  const responsive = useResponsiveLayout();

  return (
    <div style={{
      width: responsive.cardSize?.width,
      height: responsive.cardSize?.height,
      fontSize: responsive.fontSize?.body
    }}>
      {/* 內容 */}
    </div>
  );
}
```

### 獲取特定配置

```typescript
// 獲取當前斷點
const breakpoint = responsive.breakpoint; // 'mobile' | 'tablet' | 'desktop' | 'wide'

// 獲取卡片尺寸
const { width, height } = responsive.cardSize;

// 獲取按鈕尺寸
const { padding, fontSize } = responsive.buttonSize;

// 獲取邊距
const { side, top, bottom } = responsive.margins;

// 獲取間距
const { horizontal, vertical } = responsive.gaps;

// 獲取字體大小
const { title, subtitle, body } = responsive.fontSize;

// 檢查設備類型
if (responsive.isMobile) { /* 手機 */ }
if (responsive.isTablet) { /* 平板 */ }
if (responsive.isDesktop) { /* 桌面 */ }
if (responsive.isWide) { /* 寬屏 */ }

// 檢查屏幕方向
if (responsive.isPortrait) { /* 直屏 */ }
if (responsive.isLandscape) { /* 橫屏 */ }

// 檢查 iPad
if (responsive.isIPad) { /* iPad */ }
console.log(responsive.iPadModel); // 'ipad-mini' | 'ipad-air' | 'ipad-pro-11' | 'ipad-pro-12.9'
```

## 🔄 自動響應

系統會自動監聽以下事件：
- `resize` - 窗口大小變化
- `orientationchange` - 屏幕方向變化

當這些事件觸發時，佈局會自動更新，無需手動干預。

## 📊 性能優化

- ✅ 使用 `useCallback` 優化事件處理
- ✅ 使用 `useEffect` 管理副作用
- ✅ 避免不必要的重新渲染
- ✅ 支持 iPad 設備檢測和優化

## 🧪 測試建議

### 測試設備
- iPhone 12 (390px × 844px)
- iPhone 14 Pro Max (430px × 932px)
- iPad Air (820px × 1180px)
- iPad Pro 11" (834px × 1194px)
- iPad Pro 12.9" (1024px × 1366px)
- Desktop (1920px × 1080px)

### 測試場景
1. 初始加載 - 驗證正確的斷點
2. 窗口調整 - 驗證動態更新
3. 方向變化 - 驗證直屏/橫屏切換
4. iPad 檢測 - 驗證特殊優化
5. 卡片尺寸 - 驗證響應式卡片大小
6. 按鈕區域 - 驗證按鈕佈局變化

## 📝 文件結構

```
app/play/speaking-cards/
├── page.tsx                          # 主遊戲頁面（已更新）
├── responsive-config.ts              # 設計令牌和斷點配置
├── responsive-layout.ts              # 響應式佈局引擎
├── useResponsiveLayout.ts            # React Hook
└── RESPONSIVE_SYSTEM_GUIDE.md        # 本文檔
```

## 🚀 下一步改進

1. **主題系統** - 支持動態主題切換
2. **動畫優化** - 根據設備性能調整動畫
3. **字體加載** - 根據設備優化字體加載
4. **圖片優化** - 根據設備加載不同尺寸的圖片
5. **性能監控** - 添加性能指標追蹤

## 📚 參考資源

- Match-up Game 響應式系統
- Bootstrap 響應式設計
- Tailwind CSS 斷點系統
- Material Design 響應式指南

---

**系統已生產就緒！** ✅

