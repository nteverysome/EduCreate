/**
 * API 測試頁面
 * 測試需要配置的 API 功能
 */

import React, { useState } from 'react';
import Head from 'next/head';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: any;
  duration?: number;
}

export default function ApiTestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // 測試 WebSocket API
  const testWebSocketAPI = async (): Promise<TestResult> => {
    const startTime = Date.now();
    try {
      const response = await fetch('/api/websocket');
      const data = await response.json();
      
      return {
        name: 'WebSocket API',
        status: response.ok ? 'success' : 'error',
        message: data.message || 'WebSocket API 測試',
        data,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        name: 'WebSocket API',
        status: 'error',
        message: error instanceof Error ? error.message : '未知錯誤',
        duration: Date.now() - startTime
      };
    }
  };

  // 測試 AI 內容生成 API
  const testAIGenerateAPI = async (): Promise<TestResult> => {
    const startTime = Date.now();
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'questions',
          gameType: 'quiz',
          topic: '測試主題',
          count: 1
        })
      });
      const data = await response.json();
      
      return {
        name: 'AI 內容生成',
        status: response.ok ? 'success' : 'error',
        message: data.message || data.error || 'AI 生成測試',
        data,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        name: 'AI 內容生成',
        status: 'error',
        message: error instanceof Error ? error.message : '未知錯誤',
        duration: Date.now() - startTime
      };
    }
  };

  // 測試智能推薦 API
  const testRecommendationsAPI = async (): Promise<TestResult> => {
    const startTime = Date.now();
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user-1',
          context: 'homepage'
        })
      });
      const data = await response.json();
      
      return {
        name: '智能推薦系統',
        status: response.ok ? 'success' : 'error',
        message: data.message || data.error || '推薦系統測試',
        data,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        name: '智能推薦系統',
        status: 'error',
        message: error instanceof Error ? error.message : '未知錯誤',
        duration: Date.now() - startTime
      };
    }
  };

  // 測試自動評分 API
  const testAutoGradingAPI = async (): Promise<TestResult> => {
    const startTime = Date.now();
    try {
      const response = await fetch('/api/grading/auto-grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionType: 'multiple_choice',
          question: '2 + 2 = ?',
          correctAnswer: '4',
          studentAnswer: '4'
        })
      });
      const data = await response.json();
      
      return {
        name: 'AI 自動評分',
        status: response.ok ? 'success' : 'error',
        message: data.message || data.error || '自動評分測試',
        data,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        name: 'AI 自動評分',
        status: 'error',
        message: error instanceof Error ? error.message : '未知錯誤',
        duration: Date.now() - startTime
      };
    }
  };

  // 測試數據同步 API
  const testDataSyncAPI = async (): Promise<TestResult> => {
    const startTime = Date.now();
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [],
          userId: 'test-user',
          deviceId: 'test-device'
        })
      });
      const data = await response.json();

      return {
        name: '數據同步',
        status: response.ok ? 'success' : 'error',
        message: data.message || data.error || '數據同步測試',
        data,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        name: '數據同步',
        status: 'error',
        message: error instanceof Error ? error.message : '未知錯誤',
        duration: Date.now() - startTime
      };
    }
  };

  // 測試學習分析 API
  const testLearningAnalyticsAPI = async (): Promise<TestResult> => {
    const startTime = Date.now();
    try {
      const response = await fetch('/api/analytics/learning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'test-user',
          activityId: 'test-activity',
          eventType: 'start'
        })
      });
      const data = await response.json();

      return {
        name: '學習分析系統',
        status: response.ok ? 'success' : 'error',
        message: data.message || data.error || '學習分析測試',
        data,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        name: '學習分析系統',
        status: 'error',
        message: error instanceof Error ? error.message : '未知錯誤',
        duration: Date.now() - startTime
      };
    }
  };

  // 測試性能監控 API
  const testPerformanceMonitoringAPI = async (): Promise<TestResult> => {
    const startTime = Date.now();
    try {
      const response = await fetch('/api/monitoring/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'api-call',
          name: 'test-performance',
          duration: 150,
          url: window.location.href
        })
      });
      const data = await response.json();

      return {
        name: '性能監控',
        status: response.ok ? 'success' : 'error',
        message: data.message || data.error || '性能監控測試',
        data,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        name: '性能監控',
        status: 'error',
        message: error instanceof Error ? error.message : '未知錯誤',
        duration: Date.now() - startTime
      };
    }
  };

  // 測試錯誤追蹤 API
  const testErrorTrackingAPI = async (): Promise<TestResult> => {
    const startTime = Date.now();
    try {
      const response = await fetch('/api/monitoring/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Test error message',
          url: window.location.href,
          severity: 'low'
        })
      });
      const data = await response.json();

      return {
        name: '錯誤追蹤',
        status: response.ok ? 'success' : 'error',
        message: data.message || data.error || '錯誤追蹤測試',
        data,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        name: '錯誤追蹤',
        status: 'error',
        message: error instanceof Error ? error.message : '未知錯誤',
        duration: Date.now() - startTime
      };
    }
  };

  // 測試企業級管理 API
  const testEnterpriseManagementAPI = async (): Promise<TestResult> => {
    const startTime = Date.now();
    try {
      const response = await fetch('/api/admin/enterprise');
      const data = await response.json();

      return {
        name: '企業級管理',
        status: response.ok ? 'success' : 'error',
        message: data.message || data.error || '企業級管理測試',
        data,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        name: '企業級管理',
        status: 'error',
        message: error instanceof Error ? error.message : '未知錯誤',
        duration: Date.now() - startTime
      };
    }
  };

  // 運行所有測試
  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    const tests = [
      testWebSocketAPI,
      testAIGenerateAPI,
      testRecommendationsAPI,
      testAutoGradingAPI,
      testDataSyncAPI,
      testLearningAnalyticsAPI,
      testPerformanceMonitoringAPI,
      testErrorTrackingAPI,
      testEnterpriseManagementAPI
    ];

    for (const test of tests) {
      const result = await test();
      setTestResults(prev => [...prev, result]);
    }

    setIsRunning(false);
  };

  return (
    <>
      <Head>
        <title>API 測試 | EduCreate</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              🧪 API 功能測試
            </h1>
            <p className="text-gray-600 mb-8">
              測試需要配置的 API 功能，檢查配置狀態和功能可用性
            </p>

            {/* 測試控制 */}
            <div className="mb-8">
              <button
                onClick={runAllTests}
                disabled={isRunning}
                className={`
                  px-6 py-3 rounded-lg font-medium text-white
                  ${isRunning 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                  }
                `}
              >
                {isRunning ? '測試進行中...' : '開始測試'}
              </button>
            </div>

            {/* 測試結果 */}
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`
                    p-4 rounded-lg border-l-4
                    ${result.status === 'success' 
                      ? 'bg-green-50 border-green-500' 
                      : result.status === 'error'
                      ? 'bg-red-50 border-red-500'
                      : 'bg-yellow-50 border-yellow-500'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {result.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`
                          px-2 py-1 rounded text-xs font-medium
                          ${result.status === 'success'
                            ? 'bg-green-100 text-green-800'
                            : result.status === 'error'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                          }
                        `}
                      >
                        {result.status === 'success' ? '成功' : 
                         result.status === 'error' ? '失敗' : '進行中'}
                      </span>
                      {result.duration && (
                        <span className="text-xs text-gray-500">
                          {result.duration}ms
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-2">{result.message}</p>
                  
                  {result.data && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                        查看詳細數據
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>

            {/* 配置指南 */}
            <div className="mt-12 bg-blue-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-4">
                📋 配置指南
              </h2>
              
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="font-medium text-blue-800">AI 功能配置</h3>
                  <p className="text-blue-700">
                    在 .env.local 中設置：<code className="bg-blue-100 px-1 rounded">OPENAI_API_KEY=your-api-key</code>
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-blue-800">Supabase 實時功能</h3>
                  <p className="text-blue-700">
                    確保 Supabase 項目已配置並設置了正確的環境變量
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-blue-800">數據庫連接</h3>
                  <p className="text-blue-700">
                    檢查 Neon 數據庫連接和 Prisma 配置
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
