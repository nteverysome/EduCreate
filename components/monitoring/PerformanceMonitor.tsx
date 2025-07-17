/**
 * 性能監控組件
 * 自動收集和報告性能指標
 */

import React, { useEffect, useRef } from 'react';

interface PerformanceMonitorProps {
  enabled?: boolean;
  reportInterval?: number;
  children?: React.ReactNode;
}

const PerformanceMonitor = ({
  enabled = true,
  reportInterval = 30000, // 30 秒
  children
}: PerformanceMonitorProps) => {
  const metricsRef = useRef<any[]>([]);
  const observerRef = useRef<PerformanceObserver | null>(null);
  const reportTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // 收集性能指標
    const collectMetrics = () => {
      // Web Vitals 指標
      if ('PerformanceObserver' in window) {
        // 觀察 LCP (Largest Contentful Paint)
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            
            reportMetric({
              type: 'user-interaction',
              name: 'largest-contentful-paint',
              duration: lastEntry.startTime,
              url: window.location.href,
              metadata: {
                element: lastEntry.element?.tagName,
                size: lastEntry.size
              }
            });
          });
          
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
          observerRef.current = lcpObserver;
        } catch (error) {
          console.warn('LCP 觀察器不支持:', error);
        }

        // 觀察 FID (First Input Delay)
        try {
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              reportMetric({
                type: 'user-interaction',
                name: 'first-input-delay',
                duration: entry.processingStart - entry.startTime,
                url: window.location.href,
                metadata: {
                  eventType: entry.name,
                  target: entry.target?.tagName
                }
              });
            });
          });
          
          fidObserver.observe({ entryTypes: ['first-input'] });
        } catch (error) {
          console.warn('FID 觀察器不支持:', error);
        }

        // 觀察 CLS (Cumulative Layout Shift)
        try {
          const clsObserver = new PerformanceObserver((list) => {
            let clsValue = 0;
            const entries = list.getEntries();
            
            entries.forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            });

            if (clsValue > 0) {
              reportMetric({
                type: 'user-interaction',
                name: 'cumulative-layout-shift',
                duration: clsValue,
                url: window.location.href,
                metadata: {
                  entryCount: entries.length
                }
              });
            }
          });
          
          clsObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (error) {
          console.warn('CLS 觀察器不支持:', error);
        }
      }

      // 導航時間指標
      if ('performance' in window && 'getEntriesByType' in performance) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          // DNS 查詢時間
          reportMetric({
            type: 'resource-load',
            name: 'dns-lookup',
            duration: navigation.domainLookupEnd - navigation.domainLookupStart,
            url: window.location.href
          });

          // TCP 連接時間
          reportMetric({
            type: 'resource-load',
            name: 'tcp-connection',
            duration: navigation.connectEnd - navigation.connectStart,
            url: window.location.href
          });

          // 請求響應時間
          reportMetric({
            type: 'resource-load',
            name: 'request-response',
            duration: navigation.responseEnd - navigation.requestStart,
            url: window.location.href
          });

          // DOM 解析時間
          reportMetric({
            type: 'page-load',
            name: 'dom-parsing',
            duration: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            url: window.location.href
          });

          // 頁面加載完成時間
          reportMetric({
            type: 'page-load',
            name: 'page-load-complete',
            duration: navigation.loadEventEnd - navigation.fetchStart,
            url: window.location.href
          });
        }
      }

      // 資源加載時間
      if ('performance' in window && 'getEntriesByType' in performance) {
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        resources.forEach((resource) => {
          if (resource.duration > 0) {
            reportMetric({
              type: 'resource-load',
              name: 'resource-load',
              duration: resource.duration,
              url: window.location.href,
              metadata: {
                resourceUrl: resource.name,
                resourceType: resource.initiatorType,
                transferSize: resource.transferSize,
                encodedBodySize: resource.encodedBodySize
              }
            });
          }
        });
      }

      // 內存使用情況 (如果支持)
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        reportMetric({
          type: 'resource-load',
          name: 'memory-usage',
          duration: memory.usedJSHeapSize,
          url: window.location.href,
          metadata: {
            totalJSHeapSize: memory.totalJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit,
            usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
          }
        });
      }
    };

    // 報告性能指標
    const reportMetric = (metric: any) => {
      metricsRef.current.push(metric);
    };

    // 發送指標到服務器
    const flushMetrics = async () => {
      if (metricsRef.current.length === 0) return;

      const metricsToSend = [...metricsRef.current];
      metricsRef.current = [];

      try {
        for (const metric of metricsToSend) {
          await fetch('/api/monitoring/performance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(metric)
          });
        }
        console.log(`📈 已發送 ${metricsToSend.length} 個性能指標`);
      } catch (error) {
        console.error('發送性能指標失敗:', error);
        // 失敗的指標重新加入隊列
        metricsRef.current.unshift(...metricsToSend);
      }
    };

    // 監聽用戶交互
    const trackUserInteraction = (eventType: string) => {
      return (event: Event) => {
        const startTime = performance.now();
        
        // 使用 requestIdleCallback 或 setTimeout 來測量交互響應時間
        const measureResponseTime = () => {
          const endTime = performance.now();
          const duration = endTime - startTime;
          
          if (duration > 16) { // 只報告超過一幀的交互
            reportMetric({
              type: 'user-interaction',
              name: `${eventType}-response`,
              duration,
              url: window.location.href,
              metadata: {
                eventType,
                target: (event.target as Element)?.tagName,
                timestamp: new Date().toISOString()
              }
            });
          }
        };

        if ('requestIdleCallback' in window) {
          requestIdleCallback(measureResponseTime);
        } else {
          setTimeout(measureResponseTime, 0);
        }
      };
    };

    // 添加事件監聽器
    const clickHandler = trackUserInteraction('click');
    const keydownHandler = trackUserInteraction('keydown');
    const scrollHandler = trackUserInteraction('scroll');

    document.addEventListener('click', clickHandler);
    document.addEventListener('keydown', keydownHandler);
    document.addEventListener('scroll', scrollHandler, { passive: true });

    // 頁面加載完成後收集初始指標
    if (document.readyState === 'complete') {
      setTimeout(collectMetrics, 1000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(collectMetrics, 1000);
      });
    }

    // 定期發送指標
    reportTimerRef.current = setInterval(flushMetrics, reportInterval);

    // 頁面離開前發送剩餘指標
    const handleBeforeUnload = () => {
      if (metricsRef.current.length > 0) {
        const metrics = [...metricsRef.current];
        metricsRef.current = [];
        
        // 使用 sendBeacon 確保數據發送
        for (const metric of metrics) {
          navigator.sendBeacon(
            '/api/monitoring/performance',
            JSON.stringify(metric)
          );
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // 清理函數
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      
      if (reportTimerRef.current) {
        clearInterval(reportTimerRef.current);
      }

      document.removeEventListener('click', clickHandler);
      document.removeEventListener('keydown', keydownHandler);
      document.removeEventListener('scroll', scrollHandler);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // 發送剩餘指標
      flushMetrics();
    };
  }, [enabled, reportInterval]);

  return <>{children}</>;
}

// 性能監控 Hook
export function usePerformanceMonitoring(enabled = true) {
  const startTimeRef = useRef<number>();

  const startMeasurement = (name: string) => {
    if (!enabled) return;
    startTimeRef.current = performance.now();
    performance.mark(`${name}-start`);
  };

  const endMeasurement = async (name: string, metadata?: any) => {
    if (!enabled || !startTimeRef.current) return;
    
    const endTime = performance.now();
    const duration = endTime - startTimeRef.current;
    
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);

    // 報告到服務器
    try {
      await fetch('/api/monitoring/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'user-interaction',
          name,
          duration,
          url: window.location.href,
          metadata
        })
      });
    } catch (error) {
      console.error('報告性能指標失敗:', error);
    }
  };

  const measureAsync = async <T,>(name: string, fn: () => Promise<T>, metadata?: any): Promise<T> => {
    startMeasurement(name);
    try {
      const result = await fn();
      await endMeasurement(name, { ...metadata, success: true });
      return result;
    } catch (error) {
      await endMeasurement(name, { ...metadata, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  };

  return {
    startMeasurement,
    endMeasurement,
    measureAsync
  };
}
export default PerformanceMonitor;
