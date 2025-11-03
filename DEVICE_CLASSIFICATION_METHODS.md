# 設備分類方法完全指南

## 1️⃣ 物理尺寸相關（最常見）

### 1.1 寬度和高度
```javascript
// 最基礎的方法
const width = window.innerWidth;
const height = window.innerHeight;

if (width < 768) {
    // 手機
} else if (width < 1024) {
    // 平板
} else {
    // 桌面
}
```

### 1.2 對角線長度
```javascript
const diagonal = Math.sqrt(width * width + height * height);
if (diagonal < 600) {
    // 小屏幕
} else if (diagonal < 1000) {
    // 中等屏幕
} else {
    // 大屏幕
}
```

### 1.3 屏幕面積
```javascript
const area = width * height;
if (area < 500000) {
    // 小屏幕
} else if (area < 1000000) {
    // 中等屏幕
} else {
    // 大屏幕
}
```

### 1.4 寬高比（Aspect Ratio）
```javascript
const aspectRatio = width / height;
if (aspectRatio > 2.0) {
    // 超寬屏（電影院模式）
} else if (aspectRatio > 1.5) {
    // 寬屏
} else if (aspectRatio > 0.75) {
    // 標準屏
} else {
    // 豎屏
}
```

---

## 2️⃣ 像素密度相關（重要）

### 2.1 設備像素比（Device Pixel Ratio）⭐
```javascript
// 最重要的指標之一
const dpr = window.devicePixelRatio;

if (dpr <= 1) {
    // 標準屏幕（96 DPI）
} else if (dpr <= 2) {
    // 高清屏幕（192 DPI）
} else if (dpr <= 3) {
    // 超高清屏幕（288 DPI）
} else {
    // 極高清屏幕（384+ DPI）
}

// 實際應用：根據 DPR 調整字體大小
const baseFontSize = 16;
const adjustedFontSize = baseFontSize * dpr;
```

### 2.2 DPI（Dots Per Inch）
```javascript
// 計算實際 DPI
const dpi = dpr * 96; // 96 是標準 DPI

if (dpi < 100) {
    // 低密度屏幕
} else if (dpi < 200) {
    // 中等密度屏幕
} else if (dpi < 300) {
    // 高密度屏幕
} else {
    // 超高密度屏幕
}
```

---

## 3️⃣ 交互特性相關（重要）

### 3.1 觸摸支持 ⭐
```javascript
// 檢測是否支持觸摸
const isTouchDevice = () => {
    return (
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0 ||
        'ontouchstart' in window
    );
};

// 根據觸摸支持調整 UI
if (isTouchDevice()) {
    // 增大按鈕大小（至少 44×44px）
    // 增加間距
    // 使用觸摸友好的交互
} else {
    // 可以使用更小的按鈕
    // 支持懸停效果
}
```

### 3.2 指針類型
```javascript
// 檢測指針類型
const pointerType = () => {
    if (navigator.maxTouchPoints > 0) return 'touch';
    if (window.matchMedia('(pointer:fine)').matches) return 'mouse';
    if (window.matchMedia('(pointer:coarse)').matches) return 'touch';
    return 'unknown';
};
```

### 3.3 懸停支持
```javascript
// 檢測是否支持懸停
const supportsHover = window.matchMedia('(hover:hover)').matches;

if (supportsHover) {
    // 可以使用懸停效果
    element.addEventListener('mouseenter', () => {
        // 顯示懸停效果
    });
} else {
    // 不支持懸停，使用點擊代替
}
```

---

## 4️⃣ 用戶代理相關

### 4.1 用戶代理檢測
```javascript
const userAgent = navigator.userAgent;

// 檢測設備類型
const isIPhone = /iPhone/.test(userAgent);
const isIPad = /iPad/.test(userAgent);
const isAndroid = /Android/.test(userAgent);
const isWindows = /Windows/.test(userAgent);
const isMac = /Macintosh/.test(userAgent);

// 檢測瀏覽器
const isChrome = /Chrome/.test(userAgent);
const isSafari = /Safari/.test(userAgent);
const isFirefox = /Firefox/.test(userAgent);
```

### 4.2 操作系統檢測
```javascript
const getOS = () => {
    if (navigator.userAgent.indexOf('Win') > -1) return 'Windows';
    if (navigator.userAgent.indexOf('Mac') > -1) return 'MacOS';
    if (navigator.userAgent.indexOf('Linux') > -1) return 'Linux';
    if (navigator.userAgent.indexOf('Android') > -1) return 'Android';
    if (navigator.userAgent.indexOf('iPhone') > -1) return 'iOS';
    return 'Unknown';
};
```

---

## 5️⃣ 媒體查詢相關（推薦）⭐

### 5.1 基礎媒體查詢
```javascript
// 在 CSS 中
@media (max-width: 768px) {
    /* 手機 */
}

@media (min-width: 768px) and (max-width: 1024px) {
    /* 平板 */
}

@media (min-width: 1024px) {
    /* 桌面 */
}

// 在 JavaScript 中
const isMobile = window.matchMedia('(max-width: 768px)').matches;
const isTablet = window.matchMedia('(min-width: 768px) and (max-width: 1024px)').matches;
const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
```

