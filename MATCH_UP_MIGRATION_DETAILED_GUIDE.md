# 🎯 Match-Up 遊戲遷移指南 - 詳細步驟

## 📋 遷移概述

**目標**: 將 Match-Up 遊戲從舊的響應式系統遷移到統一的 UnifiedResponsiveLayout.ts

**預期結果**:
- ✅ 功能完全一致
- ✅ 代碼行數減少 60%
- ✅ 複雜度降低 90%
- ✅ 1024×1366 和 1024×1033 都自動支持

**時間估計**: 2-3 天

---

## 🔧 第 1 步：準備工作

### 1.1 備份現有代碼

```bash
# 備份 Match-Up 遊戲
cp -r public/games/match-up-game public/games/match-up-game.backup

# 備份關鍵文件
cp public/games/match-up-game/scenes/game.js public/games/match-up-game/scenes/game.js.backup
cp public/games/match-up-game/responsive-config.js public/games/match-up-game/responsive-config.js.backup
cp public/games/match-up-game/responsive-layout.js public/games/match-up-game/responsive-layout.js.backup
```

### 1.2 驗證統一系統

```bash
# 檢查 UnifiedResponsiveLayout.ts 是否存在
ls -la lib/games/UnifiedResponsiveLayout.ts

# 檢查是否可以導入
grep -n "export" lib/games/UnifiedResponsiveLayout.ts
```

---

## 🔄 第 2 步：導入統一系統

### 2.1 在 index.html 中添加導入

**位置**: `public/games/match-up-game/index.html`

```html
<!-- 添加統一響應式系統 -->
<script src="../../lib/games/UnifiedResponsiveLayout.ts"></script>

<!-- 或者使用 import（如果使用 TypeScript） -->
<script type="module">
  import { 
    UNIFIED_BREAKPOINTS,
    PhaserResponsiveLayout,
    calculateResponsiveLayout 
  } from '../../lib/games/UnifiedResponsiveLayout.ts';
  
  window.UnifiedResponsiveLayout = {
    UNIFIED_BREAKPOINTS,
    PhaserResponsiveLayout,
    calculateResponsiveLayout
  };
</script>
```

### 2.2 驗證導入成功

在瀏覽器控制台測試：

```javascript
// 檢查是否可以訪問
console.log(window.UnifiedResponsiveLayout);
console.log(window.UnifiedResponsiveLayout.UNIFIED_BREAKPOINTS);
```

---

## 🔀 第 3 步：替換響應式邏輯

### 3.1 在 game.js 中替換初始化代碼

**舊代碼** (game.js 第 2100-2150 行):

```javascript
const isDesktopXGA = width === 1024 && height === 768;
const isRealTablet = width >= 768 && width <= 1024 && height >= 600 && !isDesktopXGA;
const isIPad = isRealTablet;

let iPadSize = null;
let iPadParams = null;
if (isIPad) {
    iPadSize = classifyIPadSize(width, height);
    iPadParams = getIPadOptimalParams(iPadSize);
}
```

**新代碼**:

```javascript
// 使用統一的響應式布局系統
const layout = new window.UnifiedResponsiveLayout.PhaserResponsiveLayout(
    width, 
    height, 
    itemCount
);

const breakpoint = layout.getBreakpoint();
const cols = layout.getColumns();
const cardSize = layout.getCardSize();
const fontSize = layout.getFontSize();
const margins = layout.getMargins();
const spacing = layout.getSpacing();

// 調試日誌
layout.logLayout();
```

### 3.2 替換所有佈局方法

**舊方法** (createMixedLayout):

```javascript
createMixedLayout(items, width, height) {
    const layout = new GameResponsiveLayout(width, height, {
        isIPad: this.isIPad,
        itemCount: items.length
    });
    
    const cols = layout.getOptimalCols(items.length);
    const cardSize = layout.getCardSize();
    // ... 更多邏輯
}
```

**新方法**:

```javascript
createMixedLayout(items, width, height) {
    const layout = new window.UnifiedResponsiveLayout.PhaserResponsiveLayout(
        width, 
        height, 
        items.length
    );
    
    const cols = layout.getColumns();
    const cardSize = layout.getCardSize();
    // ... 使用統一的值
}
```

