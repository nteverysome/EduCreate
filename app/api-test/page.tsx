'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ApiTest() {
  const [apiStatus, setApiStatus] = useState('未測試');
  const [apiUrl, setApiUrl] = useState('');
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 設定 API URL
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://educreate-backend-api-production.up.railway.app';
    setApiUrl(backendUrl);
  }, []);

  const testEndpoint = async (endpoint, description) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}${endpoint}`);
      const data = await response.json();
      
      const result = {
        endpoint,
        description,
        status: response.ok ? '✅ 成功' : '❌ 失敗',
        statusCode: response.status,
        data: JSON.stringify(data, null, 2)
      };
      
      setTestResults(prev => [...prev, result]);
      return response.ok;
    } catch (error) {
      const result = {
        endpoint,
        description,
        status: '❌ 錯誤',
        statusCode: 'N/A',
        data: error.message
      };
      
      setTestResults(prev => [...prev, result]);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    setApiStatus('測試中...');
    
    const tests = [
      { endpoint: '/health', description: '健康檢查' },
      { endpoint: '/api/test', description: '基本 API 測試' },
      { endpoint: '/api/games', description: '遊戲列表' },
    ];

    let successCount = 0;
    for (const test of tests) {
      const success = await testEndpoint(test.endpoint, test.description);
      if (success) successCount++;
    }

    setApiStatus(`測試完成 - ${successCount}/${tests.length} 成功`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔧 API 測試中心
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            測試後端 API 連接和功能狀態
          </p>
          <div className="mb-6">
            <Link 
              href="/simple-dashboard" 
              className="inline-block bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors mr-4"
            >
              ← 返回簡化版
            </Link>
            <Link 
              href="/" 
              className="inline-block bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              返回首頁
            </Link>
          </div>
        </header>

        {/* API 狀態 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">API 連接狀態</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">後端 URL:</p>
              <p className="font-mono text-sm bg-gray-100 p-2 rounded">{apiUrl}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">測試狀態:</p>
              <p className="font-semibold text-lg">{apiStatus}</p>
            </div>
          </div>
          
          <div className="mt-6">
            <button
              onClick={runAllTests}
              disabled={isLoading}
              className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? '測試中...' : '開始 API 測試'}
            </button>
          </div>
        </div>

        {/* 測試結果 */}
        {testResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">測試結果</h2>
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">{result.description}</h3>
                    <span className="text-sm">{result.status}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    端點: <code className="bg-gray-100 px-1 rounded">{result.endpoint}</code>
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    狀態碼: {result.statusCode}
                  </p>
                  <details className="text-sm">
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                      查看回應數據
                    </summary>
                    <pre className="mt-2 bg-gray-100 p-2 rounded overflow-x-auto text-xs">
                      {result.data}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 說明 */}
        <div className="bg-blue-50 rounded-lg p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">🔍 測試說明</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">測試項目:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>後端服務健康檢查</li>
                <li>基本 API 響應測試</li>
                <li>遊戲數據 API 測試</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">技術架構:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>後端: Express.js + Prisma</li>
                <li>資料庫: PostgreSQL</li>
                <li>部署: Railway Platform</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
