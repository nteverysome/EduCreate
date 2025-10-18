'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function TestScreenshotPage() {
  const { data: session } = useSession();
  const [activityId, setActivityId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [serviceStatus, setServiceStatus] = useState<any>(null);

  // 檢查服務狀態
  const checkServiceStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/generate-screenshot', {
        method: 'GET',
      });

      const data = await response.json();
      setServiceStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // 生成截圖
  const generateScreenshot = async () => {
    if (!activityId.trim()) {
      setError('請輸入 Activity ID');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const response = await fetch('/api/generate-screenshot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activityId: activityId.trim(),
          force: true, // 強制重新生成
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to generate screenshot');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">請先登入</h1>
          <p className="text-gray-600">您需要登入才能測試截圖生成功能</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            截圖生成測試頁面
          </h1>

          {/* 服務狀態檢查 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              1. 檢查服務狀態
            </h2>
            <button
              onClick={checkServiceStatus}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? '檢查中...' : '檢查服務狀態'}
            </button>

            {serviceStatus && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <h3 className="font-semibold text-gray-900 mb-2">服務狀態：</h3>
                <pre className="text-sm text-gray-700 overflow-auto">
                  {JSON.stringify(serviceStatus, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* 生成截圖 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              2. 生成活動截圖
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="activityId" className="block text-sm font-medium text-gray-700 mb-2">
                  Activity ID
                </label>
                <input
                  type="text"
                  id="activityId"
                  value={activityId}
                  onChange={(e) => setActivityId(e.target.value)}
                  placeholder="輸入 Activity ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={generateScreenshot}
                disabled={loading || !activityId.trim()}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? '生成中...' : '生成截圖'}
              </button>
            </div>
          </div>

          {/* 錯誤信息 */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-md">
              <h3 className="font-semibold text-red-900 mb-2">錯誤：</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* 成功結果 */}
          {result && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                生成結果：
              </h3>
              
              {/* 結果信息 */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-md mb-4">
                <p className="text-green-900">
                  <strong>狀態：</strong> {result.success ? '✅ 成功' : '❌ 失敗'}
                </p>
                <p className="text-green-900">
                  <strong>模式：</strong> {result.mode === 'mock' ? '🧪 Mock 模式' : '🚀 生產模式'}
                </p>
                <p className="text-green-900">
                  <strong>消息：</strong> {result.message}
                </p>
              </div>

              {/* 截圖預覽 */}
              {result.thumbnailUrl && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">截圖預覽：</h4>
                  <div className="border border-gray-300 rounded-md overflow-hidden">
                    <img
                      src={result.thumbnailUrl}
                      alt="Generated Screenshot"
                      className="w-full h-auto"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    <strong>URL：</strong>
                    <a
                      href={result.thumbnailUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline ml-2"
                    >
                      {result.thumbnailUrl}
                    </a>
                  </p>
                </div>
              )}

              {/* 完整響應 */}
              <details className="mt-4">
                <summary className="cursor-pointer font-semibold text-gray-900">
                  查看完整響應
                </summary>
                <pre className="mt-2 p-4 bg-gray-50 rounded-md text-sm text-gray-700 overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </div>
          )}

          {/* 使用說明 */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="font-semibold text-blue-900 mb-2">使用說明：</h3>
            <ol className="list-decimal list-inside text-blue-800 space-y-1">
              <li>先點擊「檢查服務狀態」確認 API 正常運行</li>
              <li>輸入一個有效的 Activity ID</li>
              <li>點擊「生成截圖」按鈕</li>
              <li>查看生成的截圖預覽</li>
            </ol>
            <p className="mt-4 text-sm text-blue-700">
              <strong>注意：</strong> 目前使用 Mock 模式，會返回預設的遊戲截圖。
              部署 Railway 服務後，將自動切換到生產模式。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

