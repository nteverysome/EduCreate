import React, { useState, useEffect } from 'react';
import { performanceMonitor, perf } from '../lib/utils/performanceMonitor';
import { globalCache, sessionCache, permissionCache } from '../lib/cache/CacheManager';

interface PerformanceStats {
  totalMetrics: number;
  averageResponseTime: number;
  errorRate: number;
  slowestOperations: Array<{ name: string; value: number }>;
  cacheStats: {
    global: any;
    session: any;
    permission: any;
  };
  webVitals: {
    [key: string]: number;
  };
}

/**
 * 性能監控儀表板組件
 * 僅在開發環境中顯示
 */
export function PerformanceDashboard() {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // 只在開發環境中顯示
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // 獲取性能統計
  const fetchStats = () => {
    const report = performanceMonitor.getReport();
    
    // 獲取 Web Vitals
    const webVitals: { [key: string]: number } = {};
    report.metrics
      .filter(m => m.tags?.category === 'web_vitals')
      .forEach(m => {
        webVitals[m.name.replace('web_vital_', '')] = m.value;
      });

    setStats({
      ...report.summary,
      cacheStats: {
        global: globalCache.getStats(),
        session: sessionCache.getStats(),
        permission: permissionCache.getStats(),
      },
      webVitals,
    });
  };

  // 自動刷新
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchStats, 2000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // 初始加載
  useEffect(() => {
    fetchStats();
  }, []);

  // 清除所有數據
  const clearAllData = () => {
    performanceMonitor.clear();
    globalCache.clear();
    sessionCache.clear();
    permissionCache.clear();
    fetchStats();
  };

  // 導出數據
  const exportData = () => {
    const data = performanceMonitor.export();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-2 rounded-lg text-xs font-mono hover:bg-gray-700 z-50"
      >
        📊 性能
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-96 max-h-96 overflow-y-auto z-50 text-xs font-mono">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-gray-800">性能監控</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-2 py-1 rounded text-xs ${
              autoRefresh 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {autoRefresh ? '自動' : '手動'}
          </button>
          <button
            onClick={fetchStats}
            className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
          >
            刷新
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs"
          >
            ✕
          </button>
        </div>
      </div>

      {stats && (
        <div className="space-y-3">
          {/* 基本統計 */}
          <div className="bg-gray-50 p-2 rounded">
            <div className="font-semibold mb-1">基本統計</div>
            <div>總指標: {stats.totalMetrics}</div>
            <div>平均響應時間: {stats.averageResponseTime.toFixed(2)}ms</div>
            <div>錯誤率: {stats.errorRate.toFixed(2)}%</div>
          </div>

          {/* Web Vitals */}
          {Object.keys(stats.webVitals).length > 0 && (
            <div className="bg-blue-50 p-2 rounded">
              <div className="font-semibold mb-1">Web Vitals</div>
              {Object.entries(stats.webVitals).map(([name, value]) => (
                <div key={name}>
                  {name}: {value.toFixed(2)}
                </div>
              ))}
            </div>
          )}

          {/* 緩存統計 */}
          <div className="bg-green-50 p-2 rounded">
            <div className="font-semibold mb-1">緩存統計</div>
            <div>全局: {stats.cacheStats.global.size}/{stats.cacheStats.global.maxSize}</div>
            <div>會話: {stats.cacheStats.session.size}/{stats.cacheStats.session.maxSize}</div>
            <div>權限: {stats.cacheStats.permission.size}/{stats.cacheStats.permission.maxSize}</div>
          </div>

          {/* 最慢操作 */}
          {stats.slowestOperations.length > 0 && (
            <div className="bg-yellow-50 p-2 rounded">
              <div className="font-semibold mb-1">最慢操作</div>
              {stats.slowestOperations.slice(0, 3).map((op, i) => (
                <div key={i} className="truncate">
                  {op.name}: {op.value.toFixed(2)}ms
                </div>
              ))}
            </div>
          )}

          {/* 操作按鈕 */}
          <div className="flex space-x-2 pt-2 border-t">
            <button
              onClick={exportData}
              className="flex-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
            >
              導出
            </button>
            <button
              onClick={clearAllData}
              className="flex-1 px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
            >
              清除
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 性能監控 Hook
 * 用於在組件中輕鬆添加性能監控
 */
export function usePerformanceMonitoring(componentName: string) {
  useEffect(() => {
    perf.start(`component_mount_${componentName}`);
    
    return () => {
      perf.end(`component_mount_${componentName}`);
    };
  }, [componentName]);

  const measureRender = (renderName: string, fn: () => void) => {
    perf.measure(`render_${componentName}_${renderName}`, fn);
  };

  const measureAsync = async <T extends any>(operationName: string, fn: () => Promise<T>): Promise<T> => {
    return perf.measureAsync(`async_${componentName}_${operationName}`, fn);
  };

  return {
    measureRender,
    measureAsync,
    recordError: (error: Error, context?: string) => 
      perf.error(error, `${componentName}_${context || 'unknown'}`),
    incrementCounter: (name: string, value?: number) =>
      perf.count(`${componentName}_${name}`, value),
  };
}

export default PerformanceDashboard;
