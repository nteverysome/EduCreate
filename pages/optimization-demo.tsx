import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import { OptimizedActivityList } from '../components/OptimizedActivityList';
import { PerformanceDashboard, usePerformanceMonitoring } from '../components/PerformanceDashboard';
import { useAppStore } from '../lib/store/useAppStore';
import { usePermission } from '../hooks/usePermission';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { api } from '../lib/utils/apiUtils';
import { perf } from '../lib/utils/performanceMonitor';

/**
 * 優化功能演示頁面
 * 展示所有優化功能的使用方法
 */
export default function OptimizationDemo() {
  const [demoResults, setDemoResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  
  // 使用優化的 hooks
  const { user, isAuthenticated } = useAppStore();
  const { canCreateActivity, canEditActivity, userRole } = usePermission();
  const { executeWithErrorHandling, error } = useErrorHandler();
  const { measureAsync, recordError, incrementCounter } = usePerformanceMonitoring('OptimizationDemo');

  // 添加結果到演示列表
  const addResult = (message: string) => {
    setDemoResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // 演示緩存功能
  const demoCache = async () => {
    addResult('開始緩存演示...');
    
    try {
      // 第一次調用 - 應該較慢
      const start1 = Date.now();
      const result1 = await api.get('/api/user/subscription-status');
      const duration1 = Date.now() - start1;
      addResult(`第一次 API 調用: ${duration1}ms`);

      // 第二次調用 - 應該從緩存返回，更快
      const start2 = Date.now();
      const result2 = await api.get('/api/user/subscription-status');
      const duration2 = Date.now() - start2;
      addResult(`第二次 API 調用 (緩存): ${duration2}ms`);
      
      addResult(`緩存效果: 速度提升 ${Math.round((duration1 - duration2) / duration1 * 100)}%`);
    } catch (error) {
      addResult(`緩存演示失敗: ${error}`);
    }
  };

  // 演示性能監控
  const demoPerformanceMonitoring = async () => {
    addResult('開始性能監控演示...');
    
    try {
      // 測量同步操作
      const syncResult = perf.measure('demo_sync_operation', () => {
        let sum = 0;
        for (let i = 0; i < 1000000; i++) {
          sum += i;
        }
        return sum;
      });
      addResult(`同步操作完成，結果: ${syncResult}`);

      // 測量異步操作
      await measureAsync('demo_async_operation', async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        addResult('異步操作完成');
      });

      // 增加計數器
      incrementCounter('demo_counter', 5);
      addResult('計數器增加 5');

      // 獲取性能統計
      const stats = perf.stats('demo_sync_operation');
      if (stats) {
        addResult(`性能統計 - 平均: ${stats.average.toFixed(2)}ms, 最大: ${stats.max.toFixed(2)}ms`);
      }
    } catch (error) {
      recordError(error as Error, 'performance_demo');
      addResult(`性能監控演示失敗: ${error}`);
    }
  };

  // 演示錯誤處理
  const demoErrorHandling = async () => {
    addResult('開始錯誤處理演示...');
    
    await executeWithErrorHandling(
      async () => {
        // 模擬一個會失敗的操作
        throw new Error('這是一個演示錯誤');
      },
      () => {
        addResult('操作成功（不應該看到這個）');
      },
      (error) => {
        addResult(`錯誤被正確捕獲: ${error}`);
      }
    );
  };

  // 演示樂觀更新
  const demoOptimisticUpdate = async () => {
    addResult('開始樂觀更新演示...');
    
    // 這個演示需要在實際的組件中實現
    // 因為樂觀更新通常與 UI 狀態相關
    addResult('樂觀更新演示需要在活動列表組件中查看');
  };

  // 運行所有演示
  const runAllDemos = async () => {
    setIsRunning(true);
    setDemoResults([]);
    
    try {
      await demoPerformanceMonitoring();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await demoCache();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await demoErrorHandling();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await demoOptimisticUpdate();
      
      addResult('所有演示完成！');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <>
      <Head>
        <title>優化功能演示 - EduCreate</title>
        <meta name="description" content="展示 EduCreate 項目的優化功能" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🚀 EduCreate 優化功能演示
            </h1>
            <p className="text-lg text-gray-600">
              展示項目中實現的各種性能優化和功能增強
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 左側：功能演示 */}
            <div className="space-y-6">
              {/* 用戶信息卡片 */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">用戶狀態</h2>
                <div className="space-y-2 text-sm">
                  <p><strong>認證狀態:</strong> {isAuthenticated ? '已登入' : '未登入'}</p>
                  <p><strong>用戶角色:</strong> {userRole}</p>
                  <p><strong>創建權限:</strong> {canCreateActivity ? '有' : '無'}</p>
                  <p><strong>編輯權限:</strong> {canEditActivity ? '有' : '無'}</p>
                </div>
              </div>

              {/* 演示控制面板 */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">功能演示</h2>
                <div className="space-y-3">
                  <button
                    onClick={runAllDemos}
                    disabled={isRunning}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRunning ? '運行中...' : '運行所有演示'}
                  </button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={demoPerformanceMonitoring}
                      disabled={isRunning}
                      className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                    >
                      性能監控
                    </button>
                    <button
                      onClick={demoCache}
                      disabled={isRunning}
                      className="bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700 disabled:opacity-50"
                    >
                      緩存系統
                    </button>
                    <button
                      onClick={demoErrorHandling}
                      disabled={isRunning}
                      className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                    >
                      錯誤處理
                    </button>
                    <button
                      onClick={demoOptimisticUpdate}
                      disabled={isRunning}
                      className="bg-yellow-600 text-white px-3 py-2 rounded text-sm hover:bg-yellow-700 disabled:opacity-50"
                    >
                      樂觀更新
                    </button>
                  </div>
                </div>
              </div>

              {/* 演示結果 */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">演示結果</h2>
                <div className="bg-gray-100 rounded p-4 h-64 overflow-y-auto">
                  {demoResults.length === 0 ? (
                    <p className="text-gray-500 text-sm">點擊上方按鈕開始演示...</p>
                  ) : (
                    <div className="space-y-1">
                      {demoResults.map((result, index) => (
                        <div key={index} className="text-xs font-mono text-gray-800">
                          {result}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 錯誤顯示 */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-red-800 font-medium mb-2">錯誤信息</h3>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
            </div>

            {/* 右側：優化的活動列表 */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">優化的活動列表</h2>
                <p className="text-gray-600 text-sm mb-4">
                  這個組件展示了樂觀更新、錯誤處理、性能監控等優化功能
                </p>
                {isAuthenticated ? (
                  <OptimizedActivityList userId={user?.id} />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">請先登入以查看活動列表</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 優化說明 */}
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">🔧 實現的優化功能</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="bg-blue-50 p-3 rounded">
                <h3 className="font-medium text-blue-800 mb-2">性能監控</h3>
                <p className="text-blue-700">實時追蹤函數執行時間、API 響應時間和錯誤率</p>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <h3 className="font-medium text-green-800 mb-2">緩存系統</h3>
                <p className="text-green-700">多層緩存策略，支持 TTL 和 LRU 淘汰</p>
              </div>
              <div className="bg-purple-50 p-3 rounded">
                <h3 className="font-medium text-purple-800 mb-2">錯誤處理</h3>
                <p className="text-purple-700">統一的錯誤處理機制和錯誤邊界組件</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded">
                <h3 className="font-medium text-yellow-800 mb-2">樂觀更新</h3>
                <p className="text-yellow-700">即時 UI 響應，失敗時自動回滾</p>
              </div>
              <div className="bg-red-50 p-3 rounded">
                <h3 className="font-medium text-red-800 mb-2">狀態管理</h3>
                <p className="text-red-700">Zustand 全局狀態管理，支持持久化</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <h3 className="font-medium text-gray-800 mb-2">API 優化</h3>
                <p className="text-gray-700">統一的 API 客戶端，支持重試和超時控制</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 性能監控儀表板（僅開發環境） */}
      <PerformanceDashboard />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  
  return {
    props: {
      session,
    },
  };
};