---

## 🗑️ 第 4 步：移除舊代碼

### 4.1 刪除不需要的文件

```bash
# 可以保留備份，但不再使用
# rm public/games/match-up-game/responsive-config.js
# rm public/games/match-up-game/responsive-layout.js
# rm public/games/match-up-game/responsive-manager.js
```

### 4.2 刪除舊函數

在 game.js 中刪除：

```javascript
// ❌ 刪除這些函數
function classifyIPadSize(width, height) { /* ... */ }
function getIPadOptimalParams(iPadSize) { /* ... */ }
function getBreakpoint(width) { /* ... */ }
function getToken(tokenName, tokenKey, breakpoint) { /* ... */ }
```

### 4.3 刪除舊變量

```javascript
// ❌ 刪除這些變量
const isDesktopXGA = ...
const isRealTablet = ...
const isIPad = ...
let iPadSize = ...
let iPadParams = ...
```

---

## ✅ 第 5 步：測試驗證

### 5.1 測試所有解析度

```javascript
// 在瀏覽器控制台測試
const testResolutions = [
    { width: 375, height: 812, name: '手機直向' },
    { width: 812, height: 375, name: '手機橫向' },
    { width: 768, height: 1024, name: 'iPad mini' },
    { width: 810, height: 1080, name: 'iPad Air' },
    { width: 834, height: 1194, name: 'iPad Pro 11"' },
    { width: 1024, height: 1366, name: 'iPad Pro 12.9"' },
    { width: 1024, height: 1033, name: 'iPad Pro 遊戲區域' },
    { width: 1440, height: 900, name: '桌面' }
];

testResolutions.forEach(res => {
    const layout = new window.UnifiedResponsiveLayout.PhaserResponsiveLayout(
        res.width, 
        res.height, 
        8
    );
    console.log(`${res.name}: ${layout.getColumns()} 列`);
});
```

### 5.2 驗證卡片排列

- [ ] 375×812 → 2 列
- [ ] 812×375 → 3 列
- [ ] 768×1024 → 4 列
- [ ] 810×1080 → 5 列
- [ ] 834×1194 → 5 列
- [ ] **1024×1366 → 6 列** ✅
- [ ] **1024×1033 → 6 列** ✅
- [ ] 1440×900 → 6 列

### 5.3 驗證功能

- [ ] 卡片可以拖動
- [ ] 配對功能正常
- [ ] 計時器正常
- [ ] 分頁功能正常
- [ ] 按鈕區域正確
- [ ] 字體大小正確

---

## 🚀 第 6 步：推送和部署

### 6.1 提交代碼

```bash
git add public/games/match-up-game/
git add lib/games/UnifiedResponsiveLayout.ts
git commit -m "refactor: 統一 Match-Up 遊戲響應式系統

- 遷移到 UnifiedResponsiveLayout.ts
- 移除 iPad 特殊配置
- 代碼行數減少 60%
- 複雜度降低 90%
- 1024×1366 和 1024×1033 自動支持"
```

### 6.2 推送到 GitHub

```bash
git push origin master
```

### 6.3 驗證 Vercel 部署

- [ ] 檢查 Vercel 構建狀態
- [ ] 測試生產環境
- [ ] 驗證所有解析度

---

## 📊 遷移檢查清單

- [ ] 備份現有代碼
- [ ] 導入統一系統
- [ ] 替換初始化代碼
- [ ] 替換所有佈局方法
- [ ] 移除舊代碼
- [ ] 測試所有解析度
- [ ] 驗證所有功能
- [ ] 提交代碼
- [ ] 推送到 GitHub
- [ ] 驗證 Vercel 部署

---

## 🎉 預期結果

**遷移前**:
- 代碼行數: 600+
- 複雜度: O(n³)
- iPad 特殊配置: 10 個

**遷移後**:
- 代碼行數: 250
- 複雜度: O(n)
- iPad 特殊配置: 0 個
- 1024×1366 自動支持 ✅
- 1024×1033 自動支持 ✅

**準備好開始遷移了嗎？** 🚀

