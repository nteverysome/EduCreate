// 1. 匯入新版 web-vitals/attribution 指標
import { onCLS, onLCP, onINP, onTTFB, onFCP } from 'web-vitals/attribution';

// 2. 定義 Metric 型別（或用 any 也可）
type Metric = {
  id: string;
  name: string;
  value: number;
  delta: number;
  entries: PerformanceEntry[];
  attribution?: any;
};

/**
 * 初始化Web Vitals監控
 * 收集核心Web Vitals指標：LCP, INP, CLS, FCP, TTFB
 * @param onPerfEntry 性能指標報告處理函數
 */
export function reportWebVitals(onPerfEntry?: (metric: Metric) => void) {
  if (typeof window !== "undefined" && typeof onPerfEntry === 'function') {
    onCLS(onPerfEntry);
    onLCP(onPerfEntry);
    onINP(onPerfEntry);
    onTTFB(onPerfEntry);
    onFCP(onPerfEntry);
  }
}

/**
 * 將性能指標發送到分析服務
 * 可以根據需要發送到Google Analytics、自定義API等
 */
export function sendToAnalytics(metric: Metric): void {
  // 開發環境下在控制台輸出
  if (process.env.NODE_ENV !== 'production') {
    console.log(metric);
    return;
  }

  // 在生產環境中，發送到後端API
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    id: metric.id,
    page: window.location.pathname,
    timestamp: Date.now(),
  });

  // 使用 sendBeacon API 在頁面卸載時也能發送數據
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/vitals', body);
  } else {
    // 備用方案：使用 fetch API
    fetch('/api/vitals', {
      body,
      method: 'POST',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch(console.error);
  }
}