### 5.2 高級媒體查詢
```javascript
// 檢測方向
const isPortrait = window.matchMedia('(orientation: portrait)').matches;
const isLandscape = window.matchMedia('(orientation: landscape)').matches;

// 檢測顏色深度
const hasColor = window.matchMedia('(color)').matches;
const colorBits = window.matchMedia('(color: 8)').matches ? 8 : 24;

// 檢測刷新率
const hasHighRefresh = window.matchMedia('(min-resolution: 120dpi)').matches;

// 檢測暗色模式
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// 檢測減少動畫
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

---

## 6️⃣ 性能相關

### 6.1 網絡狀態
```javascript
// 檢測網絡連接
const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

if (connection) {
    const effectiveType = connection.effectiveType; // '4g', '3g', '2g', 'slow-2g'
    const downlink = connection.downlink; // Mbps
    const rtt = connection.rtt; // 毫秒
    
    if (effectiveType === '4g') {
        // 高速網絡，可以加載高質量資源
    } else if (effectiveType === '3g') {
        // 中等網絡，使用中等質量資源
    } else {
        // 低速網絡，使用低質量資源
    }
}
```

### 6.2 內存狀態
```javascript
// 檢測設備內存
if (navigator.deviceMemory) {
    const memory = navigator.deviceMemory; // GB
    
    if (memory >= 8) {
        // 高端設備
    } else if (memory >= 4) {
        // 中端設備
    } else {
        // 低端設備
    }
}
```

### 6.3 CPU 核心數
```javascript
// 檢測 CPU 核心數
if (navigator.hardwareConcurrency) {
    const cores = navigator.hardwareConcurrency;
    
    if (cores >= 8) {
        // 高性能設備
    } else if (cores >= 4) {
        // 中等性能設備
    } else {
        // 低性能設備
    }
}
```

---

## 7️⃣ 用戶偏好相關

### 7.1 暗色模式
```javascript
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (prefersDark) {
    // 使用暗色主題
    document.documentElement.setAttribute('data-theme', 'dark');
} else {
    // 使用亮色主題
    document.documentElement.setAttribute('data-theme', 'light');
}
```

### 7.2 減少動畫
```javascript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
    // 禁用動畫
    element.style.animation = 'none';
    element.style.transition = 'none';
} else {
    // 使用動畫
}
```

### 7.3 字體大小偏好
```javascript
// 檢測用戶的字體大小偏好
const fontSize = window.getComputedStyle(document.documentElement).fontSize;
const baseFontSize = parseFloat(fontSize);

if (baseFontSize > 18) {
    // 用戶偏好大字體
} else if (baseFontSize < 14) {
    // 用戶偏好小字體
}
```

---

## 8️⃣ 傳感器相關

### 8.1 加速度計
```javascript
// 檢測設備方向變化
window.addEventListener('deviceorientation', (event) => {
    const alpha = event.alpha; // Z 軸旋轉（0-360）
    const beta = event.beta;   // X 軸旋轉（-180 到 180）
    const gamma = event.gamma; // Y 軸旋轉（-90 到 90）
    
    // 根據方向調整 UI
});
```

### 8.2 陀螺儀
```javascript
// 檢測設備旋轉速度
window.addEventListener('devicemotion', (event) => {
    const rotationRate = event.rotationRate;
    const alpha = rotationRate.alpha; // Z 軸旋轉速度
    const beta = rotationRate.beta;   // X 軸旋轉速度
    const gamma = rotationRate.gamma; // Y 軸旋轉速度
});
```

---

## 📊 實際應用對比表

| 方法 | 準確度 | 性能 | 兼容性 | 推薦度 |
|------|--------|------|--------|--------|
| **寬度/高度** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **DPR** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **觸摸支持** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **媒體查詢** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **用戶代理** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **網絡狀態** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **內存/CPU** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |

---

## 🎯 最佳實踐

### 推薦組合方案
```javascript
// 1. 首先使用媒體查詢（最可靠）
const isMobile = window.matchMedia('(max-width: 768px)').matches;
const isTablet = window.matchMedia('(min-width: 768px) and (max-width: 1024px)').matches;

// 2. 檢測觸摸支持（區分設備類型）
const isTouchDevice = navigator.maxTouchPoints > 0;

// 3. 檢測 DPR（調整像素相關的計算）
const dpr = window.devicePixelRatio;

// 4. 檢測網絡狀態（優化資源加載）
const connection = navigator.connection;
const effectiveType = connection?.effectiveType || '4g';

// 5. 檢測用戶偏好（改善用戶體驗）
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 綜合判斷
const deviceProfile = {
    isMobile,
    isTablet,
    isTouchDevice,
    dpr,
    effectiveType,
    prefersDark,
    prefersReducedMotion
};
```

---

## 💡 關鍵要點

1. **不要只依賴寬度** - 使用多個指標組合判斷
2. **優先使用媒體查詢** - 比 JavaScript 檢測更可靠
3. **考慮 DPR** - 對於高清屏幕很重要
4. **檢測觸摸支持** - 區分手機和平板
5. **考慮網絡狀態** - 優化資源加載
6. **尊重用戶偏好** - 暗色模式、減少動畫等
7. **避免用戶代理檢測** - 容易被欺騙，不可靠

